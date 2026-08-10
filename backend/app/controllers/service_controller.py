from app.utils.response import APIResponse
from app.services.service_service import ServiceService

class ServiceController:
    
    @staticmethod
    def get_services(params):
        """Get all services"""
        try:
            result, status_code = ServiceService.get_services(params)
            return APIResponse.success(result, 'Services retrieved successfully', status_code)
        except Exception as e:
            return APIResponse.server_error(str(e))
    
    @staticmethod
    def create_service(current_user, data):
        """Create a new service"""
        try:
            result, status_code = ServiceService.create_service(current_user, data)
            
            if status_code == 201:
                return APIResponse.success(result, 'Service created successfully', 201)
            else:
                return APIResponse.error(result['error'], 'CREATE_ERROR', status_code)
                
        except Exception as e:
            return APIResponse.server_error(str(e))
    
    @staticmethod
    def get_service(service_id):
        """Get service details"""
        try:
            result, status_code = ServiceService.get_service(service_id)
            
            if status_code == 200:
                return APIResponse.success(result, 'Service details retrieved successfully')
            else:
                return APIResponse.error(result['error'], 'NOT_FOUND', status_code)
                
        except Exception as e:
            return APIResponse.server_error(str(e))
    
    @staticmethod
    def update_service(current_user, service_id, data):
        """Update a service"""
        try:
            result, status_code = ServiceService.update_service(current_user, service_id, data)
            
            if status_code == 200:
                return APIResponse.success(result, 'Service updated successfully')
            else:
                return APIResponse.error(result['error'], 'UPDATE_ERROR', status_code)
                
        except Exception as e:
            return APIResponse.server_error(str(e))
    
    @staticmethod
    def delete_service(current_user, service_id):
        """Delete a service"""
        try:
            result, status_code = ServiceService.delete_service(current_user, service_id)
            
            if status_code == 200:
                return APIResponse.success(None, result['message'])
            else:
                return APIResponse.error(result['error'], 'DELETE_ERROR', status_code)
                
        except Exception as e:
            return APIResponse.server_error(str(e))
    
    @staticmethod
    def get_services_by_category(category_id, params):
        """Get services by category"""
        try:
            result, status_code = ServiceService.get_services_by_category(category_id, params)
            return APIResponse.success(result, 'Services retrieved successfully', status_code)
        except Exception as e:
            return APIResponse.server_error(str(e))
    
    @staticmethod
    def toggle_service(current_user, service_id):
        """Toggle service active status"""
        try:
            result, status_code = ServiceService.toggle_service(current_user, service_id)
            
            if status_code == 200:
                return APIResponse.success(result, 'Service toggled successfully')
            else:
                return APIResponse.error(result['error'], 'TOGGLE_ERROR', status_code)
                
        except Exception as e:
            return APIResponse.server_error(str(e))
    
    @staticmethod
    def update_service_pricing(current_user, service_id, data):
        """Update service pricing"""
        try:
            result, status_code = ServiceService.update_service_pricing(current_user, service_id, data)
            
            if status_code == 200:
                return APIResponse.success(result, 'Service pricing updated successfully')
            else:
                return APIResponse.error(result['error'], 'PRICE_ERROR', status_code)
                
        except Exception as e:
            return APIResponse.server_error(str(e))
    
    @staticmethod
    def add_service_to_promotion(current_user, service_id, data):
        """Add service to promotion"""
        try:
            result, status_code = ServiceService.add_service_to_promotion(current_user, service_id, data)
            
            if status_code == 200:
                return APIResponse.success(result, 'Service added to promotion successfully')
            else:
                return APIResponse.error(result['error'], 'ADD_ERROR', status_code)
                
        except Exception as e:
            return APIResponse.server_error(str(e))
    
    @staticmethod
    def remove_service_from_promotion(current_user, service_id):
        """Remove service from promotion"""
        try:
            result, status_code = ServiceService.remove_service_from_promotion(current_user, service_id)
            
            if status_code == 200:
                return APIResponse.success(result, 'Service removed from promotion successfully')
            else:
                return APIResponse.error(result['error'], 'REMOVE_ERROR', status_code)
                
        except Exception as e:
            return APIResponse.server_error(str(e))
    
    @staticmethod
    def get_service_analytics(current_user, params):
        """Get service analytics"""
        try:
            result, status_code = ServiceService.get_service_analytics(params)
            return APIResponse.success(result, 'Service analytics retrieved successfully', status_code)
        except Exception as e:
            return APIResponse.server_error(str(e))
    
    @staticmethod
    def get_popular_services(params):
        """Get popular services"""
        try:
            result, status_code = ServiceService.get_popular_services(params)
            return APIResponse.success(result, 'Popular services retrieved successfully', status_code)
        except Exception as e:
            return APIResponse.server_error(str(e))
    
    @staticmethod
    def export_services(current_user, data):
        """Export services to file"""
        try:
            result, status_code = ServiceService.export_services(data)
            return APIResponse.success(result, 'Services exported successfully', status_code)
        except Exception as e:
            return APIResponse.server_error(str(e))
    
    @staticmethod
    def bulk_update_services(current_user, data):
        """Bulk update services"""
        try:
            result, status_code = ServiceService.bulk_update_services(current_user, data)
            
            if status_code == 200:
                return APIResponse.success(result, 'Services updated successfully')
            else:
                return APIResponse.error(result['error'], 'BULK_ERROR', status_code)
                
        except Exception as e:
            return APIResponse.server_error(str(e))