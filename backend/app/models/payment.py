from app.extensions import db
from datetime import datetime

class Payment(db.Model):
    __tablename__ = 'payments'
    
    id = db.Column(db.Integer, primary_key=True)
    appointment_id = db.Column(db.Integer, db.ForeignKey('appointments.id'), nullable=False)
    customer_id = db.Column(db.Integer, db.ForeignKey('customers.id'), nullable=False)
    amount = db.Column(db.Float, nullable=False)
    payment_method = db.Column(db.String(50), nullable=False)
    payment_status = db.Column(db.String(20), default='pending')
    transaction_id = db.Column(db.String(100))
    reference_number = db.Column(db.String(50), unique=True)
    receipt_number = db.Column(db.String(50))
    branch_id = db.Column(db.Integer, db.ForeignKey('branches.id'))
    payment_date = db.Column(db.DateTime, default=datetime.utcnow)
    verified_at = db.Column(db.DateTime)
    verified_by = db.Column(db.Integer, db.ForeignKey('finances.id'))
    notes = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships - NO backrefs
    appointment = db.relationship('Appointment', foreign_keys=[appointment_id])
    customer = db.relationship('Customer', foreign_keys=[customer_id])
    branch = db.relationship('Branch', foreign_keys=[branch_id])
    verifier = db.relationship('Finance', foreign_keys=[verified_by])
    receipt = db.relationship('Receipt', foreign_keys='Receipt.payment_id', uselist=False)
    
    def to_dict(self):
        return {
            'id': self.id,
            'appointment_id': self.appointment_id,
            'customer_id': self.customer_id,
            'amount': float(self.amount) if self.amount else 0,
            'payment_method': self.payment_method,
            'payment_status': self.payment_status,
            'transaction_id': self.transaction_id,
            'reference_number': self.reference_number,
            'receipt_number': self.receipt_number,
            'branch_id': self.branch_id,
            'payment_date': self.payment_date.isoformat() if self.payment_date else None,
            'verified_at': self.verified_at.isoformat() if self.verified_at else None,
            'verified_by': self.verified_by,
            'notes': self.notes,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
