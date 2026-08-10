from flask import Blueprint, request, jsonify, send_file
from app.controllers.appointment_controller import AppointmentController
from app.utils.auth import token_required, role_required
import io
from datetime import datetime

appointment_bp = Blueprint('appointment', __name__, url_prefix='/api/appointments')

@appointment_bp.route('/', methods=['GET'])
@token_required
def get_appointments(current_user):
    """Get all appointments based on user role"""
    return AppointmentController.get_appointments(current_user, request.args)

@appointment_bp.route('/<int:appointment_id>', methods=['GET'])
@token_required
def get_appointment(current_user, appointment_id):
    """Get specific appointment details"""
    return AppointmentController.get_appointment(current_user, appointment_id)

@appointment_bp.route('/', methods=['POST'])
@token_required
def create_appointment(current_user):
    """Create a new appointment"""
    return AppointmentController.create_appointment(current_user, request.json)

@appointment_bp.route('/<int:appointment_id>', methods=['PUT'])
@token_required
def update_appointment(current_user, appointment_id):
    """Update appointment"""
    return AppointmentController.update_appointment(current_user, appointment_id, request.json)

@appointment_bp.route('/<int:appointment_id>', methods=['DELETE'])
@token_required
def delete_appointment(current_user, appointment_id):
    """Delete appointment"""
    return AppointmentController.delete_appointment(current_user, appointment_id)

@appointment_bp.route('/<int:appointment_id>/cancel', methods=['POST'])
@token_required
def cancel_appointment(current_user, appointment_id):
    """Cancel appointment"""
    return AppointmentController.cancel_appointment(current_user, appointment_id, request.json)

@appointment_bp.route('/<int:appointment_id>/reschedule', methods=['PUT'])
@token_required
def reschedule_appointment(current_user, appointment_id):
    """Reschedule appointment"""
    return AppointmentController.reschedule_appointment(current_user, appointment_id, request.json)

@appointment_bp.route('/<int:appointment_id>/check-in', methods=['POST'])
@token_required
def check_in_appointment(current_user, appointment_id):
    """Check-in for appointment"""
    return AppointmentController.check_in_appointment(current_user, appointment_id)

@appointment_bp.route('/<int:appointment_id>/complete', methods=['POST'])
@token_required
def complete_appointment(current_user, appointment_id):
    """Mark appointment as completed"""
    return AppointmentController.complete_appointment(current_user, appointment_id)

@appointment_bp.route('/<int:appointment_id>/assign-stylist', methods=['POST'])
@token_required
def assign_stylist(current_user, appointment_id):
    """Assign stylist to appointment"""
    return AppointmentController.assign_stylist(current_user, appointment_id, request.json)

@appointment_bp.route('/<int:appointment_id>/notes', methods=['PUT'])
@token_required
def update_notes(current_user, appointment_id):
    """Update appointment notes"""
    return AppointmentController.update_notes(current_user, appointment_id, request.json)

@appointment_bp.route('/<int:appointment_id>/reminder', methods=['POST'])
@token_required
def send_reminder(current_user, appointment_id):
    """Send appointment reminder"""
    return AppointmentController.send_reminder(current_user, appointment_id)

@appointment_bp.route('/today', methods=['GET'])
@token_required
def get_today_appointments(current_user):
    """Get today's appointments"""
    return AppointmentController.get_today_appointments(current_user)

@appointment_bp.route('/upcoming', methods=['GET'])
@token_required
def get_upcoming_appointments(current_user):
    """Get upcoming appointments"""
    return AppointmentController.get_upcoming_appointments(current_user)

@appointment_bp.route('/history', methods=['GET'])
@token_required
def get_appointment_history(current_user):
    """Get appointment history"""
    return AppointmentController.get_appointment_history(current_user, request.args)

@appointment_bp.route('/available-slots', methods=['GET'])
def get_available_slots():
    """Get available time slots"""
    return AppointmentController.get_available_slots(request.args)

@appointment_bp.route('/export', methods=['GET', 'POST'])
@token_required
def export_appointments(current_user):
    """Export appointments data"""
    try:
        # Handle both GET and POST
        if request.method == 'POST':
            data = request.json or {}
        else:
            data = request.args.to_dict()
        
        format_type = data.get('format', 'pdf')
        start_date = data.get('start_date')
        end_date = data.get('end_date')
        status = data.get('status')
        search = data.get('search')
        
        return AppointmentController.export_appointments(
            current_user, 
            format_type, 
            start_date, 
            end_date, 
            status, 
            search
        )
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

@appointment_bp.route('/stats', methods=['GET'])
@token_required
def get_appointment_stats(current_user):
    """Get appointment statistics"""
    return AppointmentController.get_appointment_stats(current_user, request.args)