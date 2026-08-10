from flask import Blueprint, request, jsonify
from app.controllers.stylist_controller import StylistController
from app.utils.auth import token_required, role_required

stylist_bp = Blueprint('stylist', __name__, url_prefix='/api/stylist')

# ==================== DASHBOARD ====================
@stylist_bp.route('/dashboard', methods=['GET'])
@token_required
@role_required('stylist')
def stylist_dashboard(current_user):
    """Stylist dashboard data"""
    try:
        result, status = StylistController.get_dashboard(current_user)
        if status == 200:
            return jsonify({'status': 'success', 'data': result}), 200
        return jsonify({'status': 'error', 'message': result.get('error', 'Unknown error')}), status
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500

# ==================== APPOINTMENTS ====================
@stylist_bp.route('/appointments', methods=['GET'])
@token_required
@role_required('stylist')
def stylist_all_appointments(current_user):
    """Get ALL appointments with pagination"""
    try:
        result, status = StylistController.get_all_appointments(current_user, request.args)
        if status == 200:
            return jsonify({'status': 'success', 'data': result}), 200
        return jsonify({'status': 'error', 'message': result.get('error', 'Unknown error')}), status
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500

@stylist_bp.route('/appointments/today', methods=['GET'])
@token_required
@role_required('stylist')
def stylist_today_appointments(current_user):
    """Get today's appointments"""
    try:
        result, status = StylistController.get_today_appointments(current_user)
        if status == 200:
            return jsonify({'status': 'success', 'data': result}), 200
        return jsonify({'status': 'error', 'message': result.get('error', 'Unknown error')}), status
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500

@stylist_bp.route('/appointments/upcoming', methods=['GET'])
@token_required
@role_required('stylist')
def stylist_upcoming_appointments(current_user):
    """Get upcoming appointments"""
    try:
        result, status = StylistController.get_upcoming_appointments(current_user)
        if status == 200:
            return jsonify({'status': 'success', 'data': result}), 200
        return jsonify({'status': 'error', 'message': result.get('error', 'Unknown error')}), status
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500

@stylist_bp.route('/appointments/history', methods=['GET'])
@token_required
@role_required('stylist')
def stylist_appointment_history(current_user):
    """Get appointment history"""
    try:
        result, status = StylistController.get_appointment_history(current_user, request.args)
        if status == 200:
            return jsonify({'status': 'success', 'data': result}), 200
        return jsonify({'status': 'error', 'message': result.get('error', 'Unknown error')}), status
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500

# ==================== EARNINGS ====================
@stylist_bp.route('/earnings', methods=['GET'])
@token_required
@role_required('stylist')
def stylist_earnings(current_user):
    """Get stylist earnings"""
    try:
        result, status = StylistController.get_earnings(current_user, request.args)
        if status == 200:
            return jsonify({'status': 'success', 'data': result}), 200
        return jsonify({'status': 'error', 'message': result.get('error', 'Unknown error')}), status
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500

@stylist_bp.route('/earnings/summary', methods=['GET'])
@token_required
@role_required('stylist')
def stylist_earnings_summary(current_user):
    """Get earnings summary"""
    try:
        result, status = StylistController.get_earnings_summary(current_user)
        if status == 200:
            return jsonify({'status': 'success', 'data': result}), 200
        return jsonify({'status': 'error', 'message': result.get('error', 'Unknown error')}), status
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500

# ==================== COMMISSIONS ====================
@stylist_bp.route('/commissions', methods=['GET'])
@token_required
@role_required('stylist')
def stylist_commissions(current_user):
    """Get stylist commissions"""
    try:
        result, status = StylistController.get_commission(current_user, request.args)
        if status == 200:
            return jsonify({'status': 'success', 'data': result}), 200
        return jsonify({'status': 'error', 'message': result.get('error', 'Unknown error')}), status
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500

