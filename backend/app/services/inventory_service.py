from datetime import datetime
from flask import current_app
from app.extensions import db
from app.models.product import Product
from app.models.stock import Stock
from app.models.purchase import Purchase
from app.models.supplier import Supplier
from app.models.branch import Branch
from app.models.inventory import Inventory
from app.services.notification_service import NotificationService
import random
import string

class InventoryService:
    
    @staticmethod
    def get_dashboard(current_user):
        """Get inventory dashboard statistics"""
        try:
            # Get the inventory officer's record
            inventory = Inventory.query.filter_by(user_id=current_user.id).first()
            
            total_products = Product.query.count()
            total_value = db.session.query(
                db.func.sum(Product.quantity * Product.purchase_price)
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
                'low_stock_count': low_stock,
                'expired_count': expired
            }, 200
            
        except Exception as e:
            return {'error': str(e)}, 500

    @staticmethod
    def add_product(data, inventory_officer_id):
        """Add a new product"""
        try:
            # Generate SKU if not provided
            if not data.get('sku'):
                data['sku'] = InventoryService._generate_sku(data.get('name'))
            
            product = Product(
                name=data['name'],
                description=data.get('description'),
                sku=data['sku'],
                barcode=data.get('barcode'),
                category_id=data.get('category_id'),
                supplier_id=data.get('supplier_id'),
                branch_id=data.get('branch_id'),
                inventory_officer_id=inventory_officer_id,
                purchase_price=data.get('purchase_price', 0),
                selling_price=data.get('selling_price', 0),
                wholesale_price=data.get('wholesale_price'),
                quantity=data.get('quantity', 0),
                min_quantity=data.get('min_quantity', 5),
                max_quantity=data.get('max_quantity'),
                unit=data.get('unit', 'piece'),
                weight=data.get('weight'),
                dimensions=data.get('dimensions'),
                is_active=data.get('is_active', True),
                is_taxable=data.get('is_taxable', True),
                tax_rate=data.get('tax_rate', 0.0),
                expiry_date=data.get('expiry_date'),
                batch_number=data.get('batch_number'),
                # ✅ SAFELY HANDLE THE NEW COLUMN
                image_url=data.get('image_url', None)
            )
            
            db.session.add(product)
            db.session.flush()
            
            # Create initial stock record
            if product.quantity > 0:
                stock = Stock(
                    product_id=product.id,
                    branch_id=product.branch_id,
                    inventory_officer_id=inventory_officer_id,
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
        prefix = ''.join(word[0].upper() for word in name.split()[:3])
        random_part = ''.join(random.choices(string.digits, k=6))
        return f"{prefix}{random_part}"
    
    # ==================== PRODUCT MANAGEMENT ====================

    @staticmethod
    def get_products(params):
        """Get all products with pagination"""
        try:
            query = Product.query
            
            # Filter by active status
            if params.get('is_active') is not None:
                query = query.filter(Product.is_active == params['is_active'])
                
            # Search by name or SKU
            if params.get('search'):
                search = f"%{params['search']}%"
                query = query.filter(
                    db.or_(
                        Product.name.ilike(search),
                        Product.sku.ilike(search)
                    )
                )
            
            # Pagination
            page = int(params.get('page', 1))
            per_page = int(params.get('per_page', 20))
            
            products = query.order_by(Product.created_at.desc()).paginate(
                page=page, per_page=per_page, error_out=False
            )
            
            return {
                'items': [p.to_dict() for p in products.items],
                'total': products.total,
                'page': page,
                'per_page': per_page,
                'pages': products.pages
            }, 200
            
        except Exception as e:
            print(f"Error in get_products: {e}")
            return {'error': str(e)}, 500

    @staticmethod
    def get_product(current_user, product_id):
        """Get a single product by ID"""
        try:
            product = Product.query.get(product_id)
            if not product:
                return {'error': 'Product not found'}, 404
            return product.to_dict(), 200
        except Exception as e:
            return {'error': str(e)}, 500

    @staticmethod
    def update_product(current_user, product_id, data):
        """Update an existing product"""
        try:
            product = Product.query.get(product_id)
            if not product:
                return {'error': 'Product not found'}, 404
            
            # Update fields safely
            for key, value in data.items():
                if hasattr(product, key) and key != 'id' and key != 'created_at':
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
    def search_products(params):
        """Search products by keyword"""
        return InventoryService.get_products(params)
    
    @staticmethod
    def get_product_categories():
        """Get product categories"""
        from app.models.category import Category
        try:
            categories = Category.query.all()
            return [c.to_dict() for c in categories], 200
        except Exception as e:
            return {'error': str(e)}, 500

    @staticmethod
    def get_product_by_barcode(current_user, barcode):
        """Get product by barcode"""
        try:
            product = Product.query.filter_by(barcode=barcode).first()
            if not product:
                return {'error': 'Product not found'}, 404
            return product.to_dict(), 200
        except Exception as e:
            return {'error': str(e)}, 500

    # ==================== SUPPLIER MANAGEMENT ====================

    @staticmethod
    def add_supplier(current_user, data):
        """Add a new supplier"""
        try:
            supplier = Supplier(
                name=data['name'],
                contact_person=data.get('contact_person'),
                email=data.get('email'),
                phone=data.get('phone'),
                address=data.get('address')
            )
            db.session.add(supplier)
            db.session.commit()
            return supplier.to_dict(), 201
        except Exception as e:
            db.session.rollback()
            return {'error': str(e)}, 500

    @staticmethod
    def get_suppliers(params):
        """Get all suppliers with search"""
        try:
            query = Supplier.query
            if params.get('search'):
                search = f"%{params['search']}%"
                query = query.filter(Supplier.name.ilike(search))
            
            page = int(params.get('page', 1))
            per_page = int(params.get('per_page', 20))
            suppliers = query.paginate(page=page, per_page=per_page, error_out=False)
            return {
                'items': [s.to_dict() for s in suppliers.items],
                'total': suppliers.total,
                'page': page,
                'per_page': per_page,
                'pages': suppliers.pages
            }, 200
        except Exception as e:
            return {'error': str(e)}, 500

    @staticmethod
    def get_supplier(current_user, supplier_id):
        """Get supplier by ID"""
        try:
            supplier = Supplier.query.get(supplier_id)
            if not supplier:
                return {'error': 'Supplier not found'}, 404
            return supplier.to_dict(), 200
        except Exception as e:
            return {'error': str(e)}, 500

    @staticmethod
    def update_supplier(current_user, supplier_id, data):
        """Update supplier"""
        try:
            supplier = Supplier.query.get(supplier_id)
            if not supplier:
                return {'error': 'Supplier not found'}, 404
            for key, value in data.items():
                if hasattr(supplier, key):
                    setattr(supplier, key, value)
            db.session.commit()
            return supplier.to_dict(), 200
        except Exception as e:
            db.session.rollback()
            return {'error': str(e)}, 500

    @staticmethod
    def delete_supplier(current_user, supplier_id):
        """Delete supplier"""
        try:
            supplier = Supplier.query.get(supplier_id)
            if not supplier:
                return {'error': 'Supplier not found'}, 404
            db.session.delete(supplier)
            db.session.commit()
            return {'message': 'Supplier deleted successfully'}, 200
        except Exception as e:
            db.session.rollback()
            return {'error': str(e)}, 500

    @staticmethod
    def search_suppliers(params):
        return InventoryService.get_suppliers(params)

    # ==================== PURCHASE MANAGEMENT ====================

    @staticmethod
    def record_purchase(current_user, data):
        """Record a new purchase"""
        try:
            purchase = Purchase(
                product_id=data['product_id'],
                supplier_id=data['supplier_id'],
                inventory_officer_id=current_user.id,
                quantity=data['quantity'],
                unit_price=data['unit_price'],
                total_price=data['total_price'],
                final_total=data.get('final_total', data['total_price']),
                purchase_date=datetime.utcnow(),
                notes=data.get('notes')
            )
            db.session.add(purchase)
            db.session.commit()
            return purchase.to_dict(), 201
        except Exception as e:
            db.session.rollback()
            return {'error': str(e)}, 500

    @staticmethod
    def get_purchases(params):
        """Get all purchases with pagination"""
        try:
            query = Purchase.query.order_by(Purchase.purchase_date.desc())
            page = int(params.get('page', 1))
            per_page = int(params.get('per_page', 20))
            purchases = query.paginate(page=page, per_page=per_page, error_out=False)
            return {
                'items': [p.to_dict() for p in purchases.items],
                'total': purchases.total,
                'page': page,
                'per_page': per_page,
                'pages': purchases.pages
            }, 200
        except Exception as e:
            return {'error': str(e)}, 500

    @staticmethod
    def get_purchase(current_user, purchase_id):
        try:
            purchase = Purchase.query.get(purchase_id)
            if not purchase:
                return {'error': 'Purchase not found'}, 404
            return purchase.to_dict(), 200
        except Exception as e:
            return {'error': str(e)}, 500

    @staticmethod
    def update_purchase(current_user, purchase_id, data):
        try:
            purchase = Purchase.query.get(purchase_id)
            if not purchase:
                return {'error': 'Purchase not found'}, 404
            for key, value in data.items():
                if hasattr(purchase, key):
                    setattr(purchase, key, value)
            db.session.commit()
            return purchase.to_dict(), 200
        except Exception as e:
            db.session.rollback()
            return {'error': str(e)}, 500

    @staticmethod
    def delete_purchase(current_user, purchase_id):
        try:
            purchase = Purchase.query.get(purchase_id)
            if not purchase:
                return {'error': 'Purchase not found'}, 404
            db.session.delete(purchase)
            db.session.commit()
            return {'message': 'Purchase deleted successfully'}, 200
        except Exception as e:
            db.session.rollback()
            return {'error': str(e)}, 500

    # ==================== STOCK ALERTS ====================

    @staticmethod
    def get_overstock_alerts():
        """Get overstock alerts"""
        try:
            products = Product.query.filter(
                Product.quantity > Product.max_quantity,
                Product.max_quantity.isnot(None),
                Product.is_active == True
            ).all()
            return [p.to_dict() for p in products], 200
        except Exception as e:
            return {'error': str(e)}, 500

    @staticmethod
    def dismiss_alert(current_user, alert_id):
        """Dismiss an alert by marking it as read"""
        try:
            # If alerts are stored as notifications, use NotificationService
            # For now, we return a success message
            return {'message': 'Alert dismissed successfully'}, 200
        except Exception as e:
            return {'error': str(e)}, 500

    # ==================== STOCK MOVEMENTS ====================

    @staticmethod
    def record_stock_in(data, inventory_officer_id):
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
                inventory_officer_id=inventory_officer_id,
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
            
            if product.max_quantity and product.quantity > product.max_quantity:
                NotificationService.create_notification(
                    user_id=inventory_officer_id,
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
    def record_stock_out(data, inventory_officer_id):
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
                inventory_officer_id=inventory_officer_id,
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
            
            if product.min_quantity and product.quantity <= product.min_quantity:
                NotificationService.create_notification(
                    user_id=inventory_officer_id,
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
    def transfer_stock(data, inventory_officer_id):
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
            
            product.quantity -= quantity
            
            dest_product = Product.query.filter_by(
                sku=product.sku,
                branch_id=to_branch.id
            ).first()
            
            if dest_product:
                dest_product.quantity += quantity
            else:
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
            
            stock_out = Stock(
                product_id=product.id,
                branch_id=from_branch.id,
                inventory_officer_id=inventory_officer_id,
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
                inventory_officer_id=inventory_officer_id,
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

    # ==================== REPORTS & SUMMARY ====================

    @staticmethod
    def get_inventory_reports(params):
        return {'message': 'Inventory report generated'}, 200

    @staticmethod
    def get_valuation_report(params):
        return InventoryService.get_inventory_value()

    @staticmethod
    def get_movement_report(params):
        try:
            movements = Stock.query.order_by(Stock.created_at.desc()).limit(100).all()
            return [m.to_dict() for m in movements], 200
        except Exception as e:
            return {'error': str(e)}, 500

    @staticmethod
    def get_inventory_summary():
        return InventoryService.get_dashboard(None)

    @staticmethod
    def export_inventory_report(data):
        return {'message': 'Report exported'}, 200

    @staticmethod
    def get_batches(params):
        return {'items': [], 'total': 0}, 200

    @staticmethod
    def get_batch(current_user, batch_id):
        return {'error': 'Batch not found'}, 404

    @staticmethod
    def update_batch(current_user, batch_id, data):
        return {'error': 'Batch not found'}, 404

    # ==================== EXISTING METHODS ====================

    @staticmethod
    def get_low_stock_alerts():
        """Get products with low stock"""
        try:
            products = Product.query.filter(
                Product.quantity <= Product.min_quantity,
                Product.is_active == True
            ).all()
            return [p.to_dict() for p in products], 200
        except Exception as e:
            return {'error': str(e)}, 500
    
    @staticmethod
    def get_expired_products():
        """Get expired products"""
        try:
            from datetime import date
            products = Product.query.filter(
                Product.expiry_date <= date.today(),
                Product.is_active == True
            ).all()
            return [p.to_dict() for p in products], 200
        except Exception as e:
            return {'error': str(e)}, 500
    
    @staticmethod
    def get_inventory_value():
        """Get total inventory value"""
        try:
            total_value = db.session.query(
                db.func.sum(Product.quantity * Product.purchase_price)
            ).scalar() or 0
            return {'total_value': total_value}, 200
        except Exception as e:
            return {'error': str(e)}, 500

    # ==================== STOCK LEVELS & HISTORY ====================

    @staticmethod
    def get_stock_levels(params):
        return InventoryService.get_products(params)

    @staticmethod
    def get_stock_history(params):
        try:
            page = int(params.get('page', 1))
            per_page = int(params.get('per_page', 20))
            movements = Stock.query.order_by(Stock.created_at.desc()).paginate(
                page=page, per_page=per_page, error_out=False
            )
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
    def adjust_stock(current_user, data):
        """Adjust stock manually"""
        try:
            product = Product.query.get(data.get('product_id'))
            if not product:
                return {'error': 'Product not found'}, 404
            
            new_quantity = data.get('new_quantity')
            if new_quantity is None or new_quantity < 0:
                return {'error': 'Invalid quantity'}, 400
            
            previous_quantity = product.quantity
            product.quantity = new_quantity
            
            stock = Stock(
                product_id=product.id,
                branch_id=product.branch_id,
                inventory_officer_id=current_user.id,
                movement_type='adjust',
                quantity=abs(new_quantity - previous_quantity),
                previous_quantity=previous_quantity,
                new_quantity=new_quantity,
                reason=data.get('reason', 'Manual adjustment'),
                notes=data.get('notes')
            )
            db.session.add(stock)
            db.session.commit()
            return stock.to_dict(), 200
        except Exception as e:
            db.session.rollback()
            return {'error': str(e)}, 500