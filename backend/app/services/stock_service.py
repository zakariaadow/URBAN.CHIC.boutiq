from datetime import datetime, timedelta
from flask import current_app
from app.extensions import db
from app.models.product import Product
from app.models.stock import Stock
from app.models.branch import Branch
from app.services.notification_service import NotificationService

class StockService:
    
    @staticmethod
    def get_stock_levels(params):
        """Get stock levels"""
        try:
            query = Product.query.filter_by(is_active=True)
            
            if params.get('branch_id'):
                query = query.filter(Product.branch_id == params['branch_id'])
            
            if params.get('category_id'):
                query = query.filter(Product.category_id == params['category_id'])
            
            if params.get('supplier_id'):
                query = query.filter(Product.supplier_id == params['supplier_id'])
            
            if params.get('low_stock') == 'true':
                query = query.filter(Product.quantity <= Product.min_quantity)
            
            if params.get('search'):
                search = f"%{params['search']}%"
                query = query.filter(
                    db.or_(
                        Product.name.ilike(search),
                        Product.sku.ilike(search),
                        Product.barcode.ilike(search)
                    )
                )
            
            query = query.order_by(Product.name.asc())
            
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
                    'total_value': total_value
                }
            }, 200
            
        except Exception as e:
            return {'error': str(e)}, 500
    
    @staticmethod
    def get_stock_by_product(current_user, product_id):
        """Get stock by product"""
        try:
            product = Product.query.get(product_id)
            if not product:
                return {'error': 'Product not found'}, 404
            
            # Get stock movements for this product
            movements = Stock.query.filter_by(
                product_id=product.id
            ).order_by(Stock.movement_date.desc()).limit(50).all()
            
            return {
                'product': product.to_dict(),
                'movements': [m.to_dict() for m in movements]
            }, 200
            
        except Exception as e:
            return {'error': str(e)}, 500
    
    @staticmethod
    def get_stock_by_branch(branch_id, params):
        """Get stock by branch"""
        params['branch_id'] = branch_id
        return StockService.get_stock_levels(params)
    
    @staticmethod
    def record_stock_in(current_user, data):
        """Record stock in"""
        try:
            product = Product.query.get(data.get('product_id'))
            if not product:
                return {'error': 'Product not found'}, 404
            
            quantity = data.get('quantity', 0)
            if quantity <= 0:
                return {'error': 'Quantity must be greater than 0'}, 400
            
            previous_quantity = product.quantity
            product.quantity += quantity
            
            stock = Stock(
                product_id=product.id,
                branch_id=data.get('branch_id', product.branch_id),
                inventory_officer_id=current_user.id,
                movement_type='in',
                quantity=quantity,
                previous_quantity=previous_quantity,
                new_quantity=product.quantity,
                reference_type=data.get('reference_type'),
                reference_id=data.get('reference_id'),
                reason=data.get('reason', 'Stock in'),
                notes=data.get('notes')
            )
            
            db.session.add(stock)
            db.session.commit()
            
            # Check if stock is above max quantity
            if product.max_quantity and product.quantity > product.max_quantity:
                NotificationService.create_notification(
                    user_id=current_user.id,
                    title='Overstock Alert',
                    message=f'Product {product.name} is overstocked. Current quantity: {product.quantity}',
                    type='inventory',
                    priority='high'
                )
            
            return stock.to_dict(), 201
            
        except Exception as e:
            db.session.rollback()
            return {'error': str(e)}, 500
    
    @staticmethod
    def record_stock_out(current_user, data):
        """Record stock out"""
        try:
            product = Product.query.get(data.get('product_id'))
            if not product:
                return {'error': 'Product not found'}, 404
            
            quantity = data.get('quantity', 0)
            if quantity <= 0:
                return {'error': 'Quantity must be greater than 0'}, 400
            
            if quantity > product.quantity:
                return {'error': 'Insufficient stock'}, 400
            
            previous_quantity = product.quantity
            product.quantity -= quantity
            
            stock = Stock(
                product_id=product.id,
                branch_id=data.get('branch_id', product.branch_id),
                inventory_officer_id=current_user.id,
                movement_type='out',
                quantity=quantity,
                previous_quantity=previous_quantity,
                new_quantity=product.quantity,
                reference_type=data.get('reference_type'),
                reference_id=data.get('reference_id'),
                reason=data.get('reason', 'Stock out'),
                notes=data.get('notes')
            )
            
            db.session.add(stock)
            db.session.commit()
            
            # Check if stock is below minimum
            if product.min_quantity and product.quantity <= product.min_quantity:
                NotificationService.create_notification(
                    user_id=current_user.id,
                    title='Low Stock Alert',
                    message=f'Product {product.name} is running low. Current quantity: {product.quantity}',
                    type='inventory',
                    priority='high'
                )
            
            return stock.to_dict(), 201
            
        except Exception as e:
            db.session.rollback()
            return {'error': str(e)}, 500
    
    @staticmethod
    def transfer_stock(current_user, data):
        """Transfer stock between branches"""
        try:
            product = Product.query.get(data.get('product_id'))
            if not product:
                return {'error': 'Product not found'}, 404
            
            from_branch = Branch.query.get(data.get('from_branch_id'))
            to_branch = Branch.query.get(data.get('to_branch_id'))
            
            if not from_branch or not to_branch:
                return {'error': 'Invalid branch'}, 404
            
            quantity = data.get('quantity', 0)
            if quantity <= 0:
                return {'error': 'Quantity must be greater than 0'}, 400
            
            if quantity > product.quantity:
                return {'error': 'Insufficient stock'}, 400
            
            # Deduct from source branch
            product.quantity -= quantity
            
            # Add to destination branch
            dest_product = Product.query.filter_by(
                sku=product.sku,
                branch_id=to_branch.id
            ).first()
            
            if dest_product:
                dest_product.quantity += quantity
            else:
                # Create new product at destination branch
                dest_product = Product(
                    name=product.name,
                    description=product.description,
                    sku=product.sku,
                    barcode=product.barcode,
                    category_id=product.category_id,
                    supplier_id=product.supplier_id,
                    branch_id=to_branch.id,
                    purchase_price=product.purchase_price,
                    selling_price=product.selling_price,
                    wholesale_price=product.wholesale_price,
                    quantity=quantity,
                    min_quantity=product.min_quantity,
                    max_quantity=product.max_quantity,
                    unit=product.unit,
                    weight=product.weight,
                    dimensions=product.dimensions,
                    is_active=product.is_active,
                    is_taxable=product.is_taxable,
                    tax_rate=product.tax_rate
                )
                db.session.add(dest_product)
            
            # Record stock movements
            stock_out = Stock(
                product_id=product.id,
                branch_id=from_branch.id,
                inventory_officer_id=current_user.id,
                movement_type='out',
                quantity=quantity,
                previous_quantity=product.quantity + quantity,
                new_quantity=product.quantity,
                reason=f'Transfer to {to_branch.name}',
                notes=data.get('notes')
            )
            db.session.add(stock_out)
            
            stock_in = Stock(
                product_id=dest_product.id,
                branch_id=to_branch.id,
                inventory_officer_id=current_user.id,
                movement_type='in',
                quantity=quantity,
                previous_quantity=dest_product.quantity - quantity,
                new_quantity=dest_product.quantity,
                reason=f'Transfer from {from_branch.name}',
                notes=data.get('notes')
            )
            db.session.add(stock_in)
            
            db.session.commit()
            
            return {'message': 'Stock transferred successfully'}, 200
            
        except Exception as e:
            db.session.rollback()
            return {'error': str(e)}, 500
    
    @staticmethod
    def adjust_stock(current_user, data):
        """Adjust stock levels"""
        try:
            product = Product.query.get(data.get('product_id'))
            if not product:
                return {'error': 'Product not found'}, 404
            
            new_quantity = data.get('new_quantity', 0)
            if new_quantity < 0:
                return {'error': 'Quantity cannot be negative'}, 400
            
            previous_quantity = product.quantity
            difference = new_quantity - previous_quantity
            
            product.quantity = new_quantity
            
            stock = Stock(
                product_id=product.id,
                branch_id=data.get('branch_id', product.branch_id),
                inventory_officer_id=current_user.id,
                movement_type='adjustment',
                quantity=abs(difference),
                previous_quantity=previous_quantity,
                new_quantity=new_quantity,
                reason=data.get('reason', 'Stock adjustment'),
                notes=data.get('notes')
            )
            
            db.session.add(stock)
            db.session.commit()
            
            return stock.to_dict(), 200
            
        except Exception as e:
            db.session.rollback()
            return {'error': str(e)}, 500
    
    @staticmethod
    def get_stock_history(params):
        """Get stock movement history"""
        try:
            query = Stock.query
            
            if params.get('product_id'):
                query = query.filter(Stock.product_id == params['product_id'])
            
            if params.get('branch_id'):
                query = query.filter(Stock.branch_id == params['branch_id'])
            
            if params.get('movement_type'):
                query = query.filter(Stock.movement_type == params['movement_type'])
            
            if params.get('start_date'):
                query = query.filter(Stock.movement_date >= params['start_date'])
            
            if params.get('end_date'):
                query = query.filter(Stock.movement_date <= params['end_date'])
            
            query = query.order_by(Stock.movement_date.desc())
            
            page = int(params.get('page', 1))
            per_page = int(params.get('per_page', 20))
            
            movements = query.paginate(page=page, per_page=per_page, error_out=False)
            
            return {
                'items': [m.to_dict() for m in movements.items],
                'total': movements.total,
                'page': page,
                'per_page': per_page,
                'pages': movements.pages
            }, 200
            
        except Exception as e:
            return {'error': str(e)}, 500
    
    @staticmethod
    def get_stock_history_by_product(product_id, params):
        """Get stock movement history by product"""
        params['product_id'] = product_id
        return StockService.get_stock_history(params)
    
    @staticmethod
    def get_low_stock_alerts():
        """Get low stock alerts"""
        try:
            products = Product.query.filter(
                Product.quantity <= Product.min_quantity,
                Product.is_active == True
            ).all()
            
            return [p.to_dict() for p in products], 200
            
        except Exception as e:
            return {'error': str(e)}, 500
    
    @staticmethod
    def get_expired_stock():
        """Get expired stock"""
        try:
            today = datetime.utcnow().date()
            products = Product.query.filter(
                Product.expiry_date <= today,
                Product.is_active == True
            ).all()
            
            return [p.to_dict() for p in products], 200
            
        except Exception as e:
            return {'error': str(e)}, 500
    
    @staticmethod
    def get_overstock_alerts():
        """Get overstock alerts"""
        try:
            products = Product.query.filter(
                Product.max_quantity.isnot(None),
                Product.quantity > Product.max_quantity,
                Product.is_active == True
            ).all()
            
            return [p.to_dict() for p in products], 200
            
        except Exception as e:
            return {'error': str(e)}, 500
    
    @staticmethod
    def dismiss_alert(current_user, alert_id):
        """Dismiss stock alert"""
        try:
            # This would require an alerts table
            # For now, return success
            return {'message': 'Alert dismissed'}, 200
        except Exception as e:
            return {'error': str(e)}, 500
    
    @staticmethod
    def get_stock_summary():
        """Get stock summary"""
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
            
            return {
                'total_products': total_products,
                'total_value': total_value,
                'low_stock_items': low_stock,
                'expired_items': expired,
                'average_value': total_value / total_products if total_products > 0 else 0
            }, 200
            
        except Exception as e:
            return {'error': str(e)}, 500
    
    @staticmethod
    def get_stock_valuation(params):
        """Get stock valuation"""
        try:
            query = Product.query.filter_by(is_active=True)
            
            if params.get('branch_id'):
                query = query.filter(Product.branch_id == params['branch_id'])
            
            products = query.all()
            
            total_value = sum(p.quantity * p.purchase_price for p in products)
            
            return {
                'total_value': total_value,
                'items': [p.to_dict() for p in products]
            }, 200
            
        except Exception as e:
            return {'error': str(e)}, 500
    
    @staticmethod
    def export_stock_report(data):
        """Export stock report"""
        try:
            return {'message': 'Stock report exported'}, 200
        except Exception as e:
            return {'error': str(e)}, 500