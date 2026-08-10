from flask import jsonify
from app.models.user import User
from app.models.stylist import Stylist
from app.models.appointment import Appointment
from app.models.customer import Customer
from app.models.service import Service
from app.models.branch import Branch
from app.models.notification import Notification
from app.models.review import Review
from app.models.commission import Commission
from app.models.leave_request import LeaveRequest
from app.models.attendance import Attendance
from app.extensions import db
from sqlalchemy import func, desc, or_
from datetime import datetime, timedelta
import logging

logger = logging.getLogger(__name__)

class StylistController:
    
    # ==================== DASHBOARD ====================
    @staticmethod
    def get_dashboard(current_user):
        """Get stylist dashboard data - SHOWS ALL DATA"""
        try:
            # Get stylist profile
            stylist = Stylist.query.filter_by(user_id=current_user.id).first()
            if not stylist:
                return {'error': 'Stylist profile not found'}, 404
            
            # Today's date
            today = datetime.now().date()
            
            # ALL Appointments (not just assigned to this stylist)
            total_appointments = Appointment.query.count()
            
            # Today's appointments - ALL
            today_appointments = Appointment.query.filter(
                Appointment.appointment_date == today
            ).order_by(Appointment.appointment_time).all()
            
            # Upcoming appointments - ALL
            upcoming_appointments = Appointment.query.filter(
                Appointment.appointment_date >= today,
                Appointment.status.in_(['pending', 'confirmed'])
            ).order_by(Appointment.appointment_date, Appointment.appointment_time).all()
            
            # Completed appointments count - ALL
            completed_appointments = Appointment.query.filter(
                Appointment.status == 'completed'
            ).count()
            
            # Today's revenue - ALL
            today_revenue = db.session.query(func.sum(Appointment.final_amount))\
                .filter(
                    Appointment.appointment_date == today,
                    Appointment.status == 'completed'
                ).scalar() or 0
            
            # Total revenue - ALL
            total_revenue = db.session.query(func.sum(Appointment.final_amount))\
                .filter(
                    Appointment.status == 'completed'
                ).scalar() or 0
            
            # Average rating for this stylist
            reviews = Review.query.filter_by(stylist_id=stylist.id).all()
            avg_rating = 0
            if reviews:
                avg_rating = sum(r.rating for r in reviews) / len(reviews)
            
            # Pending leave requests for this stylist
            pending_leave = LeaveRequest.query.filter_by(
                stylist_id=stylist.id,
                status='pending'
            ).count()
            
            # Unread notifications
            unread_notifications = Notification.query.filter_by(
                user_id=current_user.id,
                is_read=False
            ).count()
            
            # Today's attendance
            today_attendance = Attendance.query.filter_by(
                stylist_id=stylist.id,
                date=today
            ).first()
            
            # Calculate total commission for this stylist
            total_commission = db.session.query(func.sum(Commission.commission_amount))\
                .filter(
                    Commission.stylist_id == stylist.id,
                    Commission.is_paid == False
                ).scalar() or 0
            
            # Get user data
            user = User.query.get(current_user.id)
            
            # Format today's appointments
            formatted_today = []
            for appt in today_appointments:
                customer = Customer.query.get(appt.customer_id)
                customer_user = User.query.get(customer.user_id) if customer else None
                service = Service.query.get(appt.service_id)
                stylist_assigned = Stylist.query.get(appt.stylist_id)
                stylist_user = User.query.get(stylist_assigned.user_id) if stylist_assigned else None
                
                formatted_today.append({
                    'id': appt.id,
                    'customer_name': f"{customer_user.first_name} {customer_user.last_name}" if customer_user else 'Walk-in',
                    'service_name': service.name if service else 'N/A',
                    'appointment_time': str(appt.appointment_time) if appt.appointment_time else None,
                    'status': appt.status,
                    'final_amount': float(appt.final_amount or 0),
                    'stylist_name': f"{stylist_user.first_name} {stylist_user.last_name}" if stylist_user else 'Not Assigned',
                    'is_assigned_to_me': appt.stylist_id == stylist.id
                })
            
            # Format upcoming appointments
            formatted_upcoming = []
            for appt in upcoming_appointments[:10]:
                customer = Customer.query.get(appt.customer_id)
                customer_user = User.query.get(customer.user_id) if customer else None
                service = Service.query.get(appt.service_id)
                stylist_assigned = Stylist.query.get(appt.stylist_id)
                stylist_user = User.query.get(stylist_assigned.user_id) if stylist_assigned else None
                
                formatted_upcoming.append({
                    'id': appt.id,
                    'customer_name': f"{customer_user.first_name} {customer_user.last_name}" if customer_user else 'Walk-in',
                    'service_name': service.name if service else 'N/A',
                    'appointment_date': appt.appointment_date.isoformat() if appt.appointment_date else None,
                    'appointment_time': str(appt.appointment_time) if appt.appointment_time else None,
                    'status': appt.status,
                    'stylist_name': f"{stylist_user.first_name} {stylist_user.last_name}" if stylist_user else 'Not Assigned',
                    'is_assigned_to_me': appt.stylist_id == stylist.id
                })
            
            return {
                'stylist': {
                    'id': stylist.id,
                    'user_id': stylist.user_id,
                    'user': {
                        'first_name': user.first_name if user else None,
                        'last_name': user.last_name if user else None,
                        'email': user.email if user else None
                    },
                    'specialization': stylist.specialization,
                    'experience_years': stylist.experience_years,
                    'rating': float(avg_rating),
                    'branch_id': stylist.branch_id,
                    'is_available': stylist.is_available,
                    'commission_rate': float(stylist.commission_rate or 0)
                },
                'today_appointments': formatted_today,
                'upcoming_appointments': formatted_upcoming,
                'stats': {
                    'total_appointments': total_appointments,
                    'completed_appointments': completed_appointments,
                    'today_revenue': float(today_revenue),
                    'total_revenue': float(total_revenue),
                    'avg_rating': float(avg_rating),
                    'pending_leave': pending_leave,
                    'unread_notifications': unread_notifications,
                    'today_attendance': today_attendance.status if today_attendance else 'not_recorded',
                    'pending_commission': float(total_commission)
                }
            }, 200
            
        except Exception as e:
            logger.error(f"Error in stylist dashboard: {str(e)}")
            return {'error': str(e)}, 500
    
    # ==================== APPOINTMENTS ====================
    @staticmethod
    def get_all_appointments(current_user, params):
        """Get ALL appointments - including unassigned ones"""
        try:
            stylist = Stylist.query.filter_by(user_id=current_user.id).first()
            if not stylist:
                return {'error': 'Stylist profile not found'}, 404
            
            page = int(params.get('page', 1))
            limit = int(params.get('limit', 10))
            status = params.get('status')
            start_date = params.get('start_date')
            end_date = params.get('end_date')
            filter_type = params.get('filter', 'all')  # all, today, upcoming, history
            search = params.get('search')
            
            # Show ALL appointments - not just assigned to this stylist
            query = Appointment.query
            
            # Apply date filters
            today = datetime.now().date()
            if filter_type == 'today':
                query = query.filter(Appointment.appointment_date == today)
            elif filter_type == 'upcoming':
                query = query.filter(Appointment.appointment_date >= today)
            elif filter_type == 'history':
                query = query.filter(Appointment.appointment_date < today)
            
            # Apply status filter
            if status and status != 'all':
                query = query.filter_by(status=status)
            
            if start_date:
                query = query.filter(Appointment.appointment_date >= datetime.strptime(start_date, '%Y-%m-%d').date())
            
            if end_date:
                query = query.filter(Appointment.appointment_date <= datetime.strptime(end_date, '%Y-%m-%d').date())
            
            if search:
                query = query.join(Customer).join(User).filter(
                    or_(
                        User.first_name.ilike(f'%{search}%'),
                        User.last_name.ilike(f'%{search}%'),
                        Appointment.notes.ilike(f'%{search}%')
                    )
                )
            
            total = query.count()
            appointments = query.order_by(desc(Appointment.appointment_date), desc(Appointment.appointment_time))\
                .offset((page - 1) * limit).limit(limit).all()
            
            result = []
            for appt in appointments:
                customer = Customer.query.get(appt.customer_id)
                user = User.query.get(customer.user_id) if customer else None
                service = Service.query.get(appt.service_id)
                branch = Branch.query.get(appt.branch_id)
                stylist_assigned = Stylist.query.get(appt.stylist_id)
                stylist_user = User.query.get(stylist_assigned.user_id) if stylist_assigned else None
                
                result.append({
                    'id': appt.id,
                    'customer_name': f"{user.first_name} {user.last_name}" if user else 'Walk-in',
                    'customer_email': user.email if user else 'N/A',
                    'customer_phone': user.phone if user else 'N/A',
                    'service_name': service.name if service else 'N/A',
                    'branch_name': branch.name if branch else 'N/A',
                    'appointment_date': appt.appointment_date.isoformat() if appt.appointment_date else None,
                    'appointment_time': str(appt.appointment_time) if appt.appointment_time else None,
                    'status': appt.status,
                    'final_amount': float(appt.final_amount or 0),
                    'notes': appt.stylist_notes,
                    'stylist_name': f"{stylist_user.first_name} {stylist_user.last_name}" if stylist_user else 'Not Assigned',
                    'stylist_id': appt.stylist_id,
                    'is_assigned_to_me': appt.stylist_id == stylist.id,
                    'created_at': appt.created_at.isoformat() if appt.created_at else None
                })
            
            return {
                'appointments': result,
                'total': total,
                'page': page,
                'limit': limit,
                'pages': (total + limit - 1) // limit if total > 0 else 1
            }, 200
            
        except Exception as e:
            logger.error(f"Error getting appointments: {str(e)}")
            return {'error': str(e)}, 500
    
    @staticmethod
    def get_today_appointments(current_user):
        """Get ALL today's appointments - including unassigned"""
        try:
            stylist = Stylist.query.filter_by(user_id=current_user.id).first()
            if not stylist:
                return {'error': 'Stylist profile not found'}, 404
            
            today = datetime.now().date()
            
            # Show ALL today's appointments (not just assigned to this stylist)
            appointments = Appointment.query.filter(
                Appointment.appointment_date == today
            ).order_by(Appointment.appointment_time).all()
            
            result = []
            for appt in appointments:
                customer = Customer.query.get(appt.customer_id)
                user = User.query.get(customer.user_id) if customer else None
                service = Service.query.get(appt.service_id)
                stylist_assigned = Stylist.query.get(appt.stylist_id)
                stylist_user = User.query.get(stylist_assigned.user_id) if stylist_assigned else None
                
                result.append({
                    'id': appt.id,
                    'customer_name': f"{user.first_name} {user.last_name}" if user else 'Walk-in',
                    'service_name': service.name if service else 'N/A',
                    'appointment_time': str(appt.appointment_time) if appt.appointment_time else None,
                    'status': appt.status,
                    'final_amount': float(appt.final_amount or 0),
                    'notes': appt.stylist_notes,
                    'stylist_name': f"{stylist_user.first_name} {stylist_user.last_name}" if stylist_user else 'Not Assigned',
                    'is_assigned_to_me': appt.stylist_id == stylist.id
                })
            
            return result, 200
            
        except Exception as e:
            logger.error(f"Error getting today's appointments: {str(e)}")
            return {'error': str(e)}, 500
    
    @staticmethod
    def get_upcoming_appointments(current_user):
        """Get ALL upcoming appointments - including unassigned"""
        try:
            stylist = Stylist.query.filter_by(user_id=current_user.id).first()
            if not stylist:
                return {'error': 'Stylist profile not found'}, 404
            
            today = datetime.now().date()
            
            # Show ALL upcoming appointments (not just assigned to this stylist)
            appointments = Appointment.query.filter(
                Appointment.appointment_date >= today,
                Appointment.status.in_(['pending', 'confirmed'])
            ).order_by(Appointment.appointment_date, Appointment.appointment_time).limit(20).all()
            
            result = []
            for appt in appointments:
                customer = Customer.query.get(appt.customer_id)
                user = User.query.get(customer.user_id) if customer else None
                service = Service.query.get(appt.service_id)
                stylist_assigned = Stylist.query.get(appt.stylist_id)
                stylist_user = User.query.get(stylist_assigned.user_id) if stylist_assigned else None
                
                result.append({
                    'id': appt.id,
                    'customer_name': f"{user.first_name} {user.last_name}" if user else 'Walk-in',
                    'service_name': service.name if service else 'N/A',
                    'appointment_date': appt.appointment_date.isoformat() if appt.appointment_date else None,
                    'appointment_time': str(appt.appointment_time) if appt.appointment_time else None,
                    'status': appt.status,
                    'stylist_name': f"{stylist_user.first_name} {stylist_user.last_name}" if stylist_user else 'Not Assigned',
                    'is_assigned_to_me': appt.stylist_id == stylist.id
                })
            
            return result, 200
            
        except Exception as e:
            logger.error(f"Error getting upcoming appointments: {str(e)}")
            return {'error': str(e)}, 500
    
    @staticmethod
    def get_appointment_history(current_user, params):
        """Get ALL appointment history - including unassigned"""
        try:
            stylist = Stylist.query.filter_by(user_id=current_user.id).first()
            if not stylist:
                return {'error': 'Stylist profile not found'}, 404
            
            page = int(params.get('page', 1))
            limit = int(params.get('limit', 10))
            
            # Show ALL appointments (not just assigned to this stylist)
            appointments = Appointment.query.filter(
                Appointment.status.in_(['completed', 'cancelled', 'no-show'])
            ).order_by(desc(Appointment.appointment_date), desc(Appointment.appointment_time))\
                .offset((page - 1) * limit).limit(limit).all()
            
            total = Appointment.query.filter(
                Appointment.status.in_(['completed', 'cancelled', 'no-show'])
            ).count()
            
            result = []
            for appt in appointments:
                customer = Customer.query.get(appt.customer_id)
                user = User.query.get(customer.user_id) if customer else None
                service = Service.query.get(appt.service_id)
                stylist_assigned = Stylist.query.get(appt.stylist_id)
                stylist_user = User.query.get(stylist_assigned.user_id) if stylist_assigned else None
                
                result.append({
                    'id': appt.id,
                    'customer_name': f"{user.first_name} {user.last_name}" if user else 'Walk-in',
                    'service_name': service.name if service else 'N/A',
                    'appointment_date': appt.appointment_date.isoformat() if appt.appointment_date else None,
                    'appointment_time': str(appt.appointment_time) if appt.appointment_time else None,
                    'status': appt.status,
                    'final_amount': float(appt.final_amount or 0),
                    'stylist_name': f"{stylist_user.first_name} {stylist_user.last_name}" if stylist_user else 'Not Assigned',
                    'is_assigned_to_me': appt.stylist_id == stylist.id
                })
            
            return {
                'appointments': result,
                'total': total,
                'page': page,
                'limit': limit,
                'pages': (total + limit - 1) // limit if total > 0 else 1
            }, 200
            
        except Exception as e:
            logger.error(f"Error getting appointment history: {str(e)}")
            return {'error': str(e)}, 500
    
    # ==================== EARNINGS ====================
    @staticmethod
    def get_earnings(current_user, params):
        """Get stylist earnings"""
        try:
            stylist = Stylist.query.filter_by(user_id=current_user.id).first()
            if not stylist:
                return {'error': 'Stylist profile not found'}, 404
            
            period = params.get('period', 'monthly')
            
            end_date = datetime.now()
            if period == 'weekly':
                start_date = end_date - timedelta(days=7)
            elif period == 'monthly':
                start_date = end_date - timedelta(days=30)
            elif period == 'quarterly':
                start_date = end_date - timedelta(days=90)
            elif period == 'yearly':
                start_date = end_date - timedelta(days=365)
            else:
                start_date = end_date - timedelta(days=30)
            
            appointments = Appointment.query.filter(
                Appointment.appointment_date >= start_date.date(),
                Appointment.appointment_date <= end_date.date(),
                Appointment.status == 'completed'
            ).all()
            
            total_earnings = sum(a.final_amount or 0 for a in appointments)
            total_appointments = len(appointments)
            
            # Calculate commission
            commission_rate = stylist.commission_rate or 0.0
            total_commission = total_earnings * commission_rate
            
            return {
                'period': period,
                'start_date': start_date.isoformat(),
                'end_date': end_date.isoformat(),
                'total_earnings': float(total_earnings),
                'total_appointments': total_appointments,
                'commission_rate': float(commission_rate),
                'total_commission': float(total_commission),
                'average_per_appointment': float(total_earnings / total_appointments) if total_appointments > 0 else 0
            }, 200
            
        except Exception as e:
            logger.error(f"Error getting earnings: {str(e)}")
            return {'error': str(e)}, 500
    
    @staticmethod
    def get_earnings_summary(current_user):
        """Get earnings summary"""
        try:
            stylist = Stylist.query.filter_by(user_id=current_user.id).first()
            if not stylist:
                return {'error': 'Stylist profile not found'}, 404
            
            today = datetime.now().date()
            start_of_month = today.replace(day=1)
            start_of_year = today.replace(month=1, day=1)
            
            # Today's earnings
            today_earnings = db.session.query(func.sum(Appointment.final_amount))\
                .filter(
                    Appointment.appointment_date == today,
                    Appointment.status == 'completed'
                ).scalar() or 0
            
            # Monthly earnings
            monthly_earnings = db.session.query(func.sum(Appointment.final_amount))\
                .filter(
                    Appointment.appointment_date >= start_of_month,
                    Appointment.appointment_date <= today,
                    Appointment.status == 'completed'
                ).scalar() or 0
            
            # Yearly earnings
            yearly_earnings = db.session.query(func.sum(Appointment.final_amount))\
                .filter(
                    Appointment.appointment_date >= start_of_year,
                    Appointment.appointment_date <= today,
                    Appointment.status == 'completed'
                ).scalar() or 0
            
            # Total earnings all time
            total_earnings = db.session.query(func.sum(Appointment.final_amount))\
                .filter(
                    Appointment.status == 'completed'
                ).scalar() or 0
            
            return {
                'today': float(today_earnings),
                'monthly': float(monthly_earnings),
                'yearly': float(yearly_earnings),
                'total': float(total_earnings)
            }, 200
            
        except Exception as e:
            logger.error(f"Error getting earnings summary: {str(e)}")
            return {'error': str(e)}, 500
    
    # ==================== COMMISSIONS ====================
    @staticmethod
    def get_commission(current_user, params):
        """Get stylist commission"""
        try:
            stylist = Stylist.query.filter_by(user_id=current_user.id).first()
            if not stylist:
                return {'error': 'Stylist profile not found'}, 404
            
            period = params.get('period', 'monthly')
            
            end_date = datetime.now()
            if period == 'weekly':
                start_date = end_date - timedelta(days=7)
            elif period == 'monthly':
                start_date = end_date - timedelta(days=30)
            elif period == 'quarterly':
                start_date = end_date - timedelta(days=90)
            elif period == 'yearly':
                start_date = end_date - timedelta(days=365)
            else:
                start_date = end_date - timedelta(days=30)
            
            commissions = Commission.query.filter(
                Commission.stylist_id == stylist.id,
                Commission.created_at >= start_date,
                Commission.created_at <= end_date
            ).order_by(desc(Commission.created_at)).all()
            
            total_commission = sum(c.commission_amount or 0 for c in commissions)
            
            return {
                'period': period,
                'start_date': start_date.isoformat(),
                'end_date': end_date.isoformat(),
                'total_commission': float(total_commission),
                'commissions': [
                    {
                        'id': c.id,
                        'amount': float(c.commission_amount),
                        'appointment_id': c.appointment_id,
                        'rate': float(c.commission_rate),
                        'service_amount': float(c.service_amount),
                        'is_paid': c.is_paid,
                        'paid_at': c.paid_at.isoformat() if c.paid_at else None,
                        'created_at': c.created_at.isoformat() if c.created_at else None
                    } for c in commissions
                ]
            }, 200
            
        except Exception as e:
            logger.error(f"Error getting commission: {str(e)}")
            return {'error': str(e)}, 500
    
    @staticmethod
    def get_commission_rate(current_user):
        """Get commission rate"""
        try:
            stylist = Stylist.query.filter_by(user_id=current_user.id).first()
            if not stylist:
                return {'error': 'Stylist profile not found'}, 404
            
            return {
                'commission_rate': float(stylist.commission_rate or 0)
            }, 200
            
        except Exception as e:
            logger.error(f"Error getting commission rate: {str(e)}")
            return {'error': str(e)}, 500
    
    # ==================== SCHEDULE ====================
    @staticmethod
    def get_schedule(current_user, params):
        """Get stylist schedule - shows ALL appointments for the date"""
        try:
            stylist = Stylist.query.filter_by(user_id=current_user.id).first()
            if not stylist:
                return {'error': 'Stylist profile not found'}, 404
            
            date_str = params.get('date')
            if date_str:
                date = datetime.strptime(date_str, '%Y-%m-%d').date()
            else:
                date = datetime.now().date()
            
            # Show ALL appointments for this date (not just assigned to this stylist)
            appointments = Appointment.query.filter(
                Appointment.appointment_date == date
            ).order_by(Appointment.appointment_time).all()
            
            # Get attendance for this date
            attendance = Attendance.query.filter_by(
                stylist_id=stylist.id,
                date=date
            ).first()
            
            formatted_appointments = []
            for appt in appointments:
                customer = Customer.query.get(appt.customer_id)
                user = User.query.get(customer.user_id) if customer else None
                service = Service.query.get(appt.service_id)
                stylist_assigned = Stylist.query.get(appt.stylist_id)
                stylist_user = User.query.get(stylist_assigned.user_id) if stylist_assigned else None
                
                formatted_appointments.append({
                    'id': appt.id,
                    'customer_name': f"{user.first_name} {user.last_name}" if user else 'Walk-in',
                    'service_name': service.name if service else 'N/A',
                    'appointment_time': str(appt.appointment_time) if appt.appointment_time else None,
                    'duration': appt.duration,
                    'status': appt.status,
                    'final_amount': float(appt.final_amount or 0),
                    'stylist_name': f"{stylist_user.first_name} {stylist_user.last_name}" if stylist_user else 'Not Assigned',
                    'is_assigned_to_me': appt.stylist_id == stylist.id
                })
            
            return {
                'date': date.isoformat(),
                'attendance': {
                    'status': attendance.status if attendance else 'not_recorded',
                    'check_in': attendance.check_in_time.isoformat() if attendance and attendance.check_in_time else None,
                    'check_out': attendance.check_out_time.isoformat() if attendance and attendance.check_out_time else None,
                    'late_minutes': attendance.late_minutes if attendance else 0
                } if attendance else None,
                'appointments': formatted_appointments
            }, 200
            
        except Exception as e:
            logger.error(f"Error getting schedule: {str(e)}")
            return {'error': str(e)}, 500
    
    # ==================== LEAVE REQUESTS ====================
    @staticmethod
    def get_leave_requests(current_user):
        """Get all leave requests for the stylist"""
        try:
            stylist = Stylist.query.filter_by(user_id=current_user.id).first()
            if not stylist:
                return {'error': 'Stylist profile not found'}, 404
            
            leave_requests = LeaveRequest.query.filter_by(
                stylist_id=stylist.id
            ).order_by(desc(LeaveRequest.created_at)).all()
            
            result = []
            for leave in leave_requests:
                result.append({
                    'id': leave.id,
                    'leave_type': leave.leave_type,
                    'start_date': leave.start_date.isoformat() if leave.start_date else None,
                    'end_date': leave.end_date.isoformat() if leave.end_date else None,
                    'reason': leave.reason,
                    'status': leave.status,
                    'created_at': leave.created_at.isoformat() if leave.created_at else None
                })
            
            return result, 200
            
        except Exception as e:
            logger.error(f"Error getting leave requests: {str(e)}")
            return {'error': str(e)}, 500
    
    @staticmethod
    def create_leave_request(current_user, data):
        """Create a leave request"""
        try:
            stylist = Stylist.query.filter_by(user_id=current_user.id).first()
            if not stylist:
                return {'error': 'Stylist profile not found'}, 404
            
            start_date = data.get('start_date')
            end_date = data.get('end_date')
            reason = data.get('reason')
            leave_type = data.get('leave_type', 'annual')
            
            if not start_date or not end_date:
                return {'error': 'Missing required fields: start_date, end_date'}, 400
            
            leave_request = LeaveRequest(
                stylist_id=stylist.id,
                branch_id=stylist.branch_id,
                leave_type=leave_type,
                start_date=datetime.strptime(start_date, '%Y-%m-%d').date(),
                end_date=datetime.strptime(end_date, '%Y-%m-%d').date(),
                reason=reason,
                status='pending',
                created_at=datetime.utcnow()
            )
            
            db.session.add(leave_request)
            db.session.commit()
            
            return {'message': 'Leave request created successfully', 'id': leave_request.id}, 201
            
        except Exception as e:
            db.session.rollback()
            logger.error(f"Error creating leave request: {str(e)}")
            return {'error': str(e)}, 500
    
    # ==================== PERFORMANCE ====================
    @staticmethod
    def get_performance_stats(current_user):
        """Get performance statistics"""
        try:
            stylist = Stylist.query.filter_by(user_id=current_user.id).first()
            if not stylist:
                return {'error': 'Stylist profile not found'}, 404
            
            reviews = Review.query.filter_by(stylist_id=stylist.id).all()
            avg_rating = 0
            if reviews:
                avg_rating = sum(r.rating for r in reviews) / len(reviews)
            
            completed = Appointment.query.filter_by(
                stylist_id=stylist.id,
                status='completed'
            ).count()
            
            total = Appointment.query.filter_by(stylist_id=stylist.id).count()
            
            revenue = db.session.query(func.sum(Appointment.final_amount))\
                .filter(
                    Appointment.stylist_id == stylist.id,
                    Appointment.status == 'completed'
                ).scalar() or 0
            
            commission = db.session.query(func.sum(Commission.commission_amount))\
                .filter(
                    Commission.stylist_id == stylist.id
                ).scalar() or 0
            
            return {
                'total_appointments': total,
                'completed_appointments': completed,
                'completion_rate': (completed / total * 100) if total > 0 else 0,
                'total_revenue': float(revenue),
                'average_rating': float(avg_rating),
                'total_reviews': len(reviews),
                'total_commission': float(commission)
            }, 200
            
        except Exception as e:
            logger.error(f"Error getting performance stats: {str(e)}")
            return {'error': str(e)}, 500
    
    # ==================== PROFILE ====================
    @staticmethod
    def get_profile(current_user):
        """Get stylist profile"""
        try:
            stylist = Stylist.query.filter_by(user_id=current_user.id).first()
            if not stylist:
                return {'error': 'Stylist profile not found'}, 404
            
            return {
                'user': {
                    'id': current_user.id,
                    'email': current_user.email,
                    'first_name': current_user.first_name,
                    'last_name': current_user.last_name,
                    'phone': current_user.phone,
                    'created_at': current_user.created_at.isoformat() if current_user.created_at else None
                },
                'stylist': {
                    'id': stylist.id,
                    'specialization': stylist.specialization,
                    'experience_years': stylist.experience_years,
                    'rating': float(stylist.rating or 0),
                    'branch_id': stylist.branch_id,
                    'employee_id': stylist.employee_id,
                    'skills': stylist.skills,
                    'certification': stylist.certification,
                    'hire_date': stylist.hire_date.isoformat() if stylist.hire_date else None,
                    'salary': float(stylist.salary) if stylist.salary else 0,
                    'commission_rate': float(stylist.commission_rate or 0),
                    'is_available': stylist.is_available,
                    'is_active': stylist.is_active
                }
            }, 200
            
        except Exception as e:
            logger.error(f"Error getting profile: {str(e)}")
            return {'error': str(e)}, 500
    
    @staticmethod
    def update_profile(current_user, data):
        """Update stylist profile"""
        try:
            stylist = Stylist.query.filter_by(user_id=current_user.id).first()
            if not stylist:
                return {'error': 'Stylist profile not found'}, 404
            
            if 'first_name' in data:
                current_user.first_name = data['first_name']
            if 'last_name' in data:
                current_user.last_name = data['last_name']
            if 'phone' in data:
                current_user.phone = data['phone']
            
            if 'specialization' in data:
                stylist.specialization = data['specialization']
            if 'experience_years' in data:
                stylist.experience_years = data['experience_years']
            if 'skills' in data:
                stylist.skills = data['skills']
            if 'certification' in data:
                stylist.certification = data['certification']
            if 'is_available' in data:
                stylist.is_available = data['is_available']
            
            db.session.commit()
            
            return {'message': 'Profile updated successfully'}, 200
            
        except Exception as e:
            db.session.rollback()
            logger.error(f"Error updating profile: {str(e)}")
            return {'error': str(e)}, 500
    
    # ==================== NOTIFICATIONS ====================
    @staticmethod
    def get_notifications(current_user, params):
        """Get notifications"""
        try:
            page = int(params.get('page', 1))
            limit = int(params.get('limit', 20))
            is_read = params.get('is_read')
            
            query = Notification.query.filter_by(user_id=current_user.id)
            
            if is_read is not None:
                query = query.filter_by(is_read=is_read == 'true')
            
            total = query.count()
            notifications = query.order_by(desc(Notification.created_at))\
                .offset((page - 1) * limit).limit(limit).all()
            
            result = []
            for notification in notifications:
                result.append({
                    'id': notification.id,
                    'title': notification.title,
                    'message': notification.message,
                    'type': notification.type,
                    'priority': notification.priority,
                    'is_read': notification.is_read,
                    'read_at': notification.read_at.isoformat() if notification.read_at else None,
                    'action_url': notification.action_url,
                    'action_text': notification.action_text,
                    'created_at': notification.created_at.isoformat() if notification.created_at else None
                })
            
            return {
                'notifications': result,
                'total': total,
                'page': page,
                'limit': limit,
                'pages': (total + limit - 1) // limit if total > 0 else 1,
                'unread_count': Notification.query.filter_by(
                    user_id=current_user.id,
                    is_read=False
                ).count()
            }, 200
            
        except Exception as e:
            logger.error(f"Error getting notifications: {str(e)}")
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
            logger.error(f"Error marking notification read: {str(e)}")
            return {'error': str(e)}, 500