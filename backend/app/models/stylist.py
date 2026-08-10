from app.extensions import db
from datetime import datetime

class Stylist(db.Model):
    __tablename__ = 'stylists'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), unique=True)
    branch_id = db.Column(db.Integer, db.ForeignKey('branches.id'))
    employee_id = db.Column(db.String(50), unique=True)
    specialization = db.Column(db.String(200))
    experience_years = db.Column(db.Integer, default=0)
    skills = db.Column(db.JSON)
    certification = db.Column(db.String(200))
    hire_date = db.Column(db.Date)
    salary = db.Column(db.Float)
    commission_rate = db.Column(db.Float, default=0.0)
    rating = db.Column(db.Float, default=0.0)
    is_available = db.Column(db.Boolean, default=True)
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships - Use foreign_keys for all relationships
    user = db.relationship('User', foreign_keys=[user_id])
    branch = db.relationship('Branch', foreign_keys=[branch_id])
    attendances = db.relationship('Attendance', foreign_keys='Attendance.stylist_id', lazy='dynamic')
    leave_requests = db.relationship('LeaveRequest', foreign_keys='LeaveRequest.stylist_id', lazy='dynamic')
    appointments = db.relationship('Appointment', foreign_keys='Appointment.stylist_id', lazy='dynamic')
    commissions = db.relationship('Commission', foreign_keys='Commission.stylist_id', lazy='dynamic')
    reviews = db.relationship('Review', foreign_keys='Review.stylist_id', lazy='dynamic')
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'branch_id': self.branch_id,
            'employee_id': self.employee_id,
            'specialization': self.specialization,
            'experience_years': self.experience_years,
            'skills': self.skills,
            'certification': self.certification,
            'hire_date': self.hire_date.isoformat() if self.hire_date else None,
            'salary': float(self.salary) if self.salary else 0,
            'commission_rate': float(self.commission_rate) if self.commission_rate else 0,
            'rating': float(self.rating) if self.rating else 0,
            'is_available': self.is_available,
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
