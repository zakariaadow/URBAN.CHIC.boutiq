from app.extensions import db
from datetime import datetime

class Review(db.Model):
    __tablename__ = 'reviews'
    
    id = db.Column(db.Integer, primary_key=True)
    customer_id = db.Column(db.Integer, db.ForeignKey('customers.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    appointment_id = db.Column(db.Integer, db.ForeignKey('appointments.id'))
    service_id = db.Column(db.Integer, db.ForeignKey('services.id'))
    stylist_id = db.Column(db.Integer, db.ForeignKey('stylists.id'))
    rating = db.Column(db.Integer, nullable=False)
    title = db.Column(db.String(100))
    comment = db.Column(db.Text)
    service_rating = db.Column(db.Integer)
    stylist_rating = db.Column(db.Integer)
    value_rating = db.Column(db.Integer)
    ambiance_rating = db.Column(db.Integer)
    is_verified_purchase = db.Column(db.Boolean, default=False)
    is_approved = db.Column(db.Boolean, default=False)
    is_featured = db.Column(db.Boolean, default=False)
    images = db.Column(db.JSON)
    reply = db.Column(db.Text)
    replied_at = db.Column(db.DateTime)
    replied_by = db.Column(db.Integer, db.ForeignKey('users.id'))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships - NO backrefs
    customer = db.relationship('Customer', foreign_keys=[customer_id])
    user = db.relationship('User', foreign_keys=[user_id])
    appointment = db.relationship('Appointment', foreign_keys=[appointment_id])
    service = db.relationship('Service', foreign_keys=[service_id])
    stylist = db.relationship('Stylist', foreign_keys=[stylist_id])
    replier = db.relationship('User', foreign_keys=[replied_by])
    
    def to_dict(self):
        return {
            'id': self.id,
            'customer_id': self.customer_id,
            'user_id': self.user_id,
            'appointment_id': self.appointment_id,
            'service_id': self.service_id,
            'stylist_id': self.stylist_id,
            'rating': self.rating,
            'title': self.title,
            'comment': self.comment,
            'service_rating': self.service_rating,
            'stylist_rating': self.stylist_rating,
            'value_rating': self.value_rating,
            'ambiance_rating': self.ambiance_rating,
            'is_verified_purchase': self.is_verified_purchase,
            'is_approved': self.is_approved,
            'is_featured': self.is_featured,
            'images': self.images,
            'reply': self.reply,
            'replied_at': self.replied_at.isoformat() if self.replied_at else None,
            'replied_by': self.replied_by,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
