from flask import Blueprint, request, jsonify
from app.controllers.stock_controller import StockController
from app.utils.auth import login_required, role_required

stock_bp = Blueprint('stock', __name__, url_prefix='/api/stock')

# Get stock levels
@stock_bp.route('/', methods=['GET'])
@login_required
def get_stock_levels(current_user):
    """Get stock levels"""
    return StockController.get_stock_levels(current_user, request.args)

# Get stock by product
@stock_bp.route('/product/<int:product_id>', methods=['GET'])
@login_required
def get_stock_by_product(current_user, product_id):
    """Get stock by product"""
    return StockController.get_stock_by_product(current_user, product_id)

# Get stock by branch
@stock_bp.route('/branch/<int:branch_id>', methods=['GET'])
@login_required
def get_stock_by_branch(current_user, branch_id):
    """Get stock by branch"""
    return StockController.get_stock_by_branch(current_user, branch_id, request.args)

# Record stock in
@stock_bp.route('/in', methods=['POST'])
@login_required
@role_required(['admin', 'inventory'])
def record_stock_in(current_user):
    """Record stock in"""
    return StockController.record_stock_in(current_user, request.json)

# Record stock out
@stock_bp.route('/out', methods=['POST'])
@login_required
@role_required(['admin', 'inventory'])
def record_stock_out(current_user):
    """Record stock out"""
    return StockController.record_stock_out(current_user, request.json)

# Transfer stock
@stock_bp.route('/transfer', methods=['POST'])
@login_required
@role_required(['admin', 'inventory', 'manager'])
def transfer_stock(current_user):
    """Transfer stock between branches"""
    return StockController.transfer_stock(current_user, request.json)

# Adjust stock
@stock_bp.route('/adjust', methods=['POST'])
@login_required
@role_required(['admin', 'inventory'])
def adjust_stock(current_user):
    """Adjust stock levels"""
    return StockController.adjust_stock(current_user, request.json)

# Get stock movement history
@stock_bp.route('/history', methods=['GET'])
@login_required
def get_stock_history(current_user):
    """Get stock movement history"""
    return StockController.get_stock_history(current_user, request.args)

# Get stock movement by product
@stock_bp.route('/history/product/<int:product_id>', methods=['GET'])
@login_required
def get_stock_history_by_product(current_user, product_id):
    """Get stock movement history by product"""
    return StockController.get_stock_history_by_product(current_user, product_id, request.args)

# Get low stock alerts
@stock_bp.route('/alerts/low', methods=['GET'])
@login_required
def get_low_stock_alerts(current_user):
    """Get low stock alerts"""
    return StockController.get_low_stock_alerts(current_user)

# Get expired stock
@stock_bp.route('/alerts/expired', methods=['GET'])
@login_required
def get_expired_stock(current_user):
    """Get expired stock"""
    return StockController.get_expired_stock(current_user)

# Get overstock alerts
@stock_bp.route('/alerts/overstock', methods=['GET'])
@login_required
def get_overstock_alerts(current_user):
    """Get overstock alerts"""
    return StockController.get_overstock_alerts(current_user)

# Dismiss alert
@stock_bp.route('/alerts/<int:alert_id>/dismiss', methods=['POST'])
@login_required
def dismiss_alert(current_user, alert_id):
    """Dismiss stock alert"""
    return StockController.dismiss_alert(current_user, alert_id)

# Get stock summary
@stock_bp.route('/summary', methods=['GET'])
@login_required
def get_stock_summary(current_user):
    """Get stock summary"""
    return StockController.get_stock_summary(current_user)

# Get stock valuation
@stock_bp.route('/valuation', methods=['GET'])
@login_required
def get_stock_valuation(current_user):
    """Get stock valuation"""
    return StockController.get_stock_valuation(current_user, request.args)

# Export stock report
@stock_bp.route('/export', methods=['POST'])
@login_required
def export_stock_report(current_user):
    """Export stock report"""
    return StockController.export_stock_report(current_user, request.json)