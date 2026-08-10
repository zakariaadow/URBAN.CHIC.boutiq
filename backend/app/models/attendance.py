from app.extensions import db
from datetime import datetime

class Attendance(db.Model):
    __tablename__ = 'attendances'
    
    id = db.Column(db.Integer, primary_key=True)
    stylist_id = db.Column(db.Integer, db.ForeignKey('stylists.id'), nullable=False)
    branch_id = db.Column(db.Integer, db.ForeignKey('branches.id'))
    date = db.Column(db.Date, nullable=False)
    check_in_time = db.Column(db.DateTime)
    check_out_time = db.Column(db.DateTime)
    status = db.Column(db.String(20), default='present')
    late_minutes = db.Column(db.Integer, default=0)
    early_leave_minutes = db.Column(db.Integer, default=0)
    overtime_minutes = db.Column(db.Integer, default=0)
    notes = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships - Use simple relationships with foreign_keys
    stylist = db.relationship('Stylist', foreign_keys=[stylist_id])
    branch = db.relationship('Branch', foreign_keys=[branch_id])
    
    def to_dict(self):
        return {
            'id': self.id,
            'stylist_id': self.stylist_id,
            'branch_id': self.branch_id,
            'date': self.date.isoformat() if self.date else None,
            'check_in_time': self.check_in_time.isoformat() if self.check_in_time else None,
            'check_out_time': self.check_out_time.isoformat() if self.check_out_time else None,
            'status': self.status,
            'late_minutes': self.late_minutes,
            'early_leave_minutes': self.early_leave_minutes,
            'overtime_minutes': self.overtime_minutes,
            'notes': self.notes,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
