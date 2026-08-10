from app.extensions import db
from datetime import datetime

class Supplier(db.Model):
    __tablename__ = 'suppliers'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    contact_person = db.Column(db.String(100))
    email = db.Column(db.String(120))
    phone = db.Column(db.String(20), nullable=False)
    alternative_phone = db.Column(db.String(20))
    address = db.Column(db.String(200))
    city = db.Column(db.String(50))
    state = db.Column(db.String(50))
    country = db.Column(db.String(50))
    postal_code = db.Column(db.String(20))
    tax_id = db.Column(db.String(50))
    registration_number = db.Column(db.String(50))
    payment_terms = db.Column(db.String(100))
    credit_limit = db.Column(db.Float)
    balance = db.Column(db.Float, default=0.0)
    categories_supplied = db.Column(db.JSON)
    is_active = db.Column(db.Boolean, default=True)
    is_preferred = db.Column(db.Boolean, default=False)
    notes = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships - Use simple relationships
    products = db.relationship('Product', foreign_keys='Product.supplier_id', lazy='dynamic')
    purchases = db.relationship('Purchase', foreign_keys='Purchase.supplier_id', lazy='dynamic')
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'contact_person': self.contact_person,
            'email': self.email,
            'phone': self.phone,
            'alternative_phone': self.alternative_phone,
            'address': self.address,
            'city': self.city,
            'state': self.state,
            'country': self.country,
            'postal_code': self.postal_code,
            'tax_id': self.tax_id,
            'registration_number': self.registration_number,
            'payment_terms': self.payment_terms,
            'credit_limit': float(self.credit_limit) if self.credit_limit else 0,
            'balance': float(self.balance) if self.balance else 0,
            'categories_supplied': self.categories_supplied,
            'is_active': self.is_active,
            'is_preferred': self.is_preferred,
            'notes': self.notes,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