@stylist_bp.route('/commission/rate', methods=['GET'])
@token_required
@role_required('stylist')
def stylist_commission_rate(current_user):
    """Get commission rate"""
    try:
        result, status = StylistController.get_commission_rate(current_user)
        if status == 200:
            return jsonify({'status': 'success', 'data': result}), 200
        return jsonify({'status': 'error', 'message': result.get('error', 'Unknown error')}), status
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500

# ==================== SCHEDULE ====================
@stylist_bp.route('/schedule', methods=['GET'])
@token_required
@role_required('stylist')
def stylist_schedule(current_user):
    """Get stylist schedule"""
    try:
        result, status = StylistController.get_schedule(current_user, request.args)
        if status == 200:
            return jsonify({'status': 'success', 'data': result}), 200
        return jsonify({'status': 'error', 'message': result.get('error', 'Unknown error')}), status
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500

# ==================== LEAVE REQUESTS ====================
@stylist_bp.route('/leave-requests', methods=['GET'])
@token_required
@role_required('stylist')
def stylist_get_leave_requests(current_user):
    """Get all leave requests"""
    try:
        result, status = StylistController.get_leave_requests(current_user)
        if status == 200:
            return jsonify({'status': 'success', 'data': result}), 200
        return jsonify({'status': 'error', 'message': result.get('error', 'Unknown error')}), status
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500

@stylist_bp.route('/leave-requests', methods=['POST'])
@token_required
@role_required('stylist')
def stylist_create_leave_request(current_user):
    """Create a leave request"""
    try:
        result, status = StylistController.create_leave_request(current_user, request.json)
        if status == 201:
            return jsonify({'status': 'success', 'message': result.get('message')}), 201
        return jsonify({'status': 'error', 'message': result.get('error', 'Unknown error')}), status
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500

# ==================== PERFORMANCE ====================
@stylist_bp.route('/performance/stats', methods=['GET'])
@token_required
@role_required('stylist')
def stylist_performance_stats(current_user):
    """Get performance statistics"""
    try:
        result, status = StylistController.get_performance_stats(current_user)
        if status == 200:
            return jsonify({'status': 'success', 'data': result}), 200
        return jsonify({'status': 'error', 'message': result.get('error', 'Unknown error')}), status
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500

# ==================== PROFILE ====================
@stylist_bp.route('/profile', methods=['GET'])
@token_required
@role_required('stylist')
def stylist_get_profile(current_user):
    """Get stylist profile"""
    try:
        result, status = StylistController.get_profile(current_user)
        if status == 200:
            return jsonify({'status': 'success', 'data': result}), 200
        return jsonify({'status': 'error', 'message': result.get('error', 'Unknown error')}), status
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500

@stylist_bp.route('/profile', methods=['PUT'])
@token_required
@role_required('stylist')
def stylist_update_profile(current_user):
    """Update stylist profile"""
    try:
        result, status = StylistController.update_profile(current_user, request.json)
        if status == 200:
            return jsonify({'status': 'success', 'message': result.get('message')}), 200
        return jsonify({'status': 'error', 'message': result.get('error', 'Unknown error')}), status
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500

# ==================== NOTIFICATIONS ====================
@stylist_bp.route('/notifications', methods=['GET'])
@token_required
@role_required('stylist')
def stylist_get_notifications(current_user):
    """Get notifications"""
    try:
        result, status = StylistController.get_notifications(current_user, request.args)
        if status == 200:
            return jsonify({'status': 'success', 'data': result}), 200
        return jsonify({'status': 'error', 'message': result.get('error', 'Unknown error')}), status
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500

@stylist_bp.route('/notifications/<int:notification_id>/read', methods=['POST'])
@token_required
@role_required('stylist')
def stylist_mark_notification_read(current_user, notification_id):
    """Mark notification as read"""
    try:
        result, status = StylistController.mark_notification_read(current_user, notification_id)
        if status == 200:
            return jsonify({'status': 'success', 'message': result.get('message')}), 200
        return jsonify({'status': 'error', 'message': result.get('error', 'Unknown error')}), status
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500