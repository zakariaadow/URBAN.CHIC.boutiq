from flask import Blueprint, request, jsonify
from app.controllers.payment_controller import PaymentController
from app.utils.auth import token_required, role_required

payment_bp = Blueprint('payment', __name__, url_prefix='/api/payments')

@payment_bp.route('/', methods=['GET'])
@token_required
def get_payments(current_user):
    """Get payments"""
    return PaymentController.get_payments(current_user, request.args)

@payment_bp.route('/<int:payment_id>', methods=['GET'])
@token_required
def get_payment(current_user, payment_id):
    """Get payment details"""
    return PaymentController.get_payment(current_user, payment_id)

@payment_bp.route('/', methods=['POST'])
@token_required
def create_payment(current_user):
    """Create a new payment"""
    return PaymentController.create_payment(current_user, request.json)

@payment_bp.route('/<int:payment_id>', methods=['PUT'])
@token_required
def update_payment(current_user, payment_id):
    """Update payment"""
    return PaymentController.update_payment(current_user, payment_id, request.json)

@payment_bp.route('/<int:payment_id>/verify', methods=['POST'])
@token_required
@role_required('finance', 'admin')
def verify_payment(current_user, payment_id):
    """Verify a payment"""
    return PaymentController.verify_payment(current_user, payment_id)

@payment_bp.route('/pending', methods=['GET'])
@token_required
@role_required('finance', 'admin')
def get_pending_payments(current_user):
    """Get pending payments"""
    return PaymentController.get_pending_payments(current_user)

@payment_bp.route('/methods', methods=['GET'])
def get_payment_methods():
    """Get available payment methods"""
    return PaymentController.get_payment_methods()

@payment_bp.route('/<int:payment_id>/receipt', methods=['GET'])
@token_required
def get_payment_receipt(current_user, payment_id):
    """Get payment receipt"""
    return PaymentController.get_payment_receipt(current_user, payment_id)

@payment_bp.route('/history', methods=['GET'])
@token_required
def get_payment_history(current_user):
    """Get payment history"""
    return PaymentController.get_payment_history(current_user, request.args)