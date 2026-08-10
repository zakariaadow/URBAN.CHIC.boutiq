from app.extensions import db
from datetime import datetime

class Receptionist(db.Model):
    __tablename__ = 'receptionists'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), unique=True)
    branch_id = db.Column(db.Integer, db.ForeignKey('branches.id'))
    employee_id = db.Column(db.String(50), unique=True)
    hire_date = db.Column(db.Date)
    salary = db.Column(db.Float)
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships - Use simple relationships
    user = db.relationship('User', foreign_keys=[user_id])
    branch = db.relationship('Branch', foreign_keys=[branch_id])
    appointments = db.relationship('Appointment', foreign_keys='Appointment.receptionist_id', lazy='dynamic')
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'branch_id': self.branch_id,
            'employee_id': self.employee_id,
            'hire_date': self.hire_date.isoformat() if self.hire_date else None,
            'salary': float(self.salary) if self.salary else 0,
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
