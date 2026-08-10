from app.utils.response import APIResponse
from app.services.supplier_service import SupplierService

class SupplierController:
    
    @staticmethod
    def get_suppliers(current_user, params):
        """Get all suppliers"""
        try:
            result, status_code = SupplierService.get_suppliers(params)
            return APIResponse.success(result, 'Suppliers retrieved successfully', status_code)
        except Exception as e:
            return APIResponse.server_error(str(e))
    
    @staticmethod
    def create_supplier(current_user, data):
        """Create a new supplier"""
        try:
            result, status_code = SupplierService.create_supplier(current_user, data)
            
            if status_code == 201:
                return APIResponse.success(result, 'Supplier created successfully', 201)
            else:
                return APIResponse.error(result['error'], 'CREATE_ERROR', status_code)
                
        except Exception as e:
            return APIResponse.server_error(str(e))
    
    @staticmethod
    def get_supplier(current_user, supplier_id):
        """Get supplier details"""
        try:
            result, status_code = SupplierService.get_supplier(current_user, supplier_id)
            
            if status_code == 200:
                return APIResponse.success(result, 'Supplier details retrieved successfully')
            else:
                return APIResponse.error(result['error'], 'NOT_FOUND', status_code)
                
        except Exception as e:
            return APIResponse.server_error(str(e))
    
    @staticmethod
    def update_supplier(current_user, supplier_id, data):
        """Update a supplier"""
        try:
            result, status_code = SupplierService.update_supplier(current_user, supplier_id, data)
            
            if status_code == 200:
                return APIResponse.success(result, 'Supplier updated successfully')
            else:
                return APIResponse.error(result['error'], 'UPDATE_ERROR', status_code)
                
        except Exception as e:
            return APIResponse.server_error(str(e))
    
    @staticmethod
    def delete_supplier(current_user, supplier_id):
        """Delete a supplier"""
        try:
            result, status_code = SupplierService.delete_supplier(current_user, supplier_id)
            
            if status_code == 200:
                return APIResponse.success(None, result['message'])
            else:
                return APIResponse.error(result['error'], 'DELETE_ERROR', status_code)
                
        except Exception as e:
            return APIResponse.server_error(str(e))
    
    @staticmethod
    def search_suppliers(current_user, params):
        """Search suppliers"""
        try:
            result, status_code = SupplierService.search_suppliers(params)
            return APIResponse.success(result, 'Suppliers found successfully', status_code)
        except Exception as e:
            return APIResponse.server_error(str(e))
    
    @staticmethod
    def get_supplier_products(current_user, supplier_id, params):
        """Get products from supplier"""
        try:
            result, status_code = SupplierService.get_supplier_products(supplier_id, params)
            return APIResponse.success(result, 'Supplier products retrieved successfully', status_code)
        except Exception as e:
            return APIResponse.server_error(str(e))
    
    @staticmethod
    def toggle_supplier(current_user, supplier_id):
        """Toggle supplier status"""
        try:
            result, status_code = SupplierService.toggle_supplier(current_user, supplier_id)
            
            if status_code == 200:
                return APIResponse.success(result, 'Supplier toggled successfully')
            else:
                return APIResponse.error(result['error'], 'TOGGLE_ERROR', status_code)
                
        except Exception as e:
            return APIResponse.server_error(str(e))
    
    @staticmethod
    def get_supplier_purchases(current_user, supplier_id, params):
        """Get purchases from supplier"""
        try:
            result, status_code = SupplierService.get_supplier_purchases(supplier_id, params)
            return APIResponse.success(result, 'Supplier purchases retrieved successfully', status_code)
        except Exception as e:
            return APIResponse.server_error(str(e))
    
    @staticmethod
    def get_supplier_analytics(current_user, params):
        """Get supplier analytics"""
        try:
            result, status_code = SupplierService.get_supplier_analytics(params)
            return APIResponse.success(result, 'Supplier analytics retrieved successfully', status_code)
        except Exception as e:
            return APIResponse.server_error(str(e))
    
    @staticmethod
    def export_suppliers(current_user, data):
        """Export suppliers to file"""
        try:
            result, status_code = SupplierService.export_suppliers(data)
            return APIResponse.success(result, 'Suppliers exported successfully', status_code)
        except Exception as e:
            return APIResponse.server_error(str(e))