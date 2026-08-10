from datetime import datetime, timedelta
from flask import current_app
from app.extensions import db
from app.models.appointment import Appointment
from app.models.customer import Customer
from app.models.service import Service
from app.models.stylist import Stylist
from app.models.branch import Branch
from app.models.payment import Payment
from app.services.notification_service import NotificationService
from app.services.email_service import EmailService

class AppointmentService:
    
    @staticmethod
    def create_appointment(data, customer_id):
        """Create a new appointment"""
        try:
            # Validate customer
            customer = Customer.query.get(customer_id)
            if not customer:
                return {'error': 'Customer not found'}, 404
            
            # Validate service
            service = Service.query.get(data.get('service_id'))
            if not service:
                return {'error': 'Service not found'}, 404
            
            # Validate branch
            branch = Branch.query.get(data.get('branch_id'))
            if not branch:
                return {'error': 'Branch not found'}, 404
            
            # Check availability
            appointment_date = datetime.strptime(data['appointment_date'], '%Y-%m-%d').date()
            appointment_time = datetime.strptime(data['appointment_time'], '%H:%M').time()
            
            # Check if time slot is available
            is_available = AppointmentService._check_availability(
                data.get('branch_id'),
                data.get('stylist_id'),
                appointment_date,
                appointment_time,
                service.duration_minutes
            )
            
            if not is_available:
                return {'error': 'Time slot not available'}, 409
            
            # Calculate end time
            start_datetime = datetime.combine(appointment_date, appointment_time)
            end_datetime = start_datetime + timedelta(minutes=service.duration_minutes)
            
            # Calculate amounts
            total_amount = service.price
            discount_amount = AppointmentService._calculate_discount(service, data.get('promotion_code'))
            final_amount = total_amount - discount_amount
            
            # Create appointment
            appointment = Appointment(
                customer_id=customer_id,
                service_id=service.id,
                stylist_id=data.get('stylist_id'),
                branch_id=branch.id,
                appointment_date=appointment_date,
                appointment_time=appointment_time,
                end_time=end_datetime.time(),
                status='pending',
                notes=data.get('notes'),
                customer_notes=data.get('customer_notes'),
                is_walk_in=data.get('is_walk_in', False),
                total_amount=total_amount,
                discount_amount=discount_amount,
                final_amount=final_amount
            )
            
            db.session.add(appointment)
            db.session.flush()
            
            # Create notification for receptionist
            from app.models.receptionist import Receptionist
            receptionist = Receptionist.query.filter_by(branch_id=branch.id, is_active=True).first()
            if receptionist:
                NotificationService.create_notification(
                    user_id=receptionist.user_id,
                    title='New Appointment Request',
                    message=f'New appointment request from {customer.user.full_name} for {service.name}',
                    type='appointment',
                    appointment_id=appointment.id
                )
            
            # Send confirmation email to customer
            EmailService.send_appointment_confirmation(
                customer.user.email,
                customer.user.full_name,
                appointment
            )
            
            db.session.commit()
            
            return appointment.to_dict(), 201
            
        except Exception as e:
            db.session.rollback()
            return {'error': str(e)}, 500
    
    @staticmethod
    def _check_availability(branch_id, stylist_id, date, time, duration_minutes):
        """Check if time slot is available"""
        try:
            # Calculate end time
            start_datetime = datetime.combine(date, time)
            end_datetime = start_datetime + timedelta(minutes=duration_minutes)
            
            # Check existing appointments
            query = Appointment.query.filter(
                Appointment.branch_id == branch_id,
                Appointment.appointment_date == date,
                Appointment.status.in_(['pending', 'approved', 'confirmed', 'checked_in', 'in_progress'])
            )
            
            if stylist_id:
                query = query.filter(Appointment.stylist_id == stylist_id)
            
            existing = query.all()
            
            for existing_appt in existing:
                existing_start = datetime.combine(date, existing_appt.appointment_time)
                existing_end = datetime.combine(date, existing_appt.end_time) if existing_appt.end_time else existing_start + timedelta(minutes=30)
                
                # Check for overlap
                if start_datetime < existing_end and end_datetime > existing_start:
                    return False
            
            return True
            
        except Exception as e:
            print(f"Error checking availability: {e}")
            return False
    
    @staticmethod
    def _calculate_discount(service, promotion_code):
        """Calculate discount based on promotion"""
        # Implement discount logic
        return 0.0
    
    @staticmethod
    def get_appointments(filters):
        """Get appointments with filters"""
        try:
            query = Appointment.query
            
            if filters.get('customer_id'):
                query = query.filter(Appointment.customer_id == filters['customer_id'])
            
            if filters.get('branch_id'):
                query = query.filter(Appointment.branch_id == filters['branch_id'])
            
            if filters.get('stylist_id'):
                query = query.filter(Appointment.stylist_id == filters['stylist_id'])
            
            if filters.get('status'):
                query = query.filter(Appointment.status == filters['status'])
            
            if filters.get('start_date'):
                query = query.filter(Appointment.appointment_date >= filters['start_date'])
            
            if filters.get('end_date'):
                query = query.filter(Appointment.appointment_date <= filters['end_date'])
            
            # Order by date and time
            query = query.order_by(Appointment.appointment_date.desc(), Appointment.appointment_time.desc())
            
            # Pagination
            page = filters.get('page', 1)
            per_page = filters.get('per_page', 20)
            
            appointments = query.paginate(page=page, per_page=per_page, error_out=False)
            
            return {
                'items': [appt.to_dict() for appt in appointments.items],
                'total': appointments.total,
                'page': page,
                'per_page': per_page,
                'pages': appointments.pages
            }, 200
            
        except Exception as e:
            return {'error': str(e)}, 500
    
    @staticmethod
    def get_appointment(appointment_id):
        """Get appointment by ID"""
        try:
            appointment = Appointment.query.get(appointment_id)
            if not appointment:
                return {'error': 'Appointment not found'}, 404
            
            return appointment.to_dict(), 200
            
        except Exception as e:
            return {'error': str(e)}, 500
    
    @staticmethod
    def update_appointment(appointment_id, data, user):
        """Update appointment"""
        try:
            appointment = Appointment.query.get(appointment_id)
            if not appointment:
                return {'error': 'Appointment not found'}, 404
            
            # Check permissions
            if user.role.name == 'customer' and appointment.customer_id != user.id:
                return {'error': 'Unauthorized'}, 403
            
            # Update fields
            if 'appointment_date' in data:
                appointment.appointment_date = datetime.strptime(data['appointment_date'], '%Y-%m-%d').date()
            if 'appointment_time' in data:
                appointment.appointment_time = datetime.strptime(data['appointment_time'], '%H:%M').time()
            if 'notes' in data:
                appointment.notes = data['notes']
            if 'status' in data and user.role.name != 'customer':
                appointment.status = data['status']
            
            db.session.commit()
            
            # Send notification for status change
            if 'status' in data:
                NotificationService.create_notification(
                    user_id=appointment.customer.user_id,
                    title='Appointment Status Updated',
                    message=f'Your appointment status has been updated to {data["status"]}',
                    type='appointment',
                    appointment_id=appointment.id
                )
            
            return appointment.to_dict(), 200
            
        except Exception as e:
            db.session.rollback()
            return {'error': str(e)}, 500
    
    @staticmethod
    def cancel_appointment(appointment_id, user, reason=None):
        """Cancel appointment"""
        try:
            appointment = Appointment.query.get(appointment_id)
            if not appointment:
                return {'error': 'Appointment not found'}, 404
            
            # Check permissions
            if user.role.name == 'customer' and appointment.customer_id != user.id:
                return {'error': 'Unauthorized'}, 403
            
            appointment.status = 'cancelled'
            appointment.notes = (appointment.notes or '') + f'\nCancelled by {user.full_name}. Reason: {reason}'
            
            db.session.commit()
            
            # Send cancellation notification
            NotificationService.create_notification(
                user_id=appointment.customer.user_id,
                title='Appointment Cancelled',
                message=f'Your appointment has been cancelled. Reason: {reason}',
                type='appointment',
                appointment_id=appointment.id
            )
            
            return {'message': 'Appointment cancelled successfully'}, 200
            
        except Exception as e:
            db.session.rollback()
            return {'error': str(e)}, 500
    
    @staticmethod
    def check_in(appointment_id, user):
        """Check in customer"""
        try:
            appointment = Appointment.query.get(appointment_id)
            if not appointment:
                return {'error': 'Appointment not found'}, 404
            
            appointment.status = 'checked_in'
            appointment.check_in_time = datetime.utcnow()
            
            db.session.commit()
            
            return {'message': 'Customer checked in successfully'}, 200
            
        except Exception as e:
            db.session.rollback()
            return {'error': str(e)}, 500
    
    @staticmethod
    def complete_appointment(appointment_id, user):
        """Mark appointment as completed"""
        try:
            appointment = Appointment.query.get(appointment_id)
            if not appointment:
                return {'error': 'Appointment not found'}, 404
            
            appointment.status = 'completed'
            appointment.completion_time = datetime.utcnow()
            
            # Update customer stats
            customer = Customer.query.get(appointment.customer_id)
            if customer:
                customer.total_visits += 1
                customer.total_spent += appointment.final_amount
            
            db.session.commit()
            
            return {'message': 'Appointment completed successfully'}, 200
            
        except Exception as e:
            db.session.rollback()
            return {'error': str(e)}, 500
    
    @staticmethod
    def get_available_slots(data):
        """Get available time slots - FIXED VERSION"""
        try:
            branch_id = data.get('branch_id')
            service_id = data.get('service_id')
            stylist_id = data.get('stylist_id')
            
            # Validate required fields
            if not branch_id or not service_id or not data.get('date'):
                return {'error': 'Missing required parameters: branch_id, service_id, date'}, 400
            
            date = datetime.strptime(data['date'], '%Y-%m-%d').date()
            
            service = Service.query.get(service_id)
            if not service:
                return {'error': 'Service not found'}, 404
            
            branch = Branch.query.get(branch_id)
            if not branch:
                return {'error': 'Branch not found'}, 404
            
            # Generate time slots
            slots = AppointmentService._generate_time_slots(
                branch, service.duration_minutes, date, stylist_id
            )
            
            return {
                'slots': slots,
                'date': date.isoformat(),
                'branch': branch.name,
                'service': service.name,
                'duration': service.duration_minutes
            }, 200
            
        except Exception as e:
            print(f"Error in get_available_slots: {e}")
            return {'error': str(e)}, 500
    
    @staticmethod
    def _generate_time_slots(branch, duration_minutes, date, stylist_id=None):
        """Generate available time slots - FIXED VERSION"""
        try:
            slots = []
            
            # Get branch opening and closing times
            opening_time = branch.opening_time
            closing_time = branch.closing_time
            
            if not opening_time or not closing_time:
                print(f"Branch {branch.id} has no opening/closing time set")
                return slots
            
            # Convert to datetime for calculations
            opening_datetime = datetime.combine(date, opening_time)
            closing_datetime = datetime.combine(date, closing_time)
            
            # Subtract duration from closing time to get last possible start time
            last_start = closing_datetime - timedelta(minutes=duration_minutes)
            
            # Generate 15-minute interval slots
            current_time = opening_datetime
            while current_time <= last_start:
                current_time_slot = current_time.time()
                
                # Check availability
                is_available = AppointmentService._check_availability(
                    branch.id,
                    stylist_id,
                    date,
                    current_time_slot,
                    duration_minutes
                )
                
                slots.append({
                    'time': current_time_slot.strftime('%H:%M'),
                    'available': is_available
                })
                
                # Increment by 15 minutes
                current_time = current_time + timedelta(minutes=15)
            
            # If no slots generated, add some default slots
            if not slots:
                print(f"No slots generated for branch {branch.id} on {date}")
                # Add default slots as fallback
                for hour in range(8, 18):  # 8 AM to 6 PM
                    for minute in [0, 15, 30, 45]:
                        time_str = f"{hour:02d}:{minute:02d}"
                        time_obj = datetime.strptime(time_str, '%H:%M').time()
                        slots.append({
                            'time': time_str,
                            'available': True
                        })
            
            return slots
            
        except Exception as e:
            print(f"Error generating time slots: {e}")
            # Return some default slots as fallback
            return [
                {'time': '08:00', 'available': True},
                {'time': '08:15', 'available': True},
                {'time': '08:30', 'available': True},
                {'time': '08:45', 'available': True},
                {'time': '09:00', 'available': True},
                {'time': '09:15', 'available': True},
                {'time': '09:30', 'available': True},
                {'time': '09:45', 'available': True},
                {'time': '10:00', 'available': True},
                {'time': '10:15', 'available': True},
                {'time': '10:30', 'available': True},
                {'time': '10:45', 'available': True},
                {'time': '11:00', 'available': True},
                {'time': '11:15', 'available': True},
                {'time': '11:30', 'available': True},
                {'time': '11:45', 'available': True},
                {'time': '12:00', 'available': True},
                {'time': '12:15', 'available': True},
                {'time': '12:30', 'available': True},
                {'time': '12:45', 'available': True},
                {'time': '13:00', 'available': True},
                {'time': '13:15', 'available': True},
                {'time': '13:30', 'available': True},
                {'time': '13:45', 'available': True},
                {'time': '14:00', 'available': True},
                {'time': '14:15', 'available': True},
                {'time': '14:30', 'available': True},
                {'time': '14:45', 'available': True},
                {'time': '15:00', 'available': True},
                {'time': '15:15', 'available': True},
                {'time': '15:30', 'available': True},
                {'time': '15:45', 'available': True},
                {'time': '16:00', 'available': True},
                {'time': '16:15', 'available': True},
                {'time': '16:30', 'available': True},
                {'time': '16:45', 'available': True},
                {'time': '17:00', 'available': True},
                {'time': '17:15', 'available': True},
                {'time': '17:30', 'available': True},
                {'time': '17:45', 'available': True},
                {'time': '18:00', 'available': True},
                {'time': '18:15', 'available': True},
                {'time': '18:30', 'available': True},
                {'time': '18:45', 'available': True},
                {'time': '19:00', 'available': True}
            ]
    
    @staticmethod
    def reschedule_appointment(appointment_id, data, user):
        """Reschedule an appointment"""
        try:
            appointment = Appointment.query.get(appointment_id)
            if not appointment:
                return {'error': 'Appointment not found'}, 404
            
            # Check permissions
            if user.role.name == 'customer' and appointment.customer_id != user.id:
                return {'error': 'Unauthorized'}, 403
            
            # Update appointment
            if 'appointment_date' in data:
                appointment.appointment_date = datetime.strptime(data['appointment_date'], '%Y-%m-%d').date()
            if 'appointment_time' in data:
                appointment.appointment_time = datetime.strptime(data['appointment_time'], '%H:%M').time()
            if 'stylist_id' in data:
                appointment.stylist_id = data['stylist_id']
            
            appointment.is_rescheduled = True
            appointment.rescheduled_from = appointment_id
            appointment.status = 'pending'
            
            db.session.commit()
            
            # Send notification
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
    def send_reminder(appointment_id):
        """Send appointment reminder"""
        try:
            appointment = Appointment.query.get(appointment_id)
            if not appointment:
                return {'error': 'Appointment not found'}, 404
            
            # Send reminder via email
            if appointment.customer and appointment.customer.user:
                EmailService.send_appointment_reminder(
                    appointment.customer.user.email,
                    appointment.customer.user.full_name,
                    appointment
                )
            
            # Create notification
            NotificationService.create_notification(
                user_id=appointment.customer.user_id,
                title='Appointment Reminder',
                message=f'Reminder: Your appointment is at {appointment.appointment_time} on {appointment.appointment_date}',
                type='reminder',
                appointment_id=appointment.id
            )
            
            return {'message': 'Reminder sent successfully'}, 200
            
        except Exception as e:
            return {'error': str(e)}, 500
    
    @staticmethod
    def get_customer_appointment_history(customer_id, params):
        """Get customer appointment history"""
        try:
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
    def delete_appointment(appointment_id):
        """Delete an appointment (admin only)"""
        try:
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
    def get_appointment_analytics(params):
        """Get appointment analytics"""
        try:
            start_date = params.get('start_date')
            end_date = params.get('end_date')
            branch_id = params.get('branch_id')
            
            query = Appointment.query
            
            if start_date:
                query = query.filter(Appointment.appointment_date >= start_date)
            
            if end_date:
                query = query.filter(Appointment.appointment_date <= end_date)
            
            if branch_id:
                query = query.filter(Appointment.branch_id == branch_id)
            
            total = query.count()
            completed = query.filter_by(status='completed').count()
            cancelled = query.filter_by(status='cancelled').count()
            pending = query.filter_by(status='pending').count()
            
            revenue = db.session.query(db.func.sum(Appointment.final_amount)).filter(
                Appointment.status == 'completed'
            )
            
            if start_date:
                revenue = revenue.filter(Appointment.appointment_date >= start_date)
            if end_date:
                revenue = revenue.filter(Appointment.appointment_date <= end_date)
            if branch_id:
                revenue = revenue.filter(Appointment.branch_id == branch_id)
            
            total_revenue = revenue.scalar() or 0
            
            return {
                'total_appointments': total,
                'completed': completed,
                'cancelled': cancelled,
                'pending': pending,
                'completion_rate': (completed / total * 100) if total > 0 else 0,
                'total_revenue': total_revenue
            }, 200
            
        except Exception as e:
            return {'error': str(e)}, 500
    
    @staticmethod
    def export_appointments(data):
        """Export appointments to file"""
        try:
            return {'message': 'Appointments exported'}, 200
        except Exception as e:
            return {'error': str(e)}, 500
