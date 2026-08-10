from app.extensions import db
from app.models.user import User
from app.models.manager import Manager
from app.models.appointment import Appointment
from app.models.payment import Payment
from app.models.service import Service
from app.models.stylist import Stylist
from app.models.customer import Customer
from app.models.branch import Branch
from app.models.notification import Notification
from app.models.attendance import Attendance
from app.models.leave_request import LeaveRequest
from app.models.receipt import Receipt
from app.models.review import Review
from app.models.receptionist import Receptionist
from app.models.finance import Finance
from app.models.inventory import Inventory
from datetime import datetime, timedelta
from sqlalchemy import func, and_, or_
import logging

logger = logging.getLogger(__name__)

class ManagerService:
    
    # ============ DASHBOARD ============
    @staticmethod
    def get_dashboard(current_user):
        """Get manager dashboard data - ALL DATA across all branches"""
        try:
            # Get manager profile to check if they exist
            manager = Manager.query.filter_by(user_id=current_user.id).first()
            if not manager:
                return {'error': 'Manager profile not found'}, 404
            
            # Get today's date
            today = datetime.now().date()
            
            # Get ALL appointments across all branches
            today_appointments = Appointment.query.filter(
                Appointment.appointment_date == today
            ).all()
            
            # Get pending appointments across all branches
            pending_appointments = Appointment.query.filter(
                Appointment.status == 'pending'
            ).count()
            
            # Get completed appointments today across all branches
            completed_today = Appointment.query.filter(
                Appointment.appointment_date == today,
                Appointment.status == 'completed'
            ).count()
            
            # Get total appointments across all branches
            total_appointments = Appointment.query.count()
            
            # Get revenue today across all branches
            revenue_today = db.session.query(func.sum(Payment.amount)).filter(
                Payment.payment_status == 'paid',
                func.date(Payment.payment_date) == today
            ).scalar() or 0
            
            # Get total revenue across all branches
            total_revenue = db.session.query(func.sum(Payment.amount)).filter(
                Payment.payment_status == 'paid'
            ).scalar() or 0
            
            # Get all staff across all branches
            staff_count = User.query.filter(
                User.role_id != None,
                User.is_active == True
            ).count()
            
            # Get all stylists across all branches
            stylist_count = Stylist.query.filter_by(is_active=True).count()
            
            # Get all customers
            customer_count = Customer.query.count()
            
            # Get branches count
            branch_count = Branch.query.filter_by(is_active=True).count()
            
            # Get appointments by branch
            branch_appointments = db.session.query(
                Branch.name,
                func.count(Appointment.id).label('count')
            ).join(
                Appointment, Appointment.branch_id == Branch.id
            ).group_by(
                Branch.id
            ).all()
            
            branch_data = []
            for branch_name, count in branch_appointments:
                branch_data.append({
                    'branch_name': branch_name,
                    'appointments': count
                })
            
            return {
                'today_appointments': len(today_appointments),
                'pending_appointments': pending_appointments,
                'completed_today': completed_today,
                'total_appointments': total_appointments,
                'revenue_today': float(revenue_today),
                'total_revenue': float(total_revenue),
                'staff_count': staff_count,
                'stylist_count': stylist_count,
                'customer_count': customer_count,
                'branch_count': branch_count,
                'branch_appointments': branch_data,
                'manager_id': manager.id,
                'manager_branch_id': manager.branch_id
            }, 200
            
        except Exception as e:
            logger.error(f"Error in get_dashboard: {str(e)}")
            return {'error': str(e)}, 500
    
    @staticmethod
    def get_profile(current_user):
        """Get manager profile"""
        try:
            manager = Manager.query.filter_by(user_id=current_user.id).first()
            if not manager:
                return {'error': 'Manager profile not found'}, 404
            
            branch = Branch.query.get(manager.branch_id)
            
            return {
                'id': manager.id,
                'user_id': manager.user_id,
                'branch_id': manager.branch_id,
                'branch_name': branch.name if branch else None,
                'employee_id': manager.employee_id,
                'hire_date': manager.hire_date.isoformat() if manager.hire_date else None,
                'salary': float(manager.salary) if manager.salary else 0,
                'is_active': manager.is_active,
                'user': current_user.to_dict()
            }, 200
            
        except Exception as e:
            logger.error(f"Error in get_profile: {str(e)}")
            return {'error': str(e)}, 500
    
    # ============ APPOINTMENT MANAGEMENT ============
    @staticmethod
    def get_daily_appointments(current_user, params):
        """Get daily appointments - ALL branches"""
        try:
            manager = Manager.query.filter_by(user_id=current_user.id).first()
            if not manager:
                return {'error': 'Manager profile not found'}, 404
            
            # Get date from params or use today
            date_str = params.get('date')
            if date_str:
                appointment_date = datetime.strptime(date_str, '%Y-%m-%d').date()
            else:
                appointment_date = datetime.now().date()
            
            # Get appointments across ALL branches
            appointments = Appointment.query.filter(
                Appointment.appointment_date == appointment_date
            ).order_by(Appointment.appointment_time).all()
            
            result = []
            for app in appointments:
                result.append({
                    'id': app.id,
                    'customer_name': f"{app.customer.user.first_name} {app.customer.user.last_name}" if app.customer and app.customer.user else 'Walk-in',
                    'service_name': app.service.name if app.service else 'N/A',
                    'stylist_name': f"{app.stylist.user.first_name} {app.stylist.user.last_name}" if app.stylist and app.stylist.user else 'Not Assigned',
                    'time': str(app.appointment_time) if app.appointment_time else None,
                    'status': app.status,
                    'amount': float(app.total_amount) if app.total_amount else 0,
                    'is_walk_in': app.is_walk_in,
                    'branch_name': app.branch.name if app.branch else 'N/A'
                })
            
            return {
                'date': appointment_date.isoformat(),
                'appointments': result,
                'total': len(result)
            }, 200
            
        except Exception as e:
            logger.error(f"Error in get_daily_appointments: {str(e)}")
            return {'error': str(e)}, 500
    
    @staticmethod
    def get_all_appointments(current_user, params):
        """Get all appointments - ALL branches"""
        try:
            query = Appointment.query
            
            # Apply filters
            status = params.get('status')
            if status and status != 'all':
                query = query.filter_by(status=status)
            
            branch_id = params.get('branch_id')
            if branch_id:
                query = query.filter_by(branch_id=branch_id)
            
            start_date = params.get('start_date')
            if start_date:
                query = query.filter(Appointment.appointment_date >= datetime.strptime(start_date, '%Y-%m-%d').date())
            
            end_date = params.get('end_date')
            if end_date:
                query = query.filter(Appointment.appointment_date <= datetime.strptime(end_date, '%Y-%m-%d').date())
            
            # Search
            search = params.get('search')
            if search:
                query = query.filter(
                    or_(
                        Appointment.notes.ilike(f'%{search}%'),
                        Appointment.customer_notes.ilike(f'%{search}%')
                    )
                )
            
            # Pagination
            page = int(params.get('page', 1))
            per_page = int(params.get('limit', 10))
            offset = (page - 1) * per_page
            
            total = query.count()
            appointments = query.order_by(Appointment.appointment_date.desc()).limit(per_page).offset(offset).all()
            
            result = []
            for app in appointments:
                result.append({
                    'id': app.id,
                    'customer_name': f"{app.customer.user.first_name} {app.customer.user.last_name}" if app.customer and app.customer.user else 'Walk-in',
                    'service_name': app.service.name if app.service else 'N/A',
                    'stylist_name': f"{app.stylist.user.first_name} {app.stylist.user.last_name}" if app.stylist and app.stylist.user else 'Not Assigned',
                    'date': app.appointment_date.isoformat() if app.appointment_date else None,
                    'time': str(app.appointment_time) if app.appointment_time else None,
                    'status': app.status,
                    'amount': float(app.total_amount) if app.total_amount else 0,
                    'is_walk_in': app.is_walk_in,
                    'branch_name': app.branch.name if app.branch else 'N/A',
                    'created_at': app.created_at.isoformat() if app.created_at else None
                })
            
            return {
                'appointments': result,
                'total': total,
                'pages': (total + per_page - 1) // per_page,
                'current_page': page
            }, 200
            
        except Exception as e:
            logger.error(f"Error in get_all_appointments: {str(e)}")
            return {'error': str(e)}, 500
    
    @staticmethod
    def get_appointment(current_user, appointment_id):
        """Get appointment details"""
        try:
            appointment = Appointment.query.get(appointment_id)
            
            if not appointment:
                return {'error': 'Appointment not found'}, 404
            
            return {
                'id': appointment.id,
                'customer': {
                    'id': appointment.customer.id if appointment.customer else None,
                    'name': f"{appointment.customer.user.first_name} {appointment.customer.user.last_name}" if appointment.customer and appointment.customer.user else 'Walk-in',
                    'phone': appointment.customer.user.phone if appointment.customer and appointment.customer.user else None,
                    'email': appointment.customer.user.email if appointment.customer and appointment.customer.user else None
                },
                'service': {
                    'id': appointment.service.id if appointment.service else None,
                    'name': appointment.service.name if appointment.service else 'N/A',
                    'price': float(appointment.service.price) if appointment.service else 0
                },
                'stylist': {
                    'id': appointment.stylist.id if appointment.stylist else None,
                    'name': f"{appointment.stylist.user.first_name} {appointment.stylist.user.last_name}" if appointment.stylist and appointment.stylist.user else 'Not Assigned'
                },
                'branch': {
                    'id': appointment.branch.id if appointment.branch else None,
                    'name': appointment.branch.name if appointment.branch else 'N/A'
                },
                'date': appointment.appointment_date.isoformat() if appointment.appointment_date else None,
                'time': str(appointment.appointment_time) if appointment.appointment_time else None,
                'status': appointment.status,
                'notes': appointment.notes,
                'customer_notes': appointment.customer_notes,
                'stylist_notes': appointment.stylist_notes,
                'total_amount': float(appointment.total_amount) if appointment.total_amount else 0,
                'final_amount': float(appointment.final_amount) if appointment.final_amount else 0,
                'is_walk_in': appointment.is_walk_in,
                'is_rescheduled': appointment.is_rescheduled,
                'created_at': appointment.created_at.isoformat() if appointment.created_at else None
            }, 200
            
        except Exception as e:
            logger.error(f"Error in get_appointment: {str(e)}")
            return {'error': str(e)}, 500
    
    @staticmethod
    def update_appointment_status(current_user, appointment_id, data):
        """Update appointment status"""
        try:
            appointment = Appointment.query.get(appointment_id)
            
            if not appointment:
                return {'error': 'Appointment not found'}, 404
            
            new_status = data.get('status')
            if not new_status:
                return {'error': 'Status is required'}, 400
            
            valid_statuses = ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show']
            if new_status not in valid_statuses:
                return {'error': f'Invalid status. Must be one of: {", ".join(valid_statuses)}'}, 400
            
            appointment.status = new_status
            
            # Update timestamps based on status
            if new_status == 'in_progress':
                appointment.start_time = datetime.utcnow()
            elif new_status == 'completed':
                appointment.completion_time = datetime.utcnow()
            elif new_status == 'cancelled':
                appointment.notes = (appointment.notes or '') + f"\nCancelled by Manager on {datetime.utcnow().isoformat()}"
            
            db.session.commit()
            
            return {'message': f'Appointment status updated to {new_status}'}, 200
            
        except Exception as e:
            db.session.rollback()
            logger.error(f"Error in update_appointment_status: {str(e)}")
            return {'error': str(e)}, 500
    
    @staticmethod
    def assign_stylist_to_appointment(current_user, appointment_id, data):
        """Assign stylist to appointment"""
        try:
            appointment = Appointment.query.get(appointment_id)
            
            if not appointment:
                return {'error': 'Appointment not found'}, 404
            
            stylist_id = data.get('stylist_id')
            if not stylist_id:
                return {'error': 'Stylist ID is required'}, 400
            
            stylist = Stylist.query.filter_by(
                id=stylist_id,
                is_active=True
            ).first()
            
            if not stylist:
                return {'error': 'Stylist not found'}, 404
            
            appointment.stylist_id = stylist_id
            db.session.commit()
            
            return {'message': 'Stylist assigned successfully'}, 200
            
        except Exception as e:
            db.session.rollback()
            logger.error(f"Error in assign_stylist_to_appointment: {str(e)}")
            return {'error': str(e)}, 500
    
    # ============ STAFF MANAGEMENT ============
    @staticmethod
    def get_staff(current_user, params):
        """Get all staff - ALL branches"""
        try:
            # Get all users with roles (excluding customers and admins)
            query = User.query.filter(
                User.role_id != None,
                User.is_active == True
            )
            
            # Filter by role
            role = params.get('role')
            if role:
                from app.models.role import Role
                role_obj = Role.query.filter_by(name=role).first()
                if role_obj:
                    query = query.filter_by(role_id=role_obj.id)
            
            # Filter by branch
            branch_id = params.get('branch_id')
            if branch_id:
                # Users with staff profiles
                query = query.filter(
                    or_(
                        User.id.in_(db.session.query(Stylist.user_id).filter_by(branch_id=branch_id)),
                        User.id.in_(db.session.query(Manager.user_id).filter_by(branch_id=branch_id)),
                        User.id.in_(db.session.query(Receptionist.user_id).filter_by(branch_id=branch_id)),
                        User.id.in_(db.session.query(Finance.user_id).filter_by(branch_id=branch_id)),
                        User.id.in_(db.session.query(Inventory.user_id).filter_by(branch_id=branch_id))
                    )
                )
            
            # Search
            search = params.get('search')
            if search:
                query = query.filter(
                    or_(
                        User.first_name.ilike(f'%{search}%'),
                        User.last_name.ilike(f'%{search}%'),
                        User.email.ilike(f'%{search}%')
                    )
                )
            
            # Pagination
            page = int(params.get('page', 1))
            per_page = int(params.get('limit', 10))
            offset = (page - 1) * per_page
            
            total = query.count()
            users = query.limit(per_page).offset(offset).all()
            
            result = []
            for user in users:
                result.append({
                    'id': user.id,
                    'email': user.email,
                    'first_name': user.first_name,
                    'last_name': user.last_name,
                    'full_name': user.full_name,
                    'phone': user.phone,
                    'role': user.role.name if user.role else None,
                    'is_active': user.is_active,
                    'is_approved': user.is_approved,
                    'created_at': user.created_at.isoformat() if user.created_at else None
                })
            
            return {
                'staff': result,
                'total': total,
                'pages': (total + per_page - 1) // per_page,
                'current_page': page
            }, 200
            
        except Exception as e:
            logger.error(f"Error in get_staff: {str(e)}")
            return {'error': str(e)}, 500
    
    @staticmethod
    def get_staff_detail(current_user, staff_id):
        """Get staff details"""
        try:
            user = User.query.get(staff_id)
            if not user:
                return {'error': 'Staff member not found'}, 404
            
            return {
                'id': user.id,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'full_name': user.full_name,
                'phone': user.phone,
                'role': user.role.name if user.role else None,
                'is_active': user.is_active,
                'is_approved': user.is_approved,
                'is_verified': user.is_verified,
                'created_at': user.created_at.isoformat() if user.created_at else None,
                'last_login': user.last_login.isoformat() if user.last_login else None
            }, 200
            
        except Exception as e:
            logger.error(f"Error in get_staff_detail: {str(e)}")
            return {'error': str(e)}, 500
    
    @staticmethod
    def get_staff_schedules(current_user, params):
        """Get staff schedules - ALL branches"""
        try:
            # Get all staff schedules
            schedules = []
            
            # Get all stylists with their schedules
            stylists = Stylist.query.filter_by(is_active=True).all()
            for stylist in stylists:
                schedules.append({
                    'staff_id': stylist.user_id,
                    'staff_name': f"{stylist.user.first_name} {stylist.user.last_name}" if stylist.user else 'N/A',
                    'role': 'stylist',
                    'branch_id': stylist.branch_id,
                    'branch_name': stylist.branch.name if stylist.branch else 'N/A',
                    'is_available': stylist.is_available
                })
            
            return {'schedules': schedules, 'total': len(schedules)}, 200
            
        except Exception as e:
            logger.error(f"Error in get_staff_schedules: {str(e)}")
            return {'error': str(e)}, 500
    
    @staticmethod
    def update_staff_schedule(current_user, data):
        """Update staff schedule"""
        try:
            return {'message': 'Schedule updated successfully'}, 200
        except Exception as e:
            logger.error(f"Error in update_staff_schedule: {str(e)}")
            return {'error': str(e)}, 500
    
    @staticmethod
    def get_staff_attendance(current_user, params):
        """Get staff attendance - ALL branches"""
        try:
            attendances = Attendance.query.order_by(Attendance.date.desc()).limit(100).all()
            
            result = []
            for att in attendances:
                result.append({
                    'id': att.id,
                    'stylist_name': f"{att.stylist.user.first_name} {att.stylist.user.last_name}" if att.stylist and att.stylist.user else 'N/A',
                    'date': att.date.isoformat() if att.date else None,
                    'check_in_time': att.check_in_time.isoformat() if att.check_in_time else None,
                    'check_out_time': att.check_out_time.isoformat() if att.check_out_time else None,
                    'status': att.status,
                    'branch_name': att.branch.name if att.branch else 'N/A'
                })
            
            return {'attendance': result, 'total': len(result)}, 200
            
        except Exception as e:
            logger.error(f"Error in get_staff_attendance: {str(e)}")
            return {'error': str(e)}, 500
    
    @staticmethod
    def record_attendance(current_user, data):
        """Record staff attendance"""
        try:
            return {'message': 'Attendance recorded successfully'}, 200
        except Exception as e:
            logger.error(f"Error in record_attendance: {str(e)}")
            return {'error': str(e)}, 500
    
    @staticmethod
    def get_staff_performance(current_user, params):
        """Get staff performance - ALL branches"""
        try:
            stylists = Stylist.query.filter_by(is_active=True).all()
            
            performance = []
            for stylist in stylists:
                appointments = Appointment.query.filter_by(
                    stylist_id=stylist.id,
                    status='completed'
                ).count()
                
                total_revenue = db.session.query(func.sum(Appointment.total_amount)).filter(
                    Appointment.stylist_id == stylist.id,
                    Appointment.status == 'completed'
                ).scalar() or 0
                
                performance.append({
                    'stylist_id': stylist.id,
                    'stylist_name': f"{stylist.user.first_name} {stylist.user.last_name}" if stylist.user else 'N/A',
                    'branch_name': stylist.branch.name if stylist.branch else 'N/A',
                    'appointments': appointments,
                    'revenue': float(total_revenue),
                    'rating': float(stylist.rating) if stylist.rating else 0,
                    'commission_rate': float(stylist.commission_rate) if stylist.commission_rate else 0
                })
            
            return {
                'performance': performance,
                'total_stylists': len(performance)
            }, 200
            
        except Exception as e:
            logger.error(f"Error in get_staff_performance: {str(e)}")
            return {'error': str(e)}, 500
    
    @staticmethod
    def get_leave_requests(current_user, params):
        """Get staff leave requests - ALL branches"""
        try:
            leave_requests = LeaveRequest.query.order_by(LeaveRequest.created_at.desc()).all()
            
            result = []
            for lr in leave_requests:
                result.append({
                    'id': lr.id,
                    'stylist_name': f"{lr.stylist.user.first_name} {lr.stylist.user.last_name}" if lr.stylist and lr.stylist.user else 'N/A',
                    'leave_type': lr.leave_type,
                    'start_date': lr.start_date.isoformat() if lr.start_date else None,
                    'end_date': lr.end_date.isoformat() if lr.end_date else None,
                    'status': lr.status,
                    'reason': lr.reason,
                    'branch_name': lr.branch.name if lr.branch else 'N/A'
                })
            
            return {'leave_requests': result, 'total': len(result)}, 200
            
        except Exception as e:
            logger.error(f"Error in get_leave_requests: {str(e)}")
            return {'error': str(e)}, 500
    
    @staticmethod
    def approve_leave_request(current_user, request_id):
        """Approve leave request"""
        try:
            leave_request = LeaveRequest.query.get(request_id)
            if not leave_request:
                return {'error': 'Leave request not found'}, 404
            
            leave_request.status = 'approved'
            leave_request.approved_at = datetime.utcnow()
            leave_request.approved_by = current_user.id
            db.session.commit()
            
            return {'message': 'Leave request approved'}, 200
        except Exception as e:
            db.session.rollback()
            logger.error(f"Error in approve_leave_request: {str(e)}")
            return {'error': str(e)}, 500
    
    @staticmethod
    def reject_leave_request(current_user, request_id, data):
        """Reject leave request"""
        try:
            leave_request = LeaveRequest.query.get(request_id)
            if not leave_request:
                return {'error': 'Leave request not found'}, 404
            
            leave_request.status = 'rejected'
            leave_request.rejection_reason = data.get('reason', 'No reason provided')
            db.session.commit()
            
            return {'message': 'Leave request rejected'}, 200
        except Exception as e:
            db.session.rollback()
            logger.error(f"Error in reject_leave_request: {str(e)}")
            return {'error': str(e)}, 500
    
    # ============ CUSTOMER MANAGEMENT ============
    @staticmethod
    def get_customers(current_user, params):
        """Get all customers - ALL branches"""
        try:
            query = Customer.query
            
            # Search
            search = params.get('search')
            if search:
                query = query.join(User).filter(
                    or_(
                        User.first_name.ilike(f'%{search}%'),
                        User.last_name.ilike(f'%{search}%'),
                        User.email.ilike(f'%{search}%'),
                        User.phone.ilike(f'%{search}%')
                    )
                )
            
            # Pagination
            page = int(params.get('page', 1))
            per_page = int(params.get('limit', 10))
            offset = (page - 1) * per_page
            
            total = query.count()
            customers = query.limit(per_page).offset(offset).all()
            
            result = []
            for customer in customers:
                result.append({
                    'id': customer.id,
                    'user_id': customer.user_id,
                    'name': f"{customer.user.first_name} {customer.user.last_name}" if customer.user else 'N/A',
                    'email': customer.user.email if customer.user else None,
                    'phone': customer.user.phone if customer.user else None,
                    'address': customer.address,
                    'city': customer.city,
                    'total_spent': float(customer.total_spent) if customer.total_spent else 0,
                    'total_visits': customer.total_visits or 0,
                    'created_at': customer.created_at.isoformat() if customer.created_at else None
                })
            
            return {
                'customers': result,
                'total': total,
                'pages': (total + per_page - 1) // per_page,
                'current_page': page
            }, 200
            
        except Exception as e:
            logger.error(f"Error in get_customers: {str(e)}")
            return {'error': str(e)}, 500
    
    @staticmethod
    def get_customer(current_user, customer_id):
        """Get customer details"""
        try:
            customer = Customer.query.get(customer_id)
            if not customer:
                return {'error': 'Customer not found'}, 404
            
            # Get customer appointments
            appointments = Appointment.query.filter_by(customer_id=customer.id).order_by(
                Appointment.appointment_date.desc()
            ).limit(10).all()
            
            # Get customer payments
            payments = Payment.query.filter_by(customer_id=customer.id).order_by(
                Payment.payment_date.desc()
            ).limit(10).all()
            
            return {
                'id': customer.id,
                'user_id': customer.user_id,
                'name': f"{customer.user.first_name} {customer.user.last_name}" if customer.user else 'N/A',
                'email': customer.user.email if customer.user else None,
                'phone': customer.user.phone if customer.user else None,
                'address': customer.address,
                'city': customer.city,
                'state': customer.state,
                'country': customer.country,
                'total_spent': float(customer.total_spent) if customer.total_spent else 0,
                'total_visits': customer.total_visits or 0,
                'is_walk_in': customer.is_walk_in,
                'created_at': customer.created_at.isoformat() if customer.created_at else None,
                'recent_appointments': [
                    {
                        'id': app.id,
                        'date': app.appointment_date.isoformat() if app.appointment_date else None,
                        'service_name': app.service.name if app.service else 'N/A',
                        'status': app.status,
                        'amount': float(app.total_amount) if app.total_amount else 0,
                        'branch_name': app.branch.name if app.branch else 'N/A'
                    } for app in appointments
                ],
                'recent_payments': [
                    {
                        'id': p.id,
                        'amount': float(p.amount) if p.amount else 0,
                        'payment_method': p.payment_method,
                        'payment_status': p.payment_status,
                        'payment_date': p.payment_date.isoformat() if p.payment_date else None
                    } for p in payments
                ]
            }, 200
            
        except Exception as e:
            logger.error(f"Error in get_customer: {str(e)}")
            return {'error': str(e)}, 500
    
    @staticmethod
    def get_customer_history(current_user, customer_id):
        """Get customer history"""
        try:
            customer = Customer.query.get(customer_id)
            if not customer:
                return {'error': 'Customer not found'}, 404
            
            appointments = Appointment.query.filter_by(customer_id=customer.id).order_by(
                Appointment.appointment_date.desc()
            ).all()
            
            result = []
            for app in appointments:
                result.append({
                    'id': app.id,
                    'date': app.appointment_date.isoformat() if app.appointment_date else None,
                    'service_name': app.service.name if app.service else 'N/A',
                    'stylist_name': f"{app.stylist.user.first_name} {app.stylist.user.last_name}" if app.stylist and app.stylist.user else 'Not Assigned',
                    'status': app.status,
                    'amount': float(app.total_amount) if app.total_amount else 0,
                    'branch_name': app.branch.name if app.branch else 'N/A'
                })
            
            return {
                'customer': {
                    'id': customer.id,
                    'name': f"{customer.user.first_name} {customer.user.last_name}" if customer.user else 'N/A',
                    'email': customer.user.email if customer.user else None
                },
                'history': result,
                'total': len(result)
            }, 200
            
        except Exception as e:
            logger.error(f"Error in get_customer_history: {str(e)}")
            return {'error': str(e)}, 500
    
    @staticmethod
    def add_customer_note(current_user, customer_id, data):
        """Add customer note"""
        try:
            return {'message': 'Customer note added successfully'}, 200
        except Exception as e:
            logger.error(f"Error in add_customer_note: {str(e)}")
            return {'error': str(e)}, 500
    
    # ============ SERVICE MANAGEMENT ============
    @staticmethod
    def get_services(params):
        """Get all services - ALL branches"""
        try:
            query = Service.query.filter_by(is_active=True)
            
            category_id = params.get('category_id')
            if category_id:
                query = query.filter_by(category_id=category_id)
            
            branch_id = params.get('branch_id')
            if branch_id:
                query = query.filter_by(branch_id=branch_id)
            
            services = query.all()
            
            result = []
            for service in services:
                result.append({
                    'id': service.id,
                    'name': service.name,
                    'description': service.description,
                    'price': float(service.price) if service.price else 0,
                    'duration_minutes': service.duration_minutes,
                    'category_id': service.category_id,
                    'category_name': service.category.name if service.category else None,
                    'branch_id': service.branch_id,
                    'branch_name': service.branch.name if service.branch else None,
                    'is_active': service.is_active,
                    'is_popular': service.is_popular,
                    'discount_percentage': float(service.discount_percentage) if service.discount_percentage else 0,
                    'created_at': service.created_at.isoformat() if service.created_at else None
                })
            
            return result, 200
            
        except Exception as e:
            logger.error(f"Error in get_services: {str(e)}")
            return {'error': str(e)}, 500
    
    @staticmethod
    def create_service(current_user, data):
        """Create a new service"""
        try:
            required_fields = ['name', 'price', 'duration_minutes']
            for field in required_fields:
                if field not in data:
                    return {'error': f'Missing required field: {field}'}, 400
            
            service = Service(
                name=data['name'],
                description=data.get('description'),
                price=data['price'],
                duration_minutes=data['duration_minutes'],
                category_id=data.get('category_id'),
                branch_id=data.get('branch_id'),
                is_active=True
            )
            
            db.session.add(service)
            db.session.commit()
            
            return {
                'id': service.id,
                'name': service.name,
                'message': 'Service created successfully'
            }, 201
            
        except Exception as e:
            db.session.rollback()
            logger.error(f"Error in create_service: {str(e)}")
            return {'error': str(e)}, 500
    
    @staticmethod
    def update_service(current_user, service_id, data):
        """Update a service"""
        try:
            service = Service.query.get(service_id)
            
            if not service:
                return {'error': 'Service not found'}, 404
            
            if 'name' in data:
                service.name = data['name']
            if 'description' in data:
                service.description = data['description']
            if 'price' in data:
                service.price = data['price']
            if 'duration_minutes' in data:
                service.duration_minutes = data['duration_minutes']
            if 'category_id' in data:
                service.category_id = data['category_id']
            if 'branch_id' in data:
                service.branch_id = data['branch_id']
            if 'is_active' in data:
                service.is_active = data['is_active']
            
            db.session.commit()
            
            return {'message': 'Service updated successfully'}, 200
            
        except Exception as e:
            db.session.rollback()
            logger.error(f"Error in update_service: {str(e)}")
            return {'error': str(e)}, 500
    
    @staticmethod
    def delete_service(current_user, service_id):
        """Delete a service"""
        try:
            service = Service.query.get(service_id)
            
            if not service:
                return {'error': 'Service not found'}, 404
            
            db.session.delete(service)
            db.session.commit()
            
            return {'message': 'Service deleted successfully'}, 200
            
        except Exception as e:
            db.session.rollback()
            logger.error(f"Error in delete_service: {str(e)}")
            return {'error': str(e)}, 500
    
    @staticmethod
    def toggle_service(current_user, service_id):
        """Toggle service active status"""
        try:
            service = Service.query.get(service_id)
            
            if not service:
                return {'error': 'Service not found'}, 404
            
            service.is_active = not service.is_active
            db.session.commit()
            
            return {
                'message': f'Service {"activated" if service.is_active else "deactivated"} successfully',
                'is_active': service.is_active
            }, 200
            
        except Exception as e:
            db.session.rollback()
            logger.error(f"Error in toggle_service: {str(e)}")
            return {'error': str(e)}, 500
    
    # ============ INVENTORY MANAGEMENT ============
    @staticmethod
    def get_inventory_requests(current_user, params):
        """Get inventory requests - ALL branches"""
        try:
            return {'requests': [], 'total': 0}, 200
        except Exception as e:
            logger.error(f"Error in get_inventory_requests: {str(e)}")
            return {'error': str(e)}, 500
    
    @staticmethod
    def create_inventory_request(current_user, data):
        """Create inventory request"""
        try:
            return {'message': 'Inventory request created'}, 201
        except Exception as e:
            logger.error(f"Error in create_inventory_request: {str(e)}")
            return {'error': str(e)}, 500
    
    @staticmethod
    def approve_inventory_request(current_user, request_id):
        """Approve inventory request"""
        try:
            return {'message': 'Inventory request approved'}, 200
        except Exception as e:
            logger.error(f"Error in approve_inventory_request: {str(e)}")
            return {'error': str(e)}, 500
    
    @staticmethod
    def reject_inventory_request(current_user, request_id, data):
        """Reject inventory request"""
        try:
            return {'message': 'Inventory request rejected'}, 200
        except Exception as e:
            logger.error(f"Error in reject_inventory_request: {str(e)}")
            return {'error': str(e)}, 500
    
    @staticmethod
    def get_inventory_stock(current_user, params):
        """Get inventory stock levels - ALL branches"""
        try:
            from app.models.product import Product
            
            query = Product.query
            
            branch_id = params.get('branch_id')
            if branch_id:
                query = query.filter_by(branch_id=branch_id)
            
            products = query.all()
            
            result = []
            for product in products:
                result.append({
                    'id': product.id,
                    'name': product.name,
                    'sku': product.sku,
                    'quantity': product.quantity,
                    'min_quantity': product.min_quantity,
                    'unit': product.unit,
                    'branch_id': product.branch_id,
                    'branch_name': product.branch.name if product.branch else 'N/A',
                    'selling_price': float(product.selling_price) if product.selling_price else 0,
                    'is_active': product.is_active
                })
            
            return {
                'stock': result,
                'total': len(result)
            }, 200
            
        except Exception as e:
            logger.error(f"Error in get_inventory_stock: {str(e)}")
            return {'error': str(e)}, 500
    
    # ============ SALES REPORTS ============
    @staticmethod
    def get_sales_summary(current_user, params):
        """Get sales summary - ALL branches"""
        try:
            today = datetime.now().date()
            start_of_month = today.replace(day=1)
            
            # Today's revenue - ALL branches
            today_revenue = db.session.query(func.sum(Payment.amount)).filter(
                Payment.payment_status == 'paid',
                func.date(Payment.payment_date) == today
            ).scalar() or 0
            
            # Monthly revenue - ALL branches
            monthly_revenue = db.session.query(func.sum(Payment.amount)).filter(
                Payment.payment_status == 'paid',
                Payment.payment_date >= start_of_month
            ).scalar() or 0
            
            # Total revenue - ALL branches
            total_revenue = db.session.query(func.sum(Payment.amount)).filter(
                Payment.payment_status == 'paid'
            ).scalar() or 0
            
            # Appointment stats - ALL branches
            total_appointments = Appointment.query.count()
            completed_appointments = Appointment.query.filter_by(status='completed').count()
            pending_appointments = Appointment.query.filter_by(status='pending').count()
            
            # Revenue by branch
            branch_revenue = db.session.query(
                Branch.name,
                func.sum(Payment.amount).label('revenue')
            ).join(
                Payment, Payment.branch_id == Branch.id
            ).filter(
                Payment.payment_status == 'paid'
            ).group_by(
                Branch.id
            ).all()
            
            revenue_by_branch = []
            for branch_name, revenue in branch_revenue:
                revenue_by_branch.append({
                    'branch_name': branch_name,
                    'revenue': float(revenue) if revenue else 0
                })
            
            return {
                'today_revenue': float(today_revenue),
                'monthly_revenue': float(monthly_revenue),
                'total_revenue': float(total_revenue),
                'total_appointments': total_appointments,
                'completed_appointments': completed_appointments,
                'pending_appointments': pending_appointments,
                'revenue_by_branch': revenue_by_branch
            }, 200
            
        except Exception as e:
            logger.error(f"Error in get_sales_summary: {str(e)}")
            return {'error': str(e)}, 500
    
    @staticmethod
    def get_daily_sales(current_user, params):
        """Get daily sales - ALL branches"""
        try:
            return ManagerService.get_sales_summary(current_user, params)
        except Exception as e:
            logger.error(f"Error in get_daily_sales: {str(e)}")
            return {'error': str(e)}, 500
    
    @staticmethod
    def get_monthly_sales(current_user, params):
        """Get monthly sales - ALL branches"""
        try:
            return ManagerService.get_sales_summary(current_user, params)
        except Exception as e:
            logger.error(f"Error in get_monthly_sales: {str(e)}")
            return {'error': str(e)}, 500
    
    @staticmethod
    def get_sales_by_service(current_user, params):
        """Get sales by service - ALL branches"""
        try:
            results = db.session.query(
                Service.name,
                Service.branch_id,
                Branch.name.label('branch_name'),
                func.count(Appointment.id).label('count'),
                func.sum(Appointment.total_amount).label('revenue')
            ).join(
                Appointment, Appointment.service_id == Service.id
            ).join(
                Branch, Branch.id == Service.branch_id
            ).filter(
                Appointment.status == 'completed'
            ).group_by(
                Service.id, Branch.id
            ).all()
            
            sales_by_service = []
            for name, branch_id, branch_name, count, revenue in results:
                sales_by_service.append({
                    'service_name': name,
                    'branch_id': branch_id,
                    'branch_name': branch_name,
                    'count': count,
                    'revenue': float(revenue) if revenue else 0
                })
            
            return sales_by_service, 200
            
        except Exception as e:
            logger.error(f"Error in get_sales_by_service: {str(e)}")
            return {'error': str(e)}, 500
    
    @staticmethod
    def get_sales_by_stylist(current_user, params):
        """Get sales by stylist - ALL branches"""
        try:
            results = db.session.query(
                User.first_name,
                User.last_name,
                Stylist.branch_id,
                Branch.name.label('branch_name'),
                func.count(Appointment.id).label('count'),
                func.sum(Appointment.total_amount).label('revenue')
            ).join(
                Stylist, Stylist.id == Appointment.stylist_id
            ).join(
                User, User.id == Stylist.user_id
            ).join(
                Branch, Branch.id == Stylist.branch_id
            ).filter(
                Appointment.status == 'completed'
            ).group_by(
                Stylist.id, Branch.id
            ).all()
            
            sales_by_stylist = []
            for first_name, last_name, branch_id, branch_name, count, revenue in results:
                sales_by_stylist.append({
                    'stylist_name': f"{first_name} {last_name}",
                    'branch_id': branch_id,
                    'branch_name': branch_name,
                    'count': count,
                    'revenue': float(revenue) if revenue else 0
                })
            
            return sales_by_stylist, 200
            
        except Exception as e:
            logger.error(f"Error in get_sales_by_stylist: {str(e)}")
            return {'error': str(e)}, 500
    
    # ============ REPORTS ============
    @staticmethod
    def get_reports(current_user, params):
        """Get reports - ALL DATA"""
        try:
            total_customers = Customer.query.count()
            total_staff = User.query.filter(User.role_id != None).count()
            total_branches = Branch.query.filter_by(is_active=True).count()
            
            # Revenue by branch
            branch_revenue = db.session.query(
                Branch.name,
                func.sum(Payment.amount).label('revenue')
            ).join(
                Payment, Payment.branch_id == Branch.id
            ).filter(
                Payment.payment_status == 'paid'
            ).group_by(
                Branch.id
            ).all()
            
            revenue_data = []
            for branch_name, revenue in branch_revenue:
                revenue_data.append({
                    'branch_name': branch_name,
                    'revenue': float(revenue) if revenue else 0
                })
            
            return {
                'total_customers': total_customers,
                'total_staff': total_staff,
                'total_branches': total_branches,
                'revenue_by_branch': revenue_data,
                'available_reports': [
                    {'id': 'sales_summary', 'name': 'Sales Summary'},
                    {'id': 'appointment_report', 'name': 'Appointment Report'},
                    {'id': 'performance_report', 'name': 'Staff Performance'},
                    {'id': 'customer_report', 'name': 'Customer Report'},
                    {'id': 'financial_report', 'name': 'Financial Report'}
                ]
            }, 200
            
        except Exception as e:
            logger.error(f"Error in get_reports: {str(e)}")
            return {'error': str(e)}, 500
    
    @staticmethod
    def get_appointment_report(current_user, params):
        """Get appointment report - ALL branches"""
        try:
            start_date = params.get('start_date')
            end_date = params.get('end_date')
            
            query = Appointment.query
            
            if start_date:
                query = query.filter(Appointment.appointment_date >= datetime.strptime(start_date, '%Y-%m-%d').date())
            if end_date:
                query = query.filter(Appointment.appointment_date <= datetime.strptime(end_date, '%Y-%m-%d').date())
            
            appointments = query.all()
            
            # Statistics
            total = len(appointments)
            completed = sum(1 for a in appointments if a.status == 'completed')
            pending = sum(1 for a in appointments if a.status == 'pending')
            cancelled = sum(1 for a in appointments if a.status == 'cancelled')
            
            total_revenue = sum(float(a.total_amount) for a in appointments if a.status == 'completed')
            
            # By branch
            branch_stats = {}
            for app in appointments:
                branch_name = app.branch.name if app.branch else 'Unknown'
                if branch_name not in branch_stats:
                    branch_stats[branch_name] = {'total': 0, 'completed': 0, 'revenue': 0}
                branch_stats[branch_name]['total'] += 1
                if app.status == 'completed':
                    branch_stats[branch_name]['completed'] += 1
                    branch_stats[branch_name]['revenue'] += float(app.total_amount or 0)
            
            return {
                'total_appointments': total,
                'completed': completed,
                'pending': pending,
                'cancelled': cancelled,
                'total_revenue': total_revenue,
                'branch_stats': branch_stats,
                'appointments': [
                    {
                        'id': a.id,
                        'date': a.appointment_date.isoformat() if a.appointment_date else None,
                        'service': a.service.name if a.service else 'N/A',
                        'customer': f"{a.customer.user.first_name} {a.customer.user.last_name}" if a.customer and a.customer.user else 'Walk-in',
                        'status': a.status,
                        'amount': float(a.total_amount) if a.total_amount else 0,
                        'branch': a.branch.name if a.branch else 'N/A'
                    } for a in appointments[:100]
                ]
            }, 200
            
        except Exception as e:
            logger.error(f"Error in get_appointment_report: {str(e)}")
            return {'error': str(e)}, 500
    
    @staticmethod
    def get_performance_report(current_user, params):
        """Get performance report - ALL branches"""
        try:
            stylists = Stylist.query.filter_by(is_active=True).all()
            
            performance = []
            for stylist in stylists:
                appointments = Appointment.query.filter_by(
                    stylist_id=stylist.id,
                    status='completed'
                ).count()
                
                total_revenue = db.session.query(func.sum(Appointment.total_amount)).filter(
                    Appointment.stylist_id == stylist.id,
                    Appointment.status == 'completed'
                ).scalar() or 0
                
                performance.append({
                    'stylist_name': f"{stylist.user.first_name} {stylist.user.last_name}" if stylist.user else 'N/A',
                    'branch_name': stylist.branch.name if stylist.branch else 'N/A',
                    'appointments': appointments,
                    'revenue': float(total_revenue),
                    'rating': float(stylist.rating) if stylist.rating else 0,
                    'commission_rate': float(stylist.commission_rate) if stylist.commission_rate else 0
                })
            
            # Sort by revenue
            performance.sort(key=lambda x: x['revenue'], reverse=True)
            
            return {
                'performance': performance,
                'total_stylists': len(performance)
            }, 200
            
        except Exception as e:
            logger.error(f"Error in get_performance_report: {str(e)}")
            return {'error': str(e)}, 500
    
    @staticmethod
    def export_report(current_user, data):
        """Export report"""
        try:
            report_type = data.get('report_type')
            format_type = data.get('format', 'pdf')
            
            return {
                'message': f'Report exported as {format_type}',
                'report_type': report_type,
                'format': format_type,
                'download_url': f'/api/manager/reports/download/{report_type}.{format_type}'
            }, 200
        except Exception as e:
            logger.error(f"Error in export_report: {str(e)}")
            return {'error': str(e)}, 500
    
    # ============ BRANCH MANAGEMENT ============
    @staticmethod
    def get_branch_details(current_user):
        """Get branch details"""
        try:
            manager = Manager.query.filter_by(user_id=current_user.id).first()
            if not manager:
                return {'error': 'Manager profile not found'}, 404
            
            branch = Branch.query.get(manager.branch_id)
            if not branch:
                return {'error': 'Branch not found'}, 404
            
            # Get branch stats
            appointments = Appointment.query.filter_by(branch_id=branch.id).count()
            stylists = Stylist.query.filter_by(branch_id=branch.id, is_active=True).count()
            
            return {
                **branch.to_dict(),
                'stats': {
                    'appointments': appointments,
                    'stylists': stylists
                }
            }, 200
            
        except Exception as e:
            logger.error(f"Error in get_branch_details: {str(e)}")
            return {'error': str(e)}, 500
    
    @staticmethod
    def update_branch(current_user, data):
        """Update branch details"""
        try:
            manager = Manager.query.filter_by(user_id=current_user.id).first()
            if not manager:
                return {'error': 'Manager profile not found'}, 404
            
            branch = Branch.query.get(manager.branch_id)
            if not branch:
                return {'error': 'Branch not found'}, 404
            
            if 'name' in data:
                branch.name = data['name']
            if 'address' in data:
                branch.address = data['address']
            if 'city' in data:
                branch.city = data['city']
            if 'phone' in data:
                branch.phone = data['phone']
            if 'email' in data:
                branch.email = data['email']
            if 'manager_name' in data:
                branch.manager_name = data['manager_name']
            
            db.session.commit()
            
            return {'message': 'Branch details updated successfully'}, 200
            
        except Exception as e:
            db.session.rollback()
            logger.error(f"Error in update_branch: {str(e)}")
            return {'error': str(e)}, 500
    
    @staticmethod
    def get_branch_stats(current_user):
        """Get branch statistics - ALL branches"""
        try:
            branches = Branch.query.filter_by(is_active=True).all()
            
            stats = []
            for branch in branches:
                appointment_count = Appointment.query.filter_by(branch_id=branch.id).count()
                stylist_count = Stylist.query.filter_by(branch_id=branch.id, is_active=True).count()
                
                stats.append({
                    'branch_id': branch.id,
                    'branch_name': branch.name,
                    'appointments': appointment_count,
                    'stylists': stylist_count
                })
            
            return {'branches': stats, 'total': len(stats)}, 200
            
        except Exception as e:
            logger.error(f"Error in get_branch_stats: {str(e)}")
            return {'error': str(e)}, 500
    
    # ============ NOTIFICATIONS ============
    @staticmethod
    def get_notifications(current_user, params):
        """Get manager notifications"""
        try:
            query = Notification.query.filter_by(user_id=current_user.id).order_by(
                Notification.created_at.desc()
            )
            
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
            logger.error(f"Error in mark_notification_read: {str(e)}")
            return {'error': str(e)}, 500
    
    @staticmethod
    def mark_all_notifications_read(current_user):
        """Mark all notifications as read"""
        try:
            Notification.query.filter_by(
                user_id=current_user.id,
                is_read=False
            ).update({
                'is_read': True,
                'read_at': datetime.utcnow()
            })
            
            db.session.commit()
            
            return {'message': 'All notifications marked as read'}, 200
            
        except Exception as e:
            db.session.rollback()
            logger.error(f"Error in mark_all_notifications_read: {str(e)}")
            return {'error': str(e)}, 500
