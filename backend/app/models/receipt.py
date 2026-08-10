from app.extensions import db
from datetime import datetime

class Receipt(db.Model):
    __tablename__ = 'receipts'
    
    id = db.Column(db.Integer, primary_key=True)
    appointment_id = db.Column(db.Integer, db.ForeignKey('appointments.id'), nullable=False)
    payment_id = db.Column(db.Integer, db.ForeignKey('payments.id'), nullable=False)
    customer_id = db.Column(db.Integer, db.ForeignKey('customers.id'), nullable=False)
    receipt_number = db.Column(db.String(50), unique=True, nullable=False)
    invoice_number = db.Column(db.String(50))
    receipt_date = db.Column(db.DateTime, default=datetime.utcnow)
    subtotal = db.Column(db.Float, nullable=False)
    tax = db.Column(db.Float, default=0.0)
    discount = db.Column(db.Float, default=0.0)
    total = db.Column(db.Float, nullable=False)
    payment_method = db.Column(db.String(50))
    transaction_id = db.Column(db.String(100))
    transaction_code = db.Column(db.String(100))
    items = db.Column(db.JSON)
    service_items = db.Column(db.JSON)
    customer_details = db.Column(db.JSON)
    business_details = db.Column(db.JSON)
    customer_name = db.Column(db.String(100))
    customer_phone = db.Column(db.String(20))
    customer_email = db.Column(db.String(100))
    customer_id_number = db.Column(db.String(50))
    branch_name = db.Column(db.String(100))
    branch_address = db.Column(db.String(200))
    branch_phone = db.Column(db.String(20))
    branch_email = db.Column(db.String(100))
    branch_website = db.Column(db.String(100))
    stylist_name = db.Column(db.String(100))
    receptionist_name = db.Column(db.String(100))
    finance_officer = db.Column(db.String(100))
    amount_paid = db.Column(db.Float)
    tax_rate = db.Column(db.Float, default=0.16)
    points_earned = db.Column(db.Integer, default=0)
    points_balance = db.Column(db.Integer, default=0)
    pdf_path = db.Column(db.String(200))
    is_printed = db.Column(db.Boolean, default=False)
    is_emailed = db.Column(db.Boolean, default=False)
    status = db.Column(db.String(20), default='generated')
    sent_at = db.Column(db.DateTime)
    sent_via = db.Column(db.String(20))
    printed_at = db.Column(db.DateTime)
    downloaded_at = db.Column(db.DateTime)
    signature_customer = db.Column(db.String(255))
    signature_receptionist = db.Column(db.String(255))
    signature_authorized = db.Column(db.String(255))
    notes = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # ==================== NEW IMAGE/LOGO FIELDS ====================
    # Logo/Image fields for receipt branding
    logo_path = db.Column(db.String(500))  # Path to logo image
    logo_url = db.Column(db.String(500))   # URL to logo image
    header_image = db.Column(db.String(500))  # Header image
    footer_image = db.Column(db.String(500))  # Footer image
    signature_image = db.Column(db.String(500))  # Signature image
    
    # Additional branding fields
    company_logo = db.Column(db.String(500))  # Company logo
    receipt_background = db.Column(db.String(500))  # Background image
    watermark_image = db.Column(db.String(500))  # Watermark image
    
    # Image metadata
    image_style = db.Column(db.String(50), default='default')  # Style of images
    image_position = db.Column(db.String(50), default='top-right')  # Position of logo
    
    # =========================================================
    # Relationships
    appointment = db.relationship('Appointment', foreign_keys=[appointment_id])
    payment = db.relationship('Payment', foreign_keys=[payment_id])
    customer = db.relationship('Customer', foreign_keys=[customer_id])

    # =========================================================
    # Computed property for is_downloaded
    @property
    def is_downloaded(self):
        return self.downloaded_at is not None
    
    def to_dict(self):
        return {
            'id': self.id,
            'appointment_id': self.appointment_id,
            'payment_id': self.payment_id,
            'customer_id': self.customer_id,
            'receipt_number': self.receipt_number,
            'invoice_number': self.invoice_number,
            'receipt_date': self.receipt_date.isoformat() if self.receipt_date else None,
            'subtotal': float(self.subtotal) if self.subtotal else 0,
            'tax': float(self.tax) if self.tax else 0,
            'discount': float(self.discount) if self.discount else 0,
            'total': float(self.total) if self.total else 0,
            'payment_method': self.payment_method,
            'transaction_id': self.transaction_id,
            'transaction_code': self.transaction_code,
            'customer_name': self.customer_name,
            'customer_phone': self.customer_phone,
            'customer_email': self.customer_email,
            'amount_paid': float(self.amount_paid) if self.amount_paid else 0,
            'points_earned': self.points_earned,
            'points_balance': self.points_balance,
            'status': self.status,
            'is_printed': self.is_printed,
            'is_emailed': self.is_emailed,
            'is_downloaded': self.is_downloaded,
            'downloaded_at': self.downloaded_at.isoformat() if self.downloaded_at else None,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            # ==================== NEW IMAGE FIELDS ====================
            'logo_path': self.logo_path,
            'logo_url': self.logo_url,
            'header_image': self.header_image,
            'footer_image': self.footer_image,
            'signature_image': self.signature_image,
            'company_logo': self.company_logo,
            'receipt_background': self.receipt_background,
            'watermark_image': self.watermark_image,
            'image_style': self.image_style,
            'image_position': self.image_position,
        }