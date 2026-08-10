from app.utils.response import APIResponse
from app.services.review_service import ReviewService

class ReviewController:
    
    @staticmethod
    def get_reviews(params):
        """Get all reviews"""
        try:
            result, status_code = ReviewService.get_reviews(params)
            return APIResponse.success(result, 'Reviews retrieved successfully', status_code)
        except Exception as e:
            return APIResponse.server_error(str(e))
    
    @staticmethod
    def create_review(current_user, data):
        """Create a new review"""
        try:
            result, status_code = ReviewService.create_review(current_user, data)
            
            if status_code == 201:
                return APIResponse.success(result, 'Review created successfully', 201)
            else:
                return APIResponse.error(result['error'], 'CREATE_ERROR', status_code)
                
        except Exception as e:
            return APIResponse.server_error(str(e))
    
    @staticmethod
    def get_review(review_id):
        """Get review details"""
        try:
            result, status_code = ReviewService.get_review(review_id)
            
            if status_code == 200:
                return APIResponse.success(result, 'Review details retrieved successfully')
            else:
                return APIResponse.error(result['error'], 'NOT_FOUND', status_code)
                
        except Exception as e:
            return APIResponse.server_error(str(e))
    
    @staticmethod
    def update_review(current_user, review_id, data):
        """Update a review"""
        try:
            result, status_code = ReviewService.update_review(current_user, review_id, data)
            
            if status_code == 200:
                return APIResponse.success(result, 'Review updated successfully')
            else:
                return APIResponse.error(result['error'], 'UPDATE_ERROR', status_code)
                
        except Exception as e:
            return APIResponse.server_error(str(e))
    
    @staticmethod
    def delete_review(current_user, review_id):
        """Delete a review"""
        try:
            result, status_code = ReviewService.delete_review(current_user, review_id)
            
            if status_code == 200:
                return APIResponse.success(None, result['message'])
            else:
                return APIResponse.error(result['error'], 'DELETE_ERROR', status_code)
                
        except Exception as e:
            return APIResponse.server_error(str(e))
    
    @staticmethod
    def get_reviews_by_service(service_id, params):
        """Get reviews by service"""
        try:
            result, status_code = ReviewService.get_reviews_by_service(service_id, params)
            return APIResponse.success(result, 'Reviews retrieved successfully', status_code)
        except Exception as e:
            return APIResponse.server_error(str(e))
    
    @staticmethod
    def get_reviews_by_stylist(stylist_id, params):
        """Get reviews by stylist"""
        try:
            result, status_code = ReviewService.get_reviews_by_stylist(stylist_id, params)
            return APIResponse.success(result, 'Reviews retrieved successfully', status_code)
        except Exception as e:
            return APIResponse.server_error(str(e))
    
    @staticmethod
    def get_reviews_by_customer(current_user, customer_id, params):
        """Get reviews by customer"""
        try:
            result, status_code = ReviewService.get_reviews_by_customer(customer_id, params)
            return APIResponse.success(result, 'Reviews retrieved successfully', status_code)
        except Exception as e:
            return APIResponse.server_error(str(e))
    
    @staticmethod
    def get_reviews_by_rating(rating, params):
        """Get reviews by rating"""
        try:
            result, status_code = ReviewService.get_reviews_by_rating(rating, params)
            return APIResponse.success(result, 'Reviews retrieved successfully', status_code)
        except Exception as e:
            return APIResponse.server_error(str(e))
    
    @staticmethod
    def toggle_review(current_user, review_id):
        """Toggle review status"""
        try:
            result, status_code = ReviewService.toggle_review(current_user, review_id)
            
            if status_code == 200:
                return APIResponse.success(result, 'Review toggled successfully')
            else:
                return APIResponse.error(result['error'], 'TOGGLE_ERROR', status_code)
                
        except Exception as e:
            return APIResponse.server_error(str(e))
    
    @staticmethod
    def report_review(current_user, review_id, data):
        """Report an inappropriate review"""
        try:
            result, status_code = ReviewService.report_review(current_user, review_id, data)
            
            if status_code == 200:
                return APIResponse.success(result, 'Review reported successfully')
            else:
                return APIResponse.error(result['error'], 'REPORT_ERROR', status_code)
                
        except Exception as e:
            return APIResponse.server_error(str(e))
    
    @staticmethod
    def get_review_statistics(params):
        """Get review statistics"""
        try:
            result, status_code = ReviewService.get_review_statistics(params)
            return APIResponse.success(result, 'Review statistics retrieved successfully', status_code)
        except Exception as e:
            return APIResponse.server_error(str(e))
    
    @staticmethod
    def get_review_analytics(current_user, params):
        """Get review analytics"""
        try:
            result, status_code = ReviewService.get_review_analytics(params)
            return APIResponse.success(result, 'Review analytics retrieved successfully', status_code)
        except Exception as e:
            return APIResponse.server_error(str(e))
    
    @staticmethod
    def reply_to_review(current_user, review_id, data):
        """Reply to a review"""
        try:
            result, status_code = ReviewService.reply_to_review(current_user, review_id, data)
            
            if status_code == 200:
                return APIResponse.success(result, 'Reply added successfully')
            else:
                return APIResponse.error(result['error'], 'REPLY_ERROR', status_code)
                
        except Exception as e:
            return APIResponse.server_error(str(e))
    
    @staticmethod
    def export_reviews(current_user, data):
        """Export reviews to file"""
        try:
            result, status_code = ReviewService.export_reviews(data)
            return APIResponse.success(result, 'Reviews exported successfully', status_code)
        except Exception as e:
            return APIResponse.server_error(str(e))