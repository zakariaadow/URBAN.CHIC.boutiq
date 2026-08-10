from app.utils.response import APIResponse
from app.services.public_service import PublicService

class PublicController:
    
    @staticmethod
    def get_home_data():
        """Get public home page data"""
        try:
            data = PublicService.get_home_data()
            return APIResponse.success(data)
        except Exception as e:
            return APIResponse.server_error(str(e))
    
    @staticmethod
    def get_about_data():
        """Get about page data"""
        try:
            data = PublicService.get_about_data()
            return APIResponse.success(data)
        except Exception as e:
            return APIResponse.server_error(str(e))
    
    @staticmethod
    def get_services(params):
        """List all services"""
        try:
            result, status_code = PublicService.get_services(params)
            
            if status_code == 200:
                return APIResponse.success(result['items'], 'Services retrieved successfully', 200)
            else:
                return APIResponse.error(result['error'], 'SERVICE_ERROR', status_code)
                
        except Exception as e:
            return APIResponse.server_error(str(e))
    
    @staticmethod
    def get_service_detail(service_id):
        """Get service details"""
        try:
            result, status_code = PublicService.get_service_detail(service_id)
            
            if status_code == 200:
                return APIResponse.success(result)
            else:
                return APIResponse.error(result['error'], 'SERVICE_ERROR', status_code)
                
        except Exception as e:
            return APIResponse.server_error(str(e))
    
    @staticmethod
    def get_gallery(params):
        """Get gallery images"""
        try:
            result, status_code = PublicService.get_gallery(params)
            return APIResponse.success(result, 'Gallery retrieved successfully', status_code)
        except Exception as e:
            return APIResponse.server_error(str(e))
    
    @staticmethod
    def get_pricing():
        """Get pricing information"""
        try:
            data = PublicService.get_pricing()
            return APIResponse.success(data)
        except Exception as e:
            return APIResponse.server_error(str(e))
    
    @staticmethod
    def get_team(params):
        """Get team members"""
        try:
            result, status_code = PublicService.get_team(params)
            return APIResponse.success(result, 'Team members retrieved successfully', status_code)
        except Exception as e:
            return APIResponse.server_error(str(e))
    
    @staticmethod
    def get_branches():
        """Get all branches"""
        try:
            result, status_code = PublicService.get_branches()
            return APIResponse.success(result, 'Branches retrieved successfully', status_code)
        except Exception as e:
            return APIResponse.server_error(str(e))
    
    @staticmethod
    def get_branch_detail(branch_id):
        """Get branch details"""
        try:
            result, status_code = PublicService.get_branch_detail(branch_id)
            return APIResponse.success(result, 'Branch details retrieved successfully', status_code)
        except Exception as e:
            return APIResponse.server_error(str(e))
    
    @staticmethod
    def submit_contact(data):
        """Submit contact form"""
        try:
            result, status_code = PublicService.submit_contact(data)
            return APIResponse.success(result, 'Contact form submitted successfully', status_code)
        except Exception as e:
            return APIResponse.server_error(str(e))
    
    @staticmethod
    def get_promotions():
        """Get active promotions"""
        try:
            result, status_code = PublicService.get_promotions()
            return APIResponse.success(result, 'Promotions retrieved successfully', status_code)
        except Exception as e:
            return APIResponse.server_error(str(e))
    
    @staticmethod
    def get_promotion_detail(promotion_id):
        """Get promotion details"""
        try:
            result, status_code = PublicService.get_promotion_detail(promotion_id)
            return APIResponse.success(result, 'Promotion details retrieved successfully', status_code)
        except Exception as e:
            return APIResponse.server_error(str(e))
    
    @staticmethod
    def check_availability(params):
        """Check appointment availability"""
        try:
            result, status_code = PublicService.check_availability(params)
            return APIResponse.success(result, 'Availability checked successfully', status_code)
        except Exception as e:
            return APIResponse.server_error(str(e))
    
    @staticmethod
    def get_testimonials():
        """Get customer testimonials"""
        try:
            result, status_code = PublicService.get_testimonials()
            return APIResponse.success(result, 'Testimonials retrieved successfully', status_code)
        except Exception as e:
            return APIResponse.server_error(str(e))
    
    @staticmethod
    def get_faqs():
        """Get frequently asked questions"""
        try:
            result, status_code = PublicService.get_faqs()
            return APIResponse.success(result, 'FAQs retrieved successfully', status_code)
        except Exception as e:
            return APIResponse.server_error(str(e))
    
    @staticmethod
    def subscribe_newsletter(data):
        """Subscribe to newsletter"""
        try:
            result, status_code = PublicService.subscribe_newsletter(data)
            return APIResponse.success(result, 'Subscribed successfully', status_code)
        except Exception as e:
            return APIResponse.server_error(str(e))