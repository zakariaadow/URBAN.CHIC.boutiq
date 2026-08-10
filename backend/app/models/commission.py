from app.extensions import db
from datetime import datetime

class Commission(db.Model):
    __tablename__ = 'commissions'
    
    id = db.Column(db.Integer, primary_key=True)
    stylist_id = db.Column(db.Integer, db.ForeignKey('stylists.id'), nullable=False)
    appointment_id = db.Column(db.Integer, db.ForeignKey('appointments.id'))
    finance_id = db.Column(db.Integer, db.ForeignKey('finances.id'))
    service_amount = db.Column(db.Float, nullable=False)
    commission_rate = db.Column(db.Float, nullable=False)
    commission_amount = db.Column(db.Float, nullable=False)
    period = db.Column(db.String(20))
    period_start = db.Column(db.Date)
    period_end = db.Column(db.Date)
    is_paid = db.Column(db.Boolean, default=False)
    paid_at = db.Column(db.DateTime)
    notes = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships - Use simple relationships
    stylist = db.relationship('Stylist', foreign_keys=[stylist_id])
    appointment = db.relationship('Appointment', foreign_keys=[appointment_id])
    finance = db.relationship('Finance', foreign_keys=[finance_id])
    
    def to_dict(self):
        return {
            'id': self.id,
            'stylist_id': self.stylist_id,
            'appointment_id': self.appointment_id,
            'finance_id': self.finance_id,
            'service_amount': float(self.service_amount) if self.service_amount else 0,
            'commission_rate': float(self.commission_rate) if self.commission_rate else 0,
            'commission_amount': float(self.commission_amount) if self.commission_amount else 0,
            'period': self.period,
            'period_start': self.period_start.isoformat() if self.period_start else None,
            'period_end': self.period_end.isoformat() if self.period_end else None,
            'is_paid': self.is_paid,
            'paid_at': self.paid_at.isoformat() if self.paid_at else None,
            'notes': self.notes,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
