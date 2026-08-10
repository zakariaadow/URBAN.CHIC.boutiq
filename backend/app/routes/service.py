from flask import Blueprint, request, jsonify
from app.controllers.service_controller import ServiceController
from app.utils.auth import login_required, role_required

service_bp = Blueprint('service', __name__, url_prefix='/api/services')

# Get all services
@service_bp.route('/', methods=['GET'])
def get_services():
    """Get all services"""
    return ServiceController.get_services(request.args)

# Create a new service
@service_bp.route('/', methods=['POST'])
@login_required
@role_required(['admin', 'manager'])
def create_service(current_user):
    """Create a new service"""
    return ServiceController.create_service(current_user, request.json)

# Get service by ID
@service_bp.route('/<int:service_id>', methods=['GET'])
def get_service(service_id):
    """Get service details"""
    return ServiceController.get_service(service_id)

# Update service
@service_bp.route('/<int:service_id>', methods=['PUT'])
@login_required
@role_required(['admin', 'manager'])
def update_service(current_user, service_id):
    """Update a service"""
    return ServiceController.update_service(current_user, service_id, request.json)

# Delete service
@service_bp.route('/<int:service_id>', methods=['DELETE'])
@login_required
@role_required(['admin', 'manager'])
def delete_service(current_user, service_id):
    """Delete a service"""
    return ServiceController.delete_service(current_user, service_id)

# Get services by category
@service_bp.route('/category/<int:category_id>', methods=['GET'])
def get_services_by_category(category_id):
    """Get services by category"""
    return ServiceController.get_services_by_category(category_id, request.args)

# Toggle service status
@service_bp.route('/<int:service_id>/toggle', methods=['POST'])
@login_required
@role_required(['admin', 'manager'])
def toggle_service(current_user, service_id):
    """Toggle service active status"""
    return ServiceController.toggle_service(current_user, service_id)

# Update service pricing
@service_bp.route('/<int:service_id>/pricing', methods=['PUT'])
@login_required
@role_required(['admin', 'manager'])
def update_service_pricing(current_user, service_id):
    """Update service pricing"""
    return ServiceController.update_service_pricing(current_user, service_id, request.json)

# Add service to promotion
@service_bp.route('/<int:service_id>/promotion', methods=['POST'])
@login_required
@role_required(['admin', 'manager'])
def add_service_to_promotion(current_user, service_id):
    """Add service to promotion"""
    return ServiceController.add_service_to_promotion(current_user, service_id, request.json)

# Remove service from promotion
@service_bp.route('/<int:service_id>/promotion', methods=['DELETE'])
@login_required
@role_required(['admin', 'manager'])
def remove_service_from_promotion(current_user, service_id):
    """Remove service from promotion"""
    return ServiceController.remove_service_from_promotion(current_user, service_id)

# Get service analytics
@service_bp.route('/analytics', methods=['GET'])
@login_required
@role_required(['admin', 'manager'])
def get_service_analytics(current_user):
    """Get service analytics"""
    return ServiceController.get_service_analytics(current_user, request.args)

# Get popular services
@service_bp.route('/popular', methods=['GET'])
def get_popular_services():
    """Get popular services"""
    return ServiceController.get_popular_services(request.args)

# Export services
@service_bp.route('/export', methods=['POST'])
@login_required
@role_required(['admin', 'manager'])
def export_services(current_user):
    """Export services to file"""
    return ServiceController.export_services(current_user, request.json)

# Bulk update services
@service_bp.route('/bulk', methods=['PUT'])
@login_required
@role_required(['admin', 'manager'])
def bulk_update_services(current_user):
    """Bulk update services"""
    return ServiceController.bulk_update_services(current_user, request.json)