from flask import Blueprint, request, jsonify
from app.controllers.receptionist_controller import ReceptionistController
from app.utils.auth import login_required, role_required

receptionist_bp = Blueprint('receptionist', __name__, url_prefix='/api/receptionist')

# Dashboard
@receptionist_bp.route('/dashboard', methods=['GET'])
@login_required
@role_required('receptionist')
def dashboard(current_user):
    """Receptionist dashboard data"""
    return ReceptionistController.get_dashboard(current_user)

# Walk-in Customer
@receptionist_bp.route('/walk-in', methods=['POST'])
@login_required
@role_required('receptionist')
def register_walk_in(current_user):
    """Register a walk-in customer"""
    return ReceptionistController.register_walk_in(current_user, request.json)

@receptionist_bp.route('/walk-in/<int:customer_id>', methods=['GET'])
@login_required
@role_required('receptionist')
def get_walk_in_customer(current_user, customer_id):
    """Get walk-in customer details"""
    return ReceptionistController.get_walk_in_customer(current_user, customer_id)

# Appointment Management
@receptionist_bp.route('/appointments/requests', methods=['GET'])
@login_required
@role_required('receptionist')
def get_appointment_requests(current_user):
    """Get pending appointment requests"""
    return ReceptionistController.get_appointment_requests(current_user, request.args)

@receptionist_bp.route('/appointments/<int:appointment_id>/approve', methods=['POST'])
@login_required
@role_required('receptionist')
def approve_booking(current_user, appointment_id):
    """Approve a booking"""
    return ReceptionistController.approve_booking(current_user, appointment_id)

@receptionist_bp.route('/appointments/<int:appointment_id>/reschedule', methods=['PUT'])
@login_required
@role_required('receptionist')
def reschedule_booking(current_user, appointment_id):
    """Reschedule a booking"""
    return ReceptionistController.reschedule_booking(current_user, appointment_id, request.json)

@receptionist_bp.route('/appointments/<int:appointment_id>/cancel', methods=['POST'])
@login_required
@role_required('receptionist')
def cancel_booking(current_user, appointment_id):
    """Cancel a booking"""
    return ReceptionistController.cancel_booking(current_user, appointment_id)

@receptionist_bp.route('/appointments/<int:appointment_id>/check-in', methods=['POST'])
@login_required
@role_required('receptionist')
def check_in_customer(current_user, appointment_id):
    """Check in a customer"""
    return ReceptionistController.check_in_customer(current_user, appointment_id)

@receptionist_bp.route('/appointments/<int:appointment_id>/assign-stylist', methods=['POST'])
@login_required
@role_required('receptionist')
def assign_stylist(current_user, appointment_id):
    """Assign a stylist to appointment"""
    return ReceptionistController.assign_stylist(current_user, appointment_id, request.json)

@receptionist_bp.route('/appointments/<int:appointment_id>/reminder', methods=['POST'])
@login_required
@role_required('receptionist')
def send_reminder(current_user, appointment_id):
    """Send appointment reminder"""
    return ReceptionistController.send_reminder(current_user, appointment_id)

@receptionist_bp.route('/appointments/today', methods=['GET'])
@login_required
@role_required('receptionist')
def get_today_appointments(current_user):
    """Get today's appointments"""
    return ReceptionistController.get_today_appointments(current_user)

@receptionist_bp.route('/appointments/all', methods=['GET'])
@login_required
@role_required('receptionist')
def get_all_appointments(current_user):
    """Get all appointments"""
    return ReceptionistController.get_all_appointments(current_user, request.args)

@receptionist_bp.route('/appointments/<int:appointment_id>', methods=['GET'])
@login_required
@role_required('receptionist')
def get_appointment(current_user, appointment_id):
    """Get appointment details"""
    return ReceptionistController.get_appointment(current_user, appointment_id)

# Customer Management
@receptionist_bp.route('/customers', methods=['GET'])
@login_required
@role_required('receptionist')
def get_customers(current_user):
    """Get all customers"""
    return ReceptionistController.get_customers(current_user, request.args)

@receptionist_bp.route('/customers/search', methods=['GET'])
@login_required
@role_required('receptionist')
def search_customers(current_user):
    """Search customers"""
    return ReceptionistController.search_customers(current_user, request.args)

@receptionist_bp.route('/customers/<int:customer_id>', methods=['GET'])
@login_required
@role_required('receptionist')
def get_customer(current_user, customer_id):
    """Get customer details"""
    return ReceptionistController.get_customer(current_user, customer_id)

@receptionist_bp.route('/customers/<int:customer_id>/history', methods=['GET'])
@login_required
@role_required('receptionist')
def get_customer_history(current_user, customer_id):
    """Get customer history"""
    return ReceptionistController.get_customer_history(current_user, customer_id)

# Payment Processing
@receptionist_bp.route('/payments/receive', methods=['POST'])
@login_required
@role_required('receptionist')
def receive_payment(current_user):
    """Receive payment from customer"""
    return ReceptionistController.receive_payment(current_user, request.json)

