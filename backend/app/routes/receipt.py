from flask import Blueprint, request, send_file, jsonify
from app.controllers.receipt_controller import ReceiptController
from app.utils.auth import login_required, role_required, token_required
import logging

logger = logging.getLogger(__name__)

receipt_bp = Blueprint('receipt', __name__, url_prefix='/api/receipts')

# ==================== GET RECEIPTS ====================
@receipt_bp.route('/', methods=['GET'])
@token_required
@role_required('admin', 'finance', 'customer')
def get_receipts(current_user):
    """Get all receipts"""
    return ReceiptController.get_receipts(current_user, request.args)

@receipt_bp.route('/<int:receipt_id>', methods=['GET'])
@token_required
@role_required('admin', 'finance', 'customer')
def get_receipt(current_user, receipt_id):
    """Get receipt details"""
    return ReceiptController.get_receipt(current_user, receipt_id)

@receipt_bp.route('/payment/<int:payment_id>', methods=['GET'])
@token_required
@role_required('admin', 'finance', 'customer')
def get_receipt_by_payment(current_user, payment_id):
    """Get receipt by payment ID"""
    return ReceiptController.get_receipt_by_payment(current_user, payment_id)

@receipt_bp.route('/customer/<int:customer_id>', methods=['GET'])
@token_required
@role_required('admin', 'finance', 'customer')
def get_customer_receipts(current_user, customer_id):
    """Get customer receipts"""
    return ReceiptController.get_customer_receipts(current_user, customer_id, request.args)

# ==================== GENERATE RECEIPTS ====================
@receipt_bp.route('/payment/<int:payment_id>/generate', methods=['POST'])
@token_required
@role_required('admin', 'finance')
def generate_receipt(current_user, payment_id):
    """Generate a new receipt for a payment"""
    return ReceiptController.generate_receipt(current_user, payment_id)

@receipt_bp.route('/payment/<int:payment_id>/generate-logo', methods=['POST'])
@token_required
@role_required('admin', 'finance')
def generate_receipt_with_logo(current_user, payment_id):
    """Generate receipt with logo for a payment"""
    return ReceiptController.generate_receipt_with_logo(current_user, payment_id)

@receipt_bp.route('/<int:receipt_id>/regenerate-logo', methods=['POST'])
@token_required
@role_required('admin', 'finance')
def regenerate_receipt_with_logo(current_user, receipt_id):
    """Regenerate receipt PDF with logo"""
    return ReceiptController.regenerate_receipt_with_logo(current_user, receipt_id)

# ==================== DOWNLOAD RECEIPTS ====================
@receipt_bp.route('/<int:receipt_id>/download', methods=['GET'])
@token_required
@role_required('admin', 'finance', 'customer')
def download_receipt(current_user, receipt_id):
    """Download receipt PDF"""
    return ReceiptController.download_receipt(current_user, receipt_id)

@receipt_bp.route('/<int:receipt_id>/pdf', methods=['GET'])
@token_required
@role_required('admin', 'finance', 'customer')
def download_receipt_pdf(current_user, receipt_id):
    """Download receipt PDF with logo"""
    return ReceiptController.download_pdf(current_user, receipt_id)

@receipt_bp.route('/<int:receipt_id>/pdf-logo', methods=['GET'])
@token_required
@role_required('admin', 'finance', 'customer')
def download_receipt_pdf_with_logo(current_user, receipt_id):
    """Download receipt PDF with logo (explicit)"""
    return ReceiptController.download_pdf_with_logo(current_user, receipt_id)

@receipt_bp.route('/<int:receipt_id>/preview', methods=['GET'])
@token_required
@role_required('admin', 'finance', 'customer')
def preview_receipt(current_user, receipt_id):
    """Preview receipt PDF (inline)"""
    return ReceiptController.preview_receipt(current_user, receipt_id)

# ==================== PRINT RECEIPTS ====================
@receipt_bp.route('/<int:receipt_id>/print', methods=['GET'])
@token_required
@role_required('admin', 'finance', 'customer')
def print_receipt(current_user, receipt_id):
    """Print receipt (opens PDF in new window)"""
    return ReceiptController.print_receipt(current_user, receipt_id)

