from flask import jsonify, request, send_file
from app.services.customer_service import CustomerService
from app.utils.response import APIResponse
from app.extensions import db
import logging

logger = logging.getLogger(__name__)

class CustomerController:
    
    # ==================== DASHBOARD ====================
    @staticmethod
    def get_dashboard(current_user):
        """Get customer dashboard data"""
        try:
            result, status_code = CustomerService.get_dashboard(current_user)
            
            if status_code == 200:
                return APIResponse.success(result, 'Dashboard data retrieved successfully')
            else:
                return APIResponse.error(result.get('error', 'Failed to get dashboard'), status_code)
        except Exception as e:
            logger.error(f"Error in get_dashboard: {str(e)}")
            return APIResponse.server_error(str(e))
    
    # ==================== PROFILE ====================
    @staticmethod
    def get_profile(current_user):
        """Get customer profile"""
        try:
            result, status_code = CustomerService.get_profile(current_user)
            
            if status_code == 200:
                return APIResponse.success(result, 'Profile retrieved successfully')
            else:
                return APIResponse.error(result.get('error', 'Failed to get profile'), status_code)
        except Exception as e:
            logger.error(f"Error in get_profile: {str(e)}")
            return APIResponse.server_error(str(e))
    
    @staticmethod
    def update_profile(current_user, data):
        """Update customer profile"""
        try:
            result, status_code = CustomerService.update_profile(current_user, data)
            
            if status_code == 200:
                return APIResponse.success(result, 'Profile updated successfully')
            else:
                return APIResponse.error(result.get('error', 'Failed to update profile'), status_code)
        except Exception as e:
            logger.error(f"Error in update_profile: {str(e)}")
            return APIResponse.server_error(str(e))
    
    # ==================== APPOINTMENTS ====================
    @staticmethod
    def get_branches(current_user):
        """Get branches for appointment booking"""
        try:
            result, status_code = CustomerService.get_branches()
            return APIResponse.success(result, 'Branches retrieved successfully')
        except Exception as e:
            logger.error(f"Error in get_branches: {str(e)}")
            return APIResponse.server_error(str(e))
    
    @staticmethod
    def get_services(current_user, params):
        """Get services for appointment booking"""
        try:
            result, status_code = CustomerService.get_services(params)
            return APIResponse.success(result, 'Services retrieved successfully')
        except Exception as e:
            logger.error(f"Error in get_services: {str(e)}")
            return APIResponse.server_error(str(e))
    
    @staticmethod
    def book_appointment(current_user, data):
        """Book a new appointment"""
        try:
            result, status_code = CustomerService.book_appointment(current_user, data)
            
            if status_code == 201:
                return APIResponse.success(result, 'Appointment booked successfully', 201)
            else:
                return APIResponse.error(result.get('error', 'Failed to book appointment'), status_code)
        except Exception as e:
            logger.error(f"Error in book_appointment: {str(e)}")
            return APIResponse.server_error(str(e))
    
    @staticmethod
    def book_multiple_appointments(current_user, data):
        """Book multiple services in one appointment with single payment"""
        try:
            result, status_code = CustomerService.book_multiple_appointments(current_user, data)
            
            if status_code == 201:
                return APIResponse.success(result, 'Appointments booked successfully', 201)
            else:
                return APIResponse.error(result.get('error', 'Failed to book appointments'), status_code)
        except Exception as e:
            logger.error(f"Error in book_multiple_appointments: {str(e)}")
            return APIResponse.server_error(str(e))
    
    @staticmethod
    def get_upcoming_appointments(current_user):
        """Get upcoming appointments"""
        try:
            result, status_code = CustomerService.get_upcoming_appointments(current_user)
            
            if status_code == 200:
                return APIResponse.success(result, 'Upcoming appointments retrieved successfully')
            else:
                return APIResponse.error(result.get('error', 'Failed to get upcoming appointments'), status_code)
        except Exception as e:
            logger.error(f"Error in get_upcoming_appointments: {str(e)}")
            return APIResponse.server_error(str(e))
    
    @staticmethod
    def get_appointment_history(current_user, params):
        """Get customer appointment history"""
        try:
            result, status_code = CustomerService.get_appointment_history(current_user, params)
            
            if status_code == 200:
                return APIResponse.success(result, 'Appointment history retrieved successfully')
            else:
                return APIResponse.error(result.get('error', 'Failed to get appointment history'), status_code)
        except Exception as e:
            logger.error(f"Error in get_appointment_history: {str(e)}")
            return APIResponse.server_error(str(e))
    
    @staticmethod
    def get_appointment(current_user, appointment_id):
        """Get specific appointment details"""
        try:
            result, status_code = CustomerService.get_appointment(current_user, appointment_id)
            
            if status_code == 200:
                return APIResponse.success(result, 'Appointment details retrieved successfully')
            else:
                return APIResponse.error(result.get('error', 'Failed to get appointment'), status_code)
        except Exception as e:
            logger.error(f"Error in get_appointment: {str(e)}")
            return APIResponse.server_error(str(e))
    
    @staticmethod
    def cancel_appointment(current_user, appointment_id):
        """Cancel an appointment"""
        try:
            result, status_code = CustomerService.cancel_appointment(current_user, appointment_id)
            
            if status_code == 200:
                return APIResponse.success(result, 'Appointment cancelled successfully')
            else:
                return APIResponse.error(result.get('error', 'Failed to cancel appointment'), status_code)
        except Exception as e:
            logger.error(f"Error in cancel_appointment: {str(e)}")
            return APIResponse.server_error(str(e))
    
    @staticmethod
    def reschedule_appointment(current_user, appointment_id, data):
        """Reschedule an appointment"""
        try:
            result, status_code = CustomerService.reschedule_appointment(current_user, appointment_id, data)
            
            if status_code == 200:
                return APIResponse.success(result, 'Appointment rescheduled successfully')
            else:
                return APIResponse.error(result.get('error', 'Failed to reschedule appointment'), status_code)
        except Exception as e:
            logger.error(f"Error in reschedule_appointment: {str(e)}")
            return APIResponse.server_error(str(e))
    
    # ==================== PAYMENTS ====================
    @staticmethod
    def get_payments(current_user, params):
        """Get customer payments"""
        try:
            result, status_code = CustomerService.get_payments(current_user, params)
            
            if status_code == 200:
                return APIResponse.success(result, 'Payments retrieved successfully')
            else:
                return APIResponse.error(result.get('error', 'Failed to get payments'), status_code)
        except Exception as e:
            logger.error(f"Error in get_payments: {str(e)}")
            return APIResponse.server_error(str(e))
    
    @staticmethod
    def get_payment_methods(current_user):
        """Get available payment methods"""
        try:
            result, status_code = CustomerService.get_payment_methods()
            return APIResponse.success(result, 'Payment methods retrieved successfully')
        except Exception as e:
            logger.error(f"Error in get_payment_methods: {str(e)}")
            return APIResponse.server_error(str(e))
    
    @staticmethod
    def make_payment(current_user, data):
        """Make a payment"""
        try:
            result, status_code = CustomerService.make_payment(current_user, data)
            
            if status_code == 201:
                return APIResponse.success(result, 'Payment made successfully', 201)
            else:
                return APIResponse.error(result.get('error', 'Failed to make payment'), status_code)
        except Exception as e:
            logger.error(f"Error in make_payment: {str(e)}")
            return APIResponse.server_error(str(e))
    
    @staticmethod
    def get_payment(current_user, payment_id):
        """Get specific payment details"""
        try:
            from app.models.payment import Payment
            from app.models.customer import Customer
            
            customer = Customer.query.filter_by(user_id=current_user.id).first()
            if not customer:
                return APIResponse.error('Customer profile not found', 404)
            
            payment = Payment.query.filter_by(id=payment_id, customer_id=customer.id).first()
            if not payment:
                return APIResponse.error('Payment not found', 404)
            
            return APIResponse.success(payment.to_dict(), 'Payment details retrieved successfully')
            
        except Exception as e:
            logger.error(f"Error in get_payment: {str(e)}")
            return APIResponse.server_error(str(e))
    
    @staticmethod
    def get_receipt(current_user, payment_id):
        """Get payment receipt"""
        try:
            from app.models.payment import Payment
            from app.models.receipt import Receipt
            from app.models.customer import Customer
            
            customer = Customer.query.filter_by(user_id=current_user.id).first()
            if not customer:
                return APIResponse.error('Customer profile not found', 404)
            
            payment = Payment.query.filter_by(id=payment_id, customer_id=customer.id).first()
            if not payment:
                return APIResponse.error('Payment not found', 404)
            
            receipt = Receipt.query.filter_by(payment_id=payment_id).first()
            if not receipt:
                return APIResponse.error('Receipt not found', 404)
            
            return APIResponse.success(receipt.to_dict(), 'Receipt retrieved successfully')
            
        except Exception as e:
            logger.error(f"Error in get_receipt: {str(e)}")
            return APIResponse.server_error(str(e))
    
    @staticmethod
    def process_payment(current_user, payment_id, data):
        """Process a payment"""
        try:
            from app.models.payment import Payment
            from app.models.customer import Customer
            from datetime import datetime
            
            customer = Customer.query.filter_by(user_id=current_user.id).first()
            if not customer:
                return APIResponse.error('Customer profile not found', 404)
            
            payment = Payment.query.filter_by(id=payment_id, customer_id=customer.id).first()
            if not payment:
                return APIResponse.error('Payment not found', 404)
            
            if payment.payment_status == 'paid':
                return APIResponse.error('Payment already processed', 400)
            
            payment.payment_status = 'paid'
            payment.payment_method = data.get('payment_method', payment.payment_method)
            payment.payment_date = datetime.utcnow()
            payment.transaction_id = data.get('transaction_id') or f"TXN-{datetime.utcnow().strftime('%Y%m%d%H%M%S')}-{payment.id}"
            
            db.session.commit()
            
            return APIResponse.success({
                'id': payment.id,
                'payment_status': payment.payment_status,
                'transaction_id': payment.transaction_id,
                'payment_date': payment.payment_date.isoformat() if payment.payment_date else None
            }, 'Payment processed successfully')
            
        except Exception as e:
            db.session.rollback()
            logger.error(f"Error in process_payment: {str(e)}")
            return APIResponse.server_error(str(e))
    
    @staticmethod
    def create_payment(current_user, data):
        """Create a new payment"""
        try:
            from app.models.payment import Payment
            from app.models.appointment import Appointment
            from app.models.customer import Customer
            from datetime import datetime
            
            # Validate required fields
            if 'appointment_id' not in data:
                return APIResponse.error('Appointment ID is required', 400)
            if 'amount' not in data:
                return APIResponse.error('Amount is required', 400)
            if 'payment_method' not in data:
                return APIResponse.error('Payment method is required', 400)
            
            # Get customer
            customer = Customer.query.filter_by(user_id=current_user.id).first()
            if not customer:
                return APIResponse.error('Customer profile not found', 404)
            
            # Check if appointment exists
            appointment = Appointment.query.get(data['appointment_id'])
            if not appointment:
                return APIResponse.error('Appointment not found', 404)
            
            # Create payment
            payment = Payment(
                appointment_id=data['appointment_id'],
                customer_id=customer.id,
                amount=data['amount'],
                payment_method=data['payment_method'],
                payment_status='paid',
                transaction_id=data.get('transaction_id'),
                reference_number=f"PAY-{datetime.utcnow().strftime('%Y%m%d%H%M%S')}",
                payment_date=datetime.utcnow()
            )
            
            db.session.add(payment)
            db.session.commit()
            
            # Update appointment paid status
            appointment.paid = True
            db.session.commit()
            
            return APIResponse.success({
                'id': payment.id,
                'status': payment.payment_status,
                'reference_number': payment.reference_number
            }, 'Payment created successfully', 201)
            
        except Exception as e:
            db.session.rollback()
            logger.error(f"Error in create_payment: {str(e)}")
            return APIResponse.server_error(str(e))
    
    # ==================== RECEIPTS ====================
    @staticmethod
    def get_receipts(current_user, params):
        """Get customer receipts"""
        try:
            result, status_code = CustomerService.get_receipts(current_user, params)
            
            if status_code == 200:
                return APIResponse.success(result, 'Receipts retrieved successfully')
            else:
                return APIResponse.error(result.get('error', 'Failed to get receipts'), status_code)
        except Exception as e:
            logger.error(f"Error in get_receipts: {str(e)}")
            return APIResponse.server_error(str(e))
    
    @staticmethod
    def download_receipt(current_user, receipt_id):
        """Download receipt PDF"""
        try:
            from app.models.receipt import Receipt
            from app.models.customer import Customer
            from app.services.receipt_service import ReceiptService
            import io
            
            customer = Customer.query.filter_by(user_id=current_user.id).first()
            if not customer:
                return APIResponse.error('Customer profile not found', 404)
            
            receipt = Receipt.query.filter_by(
                id=receipt_id,
                customer_id=customer.id
            ).first()
            
            if not receipt:
                return APIResponse.error('Receipt not found', 404)
            
            pdf_data = ReceiptService.generate_receipt_pdf(receipt_id)
            if not pdf_data:
                return APIResponse.error('Failed to generate PDF', 500)
            
            return send_file(
                io.BytesIO(pdf_data),
                as_attachment=True,
                download_name=f'receipt-{receipt.receipt_number}.pdf',
                mimetype='application/pdf'
            )
        except Exception as e:
            logger.error(f"Error in download_receipt: {str(e)}")
            return APIResponse.server_error(str(e))
    
    @staticmethod
    def send_receipt(current_user, receipt_id, data):
        """Send receipt via email or SMS"""
        try:
            from app.models.receipt import Receipt
            from app.services.receipt_service import ReceiptService
            
            receipt = Receipt.query.filter_by(id=receipt_id, customer_id=current_user.id).first()
            if not receipt:
                return APIResponse.error('Receipt not found', 404)
            
            method = data.get('method', 'email')
            
            result, status = ReceiptService.send_receipt(receipt_id, method)
            
            if status == 200:
                return APIResponse.success(result, 'Receipt sent successfully')
            else:
                return APIResponse.error(result.get('error', 'Failed to send receipt'), status)
                
        except Exception as e:
            logger.error(f"Error in send_receipt: {str(e)}")
            return APIResponse.server_error(str(e))
    
    # ==================== LOYALTY POINTS ====================
    @staticmethod
    def get_loyalty_points(current_user):
        """Get customer loyalty points"""
        try:
            result, status_code = CustomerService.get_loyalty_points(current_user)
            
            if status_code == 200:
                return APIResponse.success(result, 'Loyalty points retrieved successfully')
            else:
                return APIResponse.error(result.get('error', 'Failed to get loyalty points'), status_code)
        except Exception as e:
            logger.error(f"Error in get_loyalty_points: {str(e)}")
            return APIResponse.server_error(str(e))
    
    @staticmethod
    def get_loyalty_history(current_user):
        """Get loyalty points history"""
        try:
            result, status_code = CustomerService.get_loyalty_history(current_user)
            
            if status_code == 200:
                return APIResponse.success(result, 'Loyalty history retrieved successfully')
            else:
                return APIResponse.error(result.get('error', 'Failed to get loyalty history'), status_code)
        except Exception as e:
            logger.error(f"Error in get_loyalty_history: {str(e)}")
            return APIResponse.server_error(str(e))
    
    @staticmethod
    def redeem_points(current_user, data):
        """Redeem loyalty points"""
        try:
            result, status_code = CustomerService.redeem_points(current_user, data)
            
            if status_code == 200:
                return APIResponse.success(result, 'Points redeemed successfully')
            else:
                return APIResponse.error(result.get('error', 'Failed to redeem points'), status_code)
        except Exception as e:
            logger.error(f"Error in redeem_points: {str(e)}")
            return APIResponse.server_error(str(e))
    
    # ==================== REVIEWS ====================
    @staticmethod
    def get_reviews(current_user):
        """Get customer reviews"""
        try:
            result, status_code = CustomerService.get_reviews(current_user)
            
            if status_code == 200:
                return APIResponse.success(result, 'Reviews retrieved successfully')
            else:
                return APIResponse.error(result.get('error', 'Failed to get reviews'), status_code)
        except Exception as e:
            logger.error(f"Error in get_reviews: {str(e)}")
            return APIResponse.server_error(str(e))
    
    @staticmethod
    def create_review(current_user, data):
        """Create a review"""
        try:
            result, status_code = CustomerService.create_review(current_user, data)
            
            if status_code == 201:
                return APIResponse.success(result, 'Review created successfully', 201)
            else:
                return APIResponse.error(result.get('error', 'Failed to create review'), status_code)
        except Exception as e:
            logger.error(f"Error in create_review: {str(e)}")
            return APIResponse.server_error(str(e))
    
    @staticmethod
    def update_review(current_user, review_id, data):
        """Update a review"""
        try:
            result, status_code = CustomerService.update_review(current_user, review_id, data)
            
            if status_code == 200:
                return APIResponse.success(result, 'Review updated successfully')
            else:
                return APIResponse.error(result.get('error', 'Failed to update review'), status_code)
        except Exception as e:
            logger.error(f"Error in update_review: {str(e)}")
            return APIResponse.server_error(str(e))
    
    @staticmethod
    def delete_review(current_user, review_id):
        """Delete a review"""
        try:
            result, status_code = CustomerService.delete_review(current_user, review_id)
            
            if status_code == 200:
                return APIResponse.success(result, 'Review deleted successfully')
            else:
                return APIResponse.error(result.get('error', 'Failed to delete review'), status_code)
        except Exception as e:
            logger.error(f"Error in delete_review: {str(e)}")
            return APIResponse.server_error(str(e))
    
    # ==================== NOTIFICATIONS ====================
    @staticmethod
    def get_notifications(current_user, params):
        """Get customer notifications"""
        try:
            result, status_code = CustomerService.get_notifications(current_user, params)
            
            if status_code == 200:
                return APIResponse.success(result, 'Notifications retrieved successfully')
            else:
                return APIResponse.error(result.get('error', 'Failed to get notifications'), status_code)
        except Exception as e:
            logger.error(f"Error in get_notifications: {str(e)}")
            return APIResponse.server_error(str(e))
    
    @staticmethod
    def get_unread_notifications(current_user):
        """Get unread notifications"""
        try:
            result, status_code = CustomerService.get_unread_notifications(current_user)
            
            if status_code == 200:
                return APIResponse.success(result, 'Unread notifications retrieved successfully')
            else:
                return APIResponse.error(result.get('error', 'Failed to get unread notifications'), status_code)
        except Exception as e:
            logger.error(f"Error in get_unread_notifications: {str(e)}")
            return APIResponse.server_error(str(e))
    
    @staticmethod
    def mark_notification_read(current_user, notification_id):
        """Mark notification as read"""
        try:
            result, status_code = CustomerService.mark_notification_read(current_user, notification_id)
            
            if status_code == 200:
                return APIResponse.success(result, 'Notification marked as read')
            else:
                return APIResponse.error(result.get('error', 'Failed to mark notification as read'), status_code)
        except Exception as e:
            logger.error(f"Error in mark_notification_read: {str(e)}")
            return APIResponse.server_error(str(e))
    
    @staticmethod
    def mark_all_notifications_read(current_user):
        """Mark all notifications as read"""
        try:
            result, status_code = CustomerService.mark_all_notifications_read(current_user)
            
            if status_code == 200:
                return APIResponse.success(result, 'All notifications marked as read')
            else:
                return APIResponse.error(result.get('error', 'Failed to mark all notifications as read'), status_code)
        except Exception as e:
            logger.error(f"Error in mark_all_notifications_read: {str(e)}")
            return APIResponse.server_error(str(e))
    
    @staticmethod
    def delete_notification(current_user, notification_id):
        """Delete a notification"""
        try:
            from app.models.notification import Notification
            
            notification = Notification.query.filter_by(id=notification_id, user_id=current_user.id).first()
            if not notification:
                return APIResponse.error('Notification not found', 404)
            
            db.session.delete(notification)
            db.session.commit()
            
            return APIResponse.success({}, 'Notification deleted successfully')
            
        except Exception as e:
            db.session.rollback()
            logger.error(f"Error in delete_notification: {str(e)}")
            return APIResponse.server_error(str(e))
    
    # ==================== FAVORITES ====================
    @staticmethod
    def get_favorite_services(current_user):
        """Get favorite services"""
        try:
            result, status_code = CustomerService.get_favorite_services(current_user)
            
            if status_code == 200:
                return APIResponse.success(result, 'Favorite services retrieved successfully')
            else:
                return APIResponse.error(result.get('error', 'Failed to get favorite services'), status_code)
        except Exception as e:
            logger.error(f"Error in get_favorite_services: {str(e)}")
            return APIResponse.server_error(str(e))
    
    @staticmethod
    def get_favorite_stylists(current_user):
        """Get favorite stylists"""
        try:
            result, status_code = CustomerService.get_favorite_stylists(current_user)
            
            if status_code == 200:
                return APIResponse.success(result, 'Favorite stylists retrieved successfully')
            else:
                return APIResponse.error(result.get('error', 'Failed to get favorite stylists'), status_code)
        except Exception as e:
            logger.error(f"Error in get_favorite_stylists: {str(e)}")
            return APIResponse.server_error(str(e))
    
    @staticmethod
    def toggle_favorite_service(current_user, service_id):
        """Toggle favorite service"""
        try:
            result, status_code = CustomerService.toggle_favorite_service(current_user, service_id)
            
            if status_code == 200:
                return APIResponse.success(result, 'Favorite toggled successfully')
            else:
                return APIResponse.error(result.get('error', 'Failed to toggle favorite'), status_code)
        except Exception as e:
            logger.error(f"Error in toggle_favorite_service: {str(e)}")
            return APIResponse.server_error(str(e))
    
    # ==================== STYLISTS ====================
    @staticmethod
    def get_stylists(current_user, params):
        """Get stylists for appointment booking"""
        try:
            result, status_code = CustomerService.get_stylists(params)
            
            if status_code == 200:
                return APIResponse.success(result, 'Stylists retrieved successfully')
            else:
                return APIResponse.error(result.get('error', 'Failed to get stylists'), status_code)
        except Exception as e:
            logger.error(f"Error in get_stylists: {str(e)}")
            return APIResponse.server_error(str(e))
    
    # ==================== AVAILABLE SLOTS ====================
    @staticmethod
    def get_available_slots(current_user, params):
        """Get available time slots"""
        try:
            result, status_code = CustomerService.get_available_slots(params)
            
            if status_code == 200:
                return APIResponse.success(result, 'Available slots retrieved successfully')
            else:
                return APIResponse.error(result.get('error', 'Failed to get available slots'), status_code)
        except Exception as e:
            logger.error(f"Error in get_available_slots: {str(e)}")
            return APIResponse.server_error(str(e))