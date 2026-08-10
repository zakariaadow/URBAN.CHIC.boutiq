from datetime import datetime, timedelta
from flask import current_app
from sqlalchemy import func, desc, or_
from app.extensions import db

# Models
from app.models.user import User
from app.models.customer import Customer
from app.models.stylist import Stylist
from app.models.service import Service
from app.models.appointment import Appointment
from app.models.commission import Commission
from app.models.attendance import Attendance
from app.models.leave_request import LeaveRequest
from app.models.review import Review
from app.models.notification import Notification
from app.models.branch import Branch

# Services
from app.services.notification_service import NotificationService


class StylistService:
    
    @staticmethod
    def get_dashboard(current_user):
        """Get stylist dashboard data - ALL DATA"""
        try:
            stylist = Stylist.query.filter_by(user_id=current_user.id).first()
            if not stylist:
                return {'error': 'Stylist profile not found'}, 404
            
            today = datetime.utcnow().date()
            
            # ALL Appointments
            total_appointments = Appointment.query.filter_by(stylist_id=stylist.id).count()
            
            # Today's appointments
            today_appointments = Appointment.query.filter(
                Appointment.stylist_id == stylist.id,
                Appointment.appointment_date == today,
                Appointment.status.in_(['approved', 'confirmed', 'checked_in', 'in_progress'])
            ).order_by(Appointment.appointment_time.asc()).all()
            
            # ALL Upcoming appointments
            upcoming = Appointment.query.filter(
                Appointment.stylist_id == stylist.id,
                Appointment.appointment_date > today,
                Appointment.status.in_(['approved', 'confirmed'])
            ).order_by(Appointment.appointment_date.asc()).all()
            
            # ALL Completed appointments
            completed = Appointment.query.filter(
                Appointment.stylist_id == stylist.id,
                Appointment.status == 'completed'
            ).all()
            
            # Today's earnings
            today_completed = Appointment.query.filter(
                Appointment.stylist_id == stylist.id,
                Appointment.appointment_date == today,
                Appointment.status == 'completed'
            ).all()
            
            today_earnings = sum(a.final_amount * (stylist.commission_rate or 0.10) for a in today_completed)
            
            # ALL Earnings
            total_earnings = sum(a.final_amount * (stylist.commission_rate or 0.10) for a in completed)
            
            # Pending leave requests
            pending_leave = LeaveRequest.query.filter_by(
                stylist_id=stylist.id,
                status='pending'
            ).count()
            
            # Average rating
            avg_rating = db.session.query(func.avg(Review.rating)).filter_by(
                stylist_id=stylist.id,
                is_approved=True
            ).scalar() or 0
            
            # Total appointments this week
            week_start = today - timedelta(days=today.weekday())
            week_appointments = Appointment.query.filter(
                Appointment.stylist_id == stylist.id,
                Appointment.appointment_date >= week_start,
                Appointment.appointment_date <= today,
                Appointment.status == 'completed'
            ).count()
            
            # Appointments by status
            appointments_by_status = {
                'pending': Appointment.query.filter_by(stylist_id=stylist.id, status='pending').count(),
                'confirmed': Appointment.query.filter_by(stylist_id=stylist.id, status='confirmed').count(),
                'in_progress': Appointment.query.filter_by(stylist_id=stylist.id, status='in_progress').count(),
                'completed': Appointment.query.filter_by(stylist_id=stylist.id, status='completed').count(),
                'cancelled': Appointment.query.filter_by(stylist_id=stylist.id, status='cancelled').count(),
                'no_show': Appointment.query.filter_by(stylist_id=stylist.id, status='no_show').count()
            }
            
            return {
                'stylist': stylist.to_dict(),
                'total_appointments': total_appointments,
                'today_appointments': [a.to_dict() for a in today_appointments],
                'upcoming_appointments': [a.to_dict() for a in upcoming],
                'today_earnings': today_earnings,
                'total_earnings': total_earnings,
                'total_appointments_today': len(today_appointments),
                'week_appointments': week_appointments,
                'pending_leave_requests': pending_leave,
                'average_rating': round(float(avg_rating), 1),
                'total_reviews': Review.query.filter_by(stylist_id=stylist.id, is_approved=True).count(),
                'appointments_by_status': appointments_by_status,
                'completed_today': len(today_completed),
                'completed_appointments': len(completed)
            }, 200
            
        except Exception as e:
            return {'error': str(e)}, 500
    
    @staticmethod
    def get_today_appointments(current_user):
        """Get today's appointments"""
        try:
            stylist = Stylist.query.filter_by(user_id=current_user.id).first()
            if not stylist:
                return {'error': 'Stylist profile not found'}, 404
            
            today = datetime.utcnow().date()
            appointments = Appointment.query.filter(
                Appointment.stylist_id == stylist.id,
                Appointment.appointment_date == today,
                Appointment.status.in_(['approved', 'confirmed', 'checked_in', 'in_progress'])
            ).order_by(Appointment.appointment_time.asc()).all()
            
            return [a.to_dict() for a in appointments], 200
            
        except Exception as e:
            return {'error': str(e)}, 500
    
    @staticmethod
    def get_upcoming_appointments(current_user):
        """Get ALL upcoming appointments"""
        try:
            stylist = Stylist.query.filter_by(user_id=current_user.id).first()
            if not stylist:
                return {'error': 'Stylist profile not found'}, 404
            
            today = datetime.utcnow().date()
            appointments = Appointment.query.filter(
                Appointment.stylist_id == stylist.id,
                Appointment.appointment_date > today,
                Appointment.status.in_(['approved', 'confirmed'])
            ).order_by(Appointment.appointment_date.asc()).all()
            
            return [a.to_dict() for a in appointments], 200
            
        except Exception as e:
            return {'error': str(e)}, 500
    
    @staticmethod
    def get_appointment_history(current_user, params):
        """Get appointment history - ALL"""
        try:
            stylist = Stylist.query.filter_by(user_id=current_user.id).first()
            if not stylist:
                return {'error': 'Stylist profile not found'}, 404
            
            query = Appointment.query.filter_by(stylist_id=stylist.id)
            
            if params.get('status'):
                query = query.filter(Appointment.status == params['status'])
            
            if params.get('start_date'):
                query = query.filter(Appointment.appointment_date >= params['start_date'])
            
            if params.get('end_date'):
                query = query.filter(Appointment.appointment_date <= params['end_date'])
            
            query = query.order_by(Appointment.appointment_date.desc(), Appointment.appointment_time.desc())
            
            page = int(params.get('page', 1))
            per_page = int(params.get('per_page', 10))
            
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
    def get_all_appointments(current_user, params):
        """Get ALL appointments with pagination and filters"""
        try:
            stylist = Stylist.query.filter_by(user_id=current_user.id).first()
            if not stylist:
                return {'error': 'Stylist profile not found'}, 404
            
            query = Appointment.query.filter_by(stylist_id=stylist.id)
            
            # Apply filters
            if params.get('status') and params['status'] != 'all':
                query = query.filter(Appointment.status == params['status'])
            
            if params.get('start_date'):
                query = query.filter(Appointment.appointment_date >= params['start_date'])
            
            if params.get('end_date'):
                query = query.filter(Appointment.appointment_date <= params['end_date'])
            
            if params.get('search'):
                search = params['search']
                query = query.join(Customer).join(User).filter(
                    or_(
                        User.first_name.ilike(f'%{search}%'),
                        User.last_name.ilike(f'%{search}%'),
                        Appointment.notes.ilike(f'%{search}%')
                    )
                )
            
            query = query.order_by(Appointment.appointment_date.desc(), Appointment.appointment_time.desc())
            
            page = int(params.get('page', 1))
            per_page = int(params.get('limit', 10))
            
            total = query.count()
            appointments = query.offset((page - 1) * per_page).limit(per_page).all()
            
            result = []
            for appt in appointments:
                customer = Customer.query.get(appt.customer_id)
                user = User.query.get(customer.user_id) if customer else None
                service = Service.query.get(appt.service_id)
                branch = Branch.query.get(appt.branch_id)
                
                result.append({
                    'id': appt.id,
                    'customer_name': f"{user.first_name} {user.last_name}" if user else 'Walk-in',
                    'customer_email': user.email if user else 'N/A',
                    'service_name': service.name if service else 'N/A',
                    'branch_name': branch.name if branch else 'N/A',
                    'appointment_date': appt.appointment_date.isoformat() if appt.appointment_date else None,
                    'appointment_time': str(appt.appointment_time) if appt.appointment_time else None,
                    'status': appt.status,
                    'final_amount': float(appt.final_amount or 0),
                    'duration': appt.duration,
                    'paid': appt.paid,
                    'created_at': appt.created_at.isoformat() if appt.created_at else None
                })
            
            return {
                'appointments': result,
                'total': total,
                'page': page,
                'limit': per_page,
                'pages': (total + per_page - 1) // per_page if total > 0 else 1
            }, 200
            
        except Exception as e:
            return {'error': str(e)}, 500
    
    @staticmethod
    def get_appointment(current_user, appointment_id):
        """Get appointment details"""
        try:
            stylist = Stylist.query.filter_by(user_id=current_user.id).first()
            if not stylist:
                return {'error': 'Stylist profile not found'}, 404
            
            appointment = Appointment.query.filter_by(
                id=appointment_id,
                stylist_id=stylist.id
            ).first()
            
            if not appointment:
                return {'error': 'Appointment not found'}, 404
            
            return appointment.to_dict(), 200
            
        except Exception as e:
            return {'error': str(e)}, 500
    
    @staticmethod
    def accept_appointment(current_user, appointment_id):
        """Accept an appointment"""
        try:
            stylist = Stylist.query.filter_by(user_id=current_user.id).first()
            if not stylist:
                return {'error': 'Stylist profile not found'}, 404
            
            appointment = Appointment.query.filter_by(
                id=appointment_id,
                stylist_id=stylist.id
            ).first()
            
            if not appointment:
                return {'error': 'Appointment not found'}, 404
            
            appointment.status = 'confirmed'
            db.session.commit()
            
            # Notify customer
            if appointment.customer and appointment.customer.user:
                NotificationService.create_notification(
                    user_id=appointment.customer.user_id,
                    title='Appointment Confirmed',
                    message=f'Your appointment with {current_user.first_name} has been confirmed.',
                    type='appointment',
                    appointment_id=appointment.id
                )
            
            return appointment.to_dict(), 200
            
        except Exception as e:
            db.session.rollback()
            return {'error': str(e)}, 500
    
    @staticmethod
    def decline_appointment(current_user, appointment_id, data):
        """Decline an appointment"""
        try:
            stylist = Stylist.query.filter_by(user_id=current_user.id).first()
            if not stylist:
                return {'error': 'Stylist profile not found'}, 404
            
            appointment = Appointment.query.filter_by(
                id=appointment_id,
                stylist_id=stylist.id
            ).first()
            
            if not appointment:
                return {'error': 'Appointment not found'}, 404
            
            appointment.status = 'pending'
            appointment.stylist_id = None
            appointment.stylist_notes = data.get('reason', 'Declined by stylist')
            db.session.commit()
            
            # Notify customer
            if appointment.customer and appointment.customer.user:
                NotificationService.create_notification(
                    user_id=appointment.customer.user_id,
                    title='Appointment Declined',
                    message=f'Your appointment has been declined. Reason: {data.get("reason", "Not specified")}',
                    type='appointment',
                    appointment_id=appointment.id
                )
            
            return {'message': 'Appointment declined'}, 200
            
        except Exception as e:
            db.session.rollback()
            return {'error': str(e)}, 500
    
    @staticmethod
    def update_customer_notes(current_user, appointment_id, data):
        """Update customer notes"""
        try:
            stylist = Stylist.query.filter_by(user_id=current_user.id).first()
            if not stylist:
                return {'error': 'Stylist profile not found'}, 404
            
            appointment = Appointment.query.filter_by(
                id=appointment_id,
                stylist_id=stylist.id
            ).first()
            
            if not appointment:
                return {'error': 'Appointment not found'}, 404
            
            appointment.stylist_notes = data.get('notes')
            db.session.commit()
            
            return appointment.to_dict(), 200
            
        except Exception as e:
            db.session.rollback()
            return {'error': str(e)}, 500
    
    @staticmethod
    def update_service_progress(current_user, appointment_id, data):
        """Update service progress"""
        try:
            stylist = Stylist.query.filter_by(user_id=current_user.id).first()
            if not stylist:
                return {'error': 'Stylist profile not found'}, 404
            
            appointment = Appointment.query.filter_by(
                id=appointment_id,
                stylist_id=stylist.id
            ).first()
            
            if not appointment:
                return {'error': 'Appointment not found'}, 404
            
            appointment.status = data.get('status', 'in_progress')
            appointment.stylist_notes = data.get('notes', appointment.stylist_notes)
            
            if data.get('status') == 'in_progress' and not appointment.start_time:
                appointment.start_time = datetime.utcnow()
            
            db.session.commit()
            
            return appointment.to_dict(), 200
            
        except Exception as e:
            db.session.rollback()
            return {'error': str(e)}, 500
    
    @staticmethod
    def upload_photos(current_user, appointment_id, files):
        """Upload before/after photos"""
        try:
            import os
            import uuid
            
            stylist = Stylist.query.filter_by(user_id=current_user.id).first()
            if not stylist:
                return {'error': 'Stylist profile not found'}, 404
            
            appointment = Appointment.query.filter_by(
                id=appointment_id,
                stylist_id=stylist.id
            ).first()
            
            if not appointment:
                return {'error': 'Appointment not found'}, 404
            
            uploaded = []
            for key in ['before_photos', 'after_photos']:
                if key in files:
                    file = files[key]
                    if file and file.filename:
                        # Generate filename
                        filename = f"{key}_{appointment_id}_{uuid.uuid4().hex[:8]}.{file.filename.rsplit('.', 1)[1].lower()}"
                        
                        # Save file
                        upload_path = os.path.join(current_app.config['UPLOAD_FOLDER'], 'before_after')
                        os.makedirs(upload_path, exist_ok=True)
                        file_path = os.path.join(upload_path, filename)
                        file.save(file_path)
                        
                        photo_url = f"/uploads/before_after/{filename}"
                        uploaded.append(photo_url)
                        
                        if key == 'before_photos':
                            if not appointment.before_photos:
                                appointment.before_photos = []
                            appointment.before_photos.append(photo_url)
                        else:
                            if not appointment.after_photos:
                                appointment.after_photos = []
                            appointment.after_photos.append(photo_url)
            
            db.session.commit()
            
            return {
                'before_photos': appointment.before_photos,
                'after_photos': appointment.after_photos
            }, 200
            
        except Exception as e:
            db.session.rollback()
            return {'error': str(e)}, 500
    
    @staticmethod
    def mark_completed(current_user, appointment_id):
        """Mark service as completed and create commission once"""
        try:
            stylist = Stylist.query.filter_by(user_id=current_user.id).first()
            if not stylist:
                return {'error': 'Stylist profile not found'}, 404
            
            appointment = Appointment.query.filter_by(
                id=appointment_id,
                stylist_id=stylist.id
            ).first()
            
            if not appointment:
                return {'error': 'Appointment not found'}, 404
            
            # Prevent completing an already completed appointment
            if appointment.status == 'completed':
                return {'error': 'Appointment is already completed'}, 400
            
            # Mark completed
            appointment.status = 'completed'
            appointment.completion_time = datetime.utcnow()
            
            # Commission rate
            commission_rate = stylist.commission_rate if stylist.commission_rate is not None else 0.10
            final_amount = float(appointment.final_amount or 0)
            commission_amount = final_amount * commission_rate
            
            # Prevent duplicate commission
            existing_commission = Commission.query.filter_by(
                appointment_id=appointment.id
            ).first()
            
            if not existing_commission:
                commission = Commission(
                    stylist_id=stylist.id,
                    appointment_id=appointment.id,
                    service_amount=final_amount,
                    commission_rate=commission_rate,
                    commission_amount=commission_amount,
                    period='daily',
                    period_start=datetime.utcnow().date(),
                    period_end=datetime.utcnow().date()
                )
                db.session.add(commission)
            
            db.session.commit()
            
            # Notify customer
            if appointment.customer and appointment.customer.user:
                NotificationService.create_notification(
                    user_id=appointment.customer.user_id,
                    title='Service Completed',
                    message='Your service has been completed.',
                    type='appointment',
                    appointment_id=appointment.id
                )
            
            return {
                'message': 'Service marked as completed',
                'appointment': appointment.to_dict(),
                'commission_amount': commission_amount
            }, 200
            
        except Exception as e:
            db.session.rollback()
            return {'error': str(e)}, 500
    
    @staticmethod
    def cancel_appointment(current_user, appointment_id, data):
        """Cancel appointment"""
        try:
            stylist = Stylist.query.filter_by(user_id=current_user.id).first()
            if not stylist:
                return {'error': 'Stylist profile not found'}, 404
            
            appointment = Appointment.query.filter_by(
                id=appointment_id,
                stylist_id=stylist.id
            ).first()
            
            if not appointment:
                return {'error': 'Appointment not found'}, 404
            
            appointment.status = 'cancelled'
            appointment.stylist_notes = data.get('reason', 'Cancelled by stylist')
            db.session.commit()
            
            # Notify customer
            if appointment.customer and appointment.customer.user:
                NotificationService.create_notification(
                    user_id=appointment.customer.user_id,
                    title='Appointment Cancelled',
                    message=f'Your appointment has been cancelled by the stylist.',
                    type='appointment',
                    appointment_id=appointment.id
                )
            
            return {'message': 'Appointment cancelled'}, 200
            
        except Exception as e:
            db.session.rollback()
            return {'error': str(e)}, 500
    
    @staticmethod
    def get_earnings(current_user, params):
        """Get stylist earnings - ALL"""
        try:
            stylist = Stylist.query.filter_by(user_id=current_user.id).first()
            if not stylist:
                return {'error': 'Stylist profile not found'}, 404
            
            query = Commission.query.filter_by(stylist_id=stylist.id)
            
            if params.get('start_date'):
                query = query.filter(Commission.period_start >= params['start_date'])
            
            if params.get('end_date'):
                query = query.filter(Commission.period_end <= params['end_date'])
            
            if params.get('is_paid') is not None:
                query = query.filter(Commission.is_paid == params['is_paid'])
            
            query = query.order_by(Commission.created_at.desc())
            
            page = int(params.get('page', 1))
            per_page = int(params.get('per_page', 10))
            
            commissions = query.paginate(page=page, per_page=per_page, error_out=False)
            
            total_earnings = db.session.query(func.sum(Commission.commission_amount)).filter_by(
                stylist_id=stylist.id,
                is_paid=True
            ).scalar() or 0
            
            pending_earnings = db.session.query(func.sum(Commission.commission_amount)).filter_by(
                stylist_id=stylist.id,
                is_paid=False
            ).scalar() or 0
            
            return {
                'items': [c.to_dict() for c in commissions.items],
                'total': commissions.total,
                'page': page,
                'per_page': per_page,
                'pages': commissions.pages,
                'summary': {
                    'total_earnings': total_earnings,
                    'pending_earnings': pending_earnings
                }
            }, 200
            
        except Exception as e:
            return {'error': str(e)}, 500
    
    @staticmethod
    def get_earnings_summary(current_user):
        """Get earnings summary"""
        try:
            stylist = Stylist.query.filter_by(user_id=current_user.id).first()
            if not stylist:
                return {'error': 'Stylist profile not found'}, 404
            
            today = datetime.utcnow().date()
            week_start = today - timedelta(days=today.weekday())
            month_start = datetime(today.year, today.month, 1).date()
            
            # This week
            week_earnings = db.session.query(func.sum(Commission.commission_amount)).filter(
                Commission.stylist_id == stylist.id,
                Commission.period_start >= week_start,
                Commission.is_paid == True
            ).scalar() or 0
            
            # This month
            month_earnings = db.session.query(func.sum(Commission.commission_amount)).filter(
                Commission.stylist_id == stylist.id,
                Commission.period_start >= month_start,
                Commission.is_paid == True
            ).scalar() or 0
            
            return {
                'this_week': week_earnings,
                'this_month': month_earnings,
                'total_earnings': db.session.query(func.sum(Commission.commission_amount)).filter_by(
                    stylist_id=stylist.id,
                    is_paid=True
                ).scalar() or 0,
                'pending_earnings': db.session.query(func.sum(Commission.commission_amount)).filter_by(
                    stylist_id=stylist.id,
                    is_paid=False
                ).scalar() or 0
            }, 200
            
        except Exception as e:
            return {'error': str(e)}, 500
    
    @staticmethod
    def get_commission(current_user, params):
        """Get stylist commission"""
        return StylistService.get_earnings(current_user, params)
    
    @staticmethod
    def get_commission_rate(current_user):
        """Get commission rate"""
        try:
            stylist = Stylist.query.filter_by(user_id=current_user.id).first()
            if not stylist:
                return {'error': 'Stylist profile not found'}, 404
            
            return {
                'commission_rate': stylist.commission_rate or 0.10,
                'base_rate': 0.10
            }, 200
            
        except Exception as e:
            return {'error': str(e)}, 500
    
    @staticmethod
    def get_schedule(current_user, params):
        """Get stylist work schedule"""
        try:
            stylist = Stylist.query.filter_by(user_id=current_user.id).first()
            if not stylist:
                return {'error': 'Stylist profile not found'}, 404
            
            # Get branch working hours
            branch = Branch.query.get(stylist.branch_id)
            if not branch:
                return {'error': 'Branch not found'}, 404
            
            return {
                'branch': branch.to_dict(),
                'stylist': stylist.to_dict()
            }, 200
            
        except Exception as e:
            return {'error': str(e)}, 500
    
    @staticmethod
    def update_schedule(current_user, data):
        """Update work schedule"""
        try:
            stylist = Stylist.query.filter_by(user_id=current_user.id).first()
            if not stylist:
                return {'error': 'Stylist profile not found'}, 404
            
            if 'is_available' in data:
                stylist.is_available = data['is_available']
                db.session.commit()
            
            return {'message': 'Schedule updated'}, 200
            
        except Exception as e:
            db.session.rollback()
            return {'error': str(e)}, 500
    
    @staticmethod
    def get_weekly_schedule(current_user):
        """Get weekly schedule"""
        try:
            stylist = Stylist.query.filter_by(user_id=current_user.id).first()
            if not stylist:
                return {'error': 'Stylist profile not found'}, 404
            
            today = datetime.utcnow().date()
            week_start = today - timedelta(days=today.weekday())
            
            # Get appointments for the week
            appointments = Appointment.query.filter(
                Appointment.stylist_id == stylist.id,
                Appointment.appointment_date >= week_start,
                Appointment.appointment_date <= today + timedelta(days=6),
                Appointment.status.in_(['approved', 'confirmed', 'checked_in', 'in_progress', 'completed'])
            ).order_by(Appointment.appointment_date.asc(), Appointment.appointment_time.asc()).all()
            
            # Group by day
            schedule = {}
            for i in range(7):
                day = week_start + timedelta(days=i)
                schedule[day.isoformat()] = []
            
            for appointment in appointments:
                day = appointment.appointment_date.isoformat()
                if day in schedule:
                    schedule[day].append(appointment.to_dict())
            
            return schedule, 200
            
        except Exception as e:
            return {'error': str(e)}, 500
    
    @staticmethod
    def update_availability(current_user, data):
        """Update availability"""
        try:
            stylist = Stylist.query.filter_by(user_id=current_user.id).first()
            if not stylist:
                return {'error': 'Stylist profile not found'}, 404
            
            stylist.is_available = data.get('is_available', True)
            db.session.commit()
            
            return {'message': 'Availability updated'}, 200
            
        except Exception as e:
            db.session.rollback()
            return {'error': str(e)}, 500
    
    @staticmethod
    def request_leave(current_user, data):
        """Request leave"""
        try:
            stylist = Stylist.query.filter_by(user_id=current_user.id).first()
            if not stylist:
                return {'error': 'Stylist profile not found'}, 404
            
            leave_request = LeaveRequest(
                stylist_id=stylist.id,
                branch_id=stylist.branch_id,
                leave_type=data.get('leave_type', 'annual'),
                start_date=data['start_date'],
                end_date=data['end_date'],
                reason=data.get('reason'),
                status='pending'
            )
            
            db.session.add(leave_request)
            db.session.commit()
            
            # Notify manager
            from app.models.manager import Manager
            manager = Manager.query.filter_by(branch_id=stylist.branch_id).first()
            if manager:
                NotificationService.create_notification(
                    user_id=manager.user_id,
                    title='Leave Request',
                    message=f'{current_user.first_name} has requested leave from {data["start_date"]} to {data["end_date"]}',
                    type='system'
                )
            
            return leave_request.to_dict(), 201
            
        except Exception as e:
            db.session.rollback()
            return {'error': str(e)}, 500
    
    @staticmethod
    def get_leave_request(current_user, request_id):
        """Get leave request status"""
        try:
            stylist = Stylist.query.filter_by(user_id=current_user.id).first()
            if not stylist:
                return {'error': 'Stylist profile not found'}, 404
            
            leave_request = LeaveRequest.query.filter_by(
                id=request_id,
                stylist_id=stylist.id
            ).first()
            
            if not leave_request:
                return {'error': 'Leave request not found'}, 404
            
            return leave_request.to_dict(), 200
            
        except Exception as e:
            return {'error': str(e)}, 500
    
    @staticmethod
    def get_leave_requests(current_user):
        """Get ALL leave requests"""
        try:
            stylist = Stylist.query.filter_by(user_id=current_user.id).first()
            if not stylist:
                return {'error': 'Stylist profile not found'}, 404
            
            leave_requests = LeaveRequest.query.filter_by(
                stylist_id=stylist.id
            ).order_by(LeaveRequest.created_at.desc()).all()
            
            return [l.to_dict() for l in leave_requests], 200
            
        except Exception as e:
            return {'error': str(e)}, 500
    
    @staticmethod
    def cancel_leave_request(current_user, request_id):
        """Cancel leave request"""
        try:
            stylist = Stylist.query.filter_by(user_id=current_user.id).first()
            if not stylist:
                return {'error': 'Stylist profile not found'}, 404
            
            leave_request = LeaveRequest.query.filter_by(
                id=request_id,
                stylist_id=stylist.id
            ).first()
            
            if not leave_request:
                return {'error': 'Leave request not found'}, 404
            
            if leave_request.status != 'pending':
                return {'error': 'Only pending requests can be cancelled'}, 400
            
            leave_request.status = 'cancelled'
            db.session.commit()
            
            return {'message': 'Leave request cancelled'}, 200
            
        except Exception as e:
            db.session.rollback()
            return {'error': str(e)}, 500
    
    @staticmethod
    def get_performance_stats(current_user):
        """Get performance statistics - ALL"""
        try:
            stylist = Stylist.query.filter_by(user_id=current_user.id).first()
            if not stylist:
                return {'error': 'Stylist profile not found'}, 404
            
            # Total appointments
            total = Appointment.query.filter_by(stylist_id=stylist.id).count()
            
            # Completed appointments
            completed = Appointment.query.filter_by(
                stylist_id=stylist.id,
                status='completed'
            ).count()
            
            # Total revenue
            revenue = db.session.query(func.sum(Appointment.final_amount)).filter(
                Appointment.stylist_id == stylist.id,
                Appointment.status == 'completed'
            ).scalar() or 0
            
            # Average rating
            avg_rating = db.session.query(func.avg(Review.rating)).filter_by(
                stylist_id=stylist.id,
                is_approved=True
            ).scalar() or 0
            
            # This month's stats
            today = datetime.utcnow().date()
            month_start = datetime(today.year, today.month, 1).date()
            
            month_completed = Appointment.query.filter(
                Appointment.stylist_id == stylist.id,
                Appointment.appointment_date >= month_start,
                Appointment.status == 'completed'
            ).count()
            
            month_revenue = db.session.query(func.sum(Appointment.final_amount)).filter(
                Appointment.stylist_id == stylist.id,
                Appointment.appointment_date >= month_start,
                Appointment.status == 'completed'
            ).scalar() or 0
            
            # Appointments by status
            by_status = {
                'pending': Appointment.query.filter_by(stylist_id=stylist.id, status='pending').count(),
                'confirmed': Appointment.query.filter_by(stylist_id=stylist.id, status='confirmed').count(),
                'in_progress': Appointment.query.filter_by(stylist_id=stylist.id, status='in_progress').count(),
                'completed': completed,
                'cancelled': Appointment.query.filter_by(stylist_id=stylist.id, status='cancelled').count(),
                'no_show': Appointment.query.filter_by(stylist_id=stylist.id, status='no_show').count()
            }
            
            return {
                'total_appointments': total,
                'completed_appointments': completed,
                'completion_rate': (completed / total * 100) if total > 0 else 0,
                'total_revenue': revenue,
                'average_rating': round(float(avg_rating), 1),
                'total_reviews': Review.query.filter_by(stylist_id=stylist.id, is_approved=True).count(),
                'appointments_by_status': by_status,
                'monthly': {
                    'completed': month_completed,
                    'revenue': month_revenue
                }
            }, 200
            
        except Exception as e:
            return {'error': str(e)}, 500
    
    @staticmethod
    def get_performance(current_user):
        """Get ALL performance data with correct monthly calculation"""
        try:
            stylist = Stylist.query.filter_by(user_id=current_user.id).first()
            if not stylist:
                return {'error': 'Stylist profile not found'}, 404
            
            today = datetime.utcnow().date()
            
            # ============================================================
            # MONTHLY STATISTICS - LAST 12 CALENDAR MONTHS
            # ============================================================
            monthly_stats = []
            
            year = today.year
            month = today.month
            
            for i in range(12):
                # Calculate month correctly
                current_month = month - i
                current_year = year
                
                while current_month <= 0:
                    current_month += 12
                    current_year -= 1
                
                month_start = datetime(current_year, current_month, 1).date()
                
                # First day of next month
                if current_month == 12:
                    next_month = datetime(current_year + 1, 1, 1).date()
                else:
                    next_month = datetime(current_year, current_month + 1, 1).date()
                
                month_end = next_month - timedelta(days=1)
                
                # Appointments
                month_appointments = Appointment.query.filter(
                    Appointment.stylist_id == stylist.id,
                    Appointment.appointment_date >= month_start,
                    Appointment.appointment_date <= month_end
                ).count()
                
                # Completed
                month_completed = Appointment.query.filter(
                    Appointment.stylist_id == stylist.id,
                    Appointment.status == 'completed',
                    Appointment.appointment_date >= month_start,
                    Appointment.appointment_date <= month_end
                ).count()
                
                # Revenue
                month_revenue = db.session.query(
                    func.sum(Appointment.final_amount)
                ).filter(
                    Appointment.stylist_id == stylist.id,
                    Appointment.status == 'completed',
                    Appointment.appointment_date >= month_start,
                    Appointment.appointment_date <= month_end
                ).scalar() or 0
                
                # Reviews
                month_reviews = Review.query.filter(
                    Review.stylist_id == stylist.id,
                    Review.created_at >= month_start,
                    Review.created_at < next_month
                ).count()
                
                # Rating
                month_rating = db.session.query(
                    func.avg(Review.rating)
                ).filter(
                    Review.stylist_id == stylist.id,
                    Review.created_at >= month_start,
                    Review.created_at < next_month,
                    Review.is_approved == True
                ).scalar() or 0
                
                monthly_stats.append({
                    'month': month_start.strftime('%B %Y'),
                    'month_short': month_start.strftime('%b %Y'),
                    'appointments': month_appointments,
                    'completed': month_completed,
                    'completion_rate': (
                        (month_completed / month_appointments) * 100
                        if month_appointments > 0
                        else 0
                    ),
                    'revenue': float(month_revenue),
                    'reviews': month_reviews,
                    'avg_rating': round(float(month_rating), 1)
                })
            
            # ============================================================
            # TOP SERVICES
            # ============================================================
            top_services = db.session.query(
                Service.name,
                func.count(Appointment.id).label('count')
            ).join(
                Appointment,
                Appointment.service_id == Service.id
            ).filter(
                Appointment.stylist_id == stylist.id
            ).group_by(
                Service.id
            ).order_by(
                desc('count')
            ).limit(5).all()
            
            # ============================================================
            # OVERALL STATISTICS
            # ============================================================
            total_appointments = Appointment.query.filter_by(
                stylist_id=stylist.id
            ).count()
            
            total_completed = Appointment.query.filter_by(
                stylist_id=stylist.id,
                status='completed'
            ).count()
            
            total_reviews = Review.query.filter_by(
                stylist_id=stylist.id,
                is_approved=True
            ).count()
            
            avg_rating = db.session.query(
                func.avg(Review.rating)
            ).filter_by(
                stylist_id=stylist.id,
                is_approved=True
            ).scalar() or 0
            
            return {
                'monthly_stats': monthly_stats,
                'top_services': [
                    {
                        'name': service.name,
                        'count': service.count
                    }
                    for service in top_services
                ],
                'total_appointments': total_appointments,
                'total_completed': total_completed,
                'total_reviews': total_reviews,
                'avg_rating': round(float(avg_rating), 1)
            }, 200
            
        except Exception as e:
            return {'error': str(e)}, 500
    
    @staticmethod
    def get_ratings(current_user):
        """Get ratings - ALL"""
        try:
            stylist = Stylist.query.filter_by(user_id=current_user.id).first()
            if not stylist:
                return {'error': 'Stylist profile not found'}, 404
            
            reviews = Review.query.filter_by(
                stylist_id=stylist.id,
                is_approved=True
            ).order_by(Review.created_at.desc()).all()
            
            # Rating distribution
            distribution = {5: 0, 4: 0, 3: 0, 2: 0, 1: 0}
            for review in reviews:
                if review.rating in distribution:
                    distribution[review.rating] += 1
            
            return {
                'reviews': [r.to_dict() for r in reviews],
                'total': len(reviews),
                'average': round(sum(r.rating for r in reviews) / len(reviews), 1) if reviews else 0,
                'distribution': distribution
            }, 200
            
        except Exception as e:
            return {'error': str(e)}, 500
    
    @staticmethod
    def get_profile(current_user):
        """Get stylist profile"""
        try:
            stylist = Stylist.query.filter_by(user_id=current_user.id).first()
            if not stylist:
                return {'error': 'Stylist profile not found'}, 404
            return stylist.to_dict(), 200
        except Exception as e:
            return {'error': str(e)}, 500
    
    @staticmethod
    def update_profile(current_user, data):
        """Update stylist profile"""
        try:
            stylist = Stylist.query.filter_by(user_id=current_user.id).first()
            if not stylist:
                return {'error': 'Stylist profile not found'}, 404
            
            updatable_fields = [
                'specialization', 'experience_years', 'certification'
            ]
            
            for field in updatable_fields:
                if field in data:
                    setattr(stylist, field, data[field])
            
            db.session.commit()
            return stylist.to_dict(), 200
            
        except Exception as e:
            db.session.rollback()
            return {'error': str(e)}, 500
    
    @staticmethod
    def update_skills(current_user, data):
        """Update skills"""
        try:
            stylist = Stylist.query.filter_by(user_id=current_user.id).first()
            if not stylist:
                return {'error': 'Stylist profile not found'}, 404
            
            stylist.skills = data.get('skills', [])
            db.session.commit()
            
            return stylist.to_dict(), 200
            
        except Exception as e:
            db.session.rollback()
            return {'error': str(e)}, 500
    
    @staticmethod
    def get_notifications(current_user, params):
        """Get notifications"""
        try:
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
                'pages': notifications.pages,
                'unread_count': Notification.query.filter_by(
                    user_id=current_user.id,
                    is_read=False
                ).count()
            }, 200
            
        except Exception as e:
            return {'error': str(e)}, 500
    
    @staticmethod
    def mark_notification_read(current_user, notification_id):
        """Mark notification as read"""
        try:
            notification = Notification.query.filter_by(
                id=notification_id,
                user_id=current_user.id
            ).first()
            
            if not notification:
                return {'error': 'Notification not found'}, 404
            
            notification.is_read = True
            notification.read_at = datetime.utcnow()
            db.session.commit()
            
            return {'message': 'Notification marked as read'}, 200
            
        except Exception as e:
            db.session.rollback()
            return {'error': str(e)}, 500
    
    @staticmethod
    def mark_all_notifications_read(current_user):
        """Mark ALL notifications as read"""
        try:
            now = datetime.utcnow()
            Notification.query.filter_by(
                user_id=current_user.id,
                is_read=False
            ).update({
                'is_read': True,
                'read_at': now
            })
            
            db.session.commit()
            
            return {'message': 'All notifications marked as read'}, 200
            
        except Exception as e:
            db.session.rollback()
            return {'error': str(e)}, 500