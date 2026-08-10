from flask import Blueprint, request, jsonify
from app.controllers.manager_controller import ManagerController
from app.utils.auth import token_required, role_required

manager_bp = Blueprint('manager', __name__, url_prefix='/api/manager')

# Dashboard
@manager_bp.route('/dashboard', methods=['GET'])
@token_required
@role_required('manager')
def dashboard(current_user):
    """Manager dashboard data"""
    result, status = ManagerController.get_dashboard(current_user)
    if status == 200:
        return jsonify({'status': 'success', 'data': result}), 200
    return jsonify({'status': 'error', 'message': result.get('error', 'Unknown error')}), status

# Appointments
@manager_bp.route('/appointments', methods=['GET'])
@token_required
@role_required('manager')
def get_all_appointments(current_user):
    """Get all appointments"""
    result, status = ManagerController.get_all_appointments(current_user, request.args)
    if status == 200:
        return jsonify({'status': 'success', 'data': result}), 200
    return jsonify({'status': 'error', 'message': result.get('error', 'Unknown error')}), status

@manager_bp.route('/appointments/daily', methods=['GET'])
@token_required
@role_required('manager')
def get_daily_appointments(current_user):
    """Get daily appointments"""
    result, status = ManagerController.get_daily_appointments(current_user, request.args)
    if status == 200:
        return jsonify({'status': 'success', 'data': result}), 200
    return jsonify({'status': 'error', 'message': result.get('error', 'Unknown error')}), status

@manager_bp.route('/appointments/<int:appointment_id>', methods=['GET'])
@token_required
@role_required('manager')
def get_appointment(current_user, appointment_id):
    """Get appointment details"""
    result, status = ManagerController.get_appointment_by_id(current_user, appointment_id)
    if status == 200:
        return jsonify({'status': 'success', 'data': result}), 200
    return jsonify({'status': 'error', 'message': result.get('error', 'Unknown error')}), status

# Staff Management
@manager_bp.route('/staff', methods=['GET'])
@token_required
@role_required('manager')
def get_staff(current_user):
    """Get all staff"""
    result, status = ManagerController.get_staff(current_user)
    if status == 200:
        return jsonify({'status': 'success', 'data': result}), 200
    return jsonify({'status': 'error', 'message': result.get('error', 'Unknown error')}), status

@manager_bp.route('/staff/schedules', methods=['GET'])
@token_required
@role_required('manager')
def get_staff_schedules(current_user):
    """Get staff schedules"""
    result, status = ManagerController.get_staff_schedules(current_user, request.args)
    if status == 200:
        return jsonify({'status': 'success', 'data': result}), 200
    return jsonify({'status': 'error', 'message': result.get('error', 'Unknown error')}), status

@manager_bp.route('/staff/performance', methods=['GET'])
@token_required
@role_required('manager')
def get_staff_performance(current_user):
    """Get staff performance"""
    result, status = ManagerController.get_staff_performance(current_user, request.args)
    if status == 200:
        return jsonify({'status': 'success', 'data': result}), 200
    return jsonify({'status': 'error', 'message': result.get('error', 'Unknown error')}), status

@manager_bp.route('/staff/attendance', methods=['GET'])
@token_required
@role_required('manager')
def get_staff_attendance(current_user):
    """Get staff attendance"""
    result, status = ManagerController.get_staff_attendance(current_user, request.args)
    if status == 200:
        return jsonify({'status': 'success', 'data': result}), 200
    return jsonify({'status': 'error', 'message': result.get('error', 'Unknown error')}), status

# Customers
@manager_bp.route('/customers', methods=['GET'])
@token_required
@role_required('manager')
def get_all_customers(current_user):
    """Get all customers"""
    result, status = ManagerController.get_all_customers(current_user, request.args)
    if status == 200:
        return jsonify({'status': 'success', 'data': result}), 200
    return jsonify({'status': 'error', 'message': result.get('error', 'Unknown error')}), status

@manager_bp.route('/customers/<int:customer_id>', methods=['GET'])
@token_required
@role_required('manager')
def get_customer_details(current_user, customer_id):
    """Get customer details"""
    result, status = ManagerController.get_customer_details(current_user, customer_id)
    if status == 200:
        return jsonify({'status': 'success', 'data': result}), 200
    return jsonify({'status': 'error', 'message': result.get('error', 'Unknown error')}), status

