from app.extensions import db
from datetime import datetime

class Loyalty(db.Model):
    __tablename__ = 'loyalty_points'
    
    id = db.Column(db.Integer, primary_key=True)
    customer_id = db.Column(db.Integer, db.ForeignKey('customers.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    points = db.Column(db.Integer, default=0)
    tier = db.Column(db.String(20), default='bronze')
    total_points_earned = db.Column(db.Integer, default=0)
    total_points_redeemed = db.Column(db.Integer, default=0)
    points_earned = db.Column(db.Integer, default=0)
    points_redeemed = db.Column(db.Integer, default=0)
    transaction_type = db.Column(db.String(20))
    transaction_date = db.Column(db.DateTime, default=datetime.utcnow)
    expiry_date = db.Column(db.Date)
    reference_id = db.Column(db.Integer)
    reference_type = db.Column(db.String(50))
    notes = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships - NO backrefs
    customer = db.relationship('Customer', foreign_keys=[customer_id])
    user = db.relationship('User', foreign_keys=[user_id])
    
    def to_dict(self):
        return {
            'id': self.id,
            'customer_id': self.customer_id,
            'user_id': self.user_id,
            'points': self.points or 0,
            'tier': self.tier or 'bronze',
            'total_points_earned': self.total_points_earned or 0,
            'total_points_redeemed': self.total_points_redeemed or 0,
            'points_earned': self.points_earned or 0,
            'points_redeemed': self.points_redeemed or 0,
            'transaction_type': self.transaction_type,
            'transaction_date': self.transaction_date.isoformat() if self.transaction_date else None,
            'expiry_date': self.expiry_date.isoformat() if self.expiry_date else None,
            'reference_id': self.reference_id,
            'reference_type': self.reference_type,
            'notes': self.notes,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
