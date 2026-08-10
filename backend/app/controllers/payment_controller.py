from flask import jsonify, request, send_file
from app.models.payment import Payment
from app.models.appointment import Appointment
from app.models.customer import Customer
from app.services.receipt_service import ReceiptService
from app.extensions import db
from datetime import datetime
import io
import logging

logger = logging.getLogger(__name__)

class PaymentController:
    
    @staticmethod
    def process_payment(data):
        """Process payment and generate receipt"""
        try:
            # Validate required fields
            required = ['appointment_id', 'customer_id', 'amount', 'payment_method']
            for field in required:
                if field not in data:
                    return jsonify({'error': f'Missing required field: {field}'}), 400
            
            # Create payment
            payment = Payment(
                appointment_id=data['appointment_id'],
                customer_id=data['customer_id'],
                amount=data['amount'],
                payment_method=data['payment_method'],
                payment_status='paid',
                transaction_id=data.get('transaction_id'),
                reference_number=data.get('reference_number'),
                payment_date=datetime.utcnow(),
                notes=data.get('notes')
            )
            
            db.session.add(payment)
            db.session.flush()
            
            # Generate receipt
            result, status = ReceiptService.create_receipt(payment.id)
            if status != 201:
                db.session.rollback()
                return jsonify(result), status
            
            db.session.commit()
            
            return jsonify({
                'message': 'Payment processed successfully',
                'payment': payment.to_dict(),
                'receipt': result.get('receipt')
            }), 201
            
        except Exception as e:
            db.session.rollback()
            logger.error(f"Error processing payment: {str(e)}")
            return jsonify({'error': str(e)}), 500
    
    @staticmethod
    def get_payment_receipt(payment_id):
        """Get receipt for payment"""
        try:
            payment = Payment.query.get(payment_id)
            if not payment:
                return jsonify({'error': 'Payment not found'}), 404
            
            receipt = Receipt.query.filter_by(payment_id=payment_id).first()
            if not receipt:
                return jsonify({'error': 'Receipt not found'}), 404
            
            return jsonify({
                'payment': payment.to_dict(),
                'receipt': receipt.to_dict()
            }), 200
            
        except Exception as e:
            logger.error(f"Error getting receipt: {str(e)}")
            return jsonify({'error': str(e)}), 500
    
    @staticmethod
    def download_receipt_pdf(receipt_id):
        """Download receipt PDF"""
        try:
            receipt = Receipt.query.get(receipt_id)
            if not receipt:
                return jsonify({'error': 'Receipt not found'}), 404
            
            pdf_data = ReceiptService.generate_receipt_pdf(receipt_id)
            if not pdf_data:
                return jsonify({'error': 'Failed to generate PDF'}), 500
            
            # Mark as downloaded
            receipt.is_downloaded = True
            receipt.downloaded_at = datetime.utcnow()
            db.session.commit()
            
            return send_file(
                io.BytesIO(pdf_data),
                as_attachment=True,
                download_name=f'receipt-{receipt.receipt_number}.pdf',
                mimetype='application/pdf'
            )
            
        except Exception as e:
            logger.error(f"Error downloading receipt: {str(e)}")
            return jsonify({'error': str(e)}), 500
    
    @staticmethod
    def send_receipt(receipt_id):
        """Send receipt via email or SMS"""
        try:
            data = request.get_json() or {}
            method = data.get('method', 'email')
            
            result, status = ReceiptService.send_receipt(receipt_id, method)
            return jsonify(result), status
            
        except Exception as e:
            logger.error(f"Error sending receipt: {str(e)}")
            return jsonify({'error': str(e)}), 500
