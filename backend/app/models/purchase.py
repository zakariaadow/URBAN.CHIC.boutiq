from app.extensions import db
from datetime import datetime

class Purchase(db.Model):
    __tablename__ = 'purchases'
    
    id = db.Column(db.Integer, primary_key=True)
    product_id = db.Column(db.Integer, db.ForeignKey('products.id'), nullable=False)
    supplier_id = db.Column(db.Integer, db.ForeignKey('suppliers.id'), nullable=False)
    inventory_officer_id = db.Column(db.Integer, db.ForeignKey('inventories.id'))
    purchase_order_number = db.Column(db.String(50), unique=True)
    invoice_number = db.Column(db.String(50))
    quantity = db.Column(db.Integer, nullable=False)
    unit_price = db.Column(db.Float, nullable=False)
    total_price = db.Column(db.Float, nullable=False)
    tax = db.Column(db.Float, default=0.0)
    discount = db.Column(db.Float, default=0.0)
    shipping_cost = db.Column(db.Float, default=0.0)
    final_total = db.Column(db.Float, nullable=False)
    purchase_date = db.Column(db.DateTime, default=datetime.utcnow)
    delivery_date = db.Column(db.DateTime)
    payment_status = db.Column(db.String(20), default='pending')
    notes = db.Column(db.Text)
    is_received = db.Column(db.Boolean, default=False)
    received_at = db.Column(db.DateTime)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships - Use simple relationships
    product = db.relationship('Product', foreign_keys=[product_id])
    supplier = db.relationship('Supplier', foreign_keys=[supplier_id])
    inventory_officer = db.relationship('Inventory', foreign_keys=[inventory_officer_id])
    
    def to_dict(self):
        return {
            'id': self.id,
            'product_id': self.product_id,
            'product_name': self.product.name if self.product else None,
            'supplier_id': self.supplier_id,
            'supplier_name': self.supplier.name if self.supplier else None,
            'purchase_order_number': self.purchase_order_number,
            'invoice_number': self.invoice_number,
            'quantity': self.quantity,
            'unit_price': float(self.unit_price) if self.unit_price else 0,
            'total_price': float(self.total_price) if self.total_price else 0,
            'tax': float(self.tax) if self.tax else 0,
            'discount': float(self.discount) if self.discount else 0,
            'shipping_cost': float(self.shipping_cost) if self.shipping_cost else 0,
            'final_total': float(self.final_total) if self.final_total else 0,
            'purchase_date': self.purchase_date.isoformat() if self.purchase_date else None,
            'delivery_date': self.delivery_date.isoformat() if self.delivery_date else None,
            'payment_status': self.payment_status,
            'notes': self.notes,
            'is_received': self.is_received,
            'received_at': self.received_at.isoformat() if self.received_at else None,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
