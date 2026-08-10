from flask import Blueprint, request, jsonify
from app.controllers.admin_controller import AdminController
from app.utils.auth import login_required, admin_required

admin_bp = Blueprint('admin', __name__, url_prefix='/api/admin')

# ==================== DASHBOARD ENDPOINTS ====================

@admin_bp.route('/dashboard', methods=['GET'])
@login_required
@admin_required
def dashboard(current_user):
    """Admin dashboard"""
    return AdminController.get_dashboard(current_user)

@admin_bp.route('/overview', methods=['GET'])
@login_required
@admin_required
def overview(current_user):
    """Admin overview"""
    return AdminController.get_overview(current_user)

@admin_bp.route('/stats', methods=['GET'])
@login_required
@admin_required
def stats(current_user):
    """Admin stats"""
    return AdminController.get_stats(current_user)

@admin_bp.route('/dashboard/stats', methods=['GET'])
@login_required
@admin_required
def get_dashboard_stats(current_user):
    """Get dashboard statistics"""
    return AdminController.get_dashboard_stats(current_user)

# ==================== USER MANAGEMENT ====================

@admin_bp.route('/users', methods=['GET'])
@login_required
@admin_required
def get_users(current_user):
    """Get all users"""
    return AdminController.get_users(current_user, request.args)

@admin_bp.route('/users/<int:user_id>', methods=['GET'])
@login_required
@admin_required
def get_user(current_user, user_id):
    """Get user by ID"""
    return AdminController.get_user(current_user, user_id)

@admin_bp.route('/users/<int:user_id>', methods=['PUT'])
@login_required
@admin_required
def update_user(current_user, user_id):
    """Update user"""
    return AdminController.update_user(current_user, user_id, request.json)

@admin_bp.route('/users/<int:user_id>/activate', methods=['POST'])
@login_required
@admin_required
def activate_user(current_user, user_id):
    """Activate a user"""
    return AdminController.activate_user(current_user, user_id)

@admin_bp.route('/users/<int:user_id>/deactivate', methods=['POST'])
@login_required
@admin_required
def deactivate_user(current_user, user_id):
    """Deactivate a user"""
    return AdminController.deactivate_user(current_user, user_id)

@admin_bp.route('/users/<int:user_id>/delete', methods=['DELETE'])
@login_required
@admin_required
def delete_user(current_user, user_id):
    """Delete a user"""
    return AdminController.delete_user(current_user, user_id)

@admin_bp.route('/users/search', methods=['GET'])
@login_required
@admin_required
def search_users(current_user):
    """Search users"""
    return AdminController.search_users(current_user, request.args)

@admin_bp.route('/users/export', methods=['POST'])
@login_required
@admin_required
def export_users(current_user):
    """Export users"""
    return AdminController.export_users(current_user, request.json)

# ==================== BRANCH MANAGEMENT ====================

@admin_bp.route('/branches', methods=['GET'])
@login_required
@admin_required
def get_branches(current_user):
    """Get all branches"""
    return AdminController.get_branches(current_user, request.args)

@admin_bp.route('/branches', methods=['POST'])
@login_required
@admin_required
def create_branch(current_user):
    """Create a new branch"""
    return AdminController.create_branch(current_user, request.json)

@admin_bp.route('/branches/<int:branch_id>', methods=['PUT'])
@login_required
@admin_required
def update_branch(current_user, branch_id):
    """Update a branch"""
    return AdminController.update_branch(current_user, branch_id, request.json)

@admin_bp.route('/branches/<int:branch_id>', methods=['DELETE'])
@login_required
@admin_required
def delete_branch(current_user, branch_id):
    """Delete a branch"""
    return AdminController.delete_branch(current_user, branch_id)

@admin_bp.route('/branches/<int:branch_id>/status', methods=['PUT'])
@login_required
@admin_required
def update_branch_status(current_user, branch_id):
    """Update branch status"""
    return AdminController.update_branch_status(current_user, branch_id, request.json)

# ==================== SERVICE MANAGEMENT ====================

@admin_bp.route('/services', methods=['GET'])
@login_required
@admin_required
def get_all_services(current_user):
    """Get all services"""
    return AdminController.get_all_services(current_user, request.args)

@admin_bp.route('/services', methods=['POST'])
@login_required
@admin_required
def create_service(current_user):
    """Create a new service"""
    return AdminController.create_service(current_user, request.json)

@admin_bp.route('/services/<int:service_id>', methods=['PUT'])
@login_required
@admin_required
def update_service(current_user, service_id):
    """Update a service"""
    return AdminController.update_service(current_user, service_id, request.json)

@admin_bp.route('/services/<int:service_id>', methods=['DELETE'])
@login_required
@admin_required
def delete_service(current_user, service_id):
    """Delete a service"""
    return AdminController.delete_service(current_user, service_id)

