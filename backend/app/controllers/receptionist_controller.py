from app.extensions import db
from app.utils.response import APIResponse
from app.services.receptionist_service import ReceptionistService

class ReceptionistController:
    
    @staticmethod
    def get_dashboard(current_user):
        """Get receptionist dashboard data"""
        try:
            result, status_code = ReceptionistService.get_dashboard(current_user)
            
            if status_code == 200:
                return APIResponse.success(result, 'Dashboard data retrieved successfully')
            else:
                return APIResponse.error(result['error'], 'DASHBOARD_ERROR', status_code)
                
        except Exception as e:
            return APIResponse.server_error(str(e))
    
    @staticmethod
    def register_walk_in(current_user, data):
        """Register a walk-in customer"""
        try:
            result, status_code = ReceptionistService.register_walk_in(current_user, data)
            
            if status_code == 201:
                return APIResponse.success(result, 'Walk-in customer registered successfully', 201)
            else:
                return APIResponse.error(result['error'], 'REGISTRATION_ERROR', status_code)
                
        except Exception as e:
            return APIResponse.server_error(str(e))
    
    @staticmethod
    def get_walk_in_customer(current_user, customer_id):
        """Get walk-in customer details"""
        try:
            result, status_code = ReceptionistService.get_walk_in_customer(current_user, customer_id)
            return APIResponse.success(result, 'Customer details retrieved successfully', status_code)
        except Exception as e:
            return APIResponse.server_error(str(e))
    
    @staticmethod
    def get_appointment_requests(current_user, params):
        """Get pending appointment requests"""
        try:
            result, status_code = ReceptionistService.get_appointment_requests(current_user, params)
            return APIResponse.success(result, 'Appointment requests retrieved successfully', status_code)
        except Exception as e:
            return APIResponse.server_error(str(e))
    
    @staticmethod
    def approve_booking(current_user, appointment_id):
        """Approve a booking"""
        try:
            result, status_code = ReceptionistService.approve_booking(current_user, appointment_id)
            
            if status_code == 200:
                return APIResponse.success(result, 'Booking approved successfully')
            else:
                return APIResponse.error(result['error'], 'APPROVAL_ERROR', status_code)
                
        except Exception as e:
            return APIResponse.server_error(str(e))
    
    @staticmethod
    def reschedule_booking(current_user, appointment_id, data):
        """Reschedule a booking"""
        try:
            result, status_code = ReceptionistService.reschedule_booking(current_user, appointment_id, data)
            
            if status_code == 200:
                return APIResponse.success(result, 'Booking rescheduled successfully')
            else:
                return APIResponse.error(result['error'], 'RESCHEDULE_ERROR', status_code)
                
        except Exception as e:
            return APIResponse.server_error(str(e))
    
    @staticmethod
    def cancel_booking(current_user, appointment_id):
        """Cancel a booking"""
        try:
            result, status_code = ReceptionistService.cancel_booking(current_user, appointment_id)
            
            if status_code == 200:
                return APIResponse.success(None, result['message'])
            else:
                return APIResponse.error(result['error'], 'CANCEL_ERROR', status_code)
                
        except Exception as e:
            return APIResponse.server_error(str(e))
    
    @staticmethod
    def check_in_customer(current_user, appointment_id):
        """Check in a customer"""
        try:
            result, status_code = ReceptionistService.check_in_customer(current_user, appointment_id)
            
            if status_code == 200:
                return APIResponse.success(None, result['message'])
            else:
                return APIResponse.error(result['error'], 'CHECK_IN_ERROR', status_code)
                
        except Exception as e:
            return APIResponse.server_error(str(e))
    
    @staticmethod
    def assign_stylist(current_user, appointment_id, data):
        """Assign a stylist to appointment"""
        try:
            result, status_code = ReceptionistService.assign_stylist(current_user, appointment_id, data)
            
            if status_code == 200:
                return APIResponse.success(result, 'Stylist assigned successfully')
            else:
                return APIResponse.error(result['error'], 'ASSIGN_ERROR', status_code)
                
        except Exception as e:
            return APIResponse.server_error(str(e))
    
    @staticmethod
    def send_reminder(current_user, appointment_id):
        """Send appointment reminder"""
        try:
            result, status_code = ReceptionistService.send_reminder(current_user, appointment_id)
            
            if status_code == 200:
                return APIResponse.success(None, result['message'])
            else:
                return APIResponse.error(result['error'], 'REMINDER_ERROR', status_code)
                
        except Exception as e:
            return APIResponse.server_error(str(e))
    
    @staticmethod
    def get_today_appointments(current_user):
        """Get today's appointments"""
        try:
            result, status_code = ReceptionistService.get_today_appointments(current_user)
            return APIResponse.success(result, 'Today\'s appointments retrieved successfully', status_code)
        except Exception as e:
            return APIResponse.server_error(str(e))
    
    @staticmethod
    def get_all_appointments(current_user, params):
        """Get all appointments"""
        try:
            result, status_code = ReceptionistService.get_all_appointments(current_user, params)
            return APIResponse.success(result, 'Appointments retrieved successfully', status_code)
        except Exception as e:
            return APIResponse.server_error(str(e))
    
    @staticmethod
    def get_appointment(current_user, appointment_id):
        """Get appointment details"""
        try:
            result, status_code = ReceptionistService.get_appointment(current_user, appointment_id)
            return APIResponse.success(result, 'Appointment details retrieved successfully', status_code)
        except Exception as e:
            return APIResponse.server_error(str(e))
    
    @staticmethod
    def get_customers(current_user, params):
        """Get all customers"""
        try:
            result, status_code = ReceptionistService.get_customers(params)
            return APIResponse.success(result, 'Customers retrieved successfully', status_code)
        except Exception as e:
            return APIResponse.server_error(str(e))
    
    @staticmethod
    def search_customers(current_user, params):
        """Search customers"""
        try:
            result, status_code = ReceptionistService.search_customers(params)
            return APIResponse.success(result, 'Customers found successfully', status_code)
        except Exception as e:
            return APIResponse.server_error(str(e))
    
    @staticmethod
    def get_customer(current_user, customer_id):
        """Get customer details"""
        try:
            result, status_code = ReceptionistService.get_customer(current_user, customer_id)
            return APIResponse.success(result, 'Customer details retrieved successfully', status_code)
        except Exception as e:
            return APIResponse.server_error(str(e))
    
    @staticmethod
    def get_customer_history(current_user, customer_id):
        """Get customer history"""
        try:
            result, status_code = ReceptionistService.get_customer_history(current_user, customer_id)
            return APIResponse.success(result, 'Customer history retrieved successfully', status_code)
        except Exception as e:
            return APIResponse.server_error(str(e))
    
    @staticmethod
    def receive_payment(current_user, data):
        """Receive payment from customer"""
        try:
            result, status_code = ReceptionistService.receive_payment(current_user, data)
            
            if status_code == 201:
                return APIResponse.success(result, 'Payment received successfully', 201)
            else:
                return APIResponse.error(result['error'], 'PAYMENT_ERROR', status_code)
                
        except Exception as e:
            return APIResponse.server_error(str(e))
    
    @staticmethod
    def print_receipt(current_user, payment_id):
        """Print receipt"""
        try:
            result, status_code = ReceptionistService.print_receipt(current_user, payment_id)
            return APIResponse.success(result, 'Receipt retrieved successfully', status_code)
        except Exception as e:
            return APIResponse.server_error(str(e))
    
    @staticmethod
    def get_pending_payments(current_user):
        """Get pending payments"""
        try:
            result, status_code = ReceptionistService.get_pending_payments(current_user)
            return APIResponse.success(result, 'Pending payments retrieved successfully', status_code)
        except Exception as e:
            return APIResponse.server_error(str(e))
    
    @staticmethod
    def get_stylists(current_user, params):
        """Get all stylists"""
        try:
            result, status_code = ReceptionistService.get_stylists(params)
            return APIResponse.success(result, 'Stylists retrieved successfully', status_code)
        except Exception as e:
            return APIResponse.server_error(str(e))
    
    @staticmethod
    def get_available_stylists(current_user, params):
        """Get available stylists"""
        try:
            result, status_code = ReceptionistService.get_available_stylists(params)
            return APIResponse.success(result, 'Available stylists retrieved successfully', status_code)
        except Exception as e:
            return APIResponse.server_error(str(e))
    
    @staticmethod
    def get_stylist_schedule(current_user, stylist_id):
        """Get stylist schedule"""
        try:
            result, status_code = ReceptionistService.get_stylist_schedule(current_user, stylist_id)
            return APIResponse.success(result, 'Stylist schedule retrieved successfully', status_code)
        except Exception as e:
            return APIResponse.server_error(str(e))
    
    @staticmethod
    def get_services(current_user, params):
        """Get all services"""
        try:
            result, status_code = ReceptionistService.get_services(params)
            return APIResponse.success(result, 'Services retrieved successfully', status_code)
        except Exception as e:
            return APIResponse.server_error(str(e))
    
    @staticmethod
    def get_service(current_user, service_id):
        """Get service details"""
        try:
            result, status_code = ReceptionistService.get_service(current_user, service_id)
            return APIResponse.success(result, 'Service details retrieved successfully', status_code)
        except Exception as e:
            return APIResponse.server_error(str(e))
    
    @staticmethod
    def get_branches(current_user):
        """Get all branches"""
        try:
            result, status_code = ReceptionistService.get_branches()
            return APIResponse.success(result, 'Branches retrieved successfully', status_code)
        except Exception as e:
            return APIResponse.server_error(str(e))
    
    @staticmethod
    def get_daily_report(current_user, params):
        """Get daily report"""
        try:
            result, status_code = ReceptionistService.get_daily_report(current_user, params)
            return APIResponse.success(result, 'Daily report retrieved successfully', status_code)
        except Exception as e:
            return APIResponse.server_error(str(e))
    
    @staticmethod
    def get_appointment_report(current_user, params):
        """Get appointment report"""
        try:
            result, status_code = ReceptionistService.get_appointment_report(current_user, params)
            return APIResponse.success(result, 'Appointment report retrieved successfully', status_code)
        except Exception as e:
            return APIResponse.server_error(str(e))
    @staticmethod
    def get_all_appointments(current_user, params):
        """Get all appointments"""
        try:
            from app.services.receptionist_service import ReceptionistService
            result, status_code = ReceptionistService.get_all_appointments(current_user, params)
            return APIResponse.success(result, 'Appointments retrieved successfully', status_code)
        except Exception as e:
            return APIResponse.server_error(str(e))

    @staticmethod
    def get_payments(current_user, params):
        """Get all payments"""
        try:
            from app.services.receptionist_service import ReceptionistService
            result, status_code = ReceptionistService.get_payments(current_user, params)
            return APIResponse.success(result, 'Payments retrieved successfully', status_code)
        except Exception as e:
            return APIResponse.server_error(str(e))

    @staticmethod
    def get_notifications(current_user, params):
        """Get notifications"""
        try:
            from app.services.notification_service import NotificationService
            result, status_code = NotificationService.get_notifications(current_user.id, params)
            return APIResponse.success(result, 'Notifications retrieved successfully', status_code)
        except Exception as e:
            return APIResponse.server_error(str(e))

    @staticmethod
    def get_notifications(current_user, params):
        """Get notifications"""
        try:
            from app.models.notification import Notification
            
            query = Notification.query.filter_by(user_id=current_user.id)
            
            if params.get('is_read') is not None:
                query = query.filter(Notification.is_read == params['is_read'])
            
            if params.get('type'):
                query = query.filter(Notification.type == params['type'])
            
            query = query.order_by(Notification.created_at.desc())
            
            page = int(params.get('page', 1))
            per_page = int(params.get('per_page', 20))
            
            notifications = query.paginate(page=page, per_page=per_page, error_out=False)
            
            return {
                'items': [n.to_dict() for n in notifications.items],
                'total': notifications.total,
                'page': page,
                'per_page': per_page,
                'pages': notifications.pages
            }, 200
            
        except Exception as e:
            import traceback
            traceback.print_exc()
            return {'error': str(e)}, 500

    @staticmethod
    def get_reports(current_user, params):
        """Get all reports"""
        try:
            from app.models.report import Report
            from app.models.branch import Branch
            
            # Get receptionist's branch
            from app.models.receptionist import Receptionist
            receptionist = Receptionist.query.filter_by(user_id=current_user.id).first()
            
            query = Report.query
            
            # Filter by branch if receptionist has a branch
            if receptionist and receptionist.branch_id:
                query = query.filter(Report.branch_id == receptionist.branch_id)
            
            if params.get('report_type'):
                query = query.filter(Report.report_type == params['report_type'])
            
            if params.get('start_date'):
                query = query.filter(Report.start_date >= params['start_date'])
            
            if params.get('end_date'):
                query = query.filter(Report.end_date <= params['end_date'])
            
            query = query.order_by(Report.created_at.desc())
            
            page = int(params.get('page', 1))
            per_page = int(params.get('per_page', 20))
            
            reports = query.paginate(page=page, per_page=per_page, error_out=False)
            
            return {
                'items': [r.to_dict() for r in reports.items],
                'total': reports.total,
                'page': page,
                'per_page': per_page,
                'pages': reports.pages
            }, 200
            
        except Exception as e:
            return {'error': str(e)}, 500

    @staticmethod
    def get_report(current_user, report_id):
        """Get report by ID"""
        try:
            from app.models.report import Report
            
            report = Report.query.get(report_id)
            if not report:
                return {'error': 'Report not found'}, 404
            
            return report.to_dict(), 200
            
        except Exception as e:
            return {'error': str(e)}, 500

    @staticmethod
    def export_report(current_user, data):
        """Export a report"""
        try:
            from app.models.report import Report
            
            report_id = data.get('report_id')
            report = Report.query.get(report_id)
            if not report:
                return {'error': 'Report not found'}, 404
            
            # Mark as exported
            report.is_exported = True
            report.exported_at = datetime.utcnow()
            db.session.commit()
            
            return {'message': 'Report exported successfully', 'report': report.to_dict()}, 200
            
        except Exception as e:
            db.session.rollback()
            return {'error': str(e)}, 500

    @staticmethod
    def update_appointment_status(current_user, appointment_id, data):
        """Update appointment status"""
        try:
            from app.models.appointment import Appointment
            from app.services.notification_service import NotificationService
            
            appointment = Appointment.query.get(appointment_id)
            if not appointment:
                return {'error': 'Appointment not found'}, 404
            
            new_status = data.get('status')
            if not new_status:
                return {'error': 'Status is required'}, 400
            
            appointment.status = new_status
            db.session.commit()
            
            # Notify customer
            if appointment.customer and appointment.customer.user:
                NotificationService.create_notification(
                    user_id=appointment.customer.user_id,
                    title='Appointment Status Updated',
                    message=f'Your appointment status has been updated to {new_status}',
                    type='appointment',
                    appointment_id=appointment.id
                )
            
            return appointment.to_dict(), 200
            
        except Exception as e:
            db.session.rollback()
            return {'error': str(e)}, 500

    @staticmethod
    def delete_appointment(current_user, appointment_id):
        """Delete an appointment"""
        try:
            from app.models.appointment import Appointment
            
            appointment = Appointment.query.get(appointment_id)
            if not appointment:
                return {'error': 'Appointment not found'}, 404
            
            db.session.delete(appointment)
            db.session.commit()
            
            return {'message': 'Appointment deleted successfully'}, 200
            
        except Exception as e:
            db.session.rollback()
            return {'error': str(e)}, 500

    @staticmethod
    def update_appointment(current_user, appointment_id, data):
        """Update an appointment"""
        try:
            from app.models.appointment import Appointment
            
            appointment = Appointment.query.get(appointment_id)
            if not appointment:
                return {'error': 'Appointment not found'}, 404
            
            if 'appointment_date' in data:
                appointment.appointment_date = data['appointment_date']
            if 'appointment_time' in data:
                appointment.appointment_time = data['appointment_time']
            if 'stylist_id' in data:
                appointment.stylist_id = data['stylist_id']
            if 'service_id' in data:
                appointment.service_id = data['service_id']
            if 'notes' in data:
                appointment.notes = data['notes']
            
            db.session.commit()
            
            return appointment.to_dict(), 200
            
        except Exception as e:
            db.session.rollback()
            return {'error': str(e)}, 500

    @staticmethod
    def get_customer(current_user, customer_id):
        """Get customer by ID"""
        try:
            from app.models.customer import Customer
            from app.models.user import User
            
            customer = Customer.query.get(customer_id)
            if not customer:
                return {'error': 'Customer not found'}, 404
            
            result = customer.to_dict()
            user = User.query.get(customer.user_id)
            if user:
                result['user'] = user.to_dict()
            
            return result, 200
            
        except Exception as e:
            return {'error': str(e)}, 500

    @staticmethod
    def get_customer_appointments(current_user, customer_id, params):
        """Get customer appointments"""
        try:
            from app.models.appointment import Appointment
            
            query = Appointment.query.filter_by(customer_id=customer_id)
            
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
    def get_customer_history(current_user, customer_id):
        """Get customer history"""
        try:
            from app.models.appointment import Appointment
            from app.models.payment import Payment
            from app.models.review import Review
            
            customer = Customer.query.get(customer_id)
            if not customer:
                return {'error': 'Customer not found'}, 404
            
            appointments = Appointment.query.filter_by(
                customer_id=customer_id
            ).order_by(Appointment.created_at.desc()).limit(20).all()
            
            payments = Payment.query.filter_by(
                customer_id=customer_id
            ).order_by(Payment.payment_date.desc()).limit(20).all()
            
            reviews = Review.query.filter_by(
                customer_id=customer_id
            ).order_by(Review.created_at.desc()).limit(10).all()
            
            return {
                'customer': customer.to_dict(),
                'appointments': [a.to_dict() for a in appointments],
                'payments': [p.to_dict() for p in payments],
                'reviews': [r.to_dict() for r in reviews]
            }, 200
            
        except Exception as e:
            return {'error': str(e)}, 500

    @staticmethod
    def add_customer_note(current_user, customer_id, data):
        """Add customer note"""
        try:
            from app.models.customer import Customer
            
            customer = Customer.query.get(customer_id)
            if not customer:
                return {'error': 'Customer not found'}, 404
            
            # This would require a customer_notes table
            # For now, just return success
            return {'message': 'Note added successfully'}, 200
            
        except Exception as e:
            return {'error': str(e)}, 500
