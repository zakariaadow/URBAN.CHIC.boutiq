from flask import Blueprint, request, jsonify
from app.controllers.product_controller import ProductController
from app.utils.auth import login_required, role_required

product_bp = Blueprint('product', __name__, url_prefix='/api/products')

# Get all products
@product_bp.route('/', methods=['GET'])
@login_required
def get_products(current_user):
    """Get all products"""
    return ProductController.get_products(request.args)

# Create a new product
@product_bp.route('/', methods=['POST'])
@login_required
@role_required(['admin', 'inventory'])
def create_product(current_user):
    """Create a new product"""
    return ProductController.create_product(current_user, request.json)

# Get product by ID
@product_bp.route('/<int:product_id>', methods=['GET'])
@login_required
def get_product(current_user, product_id):
    """Get product details"""
    return ProductController.get_product(current_user, product_id)

# Update product
@product_bp.route('/<int:product_id>', methods=['PUT'])
@login_required
@role_required(['admin', 'inventory'])
def update_product(current_user, product_id):
    """Update a product"""
    return ProductController.update_product(current_user, product_id, request.json)

# Delete product
@product_bp.route('/<int:product_id>', methods=['DELETE'])
@login_required
@role_required(['admin', 'inventory'])
def delete_product(current_user, product_id):
    """Delete a product"""
    return ProductController.delete_product(current_user, product_id)

# Get product by barcode
@product_bp.route('/barcode/<string:barcode>', methods=['GET'])
@login_required
def get_product_by_barcode(current_user, barcode):
    """Get product by barcode"""
    return ProductController.get_product_by_barcode(current_user, barcode)

# Get products by category
@product_bp.route('/category/<int:category_id>', methods=['GET'])
@login_required
def get_products_by_category(current_user, category_id):
    """Get products by category"""
    return ProductController.get_products_by_category(current_user, category_id, request.args)

# Search products
@product_bp.route('/search', methods=['GET'])
@login_required
def search_products(current_user):
    """Search products"""
    return ProductController.search_products(current_user, request.args)

# Update product stock
@product_bp.route('/<int:product_id>/stock', methods=['PUT'])
@login_required
@role_required(['admin', 'inventory'])
def update_product_stock(current_user, product_id):
    """Update product stock"""
    return ProductController.update_product_stock(current_user, product_id, request.json)

# Toggle product status
@product_bp.route('/<int:product_id>/toggle', methods=['POST'])
@login_required
@role_required(['admin', 'inventory'])
def toggle_product(current_user, product_id):
    """Toggle product status"""
    return ProductController.toggle_product(current_user, product_id)

# Upload product image
@product_bp.route('/<int:product_id>/image', methods=['POST'])
@login_required
@role_required(['admin', 'inventory'])
def upload_product_image(current_user, product_id):
    """Upload product image"""
    return ProductController.upload_product_image(current_user, product_id, request.files)

# Get product analytics
@product_bp.route('/analytics', methods=['GET'])
@login_required
@role_required(['admin', 'manager'])
def get_product_analytics(current_user):
    """Get product analytics"""
    return ProductController.get_product_analytics(current_user, request.args)

# Export products
@product_bp.route('/export', methods=['POST'])
@login_required
def export_products(current_user):
    """Export products to file"""
    return ProductController.export_products(current_user, request.json)

# Bulk update products
@product_bp.route('/bulk', methods=['PUT'])
@login_required
@role_required(['admin', 'inventory'])
def bulk_update_products(current_user):
    """Bulk update products"""
    return ProductController.bulk_update_products(current_user, request.json)