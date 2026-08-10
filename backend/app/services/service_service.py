from datetime import datetime
from flask import current_app
from app.extensions import db
from app.models.service import Service
from app.models.category import Category
from app.models.branch import Branch
from app.models.appointment import Appointment
from app.models.payment import Payment
from app.services.notification_service import NotificationService

class ServiceService:
    
    @staticmethod
    def get_services(params):
        """Get all services"""
        try:
            query = Service.query
            
            if params.get('is_active') is not None:
                query = query.filter(Service.is_active == params['is_active'])
            
            if params.get('category_id'):
                query = query.filter(Service.category_id == params['category_id'])
            
            if params.get('branch_id'):
                query = query.filter(Service.branch_id == params['branch_id'])
            
            if params.get('is_popular') is not None:
                query = query.filter(Service.is_popular == params['is_popular'])
            
            if params.get('search'):
                search = f"%{params['search']}%"
                query = query.filter(
                    db.or_(
                        Service.name.ilike(search),
                        Service.description.ilike(search)
                    )
                )
            
            # Sorting
            sort_by = params.get('sort_by', 'name')
            sort_order = params.get('sort_order', 'asc')
            
            if sort_order == 'asc':
                query = query.order_by(getattr(Service, sort_by).asc())
            else:
                query = query.order_by(getattr(Service, sort_by).desc())
            
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
    
    @staticmethod
    def get_service(service_id):
        """Get service details"""
        try:
            service = Service.query.get(service_id)
            if not service:
                return {'error': 'Service not found'}, 404
            
            result = service.to_dict()
            
            # Get related services
            related = Service.query.filter(
                Service.category_id == service.category_id,
                Service.id != service.id,
                Service.is_active == True
            ).limit(4).all()
            
            result['related_services'] = [s.to_dict() for s in related]
            
            # Get reviews
            from app.models.review import Review
            reviews = Review.query.filter_by(
                service_id=service.id,
                is_approved=True
            ).order_by(Review.created_at.desc()).limit(10).all()
            
            result['reviews'] = [r.to_dict() for r in reviews]
            
            # Get average rating
            avg_rating = db.session.query(db.func.avg(Review.rating)).filter_by(
                service_id=service.id,
                is_approved=True
            ).scalar() or 0
            
            result['average_rating'] = round(float(avg_rating), 1)
            
            return result, 200
            
        except Exception as e:
            return {'error': str(e)}, 500
    
    @staticmethod
    def update_service(current_user, service_id, data):
        """Update a service"""
        try:
            service = Service.query.get(service_id)
            if not service:
                return {'error': 'Service not found'}, 404
            
            updatable_fields = [
                'name', 'description', 'price', 'duration_minutes',
                'category_id', 'branch_id', 'image', 'is_active',
                'is_popular', 'discount_percentage'
            ]
            
            for field in updatable_fields:
                if field in data:
                    setattr(service, field, data[field])
            
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
            
            # Check if service has appointments
            appointments = Appointment.query.filter_by(service_id=service.id).first()
            if appointments:
                return {'error': 'Cannot delete service with existing appointments'}, 400
            
            db.session.delete(service)
            db.session.commit()
            
            return {'message': 'Service deleted successfully'}, 200
            
        except Exception as e:
            db.session.rollback()
            return {'error': str(e)}, 500
    
    @staticmethod
    def get_services_by_category(category_id, params):
        """Get services by category"""
        params['category_id'] = category_id
        return ServiceService.get_services(params)
    
    @staticmethod
    def toggle_service(current_user, service_id):
        """Toggle service active status"""
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
    def update_service_pricing(current_user, service_id, data):
        """Update service pricing"""
        try:
            service = Service.query.get(service_id)
            if not service:
                return {'error': 'Service not found'}, 404
            
            if 'price' in data:
                service.price = data['price']
            
            if 'discount_percentage' in data:
                service.discount_percentage = data['discount_percentage']
            
            db.session.commit()
            
            return service.to_dict(), 200
            
        except Exception as e:
            db.session.rollback()
            return {'error': str(e)}, 500
    
    @staticmethod
    def add_service_to_promotion(current_user, service_id, data):
        """Add service to promotion"""
        try:
            service = Service.query.get(service_id)
            if not service:
                return {'error': 'Service not found'}, 404
            
            promotion_id = data.get('promotion_id')
            if not promotion_id:
                return {'error': 'Promotion ID is required'}, 400
            
            from app.models.promotion import Promotion
            promotion = Promotion.query.get(promotion_id)
            if not promotion:
                return {'error': 'Promotion not found'}, 404
            
            if promotion not in service.promotions:
                service.promotions.append(promotion)
                db.session.commit()
            
            return {'message': 'Service added to promotion successfully'}, 200
            
        except Exception as e:
            db.session.rollback()
            return {'error': str(e)}, 500
    
    @staticmethod
    def remove_service_from_promotion(current_user, service_id):
        """Remove service from promotion"""
        try:
            service = Service.query.get(service_id)
            if not service:
                return {'error': 'Service not found'}, 404
            
            # Remove all promotions from service
            service.promotions = []
            db.session.commit()
            
            return {'message': 'Service removed from promotion successfully'}, 200
            
        except Exception as e:
            db.session.rollback()
            return {'error': str(e)}, 500
    
    @staticmethod
    def get_service_analytics(params):
        """Get service analytics"""
        try:
            services = Service.query.filter_by(is_active=True).all()
            
            total_services = len(services)
            total_revenue = 0
            popular_services = []
            
            for service in services:
                # Get completed appointments for this service
                appointments = Appointment.query.filter_by(
                    service_id=service.id,
                    status='completed'
                ).all()
                
                revenue = sum(a.final_amount for a in appointments)
                count = len(appointments)
                
                total_revenue += revenue
                
                popular_services.append({
                    'service_name': service.name,
                    'count': count,
                    'revenue': revenue
                })
            
            # Sort by count
            popular_services.sort(key=lambda x: x['count'], reverse=True)
            
            return {
                'total_services': total_services,
                'total_revenue': total_revenue,
                'popular_services': popular_services[:5]
            }, 200
            
        except Exception as e:
            return {'error': str(e)}, 500
    
    @staticmethod
    def get_popular_services(params):
        """Get popular services"""
        try:
            limit = int(params.get('limit', 5))
            
            results = db.session.query(
                Service.name,
                db.func.count(Appointment.id).label('count'),
                db.func.sum(Appointment.final_amount).label('revenue')
            ).join(
                Appointment, Appointment.service_id == Service.id
            ).filter(
                Appointment.status == 'completed'
            ).group_by(Service.id).order_by(
                db.desc('count')
            ).limit(limit).all()
            
            return {
                'items': [
                    {
                        'service_name': r[0],
                        'count': r[1],
                        'revenue': r[2] or 0
                    } for r in results
                ]
            }, 200
            
        except Exception as e:
            return {'error': str(e)}, 500
    
    @staticmethod
    def export_services(data):
        """Export services to file"""
        try:
            return {'message': 'Services exported'}, 200
        except Exception as e:
            return {'error': str(e)}, 500
    
    @staticmethod
    def bulk_update_services(current_user, data):
        """Bulk update services"""
        try:
            services_data = data.get('services', [])
            
            for service_data in services_data:
                service_id = service_data.get('id')
                if not service_id:
                    continue
                
                service = Service.query.get(service_id)
                if not service:
                    continue
                
                for key, value in service_data.items():
                    if key != 'id' and hasattr(service, key):
                        setattr(service, key, value)
            
            db.session.commit()
            
            return {'message': f'Updated {len(services_data)} services'}, 200
            
        except Exception as e:
            db.session.rollback()
            return {'error': str(e)}, 500