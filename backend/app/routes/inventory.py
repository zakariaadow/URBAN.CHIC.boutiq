from flask import Blueprint, request, jsonify
from app.controllers.inventory_controller import InventoryController
from app.utils.auth import login_required, role_required

inventory_bp = Blueprint('inventory', __name__, url_prefix='/api/inventory')

# Dashboard
@inventory_bp.route('/dashboard', methods=['GET'])
@login_required
@role_required('inventory')
def dashboard(current_user):
    """Inventory dashboard data"""
    return InventoryController.get_dashboard(current_user)

# Product Management
@inventory_bp.route('/products', methods=['POST'])
@login_required
@role_required('inventory')
def add_product(current_user):
    """Add new product"""
    return InventoryController.add_product(current_user, request.json)

@inventory_bp.route('/products', methods=['GET'])
@login_required
@role_required('inventory')
def get_products(current_user):
    """Get all products"""
    return InventoryController.get_products(current_user, request.args)

@inventory_bp.route('/products/<int:product_id>', methods=['GET'])
@login_required
@role_required('inventory')
def get_product(current_user, product_id):
    """Get product details"""
    return InventoryController.get_product(current_user, product_id)

@inventory_bp.route('/products/<int:product_id>', methods=['PUT'])
@login_required
@role_required('inventory')
def update_product(current_user, product_id):
    """Update product"""
    return InventoryController.update_product(current_user, product_id, request.json)

@inventory_bp.route('/products/<int:product_id>', methods=['DELETE'])
@login_required
@role_required('inventory')
def delete_product(current_user, product_id):
    """Delete product"""
    return InventoryController.delete_product(current_user, product_id)

@inventory_bp.route('/products/search', methods=['GET'])
@login_required
@role_required('inventory')
def search_products(current_user):
    """Search products"""
    return InventoryController.search_products(current_user, request.args)

@inventory_bp.route('/products/categories', methods=['GET'])
@login_required
@role_required('inventory')
def get_product_categories(current_user):
    """Get product categories"""
    return InventoryController.get_product_categories()

@inventory_bp.route('/products/barcode/<barcode>', methods=['GET'])
@login_required
@role_required('inventory')
def get_product_by_barcode(current_user, barcode):
    """Get product by barcode"""
    return InventoryController.get_product_by_barcode(current_user, barcode)

# Supplier Management
@inventory_bp.route('/suppliers', methods=['POST'])
@login_required
@role_required('inventory')
def add_supplier(current_user):
    """Add supplier"""
    return InventoryController.add_supplier(current_user, request.json)

@inventory_bp.route('/suppliers', methods=['GET'])
@login_required
@role_required('inventory')
def get_suppliers(current_user):
    """Get all suppliers"""
    return InventoryController.get_suppliers(current_user, request.args)

@inventory_bp.route('/suppliers/<int:supplier_id>', methods=['GET'])
@login_required
@role_required('inventory')
def get_supplier(current_user, supplier_id):
    """Get supplier details"""
    return InventoryController.get_supplier(current_user, supplier_id)

@inventory_bp.route('/suppliers/<int:supplier_id>', methods=['PUT'])
@login_required
@role_required('inventory')
def update_supplier(current_user, supplier_id):
    """Update supplier"""
    return InventoryController.update_supplier(current_user, supplier_id, request.json)

@inventory_bp.route('/suppliers/<int:supplier_id>', methods=['DELETE'])
@login_required
@role_required('inventory')
def delete_supplier(current_user, supplier_id):
    """Delete supplier"""
    return InventoryController.delete_supplier(current_user, supplier_id)

@inventory_bp.route('/suppliers/search', methods=['GET'])
@login_required
@role_required('inventory')
def search_suppliers(current_user):
    """Search suppliers"""
    return InventoryController.search_suppliers(current_user, request.args)

# Purchase Management
@inventory_bp.route('/purchases', methods=['POST'])
@login_required
@role_required('inventory')
def record_purchase(current_user):
    """Record a purchase"""
    return InventoryController.record_purchase(current_user, request.json)

@inventory_bp.route('/purchases', methods=['GET'])
@login_required
@role_required('inventory')
def get_purchases(current_user):
    """Get all purchases"""
    return InventoryController.get_purchases(current_user, request.args)

@inventory_bp.route('/purchases/<int:purchase_id>', methods=['GET'])
@login_required
@role_required('inventory')
def get_purchase(current_user, purchase_id):
    """Get purchase details"""
    return InventoryController.get_purchase(current_user, purchase_id)

@inventory_bp.route('/purchases/<int:purchase_id>', methods=['PUT'])
@login_required
@role_required('inventory')
def update_purchase(current_user, purchase_id):
    """Update purchase"""
    return InventoryController.update_purchase(current_user, purchase_id, request.json)

