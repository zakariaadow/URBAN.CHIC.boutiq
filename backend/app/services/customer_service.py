from app.extensions import db
from app.models.user import User
from app.models.customer import Customer
from app.models.appointment import Appointment
from app.models.payment import Payment
from app.models.loyalty import Loyalty
from app.models.notification import Notification
from app.models.review import Review
from app.models.receipt import Receipt
from app.models.branch import Branch
from app.models.service import Service
from app.models.stylist import Stylist
from app.models.appointment_service import AppointmentService as AppointmentServiceModel
from datetime import datetime, timedelta
from sqlalchemy import func, and_, or_
import logging

logger = logging.getLogger(__name__)

class CustomerService:
    
    # ==================== DASHBOARD ====================
    @staticmethod
    def get_dashboard(current_user):
        """Get customer dashboard data"""
        try:
            customer = Customer.query.filter_by(user_id=current_user.id).first()
            if not customer:
                return {'error': 'Customer profile not found'}, 404
            
            # Get upcoming appointments
            upcoming = Appointment.query.filter(
                Appointment.customer_id == customer.id,
                Appointment.status.in_(['pending', 'confirmed']),
                Appointment.appointment_date >= datetime.now().date()
            ).order_by(Appointment.appointment_date, Appointment.appointment_time).limit(5).all()
            
            upcoming_data = []
            for app in upcoming:
                upcoming_data.append({
                    'id': app.id,
                    'service_name': app.service.name if app.service else 'N/A',
                    'date': app.appointment_date.isoformat() if app.appointment_date else None,
                    'time': str(app.appointment_time) if app.appointment_time else None,
                    'status': app.status,
                    'stylist_name': f"{app.stylist.user.first_name} {app.stylist.user.last_name}" if app.stylist and app.stylist.user else 'Not Assigned',
                    'branch_name': app.branch.name if app.branch else 'N/A'
                })
            
            # Get loyalty points
            loyalty = Loyalty.query.filter_by(customer_id=customer.id).first()
            if not loyalty:
                loyalty = Loyalty(
                    customer_id=customer.id,
                    points=0,
                    total_points_earned=0,
                    total_points_redeemed=0,
                    tier='bronze'
                )
                db.session.add(loyalty)
                db.session.commit()
            
            # Get unread notifications count
            unread_count = Notification.query.filter(
                Notification.user_id == current_user.id,
                Notification.is_read == False
            ).count()
            
            # Get recent payments
            payments = Payment.query.filter(
                Payment.customer_id == customer.id
            ).order_by(Payment.created_at.desc()).limit(5).all()
            
            payments_data = []
            for p in payments:
                payments_data.append({
                    'id': p.id,
                    'amount': float(p.amount) if p.amount else 0,
                    'status': p.payment_status,
                    'payment_method': p.payment_method,
                    'created_at': p.created_at.isoformat() if p.created_at else None
                })
            
            return {
                'customer': {
                    'id': customer.id,
                    'user_id': customer.user_id,
                    'address': customer.address,
                    'city': customer.city,
                    'total_spent': float(customer.total_spent) if customer.total_spent else 0,
                    'total_visits': customer.total_visits or 0,
                    'created_at': customer.created_at.isoformat() if customer.created_at else None
                },
                'upcoming_appointments': upcoming_data,
                'loyalty_points': {
                    'points': loyalty.points or 0,
                    'total_earned': loyalty.total_points_earned or 0,
                    'points_redeemed': loyalty.total_points_redeemed or 0,
                    'tier': loyalty.tier or 'bronze'
                },
                'unread_notifications': unread_count,
                'recent_payments': payments_data,
                'stats': {
                    'total_appointments': Appointment.query.filter_by(customer_id=customer.id).count(),
                    'completed_appointments': Appointment.query.filter_by(customer_id=customer.id, status='completed').count(),
                    'total_spent': float(db.session.query(func.sum(Payment.amount)).filter(
                        Payment.customer_id == customer.id,
                        Payment.payment_status == 'paid'
                    ).scalar() or 0)
                }
            }, 200
            
        except Exception as e:
            logger.error(f"Error getting customer dashboard: {str(e)}")
            return {'error': str(e)}, 500
    
    # ==================== PROFILE ====================
    @staticmethod
    def get_profile(current_user):
        """Get customer profile"""
        try:
            customer = Customer.query.filter_by(user_id=current_user.id).first()
            if not customer:
                return {'error': 'Customer profile not found'}, 404
            
            return {
                'id': customer.id,
                'user_id': customer.user_id,
                'date_of_birth': customer.date_of_birth.isoformat() if customer.date_of_birth else None,
                'gender': customer.gender,
                'address': customer.address,
                'city': customer.city,
                'state': customer.state,
                'country': customer.country,
                'postal_code': customer.postal_code,
                'total_spent': float(customer.total_spent) if customer.total_spent else 0,
                'total_visits': customer.total_visits or 0,
                'is_walk_in': customer.is_walk_in or False,
                'created_at': customer.created_at.isoformat() if customer.created_at else None
            }, 200
            
        except Exception as e:
            logger.error(f"Error in get_profile: {str(e)}")
            return {'error': str(e)}, 500
    
    @staticmethod
    def update_profile(current_user, data):
        """Update customer profile"""
        try:
            customer = Customer.query.filter_by(user_id=current_user.id).first()
            if not customer:
                return {'error': 'Customer profile not found'}, 404
            
            if 'date_of_birth' in data:
                customer.date_of_birth = data['date_of_birth']
            if 'gender' in data:
                customer.gender = data['gender']
            if 'address' in data:
                customer.address = data['address']
            if 'city' in data:
                customer.city = data['city']
            if 'state' in data:
                customer.state = data['state']
            if 'country' in data:
                customer.country = data['country']
            if 'postal_code' in data:
                customer.postal_code = data['postal_code']
            if 'first_name' in data:
                current_user.first_name = data['first_name']
            if 'last_name' in data:
                current_user.last_name = data['last_name']
            if 'phone' in data:
                current_user.phone = data['phone']
            
            db.session.commit()
            return {'message': 'Profile updated successfully'}, 200
            
        except Exception as e:
            db.session.rollback()
            logger.error(f"Error in update_profile: {str(e)}")
            return {'error': str(e)}, 500
    
    # ==================== APPOINTMENTS ====================
    @staticmethod
    def get_branches():
        """Get all branches"""
        try:
            branches = Branch.query.filter_by(is_active=True).all()
            return [{'id': b.id, 'name': b.name, 'address': b.address, 'city': b.city, 'phone': b.phone} for b in branches], 200
        except Exception as e:
            logger.error(f"Error in get_branches: {str(e)}")
            return {'error': str(e)}, 500
    
    @staticmethod
    def get_services(params):
        """Get services"""
        try:
            query = Service.query.filter_by(is_active=True)
            category_id = params.get('category_id')
            if category_id:
                query = query.filter_by(category_id=category_id)
            services = query.all()
            return [{'id': s.id, 'name': s.name, 'price': float(s.price), 'duration_minutes': s.duration_minutes, 'description': s.description} for s in services], 200
        except Exception as e:
            logger.error(f"Error in get_services: {str(e)}")
            return {'error': str(e)}, 500
    
    @staticmethod
    def get_stylists(params):
        """Get stylists for appointment booking"""
        try:
            query = Stylist.query.filter_by(is_active=True, is_available=True)
            branch_id = params.get('branch_id')
            if branch_id:
                query = query.filter_by(branch_id=branch_id)
            
            stylists = query.all()
            result = []
            for s in stylists:
                user = User.query.get(s.user_id)
                result.append({
                    'id': s.id,
                    'user_id': s.user_id,
                    'name': f"{user.first_name} {user.last_name}" if user else 'N/A',
                    'specialization': s.specialization,
                    'experience_years': s.experience_years,
                    'rating': float(s.rating) if s.rating else 0,
                    'is_available': s.is_available
                })
            return result, 200
        except Exception as e:
            logger.error(f"Error in get_stylists: {str(e)}")
            return {'error': str(e)}, 500
    
    @staticmethod
    def get_available_slots(params):
        """Get available time slots"""
        try:
            # Generate time slots from 9 AM to 6 PM in 30-minute intervals
            slots = []
            for hour in range(9, 18):
                for minute in [0, 30]:
                    if hour == 17 and minute == 30:
                        continue
                    slots.append(f"{hour:02d}:{minute:02d}")
            return slots, 200
        except Exception as e:
            logger.error(f"Error in get_available_slots: {str(e)}")
            return {'error': str(e)}, 500
    
    @staticmethod
    def book_appointment(current_user, data):
        """Book appointment"""
        try:
            # Log the incoming data for debugging
            logger.info(f"Book appointment data: {data}")
            
            # Validate required fields
            required_fields = ['service_id', 'branch_id', 'date', 'time']
            for field in required_fields:
                if field not in data:
                    return {'error': f'Missing required field: {field}'}, 400
            
            customer = Customer.query.filter_by(user_id=current_user.id).first()
            if not customer:
                return {'error': 'Customer profile not found'}, 404
            
            service = Service.query.get(data.get('service_id'))
            if not service:
                return {'error': 'Service not found'}, 404
            
            # Parse date and time
            try:
                appointment_date = datetime.strptime(data['date'], '%Y-%m-%d').date()
                appointment_time = datetime.strptime(data['time'], '%H:%M').time()
            except ValueError as e:
                return {'error': f'Invalid date or time format: {str(e)}'}, 400
            
            appointment = Appointment(
                customer_id=customer.id,
                service_id=data['service_id'],
                branch_id=data['branch_id'],
                appointment_date=appointment_date,
                appointment_time=appointment_time,
                stylist_id=data.get('stylist_id'),
                notes=data.get('notes'),
                status='pending',
                total_amount=service.price,
                final_amount=service.price
            )
            db.session.add(appointment)
            db.session.commit()
            
            return {
                'id': appointment.id, 
                'status': appointment.status,
                'message': 'Appointment booked successfully'
            }, 201
            
        except Exception as e:
            db.session.rollback()
            logger.error(f"Error in book_appointment: {str(e)}")
            return {'error': str(e)}, 500
    
    # ==================== BOOK MULTIPLE APPOINTMENTS ====================
    @staticmethod
    def book_multiple_appointments(current_user, data):
        """Book multiple services in one appointment with single payment"""
        try:
            # Validate required fields
            required_fields = ['branch_id', 'services', 'appointment_date', 'appointment_time']
            for field in required_fields:
                if field not in data:
                    return {'error': f'Missing required field: {field}'}, 400
            
            # Get customer
            customer = Customer.query.filter_by(user_id=current_user.id).first()
            if not customer:
                return {'error': 'Customer profile not found'}, 404
            
            # Validate branch
            branch = Branch.query.get(data['branch_id'])
            if not branch:
                return {'error': 'Branch not found'}, 404
            
            # Validate services
            service_ids = data.get('services', [])
            if not service_ids or len(service_ids) == 0:
                return {'error': 'At least one service is required'}, 400
            
            # Fetch services from database
            services = Service.query.filter(Service.id.in_(service_ids)).all()
            if len(services) != len(service_ids):
                return {'error': 'One or more services not found'}, 404
            
            # Calculate total amount and duration
            total_amount = sum(s.price for s in services)
            total_duration = sum(s.duration_minutes or 30 for s in services)
            
            # Get service names for notes
            service_names = ', '.join([s.name for s in services])
            
            # Validate stylist if provided
            stylist_id = data.get('stylist_id')
            if stylist_id:
                stylist = Stylist.query.get(stylist_id)
                if not stylist or not stylist.is_available:
                    return {'error': 'Stylist not available'}, 400
            
            # Parse date and time
            try:
                appointment_date = datetime.strptime(data['appointment_date'], '%Y-%m-%d').date()
                appointment_time = datetime.strptime(data['appointment_time'], '%H:%M').time()
            except ValueError as e:
                return {'error': f'Invalid date or time format: {str(e)}'}, 400
            
            # CRITICAL: Use the FIRST service as the primary service_id
            primary_service = services[0]
            
            # Create appointment - MUST include service_id
            appointment = Appointment(
                customer_id=customer.id,
                service_id=primary_service.id,  # <-- CRITICAL: This MUST be set
                stylist_id=stylist_id,
                branch_id=data['branch_id'],
                appointment_date=appointment_date,
                appointment_time=appointment_time,
                status='pending',
                notes=f"Multiple services: {service_names}\n{data.get('notes', '')}",
                total_amount=total_amount,
                final_amount=total_amount,
                duration=total_duration,
                created_at=datetime.utcnow()
            )
            
            db.session.add(appointment)
            db.session.flush()
            
            # Add all services to appointment_services junction table
            for service in services:
                appointment_service = AppointmentServiceModel(
                    appointment_id=appointment.id,
                    service_id=service.id,
                    price=service.price,
                    duration=service.duration_minutes or 30
                )
                db.session.add(appointment_service)
            
            # Create payment record (pending payment)
            payment = Payment(
                appointment_id=appointment.id,
                customer_id=customer.id,
                amount=total_amount,
                payment_method='pending',
                payment_status='pending',
                reference_number=f"PAY-{datetime.utcnow().strftime('%Y%m%d%H%M%S')}-{appointment.id}",
                created_at=datetime.utcnow()
            )
            
            db.session.add(payment)
            db.session.flush()
            
            # Generate receipt
            receipt = Receipt(
                appointment_id=appointment.id,
                payment_id=payment.id,
                customer_id=customer.id,
                receipt_number=f"RCP-{datetime.utcnow().strftime('%Y%m%d%H%M%S')}-{appointment.id}",
                subtotal=total_amount,
                tax=0,
                discount=0,
                total=total_amount,
                payment_method='pending',
                transaction_id=payment.reference_number,
                items=[s.to_dict() for s in services],
                customer_details={
                    'name': f"{current_user.first_name} {current_user.last_name}",
                    'email': current_user.email,
                    'phone': current_user.phone
                },
                business_details={
                    'name': 'Urban Chic Boutique',
                    'branch': branch.name,
                    'address': branch.address
                },
                status='generated',
                created_at=datetime.utcnow()
            )
            
            db.session.add(receipt)
            db.session.commit()
            
            return {
                'appointment': {
                    'id': appointment.id,
                    'date': appointment.appointment_date.isoformat() if appointment.appointment_date else None,
                    'time': str(appointment.appointment_time) if appointment.appointment_time else None,
                    'status': appointment.status,
                    'total_amount': float(total_amount),
                    'duration': total_duration,
                    'services': [{'id': s.id, 'name': s.name, 'price': float(s.price)} for s in services]
                },
                'payment': {
                    'id': payment.id,
                    'amount': float(total_amount),
                    'method': 'pending',
                    'status': payment.payment_status,
                    'reference': payment.reference_number
                },
                'receipt': {
                    'id': receipt.id,
                    'number': receipt.receipt_number,
                    'total': float(total_amount)
                },
                'total_amount': float(total_amount),
                'total_duration': total_duration,
                'message': 'Appointments booked successfully. Please complete payment.'
            }, 201
            
        except Exception as e:
            db.session.rollback()
            logger.error(f"Error in book_multiple_appointments: {str(e)}")
            import traceback
            traceback.print_exc()
            return {'error': str(e)}, 500
    
    @staticmethod
    def get_upcoming_appointments(current_user):
        """Get upcoming appointments"""
        try:
            customer = Customer.query.filter_by(user_id=current_user.id).first()
            if not customer:
                return {'error': 'Customer profile not found'}, 404
            
            appointments = Appointment.query.filter(
                Appointment.customer_id == customer.id,
                Appointment.status.in_(['pending', 'confirmed']),
                Appointment.appointment_date >= datetime.now().date()
            ).order_by(Appointment.appointment_date, Appointment.appointment_time).all()
            
            result = []
            for app in appointments:
                result.append({
                    'id': app.id,
                    'service_name': app.service.name if app.service else 'N/A',
                    'date': app.appointment_date.isoformat() if app.appointment_date else None,
                    'time': str(app.appointment_time) if app.appointment_time else None,
                    'status': app.status,
                    'stylist_name': f"{app.stylist.user.first_name} {app.stylist.user.last_name}" if app.stylist and app.stylist.user else 'Not Assigned',
                    'branch_name': app.branch.name if app.branch else 'N/A',
                    'total_amount': float(app.total_amount) if app.total_amount else 0
                })
            return result, 200
            
        except Exception as e:
            logger.error(f"Error in get_upcoming_appointments: {str(e)}")
            return {'error': str(e)}, 500
    
    @staticmethod
    def get_appointment_history(current_user, params):
        """Get appointment history"""
        try:
            customer = Customer.query.filter_by(user_id=current_user.id).first()
            if not customer:
                return {'error': 'Customer profile not found'}, 404
            
            query = Appointment.query.filter_by(customer_id=customer.id)
            
            status = params.get('status')
            if status and status != 'all':
                query = query.filter_by(status=status)
            
            query = query.order_by(Appointment.appointment_date.desc())
            
            page = int(params.get('page', 1))
            per_page = int(params.get('limit', 10))
            offset = (page - 1) * per_page
            
            total = query.count()
            appointments = query.limit(per_page).offset(offset).all()
            
            result = []
            for app in appointments:
                result.append({
                    'id': app.id,
                    'service_name': app.service.name if app.service else 'N/A',
                    'date': app.appointment_date.isoformat() if app.appointment_date else None,
                    'time': str(app.appointment_time) if app.appointment_time else None,
                    'status': app.status,
                    'stylist_name': f"{app.stylist.user.first_name} {app.stylist.user.last_name}" if app.stylist and app.stylist.user else 'Not Assigned',
                    'branch_name': app.branch.name if app.branch else 'N/A',
                    'total_amount': float(app.total_amount) if app.total_amount else 0,
                    'final_amount': float(app.final_amount) if app.final_amount else 0
                })
            
            return {
                'appointments': result,
                'total': total,
                'pages': (total + per_page - 1) // per_page,
                'current_page': page
            }, 200
            
        except Exception as e:
            logger.error(f"Error in get_appointment_history: {str(e)}")
            return {'error': str(e)}, 500
    
    @staticmethod
    def get_appointment(current_user, appointment_id):
        """Get specific appointment"""
        try:
            customer = Customer.query.filter_by(user_id=current_user.id).first()
            if not customer:
                return {'error': 'Customer profile not found'}, 404
            
            appointment = Appointment.query.filter_by(id=appointment_id, customer_id=customer.id).first()
            if not appointment:
                return {'error': 'Appointment not found'}, 404
            
            return {
                'id': appointment.id,
                'service_name': appointment.service.name if appointment.service else 'N/A',
                'date': appointment.appointment_date.isoformat() if appointment.appointment_date else None,
                'time': str(appointment.appointment_time) if appointment.appointment_time else None,
                'status': appointment.status,
                'notes': appointment.notes,
                'total_amount': float(appointment.total_amount) if appointment.total_amount else 0
            }, 200
            
        except Exception as e:
            logger.error(f"Error in get_appointment: {str(e)}")
            return {'error': str(e)}, 500
    
    @staticmethod
    def cancel_appointment(current_user, appointment_id):
        """Cancel appointment"""
        try:
            customer = Customer.query.filter_by(user_id=current_user.id).first()
            if not customer:
                return {'error': 'Customer profile not found'}, 404
            
            appointment = Appointment.query.filter_by(id=appointment_id, customer_id=customer.id).first()
            if not appointment:
                return {'error': 'Appointment not found'}, 404
            
            appointment.status = 'cancelled'
            db.session.commit()
            return {'message': 'Appointment cancelled successfully'}, 200
            
        except Exception as e:
            db.session.rollback()
            logger.error(f"Error in cancel_appointment: {str(e)}")
            return {'error': str(e)}, 500
    
    @staticmethod
    def reschedule_appointment(current_user, appointment_id, data):
        """Reschedule appointment"""
        try:
            customer = Customer.query.filter_by(user_id=current_user.id).first()
            if not customer:
                return {'error': 'Customer profile not found'}, 404
            
            appointment = Appointment.query.filter_by(id=appointment_id, customer_id=customer.id).first()
            if not appointment:
                return {'error': 'Appointment not found'}, 404
            
            if 'date' in data:
                appointment.appointment_date = datetime.strptime(data['date'], '%Y-%m-%d').date()
            if 'time' in data:
                appointment.appointment_time = datetime.strptime(data['time'], '%H:%M').time()
            if 'stylist_id' in data:
                appointment.stylist_id = data['stylist_id']
            
            appointment.is_rescheduled = True
            db.session.commit()
            return {'message': 'Appointment rescheduled successfully'}, 200
            
        except Exception as e:
            db.session.rollback()
            logger.error(f"Error in reschedule_appointment: {str(e)}")
            return {'error': str(e)}, 500
    
    # ==================== PAYMENTS ====================
    @staticmethod
    def get_payments(current_user, params):
        """Get customer payments"""
        try:
            customer = Customer.query.filter_by(user_id=current_user.id).first()
            if not customer:
                return {'error': 'Customer profile not found'}, 404
            
            query = Payment.query.filter_by(customer_id=customer.id).order_by(Payment.created_at.desc())
            limit = int(params.get('limit', 10))
            payments = query.limit(limit).all()
            
            result = []
            for p in payments:
                result.append({
                    'id': p.id,
                    'amount': float(p.amount) if p.amount else 0,
                    'payment_method': p.payment_method,
                    'payment_status': p.payment_status,
                    'created_at': p.created_at.isoformat() if p.created_at else None,
                    'appointment_id': p.appointment_id
                })
            return result, 200
            
        except Exception as e:
            logger.error(f"Error in get_payments: {str(e)}")
            return {'error': str(e)}, 500
    
    @staticmethod
    def get_payment_methods():
        """Get available payment methods"""
        try:
            methods = [
                {'id': 'cash', 'name': 'Cash', 'icon': 'cash', 'description': 'Pay with cash at the salon'},
                {'id': 'card', 'name': 'Credit/Debit Card', 'icon': 'card', 'description': 'Pay with credit/debit card'},
                {'id': 'mobile_money', 'name': 'Mobile Money', 'icon': 'mobile', 'description': 'Pay via mobile money (M-Pesa)'},
                {'id': 'bank_transfer', 'name': 'Bank Transfer', 'icon': 'bank', 'description': 'Pay via bank transfer'}
            ]
            return methods, 200
        except Exception as e:
            logger.error(f"Error in get_payment_methods: {str(e)}")
            return {'error': str(e)}, 500
    
    @staticmethod
    def make_payment(current_user, data):
        """Make payment"""
        try:
            customer = Customer.query.filter_by(user_id=current_user.id).first()
            if not customer:
                return {'error': 'Customer profile not found'}, 404
            
            payment = Payment(
                appointment_id=data['appointment_id'],
                customer_id=customer.id,
                amount=data['amount'],
                payment_method=data['payment_method'],
                payment_status='paid',
                payment_date=datetime.utcnow()
            )
            db.session.add(payment)
            db.session.commit()
            return {'id': payment.id, 'status': payment.payment_status}, 201
            
        except Exception as e:
            db.session.rollback()
            logger.error(f"Error in make_payment: {str(e)}")
            return {'error': str(e)}, 500
    
    @staticmethod
    def process_payment(current_user, data):
        """Process payment and generate receipt"""
        try:
            customer = Customer.query.filter_by(user_id=current_user.id).first()
            if not customer:
                return {'error': 'Customer profile not found'}, 404
            
            payment = Payment(
                appointment_id=data['appointment_id'],
                customer_id=customer.id,
                amount=data['amount'],
                payment_method=data['payment_method'],
                payment_status='paid',
                transaction_id=data.get('transaction_id'),
                reference_number=data.get('reference_number'),
                payment_date=datetime.utcnow()
            )
            db.session.add(payment)
            db.session.flush()
            
            from app.services.receipt_service import ReceiptService
            result, status = ReceiptService.create_receipt(payment.id)
            
            if status != 201:
                db.session.rollback()
                return {'error': result.get('error', 'Failed to create receipt')}, status
            
            db.session.commit()
            
            return {
                'payment_id': payment.id,
                'receipt': result.get('receipt'),
                'message': 'Payment processed successfully'
            }, 201
            
        except Exception as e:
            db.session.rollback()
            logger.error(f"Error in process_payment: {str(e)}")
            return {'error': str(e)}, 500
    
    # ==================== RECEIPTS ====================
    @staticmethod
    def get_receipts(current_user, params):
        """Get customer receipts"""
        try:
            customer = Customer.query.filter_by(user_id=current_user.id).first()
            if not customer:
                return {'error': 'Customer profile not found'}, 404
            
            receipts = Receipt.query.filter_by(customer_id=customer.id).order_by(Receipt.created_at.desc()).limit(10).all()
            
            result = []
            for r in receipts:
                result.append({
                    'id': r.id,
                    'receipt_number': r.receipt_number,
                    'invoice_number': r.invoice_number,
                    'receipt_date': r.receipt_date.isoformat() if r.receipt_date else None,
                    'total': float(r.total) if r.total else 0,
                    'payment_method': r.payment_method,
                    'status': r.status,
                    'is_downloaded': r.is_downloaded
                })
            return result, 200
            
        except Exception as e:
            logger.error(f"Error in get_receipts: {str(e)}")
            return {'error': str(e)}, 500
    
    @staticmethod
    def download_receipt(current_user, receipt_id):
        """Download receipt"""
        try:
            receipt = Receipt.query.filter_by(id=receipt_id, customer_id=current_user.id).first()
            if not receipt:
                return {'error': 'Receipt not found'}, 404
            
            receipt.is_downloaded = True
            receipt.downloaded_at = datetime.utcnow()
            db.session.commit()
            
            from app.services.receipt_service import ReceiptService
            pdf_data = ReceiptService.generate_receipt_pdf(receipt_id)
            if not pdf_data:
                return {'error': 'Failed to generate PDF'}, 500
            
            return pdf_data, 200
            
        except Exception as e:
            logger.error(f"Error in download_receipt: {str(e)}")
            return {'error': str(e)}, 500
    
    @staticmethod
    def send_receipt(current_user, receipt_id, data):
        """Send receipt via email or SMS"""
        try:
            receipt = Receipt.query.filter_by(id=receipt_id, customer_id=current_user.id).first()
            if not receipt:
                return {'error': 'Receipt not found'}, 404
            
            method = data.get('method', 'email')
            
            from app.services.receipt_service import ReceiptService
            result, status = ReceiptService.send_receipt(receipt_id, method)
            
            return result, status
            
        except Exception as e:
            logger.error(f"Error in send_receipt: {str(e)}")
            return {'error': str(e)}, 500
    
    # ==================== LOYALTY POINTS ====================
    @staticmethod
    def get_loyalty_points(current_user):
        """Get loyalty points"""
        try:
            customer = Customer.query.filter_by(user_id=current_user.id).first()
            if not customer:
                return {'error': 'Customer profile not found'}, 404
            
            loyalty = Loyalty.query.filter_by(customer_id=customer.id).first()
            if not loyalty:
                loyalty = Loyalty(
                    customer_id=customer.id,
                    points=0,
                    total_points_earned=0,
                    total_points_redeemed=0,
                    tier='bronze'
                )
                db.session.add(loyalty)
                db.session.commit()
            
            return {
                'points': loyalty.points or 0,
                'total_earned': loyalty.total_points_earned or 0,
                'points_redeemed': loyalty.total_points_redeemed or 0,
                'tier': loyalty.tier or 'bronze'
            }, 200
            
        except Exception as e:
            logger.error(f"Error in get_loyalty_points: {str(e)}")
            return {'error': str(e)}, 500
    
    @staticmethod
    def get_loyalty_history(current_user):
        """Get loyalty history"""
        try:
            customer = Customer.query.filter_by(user_id=current_user.id).first()
            if not customer:
                return {'error': 'Customer profile not found'}, 404
            
            history = Loyalty.query.filter_by(customer_id=customer.id).order_by(Loyalty.created_at.desc()).limit(50).all()
            
            result = []
            for h in history:
                result.append({
                    'id': h.id,
                    'points': h.points,
                    'points_earned': h.points_earned,
                    'points_redeemed': h.points_redeemed,
                    'transaction_type': h.transaction_type,
                    'transaction_date': h.transaction_date.isoformat() if h.transaction_date else None,
                    'notes': h.notes
                })
            return result, 200
            
        except Exception as e:
            logger.error(f"Error in get_loyalty_history: {str(e)}")
            return {'error': str(e)}, 500
    
    @staticmethod
    def redeem_points(current_user, data):
        """Redeem loyalty points"""
        try:
            customer = Customer.query.filter_by(user_id=current_user.id).first()
            if not customer:
                return {'error': 'Customer profile not found'}, 404
            
            loyalty = Loyalty.query.filter_by(customer_id=customer.id).first()
            if not loyalty:
                return {'error': 'No loyalty points found'}, 404
            
            points_to_redeem = data.get('points', 0)
            if points_to_redeem > loyalty.points:
                return {'error': 'Insufficient points'}, 400
            
            loyalty.points -= points_to_redeem
            loyalty.total_points_redeemed = (loyalty.total_points_redeemed or 0) + points_to_redeem
            loyalty.points_redeemed = (loyalty.points_redeemed or 0) + points_to_redeem
            
            db.session.commit()
            return {'message': 'Points redeemed successfully', 'remaining_points': loyalty.points}, 200
            
        except Exception as e:
            db.session.rollback()
            logger.error(f"Error in redeem_points: {str(e)}")
            return {'error': str(e)}, 500
    
    # ==================== REVIEWS ====================
    @staticmethod
    def get_reviews(current_user):
        """Get customer reviews"""
        try:
            customer = Customer.query.filter_by(user_id=current_user.id).first()
            if not customer:
                return {'error': 'Customer profile not found'}, 404
            
            reviews = Review.query.filter_by(customer_id=customer.id).order_by(Review.created_at.desc()).all()
            
            result = []
            for r in reviews:
                result.append({
                    'id': r.id,
                    'rating': r.rating,
                    'comment': r.comment,
                    'title': r.title,
                    'service_id': r.service_id,
                    'appointment_id': r.appointment_id,
                    'created_at': r.created_at.isoformat() if r.created_at else None
                })
            return result, 200
            
        except Exception as e:
            logger.error(f"Error in get_reviews: {str(e)}")
            return {'error': str(e)}, 500
    
    @staticmethod
    def create_review(current_user, data):
        """Create review"""
        try:
            customer = Customer.query.filter_by(user_id=current_user.id).first()
            if not customer:
                return {'error': 'Customer profile not found'}, 404
            
            review = Review(
                customer_id=customer.id,
                user_id=current_user.id,
                appointment_id=data.get('appointment_id'),
                service_id=data.get('service_id'),
                rating=data['rating'],
                title=data.get('title'),
                comment=data.get('comment'),
                is_verified_purchase=True
            )
            db.session.add(review)
            db.session.commit()
            return {'id': review.id, 'message': 'Review created successfully'}, 201
            
        except Exception as e:
            db.session.rollback()
            logger.error(f"Error in create_review: {str(e)}")
            return {'error': str(e)}, 500
    
    @staticmethod
    def update_review(current_user, review_id, data):
        """Update review"""
        try:
            customer = Customer.query.filter_by(user_id=current_user.id).first()
            if not customer:
                return {'error': 'Customer profile not found'}, 404
            
            review = Review.query.filter_by(id=review_id, customer_id=customer.id).first()
            if not review:
                return {'error': 'Review not found'}, 404
            
            if 'rating' in data:
                review.rating = data['rating']
            if 'comment' in data:
                review.comment = data['comment']
            if 'title' in data:
                review.title = data['title']
            
            db.session.commit()
            return {'message': 'Review updated successfully'}, 200
            
        except Exception as e:
            db.session.rollback()
            logger.error(f"Error in update_review: {str(e)}")
            return {'error': str(e)}, 500
    
    @staticmethod
    def delete_review(current_user, review_id):
        """Delete review"""
        try:
            customer = Customer.query.filter_by(user_id=current_user.id).first()
            if not customer:
                return {'error': 'Customer profile not found'}, 404
            
            review = Review.query.filter_by(id=review_id, customer_id=customer.id).first()
            if not review:
                return {'error': 'Review not found'}, 404
            
            db.session.delete(review)
            db.session.commit()
            return {'message': 'Review deleted successfully'}, 200
            
        except Exception as e:
            db.session.rollback()
            logger.error(f"Error in delete_review: {str(e)}")
            return {'error': str(e)}, 500
    
    # ==================== NOTIFICATIONS ====================
    @staticmethod
    def get_notifications(current_user, params):
        """Get notifications"""
        try:
            query = Notification.query.filter_by(user_id=current_user.id).order_by(Notification.created_at.desc())
            page = int(params.get('page', 1))
            per_page = int(params.get('limit', 20))
            offset = (page - 1) * per_page
            
            total = query.count()
            notifications = query.limit(per_page).offset(offset).all()
            
            result = []
            for n in notifications:
                result.append({
                    'id': n.id,
                    'title': n.title,
                    'message': n.message,
                    'type': n.type,
                    'is_read': n.is_read,
                    'created_at': n.created_at.isoformat() if n.created_at else None
                })
            
            return {
                'notifications': result,
                'total': total,
                'pages': (total + per_page - 1) // per_page,
                'current_page': page
            }, 200
            
        except Exception as e:
            logger.error(f"Error in get_notifications: {str(e)}")
            return {'error': str(e)}, 500
    
    @staticmethod
    def get_unread_notifications(current_user):
        """Get unread notifications"""
        try:
            count = Notification.query.filter(
                Notification.user_id == current_user.id,
                Notification.is_read == False
            ).count()
            return {'unread_count': count}, 200
            
        except Exception as e:
            logger.error(f"Error in get_unread_notifications: {str(e)}")
            return {'error': str(e)}, 500
    
    @staticmethod
    def mark_notification_read(current_user, notification_id):
        """Mark notification as read"""
        try:
            notification = Notification.query.filter_by(id=notification_id, user_id=current_user.id).first()
            if not notification:
                return {'error': 'Notification not found'}, 404
            
            notification.is_read = True
            notification.read_at = datetime.utcnow()
            db.session.commit()
            return {'message': 'Notification marked as read'}, 200
            
        except Exception as e:
            db.session.rollback()
            logger.error(f"Error in mark_notification_read: {str(e)}")
            return {'error': str(e)}, 500
    
    @staticmethod
    def mark_all_notifications_read(current_user):
        """Mark all notifications as read"""
        try:
            Notification.query.filter_by(user_id=current_user.id, is_read=False).update({
                'is_read': True,
                'read_at': datetime.utcnow()
            })
            db.session.commit()
            return {'message': 'All notifications marked as read'}, 200
            
        except Exception as e:
            db.session.rollback()
            logger.error(f"Error in mark_all_notifications_read: {str(e)}")
            return {'error': str(e)}, 500
    
    @staticmethod
    def delete_notification(current_user, notification_id):
        """Delete notification"""
        try:
            notification = Notification.query.filter_by(id=notification_id, user_id=current_user.id).first()
            if not notification:
                return {'error': 'Notification not found'}, 404
            
            db.session.delete(notification)
            db.session.commit()
            return {'message': 'Notification deleted successfully'}, 200
            
        except Exception as e:
            db.session.rollback()
            logger.error(f"Error in delete_notification: {str(e)}")
            return {'error': str(e)}, 500
    
    # ==================== FAVORITES ====================
    @staticmethod
    def get_favorite_services(current_user):
        """Get favorite services"""
        try:
            return [], 200
        except Exception as e:
            logger.error(f"Error in get_favorite_services: {str(e)}")
            return {'error': str(e)}, 500
    
    @staticmethod
    def get_favorite_stylists(current_user):
        """Get favorite stylists"""
        try:
            return [], 200
        except Exception as e:
            logger.error(f"Error in get_favorite_stylists: {str(e)}")
            return {'error': str(e)}, 500
    
    @staticmethod
    def toggle_favorite_service(current_user, service_id):
        """Toggle favorite service"""
        try:
            return {'message': 'Favorite toggled'}, 200
        except Exception as e:
            logger.error(f"Error in toggle_favorite_service: {str(e)}")
            return {'error': str(e)}, 500
    
    @staticmethod
    def toggle_favorite_stylist(current_user, stylist_id):
        """Toggle favorite stylist"""
        try:
            return {'message': 'Favorite toggled'}, 200
        except Exception as e:
            logger.error(f"Error in toggle_favorite_stylist: {str(e)}")
            return {'error': str(e)}, 500
    
    # ==================== APPOINTMENT STATUS ====================
    @staticmethod
    def get_appointment_status_counts(current_user):
        """Get appointment status counts"""
        try:
            customer = Customer.query.filter_by(user_id=current_user.id).first()
            if not customer:
                return {'error': 'Customer profile not found'}, 404
            
            counts = {
                'pending': Appointment.query.filter_by(customer_id=customer.id, status='pending').count(),
                'confirmed': Appointment.query.filter_by(customer_id=customer.id, status='confirmed').count(),
                'in_progress': Appointment.query.filter_by(customer_id=customer.id, status='in_progress').count(),
                'completed': Appointment.query.filter_by(customer_id=customer.id, status='completed').count(),
                'cancelled': Appointment.query.filter_by(customer_id=customer.id, status='cancelled').count()
            }
            return counts, 200
            
        except Exception as e:
            logger.error(f"Error in get_appointment_status_counts: {str(e)}")
            return {'error': str(e)}, 500
    
    # ==================== BOOK APPOINTMENT ====================
    @staticmethod
    def book_appointment(current_user, data):
        """Book appointment"""
        try:
            # Log the incoming data for debugging
            logger.info(f"Book appointment data received: {data}")
            logger.info(f"Data keys: {list(data.keys())}")
            
            # Check if data is empty
            if not data:
                return {'error': 'No data provided'}, 400
            
            # Get the date from different possible keys
            appointment_date_str = data.get('date') or data.get('appointment_date')
            appointment_time_str = data.get('time') or data.get('appointment_time')
            service_id = data.get('service_id') or data.get('serviceId')
            branch_id = data.get('branch_id') or data.get('branchId')
            stylist_id = data.get('stylist_id') or data.get('stylistId')
            notes = data.get('notes') or data.get('note')
            
            # Validate required fields
            if not service_id:
                return {'error': 'Service ID is required'}, 400
            if not branch_id:
                return {'error': 'Branch ID is required'}, 400
            if not appointment_date_str:
                return {'error': 'Date is required'}, 400
            if not appointment_time_str:
                return {'error': 'Time is required'}, 400
            
            # Get customer
            customer = Customer.query.filter_by(user_id=current_user.id).first()
            if not customer:
                return {'error': 'Customer profile not found'}, 404
            
            # Get service
            service = Service.query.get(service_id)
            if not service:
                return {'error': 'Service not found'}, 404
            
            # Parse date and time
            try:
                # Handle different date formats
                if isinstance(appointment_date_str, str):
                    if 'T' in appointment_date_str:
                        # ISO format with time
                        appointment_date = datetime.fromisoformat(appointment_date_str.split('T')[0]).date()
                    elif '-' in appointment_date_str:
                        # YYYY-MM-DD format
                        appointment_date = datetime.strptime(appointment_date_str, '%Y-%m-%d').date()
                    else:
                        return {'error': f'Unsupported date format: {appointment_date_str}'}, 400
                else:
                    return {'error': f'Invalid date type: {type(appointment_date_str)}'}, 400
                
                # Parse time
                if isinstance(appointment_time_str, str):
                    if ':' in appointment_time_str:
                        # HH:MM or HH:MM:SS format
                        time_parts = appointment_time_str.split(':')
                        if len(time_parts) >= 2:
                            appointment_time = datetime.strptime(f"{time_parts[0]}:{time_parts[1]}", '%H:%M').time()
                        else:
                            return {'error': f'Invalid time format: {appointment_time_str}'}, 400
                    else:
                        return {'error': f'Unsupported time format: {appointment_time_str}'}, 400
                else:
                    return {'error': f'Invalid time type: {type(appointment_time_str)}'}, 400
                    
            except ValueError as e:
                return {'error': f'Invalid date or time format: {str(e)}'}, 400
            
            # Create appointment
            appointment = Appointment(
                customer_id=customer.id,
                service_id=service_id,
                branch_id=branch_id,
                appointment_date=appointment_date,
                appointment_time=appointment_time,
                stylist_id=stylist_id,
                notes=notes,
                status='pending',
                total_amount=service.price,
                final_amount=service.price
            )
            db.session.add(appointment)
            db.session.commit()
            
            return {
                'id': appointment.id,
                'status': appointment.status,
                'message': 'Appointment booked successfully'
            }, 201
            
        except Exception as e:
            db.session.rollback()
            logger.error(f"Error in book_appointment: {str(e)}")
            import traceback
            traceback.print_exc()
            return {'error': str(e)}, 500

    # ==================== PAYMENT METHODS ====================
    @staticmethod
    def get_payment(current_user, payment_id):
        """Get payment details"""
        try:
            from app.models.payment import Payment
            from app.models.customer import Customer
            
            customer = Customer.query.filter_by(user_id=current_user.id).first()
            if not customer:
                return {'error': 'Customer profile not found'}, 404
            
            payment = Payment.query.filter_by(id=payment_id, customer_id=customer.id).first()
            if not payment:
                return {'error': 'Payment not found'}, 404
            
            return payment.to_dict(), 200
            
        except Exception as e:
            logger.error(f"Error in get_payment: {str(e)}")
            return {'error': str(e)}, 500
    
    @staticmethod
    def get_receipt(current_user, payment_id):
        """Get receipt for payment"""
        try:
            from app.models.payment import Payment
            from app.models.receipt import Receipt
            from app.models.customer import Customer
            
            customer = Customer.query.filter_by(user_id=current_user.id).first()
            if not customer:
                return {'error': 'Customer profile not found'}, 404
            
            payment = Payment.query.filter_by(id=payment_id, customer_id=customer.id).first()
            if not payment:
                return {'error': 'Payment not found'}, 404
            
            receipt = Receipt.query.filter_by(payment_id=payment_id).first()
            if not receipt:
                return {'error': 'Receipt not found'}, 404
            
            return receipt.to_dict(), 200
            
        except Exception as e:
            logger.error(f"Error in get_receipt: {str(e)}")
            return {'error': str(e)}, 500
    
    @staticmethod
    def process_payment(current_user, payment_id, data):
        """Process payment"""
        try:
            from app.models.payment import Payment
            from app.models.customer import Customer
            from datetime import datetime
            
            customer = Customer.query.filter_by(user_id=current_user.id).first()
            if not customer:
                return {'error': 'Customer profile not found'}, 404
            
            payment = Payment.query.filter_by(id=payment_id, customer_id=customer.id).first()
            if not payment:
                return {'error': 'Payment not found'}, 404
            
            if payment.payment_status == 'paid':
                return {'error': 'Payment already processed'}, 400
            
            payment.payment_status = 'paid'
            payment.payment_method = data.get('payment_method', payment.payment_method)
            payment.payment_date = datetime.utcnow()
            payment.transaction_id = data.get('transaction_id') or f"TXN-{datetime.utcnow().strftime('%Y%m%d%H%M%S')}-{payment.id}"
            
            db.session.commit()
            
            return {
                'id': payment.id,
                'payment_status': payment.payment_status,
                'transaction_id': payment.transaction_id
            }, 200
            
        except Exception as e:
            db.session.rollback()
            logger.error(f"Error in process_payment: {str(e)}")
            return {'error': str(e)}, 500
    
    @staticmethod
    def send_receipt(current_user, receipt_id, data):
        """Send receipt via email or SMS"""
        try:
            from app.models.receipt import Receipt
            from app.models.customer import Customer
            from app.services.receipt_service import ReceiptService
            
            customer = Customer.query.filter_by(user_id=current_user.id).first()
            if not customer:
                return {'error': 'Customer profile not found'}, 404
            
            receipt = Receipt.query.filter_by(id=receipt_id, customer_id=customer.id).first()
            if not receipt:
                return {'error': 'Receipt not found'}, 404
            
            method = data.get('method', 'email')
            
            return ReceiptService.send_receipt(receipt_id, method)
            
        except Exception as e:
            logger.error(f"Error in send_receipt: {str(e)}")
            return {'error': str(e)}, 500
    
    @staticmethod
    def delete_notification(current_user, notification_id):
        """Delete notification"""
        try:
            from app.models.notification import Notification
            
            notification = Notification.query.filter_by(id=notification_id, user_id=current_user.id).first()
            if not notification:
                return {'error': 'Notification not found'}, 404
            
            db.session.delete(notification)
            db.session.commit()
            
            return {'message': 'Notification deleted successfully'}, 200
            
        except Exception as e:
            db.session.rollback()
            logger.error(f"Error in delete_notification: {str(e)}")
            return {'error': str(e)}, 500