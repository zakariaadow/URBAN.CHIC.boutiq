from datetime import datetime
from flask import current_app
from app.extensions import db
from app.models.product import Product
from app.models.category import Category
from app.models.supplier import Supplier
from app.models.branch import Branch
from app.models.stock import Stock
from app.models.purchase import Purchase
from app.services.notification_service import NotificationService

# DO NOT define product_promotions here - it's already in models/product.py

class ProductService:
    
    @staticmethod
    def get_products(params):
        """Get all products"""
        try:
            query = Product.query
            
            if params.get('is_active') is not None:
                query = query.filter(Product.is_active == params['is_active'])
            
            if params.get('category_id'):
                query = query.filter(Product.category_id == params['category_id'])
            
            if params.get('supplier_id'):
                query = query.filter(Product.supplier_id == params['supplier_id'])
            
            if params.get('branch_id'):
                query = query.filter(Product.branch_id == params['branch_id'])
            
            if params.get('is_featured') is not None:
                query = query.filter(Product.is_featured == params['is_featured'])
            
            if params.get('low_stock') == 'true':
                query = query.filter(Product.quantity <= Product.min_quantity)
            
            if params.get('search'):
                search = f"%{params['search']}%"
                query = query.filter(
                    db.or_(
                        Product.name.ilike(search),
                        Product.sku.ilike(search),
                        Product.barcode.ilike(search),
                        Product.description.ilike(search)
                    )
                )
            
            # Sorting
            sort_by = params.get('sort_by', 'name')
            sort_order = params.get('sort_order', 'asc')
            
            if sort_order == 'asc':
                query = query.order_by(getattr(Product, sort_by).asc())
            else:
                query = query.order_by(getattr(Product, sort_by).desc())
            
            page = int(params.get('page', 1))
            per_page = int(params.get('per_page', 20))
            
            products = query.paginate(page=page, per_page=per_page, error_out=False)
            
            total_value = db.session.query(db.func.sum(Product.quantity * Product.purchase_price)).filter(
                Product.is_active == True
            ).scalar() or 0
            
            return {
                'items': [p.to_dict() for p in products.items],
                'total': products.total,
                'page': page,
                'per_page': per_page,
                'pages': products.pages,
                'summary': {
                    'total_value': total_value,
                    'total_items': products.total
                }
            }, 200
            
        except Exception as e:
            return {'error': str(e)}, 500
    
    @staticmethod
    def create_product(current_user, data):
        """Create a new product"""
        try:
            # Generate SKU if not provided
            sku = data.get('sku')
            if not sku:
                sku = ProductService._generate_sku(data.get('name'))
            
            product = Product(
                name=data['name'],
                description=data.get('description'),
                sku=sku,
                barcode=data.get('barcode'),
                category_id=data.get('category_id'),
                supplier_id=data.get('supplier_id'),
                branch_id=data.get('branch_id'),
                purchase_price=data.get('purchase_price', 0),
                selling_price=data.get('selling_price', 0),
                wholesale_price=data.get('wholesale_price'),
                quantity=data.get('quantity', 0),
                min_quantity=data.get('min_quantity', 5),
                max_quantity=data.get('max_quantity'),
                unit=data.get('unit', 'piece'),
                weight=data.get('weight'),
                dimensions=data.get('dimensions'),
                images=data.get('images', []),
                is_active=data.get('is_active', True),
                is_featured=data.get('is_featured', False),
                is_taxable=data.get('is_taxable', True),
                tax_rate=data.get('tax_rate', 0.0),
                expiry_date=data.get('expiry_date'),
                batch_number=data.get('batch_number')
            )
            
            db.session.add(product)
            db.session.flush()
            
            # Create initial stock record if quantity > 0
            if product.quantity > 0:
                stock = Stock(
                    product_id=product.id,
                    branch_id=product.branch_id,
                    inventory_officer_id=current_user.id,
                    movement_type='in',
                    quantity=product.quantity,
                    previous_quantity=0,
                    new_quantity=product.quantity,
                    reason='Initial stock',
                    notes='Product creation'
                )
                db.session.add(stock)
            
            db.session.commit()
            
            return product.to_dict(), 201
            
        except Exception as e:
            db.session.rollback()
            return {'error': str(e)}, 500
    
    @staticmethod
    def _generate_sku(name):
        """Generate SKU from product name"""
        import random
        import string
        prefix = ''.join(word[0].upper() for word in name.split()[:3])
        random_part = ''.join(random.choices(string.digits, k=6))
        return f"{prefix}{random_part}"
    
    @staticmethod
    def get_product(current_user, product_id):
        """Get product details"""
        try:
            product = Product.query.get(product_id)
            if not product:
                return {'error': 'Product not found'}, 404
            
            result = product.to_dict()
            
            # Get stock movements
            movements = Stock.query.filter_by(
                product_id=product.id
            ).order_by(Stock.movement_date.desc()).limit(20).all()
            result['recent_movements'] = [m.to_dict() for m in movements]
            
            # Get purchases
            purchases = Purchase.query.filter_by(
                product_id=product.id
            ).order_by(Purchase.purchase_date.desc()).limit(10).all()
            result['recent_purchases'] = [p.to_dict() for p in purchases]
            
            return result, 200
            
        except Exception as e:
            return {'error': str(e)}, 500
    
    @staticmethod
    def update_product(current_user, product_id, data):
        """Update a product"""
        try:
            product = Product.query.get(product_id)
            if not product:
                return {'error': 'Product not found'}, 404
            
            updatable_fields = [
                'name', 'description', 'sku', 'barcode', 'category_id',
                'supplier_id', 'branch_id', 'purchase_price', 'selling_price',
                'wholesale_price', 'quantity', 'min_quantity', 'max_quantity',
                'unit', 'weight', 'dimensions', 'images', 'is_active',
                'is_featured', 'is_taxable', 'tax_rate', 'expiry_date',
                'batch_number'
            ]
            
            for field in updatable_fields:
                if field in data:
                    setattr(product, field, data[field])
            
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
            
            # Check if product has stock movements
            stock = Stock.query.filter_by(product_id=product.id).first()
            if stock:
                return {'error': 'Cannot delete product with stock history'}, 400
            
            db.session.delete(product)
            db.session.commit()
            
            return {'message': 'Product deleted successfully'}, 200
            
        except Exception as e:
            db.session.rollback()
            return {'error': str(e)}, 500
    
    @staticmethod
    def get_product_by_barcode(current_user, barcode):
        """Get product by barcode"""
        try:
            product = Product.query.filter_by(barcode=barcode, is_active=True).first()
            if not product:
                return {'error': 'Product not found'}, 404
            return product.to_dict(), 200
        except Exception as e:
            return {'error': str(e)}, 500
    
    @staticmethod
    def get_products_by_category(category_id, params):
        """Get products by category"""
        params['category_id'] = category_id
        return ProductService.get_products(params)
    
    @staticmethod
    def search_products(params):
        """Search products"""
        return ProductService.get_products(params)
    
    @staticmethod
    def update_product_stock(current_user, product_id, data):
        """Update product stock"""
        try:
            product = Product.query.get(product_id)
            if not product:
                return {'error': 'Product not found'}, 404
            
            new_quantity = data.get('quantity')
            if new_quantity is None:
                return {'error': 'Quantity is required'}, 400
            
            if new_quantity < 0:
                return {'error': 'Quantity cannot be negative'}, 400
            
            previous_quantity = product.quantity
            difference = new_quantity - previous_quantity
            
            product.quantity = new_quantity
            
            if difference != 0:
                stock = Stock(
                    product_id=product.id,
                    branch_id=data.get('branch_id', product.branch_id),
                    inventory_officer_id=current_user.id,
                    movement_type='adjustment' if difference > 0 else 'out',
                    quantity=abs(difference),
                    previous_quantity=previous_quantity,
                    new_quantity=new_quantity,
                    reason=data.get('reason', 'Stock update'),
                    notes=data.get('notes')
                )
                db.session.add(stock)
                
                # Check for low stock alert
                if product.min_quantity and product.quantity <= product.min_quantity:
                    NotificationService.create_notification(
                        user_id=current_user.id,
                        title='Low Stock Alert',
                        message=f'Product {product.name} is running low. Current quantity: {product.quantity}',
                        type='inventory',
                        priority='high'
                    )
            
            db.session.commit()
            
            return product.to_dict(), 200
            
        except Exception as e:
            db.session.rollback()
            return {'error': str(e)}, 500
    
    @staticmethod
    def toggle_product(current_user, product_id):
        """Toggle product status"""
        try:
            product = Product.query.get(product_id)
            if not product:
                return {'error': 'Product not found'}, 404
            
            product.is_active = not product.is_active
            db.session.commit()
            
            return product.to_dict(), 200
            
        except Exception as e:
            db.session.rollback()
            return {'error': str(e)}, 500
    
    @staticmethod
    def upload_product_image(current_user, product_id, files):
        """Upload product image"""
        try:
            import os
            import uuid
            
            product = Product.query.get(product_id)
            if not product:
                return {'error': 'Product not found'}, 404
            
            if 'image' not in files:
                return {'error': 'No image provided'}, 400
            
            file = files['image']
            if file.filename == '':
                return {'error': 'No file selected'}, 400
            
            # Validate file type
            allowed_extensions = {'png', 'jpg', 'jpeg', 'gif', 'webp'}
            if '.' not in file.filename or file.filename.rsplit('.', 1)[1].lower() not in allowed_extensions:
                return {'error': 'Invalid file type. Allowed: png, jpg, jpeg, gif, webp'}, 400
            
            # Generate filename
            filename = f"product_{product_id}_{uuid.uuid4().hex[:8]}.{file.filename.rsplit('.', 1)[1].lower()}"
            
            # Save file
            upload_path = os.path.join(current_app.config['UPLOAD_FOLDER'], 'products')
            os.makedirs(upload_path, exist_ok=True)
            file_path = os.path.join(upload_path, filename)
            file.save(file_path)
            
            image_url = f"/uploads/products/{filename}"
            
            # Add to images list
            if not product.images:
                product.images = []
            product.images.append(image_url)
            db.session.commit()
            
            return {'images': product.images}, 200
            
        except Exception as e:
            db.session.rollback()
            return {'error': str(e)}, 500
    
    @staticmethod
    def get_product_analytics(params):
        """Get product analytics"""
        try:
            total_products = Product.query.filter_by(is_active=True).count()
            total_value = db.session.query(db.func.sum(Product.quantity * Product.purchase_price)).filter(
                Product.is_active == True
            ).scalar() or 0
            
            low_stock = Product.query.filter(
                Product.quantity <= Product.min_quantity,
                Product.is_active == True
            ).count()
            
            expired = Product.query.filter(
                Product.expiry_date <= datetime.utcnow().date(),
                Product.is_active == True
            ).count()
            
            # Get top selling products
            from app.models.appointment import Appointment
            
            top_products = db.session.query(
                Product.name,
                db.func.sum(Stock.quantity).label('total_sold')
            ).join(
                Stock, Stock.product_id == Product.id
            ).filter(
                Stock.movement_type == 'out',
                Stock.reference_type == 'sale'
            ).group_by(Product.id).order_by(
                db.desc('total_sold')
            ).limit(10).all()
            
            return {
                'total_products': total_products,
                'total_value': total_value,
                'low_stock_items': low_stock,
                'expired_items': expired,
                'top_products': [
                    {
                        'name': p[0],
                        'total_sold': p[1] or 0
                    } for p in top_products
                ]
            }, 200
            
        except Exception as e:
            return {'error': str(e)}, 500
    
    @staticmethod
    def export_products(data):
        """Export products to file"""
        try:
            # For now, return placeholder
            return {'message': 'Products exported'}, 200
        except Exception as e:
            return {'error': str(e)}, 500
    
    @staticmethod
    def bulk_update_products(current_user, data):
        """Bulk update products"""
        try:
            products_data = data.get('products', [])
            
            for product_data in products_data:
                product_id = product_data.get('id')
                if not product_id:
                    continue
                
                product = Product.query.get(product_id)
                if not product:
                    continue
                
                for key, value in product_data.items():
                    if key != 'id' and hasattr(product, key):
                        setattr(product, key, value)
            
            db.session.commit()
            
            return {'message': f'Updated {len(products_data)} products'}, 200
            
        except Exception as e:
            db.session.rollback()
            return {'error': str(e)}, 500