@admin_bp.route('/services/<int:service_id>/toggle', methods=['POST'])
@login_required
@admin_required
def toggle_service(current_user, service_id):
    """Toggle service status"""
    return AdminController.toggle_service(current_user, service_id)

@admin_bp.route('/services/prices', methods=['POST'])
@login_required
@admin_required
def set_service_prices(current_user):
    """Set service prices"""
    return AdminController.set_service_prices(current_user, request.json)

# ==================== CATEGORY MANAGEMENT ====================

@admin_bp.route('/categories', methods=['GET'])
@login_required
@admin_required
def get_categories(current_user):
    """Get all categories"""
    return AdminController.get_categories(current_user, request.args)

@admin_bp.route('/categories', methods=['POST'])
@login_required
@admin_required
def create_category(current_user):
    """Create a new category"""
    return AdminController.create_category(current_user, request.json)

@admin_bp.route('/categories/<int:category_id>', methods=['PUT'])
@login_required
@admin_required
def update_category(current_user, category_id):
    """Update a category"""
    return AdminController.update_category(current_user, category_id, request.json)

@admin_bp.route('/categories/<int:category_id>', methods=['DELETE'])
@login_required
@admin_required
def delete_category(current_user, category_id):
    """Delete a category"""
    return AdminController.delete_category(current_user, category_id)

# ==================== PRODUCT MANAGEMENT ====================

@admin_bp.route('/products', methods=['GET'])
@login_required
@admin_required
def get_products(current_user):
    """Get all products"""
    return AdminController.get_products(current_user, request.args)

@admin_bp.route('/products', methods=['POST'])
@login_required
@admin_required
def create_product(current_user):
    """Create a new product"""
    return AdminController.create_product(current_user, request.json)

@admin_bp.route('/products/<int:product_id>', methods=['PUT'])
@login_required
@admin_required
def update_product(current_user, product_id):
    """Update a product"""
    return AdminController.update_product(current_user, product_id, request.json)

@admin_bp.route('/products/<int:product_id>', methods=['DELETE'])
@login_required
@admin_required
def delete_product(current_user, product_id):
    """Delete a product"""
    return AdminController.delete_product(current_user, product_id)

# ==================== APPOINTMENT MANAGEMENT ====================

@admin_bp.route('/appointments', methods=['GET'])
@login_required
@admin_required
def get_all_appointments(current_user):
    """Get all appointments"""
    return AdminController.get_all_appointments(current_user, request.args)

@admin_bp.route('/appointments/<int:appointment_id>', methods=['GET'])
@login_required
@admin_required
def get_appointment_details(current_user, appointment_id):
    """Get appointment details"""
    return AdminController.get_appointment_details(current_user, appointment_id)

@admin_bp.route('/appointments/<int:appointment_id>', methods=['DELETE'])
@login_required
@admin_required
def delete_appointment(current_user, appointment_id):
    """Delete an appointment"""
    return AdminController.delete_appointment(current_user, appointment_id)

# ==================== APPROVAL MANAGEMENT ====================

@admin_bp.route('/approvals/pending', methods=['GET'])
@login_required
@admin_required
def get_pending_approvals(current_user):
    """Get all pending approvals"""
    return AdminController.get_pending_approvals(current_user)

@admin_bp.route('/approvals/manager', methods=['GET'])
@login_required
@admin_required
def get_manager_approvals(current_user):
    """Get pending manager approvals"""
    return AdminController.get_manager_approvals(current_user)

@admin_bp.route('/approvals/manager/<int:user_id>', methods=['POST'])
@login_required
@admin_required
def approve_manager(current_user, user_id):
    """Approve a manager"""
    return AdminController.approve_manager(current_user, user_id)

@admin_bp.route('/approvals/stylist', methods=['GET'])
@login_required
@admin_required
def get_stylist_approvals(current_user):
    """Get pending stylist approvals"""
    return AdminController.get_stylist_approvals(current_user)

@admin_bp.route('/approvals/stylist/<int:user_id>', methods=['POST'])
@login_required
@admin_required
def approve_stylist(current_user, user_id):
    """Approve a stylist"""
    return AdminController.approve_stylist(current_user, user_id)

@admin_bp.route('/approvals/finance', methods=['GET'])
@login_required
@admin_required
def get_finance_approvals(current_user):
    """Get pending finance approvals"""
    return AdminController.get_finance_approvals(current_user)

@admin_bp.route('/approvals/finance/<int:user_id>', methods=['POST'])
@login_required
@admin_required
def approve_finance(current_user, user_id):
    """Approve a finance officer"""
    return AdminController.approve_finance(current_user, user_id)

@admin_bp.route('/approvals/inventory', methods=['GET'])
@login_required
@admin_required
def get_inventory_approvals(current_user):
    """Get pending inventory approvals"""
    return AdminController.get_inventory_approvals(current_user)

