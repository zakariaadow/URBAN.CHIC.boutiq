from flask import request
from app.utils.response import APIResponse
from app.services.admin_service import AdminService
from app.services.price_service import PriceService
import logging

logger = logging.getLogger(__name__)

class AdminController:

    # ==================== DASHBOARD ====================
    @staticmethod
    def get_dashboard(current_user):
        """Get admin dashboard data"""
        try:
            result, status_code = AdminService.get_dashboard(current_user)
            return APIResponse.success(result, 'Dashboard data retrieved successfully', status_code)
        except Exception as e:
            logger.error(f"Error in get_dashboard: {str(e)}")
            return APIResponse.server_error(str(e))

    @staticmethod
    def get_overview(current_user):
        """Get admin overview"""
        try:
            result, status_code = AdminService.get_overview(current_user)
            return APIResponse.success(result, 'Overview retrieved successfully', status_code)
        except Exception as e:
            logger.error(f"Error in get_overview: {str(e)}")
            return APIResponse.server_error(str(e))

    @staticmethod
    def get_stats(current_user):
        """Get admin stats"""
        try:
            result, status_code = AdminService.get_stats(current_user)
            return APIResponse.success(result, 'Stats retrieved successfully', status_code)
        except Exception as e:
            logger.error(f"Error in get_stats: {str(e)}")
            return APIResponse.server_error(str(e))

    @staticmethod
    def get_dashboard_stats(current_user):
        """Get dashboard statistics"""
        try:
            result, status_code = AdminService.get_dashboard_stats(current_user)
            return APIResponse.success(result, 'Dashboard statistics retrieved successfully', status_code)
        except Exception as e:
            logger.error(f"Error in get_dashboard_stats: {str(e)}")
            return APIResponse.server_error(str(e))

    # ==================== USER MANAGEMENT ====================
    @staticmethod
    def get_users(current_user, params):
        """Get all users with their roles"""
        try:
            result, status_code = AdminService.get_users(params)
            
            # If we need to ensure roles are formatted cleanly for frontend
            if status_code == 200 and isinstance(result, list):
                formatted_users = []
                for user in result:
                    # Safely extract role name
                    role_name = None
                    if user.get('role'):
                        role_name = user['role'].get('name') if isinstance(user['role'], dict) else str(user['role'])
                    
                    formatted_users.append({
                        'id': user.get('id'),
                        'username': user.get('username'),
                        'email': user.get('email'),
                        'full_name': user.get('full_name') or f"{user.get('first_name', '')} {user.get('last_name', '')}".strip(),
                        'role': role_name,
                        'is_active': user.get('is_active', True),
                        'is_approved': user.get('is_approved', True),
                        'created_at': user.get('created_at'),
                        'last_login': user.get('last_login'),
                        'phone': user.get('phone')
                    })
                return APIResponse.success(formatted_users, 'Users retrieved successfully', 200)
            
            return APIResponse.success(result, 'Users retrieved successfully', status_code)
            
        except Exception as e:
            logger.error(f"Error in get_users: {str(e)}")
            return APIResponse.server_error(str(e))

    @staticmethod
    def get_user(current_user, user_id):
        """Get user details"""
        try:
            result, status_code = AdminService.get_user(current_user, user_id)
            return APIResponse.success(result, 'User details retrieved successfully', status_code)
        except Exception as e:
            logger.error(f"Error in get_user: {str(e)}")
            return APIResponse.server_error(str(e))

    @staticmethod
    def update_user(current_user, user_id, data):
        """Update user"""
        try:
            result, status_code = AdminService.update_user(current_user, user_id, data)
            return APIResponse.success(result, 'User updated successfully', status_code)
        except Exception as e:
            logger.error(f"Error in update_user: {str(e)}")
            return APIResponse.server_error(str(e))

    @staticmethod
    def activate_user(current_user, user_id):
        """Activate a user"""
        try:
            result, status_code = AdminService.activate_user(current_user, user_id)
            return APIResponse.success(result, 'User activated successfully', status_code)
        except Exception as e:
            logger.error(f"Error in activate_user: {str(e)}")
            return APIResponse.server_error(str(e))

    @staticmethod
    def deactivate_user(current_user, user_id):
        """Deactivate a user"""
        try:
            result, status_code = AdminService.deactivate_user(current_user, user_id)
            return APIResponse.success(result, 'User deactivated successfully', status_code)
        except Exception as e:
            logger.error(f"Error in deactivate_user: {str(e)}")
            return APIResponse.server_error(str(e))

    @staticmethod
    def delete_user(current_user, user_id):
        """Delete a user"""
        try:
            result, status_code = AdminService.delete_user(current_user, user_id)
            return APIResponse.success(None, result.get('message', 'User deleted'), status_code)
        except Exception as e:
            logger.error(f"Error in delete_user: {str(e)}")
            return APIResponse.server_error(str(e))

    @staticmethod
    def search_users(current_user, params):
        """Search users"""
        try:
            result, status_code = AdminService.search_users(params)
            return APIResponse.success(result, 'Users found successfully', status_code)
        except Exception as e:
            logger.error(f"Error in search_users: {str(e)}")
            return APIResponse.server_error(str(e))

    @staticmethod
    def export_users(current_user, data):
        """Export users"""
        try:
            result, status_code = AdminService.export_users(data)
            return APIResponse.success(result, 'Users exported successfully', status_code)
        except Exception as e:
            logger.error(f"Error in export_users: {str(e)}")
            return APIResponse.server_error(str(e))

    # ==================== ROLE & PERMISSION MANAGEMENT ====================
    @staticmethod
    def get_roles(current_user):
        """Get all roles"""
        try:
            result, status_code = AdminService.get_roles()
            return APIResponse.success(result, 'Roles retrieved successfully', status_code)
        except Exception as e:
            logger.error(f"Error in get_roles: {str(e)}")
            return APIResponse.server_error(str(e))

    @staticmethod
    def create_role(current_user, data):
        """Create a new role"""
        try:
            result, status_code = AdminService.create_role(current_user, data)
            return APIResponse.success(result, 'Role created successfully', status_code)
        except Exception as e:
            logger.error(f"Error in create_role: {str(e)}")
            return APIResponse.server_error(str(e))

    @staticmethod
    def update_role(current_user, role_id, data):
        """Update a role"""
        try:
            result, status_code = AdminService.update_role(current_user, role_id, data)
            return APIResponse.success(result, 'Role updated successfully', status_code)
        except Exception as e:
            logger.error(f"Error in update_role: {str(e)}")
            return APIResponse.server_error(str(e))

    @staticmethod
    def delete_role(current_user, role_id):
        """Delete a role"""
        try:
            result, status_code = AdminService.delete_role(current_user, role_id)
            return APIResponse.success(None, result.get('message', 'Role deleted'), status_code)
        except Exception as e:
            logger.error(f"Error in delete_role: {str(e)}")
            return APIResponse.server_error(str(e))

    @staticmethod
    def update_role_permissions(current_user, role_id, data):
        """Update role permissions"""
        try:
            result, status_code = AdminService.update_role_permissions(current_user, role_id, data)
            return APIResponse.success(result, 'Role permissions updated successfully', status_code)
        except Exception as e:
            logger.error(f"Error in update_role_permissions: {str(e)}")
            return APIResponse.server_error(str(e))

    @staticmethod
    def get_permissions(current_user):
        """Get all permissions"""
        try:
            result, status_code = AdminService.get_permissions()
            return APIResponse.success(result, 'Permissions retrieved successfully', status_code)
        except Exception as e:
            logger.error(f"Error in get_permissions: {str(e)}")
            return APIResponse.server_error(str(e))

    # ==================== APPROVAL MANAGEMENT ====================
    @staticmethod
    def get_pending_approvals(current_user):
        """Get all pending approvals"""
        try:
            result, status_code = AdminService.get_pending_approvals(current_user)
            return APIResponse.success(result, 'Pending approvals retrieved successfully', status_code)
        except Exception as e:
            logger.error(f"Error in get_pending_approvals: {str(e)}")
            return APIResponse.server_error(str(e))

    @staticmethod
    def get_manager_approvals(current_user):
        """Get pending manager approvals"""
        try:
            result, status_code = AdminService.get_manager_approvals(current_user)
            return APIResponse.success(result, 'Manager approvals retrieved successfully', status_code)
        except Exception as e:
            logger.error(f"Error in get_manager_approvals: {str(e)}")
            return APIResponse.server_error(str(e))

    @staticmethod
    def approve_manager(current_user, user_id):
        """Approve a manager"""
        try:
            result, status_code = AdminService.approve_manager(current_user, user_id)
            return APIResponse.success(result, 'Manager approved successfully', status_code)
        except Exception as e:
            logger.error(f"Error in approve_manager: {str(e)}")
            return APIResponse.server_error(str(e))

    @staticmethod
    def get_stylist_approvals(current_user):
        """Get pending stylist approvals"""
        try:
            result, status_code = AdminService.get_stylist_approvals(current_user)
            return APIResponse.success(result, 'Stylist approvals retrieved successfully', status_code)
        except Exception as e:
            logger.error(f"Error in get_stylist_approvals: {str(e)}")
            return APIResponse.server_error(str(e))

    @staticmethod
    def approve_stylist(current_user, user_id):
        """Approve a stylist"""
        try:
            result, status_code = AdminService.approve_stylist(current_user, user_id)
            return APIResponse.success(result, 'Stylist approved successfully', status_code)
        except Exception as e:
            logger.error(f"Error in approve_stylist: {str(e)}")
            return APIResponse.server_error(str(e))

    @staticmethod
    def get_finance_approvals(current_user):
        """Get pending finance approvals"""
        try:
            result, status_code = AdminService.get_finance_approvals(current_user)
            return APIResponse.success(result, 'Finance approvals retrieved successfully', status_code)
        except Exception as e:
            logger.error(f"Error in get_finance_approvals: {str(e)}")
            return APIResponse.server_error(str(e))

    @staticmethod
    def approve_finance(current_user, user_id):
        """Approve a finance officer"""
        try:
            result, status_code = AdminService.approve_finance(current_user, user_id)
            return APIResponse.success(result, 'Finance officer approved successfully', status_code)
        except Exception as e:
            logger.error(f"Error in approve_finance: {str(e)}")
            return APIResponse.server_error(str(e))

    @staticmethod
    def get_inventory_approvals(current_user):
        """Get pending inventory approvals"""
        try:
            result, status_code = AdminService.get_inventory_approvals(current_user)
            return APIResponse.success(result, 'Inventory approvals retrieved successfully', status_code)
        except Exception as e:
            logger.error(f"Error in get_inventory_approvals: {str(e)}")
            return APIResponse.server_error(str(e))

    @staticmethod
    def approve_inventory(current_user, user_id):
        """Approve an inventory officer"""
        try:
            result, status_code = AdminService.approve_inventory(current_user, user_id)
            return APIResponse.success(result, 'Inventory officer approved successfully', status_code)
        except Exception as e:
            logger.error(f"Error in approve_inventory: {str(e)}")
            return APIResponse.server_error(str(e))

    @staticmethod
    def get_receptionist_approvals(current_user):
        """Get pending receptionist approvals"""
        try:
            result, status_code = AdminService.get_receptionist_approvals(current_user)
            return APIResponse.success(result, 'Receptionist approvals retrieved successfully', status_code)
        except Exception as e:
            logger.error(f"Error in get_receptionist_approvals: {str(e)}")
            return APIResponse.server_error(str(e))

    @staticmethod
    def approve_receptionist(current_user, user_id):
        """Approve a receptionist"""
        try:
            result, status_code = AdminService.approve_receptionist(current_user, user_id)
            return APIResponse.success(result, 'Receptionist approved successfully', status_code)
        except Exception as e:
            logger.error(f"Error in approve_receptionist: {str(e)}")
            return APIResponse.server_error(str(e))

    @staticmethod
    def reject_user(current_user, user_id, data):
        """Reject a user registration"""
        try:
            result, status_code = AdminService.reject_user(current_user, user_id, data)
            return APIResponse.success(result, 'User rejected successfully', status_code)
        except Exception as e:
            logger.error(f"Error in reject_user: {str(e)}")
            return APIResponse.server_error(str(e))

    # ==================== BRANCH MANAGEMENT ====================
    @staticmethod
    def get_branches(current_user, params):
        """Get all branches"""
        try:
            result, status_code = AdminService.get_branches(params)
            return APIResponse.success(result, 'Branches retrieved successfully', status_code)
        except Exception as e:
            logger.error(f"Error in get_branches: {str(e)}")
            return APIResponse.server_error(str(e))

    @staticmethod
    def create_branch(current_user, data):
        """Create a new branch"""
        try:
            result, status_code = AdminService.create_branch(current_user, data)
            return APIResponse.success(result, 'Branch created successfully', status_code)
        except Exception as e:
            logger.error(f"Error in create_branch: {str(e)}")
            return APIResponse.server_error(str(e))

    @staticmethod
    def update_branch(current_user, branch_id, data):
        """Update a branch"""
        try:
            result, status_code = AdminService.update_branch(current_user, branch_id, data)
            return APIResponse.success(result, 'Branch updated successfully', status_code)
        except Exception as e:
            logger.error(f"Error in update_branch: {str(e)}")
            return APIResponse.server_error(str(e))

    @staticmethod
    def delete_branch(current_user, branch_id):
        """Delete a branch"""
        try:
            result, status_code = AdminService.delete_branch(current_user, branch_id)
            return APIResponse.success(None, result.get('message', 'Branch deleted'), status_code)
        except Exception as e:
            logger.error(f"Error in delete_branch: {str(e)}")
            return APIResponse.server_error(str(e))

    @staticmethod
    def update_branch_status(current_user, branch_id, data):
        """Update branch status"""
        try:
            result, status_code = AdminService.update_branch_status(current_user, branch_id, data)
            return APIResponse.success(result, 'Branch status updated successfully', status_code)
        except Exception as e:
            logger.error(f"Error in update_branch_status: {str(e)}")
            return APIResponse.server_error(str(e))

    # ==================== SERVICE MANAGEMENT ====================
    @staticmethod
    def get_all_services(current_user, params):
        """Get all services"""
        try:
            result, status_code = AdminService.get_all_services(params)
            return APIResponse.success(result, 'Services retrieved successfully', status_code)
        except Exception as e:
            logger.error(f"Error in get_all_services: {str(e)}")
            return APIResponse.server_error(str(e))

    @staticmethod
    def create_service(current_user, data):
        """Create a new service"""
        try:
            result, status_code = AdminService.create_service(current_user, data)
            return APIResponse.success(result, 'Service created successfully', status_code)
        except Exception as e:
            logger.error(f"Error in create_service: {str(e)}")
            return APIResponse.server_error(str(e))

    @staticmethod
    def update_service(current_user, service_id, data):
        """Update a service"""
        try:
            result, status_code = AdminService.update_service(current_user, service_id, data)
            return APIResponse.success(result, 'Service updated successfully', status_code)
        except Exception as e:
            logger.error(f"Error in update_service: {str(e)}")
            return APIResponse.server_error(str(e))

    @staticmethod
    def delete_service(current_user, service_id):
        """Delete a service"""
        try:
            result, status_code = AdminService.delete_service(current_user, service_id)
            return APIResponse.success(None, result.get('message', 'Service deleted'), status_code)
        except Exception as e:
            logger.error(f"Error in delete_service: {str(e)}")
            return APIResponse.server_error(str(e))

    @staticmethod
    def set_service_prices(current_user, data):
        """Set service prices"""
        try:
            result, status_code = AdminService.set_service_prices(current_user, data)
            return APIResponse.success(result, 'Service prices set successfully', status_code)
        except Exception as e:
            logger.error(f"Error in set_service_prices: {str(e)}")
            return APIResponse.server_error(str(e))

    @staticmethod
    def toggle_service(current_user, service_id):
        """Toggle service status"""
        try:
            result, status_code = AdminService.toggle_service(current_user, service_id)
            return APIResponse.success(result, 'Service toggled successfully', status_code)
        except Exception as e:
            logger.error(f"Error in toggle_service: {str(e)}")
            return APIResponse.server_error(str(e))

    # ==================== CATEGORY MANAGEMENT ====================
    @staticmethod
    def get_categories(current_user, params):
        """Get all categories"""
        try:
            result, status_code = AdminService.get_categories(params)
            return APIResponse.success(result, 'Categories retrieved successfully', status_code)
        except Exception as e:
            logger.error(f"Error in get_categories: {str(e)}")
            return APIResponse.server_error(str(e))

    @staticmethod
    def create_category(current_user, data):
        """Create a new category"""
        try:
            result, status_code = AdminService.create_category(current_user, data)
            return APIResponse.success(result, 'Category created successfully', status_code)
        except Exception as e:
            logger.error(f"Error in create_category: {str(e)}")
            return APIResponse.server_error(str(e))

    @staticmethod
    def update_category(current_user, category_id, data):
        """Update a category"""
        try:
            result, status_code = AdminService.update_category(current_user, category_id, data)
            return APIResponse.success(result, 'Category updated successfully', status_code)
        except Exception as e:
            logger.error(f"Error in update_category: {str(e)}")
            return APIResponse.server_error(str(e))

    @staticmethod
    def delete_category(current_user, category_id):
        """Delete a category"""
        try:
            result, status_code = AdminService.delete_category(current_user, category_id)
            return APIResponse.success(None, result.get('message', 'Category deleted'), status_code)
        except Exception as e:
            logger.error(f"Error in delete_category: {str(e)}")
            return APIResponse.server_error(str(e))

    # ==================== PRODUCT MANAGEMENT ====================
    @staticmethod
    def get_products(current_user, params):
        """Get all products"""
        try:
            result, status_code = AdminService.get_products(params)
            return APIResponse.success(result, 'Products retrieved successfully', status_code)
        except Exception as e:
            logger.error(f"Error in get_products: {str(e)}")
            return APIResponse.server_error(str(e))

    @staticmethod
    def create_product(current_user, data):
        """Create a new product"""
        try:
            result, status_code = AdminService.create_product(current_user, data)
            return APIResponse.success(result, 'Product created successfully', status_code)
        except Exception as e:
            logger.error(f"Error in create_product: {str(e)}")
            return APIResponse.server_error(str(e))

    @staticmethod
    def update_product(current_user, product_id, data):
        """Update a product"""
        try:
            result, status_code = AdminService.update_product(current_user, product_id, data)
            return APIResponse.success(result, 'Product updated successfully', status_code)
        except Exception as e:
            logger.error(f"Error in update_product: {str(e)}")
            return APIResponse.server_error(str(e))

    @staticmethod
    def delete_product(current_user, product_id):
        """Delete a product"""
        try:
            result, status_code = AdminService.delete_product(current_user, product_id)
            return APIResponse.success(None, result.get('message', 'Product deleted'), status_code)
        except Exception as e:
            logger.error(f"Error in delete_product: {str(e)}")
            return APIResponse.server_error(str(e))

    # ==================== APPOINTMENT MANAGEMENT ====================
    @staticmethod
    def get_all_appointments(current_user, params):
        """Get all appointments"""
        try:
            result, status_code = AdminService.get_all_appointments(params)
            return APIResponse.success(result, 'Appointments retrieved successfully', status_code)
        except Exception as e:
            logger.error(f"Error in get_all_appointments: {str(e)}")
            return APIResponse.server_error(str(e))

    @staticmethod
    def get_appointment_details(current_user, appointment_id):
        """Get appointment details"""
        try:
            result, status_code = AdminService.get_appointment_details(current_user, appointment_id)
            return APIResponse.success(result, 'Appointment details retrieved successfully', status_code)
        except Exception as e:
            logger.error(f"Error in get_appointment_details: {str(e)}")
            return APIResponse.server_error(str(e))

    @staticmethod
    def delete_appointment(current_user, appointment_id):
        """Delete an appointment"""
        try:
            result, status_code = AdminService.delete_appointment(current_user, appointment_id)
            return APIResponse.success(None, result.get('message', 'Appointment deleted'), status_code)
        except Exception as e:
            logger.error(f"Error in delete_appointment: {str(e)}")
            return APIResponse.server_error(str(e))

    # ==================== REPORTS ====================
    @staticmethod
    def get_sales_reports(current_user, params):
        """Get sales reports"""
        try:
            result, status_code = AdminService.get_sales_reports(params)
            return APIResponse.success(result, 'Sales reports retrieved successfully', status_code)
        except Exception as e:
            logger.error(f"Error in get_sales_reports: {str(e)}")
            return APIResponse.server_error(str(e))

    @staticmethod
    def get_revenue_reports(current_user, params):
        """Get revenue reports"""
        try:
            result, status_code = AdminService.get_revenue_reports(params)
            return APIResponse.success(result, 'Revenue reports retrieved successfully', status_code)
        except Exception as e:
            logger.error(f"Error in get_revenue_reports: {str(e)}")
            return APIResponse.server_error(str(e))

    @staticmethod
    def get_appointment_reports(current_user, params):
        """Get appointment reports"""
        try:
            result, status_code = AdminService.get_appointment_reports(params)
            return APIResponse.success(result, 'Appointment reports retrieved successfully', status_code)
        except Exception as e:
            logger.error(f"Error in get_appointment_reports: {str(e)}")
            return APIResponse.server_error(str(e))

    @staticmethod
    def get_inventory_reports(current_user, params):
        """Get inventory reports"""
        try:
            result, status_code = AdminService.get_inventory_reports(params)
            return APIResponse.success(result, 'Inventory reports retrieved successfully', status_code)
        except Exception as e:
            logger.error(f"Error in get_inventory_reports: {str(e)}")
            return APIResponse.server_error(str(e))

    @staticmethod
    def get_staff_reports(current_user, params):
        """Get staff reports"""
        try:
            result, status_code = AdminService.get_staff_reports(params)
            return APIResponse.success(result, 'Staff reports retrieved successfully', status_code)
        except Exception as e:
            logger.error(f"Error in get_staff_reports: {str(e)}")
            return APIResponse.server_error(str(e))

    @staticmethod
    def get_customer_reports(current_user, params):
        """Get customer reports"""
        try:
            result, status_code = AdminService.get_customer_reports(params)
            return APIResponse.success(result, 'Customer reports retrieved successfully', status_code)
        except Exception as e:
            logger.error(f"Error in get_customer_reports: {str(e)}")
            return APIResponse.server_error(str(e))

    @staticmethod
    def get_comprehensive_report(current_user, params):
        """Get comprehensive system report"""
        try:
            result, status_code = AdminService.get_comprehensive_report(current_user, params)
            return APIResponse.success(result, 'Comprehensive report retrieved successfully', status_code)
        except Exception as e:
            logger.error(f"Error in get_comprehensive_report: {str(e)}")
            return APIResponse.server_error(str(e))

    @staticmethod
    def export_admin_report(current_user, data):
        """Export admin report"""
        try:
            result, status_code = AdminService.export_admin_report(data)
            return APIResponse.success(result, 'Report exported successfully', status_code)
        except Exception as e:
            logger.error(f"Error in export_admin_report: {str(e)}")
            return APIResponse.server_error(str(e))

    # ==================== SYSTEM SETTINGS ====================
    @staticmethod
    def get_system_settings(current_user):
        """Get system settings"""
        try:
            result, status_code = AdminService.get_system_settings()
            return APIResponse.success(result, 'System settings retrieved successfully', status_code)
        except Exception as e:
            logger.error(f"Error in get_system_settings: {str(e)}")
            return APIResponse.server_error(str(e))

    @staticmethod
    def update_system_settings(current_user, data):
        """Update system settings"""
        try:
            result, status_code = AdminService.update_system_settings(current_user, data)
            return APIResponse.success(result, 'System settings updated successfully', status_code)
        except Exception as e:
            logger.error(f"Error in update_system_settings: {str(e)}")
            return APIResponse.server_error(str(e))

    @staticmethod
    def backup_database(current_user):
        """Backup database"""
        try:
            result, status_code = AdminService.backup_database(current_user)
            return APIResponse.success(result, 'Database backup created successfully', status_code)
        except Exception as e:
            logger.error(f"Error in backup_database: {str(e)}")
            return APIResponse.server_error(str(e))

    @staticmethod
    def restore_database(current_user, files):
        """Restore database"""
        try:
            result, status_code = AdminService.restore_database(current_user, files)
            return APIResponse.success(result, 'Database restored successfully', status_code)
        except Exception as e:
            logger.error(f"Error in restore_database: {str(e)}")
            return APIResponse.server_error(str(e))

    @staticmethod
    def get_system_logs(current_user, params):
        """Get system logs"""
        try:
            result, status_code = AdminService.get_system_logs(params)
            return APIResponse.success(result, 'System logs retrieved successfully', status_code)
        except Exception as e:
            logger.error(f"Error in get_system_logs: {str(e)}")
            return APIResponse.server_error(str(e))

    @staticmethod
    def clear_cache(current_user):
        """Clear system cache"""
        try:
            result, status_code = AdminService.clear_cache(current_user)
            return APIResponse.success(None, result.get('message', 'Cache cleared'), status_code)
        except Exception as e:
            logger.error(f"Error in clear_cache: {str(e)}")
            return APIResponse.server_error(str(e))

    # ==================== MAINTENANCE ====================
    @staticmethod
    def get_maintenance_status(current_user):
        """Get maintenance status"""
        try:
            result, status_code = AdminService.get_maintenance_status()
            return APIResponse.success(result, 'Maintenance status retrieved successfully', status_code)
        except Exception as e:
            logger.error(f"Error in get_maintenance_status: {str(e)}")
            return APIResponse.server_error(str(e))

    @staticmethod
    def toggle_maintenance(current_user, data):
        """Toggle maintenance mode"""
        try:
            result, status_code = AdminService.toggle_maintenance(current_user, data)
            return APIResponse.success(result, 'Maintenance mode toggled successfully', status_code)
        except Exception as e:
            logger.error(f"Error in toggle_maintenance: {str(e)}")
            return APIResponse.server_error(str(e))

    @staticmethod
    def system_cleanup(current_user):
        """System cleanup"""
        try:
            result, status_code = AdminService.system_cleanup(current_user)
            return APIResponse.success(result, 'System cleanup completed successfully', status_code)
        except Exception as e:
            logger.error(f"Error in system_cleanup: {str(e)}")
            return APIResponse.server_error(str(e))

    # ==================== AUDIT LOGS ====================
    @staticmethod
    def get_audit_logs(current_user, params):
        """Get audit logs"""
        try:
            result, status_code = AdminService.get_audit_logs(params)
            return APIResponse.success(result, 'Audit logs retrieved successfully', status_code)
        except Exception as e:
            logger.error(f"Error in get_audit_logs: {str(e)}")
            return APIResponse.server_error(str(e))

    @staticmethod
    def get_audit_log(current_user, log_id):
        """Get audit log details"""
        try:
            result, status_code = AdminService.get_audit_log(current_user, log_id)
            return APIResponse.success(result, 'Audit log details retrieved successfully', status_code)
        except Exception as e:
            logger.error(f"Error in get_audit_log: {str(e)}")
            return APIResponse.server_error(str(e))

    @staticmethod
    def export_audit_logs(current_user, data):
        """Export audit logs"""
        try:
            result, status_code = AdminService.export_audit_logs(data)
            return APIResponse.success(result, 'Audit logs exported successfully', status_code)
        except Exception as e:
            logger.error(f"Error in export_audit_logs: {str(e)}")
            return APIResponse.server_error(str(e))

    # ==================== PRICE MANAGEMENT ====================
    @staticmethod
    def get_prices(current_user, params):
        """Get all prices"""
        try:
            result, status_code = PriceService.get_prices(params)
            return APIResponse.success(result, 'Prices retrieved successfully', status_code)
        except Exception as e:
            logger.error(f"Error in get_prices: {str(e)}")
            return APIResponse.server_error(str(e))

    @staticmethod
    def get_price(current_user, price_id):
        """Get price by ID"""
        try:
            result, status_code = PriceService.get_price(price_id)
            return APIResponse.success(result, 'Price retrieved successfully', status_code)
        except Exception as e:
            logger.error(f"Error in get_price: {str(e)}")
            return APIResponse.server_error(str(e))

    @staticmethod
    def create_price(current_user, data):
        """Create a new price"""
        try:
            result, status_code = PriceService.create_price(current_user, data)
            return APIResponse.success(result, 'Price created successfully', status_code)
        except Exception as e:
            logger.error(f"Error in create_price: {str(e)}")
            return APIResponse.server_error(str(e))

    @staticmethod
    def update_price(current_user, price_id, data):
        """Update a price"""
        try:
            result, status_code = PriceService.update_price(current_user, price_id, data)
            return APIResponse.success(result, 'Price updated successfully', status_code)
        except Exception as e:
            logger.error(f"Error in update_price: {str(e)}")
            return APIResponse.server_error(str(e))

    @staticmethod
    def delete_price(current_user, price_id):
        """Delete a price"""
        try:
            result, status_code = PriceService.delete_price(current_user, price_id)
            return APIResponse.success(result, 'Price deleted successfully', status_code)
        except Exception as e:
            logger.error(f"Error in delete_price: {str(e)}")
            return APIResponse.server_error(str(e))

    @staticmethod
    def get_prices_by_service(current_user, service_id):
        """Get prices by service"""
        try:
            result, status_code = PriceService.get_prices_by_service(service_id)
            return APIResponse.success(result, 'Prices by service retrieved successfully', status_code)
        except Exception as e:
            logger.error(f"Error in get_prices_by_service: {str(e)}")
            return APIResponse.server_error(str(e))

    @staticmethod
    def bulk_update_prices(current_user, data):
        """Bulk update prices"""
        try:
            result, status_code = PriceService.bulk_update_prices(current_user, data)
            return APIResponse.success(result, 'Prices updated successfully', status_code)
        except Exception as e:
            logger.error(f"Error in bulk_update_prices: {str(e)}")
            return APIResponse.server_error(str(e))

    @staticmethod
    def get_price_history(current_user, service_id):
        """Get price history for a service"""
        try:
            result, status_code = PriceService.get_price_history(service_id)
            return APIResponse.success(result, 'Price history retrieved successfully', status_code)
        except Exception as e:
            logger.error(f"Error in get_price_history: {str(e)}")
            return APIResponse.server_error(str(e))

    # ==================== STYLIST MANAGEMENT ====================
    @staticmethod
    def get_stylists(current_user, params):
        """Get all stylists"""
        try:
            result, status_code = AdminService.get_stylists(current_user, params)
            return APIResponse.success(result, 'Stylists retrieved successfully', status_code)
        except Exception as e:
            logger.error(f"Error in get_stylists: {str(e)}")
            return APIResponse.server_error(str(e))

    @staticmethod
    def get_stylist(current_user, stylist_id):
        """Get stylist by ID"""
        try:
            result, status_code = AdminService.get_stylist(current_user, stylist_id)
            return APIResponse.success(result, 'Stylist retrieved successfully', status_code)
        except Exception as e:
            logger.error(f"Error in get_stylist: {str(e)}")
            return APIResponse.server_error(str(e))

    @staticmethod
    def update_stylist(current_user, stylist_id, data):
        """Update a stylist"""
        try:
            result, status_code = AdminService.update_stylist(current_user, stylist_id, data)
            return APIResponse.success(result, 'Stylist updated successfully', status_code)
        except Exception as e:
            logger.error(f"Error in update_stylist: {str(e)}")
            return APIResponse.server_error(str(e))

    @staticmethod
    def toggle_stylist(current_user, stylist_id):
        """Toggle stylist status"""
        try:
            result, status_code = AdminService.toggle_stylist(current_user, stylist_id)
            return APIResponse.success(result, 'Stylist toggled successfully', status_code)
        except Exception as e:
            logger.error(f"Error in toggle_stylist: {str(e)}")
            return APIResponse.server_error(str(e))