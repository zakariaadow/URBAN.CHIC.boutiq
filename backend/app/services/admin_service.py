from datetime import datetime, timedelta
from flask import current_app
from app.extensions import db
from app.models.user import User
from app.models.role import Role
from app.models.branch import Branch
from app.models.service import Service
from app.models.category import Category
from app.models.product import Product
from app.models.appointment import Appointment
from app.models.payment import Payment
from app.models.report import Report
from app.models.manager import Manager
from app.models.stylist import Stylist
from app.models.finance import Finance
from app.models.inventory import Inventory
from app.models.receptionist import Receptionist
from app.services.notification_service import NotificationService
from app.services.report_service import ReportService

class AdminService:
    
    @staticmethod
    def get_dashboard(current_user):
        """Get admin dashboard data"""
        try:
            # Get counts
            total_users = User.query.count()
            total_customers = User.query.join(Role).filter(Role.name == 'customer').count()
            total_staff = User.query.join(Role).filter(Role.name.in_(['manager', 'stylist', 'receptionist', 'finance', 'inventory'])).count()
            total_branches = Branch.query.filter_by(is_active=True).count()
            total_services = Service.query.filter_by(is_active=True).count()
            total_products = Product.query.filter_by(is_active=True).count()
            
            # Today's appointments
            today = datetime.utcnow().date()
            today_appointments = Appointment.query.filter(
                Appointment.appointment_date == today
            ).count()
            
            # Pending approvals
            pending_approvals = User.query.filter_by(
                is_approved=False,
                is_active=True
            ).count()
            
            # Revenue
            today_revenue = db.session.query(db.func.sum(Payment.amount)).filter(
                Payment.payment_status == 'paid',
                db.func.date(Payment.payment_date) == today
            ).scalar() or 0
            
            month_start = datetime(today.year, today.month, 1).date()
            month_revenue = db.session.query(db.func.sum(Payment.amount)).filter(
                Payment.payment_status == 'paid',
                db.func.date(Payment.payment_date) >= month_start
            ).scalar() or 0
            
            return {
                'stats': {
                    'total_users': total_users,
                    'total_customers': total_customers,
                    'total_staff': total_staff,
                    'total_branches': total_branches,
                    'total_services': total_services,
                    'total_products': total_products,
                    'today_appointments': today_appointments,
                    'pending_approvals': pending_approvals
                },
                'revenue': {
                    'today': today_revenue,
                    'this_month': month_revenue
                }
            }, 200
            
        except Exception as e:
            return {'error': str(e)}, 500
    
    @staticmethod
    def get_dashboard_stats(current_user):
        """Get dashboard statistics"""
        return AdminService.get_dashboard(current_user)
    
    @staticmethod
    def get_users(params):
        """Get all users"""
        try:
            query = User.query
            
            # 1. Filter by Role
            if params.get('role'):
                query = query.join(Role).filter(Role.name == params['role'])
            
            # 2. Filter by Search
            if params.get('search'):
                search = f"%{params['search']}%"
                query = query.filter(
                    db.or_(
                        User.first_name.ilike(search),
                        User.last_name.ilike(search),
                        User.email.ilike(search),
                        User.username.ilike(search)
                    )
                )
            
            # 3. Filter by Status (Active/Inactive) - FORCE CHECK 1 & 0
            status = params.get('status')
            if status:
                if status == 'active':
                    # Strictly check for is_active == 1
                    query = query.filter(User.is_active == 1)
                elif status == 'inactive':
                    # Strictly check for is_active == 0
                    query = query.filter(User.is_active == 0)
            
            # 4. Filter by is_active (fallback, if explicitly sent as boolean)
            elif params.get('is_active') is not None:
                query = query.filter(User.is_active == params['is_active'])
            
            # 5. Filter by is_approved - ENSURE WE ONLY SHOW APPROVED USERS
            # Only show approved users in the admin list
            query = query.filter(User.is_approved == 1)
            
            # 6. Order and Paginate
            query = query.order_by(User.created_at.desc())
            
            page = int(params.get('page', 1))
            per_page = int(params.get('per_page', 20))
            
            users = query.paginate(page=page, per_page=per_page, error_out=False)
            
            return {
                'items': [u.to_dict() for u in users.items],
                'total': users.total,
                'page': page,
                'per_page': per_page,
                'pages': users.pages
            }, 200
            
        except Exception as e:
            return {'error': str(e)}, 500
    
    @staticmethod
    def get_user(current_user, user_id):
        """Get user details"""
        try:
            user = User.query.get(user_id)
            if not user:
                return {'error': 'User not found'}, 404
            return user.to_dict(), 200
        except Exception as e:
            return {'error': str(e)}, 500
    
    @staticmethod
    def update_user(current_user, user_id, data):
        """Update user"""
        try:
            user = User.query.get(user_id)
            if not user:
                return {'error': 'User not found'}, 404
            
            if 'first_name' in data:
                user.first_name = data['first_name']
            if 'last_name' in data:
                user.last_name = data['last_name']
            if 'phone' in data:
                user.phone = data['phone']
            if 'role_id' in data:
                user.role_id = data['role_id']
            
            db.session.commit()
            return user.to_dict(), 200
            
        except Exception as e:
            db.session.rollback()
            return {'error': str(e)}, 500
    
    @staticmethod
    def activate_user(current_user, user_id):
        """Activate a user"""
        try:
            user = User.query.get(user_id)
            if not user:
                return {'error': 'User not found'}, 404
            
            user.is_active = True
            db.session.commit()
            
            return {'message': 'User activated successfully'}, 200
            
        except Exception as e:
            db.session.rollback()
            return {'error': str(e)}, 500
    
    @staticmethod
    def deactivate_user(current_user, user_id):
        """Deactivate a user"""
        try:
            user = User.query.get(user_id)
            if not user:
                return {'error': 'User not found'}, 404
            
            user.is_active = False
            db.session.commit()
            
            return {'message': 'User deactivated successfully'}, 200
            
        except Exception as e:
            db.session.rollback()
            return {'error': str(e)}, 500
    
    @staticmethod
    def delete_user(current_user, user_id):
        """Delete a user"""
        try:
            user = User.query.get(user_id)
            if not user:
                return {'error': 'User not found'}, 404
            
            db.session.delete(user)
            db.session.commit()
            
            return {'message': 'User deleted successfully'}, 200
            
        except Exception as e:
            db.session.rollback()
            return {'error': str(e)}, 500
    
    @staticmethod
    def search_users(params):
        """Search users"""
        return AdminService.get_users(params)
    
    @staticmethod
    def export_users(data):
        """Export users"""
        # For now, return placeholder
        return {'message': 'Export functionality coming soon'}, 200
    
    @staticmethod
    def get_roles():
        """Get all roles"""
        try:
            roles = Role.query.all()
            return [r.to_dict() for r in roles], 200
        except Exception as e:
            return {'error': str(e)}, 500
    
    @staticmethod
    def create_role(current_user, data):
        """Create a new role"""
        try:
            role = Role(
                name=data['name'],
                description=data.get('description'),
                permissions=data.get('permissions', {})
            )
            db.session.add(role)
            db.session.commit()
            return role.to_dict(), 201
        except Exception as e:
            db.session.rollback()
            return {'error': str(e)}, 500
    
    @staticmethod
    def update_role(current_user, role_id, data):
        """Update a role"""
        try:
            role = Role.query.get(role_id)
            if not role:
                return {'error': 'Role not found'}, 404
            
            if 'name' in data:
                role.name = data['name']
            if 'description' in data:
                role.description = data['description']
            
            db.session.commit()
            return role.to_dict(), 200
            
        except Exception as e:
            db.session.rollback()
            return {'error': str(e)}, 500
    
    @staticmethod
    def delete_role(current_user, role_id):
        """Delete a role"""
        try:
            role = Role.query.get(role_id)
            if not role:
                return {'error': 'Role not found'}, 404
            
            db.session.delete(role)
            db.session.commit()
            return {'message': 'Role deleted successfully'}, 200
            
        except Exception as e:
            db.session.rollback()
            return {'error': str(e)}, 500
    
    @staticmethod
    def update_role_permissions(current_user, role_id, data):
        """Update role permissions"""
        try:
            role = Role.query.get(role_id)
            if not role:
                return {'error': 'Role not found'}, 404
            
            role.permissions = data.get('permissions', {})
            db.session.commit()
            return role.to_dict(), 200
            
        except Exception as e:
            db.session.rollback()
            return {'error': str(e)}, 500
    
    @staticmethod
    def get_permissions():
        """Get all permissions"""
        from app.utils.permissions import Permissions
        permissions = [p for p in dir(Permissions) if not p.startswith('_')]
        return permissions, 200
    
    @staticmethod
    def get_pending_approvals(current_user):
        """Get all pending approvals"""
        try:
            users = User.query.filter_by(
                is_approved=False,
                is_active=True
            ).join(Role).filter(Role.name != 'customer').all()
            
            return [u.to_dict() for u in users], 200
            
        except Exception as e:
            return {'error': str(e)}, 500
    
    @staticmethod
    def get_manager_approvals(current_user):
        """Get pending manager approvals"""
        try:
            users = User.query.filter_by(
                is_approved=False,
                is_active=True
            ).join(Role).filter(Role.name == 'manager').all()
            
            return [u.to_dict() for u in users], 200
            
        except Exception as e:
            return {'error': str(e)}, 500
    
    @staticmethod
    def approve_manager(current_user, user_id):
        """Approve a manager"""
        try:
            user = User.query.get(user_id)
            if not user:
                return {'error': 'User not found'}, 404
            
            user.is_approved = True
            db.session.commit()
            
            NotificationService.create_notification(
                user_id=user.id,
                title='Account Approved',
                message='Your manager account has been approved. You can now log in.',
                type='system'
            )
            
            return {'message': 'Manager approved successfully'}, 200
            
        except Exception as e:
            db.session.rollback()
            return {'error': str(e)}, 500
    
    @staticmethod
    def get_stylist_approvals(current_user):
        """Get pending stylist approvals"""
        try:
            users = User.query.filter_by(
                is_approved=False,
                is_active=True
            ).join(Role).filter(Role.name == 'stylist').all()
            
            return [u.to_dict() for u in users], 200
            
        except Exception as e:
            return {'error': str(e)}, 500
    
    @staticmethod
    def approve_stylist(current_user, user_id):
        """Approve a stylist"""
        try:
            user = User.query.get(user_id)
            if not user:
                return {'error': 'User not found'}, 404
            
            user.is_approved = True
            db.session.commit()
            
            NotificationService.create_notification(
                user_id=user.id,
                title='Account Approved',
                message='Your stylist account has been approved. You can now log in.',
                type='system'
            )
            
            return {'message': 'Stylist approved successfully'}, 200
            
        except Exception as e:
            db.session.rollback()
            return {'error': str(e)}, 500
    
    @staticmethod
    def get_finance_approvals(current_user):
        """Get pending finance approvals"""
        try:
            users = User.query.filter_by(
                is_approved=False,
                is_active=True
            ).join(Role).filter(Role.name == 'finance').all()
            
            return [u.to_dict() for u in users], 200
            
        except Exception as e:
            return {'error': str(e)}, 500
    
    @staticmethod
    def approve_finance(current_user, user_id):
        """Approve a finance officer"""
        try:
            user = User.query.get(user_id)
            if not user:
                return {'error': 'User not found'}, 404
            
            user.is_approved = True
            db.session.commit()
            
            NotificationService.create_notification(
                user_id=user.id,
                title='Account Approved',
                message='Your finance account has been approved. You can now log in.',
                type='system'
            )
            
            return {'message': 'Finance officer approved successfully'}, 200
            
        except Exception as e:
            db.session.rollback()
            return {'error': str(e)}, 500
    
    @staticmethod
    def get_inventory_approvals(current_user):
        """Get pending inventory approvals"""
        try:
            users = User.query.filter_by(
                is_approved=False,
                is_active=True
            ).join(Role).filter(Role.name == 'inventory').all()
            
            return [u.to_dict() for u in users], 200
            
        except Exception as e:
            return {'error': str(e)}, 500
    
    @staticmethod
    def approve_inventory(current_user, user_id):
        """Approve an inventory officer"""
        try:
            user = User.query.get(user_id)
            if not user:
                return {'error': 'User not found'}, 404
            
            user.is_approved = True
            db.session.commit()
            
            NotificationService.create_notification(
                user_id=user.id,
                title='Account Approved',
                message='Your inventory account has been approved. You can now log in.',
                type='system'
            )
            
            return {'message': 'Inventory officer approved successfully'}, 200
            
        except Exception as e:
            db.session.rollback()
            return {'error': str(e)}, 500
    
    @staticmethod
    def get_receptionist_approvals(current_user):
        """Get pending receptionist approvals"""
        try:
            users = User.query.filter_by(
                is_approved=False,
                is_active=True
            ).join(Role).filter(Role.name == 'receptionist').all()
            
            return [u.to_dict() for u in users], 200
            
        except Exception as e:
            return {'error': str(e)}, 500
    
    @staticmethod
    def approve_receptionist(current_user, user_id):
        """Approve a receptionist"""
        try:
            user = User.query.get(user_id)
            if not user:
                return {'error': 'User not found'}, 404
            
            user.is_approved = True
            db.session.commit()
            
            NotificationService.create_notification(
                user_id=user.id,
                title='Account Approved',
                message='Your receptionist account has been approved. You can now log in.',
                type='system'
            )
            
            return {'message': 'Receptionist approved successfully'}, 200
            
        except Exception as e:
            db.session.rollback()
            return {'error': str(e)}, 500
    
    @staticmethod
    def reject_user(current_user, user_id, data):
        """Reject a user registration"""
        try:
            user = User.query.get(user_id)
            if not user:
                return {'error': 'User not found'}, 404
            
            user.is_active = False
            db.session.commit()
            
            NotificationService.create_notification(
                user_id=user.id,
                title='Registration Rejected',
                message=f'Your registration has been rejected. Reason: {data.get("reason", "Not specified")}',
                type='system'
            )
            
            return {'message': 'User rejected successfully'}, 200
            
        except Exception as e:
            db.session.rollback()
            return {'error': str(e)}, 500
    
    @staticmethod
    def get_branches(params):
        """Get all branches"""
        try:
            branches = Branch.query.all()
            return [b.to_dict() for b in branches], 200
        except Exception as e:
            return {'error': str(e)}, 500
    
    @staticmethod
    def create_branch(current_user, data):
        """Create a new branch"""
        try:
            branch = Branch(
                name=data['name'],
                code=data.get('code', f"BR{datetime.utcnow().strftime('%Y%m%d%H%M%S')}"),
                address=data.get('address'),
                city=data.get('city'),
                state=data.get('state'),
                country=data.get('country', 'Kenya'),
                postal_code=data.get('postal_code'),
                phone=data.get('phone'),
                email=data.get('email'),
                manager_name=data.get('manager_name'),
                opening_time=data.get('opening_time'),
                closing_time=data.get('closing_time'),
                days_open=data.get('days_open', ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']),
                is_active=True
            )
            db.session.add(branch)
            db.session.commit()
            return branch.to_dict(), 201
        except Exception as e:
            db.session.rollback()
            return {'error': str(e)}, 500
    
    @staticmethod
    def update_branch(current_user, branch_id, data):
        """Update a branch"""
        try:
            branch = Branch.query.get(branch_id)
            if not branch:
                return {'error': 'Branch not found'}, 404
            
            for key, value in data.items():
                if hasattr(branch, key):
                    setattr(branch, key, value)
            
            db.session.commit()
            return branch.to_dict(), 200
            
        except Exception as e:
            db.session.rollback()
            return {'error': str(e)}, 500
    
    @staticmethod
    def delete_branch(current_user, branch_id):
        """Delete a branch"""
        try:
            branch = Branch.query.get(branch_id)
            if not branch:
                return {'error': 'Branch not found'}, 404
            
            db.session.delete(branch)
            db.session.commit()
            return {'message': 'Branch deleted successfully'}, 200
            
        except Exception as e:
            db.session.rollback()
            return {'error': str(e)}, 500
    
    @staticmethod
    def update_branch_status(current_user, branch_id, data):
        """Update branch status"""
        try:
            branch = Branch.query.get(branch_id)
            if not branch:
                return {'error': 'Branch not found'}, 404
            
            branch.is_active = data.get('is_active', False)
            db.session.commit()
            return branch.to_dict(), 200
            
        except Exception as e:
            db.session.rollback()
            return {'error': str(e)}, 500
    
    @staticmethod
    def get_all_services(params):
        """Get all services"""
        try:
            services = Service.query.all()
            return [s.to_dict() for s in services], 200
        except Exception as e:
            return {'error': str(e)}, 500
    
    @staticmethod
    def create_service(current_user, data):
        """Create a new service"""
        try:
            service = Service(
                name=data['name'],
                description=data.get('description'),
                price=data['price'],
                duration_minutes=data['duration_minutes'],
                category_id=data.get('category_id'),
                branch_id=data.get('branch_id'),
                is_active=data.get('is_active', True)
            )
            db.session.add(service)
            db.session.commit()
            return service.to_dict(), 201
        except Exception as e:
            db.session.rollback()
            return {'error': str(e)}, 500
    
    @staticmethod
    def update_service(current_user, service_id, data):
        """Update a service"""
        try:
            service = Service.query.get(service_id)
            if not service:
                return {'error': 'Service not found'}, 404
            
            for key, value in data.items():
                if hasattr(service, key):
                    setattr(service, key, value)
            
            db.session.commit()
            return service.to_dict(), 200
            
        except Exception as e:
            db.session.rollback()
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
            return {'error': str(e)}, 500
    
    @staticmethod
    def set_service_prices(current_user, data):
        """Set service prices"""
        try:
            for item in data.get('services', []):
                service = Service.query.get(item.get('id'))
                if service:
                    service.price = item.get('price')
                    if item.get('discount_percentage'):
                        service.discount_percentage = item['discount_percentage']
            
            db.session.commit()
            return {'message': 'Service prices updated successfully'}, 200
            
        except Exception as e:
            db.session.rollback()
            return {'error': str(e)}, 500
    
    @staticmethod
    def toggle_service(current_user, service_id):
        """Toggle service status"""
        try:
            service = Service.query.get(service_id)
            if not service:
                return {'error': 'Service not found'}, 404
            
            service.is_active = not service.is_active
            db.session.commit()
            return service.to_dict(), 200
            
        except Exception as e:
            db.session.rollback()
            return {'error': str(e)}, 500
    
    @staticmethod
    def get_categories(params):
        """Get all categories"""
        try:
            categories = Category.query.all()
            return [c.to_dict() for c in categories], 200
        except Exception as e:
            return {'error': str(e)}, 500
    
    @staticmethod
    def create_category(current_user, data):
        """Create a new category"""
        try:
            category = Category(
                name=data['name'],
                description=data.get('description'),
                icon=data.get('icon'),
                parent_id=data.get('parent_id'),
                is_active=True
            )
            db.session.add(category)
            db.session.commit()
            return category.to_dict(), 201
        except Exception as e:
            db.session.rollback()
            return {'error': str(e)}, 500
    
    @staticmethod
    def update_category(current_user, category_id, data):
        """Update a category"""
        try:
            category = Category.query.get(category_id)
            if not category:
                return {'error': 'Category not found'}, 404
            
            for key, value in data.items():
                if hasattr(category, key):
                    setattr(category, key, value)
            
            db.session.commit()
            return category.to_dict(), 200
            
        except Exception as e:
            db.session.rollback()
            return {'error': str(e)}, 500
    
    @staticmethod
    def delete_category(current_user, category_id):
        """Delete a category"""
        try:
            category = Category.query.get(category_id)
            if not category:
                return {'error': 'Category not found'}, 404
            
            db.session.delete(category)
            db.session.commit()
            return {'message': 'Category deleted successfully'}, 200
            
        except Exception as e:
            db.session.rollback()
            return {'error': str(e)}, 500
    
    @staticmethod
    def get_products(params):
        """Get all products"""
        try:
            products = Product.query.all()
            return [p.to_dict() for p in products], 200
        except Exception as e:
            return {'error': str(e)}, 500
    
    @staticmethod
    def create_product(current_user, data):
        """Create a new product"""
        try:
            product = Product(
                name=data['name'],
                description=data.get('description'),
                sku=data.get('sku'),
                barcode=data.get('barcode'),
                category_id=data.get('category_id'),
                supplier_id=data.get('supplier_id'),
                branch_id=data.get('branch_id'),
                purchase_price=data['purchase_price'],
                selling_price=data['selling_price'],
                quantity=data.get('quantity', 0),
                min_quantity=data.get('min_quantity', 5),
                unit=data.get('unit', 'piece'),
                is_active=True
            )
            db.session.add(product)
            db.session.commit()
            return product.to_dict(), 201
        except Exception as e:
            db.session.rollback()
            return {'error': str(e)}, 500
    
    @staticmethod
    def update_product(current_user, product_id, data):
        """Update a product"""
        try:
            product = Product.query.get(product_id)
            if not product:
                return {'error': 'Product not found'}, 404
            
            for key, value in data.items():
                if hasattr(product, key):
                    setattr(product, key, value)
            
            db.session.commit()
            return product.to_dict(), 200
            
        except Exception as e:
            db.session.rollback()
            return {'error': str(e)}, 500
    
    @staticmethod
    def delete_product(current_user, product_id):
        """Delete a product"""
        try:
            product = Product.query.get(product_id)
            if not product:
                return {'error': 'Product not found'}, 404
            
            db.session.delete(product)
            db.session.commit()
            return {'message': 'Product deleted successfully'}, 200
            
        except Exception as e:
            db.session.rollback()
            return {'error': str(e)}, 500
    
    @staticmethod
    def get_all_appointments(params):
        """Get all appointments"""
        try:
            query = Appointment.query
            
            if params.get('status'):
                query = query.filter(Appointment.status == params['status'])
            
            if params.get('start_date'):
                query = query.filter(Appointment.appointment_date >= params['start_date'])
            
            if params.get('end_date'):
                query = query.filter(Appointment.appointment_date <= params['end_date'])
            
            query = query.order_by(Appointment.created_at.desc())
            
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
    def get_appointment_details(current_user, appointment_id):
        """Get appointment details"""
        try:
            appointment = Appointment.query.get(appointment_id)
            if not appointment:
                return {'error': 'Appointment not found'}, 404
            return appointment.to_dict(), 200
        except Exception as e:
            return {'error': str(e)}, 500
    
    @staticmethod
    def delete_appointment(current_user, appointment_id):
        """Delete an appointment"""
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
    def get_appointment_reports(params):
        """Get appointment reports"""
        return ReportService.generate_appointment_report(params)
    
    @staticmethod
    def get_sales_reports(params):
        """Get sales reports"""
        return ReportService.generate_sales_report(params)
    
    @staticmethod
    def get_revenue_reports(params):
        """Get revenue reports"""
        return ReportService.generate_revenue_report(params)
    
    @staticmethod
    def get_inventory_reports(params):
        """Get inventory reports"""
        return ReportService.generate_inventory_report(params)
    
    @staticmethod
    def get_staff_reports(params):
        """Get staff reports"""
        return ReportService.generate_staff_performance_report(params)
    
    @staticmethod
    def get_customer_reports(params):
        """Get customer reports"""
        return ReportService.generate_customer_report(params)
    
    @staticmethod
    def export_admin_report(current_user, data):
        """Export admin report"""
        return ReportService.export_report(data)
    
    @staticmethod
    def get_system_settings():
        """Get system settings"""
        # For now, return placeholder
        return {'message': 'System settings coming soon'}, 200
    
    @staticmethod
    def update_system_settings(current_user, data):
        """Update system settings"""
        # For now, return success
        return {'message': 'Settings updated'}, 200
    
    @staticmethod
    def backup_database(current_user):
        """Backup database"""
        # For now, return placeholder
        return {'message': 'Backup created'}, 200
    
    @staticmethod
    def restore_database(current_user, files):
        """Restore database"""
        # For now, return placeholder
        return {'message': 'Database restored'}, 200
    
    @staticmethod
    def get_system_logs(params):
        """Get system logs"""
        # For now, return placeholder
        return {'message': 'Logs coming soon'}, 200
    
    @staticmethod
    def clear_cache(current_user):
        """Clear system cache"""
        # For now, return success
        return {'message': 'Cache cleared'}, 200
    
    @staticmethod
    def get_maintenance_status():
        """Get maintenance status"""
        return {'maintenance_mode': False}, 200
    
    @staticmethod
    def toggle_maintenance(current_user, data):
        """Toggle maintenance mode"""
        # For now, return success
        return {'message': 'Maintenance mode toggled'}, 200
    
    @staticmethod
    def system_cleanup(current_user):
        """System cleanup"""
        # For now, return success
        return {'message': 'Cleanup completed'}, 200
    
    @staticmethod
    def get_audit_logs(params):
        """Get audit logs"""
        # For now, return placeholder
        return {'message': 'Audit logs coming soon'}, 200
    
    @staticmethod
    def get_audit_log(current_user, log_id):
        """Get audit log details"""
        # For now, return placeholder
        return {'message': 'Audit log coming soon'}, 200
    
    @staticmethod
    def export_audit_logs(data):
        """Export audit logs"""
        # For now, return placeholder
        return {'message': 'Audit logs exported'}, 200
    
    # ==================== DASHBOARD METHODS ====================

    @staticmethod
    def get_overview(current_user):
        """Get admin overview"""
        try:
            # Get all stats
            stats, _ = AdminService.get_dashboard_stats(current_user)
            return stats, 200
        except Exception as e:
            return {'error': str(e)}, 500

    @staticmethod
    def get_stats(current_user):
        """Get admin stats"""
        try:
            stats, _ = AdminService.get_dashboard_stats(current_user)
            return stats, 200
        except Exception as e:
            return {'error': str(e)}, 500

    # ==================== USER MANAGEMENT METHODS ====================

    @staticmethod
    def get_user(current_user, user_id):
        """Get user by ID"""
        try:
            from app.models.user import User
            user = User.query.get(user_id)
            if not user:
                return {'error': 'User not found'}, 404
            return user.to_dict(), 200
        except Exception as e:
            return {'error': str(e)}, 500

    @staticmethod
    def update_user(current_user, user_id, data):
        """Update user"""
        try:
            from app.models.user import User
            user = User.query.get(user_id)
            if not user:
                return {'error': 'User not found'}, 404
            
            if 'first_name' in data:
                user.first_name = data['first_name']
            if 'last_name' in data:
                user.last_name = data['last_name']
            if 'phone' in data:
                user.phone = data['phone']
            if 'role_id' in data:
                user.role_id = data['role_id']
            if 'is_active' in data:
                user.is_active = data['is_active']
            if 'is_approved' in data:
                user.is_approved = data['is_approved']
            
            db.session.commit()
            return user.to_dict(), 200
        except Exception as e:
            db.session.rollback()
            return {'error': str(e)}, 500

    # ==================== BRANCH MANAGEMENT METHODS ====================

    @staticmethod
    def create_branch(current_user, data):
        """Create a new branch"""
        try:
            from app.models.branch import Branch
            branch = Branch(
                name=data['name'],
                code=data.get('code', f"BR{datetime.utcnow().strftime('%Y%m%d%H%M%S')}"),
                address=data.get('address'),
                city=data.get('city'),
                state=data.get('state'),
                country=data.get('country', 'Kenya'),
                postal_code=data.get('postal_code'),
                phone=data.get('phone'),
                email=data.get('email'),
                manager_name=data.get('manager_name'),
                opening_time=data.get('opening_time'),
                closing_time=data.get('closing_time'),
                days_open=data.get('days_open', ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']),
                is_active=data.get('is_active', True)
            )
            db.session.add(branch)
            db.session.commit()
            return branch.to_dict(), 201
        except Exception as e:
            db.session.rollback()
            return {'error': str(e)}, 500

    # ==================== SERVICE MANAGEMENT METHODS ====================

    @staticmethod
    def create_service(current_user, data):
        """Create a new service"""
        try:
            from app.models.service import Service
            service = Service(
                name=data['name'],
                description=data.get('description'),
                price=data['price'],
                duration_minutes=data['duration_minutes'],
                category_id=data.get('category_id'),
                branch_id=data.get('branch_id'),
                image=data.get('image'),
                is_active=data.get('is_active', True),
                is_popular=data.get('is_popular', False),
                discount_percentage=data.get('discount_percentage', 0.0)
            )
            db.session.add(service)
            db.session.commit()
            return service.to_dict(), 201
        except Exception as e:
            db.session.rollback()
            return {'error': str(e)}, 500

    # ==================== CATEGORY MANAGEMENT METHODS ====================

    @staticmethod
    def create_category(current_user, data):
        """Create a new category"""
        try:
            from app.models.category import Category
            category = Category(
                name=data['name'],
                description=data.get('description'),
                icon=data.get('icon'),
                image=data.get('image'),
                parent_id=data.get('parent_id'),
                is_active=data.get('is_active', True)
            )
            db.session.add(category)
            db.session.commit()
            return category.to_dict(), 201
        except Exception as e:
            db.session.rollback()
            return {'error': str(e)}, 500

    # ==================== REPORT METHODS ====================

    @staticmethod
    def get_revenue_reports(current_user, params):
        """Get revenue reports"""
        try:
            from app.services.report_service import ReportService
            start_date = params.get('start_date')
            end_date = params.get('end_date')
            
            if not start_date or not end_date:
                return {'error': 'start_date and end_date are required'}, 400
            
            result, status_code = ReportService.generate_sales_report(start_date, end_date)
            return result, status_code
        except Exception as e:
            return {'error': str(e)}, 500

    @staticmethod
    def get_appointment_reports(current_user, params):
        """Get appointment reports"""
        try:
            from app.services.report_service import ReportService
            start_date = params.get('start_date')
            end_date = params.get('end_date')
            
            if not start_date or not end_date:
                return {'error': 'start_date and end_date are required'}, 400
            
            result, status_code = ReportService.generate_appointment_report(start_date, end_date)
            return result, status_code
        except Exception as e:
            return {'error': str(e)}, 500

    @staticmethod
    def get_inventory_reports(current_user, params):
        """Get inventory reports"""
        try:
            from app.services.report_service import ReportService
            result, status_code = ReportService.generate_inventory_report()
            return result, status_code
        except Exception as e:
            return {'error': str(e)}, 500

    @staticmethod
    def get_staff_reports(current_user, params):
        """Get staff reports"""
        try:
            from app.services.report_service import ReportService
            start_date = params.get('start_date')
            end_date = params.get('end_date')
            
            if not start_date or not end_date:
                return {'error': 'start_date and end_date are required'}, 400
            
            result, status_code = ReportService.generate_staff_performance_report(start_date, end_date)
            return result, status_code
        except Exception as e:
            return {'error': str(e)}, 500

    @staticmethod
    def get_customer_reports(current_user, params):
        """Get customer reports"""
        try:
            from app.services.report_service import ReportService
            start_date = params.get('start_date')
            end_date = params.get('end_date')
            
            if not start_date or not end_date:
                return {'error': 'start_date and end_date are required'}, 400
            
            result, status_code = ReportService.generate_customer_report(start_date, end_date)
            return result, status_code
        except Exception as e:
            return {'error': str(e)}, 500

    @staticmethod
    def get_comprehensive_report(current_user, params):
        """Get comprehensive report"""
        try:
            from app.services.report_service import ReportService
            
            # Get date range from params
            start_date = params.get('start_date')
            end_date = params.get('end_date')
            
            # If no dates provided, use default (last 30 days)
            if not start_date or not end_date:
                from datetime import datetime, timedelta
                end_date = datetime.utcnow().date().isoformat()
                start_date = (datetime.utcnow().date() - timedelta(days=30)).isoformat()
            
            # Generate reports
            sales, _ = ReportService.generate_sales_report(start_date, end_date)
            appointments, _ = ReportService.generate_appointment_report(start_date, end_date)
            inventory, _ = ReportService.generate_inventory_report()
            
            # Get staff performance
            staff, _ = ReportService.generate_staff_performance_report(start_date, end_date)
            
            # Get customer report
            customers, _ = ReportService.generate_customer_report(start_date, end_date)
            
            return {
                'period': {
                    'start_date': start_date,
                    'end_date': end_date
                },
                'sales': sales,
                'appointments': appointments,
                'inventory': inventory,
                'staff': staff,
                'customers': customers
            }, 200
            
        except Exception as e:
            import traceback
            traceback.print_exc()
            return {'error': str(e)}, 500

    # ==================== STYLIST MANAGEMENT METHODS ====================

    @staticmethod
    def get_stylists(current_user, params):
        """Get all stylists"""
        try:
            from app.models.stylist import Stylist
            from app.models.user import User
            
            query = Stylist.query
            
            if params.get('branch_id'):
                query = query.filter(Stylist.branch_id == params['branch_id'])
            
            if params.get('is_active') is not None:
                query = query.filter(Stylist.is_active == params['is_active'])
            
            if params.get('search'):
                search = f"%{params['search']}%"
                query = query.join(User).filter(
                    db.or_(
                        User.first_name.ilike(search),
                        User.last_name.ilike(search),
                        User.email.ilike(search)
                    )
                )
            
            query = query.order_by(Stylist.created_at.desc())
            
            page = int(params.get('page', 1))
            per_page = int(params.get('per_page', 20))
            
            stylists = query.paginate(page=page, per_page=per_page, error_out=False)
            
            result = []
            for s in stylists.items:
                user = User.query.get(s.user_id)
                result.append({
                    'id': s.id,
                    'user_id': s.user_id,
                    'name': user.full_name if user else 'Unknown',
                    'email': user.email if user else None,
                    'specialization': s.specialization,
                    'experience_years': s.experience_years,
                    'rating': s.rating,
                    'commission_rate': s.commission_rate,
                    'is_available': s.is_available,
                    'is_active': s.is_active,
                    'branch_id': s.branch_id,
                    'created_at': s.created_at.isoformat() if s.created_at else None
                })
            
            return {
                'items': result,
                'total': stylists.total,
                'page': page,
                'per_page': per_page,
                'pages': stylists.pages
            }, 200
            
        except Exception as e:
            return {'error': str(e)}, 500

    @staticmethod
    def get_stylist(current_user, stylist_id):
        """Get stylist by ID"""
        try:
            from app.models.stylist import Stylist
            from app.models.user import User
            
            stylist = Stylist.query.get(stylist_id)
            if not stylist:
                return {'error': 'Stylist not found'}, 404
            
            user = User.query.get(stylist.user_id)
            result = stylist.to_dict()
            if user:
                result['user'] = user.to_dict()
            
            return result, 200
            
        except Exception as e:
            return {'error': str(e)}, 500

    @staticmethod
    def update_stylist(current_user, stylist_id, data):
        """Update a stylist"""
        try:
            from app.models.stylist import Stylist
            from app.models.user import User
            
            stylist = Stylist.query.get(stylist_id)
            if not stylist:
                return {'error': 'Stylist not found'}, 404
            
            if 'specialization' in data:
                stylist.specialization = data['specialization']
            if 'experience_years' in data:
                stylist.experience_years = data['experience_years']
            if 'commission_rate' in data:
                stylist.commission_rate = data['commission_rate']
            if 'is_available' in data:
                stylist.is_available = data['is_available']
            if 'is_active' in data:
                stylist.is_active = data['is_active']
            if 'branch_id' in data:
                stylist.branch_id = data['branch_id']
            
            db.session.commit()
            
            return stylist.to_dict(), 200
            
        except Exception as e:
            db.session.rollback()
            return {'error': str(e)}, 500

    @staticmethod
    def toggle_stylist(current_user, stylist_id):
        """Toggle stylist status"""
        try:
            from app.models.stylist import Stylist
            
            stylist = Stylist.query.get(stylist_id)
            if not stylist:
                return {'error': 'Stylist not found'}, 404
            
            stylist.is_active = not stylist.is_active
            db.session.commit()
            
            return stylist.to_dict(), 200
            
        except Exception as e:
            db.session.rollback()
            return {'error': str(e)}, 500