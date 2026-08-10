from flask import Blueprint, request, jsonify
from app.controllers.category_controller import CategoryController
from app.utils.auth import login_required, role_required

category_bp = Blueprint('category', __name__, url_prefix='/api/categories')

# Get all categories
@category_bp.route('/', methods=['GET'])
def get_categories():
    """Get all categories"""
    return CategoryController.get_categories(request.args)

# Create a new category
@category_bp.route('/', methods=['POST'])
@login_required
@role_required(['admin', 'manager'])
def create_category(current_user):
    """Create a new category"""
    return CategoryController.create_category(current_user, request.json)

# Get category by ID
@category_bp.route('/<int:category_id>', methods=['GET'])
def get_category(category_id):
    """Get category details"""
    return CategoryController.get_category(category_id)

# Update category
@category_bp.route('/<int:category_id>', methods=['PUT'])
@login_required
@role_required(['admin', 'manager'])
def update_category(current_user, category_id):
    """Update a category"""
    return CategoryController.update_category(current_user, category_id, request.json)

# Delete category
@category_bp.route('/<int:category_id>', methods=['DELETE'])
@login_required
@role_required(['admin', 'manager'])
def delete_category(current_user, category_id):
    """Delete a category"""
    return CategoryController.delete_category(current_user, category_id)

# Get category with services
@category_bp.route('/<int:category_id>/services', methods=['GET'])
def get_category_services(category_id):
    """Get services in a category"""
    return CategoryController.get_category_services(category_id, request.args)

# Toggle category status
@category_bp.route('/<int:category_id>/toggle', methods=['POST'])
@login_required
@role_required(['admin', 'manager'])
def toggle_category(current_user, category_id):
    """Toggle category status"""
    return CategoryController.toggle_category(current_user, category_id)

# Get category analytics
@category_bp.route('/analytics', methods=['GET'])
@login_required
@role_required(['admin', 'manager'])
def get_category_analytics(current_user):
    """Get category analytics"""
    return CategoryController.get_category_analytics(current_user, request.args)

# Export categories
@category_bp.route('/export', methods=['POST'])
@login_required
@role_required(['admin', 'manager'])
def export_categories(current_user):
    """Export categories to file"""
    return CategoryController.export_categories(current_user, request.json)

# Bulk update categories
@category_bp.route('/bulk', methods=['PUT'])
@login_required
@role_required(['admin', 'manager'])
def bulk_update_categories(current_user):
    """Bulk update categories"""
    return CategoryController.bulk_update_categories(current_user, request.json)