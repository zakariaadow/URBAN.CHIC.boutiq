from datetime import datetime
from app.extensions import db
from app.models.notification import Notification
from app.models.user import User

class NotificationService:
    
    @staticmethod
    def create_notification(user_id, title, message, type='system', priority='normal', 
                           appointment_id=None, action_url=None, action_text=None,
                           metadata=None):
        """Create a new notification"""
        try:
            if not user_id:
                print(f"⚠️ No user_id provided for notification: {title}")
                return None
            
            notification = Notification(
                user_id=user_id,
                title=title,
                message=message,
                type=type,
                priority=priority,
                appointment_id=appointment_id,
                action_url=action_url,
                action_text=action_text,
                meta_data=metadata or {}
            )
            
            db.session.add(notification)
            db.session.commit()
            
            return notification
            
        except Exception as e:
            db.session.rollback()
            print(f"Error creating notification: {e}")
            return None
    
    @staticmethod
    def get_notifications(user_id, filters=None):
        """Get notifications for a user"""
        try:
            query = Notification.query.filter_by(user_id=user_id)
            
            if filters:
                if filters.get('is_read') is not None:
                    query = query.filter(Notification.is_read == filters['is_read'])
                if filters.get('type'):
                    query = query.filter(Notification.type == filters['type'])
                if filters.get('priority'):
                    query = query.filter(Notification.priority == filters['priority'])
            
            query = query.order_by(Notification.created_at.desc())
            
            # 🚨 FIX: Parse page and per_page to integers safely
            page = int(filters.get('page', 1)) if filters else 1
            per_page = int(filters.get('per_page', 20)) if filters else 20
            
            notifications = query.paginate(page=page, per_page=per_page, error_out=False)
            
            return {
                'items': [n.to_dict() for n in notifications.items],
                'total': notifications.total,
                'page': page,
                'per_page': per_page,
                'pages': notifications.pages
            }, 200
            
        except Exception as e:
            return {'error': str(e)}, 500
    
    @staticmethod
    def mark_as_read(notification_id, user_id):
        """Mark notification as read"""
        try:
            notification = Notification.query.filter_by(
                id=notification_id,
                user_id=user_id
            ).first()
            
            if not notification:
                return {'error': 'Notification not found'}, 404
            
            notification.is_read = True
            notification.read_at = datetime.utcnow()
            db.session.commit()
            
            return {'message': 'Notification marked as read'}, 200
            
        except Exception as e:
            db.session.rollback()
            return {'error': str(e)}, 500
    
    @staticmethod
    def mark_all_as_read(user_id):
        """Mark all notifications as read"""
        try:
            Notification.query.filter_by(
                user_id=user_id,
                is_read=False
            ).update({
                'is_read': True,
                'read_at': datetime.utcnow()
            })
            
            db.session.commit()
            
            return {'message': 'All notifications marked as read'}, 200
            
        except Exception as e:
            db.session.rollback()
            return {'error': str(e)}, 500
    
    @staticmethod
    def delete_notification(notification_id, user_id):
        """Delete a notification"""
        try:
            notification = Notification.query.filter_by(
                id=notification_id,
                user_id=user_id
            ).first()
            
            if not notification:
                return {'error': 'Notification not found'}, 404
            
            db.session.delete(notification)
            db.session.commit()
            
            return {'message': 'Notification deleted'}, 200
            
        except Exception as e:
            db.session.rollback()
            return {'error': str(e)}, 500
    
    @staticmethod
    def send_bulk_notification(user_ids, title, message, type='system', **kwargs):
        """Send notification to multiple users"""
        try:
            notifications = []
            for user_id in user_ids:
                if user_id:  # Skip if user_id is None
                    notification = Notification(
                        user_id=user_id,
                        title=title,
                        message=message,
                        type=type,
                        **kwargs
                    )
                    notifications.append(notification)
            
            if notifications:
                db.session.add_all(notifications)
                db.session.commit()
            
            return {'message': f'Notifications sent to {len(notifications)} users'}, 200
            
        except Exception as e:
            db.session.rollback()
            return {'error': str(e)}, 500
    
    @staticmethod
    def send_appointment_reminder(appointment):
        """Send appointment reminder notification"""
        try:
            if not appointment or not appointment.customer:
                return False
            
            # Send notification
            NotificationService.create_notification(
                user_id=appointment.customer.user_id,
                title='Appointment Reminder',
                message=f'Reminder: Your appointment for {appointment.service.name if appointment.service else ""} is at {appointment.appointment_time} on {appointment.appointment_date}',
                type='appointment',
                priority='high',
                appointment_id=appointment.id
            )
            
            return True
            
        except Exception as e:
            print(f"Error sending appointment reminder: {e}")
            return False