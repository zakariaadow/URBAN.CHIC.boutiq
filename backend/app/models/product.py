from app.extensions import db
from datetime import datetime

class Product(db.Model):
    __tablename__ = 'products'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text)
    sku = db.Column(db.String(50), unique=True, nullable=False)
    barcode = db.Column(db.String(50), unique=True)
    category_id = db.Column(db.Integer, db.ForeignKey('categories.id'))
    supplier_id = db.Column(db.Integer, db.ForeignKey('suppliers.id'))
    branch_id = db.Column(db.Integer, db.ForeignKey('branches.id'))
    inventory_officer_id = db.Column(db.Integer, db.ForeignKey('inventories.id'))
    purchase_price = db.Column(db.Float, nullable=False)
    selling_price = db.Column(db.Float, nullable=False)
    wholesale_price = db.Column(db.Float)
    quantity = db.Column(db.Integer, default=0)
    min_quantity = db.Column(db.Integer, default=0)
    max_quantity = db.Column(db.Integer)
    unit = db.Column(db.String(20), default='piece')
    weight = db.Column(db.Float)
    dimensions = db.Column(db.String(50))
    images = db.Column(db.JSON)
    is_active = db.Column(db.Boolean, default=True)
    is_featured = db.Column(db.Boolean, default=False)
    is_taxable = db.Column(db.Boolean, default=True)
    tax_rate = db.Column(db.Float, default=0.0)
    expiry_date = db.Column(db.Date)
    batch_number = db.Column(db.String(50))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships - Use simple relationships to avoid conflicts
    category = db.relationship('Category')
    supplier = db.relationship('Supplier')
    branch = db.relationship('Branch')
    inventory_officer = db.relationship('Inventory')
    purchases = db.relationship('Purchase', foreign_keys='Purchase.product_id', lazy='dynamic')
    stock_movements = db.relationship('Stock', foreign_keys='Stock.product_id', lazy='dynamic')
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'sku': self.sku,
            'barcode': self.barcode,
            'category_id': self.category_id,
            'category_name': self.category.name if self.category else None,
            'supplier_id': self.supplier_id,
            'supplier_name': self.supplier.name if self.supplier else None,
            'branch_id': self.branch_id,
            'branch_name': self.branch.name if self.branch else None,
            'purchase_price': float(self.purchase_price) if self.purchase_price else 0,
            'selling_price': float(self.selling_price) if self.selling_price else 0,
            'wholesale_price': float(self.wholesale_price) if self.wholesale_price else 0,
            'quantity': self.quantity or 0,
            'min_quantity': self.min_quantity or 0,
            'max_quantity': self.max_quantity,
            'unit': self.unit,
            'weight': float(self.weight) if self.weight else 0,
            'dimensions': self.dimensions,
            'images': self.images,
            'is_active': self.is_active,
            'is_featured': self.is_featured,
            'is_taxable': self.is_taxable,
            'tax_rate': float(self.tax_rate) if self.tax_rate else 0,
            'expiry_date': self.expiry_date.isoformat() if self.expiry_date else None,
            'batch_number': self.batch_number,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
