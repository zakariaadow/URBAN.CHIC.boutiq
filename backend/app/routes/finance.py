from flask import Blueprint, request, jsonify, send_file
from app.controllers.finance_controller import FinanceController
from app.utils.auth import token_required, role_required
from app.utils.response import APIResponse
import logging

logger = logging.getLogger(__name__)

finance_bp = Blueprint('finance', __name__, url_prefix='/api/finance')

# ==================== DASHBOARD ====================
@finance_bp.route('/dashboard', methods=['GET'])
@token_required
@role_required('finance')
def dashboard(current_user):
    """Finance dashboard data"""
    return FinanceController.get_dashboard(current_user)

# ==================== INCOME ====================
@finance_bp.route('/income', methods=['POST'])
@token_required
@role_required('finance')
def record_income(current_user):
    """Record income"""
    return FinanceController.record_income(current_user, request.json)

@finance_bp.route('/income', methods=['GET'])
@token_required
@role_required('finance')
def get_income(current_user):
    """Get income records"""
    return FinanceController.get_income(current_user, request.args)

# ==================== EXPENSES ====================
@finance_bp.route('/expenses', methods=['POST'])
@token_required
@role_required('finance')
def record_expense(current_user):
    """Record expense"""
    return FinanceController.record_expense(current_user, request.json)

@finance_bp.route('/expenses', methods=['GET'])
@token_required
@role_required('finance')
def get_expenses(current_user):
    """Get expenses"""
    return FinanceController.get_expenses(current_user, request.args)

# ==================== PAYMENTS ====================
@finance_bp.route('/payments', methods=['GET'])
@token_required
@role_required('finance')
def get_payments(current_user):
    """Get all payments with pagination"""
    params = request.args.to_dict()
    return FinanceController.get_payments(current_user, params)

@finance_bp.route('/payments/<int:payment_id>', methods=['GET'])
@token_required
@role_required('finance')
def get_payment(current_user, payment_id):
    """Get payment details"""
    return FinanceController.get_payment(current_user, payment_id)

@finance_bp.route('/payments/pending', methods=['GET'])
@token_required
@role_required('finance')
def get_pending_payments(current_user):
    """Get pending payments"""
    return FinanceController.get_pending_payments(current_user)

@finance_bp.route('/payments/<int:payment_id>/verify', methods=['POST'])
@token_required
@role_required('finance')
def verify_payment(current_user, payment_id):
    """Verify a payment"""
    return FinanceController.verify_payment(current_user, payment_id, request.json)

@finance_bp.route('/payments/history', methods=['GET'])
@token_required
@role_required('finance')
def get_payment_history(current_user):
    """Get payment history"""
    return FinanceController.get_payment_history(current_user, request.args)

# ==================== RECEIPT ROUTES ====================
@finance_bp.route('/payments/<int:payment_id>/generate-receipt', methods=['POST'])
@token_required
@role_required('finance', 'admin')
def generate_receipt(current_user, payment_id):
    """Generate receipt for a payment"""
    return FinanceController.generate_receipt(current_user, payment_id)

@finance_bp.route('/payments/<int:payment_id>/receipt', methods=['GET'])
@token_required
@role_required('finance', 'admin', 'customer')
def get_receipt_details(current_user, payment_id):
    """Get receipt for a payment"""
    return FinanceController.get_receipt(current_user, payment_id)

@finance_bp.route('/payments/<int:payment_id>/receipt/download', methods=['GET'])
@token_required
@role_required('finance', 'admin', 'customer')
def download_receipt(current_user, payment_id):
    """Download receipt PDF"""
    return FinanceController.download_receipt(current_user, payment_id)

@finance_bp.route('/payments/<int:payment_id>/receipt/send', methods=['POST'])
@token_required
@role_required('finance', 'admin')
def send_receipt(current_user, payment_id):
    """Send receipt via email or SMS"""
    return FinanceController.send_receipt(current_user, payment_id, request.json)

@finance_bp.route('/payments/<int:payment_id>/receipt/auto-send', methods=['POST'])
@token_required
@role_required('finance', 'admin')
def auto_send_receipt(current_user, payment_id):
    """Auto-generate and send receipt to customer"""
    try:
        from app.services.receipt_service import ReceiptService
        from app.models.receipt import Receipt
        from app.models.payment import Payment
        from app.models.customer import Customer
        from app.models.user import User
        
        # Check if receipt exists
        receipt = Receipt.query.filter_by(payment_id=payment_id).first()
        
        if not receipt:
            # Generate receipt
            result, status = ReceiptService.create_receipt(payment_id)
            if status != 201:
                return APIResponse.error('Failed to generate receipt', 400)
            receipt = Receipt.query.filter_by(payment_id=payment_id).first()
        
        # Get customer email
        payment = Payment.query.get(payment_id)
        if payment:
            customer = Customer.query.get(payment.customer_id)
            if customer:
                user = User.query.get(customer.user_id)
                if user and user.email:
                    # Send email
                    result, status = ReceiptService.send_receipt_email(receipt.id, user.email)
                    return APIResponse.success(result, 'Receipt generated and sent successfully')
        
        return APIResponse.error('Customer email not found', 404)
        
    except Exception as e:
        logger.error(f"Error auto-sending receipt: {str(e)}")
        return APIResponse.server_error(str(e))