@inventory_bp.route('/purchases/<int:purchase_id>', methods=['DELETE'])
@login_required
@role_required('inventory')
def delete_purchase(current_user, purchase_id):
    """Delete purchase"""
    return InventoryController.delete_purchase(current_user, purchase_id)

# Stock Management
@inventory_bp.route('/stock/in', methods=['POST'])
@login_required
@role_required('inventory')
def stock_in(current_user):
    """Record stock in"""
    return InventoryController.stock_in(current_user, request.json)

@inventory_bp.route('/stock/out', methods=['POST'])
@login_required
@role_required('inventory')
def stock_out(current_user):
    """Record stock out"""
    return InventoryController.stock_out(current_user, request.json)

@inventory_bp.route('/stock/transfer', methods=['POST'])
@login_required
@role_required('inventory')
def transfer_stock(current_user):
    """Transfer stock between branches"""
    return InventoryController.transfer_stock(current_user, request.json)

@inventory_bp.route('/stock/levels', methods=['GET'])
@login_required
@role_required('inventory')
def get_stock_levels(current_user):
    """Get stock levels"""
    return InventoryController.get_stock_levels(current_user, request.args)

@inventory_bp.route('/stock/history', methods=['GET'])
@login_required
@role_required('inventory')
def get_stock_history(current_user):
    """Get stock movement history"""
    return InventoryController.get_stock_history(current_user, request.args)

@inventory_bp.route('/stock/adjust', methods=['POST'])
@login_required
@role_required('inventory')
def adjust_stock(current_user):
    """Adjust stock levels"""
    return InventoryController.adjust_stock(current_user, request.json)

# Stock Alerts
@inventory_bp.route('/stock/alerts/low', methods=['GET'])
@login_required
@role_required('inventory')
def get_low_stock_alerts(current_user):
    """Get low stock alerts"""
    return InventoryController.get_low_stock_alerts(current_user)

@inventory_bp.route('/stock/alerts/expired', methods=['GET'])
@login_required
@role_required('inventory')
def get_expired_products(current_user):
    """Get expired products"""
    return InventoryController.get_expired_products(current_user)

@inventory_bp.route('/stock/alerts/overstock', methods=['GET'])
@login_required
@role_required('inventory')
def get_overstock_alerts(current_user):
    """Get overstock alerts"""
    return InventoryController.get_overstock_alerts(current_user)

@inventory_bp.route('/stock/alerts/dismiss/<int:alert_id>', methods=['POST'])
@login_required
@role_required('inventory')
def dismiss_alert(current_user, alert_id):
    """Dismiss stock alert"""
    return InventoryController.dismiss_alert(current_user, alert_id)

# Inventory Reports
@inventory_bp.route('/reports', methods=['GET'])
@login_required
@role_required('inventory')
def get_inventory_reports(current_user):
    """Get inventory reports"""
    return InventoryController.get_inventory_reports(current_user, request.args)

@inventory_bp.route('/reports/valuation', methods=['GET'])
@login_required
@role_required('inventory')
def get_valuation_report(current_user):
    """Get inventory valuation report"""
    return InventoryController.get_valuation_report(current_user, request.args)

@inventory_bp.route('/reports/movement', methods=['GET'])
@login_required
@role_required('inventory')
def get_movement_report(current_user):
    """Get stock movement report"""
    return InventoryController.get_movement_report(current_user, request.args)

@inventory_bp.route('/reports/summary', methods=['GET'])
@login_required
@role_required('inventory')
def get_inventory_summary(current_user):
    """Get inventory summary"""
    return InventoryController.get_inventory_summary(current_user)

@inventory_bp.route('/reports/export', methods=['POST'])
@login_required
@role_required('inventory')
def export_inventory_report(current_user):
    """Export inventory report"""
    return InventoryController.export_inventory_report(current_user, request.json)

# Batch Management
@inventory_bp.route('/batches', methods=['GET'])
@login_required
@role_required('inventory')
def get_batches(current_user):
    """Get product batches"""
    return InventoryController.get_batches(current_user, request.args)

@inventory_bp.route('/batches/<int:batch_id>', methods=['GET'])
@login_required
@role_required('inventory')
def get_batch(current_user, batch_id):
    """Get batch details"""
    return InventoryController.get_batch(current_user, batch_id)

@inventory_bp.route('/batches/<int:batch_id>', methods=['PUT'])
@login_required
@role_required('inventory')
def update_batch(current_user, batch_id):
    """Update batch"""
    return InventoryController.update_batch(current_user, batch_id, request.json)

# ================================================================
# ✅ ADDED: Missing Notifications Route
# ================================================================
@inventory_bp.route('/notifications', methods=['GET'])
@login_required
@role_required('inventory')
def get_notifications(current_user):
    """Get inventory notifications"""
    return InventoryController.get_notifications(current_user, request.args)