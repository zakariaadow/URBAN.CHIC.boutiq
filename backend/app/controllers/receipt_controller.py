from flask import send_file, jsonify, current_app, request
from app.services.receipt_service import ReceiptService
from app.services.email_service import EmailService
from app.utils.response import APIResponse
from app.models.receipt import Receipt
from app.models.payment import Payment
from app.models.user import User
from app.models.customer import Customer
from app.extensions import db
import io
import logging
import zipfile
from datetime import datetime

logger = logging.getLogger(__name__)

class ReceiptController:
    
    # ==================== GET RECEIPTS ====================
    @staticmethod
    def get_receipts(current_user, params):
        """Get all receipts"""
        try:
            customer_id = params.get('customer_id')
            payment_id = params.get('payment_id')
            limit = int(params.get('limit', 50))
            offset = int(params.get('offset', 0))
            
            # Check permissions
            if current_user.role.name not in ['admin', 'finance']:
                customer = Customer.query.filter_by(user_id=current_user.id).first()
                if customer:
                    customer_id = customer.id
                else:
                    return APIResponse.error('Unauthorized', 403)
            
            if customer_id:
                result, status_code = ReceiptService.get_receipts_by_customer(customer_id, limit, offset)
            else:
                result, status_code = ReceiptService.get_receipts(customer_id, payment_id, limit, offset)
            
            if status_code == 200:
                return APIResponse.success(result, 'Receipts retrieved successfully')
            else:
                return APIResponse.error(result.get('error', 'Failed to fetch receipts'), status_code)
                
        except Exception as e:
            logger.error(f"Error in get_receipts: {str(e)}")
            return APIResponse.server_error(str(e))
    
    @staticmethod
    def get_receipt(current_user, receipt_id):
        """Get receipt details"""
        try:
            result, status_code = ReceiptService.get_receipt_by_id(receipt_id)
            
            if status_code != 200:
                return APIResponse.error(result.get('error', 'Receipt not found'), status_code)
            
            # Check permissions
            receipt_data = result
            if current_user.role.name not in ['admin', 'finance']:
                customer = Customer.query.filter_by(user_id=current_user.id).first()
                if not customer or receipt_data.get('customer_id') != customer.id:
                    return APIResponse.error('Unauthorized', 403)
            
            return APIResponse.success(receipt_data, 'Receipt retrieved successfully')
            
        except Exception as e:
            logger.error(f"Error in get_receipt: {str(e)}")
            return APIResponse.server_error(str(e))
    
    @staticmethod
    def get_receipt_by_payment(current_user, payment_id):
        """Get receipt by payment ID"""
        try:
            result, status_code = ReceiptService.get_receipt_by_payment(payment_id)
            
            if status_code != 200:
                return APIResponse.error(result.get('error', 'Receipt not found'), status_code)
            
            if current_user.role.name not in ['admin', 'finance']:
                customer = Customer.query.filter_by(user_id=current_user.id).first()
                if not customer or result.get('customer_id') != customer.id:
                    return APIResponse.error('Unauthorized', 403)
            
            return APIResponse.success(result, 'Receipt retrieved successfully')
            
        except Exception as e:
            logger.error(f"Error in get_receipt_by_payment: {str(e)}")
            return APIResponse.server_error(str(e))
    
    @staticmethod
    def get_customer_receipts(current_user, customer_id, params):
        """Get customer receipts"""
        try:
            if current_user.role.name not in ['admin', 'finance'] and current_user.id != customer_id:
                return APIResponse.error('Unauthorized', 403)
            
            limit = int(params.get('limit', 50))
            offset = int(params.get('offset', 0))
            
            result, status_code = ReceiptService.get_receipts_by_customer(customer_id, limit, offset)
            
            if status_code == 200:
                return APIResponse.success(result, 'Customer receipts retrieved successfully')
            else:
                return APIResponse.error(result.get('error', 'Failed to fetch receipts'), status_code)
                
        except Exception as e:
            logger.error(f"Error in get_customer_receipts: {str(e)}")
            return APIResponse.server_error(str(e))
    
    # ==================== DOWNLOAD RECEIPTS ====================
    @staticmethod
    def download_pdf(current_user, receipt_id):
        """Download receipt PDF with logo - ONLY if payment is verified"""
        try:
            receipt = Receipt.query.get(receipt_id)
            if not receipt:
                return APIResponse.error('Receipt not found', 404)
            
            # ✅ FIX: Check if payment is verified/approved
            payment = Payment.query.get(receipt.payment_id)
            if payment and payment.payment_status not in ['verified', 'paid']:
                return APIResponse.error(
                    f'Receipt cannot be downloaded. Payment status: {payment.payment_status}. '
                    'Please wait for finance verification.',
                    403
                )
            
            # Check permissions
            if current_user.role.name not in ['admin', 'finance']:
                customer = Customer.query.filter_by(user_id=current_user.id).first()
                if not customer or receipt.customer_id != customer.id:
                    return APIResponse.error('Unauthorized', 403)
            
            # Generate PDF with logo
            pdf_data = ReceiptService.generate_receipt_pdf(receipt.id)
            if not pdf_data:
                return APIResponse.error('Failed to generate PDF', 500)
            
            # Mark as downloaded
            receipt.is_downloaded = True
            receipt.downloaded_at = datetime.utcnow()
            db.session.commit()
            
            filename = f"receipt-{receipt.receipt_number}.pdf"
            
            return send_file(
                io.BytesIO(pdf_data),
                as_attachment=True,
                download_name=filename,
                mimetype='application/pdf'
            )
            
        except Exception as e:
            logger.error(f"Error in download_pdf: {str(e)}")
            return APIResponse.server_error(str(e))
    
    @staticmethod
    def download_pdf_with_logo(current_user, receipt_id):
        """Download receipt PDF with logo - explicit method"""
        try:
            receipt = Receipt.query.get(receipt_id)
            if not receipt:
                return APIResponse.error('Receipt not found', 404)
            
            # ✅ FIX: Check if payment is verified/approved
            payment = Payment.query.get(receipt.payment_id)
            if payment and payment.payment_status not in ['verified', 'paid']:
                return APIResponse.error(
                    f'Receipt cannot be downloaded. Payment status: {payment.payment_status}. '
                    'Please wait for finance verification.',
                    403
                )
            
            if current_user.role.name not in ['admin', 'finance']:
                customer = Customer.query.filter_by(user_id=current_user.id).first()
                if not customer or receipt.customer_id != customer.id:
                    return APIResponse.error('Unauthorized', 403)
            
            pdf_data = ReceiptService.generate_receipt_pdf(receipt.id)
            if not pdf_data:
                return APIResponse.error('Failed to generate PDF', 500)
            
            filename = f"receipt-{receipt.receipt_number}-logo.pdf"
            
            return send_file(
                io.BytesIO(pdf_data),
                as_attachment=True,
                download_name=filename,
                mimetype='application/pdf'
            )
            
        except Exception as e:
            logger.error(f"Error in download_pdf_with_logo: {str(e)}")
            return APIResponse.server_error(str(e))
    
    @staticmethod
    def preview_pdf(current_user, receipt_id):
        """Preview receipt PDF with logo (inline display)"""
        try:
            receipt = Receipt.query.get(receipt_id)
            if not receipt:
                return APIResponse.error('Receipt not found', 404)
            
            # ✅ FIX: Check if payment is verified/approved
            payment = Payment.query.get(receipt.payment_id)
            if payment and payment.payment_status not in ['verified', 'paid']:
                return APIResponse.error(
                    f'Receipt cannot be previewed. Payment status: {payment.payment_status}. '
                    'Please wait for finance verification.',
                    403
                )
            
            if current_user.role.name not in ['admin', 'finance']:
                customer = Customer.query.filter_by(user_id=current_user.id).first()
                if not customer or receipt.customer_id != customer.id:
                    return APIResponse.error('Unauthorized', 403)
            
            pdf_data = ReceiptService.generate_receipt_pdf(receipt.id)
            if not pdf_data:
                return APIResponse.error('Failed to generate PDF', 500)
            
            filename = f"receipt-{receipt.receipt_number}.pdf"
            
            return send_file(
                io.BytesIO(pdf_data),
                as_attachment=False,
                download_name=filename,
                mimetype='application/pdf'
            )
            
        except Exception as e:
            logger.error(f"Error in preview_pdf: {str(e)}")
            return APIResponse.server_error(str(e))
    
    @staticmethod
    def print_receipt(current_user, receipt_id):
        """Print receipt (opens PDF in new window)"""
        try:
            receipt = Receipt.query.get(receipt_id)
            if not receipt:
                return APIResponse.error('Receipt not found', 404)
            
            # ✅ FIX: Check if payment is verified/approved
            payment = Payment.query.get(receipt.payment_id)
            if payment and payment.payment_status not in ['verified', 'paid']:
                return APIResponse.error(
                    f'Receipt cannot be printed. Payment status: {payment.payment_status}. '
                    'Please wait for finance verification.',
                    403
                )
            
            if current_user.role.name not in ['admin', 'finance']:
                customer = Customer.query.filter_by(user_id=current_user.id).first()
                if not customer or receipt.customer_id != customer.id:
                    return APIResponse.error('Unauthorized', 403)
            
            pdf_data = ReceiptService.generate_receipt_pdf(receipt.id)
            if not pdf_data:
                return APIResponse.error('Failed to generate PDF', 500)
            
            receipt.is_printed = True
            receipt.printed_at = datetime.utcnow()
            db.session.commit()
            
            return send_file(
                io.BytesIO(pdf_data),
                as_attachment=False,
                download_name=f"receipt-{receipt.receipt_number}.pdf",
                mimetype='application/pdf'
            )
            
        except Exception as e:
            logger.error(f"Error in print_receipt: {str(e)}")
            return APIResponse.server_error(str(e))
    
    # ==================== GENERATE RECEIPTS ====================
    @staticmethod
    def generate_receipt_with_logo(current_user, receipt_id):
        """Generate and download receipt with logo - ONLY if payment is verified"""
        try:
            receipt = Receipt.query.get(receipt_id)
            if not receipt:
                return APIResponse.error('Receipt not found', 404)
            
            # ✅ FIX: Check if payment is verified/approved
            payment = Payment.query.get(receipt.payment_id)
            if payment and payment.payment_status not in ['verified', 'paid']:
                return APIResponse.error(
                    f'Receipt cannot be generated. Payment status: {payment.payment_status}. '
                    'Please wait for finance verification.',
                    403
                )
            
            if current_user.role.name not in ['admin', 'finance']:
                customer = Customer.query.filter_by(user_id=current_user.id).first()
                if not customer or receipt.customer_id != customer.id:
                    return APIResponse.error('Unauthorized', 403)
            
            pdf_data = ReceiptService.generate_receipt_pdf(receipt.id)
            if not pdf_data:
                return APIResponse.error('Failed to generate PDF', 500)
            
            filename = f"receipt-{receipt.receipt_number}.pdf"
            
            return send_file(
                io.BytesIO(pdf_data),
                as_attachment=True,
                download_name=filename,
                mimetype='application/pdf'
            )
            
        except Exception as e:
            logger.error(f"Error in generate_receipt_with_logo: {str(e)}")
            return APIResponse.server_error(str(e))
    
    @staticmethod
    def regenerate_receipt_with_logo(current_user, receipt_id):
        """Regenerate receipt PDF with logo (force refresh)"""
        try:
            receipt = Receipt.query.get(receipt_id)
            if not receipt:
                return APIResponse.error('Receipt not found', 404)
            
            # ✅ FIX: Check if payment is verified/approved
            payment = Payment.query.get(receipt.payment_id)
            if payment and payment.payment_status not in ['verified', 'paid']:
                return APIResponse.error(
                    f'Receipt cannot be regenerated. Payment status: {payment.payment_status}. '
                    'Please wait for finance verification.',
                    403
                )
            
            if current_user.role.name not in ['admin', 'finance']:
                customer = Customer.query.filter_by(user_id=current_user.id).first()
                if not customer or receipt.customer_id != customer.id:
                    return APIResponse.error('Unauthorized', 403)
            
            # Update receipt to force regeneration of items
            receipt.items = None
            db.session.commit()
            
            pdf_data = ReceiptService.generate_receipt_pdf(receipt.id)
            if not pdf_data:
                return APIResponse.error('Failed to generate PDF', 500)
            
            filename = f"receipt-{receipt.receipt_number}-regenerated.pdf"
            
            return send_file(
                io.BytesIO(pdf_data),
                as_attachment=True,
                download_name=filename,
                mimetype='application/pdf'
            )
            
        except Exception as e:
            logger.error(f"Error in regenerate_receipt_with_logo: {str(e)}")
            return APIResponse.server_error(str(e))
    
    # ==================== EMAIL METHODS ====================
    @staticmethod
    def send_email(current_user, receipt_id, data):
        """Send receipt via email with logo - ONLY if payment is verified"""
        try:
            receipt = Receipt.query.get(receipt_id)
            if not receipt:
                return APIResponse.error('Receipt not found', 404)
            
            # ✅ FIX: Check if payment is verified/approved
            payment = Payment.query.get(receipt.payment_id)
            if payment and payment.payment_status not in ['verified', 'paid']:
                return APIResponse.error(
                    f'Receipt cannot be sent. Payment status: {payment.payment_status}. '
                    'Please wait for finance verification.',
                    403
                )
            
            if current_user.role.name not in ['admin', 'finance']:
                customer = Customer.query.filter_by(user_id=current_user.id).first()
                if not customer or receipt.customer_id != customer.id:
                    return APIResponse.error('Unauthorized', 403)
            
            # Get customer email
            customer_email = data.get('email')
            if not customer_email:
                customer = Customer.query.get(receipt.customer_id)
                if customer:
                    user = User.query.get(customer.user_id)
                    if user:
                        customer_email = user.email
                if not customer_email:
                    return APIResponse.error('Customer email not found', 400)
            
            # Generate PDF with logo before sending
            pdf_data = ReceiptService.generate_receipt_pdf(receipt.id)
            if not pdf_data:
                return APIResponse.error('Failed to generate receipt PDF', 500)
            
            # Send email
            customer_name = receipt.customer_name or 'Customer'
            result, status = EmailService.send_receipt_email(
                email=customer_email,
                name=customer_name,
                receipt=receipt,
                pdf_data=pdf_data
            )
            
            if status == 200 and result.get('success'):
                receipt.is_emailed = True
                receipt.sent_at = datetime.utcnow()
                receipt.sent_via = 'email'
                receipt.status = 'sent'
                db.session.commit()
                
                return APIResponse.success(
                    {'sent_to': customer_email},
                    f'Receipt sent to {customer_email}'
                )
            else:
                return APIResponse.error(
                    result.get('message', 'Failed to send email'),
                    status
                )
                
        except Exception as e:
            logger.error(f"Error in send_email: {str(e)}")
            return APIResponse.server_error(str(e))
    
    @staticmethod
    def resend_email(current_user, receipt_id, data):
        """Resend receipt via email"""
        try:
            receipt = Receipt.query.get(receipt_id)
            if not receipt:
                return APIResponse.error('Receipt not found', 404)
            
            # ✅ FIX: Check if payment is verified/approved
            payment = Payment.query.get(receipt.payment_id)
            if payment and payment.payment_status not in ['verified', 'paid']:
                return APIResponse.error(
                    f'Receipt cannot be resent. Payment status: {payment.payment_status}. '
                    'Please wait for finance verification.',
                    403
                )
            
            if current_user.role.name not in ['admin', 'finance']:
                customer = Customer.query.filter_by(user_id=current_user.id).first()
                if not customer or receipt.customer_id != customer.id:
                    return APIResponse.error('Unauthorized', 403)
            
            customer_email = data.get('email')
            if not customer_email:
                customer = Customer.query.get(receipt.customer_id)
                if customer:
                    user = User.query.get(customer.user_id)
                    if user:
                        customer_email = user.email
                if not customer_email:
                    return APIResponse.error('Customer email not found', 400)
            
            pdf_data = ReceiptService.generate_receipt_pdf(receipt.id)
            if not pdf_data:
                return APIResponse.error('Failed to generate receipt PDF', 500)
            
            customer_name = receipt.customer_name or 'Customer'
            result, status = EmailService.send_receipt_email(
                email=customer_email,
                name=customer_name,
                receipt=receipt,
                pdf_data=pdf_data
            )
            
            if status == 200 and result.get('success'):
                receipt.sent_at = datetime.utcnow()
                receipt.status = 'resent'
                receipt.resend_count = (receipt.resend_count or 0) + 1
                db.session.commit()
                
                return APIResponse.success(
                    {'sent_to': customer_email, 'resend_count': receipt.resend_count},
                    f'Receipt resent to {customer_email}'
                )
            else:
                return APIResponse.error(
                    result.get('message', 'Failed to resend email'),
                    status
                )
                
        except Exception as e:
            logger.error(f"Error in resend_email: {str(e)}")
            return APIResponse.server_error(str(e))
    
    # ==================== SMS METHODS ====================
    @staticmethod
    def send_sms(current_user, receipt_id, data):
        """Send receipt via SMS with link"""
        try:
            receipt = Receipt.query.get(receipt_id)
            if not receipt:
                return APIResponse.error('Receipt not found', 404)
            
            # ✅ FIX: Check if payment is verified/approved
            payment = Payment.query.get(receipt.payment_id)
            if payment and payment.payment_status not in ['verified', 'paid']:
                return APIResponse.error(
                    f'Receipt cannot be sent via SMS. Payment status: {payment.payment_status}. '
                    'Please wait for finance verification.',
                    403
                )
            
            if current_user.role.name not in ['admin', 'finance']:
                customer = Customer.query.filter_by(user_id=current_user.id).first()
                if not customer or receipt.customer_id != customer.id:
                    return APIResponse.error('Unauthorized', 403)
            
            phone_number = data.get('phone')
            if not phone_number:
                customer = Customer.query.get(receipt.customer_id)
                if customer:
                    user = User.query.get(customer.user_id)
                    if user:
                        phone_number = user.phone
                if not phone_number:
                    return APIResponse.error('Customer phone not found', 400)
            
            result, status_code = ReceiptService.send_receipt_sms(receipt.id)
            
            if status_code == 200:
                receipt.is_sms = True
                receipt.sent_at = datetime.utcnow()
                receipt.sent_via = 'sms'
                receipt.status = 'sent'
                db.session.commit()
                
                return APIResponse.success(
                    {'sent_to': phone_number},
                    f'Receipt sent via SMS to {phone_number}'
                )
            else:
                return APIResponse.error(result.get('error', 'Failed to send SMS'), status_code)
                
        except Exception as e:
            logger.error(f"Error in send_sms: {str(e)}")
            return APIResponse.server_error(str(e))
    
    @staticmethod
    def resend_sms(current_user, receipt_id, data):
        """Resend receipt via SMS"""
        try:
            receipt = Receipt.query.get(receipt_id)
            if not receipt:
                return APIResponse.error('Receipt not found', 404)
            
            # ✅ FIX: Check if payment is verified/approved
            payment = Payment.query.get(receipt.payment_id)
            if payment and payment.payment_status not in ['verified', 'paid']:
                return APIResponse.error(
                    f'Receipt cannot be resent via SMS. Payment status: {payment.payment_status}. '
                    'Please wait for finance verification.',
                    403
                )
            
            if current_user.role.name not in ['admin', 'finance']:
                customer = Customer.query.filter_by(user_id=current_user.id).first()
                if not customer or receipt.customer_id != customer.id:
                    return APIResponse.error('Unauthorized', 403)
            
            phone_number = data.get('phone')
            if not phone_number:
                customer = Customer.query.get(receipt.customer_id)
                if customer:
                    user = User.query.get(customer.user_id)
                    if user:
                        phone_number = user.phone
                if not phone_number:
                    return APIResponse.error('Customer phone not found', 400)
            
            result, status_code = ReceiptService.send_receipt_sms(receipt.id)
            
            if status_code == 200:
                receipt.sent_at = datetime.utcnow()
                receipt.status = 'resent'
                receipt.resend_count = (receipt.resend_count or 0) + 1
                db.session.commit()
                
                return APIResponse.success(
                    {'sent_to': phone_number, 'resend_count': receipt.resend_count},
                    f'Receipt resent via SMS to {phone_number}'
                )
            else:
                return APIResponse.error(result.get('error', 'Failed to resend SMS'), status_code)
                
        except Exception as e:
            logger.error(f"Error in resend_sms: {str(e)}")
            return APIResponse.server_error(str(e))
    
    # ==================== BULK OPERATIONS ====================
    @staticmethod
    def send_bulk_email(current_user, data):
        """Send multiple receipts via email"""
        try:
            receipt_ids = data.get('receipt_ids', [])
            if not receipt_ids:
                return APIResponse.error('No receipt IDs provided', 400)
            
            results = []
            for receipt_id in receipt_ids:
                try:
                    receipt = Receipt.query.get(receipt_id)
                    if not receipt:
                        continue
                    
                    # ✅ FIX: Check if payment is verified/approved
                    payment = Payment.query.get(receipt.payment_id)
                    if payment and payment.payment_status not in ['verified', 'paid']:
                        results.append({'receipt_id': receipt_id, 'status': 'skipped', 'error': 'Payment not verified'})
                        continue
                    
                    customer = Customer.query.get(receipt.customer_id)
                    email = None
                    if customer:
                        user = User.query.get(customer.user_id)
                        if user:
                            email = user.email
                    
                    if email:
                        pdf_data = ReceiptService.generate_receipt_pdf(receipt.id)
                        if pdf_data:
                            customer_name = receipt.customer_name or 'Customer'
                            result, status = EmailService.send_receipt_email(
                                email=email,
                                name=customer_name,
                                receipt=receipt,
                                pdf_data=pdf_data
                            )
                            if status == 200 and result.get('success'):
                                receipt.is_emailed = True
                                receipt.sent_at = datetime.utcnow()
                                receipt.sent_via = 'email'
                                receipt.status = 'sent'
                                db.session.commit()
                                results.append({'receipt_id': receipt_id, 'status': 'success', 'email': email})
                            else:
                                results.append({'receipt_id': receipt_id, 'status': 'failed', 'error': result.get('message')})
                        else:
                            results.append({'receipt_id': receipt_id, 'status': 'failed', 'error': 'PDF generation failed'})
                    else:
                        results.append({'receipt_id': receipt_id, 'status': 'failed', 'error': 'No email found'})
                except Exception as e:
                    results.append({'receipt_id': receipt_id, 'status': 'failed', 'error': str(e)})
            
            db.session.commit()
            
            success_count = len([r for r in results if r['status'] == 'success'])
            return APIResponse.success({
                'results': results,
                'total': len(results),
                'successful': success_count,
                'failed': len(results) - success_count
            }, f'Bulk email send completed. {success_count} of {len(results)} sent successfully')
            
        except Exception as e:
            logger.error(f"Error in send_bulk_email: {str(e)}")
            return APIResponse.server_error(str(e))
    
    @staticmethod
    def send_bulk_sms(current_user, data):
        """Send multiple receipts via SMS"""
        try:
            receipt_ids = data.get('receipt_ids', [])
            if not receipt_ids:
                return APIResponse.error('No receipt IDs provided', 400)
            
            results = []
            for receipt_id in receipt_ids:
                try:
                    receipt = Receipt.query.get(receipt_id)
                    if not receipt:
                        continue
                    
                    # ✅ FIX: Check if payment is verified/approved
                    payment = Payment.query.get(receipt.payment_id)
                    if payment and payment.payment_status not in ['verified', 'paid']:
                        results.append({'receipt_id': receipt_id, 'status': 'skipped', 'error': 'Payment not verified'})
                        continue
                    
                    customer = Customer.query.get(receipt.customer_id)
                    phone = None
                    if customer:
                        user = User.query.get(customer.user_id)
                        if user:
                            phone = user.phone
                    
                    if phone:
                        result, status = ReceiptService.send_receipt_sms(receipt.id)
                        if status == 200:
                            receipt.is_sms = True
                            receipt.sent_at = datetime.utcnow()
                            receipt.sent_via = 'sms'
                            receipt.status = 'sent'
                            db.session.commit()
                            results.append({'receipt_id': receipt_id, 'status': 'success', 'phone': phone})
                        else:
                            results.append({'receipt_id': receipt_id, 'status': 'failed', 'error': result.get('error')})
                    else:
                        results.append({'receipt_id': receipt_id, 'status': 'failed', 'error': 'No phone number found'})
                except Exception as e:
                    results.append({'receipt_id': receipt_id, 'status': 'failed', 'error': str(e)})
            
            db.session.commit()
            
            success_count = len([r for r in results if r['status'] == 'success'])
            return APIResponse.success({
                'results': results,
                'total': len(results),
                'successful': success_count,
                'failed': len(results) - success_count
            }, f'Bulk SMS send completed. {success_count} of {len(results)} sent successfully')
            
        except Exception as e:
            logger.error(f"Error in send_bulk_sms: {str(e)}")
            return APIResponse.server_error(str(e))
    
    @staticmethod
    def download_bulk_receipts(current_user, data):
        """Download multiple receipts as ZIP"""
        try:
            receipt_ids = data.get('receipt_ids', [])
            if not receipt_ids:
                return APIResponse.error('No receipt IDs provided', 400)
            
            # Create ZIP file in memory
            zip_buffer = io.BytesIO()
            with zipfile.ZipFile(zip_buffer, 'w', zipfile.ZIP_DEFLATED) as zip_file:
                for receipt_id in receipt_ids:
                    receipt = Receipt.query.get(receipt_id)
                    if not receipt:
                        continue
                    
                    # ✅ FIX: Check if payment is verified/approved
                    payment = Payment.query.get(receipt.payment_id)
                    if payment and payment.payment_status not in ['verified', 'paid']:
                        continue
                    
                    if current_user.role.name not in ['admin', 'finance']:
                        customer = Customer.query.filter_by(user_id=current_user.id).first()
                        if not customer or receipt.customer_id != customer.id:
                            continue
                    
                    pdf_data = ReceiptService.generate_receipt_pdf(receipt.id)
                    if pdf_data:
                        filename = f"receipt-{receipt.receipt_number}.pdf"
                        zip_file.writestr(filename, pdf_data)
            
            zip_buffer.seek(0)
            
            return send_file(
                zip_buffer,
                as_attachment=True,
                download_name=f"receipts-{datetime.now().strftime('%Y%m%d_%H%M%S')}.zip",
                mimetype='application/zip'
            )
            
        except Exception as e:
            logger.error(f"Error in download_bulk_receipts: {str(e)}")
            return APIResponse.server_error(str(e))
    
    # ==================== RECEIPT STATUS ====================
    @staticmethod
    def update_status(current_user, receipt_id, data):
        """Update receipt status"""
        try:
            receipt = Receipt.query.get(receipt_id)
            if not receipt:
                return APIResponse.error('Receipt not found', 404)
            
            if current_user.role.name not in ['admin', 'finance']:
                return APIResponse.error('Unauthorized', 403)
            
            new_status = data.get('status')
            if not new_status:
                return APIResponse.error('Status is required', 400)
            
            valid_statuses = ['generated', 'sent', 'viewed', 'downloaded', 'printed', 'resent', 'expired']
            if new_status not in valid_statuses:
                return APIResponse.error(f'Invalid status. Must be one of: {", ".join(valid_statuses)}', 400)
            
            receipt.status = new_status
            db.session.commit()
            
            return APIResponse.success(receipt.to_dict(), f'Receipt status updated to {new_status}')
            
        except Exception as e:
            logger.error(f"Error in update_status: {str(e)}")
            return APIResponse.server_error(str(e))
    
    @staticmethod
    def mark_sent(current_user, receipt_id, data):
        """Mark receipt as sent"""
        try:
            receipt = Receipt.query.get(receipt_id)
            if not receipt:
                return APIResponse.error('Receipt not found', 404)
            
            if current_user.role.name not in ['admin', 'finance']:
                return APIResponse.error('Unauthorized', 403)
            
            method = data.get('method', 'email')
            receipt.status = 'sent'
            receipt.sent_at = datetime.utcnow()
            receipt.sent_via = method
            
            if method == 'email':
                receipt.is_emailed = True
            elif method == 'sms':
                receipt.is_sms = True
            
            db.session.commit()
            
            return APIResponse.success(receipt.to_dict(), f'Receipt marked as sent via {method}')
            
        except Exception as e:
            logger.error(f"Error in mark_sent: {str(e)}")
            return APIResponse.server_error(str(e))