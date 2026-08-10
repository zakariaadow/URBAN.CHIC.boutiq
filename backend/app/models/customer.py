from app.extensions import db
from datetime import datetime

class Customer(db.Model):
    __tablename__ = 'customers'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), unique=True)
    date_of_birth = db.Column(db.Date)
    gender = db.Column(db.String(20))
    address = db.Column(db.String(200))
    city = db.Column(db.String(50))
    state = db.Column(db.String(50))
    country = db.Column(db.String(50))
    postal_code = db.Column(db.String(20))
    preferences = db.Column(db.JSON)
    total_spent = db.Column(db.Float, default=0.0)
    total_visits = db.Column(db.Integer, default=0)
    is_walk_in = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    user = db.relationship('User', foreign_keys=[user_id])
    appointments = db.relationship('Appointment', foreign_keys='Appointment.customer_id', lazy='dynamic')
    payments = db.relationship('Payment', foreign_keys='Payment.customer_id', lazy='dynamic')
    receipts = db.relationship('Receipt', foreign_keys='Receipt.customer_id', lazy='dynamic')
    loyalty_points = db.relationship('Loyalty', foreign_keys='Loyalty.customer_id', lazy='dynamic')
    reviews = db.relationship('Review', foreign_keys='Review.customer_id', lazy='dynamic')
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'date_of_birth': self.date_of_birth.isoformat() if self.date_of_birth else None,
            'gender': self.gender,
            'address': self.address,
            'city': self.city,
            'state': self.state,
            'country': self.country,
            'postal_code': self.postal_code,
            'preferences': self.preferences,
            'total_spent': float(self.total_spent) if self.total_spent else 0,
            'total_visits': self.total_visits or 0,
            'is_walk_in': self.is_walk_in or False,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
