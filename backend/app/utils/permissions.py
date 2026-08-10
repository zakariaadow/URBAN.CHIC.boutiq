from app.extensions import db
from app.models.role import Role
from app.models.user import User

class Permissions:
    """System permissions constants"""
    
    # User Management
    VIEW_USERS = 'view_users'
    CREATE_USERS = 'create_users'
    UPDATE_USERS = 'update_users'
    DELETE_USERS = 'delete_users'
    APPROVE_USERS = 'approve_users'
    DEACTIVATE_USERS = 'deactivate_users'
    
    # Role Management
    VIEW_ROLES = 'view_roles'
    CREATE_ROLES = 'create_roles'
    UPDATE_ROLES = 'update_roles'
    DELETE_ROLES = 'delete_roles'
    
    # Appointment Management
    VIEW_APPOINTMENTS = 'view_appointments'
    CREATE_APPOINTMENTS = 'create_appointments'
    UPDATE_APPOINTMENTS = 'update_appointments'
    DELETE_APPOINTMENTS = 'delete_appointments'
    CANCEL_APPOINTMENTS = 'cancel_appointments'
    RESCHEDULE_APPOINTMENTS = 'reschedule_appointments'
    CHECKIN_APPOINTMENTS = 'checkin_appointments'
    COMPLETE_APPOINTMENTS = 'complete_appointments'
    
    # Service Management
    VIEW_SERVICES = 'view_services'
    CREATE_SERVICES = 'create_services'
    UPDATE_SERVICES = 'update_services'
    DELETE_SERVICES = 'delete_services'
    
    # Product Management
    VIEW_PRODUCTS = 'view_products'
    CREATE_PRODUCTS = 'create_products'
    UPDATE_PRODUCTS = 'update_products'
    DELETE_PRODUCTS = 'delete_products'
    
    # Inventory Management
    VIEW_INVENTORY = 'view_inventory'
    MANAGE_INVENTORY = 'manage_inventory'
    VIEW_STOCK = 'view_stock'
    MANAGE_STOCK = 'manage_stock'
    VIEW_PURCHASES = 'view_purchases'
    CREATE_PURCHASES = 'create_purchases'
    UPDATE_PURCHASES = 'update_purchases'
    DELETE_PURCHASES = 'delete_purchases'
    
    # Payment Management
    VIEW_PAYMENTS = 'view_payments'
    CREATE_PAYMENTS = 'create_payments'
    UPDATE_PAYMENTS = 'update_payments'
    DELETE_PAYMENTS = 'delete_payments'
    VERIFY_PAYMENTS = 'verify_payments'
    REFUND_PAYMENTS = 'refund_payments'
    
    # Financial Management
    VIEW_FINANCIALS = 'view_financials'
    MANAGE_FINANCIALS = 'manage_financials'
    VIEW_REPORTS = 'view_reports'
    EXPORT_REPORTS = 'export_reports'
    VIEW_EXPENSES = 'view_expenses'
    CREATE_EXPENSES = 'create_expenses'
    UPDATE_EXPENSES = 'update_expenses'
    DELETE_EXPENSES = 'delete_expenses'
    VIEW_PAYROLL = 'view_payroll'
    MANAGE_PAYROLL = 'manage_payroll'
    VIEW_COMMISSIONS = 'view_commissions'
    MANAGE_COMMISSIONS = 'manage_commissions'
    
    # Staff Management
    VIEW_STAFF = 'view_staff'
    MANAGE_STAFF = 'manage_staff'
    VIEW_ATTENDANCE = 'view_attendance'
    MANAGE_ATTENDANCE = 'manage_attendance'
    VIEW_LEAVE = 'view_leave'
    MANAGE_LEAVE = 'manage_leave'
    
    # Customer Management
    VIEW_CUSTOMERS = 'view_customers'
    MANAGE_CUSTOMERS = 'manage_customers'
    VIEW_CUSTOMER_HISTORY = 'view_customer_history'
    
    # Promotion Management
    VIEW_PROMOTIONS = 'view_promotions'
    CREATE_PROMOTIONS = 'create_promotions'
    UPDATE_PROMOTIONS = 'update_promotions'
    DELETE_PROMOTIONS = 'delete_promotions'
    
    # Branch Management
    VIEW_BRANCHES = 'view_branches'
    CREATE_BRANCHES = 'create_branches'
    UPDATE_BRANCHES = 'update_branches'
    DELETE_BRANCHES = 'delete_branches'
    
    # System Settings
    VIEW_SETTINGS = 'view_settings'
    UPDATE_SETTINGS = 'update_settings'
    MANAGE_SYSTEM = 'manage_system'
    VIEW_LOGS = 'view_logs'
    BACKUP_DATABASE = 'backup_database'
    RESTORE_DATABASE = 'restore_database'
    
    # Reviews
    VIEW_REVIEWS = 'view_reviews'
    MANAGE_REVIEWS = 'manage_reviews'
    REPLY_REVIEWS = 'reply_reviews'
    
    # Notifications
    VIEW_NOTIFICATIONS = 'view_notifications'
    CREATE_NOTIFICATIONS = 'create_notifications'
    SEND_NOTIFICATIONS = 'send_notifications'

