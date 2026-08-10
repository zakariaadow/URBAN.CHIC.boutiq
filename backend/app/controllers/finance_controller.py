from flask import jsonify, request, send_file
from app.services.finance_service import FinanceService
from app.services.receipt_service import ReceiptService
from app.utils.response import APIResponse
import logging
import io

logger = logging.getLogger(__name__)

class FinanceController:
    
    # ==================== DASHBOARD ====================
    @staticmethod
    def get_dashboard(current_user):
        """Get finance dashboard data"""
        try:
            result, status = FinanceService.get_dashboard(current_user)
            if status == 200:
                return APIResponse.success(result, 'Dashboard data retrieved successfully')
            return APIResponse.error(result.get('error', 'Failed to get dashboard'), status)
        except Exception as e:
            logger.error(f"Error in get_dashboard: {str(e)}")
            return APIResponse.server_error(str(e))
    
    @staticmethod
    def get_financial_summary(current_user):
        """Get financial summary"""
        try:
            result, status = FinanceService.get_financial_summary(current_user)
            if status == 200:
                return APIResponse.success(result, 'Financial summary retrieved successfully')
            return APIResponse.error(result.get('error', 'Failed to get financial summary'), status)
        except Exception as e:
            logger.error(f"Error in get_financial_summary: {str(e)}")
            return APIResponse.server_error(str(e))
    
    # ==================== INCOME ====================
    @staticmethod
    def record_income(current_user, data):
        """Record income"""
        try:
            result, status = FinanceService.record_income(current_user, data)
            if status == 200:
                return APIResponse.success(result, 'Income recorded successfully')
            return APIResponse.error(result.get('error', 'Failed to record income'), status)
        except Exception as e:
            logger.error(f"Error in record_income: {str(e)}")
            return APIResponse.server_error(str(e))
    
    @staticmethod
    def get_income(current_user, params):
        """Get income records"""
        try:
            result, status = FinanceService.get_income(current_user, params)
            if status == 200:
                return APIResponse.success(result, 'Income records retrieved successfully')
            return APIResponse.error(result.get('error', 'Failed to get income'), status)
        except Exception as e:
            logger.error(f"Error in get_income: {str(e)}")
            return APIResponse.server_error(str(e))
    
    # ==================== EXPENSES ====================
    @staticmethod
    def record_expense(current_user, data):
        """Record expense"""
        try:
            result, status = FinanceService.record_expense(current_user, data)
            if status == 201:
                return APIResponse.success(result, 'Expense recorded successfully', 201)
            return APIResponse.error(result.get('error', 'Failed to record expense'), status)
        except Exception as e:
            logger.error(f"Error in record_expense: {str(e)}")
            return APIResponse.server_error(str(e))
    
    @staticmethod
    def get_expenses(current_user, params):
        """Get expenses"""
        try:
            result, status = FinanceService.get_expenses(current_user, params)
            if status == 200:
                return APIResponse.success(result, 'Expenses retrieved successfully')
            return APIResponse.error(result.get('error', 'Failed to get expenses'), status)
        except Exception as e:
            logger.error(f"Error in get_expenses: {str(e)}")
            return APIResponse.server_error(str(e))
    
    @staticmethod
    def update_expense(current_user, expense_id, data):
        """Update expense"""
        try:
            result, status = FinanceService.update_expense(current_user, expense_id, data)
            if status == 200:
                return APIResponse.success(result, 'Expense updated successfully')
            return APIResponse.error(result.get('error', 'Failed to update expense'), status)
        except Exception as e:
            logger.error(f"Error in update_expense: {str(e)}")
            return APIResponse.server_error(str(e))
    
    # ==================== PAYMENTS ====================
    @staticmethod
    def get_payments(current_user, params):
        """Get all payments"""
        try:
            result, status = FinanceService.get_payments(current_user, params)
            if status == 200:
                return APIResponse.success(result, 'Payments retrieved successfully')
            return APIResponse.error(result.get('error', 'Failed to get payments'), status)
        except Exception as e:
            logger.error(f"Error in get_payments: {str(e)}")
            return APIResponse.server_error(str(e))
    
    @staticmethod
    def get_payment(current_user, payment_id):
        """Get payment details"""
        try:
            result, status = FinanceService.get_payment(current_user, payment_id)
            if status == 200:
                return APIResponse.success(result, 'Payment details retrieved successfully')
            return APIResponse.error(result.get('error', 'Failed to get payment'), status)
        except Exception as e:
            logger.error(f"Error in get_payment: {str(e)}")
            return APIResponse.server_error(str(e))
    
    @staticmethod
    def get_pending_payments(current_user):
        """Get pending payments"""
        try:
            result, status = FinanceService.get_pending_payments(current_user)
            if status == 200:
                return APIResponse.success(result, 'Pending payments retrieved successfully')
            return APIResponse.error(result.get('error', 'Failed to get pending payments'), status)
        except Exception as e:
            logger.error(f"Error in get_pending_payments: {str(e)}")
            return APIResponse.server_error(str(e))
    
    @staticmethod
    def verify_payment(current_user, payment_id, data):
        """Verify a payment"""
        try:
            result, status = FinanceService.verify_payment(current_user, payment_id, data)
            if status == 200:
                return APIResponse.success(result, 'Payment verified successfully')
            return APIResponse.error(result.get('error', 'Failed to verify payment'), status)
        except Exception as e:
            logger.error(f"Error in verify_payment: {str(e)}")
            return APIResponse.server_error(str(e))
    
    @staticmethod
    def get_payment_history(current_user, params):
        """Get payment history"""
        try:
            result, status = FinanceService.get_payment_history(current_user, params)
            if status == 200:
                return APIResponse.success(result, 'Payment history retrieved successfully')
            return APIResponse.error(result.get('error', 'Failed to get payment history'), status)
        except Exception as e:
            logger.error(f"Error in get_payment_history: {str(e)}")
            return APIResponse.server_error(str(e))
    
    # ==================== RECEIPTS WITH LOGO ====================
    @staticmethod
    def generate_receipt(current_user, payment_id):
        """Generate receipt for a payment"""
        try:
            from app.models.payment import Payment
            from app.models.receipt import Receipt
            from app.services.receipt_service import ReceiptService
            
            # Check if payment exists
            payment = Payment.query.get(payment_id)
            if not payment:
                return APIResponse.error('Payment not found', 404)
            
            # Check if receipt already exists
            receipt = Receipt.query.filter_by(payment_id=payment_id).first()
            
            if receipt:
                return APIResponse.success(receipt.to_dict(), 'Receipt already exists')
            
            # Create receipt
            result, status = ReceiptService.create_receipt(payment_id)
            if status == 201:
                return APIResponse.success(result, 'Receipt generated successfully', 201)
            return APIResponse.error(result.get('error', 'Failed to generate receipt'), status)
        except Exception as e:
            logger.error(f"Error in generate_receipt: {str(e)}")
            return APIResponse.server_error(str(e))
    
    @staticmethod
    def generate_receipt_with_logo(current_user, payment_id):
        """Generate receipt with logo for ANY payment"""
        try:
            from app.models.payment import Payment
            from app.models.receipt import Receipt
            from app.services.receipt_service import ReceiptService
            
            # Check if payment exists
            payment = Payment.query.get(payment_id)
            if not payment:
                return APIResponse.error('Payment not found', 404)
            
            # Check if receipt already exists
            receipt = Receipt.query.filter_by(payment_id=payment_id).first()
            
            if not receipt:
                # Create receipt
                result, status = ReceiptService.create_receipt(payment_id)
                if status != 201:
                    return APIResponse.error('Failed to create receipt', 400)
                receipt = Receipt.query.filter_by(payment_id=payment_id).first()
            
            # Generate PDF with logo
            pdf_data = ReceiptService.generate_receipt_pdf(receipt.id)
            if pdf_data:
                return APIResponse.success({
                    'receipt': receipt.to_dict(),
                    'message': 'Receipt with logo generated successfully'
                }, 200)
            
            return APIResponse.error('Failed to generate receipt with logo', 500)
        except Exception as e:
            logger.error(f"Error in generate_receipt_with_logo: {str(e)}")
            return APIResponse.server_error(str(e))
    
    @staticmethod
    def get_receipt(current_user, payment_id):
        """Get receipt details for a payment - auto-generate if not exists"""
        try:
            from app.models.receipt import Receipt
            from app.models.payment import Payment
            from app.services.receipt_service import ReceiptService
            
            # Check if payment exists
            payment = Payment.query.get(payment_id)
            if not payment:
                return APIResponse.error('Payment not found', 404)
            
            # Check if receipt exists
            receipt = Receipt.query.filter_by(payment_id=payment_id).first()
            
            # If no receipt, generate one
            if not receipt:
                # Only generate if payment is paid
                if payment.payment_status != 'paid':
                    return APIResponse.error('Payment is not paid yet', 400)
                
                # Create receipt
                result, status = ReceiptService.create_receipt(payment_id)
                if status != 201:
                    return APIResponse.error('Failed to create receipt', 400)
                
                receipt = Receipt.query.filter_by(payment_id=payment_id).first()
                if not receipt:
                    return APIResponse.error('Failed to create receipt', 500)
            
            return APIResponse.success(receipt.to_dict(), 'Receipt retrieved successfully')
        except Exception as e:
            logger.error(f"Error in get_receipt: {str(e)}")
            return APIResponse.server_error(str(e))
    
    @staticmethod
    def get_receipt_by_id(current_user, receipt_id):
        """Get receipt by receipt ID"""
        try:
            from app.models.receipt import Receipt
            
            receipt = Receipt.query.get(receipt_id)
            if not receipt:
                return APIResponse.error('Receipt not found', 404)
            
            return APIResponse.success(receipt.to_dict(), 'Receipt retrieved successfully')
        except Exception as e:
            logger.error(f"Error in get_receipt_by_id: {str(e)}")
            return APIResponse.server_error(str(e))
    
    @staticmethod
    def download_receipt(current_user, payment_id):
        """Download receipt PDF with logo - auto-generate if not exists"""
        try:
            from app.models.payment import Payment
            from app.models.receipt import Receipt
            from app.services.receipt_service import ReceiptService
            
            payment = Payment.query.get(payment_id)
            if not payment:
                return APIResponse.error('Payment not found', 404)
            
            # Check if receipt exists
            receipt = Receipt.query.filter_by(payment_id=payment_id).first()
            
            # If no receipt, generate one
            if not receipt:
                if payment.payment_status != 'paid':
                    return APIResponse.error('Payment is not paid yet', 400)
                
                result, status = ReceiptService.create_receipt(payment_id)
                if status != 201:
                    return APIResponse.error('Failed to create receipt', 400)
                
                receipt = Receipt.query.filter_by(payment_id=payment_id).first()
                if not receipt:
                    return APIResponse.error('Failed to create receipt', 500)
            
            # Check if receipt has multiple services
            appointment = receipt.appointment
            if appointment:
                # Get all services for this appointment
                from app.models.appointment_service import AppointmentService as AppointmentServiceModel
                from app.models.service import Service
                
                appt_services = AppointmentServiceModel.query.filter_by(
                    appointment_id=appointment.id
                ).all()
                
                if appt_services:
                    # Update receipt items with all services
                    items = []
                    total = 0
                    for appt_service in appt_services:
                        service = Service.query.get(appt_service.service_id)
                        if service:
                            items.append({
                                'name': service.name,
                                'price': float(appt_service.price or service.price),
                                'quantity': 1
                            })
                            total += float(appt_service.price or service.price)
                    
                    if items:
                        receipt.items = items
                        receipt.total = total
                        receipt.subtotal = total
                        db.session.commit()
            
            pdf_data = ReceiptService.generate_receipt_pdf(receipt.id)
            if not pdf_data:
                return APIResponse.error('Failed to generate PDF', 500)
            
            return send_file(
                io.BytesIO(pdf_data),
                as_attachment=True,
                download_name=f'receipt-{receipt.receipt_number}.pdf',
                mimetype='application/pdf'
            )
        except Exception as e:
            logger.error(f"Error in download_receipt: {str(e)}")
            return APIResponse.server_error(str(e))
    
    @staticmethod
    def preview_receipt(current_user, payment_id):
        """Preview receipt PDF with logo (inline display) - auto-generate if not exists"""
        try:
            from app.models.payment import Payment
            from app.models.receipt import Receipt
            from app.services.receipt_service import ReceiptService
            
            payment = Payment.query.get(payment_id)
            if not payment:
                return APIResponse.error('Payment not found', 404)
            
            # Check if receipt exists
            receipt = Receipt.query.filter_by(payment_id=payment_id).first()
            
            # If no receipt, generate one
            if not receipt:
                if payment.payment_status != 'paid':
                    return APIResponse.error('Payment is not paid yet', 400)
                
                result, status = ReceiptService.create_receipt(payment_id)
                if status != 201:
                    return APIResponse.error('Failed to create receipt', 400)
                
                receipt = Receipt.query.filter_by(payment_id=payment_id).first()
                if not receipt:
                    return APIResponse.error('Failed to create receipt', 500)
            
            pdf_data = ReceiptService.generate_receipt_pdf(receipt.id)
            if not pdf_data:
                return APIResponse.error('Failed to generate PDF', 500)
            
            return send_file(
                io.BytesIO(pdf_data),
                mimetype='application/pdf',
                as_attachment=False,
                download_name=f'receipt-{receipt.receipt_number}.pdf'
            )
        except Exception as e:
            logger.error(f"Error in preview_receipt: {str(e)}")
            return APIResponse.server_error(str(e))
    
    @staticmethod
    def send_receipt(current_user, payment_id, data):
        """Send receipt via email or SMS with logo - auto-generate if not exists"""
        try:
            from app.models.payment import Payment
            from app.models.receipt import Receipt
            from app.services.receipt_service import ReceiptService
            
            payment = Payment.query.get(payment_id)
            if not payment:
                return APIResponse.error('Payment not found', 404)
            
            # Check if receipt exists
            receipt = Receipt.query.filter_by(payment_id=payment_id).first()
            
            # If no receipt, generate one
            if not receipt:
                if payment.payment_status != 'paid':
                    return APIResponse.error('Payment is not paid yet', 400)
                
                result, status = ReceiptService.create_receipt(payment_id)
                if status != 201:
                    return APIResponse.error('Failed to create receipt', 400)
                
                receipt = Receipt.query.filter_by(payment_id=payment_id).first()
                if not receipt:
                    return APIResponse.error('Failed to create receipt', 500)
            
            method = data.get('method', 'email')
            result, status = ReceiptService.send_receipt(receipt.id, method)
            
            if status == 200:
                return APIResponse.success(result, 'Receipt sent successfully')
            return APIResponse.error(result.get('error', 'Failed to send receipt'), status)
        except Exception as e:
            logger.error(f"Error in send_receipt: {str(e)}")
            return APIResponse.server_error(str(e))
    
    # ==================== PAYROLL ====================
    @staticmethod
    def process_payroll(current_user, data):
        """Process payroll"""
        try:
            result, status = FinanceService.process_payroll(current_user, data)
            if status == 201:
                return APIResponse.success(result, 'Payroll processed successfully', 201)
            return APIResponse.error(result.get('error', 'Failed to process payroll'), status)
        except Exception as e:
            logger.error(f"Error in process_payroll: {str(e)}")
            return APIResponse.server_error(str(e))
    
    @staticmethod
    def get_payroll(current_user, params):
        """Get payroll records"""
        try:
            result, status = FinanceService.get_payroll(current_user, params)
            if status == 200:
                return APIResponse.success(result, 'Payroll records retrieved successfully')
            return APIResponse.error(result.get('error', 'Failed to get payroll'), status)
        except Exception as e:
            logger.error(f"Error in get_payroll: {str(e)}")
            return APIResponse.server_error(str(e))
    
    @staticmethod
    def get_staff_payroll(current_user, params):
        """Get staff payroll records"""
        try:
            result, status = FinanceService.get_staff_payroll(current_user, params)
            if status == 200:
                return APIResponse.success(result, 'Staff payroll records retrieved successfully')
            return APIResponse.error(result.get('error', 'Failed to get staff payroll'), status)
        except Exception as e:
            logger.error(f"Error in get_staff_payroll: {str(e)}")
            return APIResponse.server_error(str(e))
    
    # ==================== COMMISSIONS ====================
    @staticmethod
    def get_commissions(current_user, params):
        """Get staff commissions"""
        try:
            result, status = FinanceService.get_commissions(current_user, params)
            if status == 200:
                return APIResponse.success(result, 'Commissions retrieved successfully')
            return APIResponse.error(result.get('error', 'Failed to get commissions'), status)
        except Exception as e:
            logger.error(f"Error in get_commissions: {str(e)}")
            return APIResponse.server_error(str(e))
    
    @staticmethod
    def process_commissions(current_user, data):
        """Process staff commissions"""
        try:
            result, status = FinanceService.process_commissions(current_user, data)
            if status == 200:
                return APIResponse.success(result, 'Commissions processed successfully')
            return APIResponse.error(result.get('error', 'Failed to process commissions'), status)
        except Exception as e:
            logger.error(f"Error in process_commissions: {str(e)}")
            return APIResponse.server_error(str(e))
    
    # ==================== SALES ====================
    @staticmethod
    def get_sales(current_user, params):
        """Get sales data"""
        try:
            result, status = FinanceService.get_sales(current_user, params)
            if status == 200:
                return APIResponse.success(result, 'Sales data retrieved successfully')
            return APIResponse.error(result.get('error', 'Failed to get sales data'), status)
        except Exception as e:
            logger.error(f"Error in get_sales: {str(e)}")
            return APIResponse.server_error(str(e))
    
    @staticmethod
    def get_daily_sales(current_user, params):
        """Get daily sales"""
        try:
            result, status = FinanceService.get_daily_sales(current_user, params)
            if status == 200:
                return APIResponse.success(result, 'Daily sales retrieved successfully')
            return APIResponse.error(result.get('error', 'Failed to get daily sales'), status)
        except Exception as e:
            logger.error(f"Error in get_daily_sales: {str(e)}")
            return APIResponse.server_error(str(e))
    
    @staticmethod
    def get_monthly_sales(current_user, params):
        """Get monthly sales"""
        try:
            result, status = FinanceService.get_monthly_sales(current_user, params)
            if status == 200:
                return APIResponse.success(result, 'Monthly sales retrieved successfully')
            return APIResponse.error(result.get('error', 'Failed to get monthly sales'), status)
        except Exception as e:
            logger.error(f"Error in get_monthly_sales: {str(e)}")
            return APIResponse.server_error(str(e))
    
    @staticmethod
    def get_yearly_sales(current_user, params):
        """Get yearly sales"""
        try:
            result, status = FinanceService.get_yearly_sales(current_user, params)
            if status == 200:
                return APIResponse.success(result, 'Yearly sales retrieved successfully')
            return APIResponse.error(result.get('error', 'Failed to get yearly sales'), status)
        except Exception as e:
            logger.error(f"Error in get_yearly_sales: {str(e)}")
            return APIResponse.server_error(str(e))
    
    @staticmethod
    def get_sales_by_service(current_user, params):
        """Get sales by service"""
        try:
            result, status = FinanceService.get_sales_by_service(current_user, params)
            if status == 200:
                return APIResponse.success(result, 'Sales by service retrieved successfully')
            return APIResponse.error(result.get('error', 'Failed to get sales by service'), status)
        except Exception as e:
            logger.error(f"Error in get_sales_by_service: {str(e)}")
            return APIResponse.server_error(str(e))
    
    @staticmethod
    def get_sales_by_branch(current_user, params):
        """Get sales by branch"""
        try:
            result, status = FinanceService.get_sales_by_branch(current_user, params)
            if status == 200:
                return APIResponse.success(result, 'Sales by branch retrieved successfully')
            return APIResponse.error(result.get('error', 'Failed to get sales by branch'), status)
        except Exception as e:
            logger.error(f"Error in get_sales_by_branch: {str(e)}")
            return APIResponse.server_error(str(e))
    
    # ==================== REPORTS ====================
    @staticmethod
    def get_profit_loss(current_user, params):
        """Get profit and loss report"""
        try:
            result, status = FinanceService.get_profit_loss(current_user, params)
            if status == 200:
                return APIResponse.success(result, 'Profit & loss report retrieved successfully')
            return APIResponse.error(result.get('error', 'Failed to get profit & loss'), status)
        except Exception as e:
            logger.error(f"Error in get_profit_loss: {str(e)}")
            return APIResponse.server_error(str(e))
    
    @staticmethod
    def get_balance_sheet(current_user, params):
        """Get balance sheet"""
        try:
            result, status = FinanceService.get_balance_sheet(current_user, params)
            if status == 200:
                return APIResponse.success(result, 'Balance sheet retrieved successfully')
            return APIResponse.error(result.get('error', 'Failed to get balance sheet'), status)
        except Exception as e:
            logger.error(f"Error in get_balance_sheet: {str(e)}")
            return APIResponse.server_error(str(e))
    
    @staticmethod
    def get_cash_flow(current_user, params):
        """Get cash flow statement"""
        try:
            result, status = FinanceService.get_cash_flow(current_user, params)
            if status == 200:
                return APIResponse.success(result, 'Cash flow statement retrieved successfully')
            return APIResponse.error(result.get('error', 'Failed to get cash flow'), status)
        except Exception as e:
            logger.error(f"Error in get_cash_flow: {str(e)}")
            return APIResponse.server_error(str(e))
    
    @staticmethod
    def export_report(current_user, data):
        """Export report"""
        try:
            result, status = FinanceService.export_report(current_user, data)
            if status == 200:
                return APIResponse.success(result, 'Report exported successfully')
            return APIResponse.error(result.get('error', 'Failed to export report'), status)
        except Exception as e:
            logger.error(f"Error in export_report: {str(e)}")
            return APIResponse.server_error(str(e))
    
    # ==================== TAX ====================
    @staticmethod
    def calculate_tax(current_user, data):
        """Calculate tax"""
        try:
            result, status = FinanceService.calculate_tax(current_user, data)
            if status == 200:
                return APIResponse.success(result, 'Tax calculated successfully')
            return APIResponse.error(result.get('error', 'Failed to calculate tax'), status)
        except Exception as e:
            logger.error(f"Error in calculate_tax: {str(e)}")
            return APIResponse.server_error(str(e))
    
    @staticmethod
    def get_tax_reports(current_user, params):
        """Get tax reports"""
        try:
            result, status = FinanceService.get_tax_reports(current_user, params)
            if status == 200:
                return APIResponse.success(result, 'Tax reports retrieved successfully')
            return APIResponse.error(result.get('error', 'Failed to get tax reports'), status)
        except Exception as e:
            logger.error(f"Error in get_tax_reports: {str(e)}")
            return APIResponse.server_error(str(e))
    
    @staticmethod
    def get_tax(current_user, params):
        """Get tax data"""
        try:
            result, status = FinanceService.get_tax(current_user, params)
            if status == 200:
                return APIResponse.success(result, 'Tax data retrieved successfully')
            return APIResponse.error(result.get('error', 'Failed to get tax data'), status)
        except Exception as e:
            logger.error(f"Error in get_tax: {str(e)}")
            return APIResponse.server_error(str(e))
    
    # ==================== BUDGET ====================
    @staticmethod
    def set_budget(current_user, data):
        """Set budget"""
        try:
            result, status = FinanceService.set_budget(current_user, data)
            if status == 200:
                return APIResponse.success(result, 'Budget set successfully')
            return APIResponse.error(result.get('error', 'Failed to set budget'), status)
        except Exception as e:
            logger.error(f"Error in set_budget: {str(e)}")
            return APIResponse.server_error(str(e))
    
    @staticmethod
    def get_budget(current_user, params):
        """Get budget"""
        try:
            result, status = FinanceService.get_budget(current_user, params)
            if status == 200:
                return APIResponse.success(result, 'Budget retrieved successfully')
            return APIResponse.error(result.get('error', 'Failed to get budget'), status)
        except Exception as e:
            logger.error(f"Error in get_budget: {str(e)}")
            return APIResponse.server_error(str(e))
    
    @staticmethod
    def update_budget(current_user, budget_id, data):
        """Update budget"""
        try:
            result, status = FinanceService.update_budget(current_user, budget_id, data)
            if status == 200:
                return APIResponse.success(result, 'Budget updated successfully')
            return APIResponse.error(result.get('error', 'Failed to update budget'), status)
        except Exception as e:
            logger.error(f"Error in update_budget: {str(e)}")
            return APIResponse.server_error(str(e))
    
    # ==================== BRANCHES ====================
    @staticmethod
    def get_branches(current_user, params):
        """Get all branches"""
        try:
            result, status = FinanceService.get_branches(current_user, params)
            if status == 200:
                return APIResponse.success(result, 'Branches retrieved successfully')
            return APIResponse.error(result.get('error', 'Failed to get branches'), status)
        except Exception as e:
            logger.error(f"Error in get_branches: {str(e)}")
            return APIResponse.server_error(str(e))
    
    # ==================== NOTIFICATIONS ====================
    @staticmethod
    def get_notifications(current_user, params):
        """Get finance notifications"""
        try:
            result, status = FinanceService.get_notifications(current_user, params)
            if status == 200:
                return APIResponse.success(result, 'Notifications retrieved successfully')
            return APIResponse.error(result.get('error', 'Failed to get notifications'), status)
        except Exception as e:
            logger.error(f"Error in get_notifications: {str(e)}")
            return APIResponse.server_error(str(e))
    
    # ==================== PROFILE ====================
    @staticmethod
    def get_profile(current_user):
        """Get finance officer profile"""
        try:
            result, status = FinanceService.get_profile(current_user)
            if status == 200:
                return APIResponse.success(result, 'Profile retrieved successfully')
            return APIResponse.error(result.get('error', 'Failed to get profile'), status)
        except Exception as e:
            logger.error(f"Error in get_profile: {str(e)}")
            return APIResponse.server_error(str(e))