from datetime import datetime
from flask import current_app
from app.extensions import db
from app.models.branch import Branch
from app.models.manager import Manager
from app.models.stylist import Stylist
from app.models.receptionist import Receptionist
from app.models.appointment import Appointment
from app.models.payment import Payment
from app.models.product import Product
from app.models.service import Service
from app.models.stock import Stock
from app.services.notification_service import NotificationService

class BranchService:
    
    @staticmethod
    def get_branches(params):
        """Get all branches"""
        try:
            query = Branch.query
            
            if params.get('is_active') is not None:
                query = query.filter(Branch.is_active == params['is_active'])
            
            if params.get('city'):
                query = query.filter(Branch.city.ilike(f"%{params['city']}%"))
            
            if params.get('search'):
                search = f"%{params['search']}%"
                query = query.filter(
                    db.or_(
                        Branch.name.ilike(search),
                        Branch.code.ilike(search),
                        Branch.address.ilike(search),
                        Branch.city.ilike(search)
                    )
                )
            
            query = query.order_by(Branch.name.asc())
            
            page = int(params.get('page', 1))
            per_page = int(params.get('per_page', 20))
            
            branches = query.paginate(page=page, per_page=per_page, error_out=False)
            
            return {
                'items': [b.to_dict() for b in branches.items],
                'total': branches.total,
                'page': page,
                'per_page': per_page,
                'pages': branches.pages
            }, 200
            
        except Exception as e:
            return {'error': str(e)}, 500
    
    @staticmethod
    def create_branch(current_user, data):
        """Create a new branch"""
        try:
            # Generate branch code if not provided
            code = data.get('code')
            if not code:
                code = f"BR{datetime.utcnow().strftime('%Y%m%d%H%M%S')}"
            
            branch = Branch(
                name=data['name'],
                code=code,
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
    
    @staticmethod
    def get_branch(branch_id):
        """Get branch details"""
        try:
            branch = Branch.query.get(branch_id)
            if not branch:
                return {'error': 'Branch not found'}, 404
            
            result = branch.to_dict()
            
            # Get staff
            managers = Manager.query.filter_by(branch_id=branch.id, is_active=True).all()
            stylists = Stylist.query.filter_by(branch_id=branch.id, is_active=True).all()
            receptionists = Receptionist.query.filter_by(branch_id=branch.id, is_active=True).all()
            
            result['staff'] = {
                'managers': [m.to_dict() for m in managers],
                'stylists': [s.to_dict() for s in stylists],
                'receptionists': [r.to_dict() for r in receptionists],
                'total': len(managers) + len(stylists) + len(receptionists)
            }
            
            # Get services
            services = Service.query.filter_by(branch_id=branch.id, is_active=True).all()
            result['services'] = [s.to_dict() for s in services]
            
            # Get products
            products = Product.query.filter_by(branch_id=branch.id, is_active=True).all()
            result['products'] = [p.to_dict() for p in products]
            
            # Get today's appointments count
            today = datetime.utcnow().date()
            today_appointments = Appointment.query.filter(
                Appointment.branch_id == branch.id,
                Appointment.appointment_date == today
            ).count()
            result['today_appointments'] = today_appointments
            
            return result, 200
            
        except Exception as e:
            return {'error': str(e)}, 500
    
    @staticmethod
    def update_branch(current_user, branch_id, data):
        """Update a branch"""
        try:
            branch = Branch.query.get(branch_id)
            if not branch:
                return {'error': 'Branch not found'}, 404
            
            updatable_fields = [
                'name', 'code', 'address', 'city', 'state', 'country',
                'postal_code', 'phone', 'email', 'manager_name',
                'opening_time', 'closing_time', 'days_open', 'is_active'
            ]
            
            for field in updatable_fields:
                if field in data:
                    setattr(branch, field, data[field])
            
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
            
            # Check if branch has staff
            staff_count = Stylist.query.filter_by(branch_id=branch.id).count() + \
                         Receptionist.query.filter_by(branch_id=branch.id).count() + \
                         Manager.query.filter_by(branch_id=branch.id).count()
            
            if staff_count > 0:
                return {'error': 'Cannot delete branch with assigned staff'}, 400
            
            db.session.delete(branch)
            db.session.commit()
            
            return {'message': 'Branch deleted successfully'}, 200
            
        except Exception as e:
            db.session.rollback()
            return {'error': str(e)}, 500
    
    @staticmethod
    def get_branch_staff(branch_id, params):
        """Get staff of a branch"""
        try:
            branch = Branch.query.get(branch_id)
            if not branch:
                return {'error': 'Branch not found'}, 404
            
            stylists = Stylist.query.filter_by(branch_id=branch.id, is_active=True).all()
            receptionists = Receptionist.query.filter_by(branch_id=branch.id, is_active=True).all()
            managers = Manager.query.filter_by(branch_id=branch.id, is_active=True).all()
            
            return {
                'managers': [m.to_dict() for m in managers],
                'stylists': [s.to_dict() for s in stylists],
                'receptionists': [r.to_dict() for r in receptionists],
                'total': len(managers) + len(stylists) + len(receptionists)
            }, 200
            
        except Exception as e:
            return {'error': str(e)}, 500
    
    @staticmethod
    def get_branch_appointments(branch_id, params):
        """Get appointments of a branch"""
        try:
            branch = Branch.query.get(branch_id)
            if not branch:
                return {'error': 'Branch not found'}, 404
            
            query = Appointment.query.filter_by(branch_id=branch.id)
            
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
    def get_branch_services(branch_id, params):
        """Get services offered at a branch"""
        try:
            branch = Branch.query.get(branch_id)
            if not branch:
                return {'error': 'Branch not found'}, 404
            
            query = Service.query.filter_by(branch_id=branch.id, is_active=True)
            
            if params.get('category_id'):
                query = query.filter(Service.category_id == params['category_id'])
            
            services = query.all()
            return [s.to_dict() for s in services], 200
            
        except Exception as e:
            return {'error': str(e)}, 500
    
    @staticmethod
    def get_branch_products(branch_id, params):
        """Get products available at a branch"""
        try:
            branch = Branch.query.get(branch_id)
            if not branch:
                return {'error': 'Branch not found'}, 404
            
            query = Product.query.filter_by(branch_id=branch.id, is_active=True)
            
            if params.get('category_id'):
                query = query.filter(Product.category_id == params['category_id'])
            
            if params.get('low_stock') == 'true':
                query = query.filter(Product.quantity <= Product.min_quantity)
            
            products = query.all()
            return [p.to_dict() for p in products], 200
            
        except Exception as e:
            return {'error': str(e)}, 500
    
    @staticmethod
    def get_branch_inventory(branch_id, params):
        """Get inventory of a branch"""
        try:
            branch = Branch.query.get(branch_id)
            if not branch:
                return {'error': 'Branch not found'}, 404
            
            query = Product.query.filter_by(branch_id=branch.id, is_active=True)
            
            if params.get('category_id'):
                query = query.filter(Product.category_id == params['category_id'])
            
            products = query.all()
            
            total_items = sum(p.quantity for p in products)
            total_value = sum(p.quantity * p.purchase_price for p in products)
            
            return {
                'products': [p.to_dict() for p in products],
                'summary': {
                    'total_products': len(products),
                    'total_items': total_items,
                    'total_value': total_value
                }
            }, 200
            
        except Exception as e:
            return {'error': str(e)}, 500
    
    @staticmethod
    def get_branch_sales(branch_id, params):
        """Get sales of a branch"""
        try:
            branch = Branch.query.get(branch_id)
            if not branch:
                return {'error': 'Branch not found'}, 404
            
            start_date = params.get('start_date', datetime.utcnow().date().isoformat())
            end_date = params.get('end_date', datetime.utcnow().date().isoformat())
            
            # Total revenue
            revenue = db.session.query(db.func.sum(Payment.amount)).filter(
                Payment.payment_status == 'paid',
                db.func.date(Payment.payment_date) >= start_date,
                db.func.date(Payment.payment_date) <= end_date
            ).join(Appointment).filter(
                Appointment.branch_id == branch.id
            ).scalar() or 0
            
            # Total appointments
            appointments = Appointment.query.filter(
                Appointment.branch_id == branch.id,
                Appointment.appointment_date >= start_date,
                Appointment.appointment_date <= end_date
            ).count()
            
            # Completed appointments
            completed = Appointment.query.filter(
                Appointment.branch_id == branch.id,
                Appointment.appointment_date >= start_date,
                Appointment.appointment_date <= end_date,
                Appointment.status == 'completed'
            ).count()
            
            return {
                'start_date': start_date,
                'end_date': end_date,
                'total_revenue': revenue,
                'total_appointments': appointments,
                'completed_appointments': completed,
                'completion_rate': (completed / appointments * 100) if appointments > 0 else 0,
                'average_revenue': revenue / appointments if appointments > 0 else 0
            }, 200
            
        except Exception as e:
            return {'error': str(e)}, 500
    
    @staticmethod
    def get_branch_statistics(branch_id):
        """Get branch statistics"""
        try:
            branch = Branch.query.get(branch_id)
            if not branch:
                return {'error': 'Branch not found'}, 404
            
            today = datetime.utcnow().date()
            week_start = today - timedelta(days=today.weekday())
            
            # Staff count
            stylists = Stylist.query.filter_by(branch_id=branch.id, is_active=True).count()
            receptionists = Receptionist.query.filter_by(branch_id=branch.id, is_active=True).count()
            managers = Manager.query.filter_by(branch_id=branch.id, is_active=True).count()
            
            # Today's appointments
            today_appointments = Appointment.query.filter(
                Appointment.branch_id == branch.id,
                Appointment.appointment_date == today
            ).count()
            
            # Today's revenue
            today_revenue = db.session.query(db.func.sum(Payment.amount)).filter(
                Payment.payment_status == 'paid',
                db.func.date(Payment.payment_date) == today
            ).join(Appointment).filter(
                Appointment.branch_id == branch.id
            ).scalar() or 0
            
            # Week appointments
            week_appointments = Appointment.query.filter(
                Appointment.branch_id == branch.id,
                Appointment.appointment_date >= week_start,
                Appointment.appointment_date <= today
            ).count()
            
            # Total customers
            total_customers = db.session.query(
                db.func.count(db.distinct(Appointment.customer_id))
            ).filter(
                Appointment.branch_id == branch.id
            ).scalar() or 0
            
            return {
                'branch': branch.to_dict(),
                'staff': {
                    'managers': managers,
                    'stylists': stylists,
                    'receptionists': receptionists,
                    'total': managers + stylists + receptionists
                },
                'today': {
                    'appointments': today_appointments,
                    'revenue': today_revenue
                },
                'week_appointments': week_appointments,
                'total_customers': total_customers
            }, 200
            
        except Exception as e:
            return {'error': str(e)}, 500
    
    @staticmethod
    def toggle_branch(current_user, branch_id):
        """Toggle branch status"""
        try:
            branch = Branch.query.get(branch_id)
            if not branch:
                return {'error': 'Branch not found'}, 404
            
            branch.is_active = not branch.is_active
            db.session.commit()
            
            return branch.to_dict(), 200
            
        except Exception as e:
            db.session.rollback()
            return {'error': str(e)}, 500
    
    @staticmethod
    def get_branch_analytics(params):
        """Get branch analytics"""
        try:
            branches = Branch.query.filter_by(is_active=True).all()
            
            total_branches = len(branches)
            total_staff = 0
            total_appointments_today = 0
            total_revenue_today = 0
            
            today = datetime.utcnow().date()
            
            for branch in branches:
                # Staff count
                staff = Stylist.query.filter_by(branch_id=branch.id, is_active=True).count() + \
                        Receptionist.query.filter_by(branch_id=branch.id, is_active=True).count() + \
                        Manager.query.filter_by(branch_id=branch.id, is_active=True).count()
                total_staff += staff
                
                # Today's appointments
                appointments = Appointment.query.filter(
                    Appointment.branch_id == branch.id,
                    Appointment.appointment_date == today
                ).count()
                total_appointments_today += appointments
                
                # Today's revenue
                revenue = db.session.query(db.func.sum(Payment.amount)).filter(
                    Payment.payment_status == 'paid',
                    db.func.date(Payment.payment_date) == today
                ).join(Appointment).filter(
                    Appointment.branch_id == branch.id
                ).scalar() or 0
                total_revenue_today += revenue
            
            return {
                'total_branches': total_branches,
                'total_staff': total_staff,
                'total_appointments_today': total_appointments_today,
                'total_revenue_today': total_revenue_today,
                'average_revenue_per_branch': total_revenue_today / total_branches if total_branches > 0 else 0
            }, 200
            
        except Exception as e:
            return {'error': str(e)}, 500
    
    @staticmethod
    def get_branch_performance(branch_id, params):
        """Get branch performance"""
        try:
            branch = Branch.query.get(branch_id)
            if not branch:
                return {'error': 'Branch not found'}, 404
            
            start_date = params.get('start_date', datetime.utcnow().date().isoformat())
            end_date = params.get('end_date', datetime.utcnow().date().isoformat())
            
            # Get performance metrics
            appointments = Appointment.query.filter(
                Appointment.branch_id == branch.id,
                Appointment.appointment_date >= start_date,
                Appointment.appointment_date <= end_date
            ).all()
            
            total_appointments = len(appointments)
            completed = sum(1 for a in appointments if a.status == 'completed')
            cancelled = sum(1 for a in appointments if a.status == 'cancelled')
            
            revenue = db.session.query(db.func.sum(Payment.amount)).filter(
                Payment.payment_status == 'paid',
                db.func.date(Payment.payment_date) >= start_date,
                db.func.date(Payment.payment_date) <= end_date
            ).join(Appointment).filter(
                Appointment.branch_id == branch.id
            ).scalar() or 0
            
            # Top stylist
            top_stylist = db.session.query(
                Stylist.id,
                User.first_name,
                User.last_name,
                db.func.count(Appointment.id).label('count')
            ).join(
                Appointment, Appointment.stylist_id == Stylist.id
            ).join(
                User, User.id == Stylist.user_id
            ).filter(
                Appointment.branch_id == branch.id,
                Appointment.appointment_date >= start_date,
                Appointment.appointment_date <= end_date,
                Appointment.status == 'completed'
            ).group_by(Stylist.id).order_by(
                db.desc('count')
            ).first()
            
            return {
                'branch': branch.to_dict(),
                'period': {
                    'start_date': start_date,
                    'end_date': end_date
                },
                'performance': {
                    'total_appointments': total_appointments,
                    'completed': completed,
                    'cancelled': cancelled,
                    'completion_rate': (completed / total_appointments * 100) if total_appointments > 0 else 0,
                    'total_revenue': revenue,
                    'average_revenue': revenue / total_appointments if total_appointments > 0 else 0
                },
                'top_stylist': {
                    'name': f"{top_stylist[1]} {top_stylist[2]}" if top_stylist else None,
                    'appointments': top_stylist[3] if top_stylist else 0
                } if top_stylist else None
            }, 200
            
        except Exception as e:
            return {'error': str(e)}, 500
    
    @staticmethod
    def export_branches(data):
        """Export branches to file"""
        try:
            return {'message': 'Branches exported'}, 200
        except Exception as e:
            return {'error': str(e)}, 500