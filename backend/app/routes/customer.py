from flask import Blueprint, request, jsonify
from app.controllers.customer_controller import CustomerController
from app.utils.auth import token_required, role_required

customer_bp = Blueprint('customer', __name__, url_prefix='/api/customer')

# Dashboard
@customer_bp.route('/dashboard', methods=['GET'])
@token_required
@role_required('customer')
def dashboard(current_user):
    """Customer dashboard data"""
    return CustomerController.get_dashboard(current_user)

# Profile Management
@customer_bp.route('/profile', methods=['GET'])
@token_required
@role_required('customer')
def get_profile(current_user):
    """Get customer profile"""
    return CustomerController.get_profile(current_user)

@customer_bp.route('/profile', methods=['PUT'])
@token_required
@role_required('customer')
def update_profile(current_user):
    """Update customer profile"""
    return CustomerController.update_profile(current_user, request.json)

@customer_bp.route('/profile/photo', methods=['POST'])
@token_required
@role_required('customer')
def upload_photo(current_user):
    """Upload profile photo"""
    return CustomerController.upload_photo(current_user, request.files)

@customer_bp.route('/profile/delete', methods=['DELETE'])
@token_required
@role_required('customer')
def delete_account(current_user):
    """Delete customer account"""
    return CustomerController.delete_account(current_user)

# ==================== APPOINTMENT BOOKING ====================
@customer_bp.route('/appointments/book', methods=['POST'])
@token_required
@role_required('customer')
def book_appointment(current_user):
    """Book a new appointment (single service)"""
    return CustomerController.book_appointment(current_user, request.json)

@customer_bp.route('/appointments/book-multiple', methods=['POST'])
@token_required
@role_required('customer')
def book_multiple_appointments(current_user):
    """Book multiple services in one appointment with single payment"""
    return CustomerController.book_multiple_appointments(current_user, request.json)

@customer_bp.route('/appointments/branches', methods=['GET'])
@token_required
@role_required('customer')
def get_branches(current_user):
    """Get branches for appointment booking"""
    return CustomerController.get_branches(current_user)

@customer_bp.route('/appointments/services', methods=['GET'])
@token_required
@role_required('customer')
def get_services(current_user):
    """Get services for appointment booking"""
    return CustomerController.get_services(current_user, request.args)

@customer_bp.route('/appointments/stylists', methods=['GET'])
@token_required
@role_required('customer')
def get_stylists(current_user):
    """Get stylists for appointment booking"""
    return CustomerController.get_stylists(current_user, request.args)

@customer_bp.route('/appointments/available-slots', methods=['GET'])
@token_required
@role_required('customer')
def get_available_slots(current_user):
    """Get available time slots"""
    return CustomerController.get_available_slots(current_user, request.args)

@customer_bp.route('/appointments/history', methods=['GET'])
@token_required
@role_required('customer')
def appointment_history(current_user):
    """Get customer appointment history"""
    return CustomerController.get_appointment_history(current_user, request.args)

@customer_bp.route('/appointments/upcoming', methods=['GET'])
@token_required
@role_required('customer')
def upcoming_appointments(current_user):
    """Get upcoming appointments"""
    return CustomerController.get_upcoming_appointments(current_user)

@customer_bp.route('/appointments/<int:appointment_id>', methods=['GET'])
@token_required
@role_required('customer')
def get_appointment(current_user, appointment_id):
    """Get specific appointment details"""
    return CustomerController.get_appointment(current_user, appointment_id)

@customer_bp.route('/appointments/<int:appointment_id>/cancel', methods=['POST'])
@token_required
@role_required('customer')
def cancel_appointment(current_user, appointment_id):
    """Cancel an appointment"""
    return CustomerController.cancel_appointment(current_user, appointment_id)

@customer_bp.route('/appointments/<int:appointment_id>/reschedule', methods=['PUT'])
@token_required
@role_required('customer')
def reschedule_appointment(current_user, appointment_id):
    """Reschedule an appointment"""
    return CustomerController.reschedule_appointment(current_user, appointment_id, request.json)

# ==================== PAYMENTS ====================
@customer_bp.route('/payments', methods=['GET'])
@token_required
@role_required('customer')
def get_payments(current_user):
    """Get customer payments"""
    return CustomerController.get_payments(current_user, request.args)

@customer_bp.route('/payments', methods=['POST'])
@token_required
@role_required('customer')
def create_payment(current_user):
    """Create a new payment"""
    return CustomerController.create_payment(current_user, request.json)

@customer_bp.route('/payments/<int:payment_id>', methods=['GET'])
@token_required
@role_required('customer')
def get_payment(current_user, payment_id):
    """Get specific payment details"""
    return CustomerController.get_payment(current_user, payment_id)

@customer_bp.route('/payments/<int:payment_id>/receipt', methods=['GET'])
@token_required
@role_required('customer')
def get_payment_receipt(current_user, payment_id):
    """Get payment receipt"""
    return CustomerController.get_receipt(current_user, payment_id)

@customer_bp.route('/payments/<int:payment_id>/pay', methods=['POST'])
@token_required
@role_required('customer')
def process_payment(current_user, payment_id):
    """Process a payment"""
    return CustomerController.process_payment(current_user, payment_id, request.json)

@customer_bp.route('/payments/make', methods=['POST'])
@token_required
@role_required('customer')
def make_payment(current_user):
    """Make a payment"""
    return CustomerController.make_payment(current_user, request.json)

@customer_bp.route('/payments/methods', methods=['GET'])
@token_required
@role_required('customer')
def get_payment_methods(current_user):
    """Get available payment methods"""
    return CustomerController.get_payment_methods(current_user)

