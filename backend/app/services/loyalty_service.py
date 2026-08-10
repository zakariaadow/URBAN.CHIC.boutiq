from datetime import datetime
from app.extensions import db
from app.models.loyalty import Loyalty

class LoyaltyService:
    
    @staticmethod
    def add_points(customer_id, points, transaction_type='earn', reference_id=None, reference_type=None):
        """Add loyalty points for customer"""
        try:
            # Get or create loyalty record
            loyalty = Loyalty.query.filter_by(customer_id=customer_id).first()
            if not loyalty:
                loyalty = Loyalty(
                    customer_id=customer_id,
                    points=0,
                    tier='bronze',
                    total_points_earned=0,
                    total_points_redeemed=0
                )
                db.session.add(loyalty)
                db.session.flush()
            
            # Update points
            loyalty.points += points
            loyalty.total_points_earned += points
            loyalty.points_earned = points
            
            # Update tier based on points
            if loyalty.points >= 1000:
                loyalty.tier = 'platinum'
            elif loyalty.points >= 500:
                loyalty.tier = 'gold'
            elif loyalty.points >= 200:
                loyalty.tier = 'silver'
            else:
                loyalty.tier = 'bronze'
            
            # Create transaction record
            transaction = Loyalty(
                customer_id=customer_id,
                points=points,
                points_earned=points,
                transaction_type=transaction_type,
                reference_id=reference_id,
                reference_type=reference_type,
                notes=f'Added {points} points'
            )
            db.session.add(transaction)
            
            db.session.commit()
            
            return loyalty
            
        except Exception as e:
            db.session.rollback()
            print(f"Error adding loyalty points: {e}")
            return None
    
    @staticmethod
    def redeem_points(customer_id, points_to_redeem, reference_id=None, reference_type=None):
        """Redeem loyalty points"""
        try:
            loyalty = Loyalty.query.filter_by(customer_id=customer_id).first()
            if not loyalty or loyalty.points < points_to_redeem:
                return {'error': 'Insufficient points'}, 400
            
            if points_to_redeem <= 0:
                return {'error': 'Invalid points amount'}, 400
            
            # Deduct points
            loyalty.points -= points_to_redeem
            loyalty.total_points_redeemed += points_to_redeem
            loyalty.points_redeemed = points_to_redeem
            
            # Create transaction record
            transaction = Loyalty(
                customer_id=customer_id,
                points=points_to_redeem,
                points_redeemed=points_to_redeem,
                transaction_type='redeem',
                reference_id=reference_id,
                reference_type=reference_type,
                notes=f'Redeemed {points_to_redeem} points'
            )
            db.session.add(transaction)
            
            db.session.commit()
            
            return {'remaining_points': loyalty.points}, 200
            
        except Exception as e:
            db.session.rollback()
            return {'error': str(e)}, 500