# Branches
@manager_bp.route('/branches', methods=['GET'])
@token_required
@role_required('manager')
def get_branches(current_user):
    """Get all branches"""
    result, status = ManagerController.get_branches(current_user)
    if status == 200:
        return jsonify({'status': 'success', 'data': result}), 200
    return jsonify({'status': 'error', 'message': result.get('error', 'Unknown error')}), status

# Notifications
@manager_bp.route('/notifications', methods=['GET'])
@token_required
@role_required('manager')
def get_notifications(current_user):
    """Get notifications"""
    result, status = ManagerController.get_notifications(current_user, request.args)
    if status == 200:
        return jsonify({'status': 'success', 'data': result}), 200
    return jsonify({'status': 'error', 'message': result.get('error', 'Unknown error')}), status

@manager_bp.route('/notifications/<int:notification_id>/read', methods=['POST'])
@token_required
@role_required('manager')
def mark_notification_read(current_user, notification_id):
    """Mark notification as read"""
    result, status = ManagerController.mark_notification_read(current_user, notification_id)
    if status == 200:
        return jsonify({'status': 'success', 'message': result.get('message')}), 200
    return jsonify({'status': 'error', 'message': result.get('error', 'Unknown error')}), status

@manager_bp.route('/notifications/read-all', methods=['POST'])
@token_required
@role_required('manager')
def mark_all_notifications_read(current_user):
    """Mark all notifications as read"""
    result, status = ManagerController.mark_all_notifications_read(current_user)
    if status == 200:
        return jsonify({'status': 'success', 'message': result.get('message')}), 200
    return jsonify({'status': 'error', 'message': result.get('error', 'Unknown error')}), status

# Reports
@manager_bp.route('/reports', methods=['GET'])
@token_required
@role_required('manager')
def get_reports(current_user):
    """Get reports"""
    result, status = ManagerController.get_reports(current_user, request.args)
    if status == 200:
        return jsonify({'status': 'success', 'data': result}), 200
    return jsonify({'status': 'error', 'message': result.get('error', 'Unknown error')}), status

# Inventory Requests
@manager_bp.route('/inventory/requests', methods=['GET'])
@token_required
@role_required('manager')
def get_inventory_requests(current_user):
    """Get inventory requests"""
    result, status = ManagerController.get_inventory_requests(current_user, request.args)
    if status == 200:
        return jsonify({'status': 'success', 'data': result}), 200
    return jsonify({'status': 'error', 'message': result.get('error', 'Unknown error')}), status

# Leave Requests
@manager_bp.route('/leave-requests', methods=['GET'])
@token_required
@role_required('manager')
def get_leave_requests(current_user):
    """Get leave requests"""
    result, status = ManagerController.get_leave_requests(current_user, request.args)
    if status == 200:
        return jsonify({'status': 'success', 'data': result}), 200
    return jsonify({'status': 'error', 'message': result.get('error', 'Unknown error')}), status

@manager_bp.route('/leave-requests/<int:request_id>/approve', methods=['POST'])
@token_required
@role_required('manager')
def approve_leave_request(current_user, request_id):
    """Approve leave request"""
    result, status = ManagerController.approve_leave_request(current_user, request_id)
    if status == 200:
        return jsonify({'status': 'success', 'message': result.get('message')}), 200
    return jsonify({'status': 'error', 'message': result.get('error', 'Unknown error')}), status

@manager_bp.route('/leave-requests/<int:request_id>/reject', methods=['POST'])
@token_required
@role_required('manager')
def reject_leave_request(current_user, request_id):
    """Reject leave request"""
    result, status = ManagerController.reject_leave_request(current_user, request_id, request.json)
    if status == 200:
        return jsonify({'status': 'success', 'message': result.get('message')}), 200
    return jsonify({'status': 'error', 'message': result.get('error', 'Unknown error')}), status

# Sales Summary
@manager_bp.route('/sales/summary', methods=['GET'])
@token_required
@role_required('manager')
def get_sales_summary(current_user):
    """Get sales summary"""
    result, status = ManagerController.get_sales_summary(current_user, request.args)
    if status == 200:
        return jsonify({'status': 'success', 'data': result}), 200
    return jsonify({'status': 'error', 'message': result.get('error', 'Unknown error')}), status