@admin_bp.route('/approvals/inventory/<int:user_id>', methods=['POST'])
@login_required
@admin_required
def approve_inventory(current_user, user_id):
    """Approve an inventory officer"""
    return AdminController.approve_inventory(current_user, user_id)

@admin_bp.route('/approvals/receptionist', methods=['GET'])
@login_required
@admin_required
def get_receptionist_approvals(current_user):
    """Get pending receptionist approvals"""
    return AdminController.get_receptionist_approvals(current_user)

@admin_bp.route('/approvals/receptionist/<int:user_id>', methods=['POST'])
@login_required
@admin_required
def approve_receptionist(current_user, user_id):
    """Approve a receptionist"""
    return AdminController.approve_receptionist(current_user, user_id)

@admin_bp.route('/approvals/reject/<int:user_id>', methods=['POST'])
@login_required
@admin_required
def reject_user(current_user, user_id):
    """Reject a user registration"""
    return AdminController.reject_user(current_user, user_id, request.json)

# ==================== REPORT ENDPOINTS ====================

@admin_bp.route('/reports/sales', methods=['GET'])
@login_required
@admin_required
def get_sales_reports(current_user):
    """Get sales reports"""
    return AdminController.get_sales_reports(current_user, request.args)

@admin_bp.route('/reports/revenue', methods=['GET'])
@login_required
@admin_required
def get_revenue_reports(current_user):
    """Get revenue reports"""
    return AdminController.get_revenue_reports(current_user, request.args)

@admin_bp.route('/reports/appointments', methods=['GET'])
@login_required
@admin_required
def get_appointment_reports(current_user):
    """Get appointment reports"""
    return AdminController.get_appointment_reports(current_user, request.args)

@admin_bp.route('/reports/inventory', methods=['GET'])
@login_required
@admin_required
def get_inventory_reports(current_user):
    """Get inventory reports"""
    return AdminController.get_inventory_reports(current_user, request.args)

@admin_bp.route('/reports/staff', methods=['GET'])
@login_required
@admin_required
def get_staff_reports(current_user):
    """Get staff reports"""
    return AdminController.get_staff_reports(current_user, request.args)

@admin_bp.route('/reports/customer', methods=['GET'])
@login_required
@admin_required
def get_customer_reports(current_user):
    """Get customer reports"""
    return AdminController.get_customer_reports(current_user, request.args)

@admin_bp.route('/reports/comprehensive', methods=['GET'])
@login_required
@admin_required
def get_comprehensive_report(current_user):
    """Get comprehensive report"""
    return AdminController.get_comprehensive_report(current_user, request.args)

@admin_bp.route('/reports/export', methods=['POST'])
@login_required
@admin_required
def export_admin_report(current_user):
    """Export admin report"""
    return AdminController.export_admin_report(current_user, request.json)

# ==================== ROLE & PERMISSION MANAGEMENT ====================

@admin_bp.route('/roles', methods=['GET'])
@login_required
@admin_required
def get_roles(current_user):
    """Get all roles"""
    return AdminController.get_roles(current_user)

@admin_bp.route('/roles', methods=['POST'])
@login_required
@admin_required
def create_role(current_user):
    """Create a new role"""
    return AdminController.create_role(current_user, request.json)

@admin_bp.route('/roles/<int:role_id>', methods=['PUT'])
@login_required
@admin_required
def update_role(current_user, role_id):
    """Update a role"""
    return AdminController.update_role(current_user, role_id, request.json)

@admin_bp.route('/roles/<int:role_id>', methods=['DELETE'])
@login_required
@admin_required
def delete_role(current_user, role_id):
    """Delete a role"""
    return AdminController.delete_role(current_user, role_id)

@admin_bp.route('/roles/<int:role_id>/permissions', methods=['PUT'])
@login_required
@admin_required
def update_role_permissions(current_user, role_id):
    """Update role permissions"""
    return AdminController.update_role_permissions(current_user, role_id, request.json)

@admin_bp.route('/permissions', methods=['GET'])
@login_required
@admin_required
def get_permissions(current_user):
    """Get all permissions"""
    return AdminController.get_permissions(current_user)

# ==================== SYSTEM SETTINGS ====================

@admin_bp.route('/settings', methods=['GET'])
@login_required
@admin_required
def get_system_settings(current_user):
    """Get system settings"""
    return AdminController.get_system_settings()

@admin_bp.route('/settings', methods=['PUT'])
@login_required
@admin_required
def update_system_settings(current_user):
    """Update system settings"""
    return AdminController.update_system_settings(current_user, request.json)

@admin_bp.route('/settings/backup', methods=['POST'])
@login_required
@admin_required
def backup_database(current_user):
    """Backup database"""
    return AdminController.backup_database(current_user)

