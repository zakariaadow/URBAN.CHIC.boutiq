from flask import current_app
from datetime import datetime
from app.extensions import db
from app.models import Promotion, Service, Product
from app.services.notification_service import NotificationService
import logging

logger = logging.getLogger(__name__)

class PromotionService:
    
    @staticmethod
    def get_active_promotions():
        """Get all active promotions"""
        try:
            now = datetime.utcnow()
            promotions = Promotion.query.filter(
                Promotion.is_active == True,
                Promotion.start_date <= now,
                Promotion.end_date >= now
            ).all()
            return [p.to_dict() for p in promotions], 200
        except Exception as e:
            logger.error(f"Error in get_active_promotions: {e}")
            return {'error': str(e)}, 500
    
    @staticmethod
    def get_promotion_by_code(code):
        """Get promotion by code"""
        try:
            now = datetime.utcnow()
            promotion = Promotion.query.filter(
                Promotion.code == code,
                Promotion.is_active == True,
                Promotion.start_date <= now,
                Promotion.end_date >= now
            ).first()
            
            if not promotion:
                return {'error': 'Promotion not found or expired'}, 404
            
            return promotion.to_dict(), 200
        except Exception as e:
            logger.error(f"Error in get_promotion_by_code: {e}")
            return {'error': str(e)}, 500
    
    @staticmethod
    def validate_promotion(promotion_id, customer_id, amount):
        """Validate if promotion can be applied"""
        try:
            promotion = Promotion.query.get(promotion_id)
            if not promotion:
                return {'error': 'Promotion not found'}, 404
            
            now = datetime.utcnow()
            if not promotion.is_active:
                return {'error': 'Promotion is not active'}, 400
            
            if promotion.start_date > now or promotion.end_date < now:
                return {'error': 'Promotion has expired'}, 400
            
            if promotion.min_spend and amount < promotion.min_spend:
                return {'error': f'Minimum spend of {promotion.min_spend} required'}, 400
            
            if promotion.usage_limit and promotion.usage_count >= promotion.usage_limit:
                return {'error': 'Promotion usage limit reached'}, 400
            
            # Calculate discount
            if promotion.discount_type == 'percentage':
                discount = amount * (promotion.discount_value / 100)
                if promotion.max_discount and discount > promotion.max_discount:
                    discount = promotion.max_discount
            else:  # fixed amount
                discount = promotion.discount_value
            
            return {
                'valid': True,
                'discount': discount,
                'promotion': promotion.to_dict()
            }, 200
            
        except Exception as e:
            logger.error(f"Error in validate_promotion: {e}")
            return {'error': str(e)}, 500
    
    @staticmethod
    def apply_promotion(promotion_id, customer_id, amount):
        """Apply promotion and update usage count"""
        try:
            result, status_code = PromotionService.validate_promotion(promotion_id, customer_id, amount)
            if status_code != 200:
                return result, status_code
            
            promotion = Promotion.query.get(promotion_id)
            promotion.usage_count += 1
            db.session.commit()
            
            return {
                'message': 'Promotion applied successfully',
                'discount': result['discount'],
                'promotion': promotion.to_dict()
            }, 200
            
        except Exception as e:
            db.session.rollback()
            logger.error(f"Error in apply_promotion: {e}")
            return {'error': str(e)}, 500
    
    @staticmethod
    def create_promotion(data):
        """Create a new promotion"""
        try:
            promotion = Promotion(
                name=data['name'],
                description=data.get('description'),
                code=data.get('code'),
                discount_type=data['discount_type'],
                discount_value=data['discount_value'],
                start_date=data['start_date'],
                end_date=data['end_date'],
                min_spend=data.get('min_spend', 0),
                max_discount=data.get('max_discount'),
                usage_limit=data.get('usage_limit'),
                per_user_limit=data.get('per_user_limit', 1),
                applicable_to=data.get('applicable_to', 'all'),
                is_active=data.get('is_active', True),
                is_public=data.get('is_public', True),
                image=data.get('image'),
                terms=data.get('terms')
            )
            
            db.session.add(promotion)
            db.session.commit()
            
            return promotion.to_dict(), 201
            
        except Exception as e:
            db.session.rollback()
            logger.error(f"Error in create_promotion: {e}")
            return {'error': str(e)}, 500
    
    @staticmethod
    def update_promotion(promotion_id, data):
        """Update an existing promotion"""
        try:
            promotion = Promotion.query.get(promotion_id)
            if not promotion:
                return {'error': 'Promotion not found'}, 404
            
            for key, value in data.items():
                if hasattr(promotion, key):
                    setattr(promotion, key, value)
            
            db.session.commit()
            return promotion.to_dict(), 200
            
        except Exception as e:
            db.session.rollback()
            logger.error(f"Error in update_promotion: {e}")
            return {'error': str(e)}, 500
    
    @staticmethod
    def delete_promotion(promotion_id):
        """Delete a promotion"""
        try:
            promotion = Promotion.query.get(promotion_id)
            if not promotion:
                return {'error': 'Promotion not found'}, 404
            
            db.session.delete(promotion)
            db.session.commit()
            
            return {'message': 'Promotion deleted successfully'}, 200
            
        except Exception as e:
            db.session.rollback()
            logger.error(f"Error in delete_promotion: {e}")
            return {'error': str(e)}, 500