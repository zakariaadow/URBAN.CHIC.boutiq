
from app.extensions import db
from datetime import datetime

class AppointmentService(db.Model):
    __tablename__ = 'appointment_services'
    
    id = db.Column(db.Integer, primary_key=True)
    appointment_id = db.Column(db.Integer, db.ForeignKey('appointments.id', ondelete='CASCADE'), nullable=False)
    service_id = db.Column(db.Integer, db.ForeignKey('services.id', ondelete='CASCADE'), nullable=False)
    price = db.Column(db.Float, nullable=False, default=0.0)
    duration = db.Column(db.Integer, default=30)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    appointment = db.relationship('Appointment', foreign_keys=[appointment_id], backref='appointment_services')
    service = db.relationship('Service', foreign_keys=[service_id])
    
    def to_dict(self):
        return {
            'id': self.id,
            'appointment_id': self.appointment_id,
            'service_id': self.service_id,
            'service_name': self.service.name if self.service else 'N/A',
            'price': float(self.price),
            'duration': self.duration,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
