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

# ==================== GENERATE RECEIPTS - ✅ FIXED ====================
@receipt_bp.route('/payment/<int:payment_id>/generate', methods=['POST'])
@token_required
@role_required('admin', 'finance')
def generate_receipt(current_user, payment_id):
    """
    Generate a new receipt for a payment
    ✅ REQUIRES: Payment must be verified by finance first
    """
    return ReceiptController.generate_receipt(current_user, payment_id)

@receipt_bp.route('/payment/<int:payment_id>/generate-logo', methods=['POST'])
@token_required
@role_required('admin', 'finance')
def generate_receipt_with_logo(current_user, payment_id):
    """
    Generate receipt with logo for a payment
    ✅ REQUIRES: Payment must be verified by finance first
    """
    return ReceiptController.generate_receipt_with_logo(current_user, payment_id)

@receipt_bp.route('/<int:receipt_id>/regenerate-logo', methods=['POST'])
@token_required
@role_required('admin', 'finance')
def regenerate_receipt_with_logo(current_user, receipt_id):
    """
    Regenerate receipt PDF with logo
    ✅ REQUIRES: Payment must be verified by finance first
    """
    return ReceiptController.regenerate_receipt_with_logo(current_user, receipt_id)

# ==================== DOWNLOAD RECEIPTS - ✅ FIXED ====================
@receipt_bp.route('/<int:receipt_id>/download', methods=['GET'])
@token_required
@role_required('admin', 'finance', 'customer')
def download_receipt(current_user, receipt_id):
    """
    Download receipt PDF
    ✅ REQUIRES: Payment must be verified by finance first
    ❌ Customers CANNOT download if not verified
    """
    return ReceiptController.download_pdf(current_user, receipt_id)

@receipt_bp.route('/<int:receipt_id>/pdf', methods=['GET'])
@token_required
@role_required('admin', 'finance', 'customer')
def download_receipt_pdf(current_user, receipt_id):
    """
    Download receipt PDF with logo
    ✅ REQUIRES: Payment must be verified by finance first
    ❌ Customers CANNOT download if not verified
    """
    return ReceiptController.download_pdf_with_logo(current_user, receipt_id)

@receipt_bp.route('/<int:receipt_id>/pdf-logo', methods=['GET'])
@token_required
@role_required('admin', 'finance', 'customer')
def download_receipt_pdf_with_logo(current_user, receipt_id):
    """
    Download receipt PDF with logo (explicit)
    ✅ REQUIRES: Payment must be verified by finance first
    ❌ Customers CANNOT download if not verified
    """
    return ReceiptController.download_pdf_with_logo(current_user, receipt_id)

@receipt_bp.route('/<int:receipt_id>/preview', methods=['GET'])
@token_required
@role_required('admin', 'finance', 'customer')
def preview_receipt(current_user, receipt_id):
    """
    Preview receipt PDF (inline)
    ✅ REQUIRES: Payment must be verified by finance first
    ❌ Customers CANNOT preview if not verified
    """
    return ReceiptController.preview_pdf(current_user, receipt_id)

# ==================== PRINT RECEIPTS - ✅ FIXED ====================
@receipt_bp.route('/<int:receipt_id>/print', methods=['GET'])
@token_required
@role_required('admin', 'finance', 'customer')
def print_receipt(current_user, receipt_id):
    """
    Print receipt (opens PDF in new window)
    ✅ REQUIRES: Payment must be verified by finance first
    ❌ Customers CANNOT print if not verified
    """
    return ReceiptController.print_receipt(current_user, receipt_id)

# ==================== EMAIL RECEIPTS - ✅ FIXED ====================
@receipt_bp.route('/<int:receipt_id>/email', methods=['POST'])
@token_required
@role_required('admin', 'finance')
def send_receipt_email(current_user, receipt_id):
    """
    Send receipt via email with logo
    ✅ REQUIRES: Payment must be verified by finance first
    """
    return ReceiptController.send_email(current_user, receipt_id, request.json)

@receipt_bp.route('/<int:receipt_id>/email/send', methods=['POST'])
@token_required
@role_required('admin', 'finance')
def send_receipt_email_custom(current_user, receipt_id):
    """
    Send receipt via email with custom recipient
    ✅ REQUIRES: Payment must be verified by finance first
    """
    return ReceiptController.send_email(current_user, receipt_id, request.json)

@receipt_bp.route('/<int:receipt_id>/email/resend', methods=['POST'])
@token_required
@role_required('admin', 'finance')
def resend_receipt_email(current_user, receipt_id):
    """
    Resend receipt via email
    ✅ REQUIRES: Payment must be verified by finance first
    """
    return ReceiptController.resend_email(current_user, receipt_id, request.json)

# ==================== SMS RECEIPTS - ✅ FIXED ====================
@receipt_bp.route('/<int:receipt_id>/sms', methods=['POST'])
@token_required
@role_required('admin', 'finance')
def send_receipt_sms(current_user, receipt_id):
    """
    Send receipt via SMS with link
    ✅ REQUIRES: Payment must be verified by finance first
    """
    return ReceiptController.send_sms(current_user, receipt_id, request.json)

@receipt_bp.route('/<int:receipt_id>/sms/send', methods=['POST'])
@token_required
@role_required('admin', 'finance')
def send_receipt_sms_custom(current_user, receipt_id):
    """
    Send receipt via SMS with custom phone number
    ✅ REQUIRES: Payment must be verified by finance first
    """
    return ReceiptController.send_sms(current_user, receipt_id, request.json)

@receipt_bp.route('/<int:receipt_id>/sms/resend', methods=['POST'])
@token_required
@role_required('admin', 'finance')
def resend_receipt_sms(current_user, receipt_id):
    """
    Resend receipt via SMS
    ✅ REQUIRES: Payment must be verified by finance first
    """
    return ReceiptController.resend_sms(current_user, receipt_id, request.json)

# ==================== BULK OPERATIONS - ✅ FIXED ====================
@receipt_bp.route('/bulk/email', methods=['POST'])
@token_required
@role_required('admin', 'finance')
def send_bulk_receipt_email(current_user):
    """
    Send multiple receipts via email
    ✅ REQUIRES: All payments must be verified by finance first
    """
    return ReceiptController.send_bulk_email(current_user, request.json)

@receipt_bp.route('/bulk/sms', methods=['POST'])
@token_required
@role_required('admin', 'finance')
def send_bulk_receipt_sms(current_user):
    """
    Send multiple receipts via SMS
    ✅ REQUIRES: All payments must be verified by finance first
    """
    return ReceiptController.send_bulk_sms(current_user, request.json)

@receipt_bp.route('/bulk/download', methods=['POST'])
@token_required
@role_required('admin', 'finance')
def download_bulk_receipts(current_user):
    """
    Download multiple receipts as ZIP
    ✅ REQUIRES: All payments must be verified by finance first
    ❌ Returns 403 if any payment is unverified
    """
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
    """
    Get receipt summary (for printing/display)
    ✅ REQUIRES: Payment must be verified by finance first
    ❌ Customers CANNOT view if not verified
    """
    return ReceiptController.get_summary(current_user, receipt_id)