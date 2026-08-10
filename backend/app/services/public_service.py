from datetime import datetime
from flask import current_app
from app.extensions import db
from app.models.service import Service
from app.models.branch import Branch
from app.models.stylist import Stylist
from app.models.promotion import Promotion
from app.models.review import Review
from app.models.category import Category

class PublicService:
    
    @staticmethod
    def get_home_data():
        """Get public home page data"""
        try:
            # Get featured services
            featured_services = Service.query.filter_by(
                is_active=True,
                is_popular=True
            ).limit(6).all()
            
            # Get active promotions
            now = datetime.utcnow()
            promotions = Promotion.query.filter(
                Promotion.is_active == True,
                Promotion.start_date <= now,
                Promotion.end_date >= now
            ).limit(3).all()
            
            # Get branches
            branches = Branch.query.filter_by(is_active=True).all()
            
            # Get testimonials
            testimonials = Review.query.filter_by(
                is_approved=True,
                is_featured=True
            ).limit(6).all()
            
            return {
                'featured_services': [s.to_dict() for s in featured_services],
                'promotions': [p.to_dict() for p in promotions],
                'branches': [b.to_dict() for b in branches],
                'testimonials': [t.to_dict() for t in testimonials]
            }, 200
            
        except Exception as e:
            import traceback
            traceback.print_exc()
            return {'error': str(e)}, 500
    
    @staticmethod
    def get_about_data():
        """Get about page data"""
        try:
            # Get team members (stylists)
            stylists = Stylist.query.filter_by(is_active=True).limit(8).all()
            
            # Get statistics
            total_services = Service.query.filter_by(is_active=True).count()
            total_branches = Branch.query.filter_by(is_active=True).count()
            total_stylists = Stylist.query.filter_by(is_active=True).count()
            
            # Get average rating
            avg_rating = db.session.query(db.func.avg(Review.rating)).filter_by(
                is_approved=True
            ).scalar() or 0
            
            return {
                'team': [s.to_dict() for s in stylists],
                'stats': {
                    'total_services': total_services,
                    'total_branches': total_branches,
                    'total_stylists': total_stylists,
                    'average_rating': round(float(avg_rating), 1)
                }
            }, 200
            
        except Exception as e:
            import traceback
            traceback.print_exc()
            return {'error': str(e)}, 500
    
    @staticmethod
    def get_services(params):
        """List all services"""
        try:
            query = Service.query.filter_by(is_active=True)
            
            # Filter by category
            if params.get('category_id'):
                query = query.filter(Service.category_id == params['category_id'])
            
            # Filter by branch
            if params.get('branch_id'):
                query = query.filter(Service.branch_id == params['branch_id'])
            
            # Search
            if params.get('search'):
                search_term = f"%{params['search']}%"
                query = query.filter(
                    db.or_(
                        Service.name.ilike(search_term),
                        Service.description.ilike(search_term)
                    )
                )
            
            # Sort
            sort_by = params.get('sort_by', 'name')
            sort_order = params.get('sort_order', 'asc')
            
            if sort_order == 'asc':
                query = query.order_by(getattr(Service, sort_by).asc())
            else:
                query = query.order_by(getattr(Service, sort_by).desc())
            
            # Pagination
            page = int(params.get('page', 1))
            per_page = int(params.get('per_page', 20))
            
            services = query.paginate(page=page, per_page=per_page, error_out=False)
            
            return {
                'items': [s.to_dict() for s in services.items],
                'total': services.total,
                'page': page,
                'per_page': per_page,
                'pages': services.pages
            }, 200
            
        except Exception as e:
            import traceback
            traceback.print_exc()
            return {'error': str(e)}, 500
    
    @staticmethod
    def get_service_detail(service_id):
        """Get service details"""
        try:
            service = Service.query.get(service_id)
            if not service:
                return {'error': 'Service not found'}, 404
            
            # Get related services
            related = Service.query.filter(
                Service.category_id == service.category_id,
                Service.id != service.id,
                Service.is_active == True
            ).limit(4).all()
            
            # Get reviews for this service
            reviews = Review.query.filter_by(
                service_id=service.id,
                is_approved=True
            ).order_by(Review.created_at.desc()).limit(10).all()
            
            # Get average rating
            avg_rating = db.session.query(db.func.avg(Review.rating)).filter_by(
                service_id=service.id,
                is_approved=True
            ).scalar() or 0
            
            return {
                'service': service.to_dict(),
                'related_services': [s.to_dict() for s in related],
                'reviews': [r.to_dict() for r in reviews],
                'average_rating': round(float(avg_rating), 1)
            }, 200
            
        except Exception as e:
            import traceback
            traceback.print_exc()
            return {'error': str(e)}, 500
    
    @staticmethod
    def get_gallery(params):
        """Get gallery images"""
        try:
            # This could be from a Gallery model or from appointment photos
            # For now, return placeholder data
            return {
                'images': [],
                'total': 0
            }, 200
            
        except Exception as e:
            import traceback
            traceback.print_exc()
            return {'error': str(e)}, 500
    
    @staticmethod
    def get_pricing():
        """Get pricing information"""
        try:
            services = Service.query.filter_by(is_active=True).all()
            
            # Group by category
            pricing = {}
            for service in services:
                category_name = service.category.name if service.category else 'Other'
                if category_name not in pricing:
                    pricing[category_name] = []
                pricing[category_name].append({
                    'name': service.name,
                    'price': service.price,
                    'duration': service.duration_minutes,
                    'description': service.description
                })
            
            return pricing, 200
            
        except Exception as e:
            import traceback
            traceback.print_exc()
            return {'error': str(e)}, 500
    
    @staticmethod
    def get_team(params):
        """Get team members"""
        try:
            query = Stylist.query.filter_by(is_active=True)
            
            # Filter by specialization
            if params.get('specialization'):
                query = query.filter(Stylist.specialization.ilike(f"%{params['specialization']}%"))
            
            # Pagination
            page = int(params.get('page', 1))
            per_page = int(params.get('per_page', 20))
            
            stylists = query.paginate(page=page, per_page=per_page, error_out=False)
            
            return {
                'items': [s.to_dict() for s in stylists.items],
                'total': stylists.total,
                'page': page,
                'per_page': per_page,
                'pages': stylists.pages
            }, 200
            
        except Exception as e:
            import traceback
            traceback.print_exc()
            return {'error': str(e)}, 500
    
    @staticmethod
    def get_branches():
        """Get all branches"""
        try:
            branches = Branch.query.filter_by(is_active=True).all()
            return [b.to_dict() for b in branches], 200
            
        except Exception as e:
            import traceback
            traceback.print_exc()
            return {'error': str(e)}, 500
    
    @staticmethod
    def get_branch_detail(branch_id):
        """Get branch details"""
        try:
            branch = Branch.query.get(branch_id)
            if not branch:
                return {'error': 'Branch not found'}, 404
            
            # Get services offered at this branch
            services = Service.query.filter_by(
                branch_id=branch_id,
                is_active=True
            ).limit(10).all()
            
            # Get stylists at this branch
            stylists = Stylist.query.filter_by(
                branch_id=branch_id,
                is_active=True
            ).limit(10).all()
            
            return {
                'branch': branch.to_dict(),
                'services': [s.to_dict() for s in services],
                'stylists': [s.to_dict() for s in stylists]
            }, 200
            
        except Exception as e:
            import traceback
            traceback.print_exc()
            return {'error': str(e)}, 500
    
    @staticmethod
    def submit_contact(data):
        """Submit contact form"""
        try:
            # Validate required fields
            required = ['name', 'email', 'message']
            for field in required:
                if field not in data:
                    return {'error': f'{field} is required'}, 400
            
            # Here you would typically send an email or store in database
            # For now, just return success
            
            return {'message': 'Contact form submitted successfully'}, 200
            
        except Exception as e:
            import traceback
            traceback.print_exc()
            return {'error': str(e)}, 500
    
    @staticmethod
    def get_promotions():
        """Get active promotions"""
        try:
            now = datetime.utcnow()
            promotions = Promotion.query.filter(
                Promotion.is_active == True,
                Promotion.start_date <= now,
                Promotion.end_date >= now
            ).all()
            
            return [p.to_dict() for p in promotions], 200
            
        except Exception as e:
            import traceback
            traceback.print_exc()
            return {'error': str(e)}, 500
    
    @staticmethod
    def get_promotion_detail(promotion_id):
        """Get promotion details"""
        try:
            promotion = Promotion.query.get(promotion_id)
            if not promotion:
                return {'error': 'Promotion not found'}, 404
            
            # Since services and products relationships are removed,
            # just return the promotion details with empty lists
            return {
                'promotion': promotion.to_dict(),
                'services': [],  # Relationship removed
                'products': []   # Relationship removed
            }, 200
            
        except Exception as e:
            import traceback
            traceback.print_exc()
            return {'error': str(e)}, 500
    
    @staticmethod
    def check_availability(params):
        """Check appointment availability"""
        try:
            from app.services.appointment_service import AppointmentService
            
            # Validate required fields
            required = ['branch_id', 'service_id', 'date']
            for field in required:
                if field not in params:
                    return {'error': f'{field} is required'}, 400
            
            # Use AppointmentService to check availability
            result, status_code = AppointmentService.get_available_slots(params)
            return result, status_code
            
        except Exception as e:
            import traceback
            traceback.print_exc()
            return {'error': str(e)}, 500
    
    @staticmethod
    def get_testimonials():
        """Get customer testimonials"""
        try:
            testimonials = Review.query.filter_by(
                is_approved=True,
                is_featured=True
            ).order_by(Review.created_at.desc()).limit(10).all()
            
            return [t.to_dict() for t in testimonials], 200
            
        except Exception as e:
            import traceback
            traceback.print_exc()
            return {'error': str(e)}, 500
    
    @staticmethod
    def get_faqs():
        """Get frequently asked questions"""
        try:
            # This could come from a FAQ model
            # For now, return placeholder data
            faqs = [
                {
                    'question': 'How do I book an appointment?',
                    'answer': 'You can book an appointment through our website, by calling us, or by visiting any of our branches.'
                },
                {
                    'question': 'What services do you offer?',
                    'answer': 'We offer a wide range of services including haircuts, hair coloring, manicure, pedicure, makeup, facials, massages, and waxing.'
                },
                {
                    'question': 'How can I cancel or reschedule?',
                    'answer': 'You can cancel or reschedule your appointment through your account dashboard or by contacting us directly.'
                },
                {
                    'question': 'What payment methods do you accept?',
                    'answer': 'We accept cash, credit/debit cards, and mobile money.'
                }
            ]
            return faqs, 200
            
        except Exception as e:
            import traceback
            traceback.print_exc()
            return {'error': str(e)}, 500
    
    @staticmethod
    def subscribe_newsletter(data):
        """Subscribe to newsletter"""
        try:
            if 'email' not in data:
                return {'error': 'Email is required'}, 400
            
            # Here you would typically store the email in a newsletter table
            # For now, just return success
            
            return {'message': 'Subscribed successfully'}, 200
            
        except Exception as e:
            import traceback
            traceback.print_exc()
            return {'error': str(e)}, 500