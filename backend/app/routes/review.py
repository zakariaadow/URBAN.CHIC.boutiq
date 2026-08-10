from flask import Blueprint, request, jsonify
from app.controllers.review_controller import ReviewController
from app.utils.auth import login_required, role_required

review_bp = Blueprint('review', __name__, url_prefix='/api/reviews')

# Get all reviews
@review_bp.route('/', methods=['GET'])
def get_reviews():
    """Get all reviews"""
    return ReviewController.get_reviews(request.args)

# Create a new review
@review_bp.route('/', methods=['POST'])
@login_required
@role_required('customer')
def create_review(current_user):
    """Create a new review"""
    return ReviewController.create_review(current_user, request.json)

# Get review by ID
@review_bp.route('/<int:review_id>', methods=['GET'])
def get_review(review_id):
    """Get review details"""
    return ReviewController.get_review(review_id)

# Update review
@review_bp.route('/<int:review_id>', methods=['PUT'])
@login_required
@role_required('customer')
def update_review(current_user, review_id):
    """Update a review"""
    return ReviewController.update_review(current_user, review_id, request.json)

# Delete review
@review_bp.route('/<int:review_id>', methods=['DELETE'])
@login_required
@role_required('customer')
def delete_review(current_user, review_id):
    """Delete a review"""
    return ReviewController.delete_review(current_user, review_id)

# Get reviews by service
@review_bp.route('/service/<int:service_id>', methods=['GET'])
def get_reviews_by_service(service_id):
    """Get reviews by service"""
    return ReviewController.get_reviews_by_service(service_id, request.args)

# Get reviews by stylist
@review_bp.route('/stylist/<int:stylist_id>', methods=['GET'])
def get_reviews_by_stylist(stylist_id):
    """Get reviews by stylist"""
    return ReviewController.get_reviews_by_stylist(stylist_id, request.args)

# Get reviews by customer
@review_bp.route('/customer/<int:customer_id>', methods=['GET'])
@login_required
def get_reviews_by_customer(current_user, customer_id):
    """Get reviews by customer"""
    return ReviewController.get_reviews_by_customer(current_user, customer_id, request.args)

# Get reviews by rating
@review_bp.route('/rating/<int:rating>', methods=['GET'])
def get_reviews_by_rating(rating):
    """Get reviews by rating"""
    return ReviewController.get_reviews_by_rating(rating, request.args)

# Toggle review status
@review_bp.route('/<int:review_id>/toggle', methods=['POST'])
@login_required
@role_required(['admin', 'manager'])
def toggle_review(current_user, review_id):
    """Toggle review status"""
    return ReviewController.toggle_review(current_user, review_id)

# Report inappropriate review
@review_bp.route('/<int:review_id>/report', methods=['POST'])
@login_required
def report_review(current_user, review_id):
    """Report an inappropriate review"""
    return ReviewController.report_review(current_user, review_id, request.json)

# Get review statistics
@review_bp.route('/statistics', methods=['GET'])
def get_review_statistics():
    """Get review statistics"""
    return ReviewController.get_review_statistics(request.args)

# Get review analytics
@review_bp.route('/analytics', methods=['GET'])
@login_required
@role_required(['admin', 'manager'])
def get_review_analytics(current_user):
    """Get review analytics"""
    return ReviewController.get_review_analytics(current_user, request.args)

# Reply to review
@review_bp.route('/<int:review_id>/reply', methods=['POST'])
@login_required
@role_required(['admin', 'manager'])
def reply_to_review(current_user, review_id):
    """Reply to a review"""
    return ReviewController.reply_to_review(current_user, review_id, request.json)

# Export reviews
@review_bp.route('/export', methods=['POST'])
@login_required
@role_required(['admin', 'manager'])
def export_reviews(current_user):
    """Export reviews to file"""
    return ReviewController.export_reviews(current_user, request.json)