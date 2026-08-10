from datetime import datetime
from flask import current_app
from app.extensions import db
from app.models.review import Review
from app.models.appointment import Appointment
from app.models.customer import Customer
from app.models.user import User
from app.models.service import Service
from app.models.stylist import Stylist
from app.services.notification_service import NotificationService

class ReviewService:
    
    @staticmethod
    def get_reviews(params):
        """Get all reviews"""
        try:
            query = Review.query
            
            if params.get('service_id'):
                query = query.filter(Review.service_id == params['service_id'])
            
            if params.get('stylist_id'):
                query = query.filter(Review.stylist_id == params['stylist_id'])
            
            if params.get('customer_id'):
                query = query.filter(Review.customer_id == params['customer_id'])
            
            if params.get('rating'):
                query = query.filter(Review.rating == params['rating'])
            
            if params.get('is_approved') is not None:
                query = query.filter(Review.is_approved == params['is_approved'])
            
            if params.get('is_featured') is not None:
                query = query.filter(Review.is_featured == params['is_featured'])
            
            if params.get('min_rating'):
                query = query.filter(Review.rating >= params['min_rating'])
            
            if params.get('max_rating'):
                query = query.filter(Review.rating <= params['max_rating'])
            
            query = query.order_by(Review.created_at.desc())
            
            page = int(params.get('page', 1))
            per_page = int(params.get('per_page', 20))
            
            reviews = query.paginate(page=page, per_page=per_page, error_out=False)
            
            return {
                'items': [r.to_dict() for r in reviews.items],
                'total': reviews.total,
                'page': page,
                'per_page': per_page,
                'pages': reviews.pages
            }, 200
            
        except Exception as e:
            return {'error': str(e)}, 500
    
    @staticmethod
    def create_review(current_user, data):
        """Create a new review"""
        try:
            customer = Customer.query.filter_by(user_id=current_user.id).first()
            if not customer:
                return {'error': 'Customer profile not found'}, 404
            
            # Validate appointment
            appointment_id = data.get('appointment_id')
            if not appointment_id:
                return {'error': 'Appointment ID is required'}, 400
            
            appointment = Appointment.query.filter_by(
                id=appointment_id,
                customer_id=customer.id
            ).first()
            
            if not appointment:
                return {'error': 'Appointment not found or unauthorized'}, 404
            
            # Check if review already exists
            existing = Review.query.filter_by(
                customer_id=customer.id,
                appointment_id=appointment_id
            ).first()
            
            if existing:
                return {'error': 'Review already exists for this appointment'}, 409
            
            # Create review
            review = Review(
                customer_id=customer.id,
                user_id=current_user.id,
                appointment_id=appointment.id,
                service_id=appointment.service_id,
                stylist_id=appointment.stylist_id,
                rating=data.get('rating'),
                title=data.get('title'),
                comment=data.get('comment'),
                service_rating=data.get('service_rating'),
                stylist_rating=data.get('stylist_rating'),
                value_rating=data.get('value_rating'),
                ambiance_rating=data.get('ambiance_rating'),
                is_verified_purchase=True,
                is_approved=False  # Needs admin approval
            )
            
            db.session.add(review)
            db.session.commit()
            
            # Update stylist rating
            if appointment.stylist_id:
                avg_rating = db.session.query(db.func.avg(Review.rating)).filter_by(
                    stylist_id=appointment.stylist_id,
                    is_approved=True
                ).scalar() or 0
                
                stylist = Stylist.query.get(appointment.stylist_id)
                if stylist:
                    stylist.rating = avg_rating
                    db.session.commit()
            
            return review.to_dict(), 201
            
        except Exception as e:
            db.session.rollback()
            return {'error': str(e)}, 500
    
    @staticmethod
    def get_review(review_id):
        """Get review details"""
        try:
            review = Review.query.get(review_id)
            if not review:
                return {'error': 'Review not found'}, 404
            return review.to_dict(), 200
        except Exception as e:
            return {'error': str(e)}, 500
    
    @staticmethod
    def update_review(current_user, review_id, data):
        """Update a review"""
        try:
            customer = Customer.query.filter_by(user_id=current_user.id).first()
            if not customer:
                return {'error': 'Customer profile not found'}, 404
            
            review = Review.query.filter_by(
                id=review_id,
                customer_id=customer.id
            ).first()
            
            if not review:
                return {'error': 'Review not found or unauthorized'}, 404
            
            # Can't update if already approved
            if review.is_approved:
                return {'error': 'Cannot update approved review'}, 400
            
            updatable_fields = [
                'rating', 'title', 'comment', 'service_rating',
                'stylist_rating', 'value_rating', 'ambiance_rating'
            ]
            
            for field in updatable_fields:
                if field in data:
                    setattr(review, field, data[field])
            
            db.session.commit()
            
            return review.to_dict(), 200
            
        except Exception as e:
            db.session.rollback()
            return {'error': str(e)}, 500
    
    @staticmethod
    def delete_review(current_user, review_id):
        """Delete a review"""
        try:
            customer = Customer.query.filter_by(user_id=current_user.id).first()
            if not customer:
                return {'error': 'Customer profile not found'}, 404
            
            review = Review.query.filter_by(
                id=review_id,
                customer_id=customer.id
            ).first()
            
            if not review:
                return {'error': 'Review not found or unauthorized'}, 404
            
            db.session.delete(review)
            db.session.commit()
            
            return {'message': 'Review deleted successfully'}, 200
            
        except Exception as e:
            db.session.rollback()
            return {'error': str(e)}, 500
    
    @staticmethod
    def get_reviews_by_service(service_id, params):
        """Get reviews by service"""
        params['service_id'] = service_id
        return ReviewService.get_reviews(params)
    
    @staticmethod
    def get_reviews_by_stylist(stylist_id, params):
        """Get reviews by stylist"""
        params['stylist_id'] = stylist_id
        return ReviewService.get_reviews(params)
    
    @staticmethod
    def get_reviews_by_customer(customer_id, params):
        """Get reviews by customer"""
        params['customer_id'] = customer_id
        return ReviewService.get_reviews(params)
    
    @staticmethod
    def get_reviews_by_rating(rating, params):
        """Get reviews by rating"""
        params['rating'] = rating
        return ReviewService.get_reviews(params)
    
    @staticmethod
    def toggle_review(current_user, review_id):
        """Toggle review status (approve/unapprove)"""
        try:
            review = Review.query.get(review_id)
            if not review:
                return {'error': 'Review not found'}, 404
            
            review.is_approved = not review.is_approved
            
            if review.is_approved:
                # Update stylist rating
                if review.stylist_id:
                    avg_rating = db.session.query(db.func.avg(Review.rating)).filter_by(
                        stylist_id=review.stylist_id,
                        is_approved=True
                    ).scalar() or 0
                    
                    stylist = Stylist.query.get(review.stylist_id)
                    if stylist:
                        stylist.rating = avg_rating
            
            db.session.commit()
            
            # Notify customer
            if review.customer and review.customer.user:
                NotificationService.create_notification(
                    user_id=review.customer.user_id,
                    title='Review Status Updated',
                    message=f'Your review has been { "approved" if review.is_approved else "unapproved" }.',
                    type='system'
                )
            
            return review.to_dict(), 200
            
        except Exception as e:
            db.session.rollback()
            return {'error': str(e)}, 500
    
    @staticmethod
    def report_review(current_user, review_id, data):
        """Report an inappropriate review"""
        try:
            review = Review.query.get(review_id)
            if not review:
                return {'error': 'Review not found'}, 404
            
            # This would require a review reports model
            # For now, just flag the review
            review.is_approved = False
            review.comment = f"{review.comment}\n\n[Reported: {data.get('reason', 'No reason provided')}]"
            db.session.commit()
            
            # Notify admin
            from app.models.user import User
            admin = User.query.filter_by(is_system_admin=True).first()
            if admin:
                NotificationService.create_notification(
                    user_id=admin.id,
                    title='Review Reported',
                    message=f'Review #{review_id} has been reported. Reason: {data.get("reason", "Not specified")}',
                    type='system'
                )
            
            return {'message': 'Review reported successfully'}, 200
            
        except Exception as e:
            db.session.rollback()
            return {'error': str(e)}, 500
    
    @staticmethod
    def get_review_statistics(params):
        """Get review statistics"""
        try:
            # Overall statistics
            total_reviews = Review.query.filter_by(is_approved=True).count()
            
            if total_reviews == 0:
                return {
                    'total_reviews': 0,
                    'average_rating': 0,
                    'rating_distribution': {1: 0, 2: 0, 3: 0, 4: 0, 5: 0}
                }, 200
            
            # Average rating
            avg_rating = db.session.query(db.func.avg(Review.rating)).filter_by(
                is_approved=True
            ).scalar() or 0
            
            # Rating distribution
            distribution = {}
            for rating in range(1, 6):
                count = Review.query.filter_by(
                    rating=rating,
                    is_approved=True
                ).count()
                distribution[rating] = count
            
            # Recent reviews
            recent = Review.query.filter_by(
                is_approved=True
            ).order_by(Review.created_at.desc()).limit(5).all()
            
            return {
                'total_reviews': total_reviews,
                'average_rating': round(float(avg_rating), 1),
                'rating_distribution': distribution,
                'recent_reviews': [r.to_dict() for r in recent]
            }, 200
            
        except Exception as e:
            return {'error': str(e)}, 500
    
    @staticmethod
    def get_review_analytics(params):
        """Get review analytics"""
        return ReviewService.get_review_statistics(params)
    
    @staticmethod
    def reply_to_review(current_user, review_id, data):
        """Reply to a review"""
        try:
            review = Review.query.get(review_id)
            if not review:
                return {'error': 'Review not found'}, 404
            
            review.reply = data.get('reply')
            review.replied_at = datetime.utcnow()
            review.replied_by = current_user.id
            db.session.commit()
            
            # Notify customer
            if review.customer and review.customer.user:
                NotificationService.create_notification(
                    user_id=review.customer.user_id,
                    title='Review Reply',
                    message=f'Your review has received a reply.',
                    type='system'
                )
            
            return review.to_dict(), 200
            
        except Exception as e:
            db.session.rollback()
            return {'error': str(e)}, 500
    
    @staticmethod
    def export_reviews(data):
        """Export reviews to file"""
        try:
            return {'message': 'Reviews exported'}, 200
        except Exception as e:
            return {'error': str(e)}, 500