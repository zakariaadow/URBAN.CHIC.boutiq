from flask import Blueprint, request, jsonify
from app.controllers.notification_controller import NotificationController
from app.utils.auth import login_required, role_required

notification_bp = Blueprint('notification', __name__, url_prefix='/api/notifications')

# Get all notifications
@notification_bp.route('/', methods=['GET'])
@login_required
def get_notifications(current_user):
    """Get all notifications"""
    return NotificationController.get_notifications(current_user, request.args)

# Create a new notification
@notification_bp.route('/', methods=['POST'])
@login_required
@role_required(['admin', 'manager'])
def create_notification(current_user):
    """Create a new notification"""
    return NotificationController.create_notification(current_user, request.json)

# Get notification by ID
@notification_bp.route('/<int:notification_id>', methods=['GET'])
@login_required
def get_notification(current_user, notification_id):
    """Get notification details"""
    return NotificationController.get_notification(current_user, notification_id)

# Update notification
@notification_bp.route('/<int:notification_id>', methods=['PUT'])
@login_required
@role_required(['admin', 'manager'])
def update_notification(current_user, notification_id):
    """Update a notification"""
    return NotificationController.update_notification(current_user, notification_id, request.json)

# Delete notification
@notification_bp.route('/<int:notification_id>', methods=['DELETE'])
@login_required
def delete_notification(current_user, notification_id):
    """Delete a notification"""
    return NotificationController.delete_notification(current_user, notification_id)

# Get unread notifications
@notification_bp.route('/unread', methods=['GET'])
@login_required
def get_unread_notifications(current_user):
    """Get unread notifications"""
    return NotificationController.get_unread_notifications(current_user)

# Mark notification as read
@notification_bp.route('/<int:notification_id>/read', methods=['POST'])
@login_required
def mark_notification_read(current_user, notification_id):
    """Mark notification as read"""
    return NotificationController.mark_notification_read(current_user, notification_id)

# Mark all notifications as read
@notification_bp.route('/read-all', methods=['POST'])
@login_required
def mark_all_notifications_read(current_user):
    """Mark all notifications as read"""
    return NotificationController.mark_all_notifications_read(current_user)

# Get notifications by type
@notification_bp.route('/type/<string:type>', methods=['GET'])
@login_required
def get_notifications_by_type(current_user, type):
    """Get notifications by type"""
    return NotificationController.get_notifications_by_type(current_user, type, request.args)

# Get notifications by recipient
@notification_bp.route('/recipient/<int:user_id>', methods=['GET'])
@login_required
@role_required('admin')
def get_notifications_by_recipient(current_user, user_id):
    """Get notifications by recipient"""
    return NotificationController.get_notifications_by_recipient(current_user, user_id, request.args)

# Send bulk notifications
@notification_bp.route('/bulk', methods=['POST'])
@login_required
@role_required(['admin', 'manager'])
def send_bulk_notifications(current_user):
    """Send bulk notifications"""
    return NotificationController.send_bulk_notifications(current_user, request.json)

# Send appointment reminder
@notification_bp.route('/reminder/appointment/<int:appointment_id>', methods=['POST'])
@login_required
def send_appointment_reminder(current_user, appointment_id):
    """Send appointment reminder"""
    return NotificationController.send_appointment_reminder(current_user, appointment_id)

# Get notification preferences
@notification_bp.route('/preferences', methods=['GET'])
@login_required
def get_notification_preferences(current_user):
    """Get notification preferences"""
    return NotificationController.get_notification_preferences(current_user)

# Update notification preferences
@notification_bp.route('/preferences', methods=['PUT'])
@login_required
def update_notification_preferences(current_user):
    """Update notification preferences"""
    return NotificationController.update_notification_preferences(current_user, request.json)

# Export notifications
@notification_bp.route('/export', methods=['POST'])
@login_required
def export_notifications(current_user):
    """Export notifications to file"""
    return NotificationController.export_notifications(current_user, request.json)

# Get notification statistics
@notification_bp.route('/statistics', methods=['GET'])
@login_required
def get_notification_statistics(current_user):
    """Get notification statistics"""
    return NotificationController.get_notification_statistics(current_user)