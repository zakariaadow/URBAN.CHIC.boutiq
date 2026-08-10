from app.utils.response import APIResponse
from app.services.category_service import CategoryService

class CategoryController:
    
    @staticmethod
    def get_categories(params):
        """Get all categories"""
        try:
            result, status_code = CategoryService.get_categories(params)
            return APIResponse.success(result, 'Categories retrieved successfully', status_code)
        except Exception as e:
            return APIResponse.server_error(str(e))
    
    @staticmethod
    def create_category(current_user, data):
        """Create a new category"""
        try:
            result, status_code = CategoryService.create_category(current_user, data)
            
            if status_code == 201:
                return APIResponse.success(result, 'Category created successfully', 201)
            else:
                return APIResponse.error(result['error'], 'CREATE_ERROR', status_code)
                
        except Exception as e:
            return APIResponse.server_error(str(e))
    
    @staticmethod
    def get_category(category_id):
        """Get category details"""
        try:
            result, status_code = CategoryService.get_category(category_id)
            
            if status_code == 200:
                return APIResponse.success(result, 'Category details retrieved successfully')
            else:
                return APIResponse.error(result['error'], 'NOT_FOUND', status_code)
                
        except Exception as e:
            return APIResponse.server_error(str(e))
    
    @staticmethod
    def update_category(current_user, category_id, data):
        """Update a category"""
        try:
            result, status_code = CategoryService.update_category(current_user, category_id, data)
            
            if status_code == 200:
                return APIResponse.success(result, 'Category updated successfully')
            else:
                return APIResponse.error(result['error'], 'UPDATE_ERROR', status_code)
                
        except Exception as e:
            return APIResponse.server_error(str(e))
    
    @staticmethod
    def delete_category(current_user, category_id):
        """Delete a category"""
        try:
            result, status_code = CategoryService.delete_category(current_user, category_id)
            
            if status_code == 200:
                return APIResponse.success(None, result['message'])
            else:
                return APIResponse.error(result['error'], 'DELETE_ERROR', status_code)
                
        except Exception as e:
            return APIResponse.server_error(str(e))
    
    @staticmethod
    def get_category_services(category_id, params):
        """Get services in a category"""
        try:
            result, status_code = CategoryService.get_category_services(category_id, params)
            return APIResponse.success(result, 'Category services retrieved successfully', status_code)
        except Exception as e:
            return APIResponse.server_error(str(e))
    
    @staticmethod
    def toggle_category(current_user, category_id):
        """Toggle category status"""
        try:
            result, status_code = CategoryService.toggle_category(current_user, category_id)
            
            if status_code == 200:
                return APIResponse.success(result, 'Category toggled successfully')
            else:
                return APIResponse.error(result['error'], 'TOGGLE_ERROR', status_code)
                
        except Exception as e:
            return APIResponse.server_error(str(e))
    
    @staticmethod
    def get_category_analytics(current_user, params):
        """Get category analytics"""
        try:
            result, status_code = CategoryService.get_category_analytics(params)
            return APIResponse.success(result, 'Category analytics retrieved successfully', status_code)
        except Exception as e:
            return APIResponse.server_error(str(e))
    
    @staticmethod
    def export_categories(current_user, data):
        """Export categories to file"""
        try:
            result, status_code = CategoryService.export_categories(data)
            return APIResponse.success(result, 'Categories exported successfully', status_code)
        except Exception as e:
            return APIResponse.server_error(str(e))
    
    @staticmethod
    def bulk_update_categories(current_user, data):
        """Bulk update categories"""
        try:
            result, status_code = CategoryService.bulk_update_categories(current_user, data)
            
            if status_code == 200:
                return APIResponse.success(result, 'Categories updated successfully')
            else:
                return APIResponse.error(result['error'], 'BULK_ERROR', status_code)
                
        except Exception as e:
            return APIResponse.server_error(str(e))