# ==================== PAYROLL ====================
@finance_bp.route('/payroll', methods=['POST'])
@token_required
@role_required('finance')
def process_payroll(current_user):
    """Process payroll"""
    return FinanceController.process_payroll(current_user, request.json)

@finance_bp.route('/payroll', methods=['GET'])
@token_required
@role_required('finance')
def get_payroll(current_user):
    """Get payroll records"""
    return FinanceController.get_payroll(current_user, request.args)

@finance_bp.route('/payroll/staff', methods=['GET'])
@token_required
@role_required('finance')
def get_staff_payroll(current_user):
    """Get staff payroll records"""
    return FinanceController.get_staff_payroll(current_user, request.args)

# ==================== COMMISSIONS ====================
@finance_bp.route('/commissions', methods=['GET'])
@token_required
@role_required('finance')
def get_commissions(current_user):
    """Get staff commissions"""
    return FinanceController.get_commissions(current_user, request.args)

@finance_bp.route('/commissions', methods=['POST'])
@token_required
@role_required('finance')
def process_commissions(current_user):
    """Process staff commissions"""
    return FinanceController.process_commissions(current_user, request.json)

# ==================== SALES ROUTES ====================
@finance_bp.route('/sales', methods=['GET'])
@token_required
@role_required('finance')
def get_sales(current_user):
    """Get sales data (today/week/month/year)"""
    return FinanceController.get_sales(current_user, request.args)

@finance_bp.route('/sales/daily', methods=['GET'])
@token_required
@role_required('finance')
def get_daily_sales(current_user):
    """Get daily sales report"""
    return FinanceController.get_daily_sales(current_user, request.args)

@finance_bp.route('/sales/monthly', methods=['GET'])
@token_required
@role_required('finance')
def get_monthly_sales(current_user):
    """Get monthly sales report"""
    return FinanceController.get_monthly_sales(current_user, request.args)

@finance_bp.route('/sales/yearly', methods=['GET'])
@token_required
@role_required('finance')
def get_yearly_sales(current_user):
    """Get yearly sales report"""
    return FinanceController.get_yearly_sales(current_user, request.args)

# ==================== REPORTS ====================
@finance_bp.route('/reports/profit-loss', methods=['GET'])
@token_required
@role_required('finance')
def get_profit_loss(current_user):
    """Get profit and loss report"""
    return FinanceController.get_profit_loss(current_user, request.args)

@finance_bp.route('/reports/balance-sheet', methods=['GET'])
@token_required
@role_required('finance')
def get_balance_sheet(current_user):
    """Get balance sheet"""
    return FinanceController.get_balance_sheet(current_user, request.args)

@finance_bp.route('/reports/cash-flow', methods=['GET'])
@token_required
@role_required('finance')
def get_cash_flow(current_user):
    """Get cash flow statement"""
    return FinanceController.get_cash_flow(current_user, request.args)

@finance_bp.route('/reports/summary', methods=['GET'])
@token_required
@role_required('finance')
def get_financial_summary(current_user):
    """Get financial summary"""
    return FinanceController.get_financial_summary(current_user)

@finance_bp.route('/reports/export', methods=['POST'])
@token_required
@role_required('finance')
def export_report(current_user):
    """Export report"""
    return FinanceController.export_report(current_user, request.json)

# ==================== TAX ====================
@finance_bp.route('/tax/calculate', methods=['POST'])
@token_required
@role_required('finance')
def calculate_tax(current_user):
    """Calculate tax"""
    return FinanceController.calculate_tax(current_user, request.json)

@finance_bp.route('/tax/reports', methods=['GET'])
@token_required
@role_required('finance')
def get_tax_reports(current_user):
    """Get tax reports"""
    return FinanceController.get_tax_reports(current_user, request.args)

@finance_bp.route('/tax', methods=['GET'])
@token_required
@role_required('finance')
def get_tax(current_user):
    """Get tax data"""
    return FinanceController.get_tax(current_user, request.args)

# ==================== BUDGET ====================
@finance_bp.route('/budget', methods=['POST'])
@token_required
@role_required('finance')
def set_budget(current_user):
    """Set budget"""
    return FinanceController.set_budget(current_user, request.json)

@finance_bp.route('/budget', methods=['GET'])
@token_required
@role_required('finance')
def get_budget(current_user):
    """Get budget"""
    return FinanceController.get_budget(current_user, request.args)

# ==================== BRANCHES ====================
@finance_bp.route('/branches', methods=['GET'])
@token_required
@role_required('finance')
def get_branches(current_user):
    """Get all branches"""
    return FinanceController.get_branches(current_user, request.args)

# ==================== NOTIFICATIONS ====================
@finance_bp.route('/notifications', methods=['GET'])
@token_required
@role_required('finance')
def get_notifications(current_user):
    """Get finance notifications"""
    return FinanceController.get_notifications(current_user, request.args)

# ==================== PROFILE ====================
@finance_bp.route('/profile', methods=['GET'])
@token_required
@role_required('finance')
def get_profile(current_user):
    """Get finance officer profile"""
    return FinanceController.get_profile(current_user)