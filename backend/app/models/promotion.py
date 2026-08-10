from app.extensions import db
from datetime import datetime

class Promotion(db.Model):
    __tablename__ = 'promotions'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text)
    code = db.Column(db.String(50))
    discount_type = db.Column(db.String(20))
    discount_value = db.Column(db.Float, nullable=False)
    start_date = db.Column(db.DateTime, nullable=False)
    end_date = db.Column(db.DateTime, nullable=False)
    min_spend = db.Column(db.Float, default=0.0)
    max_discount = db.Column(db.Float)
    usage_limit = db.Column(db.Integer)
    usage_count = db.Column(db.Integer, default=0)
    per_user_limit = db.Column(db.Integer, default=1)
    applicable_to = db.Column(db.String(20), default='all')
    is_active = db.Column(db.Boolean, default=True)
    is_public = db.Column(db.Boolean, default=True)
    image = db.Column(db.String(200))
    terms = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships - remove these if they cause issues
    # services = db.relationship('Service', secondary='service_promotions', back_populates='promotions', lazy=True)
    # products = db.relationship('Product', secondary='product_promotions', back_populates='promotions', lazy=True)
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'code': self.code,
            'discount_type': self.discount_type,
            'discount_value': self.discount_value,
            'start_date': self.start_date.isoformat() if self.start_date else None,
            'end_date': self.end_date.isoformat() if self.end_date else None,
            'min_spend': self.min_spend,
            'max_discount': self.max_discount,
            'usage_limit': self.usage_limit,
            'usage_count': self.usage_count,
            'per_user_limit': self.per_user_limit,
            'applicable_to': self.applicable_to,
            'is_active': self.is_active,
            'is_public': self.is_public,
            'image': self.image,
            'terms': self.terms,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
    
    def __repr__(self):
        return f'<Promotion {self.name} - {self.discount_value}%>'