@customer_bp.route('/payments/<int:payment_id>/receipt/download', methods=['GET'])
@token_required
@role_required('customer')
def download_payment_receipt(current_user, payment_id):
    """Download receipt for a payment"""
    return CustomerController.download_payment_receipt(current_user, payment_id)

# ==================== RECEIPTS ====================
@customer_bp.route('/receipts', methods=['GET'])
@token_required
@role_required('customer')
def get_customer_receipts(current_user):
    """Get customer receipts"""
    return CustomerController.get_receipts(current_user, request.args)

@customer_bp.route('/receipts/<int:receipt_id>/download', methods=['GET'])
@token_required
@role_required('customer')
def download_receipt(current_user, receipt_id):
    """Download receipt by receipt ID"""
    return CustomerController.download_receipt(current_user, receipt_id)

@customer_bp.route('/receipts/<int:receipt_id>/send', methods=['POST'])
@token_required
@role_required('customer')
def send_customer_receipt(current_user, receipt_id):
    """Send receipt via email or SMS"""
    return CustomerController.send_receipt(current_user, receipt_id, request.json)

# ==================== LOYALTY POINTS ====================
@customer_bp.route('/loyalty/points', methods=['GET'])
@token_required
@role_required('customer')
def get_loyalty_points(current_user):
    """Get customer loyalty points"""
    return CustomerController.get_loyalty_points(current_user)

@customer_bp.route('/loyalty/history', methods=['GET'])
@token_required
@role_required('customer')
def get_loyalty_history(current_user):
    """Get loyalty points history"""
    return CustomerController.get_loyalty_history(current_user)

@customer_bp.route('/loyalty/redeem', methods=['POST'])
@token_required
@role_required('customer')
def redeem_points(current_user):
    """Redeem loyalty points"""
    return CustomerController.redeem_points(current_user, request.json)

# ==================== REVIEWS ====================
@customer_bp.route('/reviews', methods=['GET'])
@token_required
@role_required('customer')
def get_reviews(current_user):
    """Get customer reviews"""
    return CustomerController.get_reviews(current_user)

@customer_bp.route('/reviews', methods=['POST'])
@token_required
@role_required('customer')
def create_review(current_user):
    """Create a review"""
    return CustomerController.create_review(current_user, request.json)

@customer_bp.route('/reviews/<int:review_id>', methods=['PUT'])
@token_required
@role_required('customer')
def update_review(current_user, review_id):
    """Update a review"""
    return CustomerController.update_review(current_user, review_id, request.json)

@customer_bp.route('/reviews/<int:review_id>', methods=['DELETE'])
@token_required
@role_required('customer')
def delete_review(current_user, review_id):
    """Delete a review"""
    return CustomerController.delete_review(current_user, review_id)

# ==================== NOTIFICATIONS ====================
@customer_bp.route('/notifications', methods=['GET'])
@token_required
@role_required('customer')
def get_notifications(current_user):
    """Get customer notifications"""
    return CustomerController.get_notifications(current_user, request.args)

@customer_bp.route('/notifications/unread', methods=['GET'])
@token_required
@role_required('customer')
def get_unread_notifications(current_user):
    """Get unread notifications"""
    return CustomerController.get_unread_notifications(current_user)

@customer_bp.route('/notifications/<int:notification_id>/read', methods=['POST'])
@token_required
@role_required('customer')
def mark_notification_read(current_user, notification_id):
    """Mark notification as read"""
    return CustomerController.mark_notification_read(current_user, notification_id)

@customer_bp.route('/notifications/read-all', methods=['POST'])
@token_required
@role_required('customer')
def mark_all_notifications_read(current_user):
    """Mark all notifications as read"""
    return CustomerController.mark_all_notifications_read(current_user)

@customer_bp.route('/notifications/<int:notification_id>', methods=['DELETE'])
@token_required
@role_required('customer')
def delete_notification(current_user, notification_id):
    """Delete a notification"""
    return CustomerController.delete_notification(current_user, notification_id)

# ==================== FAVORITES ====================
@customer_bp.route('/favorites/services', methods=['GET'])
@token_required
@role_required('customer')
def get_favorite_services(current_user):
    """Get favorite services"""
    return CustomerController.get_favorite_services(current_user)

@customer_bp.route('/favorites/services/<int:service_id>', methods=['POST'])
@token_required
@role_required('customer')
def toggle_favorite_service(current_user, service_id):
    """Toggle favorite service"""
    return CustomerController.toggle_favorite_service(current_user, service_id)

@customer_bp.route('/favorites/stylists', methods=['GET'])
@token_required
@role_required('customer')
def get_favorite_stylists(current_user):
    """Get favorite stylists"""
    return CustomerController.get_favorite_stylists(current_user)

# ==================== CART / CHECKOUT ====================
@customer_bp.route('/cart', methods=['GET'])
@token_required
@role_required('customer')
def get_cart(current_user):
    """Get current customer cart"""
    return CustomerController.get_cart(current_user)

@customer_bp.route('/cart', methods=['POST'])
@token_required
@role_required('customer')
def add_to_cart(current_user):
    """Add service to cart"""
    return CustomerController.add_to_cart(current_user, request.json)

@customer_bp.route('/cart/<int:service_id>', methods=['DELETE'])
@token_required
@role_required('customer')
def remove_from_cart(current_user, service_id):
    """Remove service from cart"""
    return CustomerController.remove_from_cart(current_user, service_id)

@customer_bp.route('/cart/clear', methods=['DELETE'])
@token_required
@role_required('customer')
def clear_cart(current_user):
    """Clear cart"""
    return CustomerController.clear_cart(current_user)

@customer_bp.route('/checkout', methods=['POST'])
@token_required
@role_required('customer')
def checkout(current_user):
    """Checkout and process payment for all cart items"""
    return CustomerController.checkout(current_user, request.json)