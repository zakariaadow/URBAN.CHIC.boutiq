from app.extensions import db
from datetime import datetime

class Branch(db.Model):
    __tablename__ = 'branches'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    code = db.Column(db.String(20), unique=True, nullable=False)
    address = db.Column(db.String(200))
    city = db.Column(db.String(50))
    state = db.Column(db.String(50))
    country = db.Column(db.String(50))
    postal_code = db.Column(db.String(20))
    phone = db.Column(db.String(20))
    email = db.Column(db.String(120))
    manager_name = db.Column(db.String(100))
    opening_time = db.Column(db.Time)
    closing_time = db.Column(db.Time)
    days_open = db.Column(db.JSON)
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships for models that reference branch via back_populates
    products = db.relationship('Product', back_populates='branch', lazy='dynamic', overlaps="branch")
    stock_movements = db.relationship('Stock', back_populates='branch', lazy='dynamic', overlaps="branch")
    services = db.relationship('Service', foreign_keys='Service.branch_id', lazy='dynamic', overlaps="branch")
    appointments = db.relationship('Appointment', foreign_keys='Appointment.branch_id', lazy='dynamic', overlaps="branch")
    payments = db.relationship('Payment', foreign_keys='Payment.branch_id', lazy='dynamic', overlaps="branch")
    stylists = db.relationship('Stylist', foreign_keys='Stylist.branch_id', lazy='dynamic', overlaps="branch")
    receptionists = db.relationship('Receptionist', foreign_keys='Receptionist.branch_id', lazy='dynamic', overlaps="branch")
    finances = db.relationship('Finance', foreign_keys='Finance.branch_id', lazy='dynamic', overlaps="branch")
    inventories = db.relationship('Inventory', foreign_keys='Inventory.branch_id', lazy='dynamic', overlaps="branch")
    managers = db.relationship('Manager', foreign_keys='Manager.branch_id', lazy='dynamic', overlaps="branch")
    expenses = db.relationship('Expense', foreign_keys='Expense.branch_id', lazy='dynamic', overlaps="branch")
    attendances = db.relationship('Attendance', foreign_keys='Attendance.branch_id', lazy='dynamic', overlaps="branch")
    leave_requests = db.relationship('LeaveRequest', foreign_keys='LeaveRequest.branch_id', lazy='dynamic', overlaps="branch")
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'code': self.code,
            'address': self.address,
            'city': self.city,
            'state': self.state,
            'country': self.country,
            'postal_code': self.postal_code,
            'phone': self.phone,
            'email': self.email,
            'manager_name': self.manager_name,
            'opening_time': str(self.opening_time) if self.opening_time else None,
            'closing_time': str(self.closing_time) if self.closing_time else None,
            'days_open': self.days_open,
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }