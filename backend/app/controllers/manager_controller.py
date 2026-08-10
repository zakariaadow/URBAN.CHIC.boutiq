from flask import jsonify
from app.models.user import User
from app.models.customer import Customer
from app.models.appointment import Appointment
from app.models.stylist import Stylist
from app.models.receptionist import Receptionist
from app.models.finance import Finance
from app.models.inventory import Inventory
from app.models.manager import Manager
from app.models.branch import Branch
from app.models.notification import Notification
from app.models.report import Report
from app.models.leave_request import LeaveRequest
from app.models.product import Product
from app.models.service import Service
from app.models.review import Review
from app.models.payment import Payment
from app.models.role import Role
from app.models.attendance import Attendance
from app.models.purchase import Purchase
from app.extensions import db
from sqlalchemy import func, and_, or_, desc, asc, extract
from datetime import datetime, timedelta
import logging
import json

logger = logging.getLogger(__name__)

class ManagerController:
    
    # ==================== DASHBOARD ====================
    @staticmethod
    def get_dashboard(current_user):
        """Get manager dashboard data - ALL DATA"""
        try:
            # Today's date
            today = datetime.now().date()
            
            # ALL Appointments (not just today)
            total_appointments = Appointment.query.count()
            
            # Today's appointments
            today_appointments = Appointment.query.filter(
                Appointment.appointment_date == today
            ).count()
            
            # ALL Revenue
            total_revenue = db.session.query(
                func.sum(Appointment.final_amount)
            ).filter(
                Appointment.status == 'completed'
            ).scalar() or 0
            
            # Today's revenue
            today_revenue = db.session.query(
                func.sum(Appointment.final_amount)
            ).filter(
                Appointment.appointment_date == today,
                Appointment.status == 'completed'
            ).scalar() or 0
            
            # Pending leave requests
            pending_leave = LeaveRequest.query.filter_by(
                status='pending'
            ).count()
            
            # Low stock products
            low_stock = Product.query.filter(
                Product.quantity <= Product.min_quantity,
                Product.is_active == True
            ).count()
            
            # ALL Staff - using role-specific tables
            stylist_count = Stylist.query.count()
            receptionist_count = Receptionist.query.count()
            finance_count = Finance.query.count()
            inventory_count = Inventory.query.count()
            manager_count = Manager.query.count()
            
            total_staff = stylist_count + receptionist_count + finance_count + inventory_count + manager_count
            
            # ALL Customers
            total_customers = Customer.query.count()
            
            # Pending approvals
            pending_approvals = User.query.filter_by(
                is_approved=False,
                is_active=True
            ).count()
            
            # Appointments by status
            pending_appointments = Appointment.query.filter_by(status='pending').count()
            confirmed_appointments = Appointment.query.filter_by(status='confirmed').count()
            completed_appointments = Appointment.query.filter_by(status='completed').count()
            cancelled_appointments = Appointment.query.filter_by(status='cancelled').count()
            
            # ALL Notifications
            total_notifications = Notification.query.filter_by(user_id=current_user.id).count()
            unread_notifications = Notification.query.filter_by(
                user_id=current_user.id,
                is_read=False
            ).count()
            
            # Appointments by branch
            branches = Branch.query.all()
            appointments_by_branch = {}
            for branch in branches:
                count = Appointment.query.filter_by(branch_id=branch.id).count()
                if count > 0:
                    appointments_by_branch[branch.name] = count
            
            return {
                'total_appointments': total_appointments,
                'today_appointments': today_appointments,
                'total_revenue': float(total_revenue),
                'today_revenue': float(today_revenue),
                'pending_leave': pending_leave,
                'low_stock': low_stock,
                'total_staff': total_staff,
                'total_customers': total_customers,
                'pending_approvals': pending_approvals,
                'appointments_by_status': {
                    'pending': pending_appointments,
                    'confirmed': confirmed_appointments,
                    'completed': completed_appointments,
                    'cancelled': cancelled_appointments
                },
                'appointments_by_branch': appointments_by_branch,
                'notifications': {
                    'total': total_notifications,
                    'unread': unread_notifications
                }
            }, 200
            
        except Exception as e:
            logger.error(f"Error in manager dashboard: {str(e)}")
            return {'error': str(e)}, 500
    
    # ==================== APPOINTMENTS ====================
    @staticmethod
    def get_all_appointments(current_user, params):
        """Get ALL appointments with filters - SHOW ALL APPOINTMENTS"""
        try:
            page = int(params.get('page', 1))
            limit = int(params.get('limit', 10))
            status = params.get('status')
            start_date = params.get('start_date')
            end_date = params.get('end_date')
            search = params.get('search')
            branch_id = params.get('branch_id')
            
            query = Appointment.query
            
            # Apply filters
            if status and status != 'all':
                query = query.filter_by(status=status)
            
            if start_date:
                query = query.filter(Appointment.appointment_date >= datetime.strptime(start_date, '%Y-%m-%d').date())
            
            if end_date:
                query = query.filter(Appointment.appointment_date <= datetime.strptime(end_date, '%Y-%m-%d').date())
            
            if branch_id and branch_id != 'all':
                query = query.filter_by(branch_id=int(branch_id))
            
            if search:
                query = query.join(Customer).join(User).filter(
                    or_(
                        User.first_name.ilike(f'%{search}%'),
                        User.last_name.ilike(f'%{search}%'),
                        Appointment.notes.ilike(f'%{search}%')
                    )
                )
            
            # Pagination
            total = query.count()
            appointments = query.order_by(desc(Appointment.appointment_date), desc(Appointment.appointment_time))\
                .offset((page - 1) * limit).limit(limit).all()
            
            result = []
            for appt in appointments:
                customer = Customer.query.get(appt.customer_id)
                user = User.query.get(customer.user_id) if customer else None
                service = Service.query.get(appt.service_id)
                stylist = Stylist.query.get(appt.stylist_id) if appt.stylist_id else None
                stylist_user = User.query.get(stylist.user_id) if stylist else None
                branch = Branch.query.get(appt.branch_id)
                
                # Convert time to string for JSON serialization
                appt_time = str(appt.appointment_time) if appt.appointment_time else None
                
                result.append({
                    'id': appt.id,
                    'customer_name': f"{user.first_name} {user.last_name}" if user else 'Walk-in',
                    'customer_email': user.email if user else 'N/A',
                    'customer_phone': user.phone if user else 'N/A',
                    'service_name': service.name if service else 'N/A',
                    'service_price': float(service.price) if service and service.price else 0,
                    'stylist_name': f"{stylist_user.first_name} {stylist_user.last_name}" if stylist_user else 'Not Assigned',
                    'branch_name': branch.name if branch else 'N/A',
                    'branch_id': branch.id if branch else None,
                    'appointment_date': appt.appointment_date.isoformat() if appt.appointment_date else None,
                    'appointment_time': appt_time,
                    'status': appt.status,
                    'total_amount': float(appt.total_amount or 0),
                    'final_amount': float(appt.final_amount or 0),
                    'is_walk_in': appt.is_walk_in,
                    'is_rescheduled': appt.is_rescheduled,
                    'notes': appt.notes,
                    'paid': appt.paid,
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
    def get_daily_appointments(current_user, params):
        """Get appointments for a specific date"""
        try:
            date_str = params.get('date')
            if date_str:
                date = datetime.strptime(date_str, '%Y-%m-%d').date()
            else:
                date = datetime.now().date()
            
            appointments = Appointment.query.filter_by(
                appointment_date=date
            ).order_by(Appointment.appointment_time).all()
            
            result = []
            for appt in appointments:
                customer = Customer.query.get(appt.customer_id)
                user = User.query.get(customer.user_id) if customer else None
                service = Service.query.get(appt.service_id)
                stylist = Stylist.query.get(appt.stylist_id) if appt.stylist_id else None
                stylist_user = User.query.get(stylist.user_id) if stylist else None
                branch = Branch.query.get(appt.branch_id)
                
                appt_time = str(appt.appointment_time) if appt.appointment_time else None
                
                result.append({
                    'id': appt.id,
                    'customer_name': f"{user.first_name} {user.last_name}" if user else 'Walk-in',
                    'service_name': service.name if service else 'N/A',
                    'stylist_name': f"{stylist_user.first_name} {stylist_user.last_name}" if stylist_user else 'Not Assigned',
                    'branch_name': branch.name if branch else 'N/A',
                    'appointment_time': appt_time,
                    'status': appt.status,
                    'final_amount': float(appt.final_amount or 0)
                })
            
            return result, 200
            
        except Exception as e:
            logger.error(f"Error getting daily appointments: {str(e)}")
            return {'error': str(e)}, 500
    
    @staticmethod
    def get_appointment_by_id(current_user, appointment_id):
        """Get appointment details by ID"""
        try:
            appointment = Appointment.query.get(appointment_id)
            if not appointment:
                return {'error': 'Appointment not found'}, 404
            
            customer = Customer.query.get(appointment.customer_id)
            user = User.query.get(customer.user_id) if customer else None
            service = Service.query.get(appointment.service_id)
            stylist = Stylist.query.get(appointment.stylist_id) if appointment.stylist_id else None
            stylist_user = User.query.get(stylist.user_id) if stylist else None
            branch = Branch.query.get(appointment.branch_id)
            
            appt_time = str(appointment.appointment_time) if appointment.appointment_time else None
            
            # Get payments
            payments = Payment.query.filter_by(appointment_id=appointment.id).all()
            
            return {
                'id': appointment.id,
                'customer': {
                    'id': user.id if user else None,
                    'name': f"{user.first_name} {user.last_name}" if user else 'Unknown',
                    'email': user.email if user else 'N/A',
                    'phone': user.phone if user else 'N/A'
                },
                'service': {
                    'id': service.id if service else None,
                    'name': service.name if service else 'N/A',
                    'price': float(service.price) if service and service.price else 0,
                    'duration': service.duration if service else 0
                },
                'stylist': {
                    'id': stylist.id if stylist else None,
                    'name': f"{stylist_user.first_name} {stylist_user.last_name}" if stylist_user else 'Not Assigned'
                },
                'branch': {
                    'id': branch.id if branch else None,
                    'name': branch.name if branch else 'N/A',
                    'address': branch.address if branch else 'N/A'
                },
                'appointment_date': appointment.appointment_date.isoformat() if appointment.appointment_date else None,
                'appointment_time': appt_time,
                'status': appointment.status,
                'total_amount': float(appointment.total_amount or 0),
                'final_amount': float(appointment.final_amount or 0),
                'is_walk_in': appointment.is_walk_in,
                'notes': appointment.notes,
                'customer_notes': appointment.customer_notes,
                'stylist_notes': appointment.stylist_notes,
                'paid': appointment.paid,
                'payments': [p.to_dict() for p in payments],
                'created_at': appointment.created_at.isoformat() if appointment.created_at else None
            }, 200
            
        except Exception as e:
            logger.error(f"Error getting appointment: {str(e)}")
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
            
            valid_statuses = ['pending', 'confirmed', 'in-progress', 'completed', 'cancelled', 'no-show']
            if new_status not in valid_statuses:
                return {'error': f'Invalid status. Must be one of: {", ".join(valid_statuses)}'}, 400
            
            appointment.status = new_status
            
            # If completed, set completion time
            if new_status == 'completed':
                appointment.completion_time = datetime.utcnow()
            
            # If cancelled, add cancellation reason
            if new_status == 'cancelled':
                appointment.notes = data.get('cancellation_reason', appointment.notes)
            
            db.session.commit()
            
            return {'message': f'Appointment status updated to {new_status}'}, 200
            
        except Exception as e:
            db.session.rollback()
            logger.error(f"Error updating appointment status: {str(e)}")
            return {'error': str(e)}, 500
    
    # ==================== STAFF MANAGEMENT ====================
    @staticmethod
    def get_staff(current_user):
        """Get ALL staff members"""
        try:
            # Get all staff from role-specific tables
            staff_list = []
            
            # Get stylists
            stylists = Stylist.query.all()
            for stylist in stylists:
                user = User.query.get(stylist.user_id)
                if user:
                    staff_list.append({
                        'id': user.id,
                        'name': f"{user.first_name} {user.last_name}",
                        'email': user.email,
                        'phone': user.phone,
                        'role': 'stylist',
                        'status': 'active' if user.is_active else 'inactive',
                        'is_approved': user.is_approved,
                        'is_verified': user.is_verified,
                        'created_at': user.created_at.isoformat() if user.created_at else None,
                        'last_login': user.last_login.isoformat() if user.last_login else None,
                        'branch_id': stylist.branch_id
                    })
            
            # Get receptionists
            receptionists = Receptionist.query.all()
            for receptionist in receptionists:
                user = User.query.get(receptionist.user_id)
                if user:
                    staff_list.append({
                        'id': user.id,
                        'name': f"{user.first_name} {user.last_name}",
                        'email': user.email,
                        'phone': user.phone,
                        'role': 'receptionist',
                        'status': 'active' if user.is_active else 'inactive',
                        'is_approved': user.is_approved,
                        'is_verified': user.is_verified,
                        'created_at': user.created_at.isoformat() if user.created_at else None,
                        'last_login': user.last_login.isoformat() if user.last_login else None,
                        'branch_id': receptionist.branch_id
                    })
            
            # Get finances
            finances = Finance.query.all()
            for finance in finances:
                user = User.query.get(finance.user_id)
                if user:
                    staff_list.append({
                        'id': user.id,
                        'name': f"{user.first_name} {user.last_name}",
                        'email': user.email,
                        'phone': user.phone,
                        'role': 'finance',
                        'status': 'active' if user.is_active else 'inactive',
                        'is_approved': user.is_approved,
                        'is_verified': user.is_verified,
                        'created_at': user.created_at.isoformat() if user.created_at else None,
                        'last_login': user.last_login.isoformat() if user.last_login else None,
                        'branch_id': finance.branch_id
                    })
            
            # Get inventory officers
            inventories = Inventory.query.all()
            for inventory in inventories:
                user = User.query.get(inventory.user_id)
                if user:
                    staff_list.append({
                        'id': user.id,
                        'name': f"{user.first_name} {user.last_name}",
                        'email': user.email,
                        'phone': user.phone,
                        'role': 'inventory',
                        'status': 'active' if user.is_active else 'inactive',
                        'is_approved': user.is_approved,
                        'is_verified': user.is_verified,
                        'created_at': user.created_at.isoformat() if user.created_at else None,
                        'last_login': user.last_login.isoformat() if user.last_login else None,
                        'branch_id': inventory.branch_id
                    })
            
            # Get managers
            managers = Manager.query.all()
            for manager in managers:
                user = User.query.get(manager.user_id)
                if user:
                    staff_list.append({
                        'id': user.id,
                        'name': f"{user.first_name} {user.last_name}",
                        'email': user.email,
                        'phone': user.phone,
                        'role': 'manager',
                        'status': 'active' if user.is_active else 'inactive',
                        'is_approved': user.is_approved,
                        'is_verified': user.is_verified,
                        'created_at': user.created_at.isoformat() if user.created_at else None,
                        'last_login': user.last_login.isoformat() if user.last_login else None,
                        'branch_id': manager.branch_id
                    })
            
            return staff_list, 200
            
        except Exception as e:
            logger.error(f"Error getting staff: {str(e)}")
            return {'error': str(e)}, 500
    
    @staticmethod
    def get_staff_schedules(current_user, params):
        """Get staff schedules for a specific date"""
        try:
            date_str = params.get('date')
            if date_str:
                date = datetime.strptime(date_str, '%Y-%m-%d').date()
            else:
                date = datetime.now().date()
            
            stylists = Stylist.query.all()
            schedules = []
            
            for stylist in stylists:
                user = User.query.get(stylist.user_id)
                appointments = Appointment.query.filter(
                    Appointment.stylist_id == stylist.id,
                    Appointment.appointment_date == date
                ).order_by(Appointment.appointment_time).all()
                
                schedule_appointments = []
                for appt in appointments:
                    appt_time = str(appt.appointment_time) if appt.appointment_time else None
                    customer = Customer.query.get(appt.customer_id)
                    customer_user = User.query.get(customer.user_id) if customer else None
                    
                    schedule_appointments.append({
                        'id': appt.id,
                        'time': appt_time,
                        'customer_name': f"{customer_user.first_name} {customer_user.last_name}" if customer_user else 'Walk-in',
                        'service': Service.query.get(appt.service_id).name if appt.service_id else 'N/A',
                        'status': appt.status,
                        'duration': appt.duration
                    })
                
                schedules.append({
                    'stylist_id': stylist.id,
                    'stylist_name': f"{user.first_name} {user.last_name}" if user else 'Unknown',
                    'appointments': schedule_appointments
                })
            
            return schedules, 200
            
        except Exception as e:
            logger.error(f"Error getting staff schedules: {str(e)}")
            return {'error': str(e)}, 500
    
    @staticmethod
    def get_staff_performance(current_user, params):
        """Get ALL staff performance data"""
        try:
            range_type = params.get('range', 'all')
            
            # Calculate date range
            end_date = datetime.now()
            if range_type == 'weekly':
                start_date = end_date - timedelta(days=7)
            elif range_type == 'monthly':
                start_date = end_date - timedelta(days=30)
            elif range_type == 'quarterly':
                start_date = end_date - timedelta(days=90)
            elif range_type == 'yearly':
                start_date = end_date - timedelta(days=365)
            else:  # 'all'
                start_date = datetime(2000, 1, 1)  # From beginning
            
            # Get all stylists
            stylists = Stylist.query.all()
            
            performance_data = []
            for stylist in stylists:
                user = User.query.get(stylist.user_id)
                
                # Get appointments for this stylist
                appointments = Appointment.query.filter(
                    Appointment.stylist_id == stylist.id,
                    Appointment.appointment_date >= start_date.date(),
                    Appointment.appointment_date <= end_date.date()
                ).all()
                
                total_appointments = len(appointments)
                completed_appointments = [a for a in appointments if a.status == 'completed']
                total_completed = len(completed_appointments)
                total_revenue = sum(a.final_amount or 0 for a in completed_appointments)
                
                # Get reviews for this stylist
                reviews = Review.query.filter_by(stylist_id=stylist.id).all()
                avg_rating = 0
                if reviews:
                    avg_rating = sum(r.rating for r in reviews) / len(reviews)
                
                # Calculate performance score
                performance_score = 0
                if total_completed > 0:
                    appointment_score = min((total_completed / 10) * 40, 40)
                    rating_score = (avg_rating / 5) * 60
                    performance_score = appointment_score + rating_score
                
                performance_data.append({
                    'id': stylist.id,
                    'name': f"{user.first_name} {user.last_name}" if user else 'Unknown',
                    'role': 'Stylist',
                    'total_appointments': total_appointments,
                    'completed_appointments': total_completed,
                    'completion_rate': (total_completed / total_appointments * 100) if total_appointments > 0 else 0,
                    'revenue': float(total_revenue),
                    'avg_rating': float(avg_rating),
                    'performance_score': float(performance_score),
                    'reviews_count': len(reviews)
                })
            
            # Sort by performance score
            performance_data.sort(key=lambda x: x['performance_score'], reverse=True)
            
            return performance_data, 200
            
        except Exception as e:
            logger.error(f"Error getting staff performance: {str(e)}")
            return {'error': str(e)}, 500
    
    @staticmethod
    def get_staff_attendance(current_user, params):
        """Get staff attendance"""
        try:
            date_str = params.get('date')
            if date_str:
                date = datetime.strptime(date_str, '%Y-%m-%d').date()
            else:
                date = datetime.now().date()
            
            # Get all staff users
            staff_users = []
            
            # Get stylists
            for stylist in Stylist.query.all():
                user = User.query.get(stylist.user_id)
                if user:
                    staff_users.append(user)
            
            # Get receptionists
            for receptionist in Receptionist.query.all():
                user = User.query.get(receptionist.user_id)
                if user:
                    staff_users.append(user)
            
            # Get finances
            for finance in Finance.query.all():
                user = User.query.get(finance.user_id)
                if user:
                    staff_users.append(user)
            
            # Get inventory officers
            for inventory in Inventory.query.all():
                user = User.query.get(inventory.user_id)
                if user:
                    staff_users.append(user)
            
            # Get managers
            for manager in Manager.query.all():
                user = User.query.get(manager.user_id)
                if user:
                    staff_users.append(user)
            
            attendance_data = []
            for user in staff_users:
                attendance = Attendance.query.filter_by(
                    user_id=user.id,
                    date=date
                ).first()
                
                attendance_data.append({
                    'user_id': user.id,
                    'name': f"{user.first_name} {user.last_name}",
                    'role': user.role.name if user.role else None,
                    'status': attendance.status if attendance else 'absent',
                    'check_in': attendance.check_in.isoformat() if attendance and attendance.check_in else None,
                    'check_out': attendance.check_out.isoformat() if attendance and attendance.check_out else None
                })
            
            return attendance_data, 200
            
        except Exception as e:
            logger.error(f"Error getting staff attendance: {str(e)}")
            return {'error': str(e)}, 500
    
    # ==================== CUSTOMERS ====================
    @staticmethod
    def get_all_customers(current_user, params):
        """Get ALL customers with filters"""
        try:
            page = int(params.get('page', 1))
            limit = int(params.get('limit', 10))
            search = params.get('search')
            is_walk_in = params.get('is_walk_in')
            min_spent = params.get('min_spent')
            max_spent = params.get('max_spent')
            
            query = Customer.query
            
            if search:
                query = query.join(User).filter(
                    or_(
                        User.first_name.ilike(f'%{search}%'),
                        User.last_name.ilike(f'%{search}%'),
                        User.email.ilike(f'%{search}%'),
                        User.phone.ilike(f'%{search}%'),
                        Customer.address.ilike(f'%{search}%'),
                        Customer.city.ilike(f'%{search}%')
                    )
                )
            
            if is_walk_in is not None:
                query = query.filter_by(is_walk_in=is_walk_in == 'true')
            
            if min_spent:
                query = query.filter(Customer.total_spent >= float(min_spent))
            
            if max_spent:
                query = query.filter(Customer.total_spent <= float(max_spent))
            
            total = query.count()
            customers = query.order_by(desc(Customer.total_spent), desc(Customer.created_at))\
                .offset((page - 1) * limit).limit(limit).all()
            
            result = []
            for customer in customers:
                user = User.query.get(customer.user_id)
                appointments = Appointment.query.filter_by(customer_id=customer.id).count()
                completed_appointments = Appointment.query.filter_by(customer_id=customer.id, status='completed').count()
                payments = Payment.query.filter_by(customer_id=customer.id).count()
                paid_payments = Payment.query.filter_by(customer_id=customer.id, payment_status='paid').count()
                reviews = Review.query.filter_by(customer_id=customer.id).count()
                
                last_appointment = Appointment.query.filter_by(
                    customer_id=customer.id
                ).order_by(desc(Appointment.appointment_date), desc(Appointment.appointment_time)).first()
                
                result.append({
                    'id': customer.id,
                    'user_id': user.id if user else None,
                    'name': f"{user.first_name} {user.last_name}" if user else 'Unknown',
                    'email': user.email if user else 'N/A',
                    'phone': user.phone if user else 'N/A',
                    'address': customer.address,
                    'city': customer.city,
                    'state': customer.state,
                    'country': customer.country,
                    'total_spent': float(customer.total_spent or 0),
                    'total_visits': customer.total_visits or 0,
                    'is_walk_in': customer.is_walk_in,
                    'appointments_count': appointments,
                    'completed_appointments': completed_appointments,
                    'payments_count': payments,
                    'paid_payments': paid_payments,
                    'reviews_count': reviews,
                    'last_visit': last_appointment.appointment_date.isoformat() if last_appointment else None,
                    'created_at': customer.created_at.isoformat() if customer.created_at else None
                })
            
            return {
                'customers': result,
                'total': total,
                'page': page,
                'limit': limit,
                'pages': (total + limit - 1) // limit if total > 0 else 1
            }, 200
            
        except Exception as e:
            logger.error(f"Error getting customers: {str(e)}")
            return {'error': str(e)}, 500
    
    @staticmethod
    def get_customer_details(current_user, customer_id):
        """Get ALL customer details"""
        try:
            customer = Customer.query.get(customer_id)
            if not customer:
                return {'error': 'Customer not found'}, 404
            
            user = User.query.get(customer.user_id)
            
            appointments = Appointment.query.filter_by(customer_id=customer.id).order_by(
                desc(Appointment.appointment_date), desc(Appointment.appointment_time)
            ).all()
            
            payments = Payment.query.filter_by(customer_id=customer.id).order_by(
                desc(Payment.payment_date)
            ).all()
            
            reviews = Review.query.filter_by(customer_id=customer.id).order_by(
                desc(Review.created_at)
            ).all()
            
            from app.models.loyalty import Loyalty
            loyalty = Loyalty.query.filter_by(customer_id=customer.id).first()
            
            total_appointments = len(appointments)
            completed_appointments = [a for a in appointments if a.status == 'completed']
            cancelled_appointments = [a for a in appointments if a.status == 'cancelled']
            total_paid = sum(p.amount or 0 for p in payments if p.payment_status == 'paid')
            
            return {
                'customer': {
                    'id': customer.id,
                    'user_id': user.id if user else None,
                    'name': f"{user.first_name} {user.last_name}" if user else 'Unknown',
                    'email': user.email if user else 'N/A',
                    'phone': user.phone if user else 'N/A',
                    'address': customer.address,
                    'city': customer.city,
                    'state': customer.state,
                    'country': customer.country,
                    'postal_code': customer.postal_code,
                    'total_spent': float(customer.total_spent or 0),
                    'total_visits': customer.total_visits or 0,
                    'is_walk_in': customer.is_walk_in,
                    'created_at': customer.created_at.isoformat() if customer.created_at else None
                },
                'statistics': {
                    'total_appointments': total_appointments,
                    'completed_appointments': len(completed_appointments),
                    'cancelled_appointments': len(cancelled_appointments),
                    'completion_rate': (len(completed_appointments) / total_appointments * 100) if total_appointments > 0 else 0,
                    'total_payments': len(payments),
                    'total_paid': float(total_paid),
                    'total_reviews': len(reviews),
                    'avg_rating': sum(r.rating for r in reviews) / len(reviews) if reviews else 0,
                    'loyalty_points': loyalty.points if loyalty else 0
                },
                'appointments': [
                    {
                        'id': a.id,
                        'date': a.appointment_date.isoformat() if a.appointment_date else None,
                        'time': str(a.appointment_time) if a.appointment_time else None,
                        'service': Service.query.get(a.service_id).name if a.service_id else 'N/A',
                        'status': a.status,
                        'amount': float(a.final_amount or 0),
                        'stylist': f"{User.query.get(Stylist.query.get(a.stylist_id).user_id).first_name} {User.query.get(Stylist.query.get(a.stylist_id).user_id).last_name}" if a.stylist_id else 'Not Assigned'
                    } for a in appointments
                ],
                'payments': [
                    {
                        'id': p.id,
                        'amount': float(p.amount or 0),
                        'payment_method': p.payment_method,
                        'status': p.payment_status,
                        'date': p.payment_date.isoformat() if p.payment_date else None,
                        'reference': p.reference_number
                    } for p in payments
                ],
                'reviews': [
                    {
                        'id': r.id,
                        'rating': r.rating,
                        'comment': r.comment,
                        'service': Service.query.get(r.service_id).name if r.service_id else 'N/A',
                        'created_at': r.created_at.isoformat() if r.created_at else None
                    } for r in reviews
                ]
            }, 200
            
        except Exception as e:
            logger.error(f"Error getting customer details: {str(e)}")
            return {'error': str(e)}, 500
    
    # ==================== BRANCHES ====================
    @staticmethod
    def get_branches(current_user):
        """Get ALL branches with full details"""
        try:
            branches = Branch.query.all()
            
            result = []
            for branch in branches:
                # Get staff count from all role-specific tables
                stylist_count = Stylist.query.filter_by(branch_id=branch.id).count()
                receptionist_count = Receptionist.query.filter_by(branch_id=branch.id).count()
                finance_count = Finance.query.filter_by(branch_id=branch.id).count()
                inventory_count = Inventory.query.filter_by(branch_id=branch.id).count()
                manager_count = Manager.query.filter_by(branch_id=branch.id).count()
                
                staff_count = stylist_count + receptionist_count + finance_count + inventory_count + manager_count
                
                # Get appointment count
                appointment_count = Appointment.query.filter_by(branch_id=branch.id).count()
                
                # Get customer count - customers don't have branch_id, so count unique customers from appointments
                customer_count = db.session.query(func.count(func.distinct(Appointment.customer_id)))\
                    .filter_by(branch_id=branch.id).scalar() or 0
                
                # Get revenue
                revenue = db.session.query(func.sum(Appointment.final_amount))\
                    .filter_by(branch_id=branch.id, status='completed').scalar() or 0
                
                # Get staff by role
                staff_by_role = {}
                if stylist_count > 0:
                    staff_by_role['stylist'] = stylist_count
                if receptionist_count > 0:
                    staff_by_role['receptionist'] = receptionist_count
                if finance_count > 0:
                    staff_by_role['finance'] = finance_count
                if inventory_count > 0:
                    staff_by_role['inventory'] = inventory_count
                if manager_count > 0:
                    staff_by_role['manager'] = manager_count
                
                # Handle days_open - parse JSON string to list
                days_open = branch.days_open
                if isinstance(days_open, str):
                    try:
                        days_open = json.loads(days_open)
                    except:
                        days_open = [d.strip() for d in days_open.split(',')] if days_open else []
                elif days_open is None:
                    days_open = []
                elif not isinstance(days_open, list):
                    days_open = [str(days_open)]
                
                result.append({
                    'id': branch.id,
                    'name': branch.name,
                    'code': branch.code,
                    'address': branch.address,
                    'city': branch.city,
                    'state': branch.state,
                    'country': branch.country,
                    'postal_code': branch.postal_code,
                    'phone': branch.phone,
                    'email': branch.email,
                    'manager_name': branch.manager_name,
                    'opening_time': str(branch.opening_time) if branch.opening_time else None,
                    'closing_time': str(branch.closing_time) if branch.closing_time else None,
                    'days_open': days_open,
                    'is_active': branch.is_active,
                    'staff_count': staff_count,
                    'staff_by_role': staff_by_role,
                    'appointment_count': appointment_count,
                    'customer_count': customer_count,
                    'revenue': float(revenue),
                    'created_at': branch.created_at.isoformat() if branch.created_at else None
                })
            
            return result, 200
            
        except Exception as e:
            logger.error(f"Error getting branches: {str(e)}")
            return {'error': str(e)}, 500
    
    # ==================== NOTIFICATIONS ====================
    @staticmethod
    def get_notifications(current_user, params):
        """Get ALL notifications"""
        try:
            page = int(params.get('page', 1))
            limit = int(params.get('limit', 20))
            is_read = params.get('is_read')
            notification_type = params.get('type')
            
            query = Notification.query.filter_by(user_id=current_user.id)
            
            if is_read is not None:
                query = query.filter_by(is_read=is_read == 'true')
            
            if notification_type:
                query = query.filter_by(type=notification_type)
            
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
            logger.error(f"Error marking all notifications read: {str(e)}")
            return {'error': str(e)}, 500
    
    # ==================== REPORTS ====================
    @staticmethod
    def get_reports(current_user, params):
        """Get ALL reports with comprehensive data"""
        try:
            report_type = params.get('type', 'summary')
            start_date = params.get('start_date')
            end_date = params.get('end_date')
            
            if start_date:
                start_date_obj = datetime.strptime(start_date, '%Y-%m-%d').date()
            else:
                start_date_obj = datetime(2000, 1, 1).date()
            
            if end_date:
                end_date_obj = datetime.strptime(end_date, '%Y-%m-%d').date()
            else:
                end_date_obj = datetime.now().date()
            
            # ============ SUMMARY REPORT ============
            if report_type == 'summary':
                total_appointments = Appointment.query.filter(
                    Appointment.appointment_date >= start_date_obj,
                    Appointment.appointment_date <= end_date_obj
                ).count()
                
                appointments_by_status = {}
                for status in ['pending', 'confirmed', 'in-progress', 'completed', 'cancelled', 'no-show']:
                    appointments_by_status[status] = Appointment.query.filter(
                        Appointment.appointment_date >= start_date_obj,
                        Appointment.appointment_date <= end_date_obj,
                        Appointment.status == status
                    ).count()
                
                total_revenue = db.session.query(func.sum(Appointment.final_amount))\
                    .filter(
                        Appointment.appointment_date >= start_date_obj,
                        Appointment.appointment_date <= end_date_obj,
                        Appointment.status == 'completed'
                    ).scalar() or 0
                
                total_customers = Customer.query.filter(
                    Customer.created_at >= start_date_obj,
                    Customer.created_at <= end_date_obj
                ).count()
                
                new_customers = Customer.query.filter(
                    Customer.created_at >= start_date_obj,
                    Customer.created_at <= end_date_obj
                ).count()
                
                stylist_count = Stylist.query.count()
                receptionist_count = Receptionist.query.count()
                finance_count = Finance.query.count()
                inventory_count = Inventory.query.count()
                manager_count = Manager.query.count()
                total_staff = stylist_count + receptionist_count + finance_count + inventory_count + manager_count
                
                revenue_by_service = db.session.query(
                    Service.name,
                    func.count(Appointment.id).label('count'),
                    func.sum(Appointment.final_amount).label('revenue')
                ).join(Appointment, Appointment.service_id == Service.id)\
                 .filter(
                    Appointment.appointment_date >= start_date_obj,
                    Appointment.appointment_date <= end_date_obj,
                    Appointment.status == 'completed'
                ).group_by(Service.id).all()
                
                return {
                    'report_type': 'summary',
                    'period': {
                        'start_date': start_date_obj.isoformat(),
                        'end_date': end_date_obj.isoformat(),
                        'days': (end_date_obj - start_date_obj).days
                    },
                    'appointments': {
                        'total': total_appointments,
                        'by_status': appointments_by_status
                    },
                    'revenue': {
                        'total': float(total_revenue),
                        'by_service': [
                            {
                                'service': r.name,
                                'count': r.count,
                                'revenue': float(r.revenue or 0)
                            } for r in revenue_by_service
                        ]
                    },
                    'customers': {
                        'total': total_customers,
                        'new': new_customers
                    },
                    'staff': {
                        'total': total_staff
                    }
                }, 200
            
            # ============ APPOINTMENTS REPORT ============
            elif report_type == 'appointments':
                appointments = Appointment.query.filter(
                    Appointment.appointment_date >= start_date_obj,
                    Appointment.appointment_date <= end_date_obj
                ).all()
                
                daily_appointments = {}
                monthly_appointments = {}
                
                for appt in appointments:
                    date_key = appt.appointment_date.isoformat()
                    month_key = appt.appointment_date.strftime('%Y-%m')
                    
                    daily_appointments[date_key] = daily_appointments.get(date_key, 0) + 1
                    monthly_appointments[month_key] = monthly_appointments.get(month_key, 0) + 1
                
                return {
                    'report_type': 'appointments',
                    'period': {
                        'start_date': start_date_obj.isoformat(),
                        'end_date': end_date_obj.isoformat()
                    },
                    'total': len(appointments),
                    'daily': daily_appointments,
                    'monthly': monthly_appointments,
                    'status_breakdown': {
                        'pending': Appointment.query.filter_by(status='pending').count(),
                        'confirmed': Appointment.query.filter_by(status='confirmed').count(),
                        'completed': Appointment.query.filter_by(status='completed').count(),
                        'cancelled': Appointment.query.filter_by(status='cancelled').count()
                    }
                }, 200
            
            # ============ REVENUE REPORT ============
            elif report_type == 'revenue':
                daily_revenue = {}
                monthly_revenue = {}
                
                completed_appointments = Appointment.query.filter(
                    Appointment.appointment_date >= start_date_obj,
                    Appointment.appointment_date <= end_date_obj,
                    Appointment.status == 'completed'
                ).all()
                
                for appt in completed_appointments:
                    date_key = appt.appointment_date.isoformat()
                    month_key = appt.appointment_date.strftime('%Y-%m')
                    
                    daily_revenue[date_key] = daily_revenue.get(date_key, 0) + (appt.final_amount or 0)
                    monthly_revenue[month_key] = monthly_revenue.get(month_key, 0) + (appt.final_amount or 0)
                
                return {
                    'report_type': 'revenue',
                    'period': {
                        'start_date': start_date_obj.isoformat(),
                        'end_date': end_date_obj.isoformat()
                    },
                    'total_revenue': float(sum(daily_revenue.values())),
                    'daily_revenue': {k: float(v) for k, v in daily_revenue.items()},
                    'monthly_revenue': {k: float(v) for k, v in monthly_revenue.items()},
                    'average_daily': float(sum(daily_revenue.values()) / len(daily_revenue)) if daily_revenue else 0
                }, 200
            
            # ============ CUSTOMER REPORT ============
            elif report_type == 'customers':
                customers = Customer.query.filter(
                    Customer.created_at >= start_date_obj,
                    Customer.created_at <= end_date_obj
                ).all()
                
                top_customers = db.session.query(
                    Customer,
                    func.sum(Payment.amount).label('total_spent')
                ).join(Payment, Payment.customer_id == Customer.id)\
                 .filter(
                    Payment.payment_status == 'paid',
                    Payment.payment_date >= start_date_obj,
                    Payment.payment_date <= end_date_obj
                ).group_by(Customer.id)\
                 .order_by(desc('total_spent'))\
                 .limit(10).all()
                
                return {
                    'report_type': 'customers',
                    'period': {
                        'start_date': start_date_obj.isoformat(),
                        'end_date': end_date_obj.isoformat()
                    },
                    'total_customers': len(customers),
                    'walk_in_customers': Customer.query.filter_by(is_walk_in=True).count(),
                    'registered_customers': Customer.query.filter_by(is_walk_in=False).count(),
                    'top_customers': [
                        {
                            'name': f"{c[0].user.first_name} {c[0].user.last_name}" if c[0].user else 'Unknown',
                            'email': c[0].user.email if c[0].user else 'N/A',
                            'total_spent': float(c[1] or 0),
                            'visits': c[0].total_visits or 0
                        } for c in top_customers
                    ]
                }, 200
            
            # ============ STAFF REPORT ============
            elif report_type == 'staff':
                stylists = Stylist.query.all()
                receptionists = Receptionist.query.all()
                finances = Finance.query.all()
                inventories = Inventory.query.all()
                managers = Manager.query.all()
                
                total_staff = len(stylists) + len(receptionists) + len(finances) + len(inventories) + len(managers)
                
                staff_by_role = {
                    'stylist': len(stylists),
                    'receptionist': len(receptionists),
                    'finance': len(finances),
                    'inventory': len(inventories),
                    'manager': len(managers)
                }
                
                stylist_performance = []
                for stylist in stylists:
                    user = User.query.get(stylist.user_id)
                    appointments = Appointment.query.filter_by(
                        stylist_id=stylist.id,
                        status='completed'
                    ).count()
                    revenue = db.session.query(func.sum(Appointment.final_amount))\
                        .filter_by(stylist_id=stylist.id, status='completed')\
                        .scalar() or 0
                    
                    reviews = Review.query.filter_by(stylist_id=stylist.id).all()
                    avg_rating = sum(r.rating for r in reviews) / len(reviews) if reviews else 0
                    
                    stylist_performance.append({
                        'name': f"{user.first_name} {user.last_name}" if user else 'Unknown',
                        'appointments': appointments,
                        'revenue': float(revenue),
                        'avg_rating': float(avg_rating),
                        'reviews': len(reviews)
                    })
                
                return {
                    'report_type': 'staff',
                    'total_staff': total_staff,
                    'staff_by_role': staff_by_role,
                    'stylist_performance': sorted(stylist_performance, key=lambda x: x['revenue'], reverse=True)
                }, 200
            
            return {'error': 'Invalid report type. Use: summary, appointments, revenue, customers, staff'}, 400
            
        except Exception as e:
            logger.error(f"Error getting reports: {str(e)}")
            return {'error': str(e)}, 500
    
    # ==================== INVENTORY REQUESTS ====================
    @staticmethod
    def get_inventory_requests(current_user, params):
        """Get ALL inventory requests"""
        try:
            status = params.get('status')
            start_date = params.get('start_date')
            end_date = params.get('end_date')
            
            query = Purchase.query
            
            if status:
                query = query.filter_by(status=status)
            
            if start_date:
                query = query.filter(Purchase.created_at >= datetime.strptime(start_date, '%Y-%m-%d'))
            
            if end_date:
                query = query.filter(Purchase.created_at <= datetime.strptime(end_date, '%Y-%m-%d'))
            
            purchases = query.order_by(desc(Purchase.created_at)).all()
            
            result = []
            for purchase in purchases:
                product = Product.query.get(purchase.product_id)
                
                result.append({
                    'id': purchase.id,
                    'product_name': product.name if product else 'N/A',
                    'quantity': purchase.quantity,
                    'price': float(purchase.price or 0),
                    'total': float(purchase.total or 0),
                    'status': purchase.status,
                    'supplier': purchase.supplier_name,
                    'created_at': purchase.created_at.isoformat() if purchase.created_at else None
                })
            
            return result, 200
            
        except Exception as e:
            logger.error(f"Error getting inventory requests: {str(e)}")
            return {'error': str(e)}, 500
    
    # ==================== LEAVE REQUESTS ====================
    @staticmethod
    def get_leave_requests(current_user, params):
        """Get ALL leave requests"""
        try:
            status = params.get('status')
            start_date = params.get('start_date')
            end_date = params.get('end_date')
            
            query = LeaveRequest.query
            
            if status:
                query = query.filter_by(status=status)
            
            if start_date:
                query = query.filter(LeaveRequest.start_date >= datetime.strptime(start_date, '%Y-%m-%d').date())
            
            if end_date:
                query = query.filter(LeaveRequest.end_date <= datetime.strptime(end_date, '%Y-%m-%d').date())
            
            leave_requests = query.order_by(desc(LeaveRequest.created_at)).all()
            
            result = []
            for leave in leave_requests:
                user = User.query.get(leave.user_id)
                
                result.append({
                    'id': leave.id,
                    'user_name': f"{user.first_name} {user.last_name}" if user else 'Unknown',
                    'user_email': user.email if user else 'N/A',
                    'user_role': user.role.name if user and user.role else None,
                    'start_date': leave.start_date.isoformat() if leave.start_date else None,
                    'end_date': leave.end_date.isoformat() if leave.end_date else None,
                    'days': (leave.end_date - leave.start_date).days + 1 if leave.start_date and leave.end_date else 0,
                    'reason': leave.reason,
                    'status': leave.status,
                    'created_at': leave.created_at.isoformat() if leave.created_at else None
                })
            
            return result, 200
            
        except Exception as e:
            logger.error(f"Error getting leave requests: {str(e)}")
            return {'error': str(e)}, 500
    
    @staticmethod
    def approve_leave_request(current_user, request_id):
        """Approve leave request"""
        try:
            leave = LeaveRequest.query.get(request_id)
            if not leave:
                return {'error': 'Leave request not found'}, 404
            
            leave.status = 'approved'
            leave.approved_by = current_user.id
            leave.approved_at = datetime.utcnow()
            db.session.commit()
            
            return {'message': 'Leave request approved'}, 200
            
        except Exception as e:
            db.session.rollback()
            logger.error(f"Error approving leave: {str(e)}")
            return {'error': str(e)}, 500
    
    @staticmethod
    def reject_leave_request(current_user, request_id, data):
        """Reject leave request"""
        try:
            leave = LeaveRequest.query.get(request_id)
            if not leave:
                return {'error': 'Leave request not found'}, 404
            
            leave.status = 'rejected'
            leave.rejection_reason = data.get('reason')
            leave.approved_by = current_user.id
            leave.approved_at = datetime.utcnow()
            db.session.commit()
            
            return {'message': 'Leave request rejected'}, 200
            
        except Exception as e:
            db.session.rollback()
            logger.error(f"Error rejecting leave: {str(e)}")
            return {'error': str(e)}, 500
    
    # ==================== SALES SUMMARY ====================
    @staticmethod
    def get_sales_summary(current_user, params):
        """Get sales summary - ALL periods"""
        try:
            period = params.get('period', 'all')
            
            if period == 'daily':
                date = datetime.now().date()
                appointments = Appointment.query.filter_by(appointment_date=date)
                total = appointments.count()
                revenue = db.session.query(func.sum(Appointment.final_amount))\
                    .filter_by(appointment_date=date, status='completed').scalar() or 0
                
            elif period == 'weekly':
                start_date = datetime.now().date() - timedelta(days=7)
                appointments = Appointment.query.filter(
                    Appointment.appointment_date >= start_date
                )
                total = appointments.count()
                revenue = db.session.query(func.sum(Appointment.final_amount))\
                    .filter(Appointment.appointment_date >= start_date, Appointment.status == 'completed')\
                    .scalar() or 0
                
            elif period == 'monthly':
                start_date = datetime.now().date() - timedelta(days=30)
                appointments = Appointment.query.filter(
                    Appointment.appointment_date >= start_date
                )
                total = appointments.count()
                revenue = db.session.query(func.sum(Appointment.final_amount))\
                    .filter(Appointment.appointment_date >= start_date, Appointment.status == 'completed')\
                    .scalar() or 0
                
            else:  # 'all'
                total = Appointment.query.count()
                revenue = db.session.query(func.sum(Appointment.final_amount))\
                    .filter(Appointment.status == 'completed').scalar() or 0
            
            return {
                'period': period,
                'total_appointments': total,
                'total_revenue': float(revenue),
                'average_revenue': float(revenue / total) if total > 0 else 0
            }, 200
            
        except Exception as e:
            logger.error(f"Error getting sales summary: {str(e)}")
            return {'error': str(e)}, 500