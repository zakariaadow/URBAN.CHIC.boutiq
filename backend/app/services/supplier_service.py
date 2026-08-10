from datetime import datetime
from flask import current_app
from app.extensions import db
from app.models.supplier import Supplier
from app.models.product import Product
from app.models.purchase import Purchase

class SupplierService:
    
    @staticmethod
    def get_suppliers(params):
        """Get all suppliers"""
        try:
            query = Supplier.query
            
            if params.get('is_active') is not None:
                query = query.filter(Supplier.is_active == params['is_active'])
            
            if params.get('is_preferred') is not None:
                query = query.filter(Supplier.is_preferred == params['is_preferred'])
            
            if params.get('search'):
                search = f"%{params['search']}%"
                query = query.filter(
                    db.or_(
                        Supplier.name.ilike(search),
                        Supplier.contact_person.ilike(search),
                        Supplier.email.ilike(search),
                        Supplier.phone.ilike(search)
                    )
                )
            
            query = query.order_by(Supplier.name.asc())
            
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
    def create_supplier(current_user, data):
        """Create a new supplier"""
        try:
            supplier = Supplier(
                name=data['name'],
                contact_person=data.get('contact_person'),
                email=data.get('email'),
                phone=data['phone'],
                alternative_phone=data.get('alternative_phone'),
                address=data.get('address'),
                city=data.get('city'),
                state=data.get('state'),
                country=data.get('country', 'Kenya'),
                postal_code=data.get('postal_code'),
                tax_id=data.get('tax_id'),
                registration_number=data.get('registration_number'),
                payment_terms=data.get('payment_terms'),
                credit_limit=data.get('credit_limit'),
                categories_supplied=data.get('categories_supplied', []),
                is_active=data.get('is_active', True),
                is_preferred=data.get('is_preferred', False),
                notes=data.get('notes')
            )
            
            db.session.add(supplier)
            db.session.commit()
            
            return supplier.to_dict(), 201
            
        except Exception as e:
            db.session.rollback()
            return {'error': str(e)}, 500
    
    @staticmethod
    def get_supplier(current_user, supplier_id):
        """Get supplier details"""
        try:
            supplier = Supplier.query.get(supplier_id)
            if not supplier:
                return {'error': 'Supplier not found'}, 404
            
            result = supplier.to_dict()
            
            # Get products from this supplier
            products = Product.query.filter_by(supplier_id=supplier.id).all()
            result['products'] = [p.to_dict() for p in products]
            
            # Get purchases from this supplier
            purchases = Purchase.query.filter_by(supplier_id=supplier.id).order_by(
                Purchase.purchase_date.desc()
            ).limit(10).all()
            result['recent_purchases'] = [p.to_dict() for p in purchases]
            
            return result, 200
            
        except Exception as e:
            return {'error': str(e)}, 500
    
    @staticmethod
    def update_supplier(current_user, supplier_id, data):
        """Update a supplier"""
        try:
            supplier = Supplier.query.get(supplier_id)
            if not supplier:
                return {'error': 'Supplier not found'}, 404
            
            updatable_fields = [
                'name', 'contact_person', 'email', 'phone', 'alternative_phone',
                'address', 'city', 'state', 'country', 'postal_code',
                'tax_id', 'registration_number', 'payment_terms', 'credit_limit',
                'categories_supplied', 'is_active', 'is_preferred', 'notes'
            ]
            
            for field in updatable_fields:
                if field in data:
                    setattr(supplier, field, data[field])
            
            db.session.commit()
            
            return supplier.to_dict(), 200
            
        except Exception as e:
            db.session.rollback()
            return {'error': str(e)}, 500
    
    @staticmethod
    def delete_supplier(current_user, supplier_id):
        """Delete a supplier"""
        try:
            supplier = Supplier.query.get(supplier_id)
            if not supplier:
                return {'error': 'Supplier not found'}, 404
            
            # Check if supplier has products
            products = Product.query.filter_by(supplier_id=supplier.id).first()
            if products:
                return {'error': 'Cannot delete supplier with associated products'}, 400
            
            db.session.delete(supplier)
            db.session.commit()
            
            return {'message': 'Supplier deleted successfully'}, 200
            
        except Exception as e:
            db.session.rollback()
            return {'error': str(e)}, 500
    
    @staticmethod
    def search_suppliers(params):
        """Search suppliers"""
        return SupplierService.get_suppliers(params)
    
    @staticmethod
    def get_supplier_products(supplier_id, params):
        """Get products from supplier"""
        try:
            products = Product.query.filter_by(
                supplier_id=supplier_id,
                is_active=True
            ).all()
            
            return [p.to_dict() for p in products], 200
            
        except Exception as e:
            return {'error': str(e)}, 500
    
    @staticmethod
    def toggle_supplier(current_user, supplier_id):
        """Toggle supplier status"""
        try:
            supplier = Supplier.query.get(supplier_id)
            if not supplier:
                return {'error': 'Supplier not found'}, 404
            
            supplier.is_active = not supplier.is_active
            db.session.commit()
            
            return supplier.to_dict(), 200
            
        except Exception as e:
            db.session.rollback()
            return {'error': str(e)}, 500
    
    @staticmethod
    def get_supplier_purchases(supplier_id, params):
        """Get purchases from supplier"""
        try:
            query = Purchase.query.filter_by(supplier_id=supplier_id)
            
            if params.get('start_date'):
                query = query.filter(Purchase.purchase_date >= params['start_date'])
            
            if params.get('end_date'):
                query = query.filter(Purchase.purchase_date <= params['end_date'])
            
            if params.get('payment_status'):
                query = query.filter(Purchase.payment_status == params['payment_status'])
            
            query = query.order_by(Purchase.purchase_date.desc())
            
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
    def get_supplier_analytics(params):
        """Get supplier analytics"""
        try:
            suppliers = Supplier.query.filter_by(is_active=True).all()
            
            total_suppliers = len(suppliers)
            preferred_suppliers = sum(1 for s in suppliers if s.is_preferred)
            
            total_purchases = Purchase.query.count()
            total_spent = db.session.query(db.func.sum(Purchase.final_total)).scalar() or 0
            
            return {
                'total_suppliers': total_suppliers,
                'preferred_suppliers': preferred_suppliers,
                'total_purchases': total_purchases,
                'total_spent': total_spent,
                'average_purchase': total_spent / total_purchases if total_purchases > 0 else 0
            }, 200
            
        except Exception as e:
            return {'error': str(e)}, 500
    
    @staticmethod
    def export_suppliers(data):
        """Export suppliers to file"""
        try:
            return {'message': 'Suppliers exported'}, 200
        except Exception as e:
            return {'error': str(e)}, 500