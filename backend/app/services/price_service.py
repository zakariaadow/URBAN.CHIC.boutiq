from datetime import datetime
from app.extensions import db
from app.models.service import Service
from app.models.user import User
import logging

logger = logging.getLogger(__name__)

class PriceService:
    
    @staticmethod
    def get_prices(params):
        """Get all prices from services"""
        try:
            query = Service.query.filter_by(is_active=True)
            
            if params.get('category_id'):
                query = query.filter(Service.category_id == params['category_id'])
            
            if params.get('branch_id'):
                query = query.filter(Service.branch_id == params['branch_id'])
            
            if params.get('search'):
                search = f"%{params['search']}%"
                query = query.filter(Service.name.ilike(search))
            
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
            
            result = []
            for s in services.items:
                result.append({
                    'id': s.id,
                    'service_id': s.id,
                    'service_name': s.name,
                    'base_price': s.price,
                    'current_price': s.price,
                    'discount_percentage': s.discount_percentage or 0.0,
                    'discount_amount': s.price * (s.discount_percentage or 0.0) / 100,
                    'tax_rate': 16.0,
                    'tax_amount': (s.price - (s.price * (s.discount_percentage or 0.0) / 100)) * 0.16,
                    'final_price': s.final_price,
                    'currency': 'KES',
                    'price_type': 'regular',
                    'is_active': s.is_active,
                    'created_at': s.created_at.isoformat() if s.created_at else None,
                    'updated_at': s.updated_at.isoformat() if s.updated_at else None
                })
            
            return {
                'items': result,
                'total': services.total,
                'page': page,
                'per_page': per_page,
                'pages': services.pages
            }, 200
            
        except Exception as e:
            logger.error(f"Error in get_prices: {e}")
            return {'error': str(e)}, 500
    
    @staticmethod
    def get_price(price_id):
        """Get price by service ID"""
        try:
            service = Service.query.get(price_id)
            if not service:
                return {'error': 'Service not found'}, 404
            
            result = {
                'id': service.id,
                'service_id': service.id,
                'service_name': service.name,
                'base_price': service.price,
                'current_price': service.price,
                'discount_percentage': service.discount_percentage or 0.0,
                'discount_amount': service.price * (service.discount_percentage or 0.0) / 100,
                'tax_rate': 16.0,
                'tax_amount': (service.price - (service.price * (service.discount_percentage or 0.0) / 100)) * 0.16,
                'final_price': service.final_price,
                'currency': 'KES',
                'price_type': 'regular',
                'is_active': service.is_active,
                'created_at': service.created_at.isoformat() if service.created_at else None,
                'updated_at': service.updated_at.isoformat() if service.updated_at else None
            }
            return result, 200
            
        except Exception as e:
            logger.error(f"Error in get_price: {e}")
            return {'error': str(e)}, 500
    
    @staticmethod
    def create_price(current_user, data):
        """Create a new price (update service price)"""
        try:
            service = Service.query.get(data.get('service_id'))
            if not service:
                return {'error': 'Service not found'}, 404
            
            old_price = service.price
            old_discount = service.discount_percentage
            
            if 'price' in data:
                service.price = data['price']
            if 'discount_percentage' in data:
                service.discount_percentage = data['discount_percentage']
            
            db.session.commit()
            
            return {
                'message': 'Price updated successfully',
                'service': service.to_dict()
            }, 200
            
        except Exception as e:
            db.session.rollback()
            logger.error(f"Error in create_price: {e}")
            return {'error': str(e)}, 500
    
    @staticmethod
    def update_price(current_user, price_id, data):
        """Update a price (update service price)"""
        try:
            service = Service.query.get(price_id)
            if not service:
                return {'error': 'Service not found'}, 404
            
            if 'price' in data:
                service.price = data['price']
            if 'discount_percentage' in data:
                service.discount_percentage = data['discount_percentage']
            if 'is_active' in data:
                service.is_active = data['is_active']
            
            db.session.commit()
            
            return {
                'message': 'Price updated successfully',
                'service': service.to_dict()
            }, 200
            
        except Exception as e:
            db.session.rollback()
            logger.error(f"Error in update_price: {e}")
            return {'error': str(e)}, 500
    
    @staticmethod
    def delete_price(current_user, price_id):
        """Delete a price (set service inactive)"""
        try:
            service = Service.query.get(price_id)
            if not service:
                return {'error': 'Service not found'}, 404
            
            service.is_active = False
            db.session.commit()
            
            return {'message': 'Price deleted successfully'}, 200
            
        except Exception as e:
            db.session.rollback()
            logger.error(f"Error in delete_price: {e}")
            return {'error': str(e)}, 500
    
    @staticmethod
    def get_prices_by_service(current_user, service_id):
        """Get prices by service"""
        try:
            service = Service.query.get(service_id)
            if not service:
                return {'error': 'Service not found'}, 404
            
            result = {
                'id': service.id,
                'service_id': service.id,
                'service_name': service.name,
                'base_price': service.price,
                'current_price': service.price,
                'discount_percentage': service.discount_percentage or 0.0,
                'final_price': service.final_price,
                'is_active': service.is_active
            }
            
            return result, 200
            
        except Exception as e:
            logger.error(f"Error in get_prices_by_service: {e}")
            return {'error': str(e)}, 500
    
    @staticmethod
    def bulk_update_prices(current_user, data):
        """Bulk update prices"""
        try:
            updates = data.get('updates', [])
            updated_count = 0
            
            for update in updates:
                service_id = update.get('service_id')
                if not service_id:
                    continue
                
                service = Service.query.get(service_id)
                if not service:
                    continue
                
                if 'price' in update:
                    service.price = update['price']
                    updated_count += 1
                
                if 'discount_percentage' in update:
                    service.discount_percentage = update['discount_percentage']
                    updated_count += 1
                
                if 'is_active' in update:
                    service.is_active = update['is_active']
                    updated_count += 1
            
            db.session.commit()
            
            return {
                'message': f'Successfully updated {updated_count} prices',
                'updated_count': updated_count
            }, 200
            
        except Exception as e:
            db.session.rollback()
            logger.error(f"Error in bulk_update_prices: {e}")
            return {'error': str(e)}, 500
    
    @staticmethod
    def get_price_history(current_user, service_id):
        """Get price history for a service"""
        try:
            # Since we don't have a price history table, return service details
            service = Service.query.get(service_id)
            if not service:
                return {'error': 'Service not found'}, 404
            
            result = {
                'service_id': service.id,
                'service_name': service.name,
                'current_price': service.price,
                'discount_percentage': service.discount_percentage or 0.0,
                'final_price': service.final_price,
                'updated_at': service.updated_at.isoformat() if service.updated_at else None,
                'history': [
                    {
                        'old_price': service.price,
                        'new_price': service.price,
                        'reason': 'Current price',
                        'changed_at': service.updated_at.isoformat() if service.updated_at else None
                    }
                ]
            }
            
            return result, 200
            
        except Exception as e:
            logger.error(f"Error in get_price_history: {e}")
            return {'error': str(e)}, 500
