from app.utils.response import APIResponse
from app.services.promotion_service import PromotionService

class PromotionController:
    
    @staticmethod
    def get_promotions(params):
        """Get all promotions"""
        try:
            result, status_code = PromotionService.get_promotions(params)
            return APIResponse.success(result, 'Promotions retrieved successfully', status_code)
        except Exception as e:
            return APIResponse.server_error(str(e))
    
    @staticmethod
    def create_promotion(current_user, data):
        """Create a new promotion"""
        try:
            result, status_code = PromotionService.create_promotion(current_user, data)
            
            if status_code == 201:
                return APIResponse.success(result, 'Promotion created successfully', 201)
            else:
                return APIResponse.error(result['error'], 'CREATE_ERROR', status_code)
                
        except Exception as e:
            return APIResponse.server_error(str(e))
    
    @staticmethod
    def get_promotion(promotion_id):
        """Get promotion details"""
        try:
            result, status_code = PromotionService.get_promotion(promotion_id)
            
            if status_code == 200:
                return APIResponse.success(result, 'Promotion details retrieved successfully')
            else:
                return APIResponse.error(result['error'], 'NOT_FOUND', status_code)
                
        except Exception as e:
            return APIResponse.server_error(str(e))
    
    @staticmethod
    def update_promotion(current_user, promotion_id, data):
        """Update a promotion"""
        try:
            result, status_code = PromotionService.update_promotion(current_user, promotion_id, data)
            
            if status_code == 200:
                return APIResponse.success(result, 'Promotion updated successfully')
            else:
                return APIResponse.error(result['error'], 'UPDATE_ERROR', status_code)
                
        except Exception as e:
            return APIResponse.server_error(str(e))
    
    @staticmethod
    def delete_promotion(current_user, promotion_id):
        """Delete a promotion"""
        try:
            result, status_code = PromotionService.delete_promotion(current_user, promotion_id)
            
            if status_code == 200:
                return APIResponse.success(None, result['message'])
            else:
                return APIResponse.error(result['error'], 'DELETE_ERROR', status_code)
                
        except Exception as e:
            return APIResponse.server_error(str(e))
    
    @staticmethod
    def get_active_promotions(params):
        """Get active promotions"""
        try:
            result, status_code = PromotionService.get_active_promotions(params)
            return APIResponse.success(result, 'Active promotions retrieved successfully', status_code)
        except Exception as e:
            return APIResponse.server_error(str(e))
    
    @staticmethod
    def get_promotions_by_type(type, params):
        """Get promotions by type"""
        try:
            result, status_code = PromotionService.get_promotions_by_type(type, params)
            return APIResponse.success(result, 'Promotions retrieved successfully', status_code)
        except Exception as e:
            return APIResponse.server_error(str(e))
    
    @staticmethod
    def apply_promotion_to_service(current_user, promotion_id, service_id):
        """Apply promotion to a service"""
        try:
            result, status_code = PromotionService.apply_promotion_to_service(current_user, promotion_id, service_id)
            
            if status_code == 200:
                return APIResponse.success(result, 'Promotion applied to service successfully')
            else:
                return APIResponse.error(result['error'], 'APPLY_ERROR', status_code)
                
        except Exception as e:
            return APIResponse.server_error(str(e))
    
    @staticmethod
    def remove_promotion_from_service(current_user, promotion_id, service_id):
        """Remove promotion from a service"""
        try:
            result, status_code = PromotionService.remove_promotion_from_service(current_user, promotion_id, service_id)
            
            if status_code == 200:
                return APIResponse.success(result, 'Promotion removed from service successfully')
            else:
                return APIResponse.error(result['error'], 'REMOVE_ERROR', status_code)
                
        except Exception as e:
            return APIResponse.server_error(str(e))
    
    @staticmethod
    def apply_promotion_to_product(current_user, promotion_id, product_id):
        """Apply promotion to a product"""
        try:
            result, status_code = PromotionService.apply_promotion_to_product(current_user, promotion_id, product_id)
            
            if status_code == 200:
                return APIResponse.success(result, 'Promotion applied to product successfully')
            else:
                return APIResponse.error(result['error'], 'APPLY_ERROR', status_code)
                
        except Exception as e:
            return APIResponse.server_error(str(e))
    
    @staticmethod
    def remove_promotion_from_product(current_user, promotion_id, product_id):
        """Remove promotion from a product"""
        try:
            result, status_code = PromotionService.remove_promotion_from_product(current_user, promotion_id, product_id)
            
            if status_code == 200:
                return APIResponse.success(result, 'Promotion removed from product successfully')
            else:
                return APIResponse.error(result['error'], 'REMOVE_ERROR', status_code)
                
        except Exception as e:
            return APIResponse.server_error(str(e))
    
    @staticmethod
    def toggle_promotion(current_user, promotion_id):
        """Toggle promotion status"""
        try:
            result, status_code = PromotionService.toggle_promotion(current_user, promotion_id)
            
            if status_code == 200:
                return APIResponse.success(result, 'Promotion toggled successfully')
            else:
                return APIResponse.error(result['error'], 'TOGGLE_ERROR', status_code)
                
        except Exception as e:
            return APIResponse.server_error(str(e))
    
    @staticmethod
    def get_promotion_analytics(current_user, params):
        """Get promotion analytics"""
        try:
            result, status_code = PromotionService.get_promotion_analytics(params)
            return APIResponse.success(result, 'Promotion analytics retrieved successfully', status_code)
        except Exception as e:
            return APIResponse.server_error(str(e))
    
    @staticmethod
    def calculate_discount(data):
        """Calculate discount for a service or product"""
        try:
            result, status_code = PromotionService.calculate_discount(data)
            return APIResponse.success(result, 'Discount calculated successfully', status_code)
        except Exception as e:
            return APIResponse.server_error(str(e))
    
    @staticmethod
    def export_promotions(current_user, data):
        """Export promotions to file"""
        try:
            result, status_code = PromotionService.export_promotions(data)
            return APIResponse.success(result, 'Promotions exported successfully', status_code)
        except Exception as e:
            return APIResponse.server_error(str(e))
    
    @staticmethod
    def get_promotion_statistics(current_user, params):
        """Get promotion statistics"""
        try:
            result, status_code = PromotionService.get_promotion_statistics(params)
            return APIResponse.success(result, 'Promotion statistics retrieved successfully', status_code)
        except Exception as e:
            return APIResponse.server_error(str(e))