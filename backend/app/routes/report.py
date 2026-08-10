from flask import Blueprint, request, jsonify
from app.controllers.report_controller import ReportController
from app.utils.auth import login_required, role_required

report_bp = Blueprint('report', __name__, url_prefix='/api/reports')

# Get all reports
@report_bp.route('/', methods=['GET'])
@login_required
def get_reports(current_user):
    """Get all reports"""
    return ReportController.get_reports(current_user, request.args)

# Generate appointment report
@report_bp.route('/appointments', methods=['GET'])
@login_required
def get_appointment_report(current_user):
    """Get appointment report"""
    return ReportController.get_appointment_report(current_user, request.args)

# Generate sales report
@report_bp.route('/sales', methods=['GET'])
@login_required
def get_sales_report(current_user):
    """Get sales report"""
    return ReportController.get_sales_report(current_user, request.args)

# Generate revenue report
@report_bp.route('/revenue', methods=['GET'])
@login_required
def get_revenue_report(current_user):
    """Get revenue report"""
    return ReportController.get_revenue_report(current_user, request.args)

# Generate profit and loss report
@report_bp.route('/profit-loss', methods=['GET'])
@login_required
def get_profit_loss_report(current_user):
    """Get profit and loss report"""
    return ReportController.get_profit_loss_report(current_user, request.args)

# Generate inventory report
@report_bp.route('/inventory', methods=['GET'])
@login_required
def get_inventory_report(current_user):
    """Get inventory report"""
    return ReportController.get_inventory_report(current_user, request.args)

# Generate staff performance report
@report_bp.route('/staff-performance', methods=['GET'])
@login_required
def get_staff_performance_report(current_user):
    """Get staff performance report"""
    return ReportController.get_staff_performance_report(current_user, request.args)

# Generate customer report
@report_bp.route('/customers', methods=['GET'])
@login_required
def get_customer_report(current_user):
    """Get customer report"""
    return ReportController.get_customer_report(current_user, request.args)

# Generate daily report
@report_bp.route('/daily', methods=['GET'])
@login_required
def get_daily_report(current_user):
    """Get daily report"""
    return ReportController.get_daily_report(current_user, request.args)

# Generate monthly report
@report_bp.route('/monthly', methods=['GET'])
@login_required
def get_monthly_report(current_user):
    """Get monthly report"""
    return ReportController.get_monthly_report(current_user, request.args)

# Generate yearly report
@report_bp.route('/yearly', methods=['GET'])
@login_required
def get_yearly_report(current_user):
    """Get yearly report"""
    return ReportController.get_yearly_report(current_user, request.args)

# Generate comprehensive report
@report_bp.route('/comprehensive', methods=['GET'])
@login_required
@role_required(['admin', 'manager'])
def get_comprehensive_report(current_user):
    """Get comprehensive system report"""
    return ReportController.get_comprehensive_report(current_user, request.args)

# Export report
@report_bp.route('/export', methods=['POST'])
@login_required
def export_report(current_user):
    """Export report to file"""
    return ReportController.export_report(current_user, request.json)

# Get report by ID
@report_bp.route('/<int:report_id>', methods=['GET'])
@login_required
def get_report(current_user, report_id):
    """Get specific report"""
    return ReportController.get_report(current_user, report_id)

# Delete report
@report_bp.route('/<int:report_id>', methods=['DELETE'])
@login_required
def delete_report(current_user, report_id):
    """Delete a report"""
    return ReportController.delete_report(current_user, report_id)

# Schedule report
@report_bp.route('/schedule', methods=['POST'])
@login_required
@role_required(['admin', 'manager'])
def schedule_report(current_user):
    """Schedule a report"""
    return ReportController.schedule_report(current_user, request.json)

# Get scheduled reports
@report_bp.route('/scheduled', methods=['GET'])
@login_required
def get_scheduled_reports(current_user):
    """Get scheduled reports"""
    return ReportController.get_scheduled_reports(current_user, request.args)