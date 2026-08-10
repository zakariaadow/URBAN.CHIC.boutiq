from app.utils.response import APIResponse
from app.services.notification_service import NotificationService

class NotificationController:
    
    @staticmethod
    def get_notifications(current_user, params):
        """Get all notifications"""
        try:
            result, status_code = NotificationService.get_notifications(current_user.id, params)
            return APIResponse.success(result, 'Notifications retrieved successfully', status_code)
        except Exception as e:
            return APIResponse.server_error(str(e))
    
    @staticmethod
    def create_notification(current_user, data):
        """Create a new notification"""
        try:
            result, status_code = NotificationService.create_notification_from_data(current_user, data)
            
            if status_code == 201:
                return APIResponse.success(result, 'Notification created successfully', 201)
            else:
                return APIResponse.error(result['error'], 'CREATE_ERROR', status_code)
                
        except Exception as e:
            return APIResponse.server_error(str(e))
    
    @staticmethod
    def get_notification(current_user, notification_id):
        """Get notification details"""
        try:
            result, status_code = NotificationService.get_notification(current_user.id, notification_id)
            
            if status_code == 200:
                return APIResponse.success(result, 'Notification details retrieved successfully')
            else:
                return APIResponse.error(result['error'], 'NOT_FOUND', status_code)
                
        except Exception as e:
            return APIResponse.server_error(str(e))
    
    @staticmethod
    def update_notification(current_user, notification_id, data):
        """Update a notification"""
        try:
            result, status_code = NotificationService.update_notification(current_user, notification_id, data)
            
            if status_code == 200:
                return APIResponse.success(result, 'Notification updated successfully')
            else:
                return APIResponse.error(result['error'], 'UPDATE_ERROR', status_code)
                
        except Exception as e:
            return APIResponse.server_error(str(e))
    
    @staticmethod
    def delete_notification(current_user, notification_id):
        """Delete a notification"""
        try:
            result, status_code = NotificationService.delete_notification(current_user.id, notification_id)
            
            if status_code == 200:
                return APIResponse.success(None, result['message'])
            else:
                return APIResponse.error(result['error'], 'DELETE_ERROR', status_code)
                
        except Exception as e:
            return APIResponse.server_error(str(e))
    
    @staticmethod
    def get_unread_notifications(current_user):
        """Get unread notifications"""
        try:
            result, status_code = NotificationService.get_unread_notifications(current_user.id)
            return APIResponse.success(result, 'Unread notifications retrieved successfully', status_code)
        except Exception as e:
            return APIResponse.server_error(str(e))
    
    @staticmethod
    def mark_notification_read(current_user, notification_id):
        """Mark notification as read"""
        try:
            result, status_code = NotificationService.mark_as_read(notification_id, current_user.id)
            
            if status_code == 200:
                return APIResponse.success(None, result['message'])
            else:
                return APIResponse.error(result['error'], 'MARK_READ_ERROR', status_code)
                
        except Exception as e:
            return APIResponse.server_error(str(e))
    
    @staticmethod
    def mark_all_notifications_read(current_user):
        """Mark all notifications as read"""
        try:
            result, status_code = NotificationService.mark_all_as_read(current_user.id)
            
            if status_code == 200:
                return APIResponse.success(None, result['message'])
            else:
                return APIResponse.error(result['error'], 'MARK_READ_ERROR', status_code)
                
        except Exception as e:
            return APIResponse.server_error(str(e))
    
    @staticmethod
    def get_notifications_by_type(current_user, type, params):
        """Get notifications by type"""
        try:
            result, status_code = NotificationService.get_notifications_by_type(current_user.id, type, params)
            return APIResponse.success(result, 'Notifications retrieved successfully', status_code)
        except Exception as e:
            return APIResponse.server_error(str(e))
    
    @staticmethod
    def get_notifications_by_recipient(current_user, user_id, params):
        """Get notifications by recipient"""
        try:
            result, status_code = NotificationService.get_notifications_by_recipient(user_id, params)
            return APIResponse.success(result, 'Notifications retrieved successfully', status_code)
        except Exception as e:
            return APIResponse.server_error(str(e))
    
    @staticmethod
    def send_bulk_notifications(current_user, data):
        """Send bulk notifications"""
        try:
            result, status_code = NotificationService.send_bulk_notification_from_data(current_user, data)
            
            if status_code == 200:
                return APIResponse.success(result, 'Bulk notifications sent successfully')
            else:
                return APIResponse.error(result['error'], 'BULK_ERROR', status_code)
                
        except Exception as e:
            return APIResponse.server_error(str(e))
    
    @staticmethod
    def send_appointment_reminder(current_user, appointment_id):
        """Send appointment reminder"""
        try:
            result, status_code = NotificationService.send_appointment_reminder_from_appointment(appointment_id)
            
            if status_code == 200:
                return APIResponse.success(None, result['message'])
            else:
                return APIResponse.error(result['error'], 'REMINDER_ERROR', status_code)
                
        except Exception as e:
            return APIResponse.server_error(str(e))
    
    @staticmethod
    def get_notification_preferences(current_user):
        """Get notification preferences"""
        try:
            result, status_code = NotificationService.get_preferences(current_user.id)
            return APIResponse.success(result, 'Notification preferences retrieved successfully', status_code)
        except Exception as e:
            return APIResponse.server_error(str(e))
    
    @staticmethod
    def update_notification_preferences(current_user, data):
        """Update notification preferences"""
        try:
            result, status_code = NotificationService.update_preferences(current_user.id, data)
            
            if status_code == 200:
                return APIResponse.success(result, 'Notification preferences updated successfully')
            else:
                return APIResponse.error(result['error'], 'UPDATE_ERROR', status_code)
                
        except Exception as e:
            return APIResponse.server_error(str(e))
    
    @staticmethod
    def export_notifications(current_user, data):
        """Export notifications to file"""
        try:
            result, status_code = NotificationService.export_notifications(current_user.id, data)
            return APIResponse.success(result, 'Notifications exported successfully', status_code)
        except Exception as e:
            return APIResponse.server_error(str(e))
    
    @staticmethod
    def get_notification_statistics(current_user):
        """Get notification statistics"""
        try:
            result, status_code = NotificationService.get_statistics(current_user.id)
            return APIResponse.success(result, 'Notification statistics retrieved successfully', status_code)
        except Exception as e:
            return APIResponse.server_error(str(e))