class PermissionChecker:
    """Permission checking utilities"""
    
    @staticmethod
    def has_permission(user, permission):
        """Check if user has a specific permission"""
        if not user:
            return False
        
        # Admin has all permissions
        if user.is_system_admin:
            return True
        
        # Check role permissions
        if user.role and user.role.permissions:
            return user.role.permissions.get(permission, False)
        
        return False
    
    @staticmethod
    def has_any_permission(user, permissions):
        """Check if user has any of the specified permissions"""
        if not user:
            return False
        
        for permission in permissions:
            if PermissionChecker.has_permission(user, permission):
                return True
        
        return False
    
    @staticmethod
    def has_all_permissions(user, permissions):
        """Check if user has all specified permissions"""
        if not user:
            return False
        
        for permission in permissions:
            if not PermissionChecker.has_permission(user, permission):
                return False
        
        return True
    
    @staticmethod
    def get_user_permissions(user):
        """Get all permissions for a user"""
        if not user:
            return []
        
        if user.is_system_admin:
            # Return all permissions
            return [p for p in dir(Permissions) if not p.startswith('_')]
        
        if user.role and user.role.permissions:
            return [p for p, v in user.role.permissions.items() if v]
        
        return []
    
    @staticmethod
    def initialize_default_permissions():
        """Initialize default role permissions"""
        default_permissions = {
            'admin': {
                'view_users': True,
                'create_users': True,
                'update_users': True,
                'delete_users': True,
                'approve_users': True,
                'deactivate_users': True,
                'view_roles': True,
                'create_roles': True,
                'update_roles': True,
                'delete_roles': True,
                'view_appointments': True,
                'create_appointments': True,
                'update_appointments': True,
                'delete_appointments': True,
                'cancel_appointments': True,
                'reschedule_appointments': True,
                'checkin_appointments': True,
                'complete_appointments': True,
                'view_services': True,
                'create_services': True,
                'update_services': True,
                'delete_services': True,
                'view_products': True,
                'create_products': True,
                'update_products': True,
                'delete_products': True,
                'view_inventory': True,
                'manage_inventory': True,
                'view_stock': True,
                'manage_stock': True,
                'view_purchases': True,
                'create_purchases': True,
                'update_purchases': True,
                'delete_purchases': True,
                'view_payments': True,
                'create_payments': True,
                'update_payments': True,
                'delete_payments': True,
                'verify_payments': True,
                'refund_payments': True,
                'view_financials': True,
                'manage_financials': True,
                'view_reports': True,
                'export_reports': True,
                'view_expenses': True,
                'create_expenses': True,
                'update_expenses': True,
                'delete_expenses': True,
                'view_payroll': True,
                'manage_payroll': True,
                'view_commissions': True,
                'manage_commissions': True,
                'view_staff': True,
                'manage_staff': True,
                'view_attendance': True,
                'manage_attendance': True,
                'view_leave': True,
                'manage_leave': True,
                'view_customers': True,
                'manage_customers': True,
                'view_customer_history': True,
                'view_promotions': True,
                'create_promotions': True,
                'update_promotions': True,
                'delete_promotions': True,
                'view_branches': True,
                'create_branches': True,
                'update_branches': True,
                'delete_branches': True,
                'view_settings': True,
                'update_settings': True,
                'manage_system': True,
                'view_logs': True,
                'backup_database': True,
                'restore_database': True,
                'view_reviews': True,
                'manage_reviews': True,
                'reply_reviews': True,
                'view_notifications': True,
                'create_notifications': True,
                'send_notifications': True
            },
            'manager': {
                'view_appointments': True,
                'create_appointments': True,
                'update_appointments': True,
                'cancel_appointments': True,
                'reschedule_appointments': True,
                'checkin_appointments': True,
                'complete_appointments': True,
                'view_services': True,
                'create_services': True,
                'update_services': True,
                'view_products': True,
                'view_inventory': True,
                'view_stock': True,
                'view_payments': True,
                'view_financials': True,
                'view_reports': True,
                'export_reports': True,
                'view_expenses': True,
                'create_expenses': True,
                'view_commissions': True,
                'view_staff': True,
                'manage_staff': True,
                'view_attendance': True,
                'manage_attendance': True,
                'view_leave': True,
                'manage_leave': True,
                'view_customers': True,
                'manage_customers': True,
                'view_customer_history': True,
                'view_promotions': True,
                'view_branches': True,
                'view_reviews': True,
                'reply_reviews': True,
                'view_notifications': True
            },
            'receptionist': {
                'view_appointments': True,
                'create_appointments': True,
                'update_appointments': True,
                'cancel_appointments': True,
                'reschedule_appointments': True,
                'checkin_appointments': True,
                'view_services': True,
                'view_payments': True,
                'create_payments': True,
                'view_customers': True,
                'view_customer_history': True,
                'view_promotions': True,
                'view_branches': True
            },
            'stylist': {
                'view_appointments': True,
                'update_appointments': True,
                'complete_appointments': True,
                'view_services': True,
                'view_customers': True,
                'view_customer_history': True
            },
            'finance': {
                'view_payments': True,
                'update_payments': True,
                'verify_payments': True,
                'refund_payments': True,
                'view_financials': True,
                'manage_financials': True,
                'view_reports': True,
                'export_reports': True,
                'view_expenses': True,
                'create_expenses': True,
                'update_expenses': True,
                'delete_expenses': True,
                'view_payroll': True,
                'manage_payroll': True,
                'view_commissions': True,
                'manage_commissions': True
            },
            'inventory': {
                'view_products': True,
                'create_products': True,
                'update_products': True,
                'view_inventory': True,
                'manage_inventory': True,
                'view_stock': True,
                'manage_stock': True,
                'view_purchases': True,
                'create_purchases': True,
                'update_purchases': True,
                'view_suppliers': True,
                'create_suppliers': True,
                'update_suppliers': True,
                'view_reports': True,
                'export_reports': True
            },
            'customer': {}
        }
        
        return default_permissions