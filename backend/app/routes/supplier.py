from flask import Blueprint, request, jsonify
from app.controllers.supplier_controller import SupplierController
from app.utils.auth import login_required, role_required

supplier_bp = Blueprint('supplier', __name__, url_prefix='/api/suppliers')

# Get all suppliers
@supplier_bp.route('/', methods=['GET'])
@login_required
def get_suppliers(current_user):
    """Get all suppliers"""
    return SupplierController.get_suppliers(request.args)

# Create a new supplier
@supplier_bp.route('/', methods=['POST'])
@login_required
@role_required(['admin', 'inventory'])
def create_supplier(current_user):
    """Create a new supplier"""
    return SupplierController.create_supplier(current_user, request.json)

# Get supplier by ID
@supplier_bp.route('/<int:supplier_id>', methods=['GET'])
@login_required
def get_supplier(current_user, supplier_id):
    """Get supplier details"""
    return SupplierController.get_supplier(current_user, supplier_id)

# Update supplier
@supplier_bp.route('/<int:supplier_id>', methods=['PUT'])
@login_required
@role_required(['admin', 'inventory'])
def update_supplier(current_user, supplier_id):
    """Update a supplier"""
    return SupplierController.update_supplier(current_user, supplier_id, request.json)

# Delete supplier
@supplier_bp.route('/<int:supplier_id>', methods=['DELETE'])
@login_required
@role_required(['admin', 'inventory'])
def delete_supplier(current_user, supplier_id):
    """Delete a supplier"""
    return SupplierController.delete_supplier(current_user, supplier_id)

# Search suppliers
@supplier_bp.route('/search', methods=['GET'])
@login_required
def search_suppliers(current_user):
    """Search suppliers"""
    return SupplierController.search_suppliers(current_user, request.args)

# Get supplier products
@supplier_bp.route('/<int:supplier_id>/products', methods=['GET'])
@login_required
def get_supplier_products(current_user, supplier_id):
    """Get products from supplier"""
    return SupplierController.get_supplier_products(current_user, supplier_id, request.args)

# Toggle supplier status
@supplier_bp.route('/<int:supplier_id>/toggle', methods=['POST'])
@login_required
@role_required(['admin', 'inventory'])
def toggle_supplier(current_user, supplier_id):
    """Toggle supplier status"""
    return SupplierController.toggle_supplier(current_user, supplier_id)

# Get supplier purchases
@supplier_bp.route('/<int:supplier_id>/purchases', methods=['GET'])
@login_required
def get_supplier_purchases(current_user, supplier_id):
    """Get purchases from supplier"""
    return SupplierController.get_supplier_purchases(current_user, supplier_id, request.args)

# Get supplier analytics
@supplier_bp.route('/analytics', methods=['GET'])
@login_required
@role_required(['admin', 'manager'])
def get_supplier_analytics(current_user):
    """Get supplier analytics"""
    return SupplierController.get_supplier_analytics(current_user, request.args)

# Export suppliers
@supplier_bp.route('/export', methods=['POST'])
@login_required
def export_suppliers(current_user):
    """Export suppliers to file"""
    return SupplierController.export_suppliers(current_user, request.json)