@receptionist_bp.route('/payments/<int:payment_id>/receipt', methods=['GET'])
@login_required
@role_required('receptionist')
def print_receipt(current_user, payment_id):
    """Print receipt"""
    return ReceptionistController.print_receipt(current_user, payment_id)

@receptionist_bp.route('/payments/pending', methods=['GET'])
@login_required
@role_required('receptionist')
def get_pending_payments(current_user):
    """Get pending payments"""
    return ReceptionistController.get_pending_payments(current_user)

# Stylist Management
@receptionist_bp.route('/stylists', methods=['GET'])
@login_required
@role_required('receptionist')
def get_stylists(current_user):
    """Get all stylists"""
    return ReceptionistController.get_stylists(current_user, request.args)

@receptionist_bp.route('/stylists/available', methods=['GET'])
@login_required
@role_required('receptionist')
def get_available_stylists(current_user):
    """Get available stylists"""
    return ReceptionistController.get_available_stylists(current_user, request.args)

@receptionist_bp.route('/stylists/<int:stylist_id>/schedule', methods=['GET'])
@login_required
@role_required('receptionist')
def get_stylist_schedule(current_user, stylist_id):
    """Get stylist schedule"""
    return ReceptionistController.get_stylist_schedule(current_user, stylist_id)

# Services
@receptionist_bp.route('/services', methods=['GET'])
@login_required
@role_required('receptionist')
def get_services(current_user):
    """Get all services"""
    return ReceptionistController.get_services(current_user, request.args)

@receptionist_bp.route('/services/<int:service_id>', methods=['GET'])
@login_required
@role_required('receptionist')
def get_service(current_user, service_id):
    """Get service details"""
    return ReceptionistController.get_service(current_user, service_id)

# Branches
@receptionist_bp.route('/branches', methods=['GET'])
@login_required
@role_required('receptionist')
def get_branches(current_user):
    """Get all branches"""
    return ReceptionistController.get_branches(current_user)

# Reports
@receptionist_bp.route('/reports/daily', methods=['GET'])
@login_required
@role_required('receptionist')
def get_daily_report(current_user):
    """Get daily report"""
    return ReceptionistController.get_daily_report(current_user, request.args)

@receptionist_bp.route('/reports/appointments', methods=['GET'])
@login_required
@role_required('receptionist')
def get_appointment_report(current_user):
    """Get appointment report"""
    return ReceptionistController.get_appointment_report(current_user, request.args)
@receptionist_bp.route('/appointments', methods=['GET'])
@login_required
@role_required('receptionist')
def get_appointments(current_user):
    """Get all appointments"""
    return ReceptionistController.get_all_appointments(current_user, request.args)

@receptionist_bp.route('/payments', methods=['GET'])
@login_required
@role_required('receptionist')
def get_payments(current_user):
    """Get all payments"""
    return ReceptionistController.get_payments(current_user, request.args)

@receptionist_bp.route('/notifications', methods=['GET'])
@login_required
@role_required('receptionist')
def get_notifications(current_user):
    """Get notifications"""
    return ReceptionistController.get_notifications(current_user, request.args)

@receptionist_bp.route('/reports', methods=['GET'])
@login_required
@role_required('receptionist')
def get_reports(current_user):
    """Get all reports"""
    return ReceptionistController.get_reports(current_user, request.args)

@receptionist_bp.route('/reports/<int:report_id>', methods=['GET'])
@login_required
@role_required('receptionist')
def get_report(current_user, report_id):
    """Get report by ID"""
    return ReceptionistController.get_report(current_user, report_id)

@receptionist_bp.route('/reports/export', methods=['POST'])
@login_required
@role_required('receptionist')
def export_report(current_user):
    """Export a report"""
    return ReceptionistController.export_report(current_user, request.json)

@receptionist_bp.route('/appointments/<int:appointment_id>/status', methods=['PUT'])
@login_required
@role_required('receptionist')
def update_appointment_status(current_user, appointment_id):
    """Update appointment status"""
    return ReceptionistController.update_appointment_status(current_user, appointment_id, request.json)

@receptionist_bp.route('/appointments/<int:appointment_id>', methods=['DELETE'])
@login_required
@role_required('receptionist')
def delete_appointment(current_user, appointment_id):
    """Delete an appointment"""
    return ReceptionistController.delete_appointment(current_user, appointment_id)

@receptionist_bp.route('/appointments/<int:appointment_id>', methods=['PUT'])
@login_required
@role_required('receptionist')
def update_appointment(current_user, appointment_id):
    """Update an appointment"""
    return ReceptionistController.update_appointment(current_user, appointment_id, request.json)

@receptionist_bp.route('/customers/<int:customer_id>', methods=['GET'])
@login_required
@role_required('receptionist')
def get_customer_appointments(current_user, customer_id):
    """Get customer appointments"""
    return ReceptionistController.get_customer_appointments(current_user, customer_id, request.args)

@receptionist_bp.route('/customers/<int:customer_id>/history', methods=['GET'])
@login_required
@role_required('receptionist')
def add_customer_note(current_user, customer_id):
    """Add customer note"""
    return ReceptionistController.add_customer_note(current_user, customer_id, request.json)
