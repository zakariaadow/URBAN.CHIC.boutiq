from datetime import datetime
from flask import current_app
from app.extensions import db
from app.models.user import User
from app.models.customer import Customer
from app.models.appointment import Appointment
from app.models.payment import Payment
from app.models.receipt import Receipt
from app.models.stylist import Stylist
from app.models.branch import Branch
from app.models.service import Service
from app.services.appointment_service import AppointmentService
from app.services.payment_service import PaymentService
from app.services.notification_service import NotificationService

class ReceptionistService:
    
    @staticmethod
    def get_dashboard(current_user):
        """Get receptionist dashboard data"""
        try:
            # Get today's appointments
            today = datetime.utcnow().date()
            today_appointments = Appointment.query.filter(
                Appointment.appointment_date == today
            ).order_by(Appointment.appointment_time.asc()).all()
            
            # Get pending requests
            pending = Appointment.query.filter_by(
                status='pending'
            ).order_by(Appointment.created_at.desc()).limit(10).all()
            
            # Get walk-in customers today
            walk_ins = Appointment.query.filter(
                Appointment.appointment_date == today,
                Appointment.is_walk_in == True
            ).count()
            
            return {
                'today_appointments': [a.to_dict() for a in today_appointments],
                'pending_requests': [a.to_dict() for a in pending],
                'walk_ins_today': walk_ins,
                'total_today': len(today_appointments)
            }, 200
            
        except Exception as e:
            return {'error': str(e)}, 500
    
    @staticmethod
    def register_walk_in(current_user, data):
        """Register a walk-in customer"""
        try:
            # Create user account for walk-in
            user = User(
                email=data.get('email') or f"walkin_{datetime.utcnow().timestamp()}@temp.com",
                username=f"walkin_{datetime.utcnow().timestamp()}",
                first_name=data.get('first_name', 'Walk-in'),
                last_name=data.get('last_name', 'Customer'),
                phone=data.get('phone'),
                is_verified=True,
                is_approved=True
            )
            user.set_password('walkin123')  # Default password
            
            db.session.add(user)
            db.session.flush()
            
            # Create customer profile
            customer = Customer(
                user_id=user.id,
                is_walk_in=True,
                address=data.get('address'),
                city=data.get('city'),
                country=data.get('country', 'Kenya')
            )
            db.session.add(customer)
            db.session.flush()
            
            # Create appointment
            appointment_data = {
                'customer_id': customer.id,
                'service_id': data.get('service_id'),
                'branch_id': data.get('branch_id'),
                'appointment_date': datetime.utcnow().date().isoformat(),
                'appointment_time': datetime.utcnow().strftime('%H:%M'),
                'is_walk_in': True,
                'notes': data.get('notes')
            }
            
            result, status_code = AppointmentService.create_appointment(appointment_data, customer.id)
            
            if status_code == 201:
                # Assign stylist if provided
                if data.get('stylist_id'):
                    appointment = Appointment.query.get(result.get('id'))
                    if appointment:
                        appointment.stylist_id = data['stylist_id']
                        db.session.commit()
            
            return result, status_code
            
        except Exception as e:
            db.session.rollback()
            return {'error': str(e)}, 500
    
    @staticmethod
    def get_walk_in_customer(current_user, customer_id):
        """Get walk-in customer details"""
        try:
            customer = Customer.query.get(customer_id)
            if not customer:
                return {'error': 'Customer not found'}, 404
            return customer.to_dict(), 200
        except Exception as e:
            return {'error': str(e)}, 500
    
    @staticmethod
    def get_appointment_requests(current_user, params):
        """Get pending appointment requests"""
        try:
            query = Appointment.query.filter_by(status='pending')
            
            if params.get('branch_id'):
                query = query.filter(Appointment.branch_id == params['branch_id'])
            
            query = query.order_by(Appointment.created_at.asc())
            
            page = int(params.get('page', 1))
            per_page = int(params.get('per_page', 20))
            
            appointments = query.paginate(page=page, per_page=per_page, error_out=False)
            
            return {
                'items': [a.to_dict() for a in appointments.items],
                'total': appointments.total,
                'page': page,
                'per_page': per_page,
                'pages': appointments.pages
            }, 200
            
        except Exception as e:
            return {'error': str(e)}, 500
    
    @staticmethod
    def approve_booking(current_user, appointment_id):
        """Approve a booking"""
        try:
            appointment = Appointment.query.get(appointment_id)
            if not appointment:
                return {'error': 'Appointment not found'}, 404
            
            appointment.status = 'approved'
            appointment.receptionist_id = current_user.id
            db.session.commit()
            
            # Notify customer
            NotificationService.create_notification(
                user_id=appointment.customer.user_id,
                title='Appointment Approved',
                message=f'Your appointment has been approved.',
                type='appointment',
                appointment_id=appointment.id
            )
            
            return appointment.to_dict(), 200
            
        except Exception as e:
            db.session.rollback()
            return {'error': str(e)}, 500
    
    @staticmethod
    def reschedule_booking(current_user, appointment_id, data):
        """Reschedule a booking"""
        try:
            appointment = Appointment.query.get(appointment_id)
            if not appointment:
                return {'error': 'Appointment not found'}, 404
            
            if 'appointment_date' in data:
                appointment.appointment_date = data['appointment_date']
            if 'appointment_time' in data:
                appointment.appointment_time = data['appointment_time']
            if 'stylist_id' in data:
                appointment.stylist_id = data['stylist_id']
            
            appointment.is_rescheduled = True
            appointment.rescheduled_from = appointment_id
            appointment.status = 'approved'
            appointment.receptionist_id = current_user.id
            
            db.session.commit()
            
            # Notify customer
            NotificationService.create_notification(
                user_id=appointment.customer.user_id,
                title='Appointment Rescheduled',
                message=f'Your appointment has been rescheduled.',
                type='appointment',
                appointment_id=appointment.id
            )
            
            return appointment.to_dict(), 200
            
        except Exception as e:
            db.session.rollback()
            return {'error': str(e)}, 500
    
    @staticmethod
    def cancel_booking(current_user, appointment_id):
        """Cancel a booking"""
        try:
            appointment = Appointment.query.get(appointment_id)
            if not appointment:
                return {'error': 'Appointment not found'}, 404
            
            appointment.status = 'cancelled'
            appointment.receptionist_id = current_user.id
            db.session.commit()
            
            # Notify customer
            NotificationService.create_notification(
                user_id=appointment.customer.user_id,
                title='Appointment Cancelled',
                message=f'Your appointment has been cancelled.',
                type='appointment',
                appointment_id=appointment.id
            )
            
            return {'message': 'Appointment cancelled successfully'}, 200
            
        except Exception as e:
            db.session.rollback()
            return {'error': str(e)}, 500
    
    @staticmethod
    def check_in_customer(current_user, appointment_id):
        """Check in a customer"""
        try:
            appointment = Appointment.query.get(appointment_id)
            if not appointment:
                return {'error': 'Appointment not found'}, 404
            
            appointment.status = 'checked_in'
            appointment.check_in_time = datetime.utcnow()
            appointment.receptionist_id = current_user.id
            db.session.commit()
            
            return {'message': 'Customer checked in successfully'}, 200
            
        except Exception as e:
            db.session.rollback()
            return {'error': str(e)}, 500
    
    @staticmethod
    def assign_stylist(current_user, appointment_id, data):
        """Assign a stylist to appointment"""
        try:
            appointment = Appointment.query.get(appointment_id)
            if not appointment:
                return {'error': 'Appointment not found'}, 404
            
            if 'stylist_id' not in data:
                return {'error': 'Stylist ID is required'}, 400
            
            stylist = Stylist.query.get(data['stylist_id'])
            if not stylist:
                return {'error': 'Stylist not found'}, 404
            
            appointment.stylist_id = stylist.id
            appointment.receptionist_id = current_user.id
            db.session.commit()
            
            return appointment.to_dict(), 200
            
        except Exception as e:
            db.session.rollback()
            return {'error': str(e)}, 500
    
    @staticmethod
    def send_reminder(current_user, appointment_id):
        """Send appointment reminder"""
        try:
            appointment = Appointment.query.get(appointment_id)
            if not appointment:
                return {'error': 'Appointment not found'}, 404
            
            # Send reminder via email and notification
            from app.services.email_service import EmailService
            
            customer = appointment.customer
            if customer.user.email:
                EmailService.send_appointment_reminder(
                    customer.user.email,
                    customer.user.full_name,
                    appointment
                )
            
            NotificationService.create_notification(
                user_id=customer.user_id,
                title='Appointment Reminder',
                message=f'Reminder: Your appointment is at {appointment.appointment_time} on {appointment.appointment_date}',
                type='reminder',
                appointment_id=appointment.id
            )
            
            return {'message': 'Reminder sent successfully'}, 200
            
        except Exception as e:
            return {'error': str(e)}, 500
    
    @staticmethod
    def get_today_appointments(current_user):
        """Get today's appointments"""
        try:
            today = datetime.utcnow().date()
            appointments = Appointment.query.filter(
                Appointment.appointment_date == today
            ).order_by(Appointment.appointment_time.asc()).all()
            
            return [a.to_dict() for a in appointments], 200
            
        except Exception as e:
            return {'error': str(e)}, 500
    
    @staticmethod
    def get_all_appointments(current_user, params):
        """Get all appointments"""
        try:
            query = Appointment.query
            
            if params.get('branch_id'):
                query = query.filter(Appointment.branch_id == params['branch_id'])
            
            if params.get('status'):
                query = query.filter(Appointment.status == params['status'])
            
            if params.get('start_date'):
                query = query.filter(Appointment.appointment_date >= params['start_date'])
            
            if params.get('end_date'):
                query = query.filter(Appointment.appointment_date <= params['end_date'])
            
            query = query.order_by(Appointment.appointment_date.desc(), Appointment.appointment_time.desc())
            
            page = int(params.get('page', 1))
            per_page = int(params.get('per_page', 20))
            
            appointments = query.paginate(page=page, per_page=per_page, error_out=False)
            
            return {
                'items': [a.to_dict() for a in appointments.items],
                'total': appointments.total,
                'page': page,
                'per_page': per_page,
                'pages': appointments.pages
            }, 200
            
        except Exception as e:
            return {'error': str(e)}, 500
    
    @staticmethod
    def get_appointment(current_user, appointment_id):
        """Get appointment details"""
        try:
            appointment = Appointment.query.get(appointment_id)
            if not appointment:
                return {'error': 'Appointment not found'}, 404
            return appointment.to_dict(), 200
        except Exception as e:
            return {'error': str(e)}, 500
    
    @staticmethod
    def get_customers(params):
        """Get all customers"""
        try:
            query = Customer.query
            
            if params.get('search'):
                search = f"%{params['search']}%"
                query = query.join(User).filter(
                    db.or_(
                        User.first_name.ilike(search),
                        User.last_name.ilike(search),
                        User.email.ilike(search),
                        User.phone.ilike(search)
                    )
                )
            
            page = int(params.get('page', 1))
            per_page = int(params.get('per_page', 20))
            
            customers = query.paginate(page=page, per_page=per_page, error_out=False)
            
            return {
                'items': [c.to_dict() for c in customers.items],
                'total': customers.total,
                'page': page,
                'per_page': per_page,
                'pages': customers.pages
            }, 200
            
        except Exception as e:
            return {'error': str(e)}, 500
    
    @staticmethod
    def search_customers(params):
        """Search customers"""
        return ReceptionistService.get_customers(params)
    
    @staticmethod
    def get_customer(current_user, customer_id):
        """Get customer details"""
        try:
            customer = Customer.query.get(customer_id)
            if not customer:
                return {'error': 'Customer not found'}, 404
            return customer.to_dict(), 200
        except Exception as e:
            return {'error': str(e)}, 500
    
    @staticmethod
    def get_customer_history(current_user, customer_id):
        """Get customer history"""
        try:
            appointments = Appointment.query.filter_by(
                customer_id=customer_id
            ).order_by(Appointment.created_at.desc()).all()
            
            return [a.to_dict() for a in appointments], 200
            
        except Exception as e:
            return {'error': str(e)}, 500
    
    @staticmethod
    def receive_payment(current_user, data):
        """Receive payment from customer"""
        try:
            result, status_code = PaymentService.process_payment(data, current_user)
            return result, status_code
        except Exception as e:
            return {'error': str(e)}, 500
    
    @staticmethod
    def print_receipt(current_user, payment_id):
        """Print receipt"""
        try:
            from app.services.receipt_service import ReceiptService
            receipt = ReceiptService.get_receipt_by_payment(payment_id)
            return receipt, 200
        except Exception as e:
            return {'error': str(e)}, 500
    
    @staticmethod
    def get_pending_payments(current_user):
        """Get pending payments"""
        try:
            payments = Payment.query.filter_by(
                payment_status='pending'
            ).order_by(Payment.payment_date.asc()).all()
            
            return [p.to_dict() for p in payments], 200
            
        except Exception as e:
            return {'error': str(e)}, 500
    
    @staticmethod
    def get_stylists(params):
        """Get all stylists"""
        try:
            query = Stylist.query.filter_by(is_active=True)
            
            if params.get('branch_id'):
                query = query.filter(Stylist.branch_id == params['branch_id'])
            
            stylists = query.all()
            return [s.to_dict() for s in stylists], 200
            
        except Exception as e:
            return {'error': str(e)}, 500
    
    @staticmethod
    def get_available_stylists(params):
        """Get available stylists"""
        try:
            query = Stylist.query.filter_by(is_active=True, is_available=True)
            
            if params.get('branch_id'):
                query = query.filter(Stylist.branch_id == params['branch_id'])
            
            stylists = query.all()
            return [s.to_dict() for s in stylists], 200
            
        except Exception as e:
            return {'error': str(e)}, 500
    
    @staticmethod
    def get_stylist_schedule(current_user, stylist_id):
        """Get stylist schedule"""
        try:
            # This would require a schedule model
            # For now, return placeholder
            return {'message': 'Schedule functionality coming soon'}, 200
        except Exception as e:
            return {'error': str(e)}, 500
    
    @staticmethod
    def get_services(params):
        """Get all services"""
        try:
            query = Service.query.filter_by(is_active=True)
            
            if params.get('category_id'):
                query = query.filter(Service.category_id == params['category_id'])
            
            services = query.all()
            return [s.to_dict() for s in services], 200
            
        except Exception as e:
            return {'error': str(e)}, 500
    
    @staticmethod
    def get_service(current_user, service_id):
        """Get service details"""
        try:
            service = Service.query.get(service_id)
            if not service:
                return {'error': 'Service not found'}, 404
            return service.to_dict(), 200
        except Exception as e:
            return {'error': str(e)}, 500
    
    @staticmethod
    def get_branches():
        """Get all branches"""
        try:
            branches = Branch.query.filter_by(is_active=True).all()
            return [b.to_dict() for b in branches], 200
        except Exception as e:
            return {'error': str(e)}, 500
    
    @staticmethod
    def get_daily_report(current_user, params):
        """Get daily report"""
        try:
            date = params.get('date', datetime.utcnow().date().isoformat())
            
            appointments = Appointment.query.filter(
                Appointment.appointment_date == date
            ).all()
            
            completed = [a for a in appointments if a.status == 'completed']
            cancelled = [a for a in appointments if a.status == 'cancelled']
            
            return {
                'date': date,
                'total_appointments': len(appointments),
                'completed': len(completed),
                'cancelled': len(cancelled),
                'pending': len([a for a in appointments if a.status == 'pending']),
                'revenue': sum(a.final_amount for a in completed)
            }, 200
            
        except Exception as e:
            return {'error': str(e)}, 500
    
    @staticmethod
    def get_appointment_report(current_user, params):
        """Get appointment report"""
        try:
            start_date = params.get('start_date', datetime.utcnow().date().isoformat())
            end_date = params.get('end_date', datetime.utcnow().date().isoformat())
            
            appointments = Appointment.query.filter(
                Appointment.appointment_date >= start_date,
                Appointment.appointment_date <= end_date
            ).all()
            
            return {
                'start_date': start_date,
                'end_date': end_date,
                'total': len(appointments),
                'appointments': [a.to_dict() for a in appointments]
            }, 200
            
        except Exception as e:
            return {'error': str(e)}, 500
    @staticmethod
    def get_all_appointments(current_user, params):
        """Get all appointments"""
        try:
            from app.models.appointment import Appointment
            
            query = Appointment.query
            
            if params.get('status'):
                query = query.filter(Appointment.status == params['status'])
            
            if params.get('start_date'):
                query = query.filter(Appointment.appointment_date >= params['start_date'])
            
            if params.get('end_date'):
                query = query.filter(Appointment.appointment_date <= params['end_date'])
            
            if params.get('branch_id'):
                query = query.filter(Appointment.branch_id == params['branch_id'])
            
            query = query.order_by(Appointment.appointment_date.desc(), Appointment.appointment_time.desc())
            
            page = int(params.get('page', 1))
            per_page = int(params.get('per_page', 20))
            
            appointments = query.paginate(page=page, per_page=per_page, error_out=False)
            
            return {
                'items': [a.to_dict() for a in appointments.items],
                'total': appointments.total,
                'page': page,
                'per_page': per_page,
                'pages': appointments.pages
            }, 200
            
        except Exception as e:
            return {'error': str(e)}, 500

    @staticmethod
    def get_payments(current_user, params):
        """Get all payments"""
        try:
            from app.models.payment import Payment
            
            query = Payment.query
            
            if params.get('payment_status'):
                query = query.filter(Payment.payment_status == params['payment_status'])
            
            if params.get('payment_method'):
                query = query.filter(Payment.payment_method == params['payment_method'])
            
            if params.get('start_date'):
                query = query.filter(Payment.payment_date >= params['start_date'])
            
            if params.get('end_date'):
                query = query.filter(Payment.payment_date <= params['end_date'])
            
            query = query.order_by(Payment.payment_date.desc())
            
            page = int(params.get('page', 1))
            per_page = int(params.get('per_page', 20))
            
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
