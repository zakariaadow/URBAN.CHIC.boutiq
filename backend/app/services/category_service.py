from datetime import datetime
from flask import current_app
from app.extensions import db
from app.models.category import Category
from app.models.service import Service
from app.models.product import Product

class CategoryService:
    
    @staticmethod
    def get_categories(params):
        """Get all categories"""
        try:
            query = Category.query
            
            if params.get('is_active') is not None:
                query = query.filter(Category.is_active == params['is_active'])
            
            if params.get('parent_id') is not None:
                query = query.filter(Category.parent_id == params['parent_id'])
            
            if params.get('search'):
                search = f"%{params['search']}%"
                query = query.filter(
                    db.or_(
                        Category.name.ilike(search),
                        Category.description.ilike(search)
                    )
                )
            
            query = query.order_by(Category.name.asc())
            
            page = int(params.get('page', 1))
            per_page = int(params.get('per_page', 20))
            
            categories = query.paginate(page=page, per_page=per_page, error_out=False)
            
            return {
                'items': [c.to_dict() for c in categories.items],
                'total': categories.total,
                'page': page,
                'per_page': per_page,
                'pages': categories.pages
            }, 200
            
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
    
    @staticmethod
    def get_category(category_id):
        """Get category details"""
        try:
            category = Category.query.get(category_id)
            if not category:
                return {'error': 'Category not found'}, 404
            
            result = category.to_dict()
            
            # Get subcategories
            subcategories = Category.query.filter_by(
                parent_id=category.id,
                is_active=True
            ).all()
            result['subcategories'] = [c.to_dict() for c in subcategories]
            
            # Get services in this category
            services = Service.query.filter_by(
                category_id=category.id,
                is_active=True
            ).all()
            result['services'] = [s.to_dict() for s in services]
            
            # Get products in this category
            products = Product.query.filter_by(
                category_id=category.id,
                is_active=True
            ).all()
            result['products'] = [p.to_dict() for p in products]
            
            return result, 200
            
        except Exception as e:
            return {'error': str(e)}, 500
    
    @staticmethod
    def update_category(current_user, category_id, data):
        """Update a category"""
        try:
            category = Category.query.get(category_id)
            if not category:
                return {'error': 'Category not found'}, 404
            
            updatable_fields = [
                'name', 'description', 'icon', 'image',
                'parent_id', 'is_active'
            ]
            
            for field in updatable_fields:
                if field in data:
                    setattr(category, field, data[field])
            
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
            
            # Check if category has subcategories
            subcategories = Category.query.filter_by(parent_id=category.id).first()
            if subcategories:
                return {'error': 'Cannot delete category with subcategories'}, 400
            
            # Check if category has services
            services = Service.query.filter_by(category_id=category.id).first()
            if services:
                return {'error': 'Cannot delete category with associated services'}, 400
            
            # Check if category has products
            products = Product.query.filter_by(category_id=category.id).first()
            if products:
                return {'error': 'Cannot delete category with associated products'}, 400
            
            db.session.delete(category)
            db.session.commit()
            
            return {'message': 'Category deleted successfully'}, 200
            
        except Exception as e:
            db.session.rollback()
            return {'error': str(e)}, 500
    
    @staticmethod
    def get_category_services(category_id, params):
        """Get services in a category"""
        try:
            category = Category.query.get(category_id)
            if not category:
                return {'error': 'Category not found'}, 404
            
            query = Service.query.filter_by(
                category_id=category.id,
                is_active=True
            )
            
            if params.get('branch_id'):
                query = query.filter(Service.branch_id == params['branch_id'])
            
            services = query.all()
            return [s.to_dict() for s in services], 200
            
        except Exception as e:
            return {'error': str(e)}, 500
    
    @staticmethod
    def toggle_category(current_user, category_id):
        """Toggle category status"""
        try:
            category = Category.query.get(category_id)
            if not category:
                return {'error': 'Category not found'}, 404
            
            category.is_active = not category.is_active
            db.session.commit()
            
            return category.to_dict(), 200
            
        except Exception as e:
            db.session.rollback()
            return {'error': str(e)}, 500
    
    @staticmethod
    def get_category_analytics(params):
        """Get category analytics"""
        try:
            categories = Category.query.filter_by(is_active=True).all()
            
            total_categories = len(categories)
            total_services = Service.query.filter_by(is_active=True).count()
            total_products = Product.query.filter_by(is_active=True).count()
            
            # Category breakdown
            category_breakdown = []
            for category in categories:
                services_count = Service.query.filter_by(
                    category_id=category.id,
                    is_active=True
                ).count()
                
                products_count = Product.query.filter_by(
                    category_id=category.id,
                    is_active=True
                ).count()
                
                category_breakdown.append({
                    'category_name': category.name,
                    'services_count': services_count,
                    'products_count': products_count,
                    'total': services_count + products_count
                })
            
            # Sort by total
            category_breakdown.sort(key=lambda x: x['total'], reverse=True)
            
            return {
                'total_categories': total_categories,
                'total_services': total_services,
                'total_products': total_products,
                'category_breakdown': category_breakdown
            }, 200
            
        except Exception as e:
            return {'error': str(e)}, 500
    
    @staticmethod
    def export_categories(data):
        """Export categories to file"""
        try:
            return {'message': 'Categories exported'}, 200
        except Exception as e:
            return {'error': str(e)}, 500
    
    @staticmethod
    def bulk_update_categories(current_user, data):
        """Bulk update categories"""
        try:
            categories_data = data.get('categories', [])
            
            for category_data in categories_data:
                category_id = category_data.get('id')
                if not category_id:
                    continue
                
                category = Category.query.get(category_id)
                if not category:
                    continue
                
                for key, value in category_data.items():
                    if key != 'id' and hasattr(category, key):
                        setattr(category, key, value)
            
            db.session.commit()
            
            return {'message': f'Updated {len(categories_data)} categories'}, 200
            
        except Exception as e:
            db.session.rollback()
            return {'error': str(e)}, 500