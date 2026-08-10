from app.utils.response import APIResponse
from app.services.stock_service import StockService

class StockController:
    
    @staticmethod
    def get_stock_levels(current_user, params):
        """Get stock levels"""
        try:
            result, status_code = StockService.get_stock_levels(params)
            return APIResponse.success(result, 'Stock levels retrieved successfully', status_code)
        except Exception as e:
            return APIResponse.server_error(str(e))
    
    @staticmethod
    def get_stock_by_product(current_user, product_id):
        """Get stock by product"""
        try:
            result, status_code = StockService.get_stock_by_product(current_user, product_id)
            
            if status_code == 200:
                return APIResponse.success(result, 'Stock retrieved successfully')
            else:
                return APIResponse.error(result['error'], 'NOT_FOUND', status_code)
                
        except Exception as e:
            return APIResponse.server_error(str(e))
    
    @staticmethod
    def get_stock_by_branch(current_user, branch_id, params):
        """Get stock by branch"""
        try:
            result, status_code = StockService.get_stock_by_branch(branch_id, params)
            return APIResponse.success(result, 'Stock retrieved successfully', status_code)
        except Exception as e:
            return APIResponse.server_error(str(e))
    
    @staticmethod
    def record_stock_in(current_user, data):
        """Record stock in"""
        try:
            result, status_code = StockService.record_stock_in(current_user, data)
            
            if status_code == 201:
                return APIResponse.success(result, 'Stock in recorded successfully', 201)
            else:
                return APIResponse.error(result['error'], 'STOCK_IN_ERROR', status_code)
                
        except Exception as e:
            return APIResponse.server_error(str(e))
    
    @staticmethod
    def record_stock_out(current_user, data):
        """Record stock out"""
        try:
            result, status_code = StockService.record_stock_out(current_user, data)
            
            if status_code == 201:
                return APIResponse.success(result, 'Stock out recorded successfully', 201)
            else:
                return APIResponse.error(result['error'], 'STOCK_OUT_ERROR', status_code)
                
        except Exception as e:
            return APIResponse.server_error(str(e))
    
    @staticmethod
    def transfer_stock(current_user, data):
        """Transfer stock between branches"""
        try:
            result, status_code = StockService.transfer_stock(current_user, data)
            
            if status_code == 200:
                return APIResponse.success(result, 'Stock transferred successfully')
            else:
                return APIResponse.error(result['error'], 'TRANSFER_ERROR', status_code)
                
        except Exception as e:
            return APIResponse.server_error(str(e))
    
    @staticmethod
    def adjust_stock(current_user, data):
        """Adjust stock levels"""
        try:
            result, status_code = StockService.adjust_stock(current_user, data)
            
            if status_code == 200:
                return APIResponse.success(result, 'Stock adjusted successfully')
            else:
                return APIResponse.error(result['error'], 'ADJUST_ERROR', status_code)
                
        except Exception as e:
            return APIResponse.server_error(str(e))
    
    @staticmethod
    def get_stock_history(current_user, params):
        """Get stock movement history"""
        try:
            result, status_code = StockService.get_stock_history(params)
            return APIResponse.success(result, 'Stock history retrieved successfully', status_code)
        except Exception as e:
            return APIResponse.server_error(str(e))
    
    @staticmethod
    def get_stock_history_by_product(current_user, product_id, params):
        """Get stock movement history by product"""
        try:
            result, status_code = StockService.get_stock_history_by_product(product_id, params)
            return APIResponse.success(result, 'Stock history retrieved successfully', status_code)
        except Exception as e:
            return APIResponse.server_error(str(e))
    
    @staticmethod
    def get_low_stock_alerts(current_user):
        """Get low stock alerts"""
        try:
            result, status_code = StockService.get_low_stock_alerts()
            return APIResponse.success(result, 'Low stock alerts retrieved successfully', status_code)
        except Exception as e:
            return APIResponse.server_error(str(e))
    
    @staticmethod
    def get_expired_stock(current_user):
        """Get expired stock"""
        try:
            result, status_code = StockService.get_expired_stock()
            return APIResponse.success(result, 'Expired stock retrieved successfully', status_code)
        except Exception as e:
            return APIResponse.server_error(str(e))
    
    @staticmethod
    def get_overstock_alerts(current_user):
        """Get overstock alerts"""
        try:
            result, status_code = StockService.get_overstock_alerts()
            return APIResponse.success(result, 'Overstock alerts retrieved successfully', status_code)
        except Exception as e:
            return APIResponse.server_error(str(e))
    
    @staticmethod
    def dismiss_alert(current_user, alert_id):
        """Dismiss stock alert"""
        try:
            result, status_code = StockService.dismiss_alert(current_user, alert_id)
            
            if status_code == 200:
                return APIResponse.success(None, result['message'])
            else:
                return APIResponse.error(result['error'], 'DISMISS_ERROR', status_code)
                
        except Exception as e:
            return APIResponse.server_error(str(e))
    
    @staticmethod
    def get_stock_summary(current_user):
        """Get stock summary"""
        try:
            result, status_code = StockService.get_stock_summary()
            return APIResponse.success(result, 'Stock summary retrieved successfully', status_code)
        except Exception as e:
            return APIResponse.server_error(str(e))
    
    @staticmethod
    def get_stock_valuation(current_user, params):
        """Get stock valuation"""
        try:
            result, status_code = StockService.get_stock_valuation(params)
            return APIResponse.success(result, 'Stock valuation retrieved successfully', status_code)
        except Exception as e:
            return APIResponse.server_error(str(e))
    
    @staticmethod
    def export_stock_report(current_user, data):
        """Export stock report"""
        try:
            result, status_code = StockService.export_stock_report(data)
            return APIResponse.success(result, 'Stock report exported successfully', status_code)
        except Exception as e:
            return APIResponse.server_error(str(e))