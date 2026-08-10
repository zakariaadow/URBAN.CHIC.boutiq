from flask import Blueprint, request, jsonify
from app.controllers.promotion_controller import PromotionController
from app.utils.auth import login_required, role_required

promotion_bp = Blueprint('promotion', __name__, url_prefix='/api/promotions')

# Get all promotions
@promotion_bp.route('/', methods=['GET'])
def get_promotions():
    """Get all promotions"""
    return PromotionController.get_promotions(request.args)

# Create a new promotion
@promotion_bp.route('/', methods=['POST'])
@login_required
@role_required(['admin', 'manager'])
def create_promotion(current_user):
    """Create a new promotion"""
    return PromotionController.create_promotion(current_user, request.json)

# Get promotion by ID
@promotion_bp.route('/<int:promotion_id>', methods=['GET'])
def get_promotion(promotion_id):
    """Get promotion details"""
    return PromotionController.get_promotion(promotion_id)

# Update promotion
@promotion_bp.route('/<int:promotion_id>', methods=['PUT'])
@login_required
@role_required(['admin', 'manager'])
def update_promotion(current_user, promotion_id):
    """Update a promotion"""
    return PromotionController.update_promotion(current_user, promotion_id, request.json)

# Delete promotion
@promotion_bp.route('/<int:promotion_id>', methods=['DELETE'])
@login_required
@role_required(['admin', 'manager'])
def delete_promotion(current_user, promotion_id):
    """Delete a promotion"""
    return PromotionController.delete_promotion(current_user, promotion_id)

# Get active promotions
@promotion_bp.route('/active', methods=['GET'])
def get_active_promotions():
    """Get active promotions"""
    return PromotionController.get_active_promotions(request.args)

# Get promotions by type
@promotion_bp.route('/type/<string:type>', methods=['GET'])
def get_promotions_by_type(type):
    """Get promotions by type"""
    return PromotionController.get_promotions_by_type(type, request.args)

# Apply promotion to service
@promotion_bp.route('/<int:promotion_id>/service/<int:service_id>', methods=['POST'])
@login_required
@role_required(['admin', 'manager'])
def apply_promotion_to_service(current_user, promotion_id, service_id):
    """Apply promotion to a service"""
    return PromotionController.apply_promotion_to_service(current_user, promotion_id, service_id)

# Remove promotion from service
@promotion_bp.route('/<int:promotion_id>/service/<int:service_id>', methods=['DELETE'])
@login_required
@role_required(['admin', 'manager'])
def remove_promotion_from_service(current_user, promotion_id, service_id):
    """Remove promotion from a service"""
    return PromotionController.remove_promotion_from_service(current_user, promotion_id, service_id)

# Apply promotion to product
@promotion_bp.route('/<int:promotion_id>/product/<int:product_id>', methods=['POST'])
@login_required
@role_required(['admin', 'manager'])
def apply_promotion_to_product(current_user, promotion_id, product_id):
    """Apply promotion to a product"""
    return PromotionController.apply_promotion_to_product(current_user, promotion_id, product_id)

# Remove promotion from product
@promotion_bp.route('/<int:promotion_id>/product/<int:product_id>', methods=['DELETE'])
@login_required
@role_required(['admin', 'manager'])
def remove_promotion_from_product(current_user, promotion_id, product_id):
    """Remove promotion from a product"""
    return PromotionController.remove_promotion_from_product(current_user, promotion_id, product_id)

# Toggle promotion status
@promotion_bp.route('/<int:promotion_id>/toggle', methods=['POST'])
@login_required
@role_required(['admin', 'manager'])
def toggle_promotion(current_user, promotion_id):
    """Toggle promotion status"""
    return PromotionController.toggle_promotion(current_user, promotion_id)

# Get promotion analytics
@promotion_bp.route('/analytics', methods=['GET'])
@login_required
@role_required(['admin', 'manager'])
def get_promotion_analytics(current_user):
    """Get promotion analytics"""
    return PromotionController.get_promotion_analytics(current_user, request.args)

# Calculate discount
@promotion_bp.route('/calculate-discount', methods=['POST'])
def calculate_discount():
    """Calculate discount for a service or product"""
    return PromotionController.calculate_discount(request.json)

# Export promotions
@promotion_bp.route('/export', methods=['POST'])
@login_required
@role_required(['admin', 'manager'])
def export_promotions(current_user):
    """Export promotions to file"""
    return PromotionController.export_promotions(current_user, request.json)

# Get promotion statistics
@promotion_bp.route('/statistics', methods=['GET'])
@login_required
@role_required(['admin', 'manager'])
def get_promotion_statistics(current_user):
    """Get promotion statistics"""
    return PromotionController.get_promotion_statistics(current_user, request.args)