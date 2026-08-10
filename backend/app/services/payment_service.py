from datetime import datetime, timedelta
import uuid
from flask import current_app
from app.extensions import db
from app.models.payment import Payment
from app.models.appointment import Appointment
from app.models.customer import Customer
from app.models.finance import Finance
from app.models.receipt import Receipt
from app.services.receipt_service import ReceiptService
from app.services.notification_service import NotificationService
from app.services.email_service import EmailService
from app.services.loyalty_service import LoyaltyService

class PaymentService:
    
    @staticmethod
    def process_payment(data, user):
        """Process a payment and auto-generate receipt"""
        try:
            appointment = Appointment.query.get(data.get('appointment_id'))
            if not appointment:
                return {'error': 'Appointment not found'}, 404
            
            customer = Customer.query.get(data.get('customer_id'))
            if not customer:
                return {'error': 'Customer not found'}, 404
            
            # Check if payment already exists
            existing_payment = Payment.query.filter_by(
                appointment_id=appointment.id,
                payment_status='paid'
            ).first()
            
            if existing_payment:
                return {'error': 'Payment already processed for this appointment'}, 409
            
            # Generate reference number
            reference_number = PaymentService._generate_reference_number()
            
            # Create payment
            payment = Payment(
                appointment_id=appointment.id,
                customer_id=customer.id,
                amount=data.get('amount', appointment.final_amount),
                payment_method=data.get('payment_method', 'cash'),
                payment_status='paid',  # Auto-mark as paid
                transaction_id=data.get('transaction_id'),
                reference_number=reference_number,
                notes=data.get('notes')
            )
            
            db.session.add(payment)
            db.session.flush()
            
            # Update payment details
            payment.payment_date = datetime.utcnow()
            payment.verified_at = datetime.utcnow()
            payment.verified_by = user.id if user.role.name in ['finance', 'admin'] else None
            
            # Update appointment status
            appointment.status = 'completed'
            
            # Update customer total spent
            customer.total_spent += payment.amount
            customer.total_visits += 1
            
            db.session.commit()
            
            # ===== AUTO-GENERATE RECEIPT =====
            receipt_result, receipt_status = ReceiptService.generate_receipt(payment.id, user)
            
            receipt = None
            if receipt_status == 201 or receipt_status == 200:
                receipt = receipt_result
            
            # ===== SEND RECEIPT TO CUSTOMER =====
            if receipt and customer.user.email:
                # Send receipt via email
                email_sent = EmailService.send_receipt_email(
                    to_email=customer.user.email,
                    customer_name=customer.user.full_name,
                    receipt_data=receipt,
                    payment=payment
                )
                
                if email_sent:
                    # Mark receipt as emailed
                    receipt_obj = Receipt.query.filter_by(payment_id=payment.id).first()
                    if receipt_obj:
                        receipt_obj.is_emailed = True
                        receipt_obj.emailed_at = datetime.utcnow()
                        db.session.commit()
            
            # ===== ADD LOYALTY POINTS =====
            points_earned = int(payment.amount * 0.1)  # 10% of amount as points
            LoyaltyService.add_points(
                customer_id=customer.id,
                points=points_earned,
                transaction_type='earn',
                reference_id=appointment.id,
                reference_type='appointment'
            )
            
            # ===== SEND NOTIFICATION =====
            NotificationService.create_notification(
                user_id=customer.user_id,
                title='Payment Successful',
                message=f'Your payment of KES {payment.amount:,.2f} has been processed. Receipt #{payment.reference_number}',
                type='payment',
                priority='high',
                appointment_id=appointment.id
            )
            
            # ===== SEND SMS NOTIFICATION (if configured) =====
            if customer.user.phone:
                # SMS sending logic here
                pass
            
            return {
                'payment': payment.to_dict(),
                'receipt': receipt,
                'points_earned': points_earned,
                'message': 'Payment processed successfully. Receipt sent to your email.'
            }, 201
            
        except Exception as e:
            db.session.rollback()
            print(f"Error processing payment: {e}")
            import traceback
            traceback.print_exc()
            return {'error': str(e)}, 500
    
    @staticmethod
    def _generate_reference_number():
        """Generate unique reference number"""
        timestamp = datetime.utcnow().strftime('%Y%m%d%H%M%S')
        random_part = str(uuid.uuid4().hex[:6].upper())
        return f"PAY{timestamp}{random_part}"
    
    @staticmethod
    def verify_payment(payment_id, user):
        """Verify a payment and generate receipt"""
        try:
            payment = Payment.query.get(payment_id)
            if not payment:
                return {'error': 'Payment not found'}, 404
            
            payment.payment_status = 'paid'
            payment.verified_at = datetime.utcnow()
            payment.verified_by = user.id
            
            db.session.commit()
            
            # Generate receipt
            receipt_result, receipt_status = ReceiptService.generate_receipt(payment_id, user)
            
            return {
                'payment': payment.to_dict(),
                'receipt': receipt_result
            }, 200
            
        except Exception as e:
            db.session.rollback()
            return {'error': str(e)}, 500
    
    @staticmethod
    def process_refund(payment_id, data, user):
        """Process a refund"""
        try:
            payment = Payment.query.get(payment_id)
            if not payment:
                return {'error': 'Payment not found'}, 404
            
            if payment.payment_status != 'paid':
                return {'error': 'Only paid payments can be refunded'}, 400
            
            payment.payment_status = 'refunded'
            payment.notes = (payment.notes or '') + f'\nRefunded by {user.full_name}. Reason: {data.get("reason")}'
            
            db.session.commit()
            
            return {'message': 'Refund processed successfully'}, 200
            
        except Exception as e:
            db.session.rollback()
            return {'error': str(e)}, 500
    
    @staticmethod
    def get_payments(filters):
        """Get payments with filters"""
        try:
            query = Payment.query
            
            if filters.get('customer_id'):
                query = query.filter(Payment.customer_id == filters['customer_id'])
            
            if filters.get('appointment_id'):
                query = query.filter(Payment.appointment_id == filters['appointment_id'])
            
            if filters.get('payment_status'):
                query = query.filter(Payment.payment_status == filters['payment_status'])
            
            if filters.get('payment_method'):
                query = query.filter(Payment.payment_method == filters['payment_method'])
            
            if filters.get('start_date'):
                query = query.filter(Payment.payment_date >= filters['start_date'])
            
            if filters.get('end_date'):
                query = query.filter(Payment.payment_date <= filters['end_date'])
            
            query = query.order_by(Payment.payment_date.desc())
            
            page = filters.get('page', 1)
            per_page = filters.get('per_page', 20)
            
            payments = query.paginate(page=page, per_page=per_page, error_out=False)
            
            return {
                'items': [p.to_dict() for p in payments.items],
                'total': payments.total,
                'page': page,
                'per_page': per_page,
                'pages': payments.pages
            }, 200
            
        except Exception as e:
            return {'error': str(e)}, 500
    
    @staticmethod
    def get_payment_summary(filters):
        """Get payment summary"""
        try:
            query = Payment.query.filter(Payment.payment_status == 'paid')
            
            if filters.get('start_date'):
                query = query.filter(Payment.payment_date >= filters['start_date'])
            
            if filters.get('end_date'):
                query = query.filter(Payment.payment_date <= filters['end_date'])
            
            if filters.get('branch_id'):
                query = query.join(Appointment).filter(Appointment.branch_id == filters['branch_id'])
            
            total_amount = db.session.query(db.func.sum(Payment.amount)).filter(
                Payment.payment_status == 'paid'
            ).scalar() or 0
            
            total_count = query.count()
            
            method_summary = db.session.query(
                Payment.payment_method,
                db.func.count(Payment.id),
                db.func.sum(Payment.amount)
            ).filter(Payment.payment_status == 'paid').group_by(Payment.payment_method).all()
            
            return {
                'total_amount': total_amount,
                'total_count': total_count,
                'by_method': [
                    {
                        'method': m[0],
                        'count': m[1],
                        'amount': m[2]
                    } for m in method_summary
                ]
            }, 200
            
        except Exception as e:
            return {'error': str(e)}, 500
    
    @staticmethod
    def generate_receipt_after_payment(payment_id, user=None):
        """Generate receipt after successful payment"""
        from app.services.receipt_service import ReceiptService
        result, status_code = ReceiptService.generate_receipt(payment_id, user)
        return result, status_code