@admin_bp.route('/settings/restore', methods=['POST'])
@login_required
@admin_required
def restore_database(current_user):
    """Restore database"""
    return AdminController.restore_database(current_user, request.files)

@admin_bp.route('/settings/logs', methods=['GET'])
@login_required
@admin_required
def get_system_logs(current_user):
    """Get system logs"""
    return AdminController.get_system_logs(current_user, request.args)

@admin_bp.route('/settings/cache/clear', methods=['POST'])
@login_required
@admin_required
def clear_cache(current_user):
    """Clear system cache"""
    return AdminController.clear_cache(current_user)

# ==================== MAINTENANCE ====================

@admin_bp.route('/maintenance/status', methods=['GET'])
@login_required
@admin_required
def get_maintenance_status(current_user):
    """Get maintenance status"""
    return AdminController.get_maintenance_status()

@admin_bp.route('/maintenance/toggle', methods=['POST'])
@login_required
@admin_required
def toggle_maintenance(current_user):
    """Toggle maintenance mode"""
    return AdminController.toggle_maintenance(current_user, request.json)

@admin_bp.route('/maintenance/cleanup', methods=['POST'])
@login_required
@admin_required
def system_cleanup(current_user):
    """System cleanup"""
    return AdminController.system_cleanup(current_user)

# ==================== AUDIT LOGS ====================

@admin_bp.route('/audit-logs', methods=['GET'])
@login_required
@admin_required
def get_audit_logs(current_user):
    """Get audit logs"""
    return AdminController.get_audit_logs(current_user, request.args)

@admin_bp.route('/audit-logs/<int:log_id>', methods=['GET'])
@login_required
@admin_required
def get_audit_log(current_user, log_id):
    """Get audit log details"""
    return AdminController.get_audit_log(current_user, log_id)

@admin_bp.route('/audit-logs/export', methods=['POST'])
@login_required
@admin_required
def export_audit_logs(current_user):
    """Export audit logs"""
    return AdminController.export_audit_logs(current_user, request.json)

# ==================== PRICE MANAGEMENT ====================

@admin_bp.route('/prices', methods=['GET'])
@login_required
@admin_required
def get_prices(current_user):
    """Get all prices"""
    return AdminController.get_prices(current_user, request.args)

@admin_bp.route('/prices/<int:price_id>', methods=['GET'])
@login_required
@admin_required
def get_price(current_user, price_id):
    """Get price by ID"""
    return AdminController.get_price(current_user, price_id)

@admin_bp.route('/prices', methods=['POST'])
@login_required
@admin_required
def create_price(current_user):
    """Create a new price"""
    return AdminController.create_price(current_user, request.json)

@admin_bp.route('/prices/<int:price_id>', methods=['PUT'])
@login_required
@admin_required
def update_price(current_user, price_id):
    """Update a price"""
    return AdminController.update_price(current_user, price_id, request.json)

@admin_bp.route('/prices/<int:price_id>', methods=['DELETE'])
@login_required
@admin_required
def delete_price(current_user, price_id):
    """Delete a price"""
    return AdminController.delete_price(current_user, price_id)

@admin_bp.route('/prices/service/<int:service_id>', methods=['GET'])
@login_required
@admin_required
def get_prices_by_service(current_user, service_id):
    """Get prices by service"""
    return AdminController.get_prices_by_service(current_user, service_id)

@admin_bp.route('/prices/bulk', methods=['POST'])
@login_required
@admin_required
def bulk_update_prices(current_user):
    """Bulk update prices"""
    return AdminController.bulk_update_prices(current_user, request.json)

@admin_bp.route('/prices/history/<int:service_id>', methods=['GET'])
@login_required
@admin_required
def get_price_history(current_user, service_id):
    """Get price history for a service"""
    return AdminController.get_price_history(current_user, service_id)

# ==================== STYLIST MANAGEMENT ====================

@admin_bp.route('/stylists', methods=['GET'])
@login_required
@admin_required
def get_stylists(current_user):
    """Get all stylists"""
    return AdminController.get_stylists(current_user, request.args)

@admin_bp.route('/stylists/<int:stylist_id>', methods=['GET'])
@login_required
@admin_required
def get_stylist(current_user, stylist_id):
    """Get stylist by ID"""
    return AdminController.get_stylist(current_user, stylist_id)

@admin_bp.route('/stylists/<int:stylist_id>', methods=['PUT'])
@login_required
@admin_required
def update_stylist(current_user, stylist_id):
    """Update a stylist"""
    return AdminController.update_stylist(current_user, stylist_id, request.json)

@admin_bp.route('/stylists/<int:stylist_id>/toggle', methods=['POST'])
@login_required
@admin_required
def toggle_stylist(current_user, stylist_id):
    """Toggle stylist status"""
    return AdminController.toggle_stylist(current_user, stylist_id)
