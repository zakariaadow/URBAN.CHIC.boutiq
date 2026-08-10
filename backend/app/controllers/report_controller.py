from app.utils.response import APIResponse
from app.services.report_service import ReportService

class ReportController:
    
    @staticmethod
    def get_reports(current_user, params):
        """Get all reports"""
        try:
            result, status_code = ReportService.get_reports(params)
            return APIResponse.success(result, 'Reports retrieved successfully', status_code)
        except Exception as e:
            return APIResponse.server_error(str(e))
    
    @staticmethod
    def get_appointment_report(current_user, params):
        """Get appointment report"""
        try:
            result, status_code = ReportService.generate_appointment_report(params)
            return APIResponse.success(result, 'Appointment report retrieved successfully', status_code)
        except Exception as e:
            return APIResponse.server_error(str(e))
    
    @staticmethod
    def get_sales_report(current_user, params):
        """Get sales report"""
        try:
            result, status_code = ReportService.generate_sales_report(params)
            return APIResponse.success(result, 'Sales report retrieved successfully', status_code)
        except Exception as e:
            return APIResponse.server_error(str(e))
    
    @staticmethod
    def get_revenue_report(current_user, params):
        """Get revenue report"""
        try:
            result, status_code = ReportService.generate_revenue_report(params)
            return APIResponse.success(result, 'Revenue report retrieved successfully', status_code)
        except Exception as e:
            return APIResponse.server_error(str(e))
    
    @staticmethod
    def get_profit_loss_report(current_user, params):
        """Get profit and loss report"""
        try:
            result, status_code = ReportService.generate_profit_loss_report(params)
            return APIResponse.success(result, 'Profit and loss report retrieved successfully', status_code)
        except Exception as e:
            return APIResponse.server_error(str(e))
    
    @staticmethod
    def get_inventory_report(current_user, params):
        """Get inventory report"""
        try:
            result, status_code = ReportService.generate_inventory_report(params)
            return APIResponse.success(result, 'Inventory report retrieved successfully', status_code)
        except Exception as e:
            return APIResponse.server_error(str(e))
    
    @staticmethod
    def get_staff_performance_report(current_user, params):
        """Get staff performance report"""
        try:
            result, status_code = ReportService.generate_staff_performance_report(params)
            return APIResponse.success(result, 'Staff performance report retrieved successfully', status_code)
        except Exception as e:
            return APIResponse.server_error(str(e))
    
    @staticmethod
    def get_customer_report(current_user, params):
        """Get customer report"""
        try:
            result, status_code = ReportService.generate_customer_report(params)
            return APIResponse.success(result, 'Customer report retrieved successfully', status_code)
        except Exception as e:
            return APIResponse.server_error(str(e))
    
    @staticmethod
    def get_daily_report(current_user, params):
        """Get daily report"""
        try:
            result, status_code = ReportService.generate_daily_report(params)
            return APIResponse.success(result, 'Daily report retrieved successfully', status_code)
        except Exception as e:
            return APIResponse.server_error(str(e))
    
    @staticmethod
    def get_monthly_report(current_user, params):
        """Get monthly report"""
        try:
            result, status_code = ReportService.generate_monthly_report(params)
            return APIResponse.success(result, 'Monthly report retrieved successfully', status_code)
        except Exception as e:
            return APIResponse.server_error(str(e))
    
    @staticmethod
    def get_yearly_report(current_user, params):
        """Get yearly report"""
        try:
            result, status_code = ReportService.generate_yearly_report(params)
            return APIResponse.success(result, 'Yearly report retrieved successfully', status_code)
        except Exception as e:
            return APIResponse.server_error(str(e))
    
    @staticmethod
    def get_comprehensive_report(current_user, params):
        """Get comprehensive system report"""
        try:
            result, status_code = ReportService.generate_comprehensive_report(params)
            return APIResponse.success(result, 'Comprehensive report retrieved successfully', status_code)
        except Exception as e:
            return APIResponse.server_error(str(e))
    
    @staticmethod
    def export_report(current_user, data):
        """Export report to file"""
        try:
            result, status_code = ReportService.export_report(data)
            return APIResponse.success(result, 'Report exported successfully', status_code)
        except Exception as e:
            return APIResponse.server_error(str(e))
    
    @staticmethod
    def get_report(current_user, report_id):
        """Get specific report"""
        try:
            result, status_code = ReportService.get_report(report_id)
            
            if status_code == 200:
                return APIResponse.success(result, 'Report retrieved successfully')
            else:
                return APIResponse.error(result['error'], 'NOT_FOUND', status_code)
                
        except Exception as e:
            return APIResponse.server_error(str(e))
    
    @staticmethod
    def delete_report(current_user, report_id):
        """Delete a report"""
        try:
            result, status_code = ReportService.delete_report(current_user, report_id)
            
            if status_code == 200:
                return APIResponse.success(None, result['message'])
            else:
                return APIResponse.error(result['error'], 'DELETE_ERROR', status_code)
                
        except Exception as e:
            return APIResponse.server_error(str(e))
    
    @staticmethod
    def schedule_report(current_user, data):
        """Schedule a report"""
        try:
            result, status_code = ReportService.schedule_report(current_user, data)
            
            if status_code == 201:
                return APIResponse.success(result, 'Report scheduled successfully', 201)
            else:
                return APIResponse.error(result['error'], 'SCHEDULE_ERROR', status_code)
                
        except Exception as e:
            return APIResponse.server_error(str(e))
    
    @staticmethod
    def get_scheduled_reports(current_user, params):
        """Get scheduled reports"""
        try:
            result, status_code = ReportService.get_scheduled_reports(params)
            return APIResponse.success(result, 'Scheduled reports retrieved successfully', status_code)
        except Exception as e:
            return APIResponse.server_error(str(e))