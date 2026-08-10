from app.extensions import db
from datetime import datetime

class Payroll(db.Model):
    __tablename__ = 'payrolls'
    
    id = db.Column(db.Integer, primary_key=True)
    finance_id = db.Column(db.Integer, db.ForeignKey('finances.id'))
    employee_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    employee_type = db.Column(db.String(20))
    pay_period_start = db.Column(db.Date, nullable=False)
    pay_period_end = db.Column(db.Date, nullable=False)
    base_salary = db.Column(db.Float, nullable=False)
    overtime_hours = db.Column(db.Float, default=0.0)
    overtime_rate = db.Column(db.Float, default=0.0)
    overtime_pay = db.Column(db.Float, default=0.0)
    bonus = db.Column(db.Float, default=0.0)
    commission = db.Column(db.Float, default=0.0)
    allowance = db.Column(db.Float, default=0.0)
    deductions = db.Column(db.Float, default=0.0)
    tax = db.Column(db.Float, default=0.0)
    insurance = db.Column(db.Float, default=0.0)
    pension = db.Column(db.Float, default=0.0)
    net_pay = db.Column(db.Float, nullable=False)
    payment_date = db.Column(db.Date)
    payment_status = db.Column(db.String(20), default='pending')
    notes = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships - Use relationships from database
    finance = db.relationship('Finance')
    employee = db.relationship('User', foreign_keys=[employee_id])
    
    def to_dict(self):
        return {
            'id': self.id,
            'finance_id': self.finance_id,
            'employee_id': self.employee_id,
            'employee_type': self.employee_type,
            'pay_period_start': self.pay_period_start.isoformat() if self.pay_period_start else None,
            'pay_period_end': self.pay_period_end.isoformat() if self.pay_period_end else None,
            'base_salary': float(self.base_salary) if self.base_salary else 0,
            'overtime_hours': float(self.overtime_hours) if self.overtime_hours else 0,
            'overtime_pay': float(self.overtime_pay) if self.overtime_pay else 0,
            'bonus': float(self.bonus) if self.bonus else 0,
            'commission': float(self.commission) if self.commission else 0,
            'allowance': float(self.allowance) if self.allowance else 0,
            'deductions': float(self.deductions) if self.deductions else 0,
            'tax': float(self.tax) if self.tax else 0,
            'insurance': float(self.insurance) if self.insurance else 0,
            'pension': float(self.pension) if self.pension else 0,
            'net_pay': float(self.net_pay) if self.net_pay else 0,
            'payment_date': self.payment_date.isoformat() if self.payment_date else None,
            'payment_status': self.payment_status,
            'notes': self.notes,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
