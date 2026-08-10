from app.extensions import db
from datetime import datetime

class Report(db.Model):
    __tablename__ = 'reports'
    
    id = db.Column(db.Integer, primary_key=True)
    branch_id = db.Column(db.Integer, db.ForeignKey('branches.id'))
    generated_by = db.Column(db.Integer, db.ForeignKey('users.id'))
    
    report_type = db.Column(db.String(50), nullable=False)
    report_name = db.Column(db.String(100), nullable=False)
    start_date = db.Column(db.Date, nullable=False)
    end_date = db.Column(db.Date, nullable=False)
    parameters = db.Column(db.JSON)
    data = db.Column(db.JSON)
    summary = db.Column(db.JSON)
    file_path = db.Column(db.String(200))
    file_format = db.Column(db.String(20))
    is_exported = db.Column(db.Boolean, default=False)
    exported_at = db.Column(db.DateTime)
    notes = db.Column(db.Text)
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    branch = db.relationship('Branch', foreign_keys=[branch_id])
    generator = db.relationship('User', foreign_keys=[generated_by])
    
    def to_dict(self):
        return {
            'id': self.id,
            'branch_id': self.branch_id,
            'branch_name': self.branch.name if self.branch else None,
            'generated_by': self.generated_by,
            'generator_name': self.generator.full_name if self.generator else None,
            'report_type': self.report_type,
            'report_name': self.report_name,
            'start_date': self.start_date.isoformat() if self.start_date else None,
            'end_date': self.end_date.isoformat() if self.end_date else None,
            'parameters': self.parameters or {},
            'data': self.data or {},
            'summary': self.summary or {},
            'file_path': self.file_path,
            'file_format': self.file_format,
            'is_exported': self.is_exported,
            'exported_at': self.exported_at.isoformat() if self.exported_at else None,
            'notes': self.notes,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
    
    def __repr__(self):
        return f'<Report {self.id} - {self.report_name}>'