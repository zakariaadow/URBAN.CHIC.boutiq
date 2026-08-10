from app.extensions import db
from datetime import datetime

class Service(db.Model):
    __tablename__ = 'services'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text)
    price = db.Column(db.Float, nullable=False)
    duration_minutes = db.Column(db.Integer, nullable=False)
    category_id = db.Column(db.Integer, db.ForeignKey('categories.id'))
    branch_id = db.Column(db.Integer, db.ForeignKey('branches.id'))
    image = db.Column(db.String(200))
    is_active = db.Column(db.Boolean, default=True)
    is_popular = db.Column(db.Boolean, default=False)
    discount_percentage = db.Column(db.Float, default=0.0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships - NO backrefs
    category = db.relationship('Category', foreign_keys=[category_id])
    branch = db.relationship('Branch', foreign_keys=[branch_id])
    appointments = db.relationship('Appointment', foreign_keys='Appointment.service_id', lazy='dynamic')
    reviews = db.relationship('Review', foreign_keys='Review.service_id', lazy='dynamic')
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'price': float(self.price) if self.price else 0,
            'duration_minutes': self.duration_minutes,
            'category_id': self.category_id,
            'category_name': self.category.name if self.category else None,
            'branch_id': self.branch_id,
            'branch_name': self.branch.name if self.branch else None,
            'image': self.image,
            'is_active': self.is_active,
            'is_popular': self.is_popular,
            'discount_percentage': float(self.discount_percentage) if self.discount_percentage else 0,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