# ==================== EMAIL RECEIPTS ====================
@receipt_bp.route('/<int:receipt_id>/email', methods=['POST'])
@token_required
@role_required('admin', 'finance')
def send_receipt_email(current_user, receipt_id):
    """Send receipt via email with logo"""
    return ReceiptController.send_email(current_user, receipt_id, request.json)

@receipt_bp.route('/<int:receipt_id>/email/send', methods=['POST'])
@token_required
@role_required('admin', 'finance')
def send_receipt_email_custom(current_user, receipt_id):
    """Send receipt via email with custom recipient"""
    return ReceiptController.send_email(current_user, receipt_id, request.json)

@receipt_bp.route('/<int:receipt_id>/email/resend', methods=['POST'])
@token_required
@role_required('admin', 'finance')
def resend_receipt_email(current_user, receipt_id):
    """Resend receipt via email"""
    return ReceiptController.resend_email(current_user, receipt_id, request.json)

# ==================== SMS RECEIPTS ====================
@receipt_bp.route('/<int:receipt_id>/sms', methods=['POST'])
@token_required
@role_required('admin', 'finance')
def send_receipt_sms(current_user, receipt_id):
    """Send receipt via SMS with link"""
    return ReceiptController.send_sms(current_user, receipt_id, request.json)

@receipt_bp.route('/<int:receipt_id>/sms/send', methods=['POST'])
@token_required
@role_required('admin', 'finance')
def send_receipt_sms_custom(current_user, receipt_id):
    """Send receipt via SMS with custom phone number"""
    return ReceiptController.send_sms(current_user, receipt_id, request.json)

@receipt_bp.route('/<int:receipt_id>/sms/resend', methods=['POST'])
@token_required
@role_required('admin', 'finance')
def resend_receipt_sms(current_user, receipt_id):
    """Resend receipt via SMS"""
    return ReceiptController.resend_sms(current_user, receipt_id, request.json)

# ==================== BULK OPERATIONS ====================
@receipt_bp.route('/bulk/email', methods=['POST'])
@token_required
@role_required('admin', 'finance')
def send_bulk_receipt_email(current_user):
    """Send multiple receipts via email"""
    return ReceiptController.send_bulk_email(current_user, request.json)

@receipt_bp.route('/bulk/sms', methods=['POST'])
@token_required
@role_required('admin', 'finance')
def send_bulk_receipt_sms(current_user):
    """Send multiple receipts via SMS"""
    return ReceiptController.send_bulk_sms(current_user, request.json)

@receipt_bp.route('/bulk/download', methods=['POST'])
@token_required
@role_required('admin', 'finance')
def download_bulk_receipts(current_user):
    """Download multiple receipts as ZIP"""
    return ReceiptController.download_bulk_receipts(current_user, request.json)

# ==================== RECEIPT STATUS ====================
@receipt_bp.route('/<int:receipt_id>/status', methods=['PUT'])
@token_required
@role_required('admin', 'finance')
def update_receipt_status(current_user, receipt_id):
    """Update receipt status"""
    return ReceiptController.update_status(current_user, receipt_id, request.json)

@receipt_bp.route('/<int:receipt_id>/mark-sent', methods=['POST'])
@token_required
@role_required('admin', 'finance')
def mark_receipt_sent(current_user, receipt_id):
    """Mark receipt as sent"""
    return ReceiptController.mark_sent(current_user, receipt_id, request.json)

# ==================== RECEIPT STATISTICS ====================
@receipt_bp.route('/stats', methods=['GET'])
@token_required
@role_required('admin', 'finance')
def get_receipt_stats(current_user):
    """Get receipt statistics"""
    return ReceiptController.get_stats(current_user, request.args)

# ==================== RECEIPT SUMMARY ====================
@receipt_bp.route('/<int:receipt_id>/summary', methods=['GET'])
@token_required
@role_required('admin', 'finance', 'customer')
def get_receipt_summary(current_user, receipt_id):
    """Get receipt summary (for printing/display)"""
    return ReceiptController.get_summary(current_user, receipt_id)