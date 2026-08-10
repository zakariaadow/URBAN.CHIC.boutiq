from app.extensions import db
from datetime import datetime

class Appointment(db.Model):
    __tablename__ = 'appointments'
    
    id = db.Column(db.Integer, primary_key=True)
    customer_id = db.Column(db.Integer, db.ForeignKey('customers.id'), nullable=False)
    service_id = db.Column(db.Integer, db.ForeignKey('services.id'), nullable=False)
    stylist_id = db.Column(db.Integer, db.ForeignKey('stylists.id'))
    branch_id = db.Column(db.Integer, db.ForeignKey('branches.id'), nullable=False)
    receptionist_id = db.Column(db.Integer, db.ForeignKey('receptionists.id'))
    appointment_date = db.Column(db.Date, nullable=False)
    appointment_time = db.Column(db.Time, nullable=False)
    end_time = db.Column(db.Time)
    status = db.Column(db.String(20), default='pending')
    notes = db.Column(db.Text)
    customer_notes = db.Column(db.Text)
    stylist_notes = db.Column(db.Text)
    is_walk_in = db.Column(db.Boolean, default=False)
    is_rescheduled = db.Column(db.Boolean, default=False)
    rescheduled_from = db.Column(db.Integer)
    check_in_time = db.Column(db.DateTime)
    start_time = db.Column(db.DateTime)
    completion_time = db.Column(db.DateTime)
    total_amount = db.Column(db.Float, nullable=False, default=0.0)
    discount_amount = db.Column(db.Float, default=0.0)
    final_amount = db.Column(db.Float, nullable=False, default=0.0)
    before_photos = db.Column(db.JSON)
    after_photos = db.Column(db.JSON)
    duration = db.Column(db.Integer, default=60)
    price = db.Column(db.Float)
    paid = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships - NO backrefs to avoid conflicts
    customer = db.relationship('Customer', foreign_keys=[customer_id])
    service = db.relationship('Service', foreign_keys=[service_id])
    stylist = db.relationship('Stylist', foreign_keys=[stylist_id])
    branch = db.relationship('Branch', foreign_keys=[branch_id])
    receptionist = db.relationship('Receptionist', foreign_keys=[receptionist_id])
    payments = db.relationship('Payment', foreign_keys='Payment.appointment_id', lazy='dynamic')
    receipts = db.relationship('Receipt', foreign_keys='Receipt.appointment_id', lazy='dynamic')
    reviews = db.relationship('Review', foreign_keys='Review.appointment_id', lazy='dynamic')
    notifications = db.relationship('Notification', foreign_keys='Notification.appointment_id', lazy='dynamic')
    
    def to_dict(self):
        return {
            'id': self.id,
            'customer_id': self.customer_id,
            'service_id': self.service_id,
            'stylist_id': self.stylist_id,
            'branch_id': self.branch_id,
            'receptionist_id': self.receptionist_id,
            'appointment_date': self.appointment_date.isoformat() if self.appointment_date else None,
            'appointment_time': str(self.appointment_time) if self.appointment_time else None,
            'end_time': str(self.end_time) if self.end_time else None,
            'status': self.status,
            'notes': self.notes,
            'customer_notes': self.customer_notes,
            'stylist_notes': self.stylist_notes,
            'is_walk_in': self.is_walk_in,
            'is_rescheduled': self.is_rescheduled,
            'check_in_time': self.check_in_time.isoformat() if self.check_in_time else None,
            'start_time': self.start_time.isoformat() if self.start_time else None,
            'completion_time': self.completion_time.isoformat() if self.completion_time else None,
            'total_amount': float(self.total_amount) if self.total_amount else 0,
            'discount_amount': float(self.discount_amount) if self.discount_amount else 0,
            'final_amount': float(self.final_amount) if self.final_amount else 0,
            'duration': self.duration,
            'price': float(self.price) if self.price else 0,
            'paid': self.paid,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
