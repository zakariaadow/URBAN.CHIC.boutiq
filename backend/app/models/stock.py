from app.extensions import db
from datetime import datetime

class Stock(db.Model):
    __tablename__ = 'stock_movements'
    
    id = db.Column(db.Integer, primary_key=True)
    product_id = db.Column(db.Integer, db.ForeignKey('products.id'), nullable=False)
    branch_id = db.Column(db.Integer, db.ForeignKey('branches.id'), nullable=False)
    inventory_officer_id = db.Column(db.Integer, db.ForeignKey('inventories.id'))
    movement_type = db.Column(db.String(20), nullable=False)
    quantity = db.Column(db.Integer, nullable=False)
    previous_quantity = db.Column(db.Integer)
    new_quantity = db.Column(db.Integer)
    reference_type = db.Column(db.String(50))
    reference_id = db.Column(db.Integer)
    reason = db.Column(db.String(200))
    notes = db.Column(db.Text)
    movement_date = db.Column(db.DateTime, default=datetime.utcnow)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships - Use simple relationships
    product = db.relationship('Product', foreign_keys=[product_id])
    branch = db.relationship('Branch', foreign_keys=[branch_id])
    inventory_officer = db.relationship('Inventory', foreign_keys=[inventory_officer_id])
    
    def to_dict(self):
        return {
            'id': self.id,
            'product_id': self.product_id,
            'product_name': self.product.name if self.product else None,
            'branch_id': self.branch_id,
            'branch_name': self.branch.name if self.branch else None,
            'movement_type': self.movement_type,
            'quantity': self.quantity,
            'previous_quantity': self.previous_quantity,
            'new_quantity': self.new_quantity,
            'reference_type': self.reference_type,
            'reference_id': self.reference_id,
            'reason': self.reason,
            'notes': self.notes,
            'movement_date': self.movement_date.isoformat() if self.movement_date else None,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
