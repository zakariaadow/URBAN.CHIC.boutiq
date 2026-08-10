from app.utils.response import APIResponse
from app.services.inventory_service import InventoryService
from app.services.notification_service import NotificationService
from flask import request

class InventoryController:
    
    @staticmethod
    def get_dashboard(current_user):
        """Get inventory dashboard data"""
        try:
            result, status_code = InventoryService.get_dashboard(current_user)
            
            if status_code == 200:
                return APIResponse.success(result, 'Dashboard data retrieved successfully')
            else:
                return APIResponse.error(result['error'], 'DASHBOARD_ERROR', status_code)
                
        except Exception as e:
            return APIResponse.server_error(str(e))
    
    @staticmethod
    def add_product(current_user, data):
        """Add new product"""
        try:
            result, status_code = InventoryService.add_product(data, current_user.id)
            
            if status_code == 201:
                return APIResponse.success(result, 'Product added successfully', 201)
            else:
                return APIResponse.error(result['error'], 'PRODUCT_ERROR', status_code)
                
        except Exception as e:
            return APIResponse.server_error(str(e))
    
    @staticmethod
    def get_products(current_user, params):
        """Get all products"""
        try:
            result, status_code = InventoryService.get_products(params)
            return APIResponse.success(result, 'Products retrieved successfully', status_code)
        except Exception as e:
            return APIResponse.server_error(str(e))
    
    @staticmethod
    def get_product(current_user, product_id):
        """Get product details"""
        try:
            result, status_code = InventoryService.get_product(current_user, product_id)
            return APIResponse.success(result, 'Product details retrieved successfully', status_code)
        except Exception as e:
            return APIResponse.server_error(str(e))
    
    @staticmethod
    def update_product(current_user, product_id, data):
        """Update product"""
        try:
            result, status_code = InventoryService.update_product(current_user, product_id, data)
            
            if status_code == 200:
                return APIResponse.success(result, 'Product updated successfully')
            else:
                return APIResponse.error(result['error'], 'UPDATE_ERROR', status_code)
                
        except Exception as e:
            return APIResponse.server_error(str(e))
    
    @staticmethod
    def delete_product(current_user, product_id):
        """Delete product"""
        try:
            result, status_code = InventoryService.delete_product(current_user, product_id)
            
            if status_code == 200:
                return APIResponse.success(None, result['message'])
            else:
                return APIResponse.error(result['error'], 'DELETE_ERROR', status_code)
                
        except Exception as e:
            return APIResponse.server_error(str(e))
    
    @staticmethod
    def search_products(current_user, params):
        """Search products"""
        try:
            result, status_code = InventoryService.search_products(params)
            return APIResponse.success(result, 'Products found successfully', status_code)
        except Exception as e:
            return APIResponse.server_error(str(e))
    
    @staticmethod
    def get_product_categories(current_user):
        """Get product categories"""
        try:
            result, status_code = InventoryService.get_product_categories()
            return APIResponse.success(result, 'Categories retrieved successfully', status_code)
        except Exception as e:
            return APIResponse.server_error(str(e))
    
    @staticmethod
    def get_product_by_barcode(current_user, barcode):
        """Get product by barcode"""
        try:
            result, status_code = InventoryService.get_product_by_barcode(current_user, barcode)
            return APIResponse.success(result, 'Product retrieved successfully', status_code)
        except Exception as e:
            return APIResponse.server_error(str(e))
    
    @staticmethod
    def add_supplier(current_user, data):
        """Add supplier"""
        try:
            result, status_code = InventoryService.add_supplier(current_user, data)
            
            if status_code == 201:
                return APIResponse.success(result, 'Supplier added successfully', 201)
            else:
                return APIResponse.error(result['error'], 'SUPPLIER_ERROR', status_code)
                
        except Exception as e:
            return APIResponse.server_error(str(e))
    
    @staticmethod
    def get_suppliers(current_user, params):
        """Get all suppliers"""
        try:
            result, status_code = InventoryService.get_suppliers(params)
            return APIResponse.success(result, 'Suppliers retrieved successfully', status_code)
        except Exception as e:
            return APIResponse.server_error(str(e))
    
    @staticmethod
    def get_supplier(current_user, supplier_id):
        """Get supplier details"""
        try:
            result, status_code = InventoryService.get_supplier(current_user, supplier_id)
            return APIResponse.success(result, 'Supplier details retrieved successfully', status_code)
        except Exception as e:
            return APIResponse.server_error(str(e))
    
    @staticmethod
    def update_supplier(current_user, supplier_id, data):
        """Update supplier"""
        try:
            result, status_code = InventoryService.update_supplier(current_user, supplier_id, data)
            
            if status_code == 200:
                return APIResponse.success(result, 'Supplier updated successfully')
            else:
                return APIResponse.error(result['error'], 'UPDATE_ERROR', status_code)
                
        except Exception as e:
            return APIResponse.server_error(str(e))
    
    @staticmethod
    def delete_supplier(current_user, supplier_id):
        """Delete supplier"""
        try:
            result, status_code = InventoryService.delete_supplier(current_user, supplier_id)
            
            if status_code == 200:
                return APIResponse.success(None, result['message'])
            else:
                return APIResponse.error(result['error'], 'DELETE_ERROR', status_code)
                
        except Exception as e:
            return APIResponse.server_error(str(e))
    
    @staticmethod
    def search_suppliers(current_user, params):
        """Search suppliers"""
        try:
            result, status_code = InventoryService.search_suppliers(params)
            return APIResponse.success(result, 'Suppliers found successfully', status_code)
        except Exception as e:
            return APIResponse.server_error(str(e))
    
    @staticmethod
    def record_purchase(current_user, data):
        """Record a purchase"""
        try:
            result, status_code = InventoryService.record_purchase(current_user, data)
            
            if status_code == 201:
                return APIResponse.success(result, 'Purchase recorded successfully', 201)
            else:
                return APIResponse.error(result['error'], 'PURCHASE_ERROR', status_code)
                
        except Exception as e:
            return APIResponse.server_error(str(e))
    
    @staticmethod
    def get_purchases(current_user, params):
        """Get all purchases"""
        try:
            result, status_code = InventoryService.get_purchases(params)
            return APIResponse.success(result, 'Purchases retrieved successfully', status_code)
        except Exception as e:
            return APIResponse.server_error(str(e))
    
    @staticmethod
    def get_purchase(current_user, purchase_id):
        """Get purchase details"""
        try:
            result, status_code = InventoryService.get_purchase(current_user, purchase_id)
            return APIResponse.success(result, 'Purchase details retrieved successfully', status_code)
        except Exception as e:
            return APIResponse.server_error(str(e))
    
    @staticmethod
    def update_purchase(current_user, purchase_id, data):
        """Update purchase"""
        try:
            result, status_code = InventoryService.update_purchase(current_user, purchase_id, data)
            
            if status_code == 200:
                return APIResponse.success(result, 'Purchase updated successfully')
            else:
                return APIResponse.error(result['error'], 'UPDATE_ERROR', status_code)
                
        except Exception as e:
            return APIResponse.server_error(str(e))
    
    @staticmethod
    def delete_purchase(current_user, purchase_id):
        """Delete purchase"""
        try:
            result, status_code = InventoryService.delete_purchase(current_user, purchase_id)
            
            if status_code == 200:
                return APIResponse.success(None, result['message'])
            else:
                return APIResponse.error(result['error'], 'DELETE_ERROR', status_code)
                
        except Exception as e:
            return APIResponse.server_error(str(e))
    
    @staticmethod
    def stock_in(current_user, data):
        """Record stock in"""
        try:
            result, status_code = InventoryService.record_stock_in(data, current_user.id)
            
            if status_code == 201:
                return APIResponse.success(result, 'Stock in recorded successfully', 201)
            else:
                return APIResponse.error(result['error'], 'STOCK_ERROR', status_code)
                
        except Exception as e:
            return APIResponse.server_error(str(e))
    
    @staticmethod
    def stock_out(current_user, data):
        """Record stock out"""
        try:
            result, status_code = InventoryService.record_stock_out(data, current_user.id)
            
            if status_code == 201:
                return APIResponse.success(result, 'Stock out recorded successfully', 201)
            else:
                return APIResponse.error(result['error'], 'STOCK_ERROR', status_code)
                
        except Exception as e:
            return APIResponse.server_error(str(e))
    
    @staticmethod
    def transfer_stock(current_user, data):
        """Transfer stock between branches"""
        try:
            result, status_code = InventoryService.transfer_stock(data, current_user.id)
            
            if status_code == 200:
                return APIResponse.success(result, 'Stock transferred successfully')
            else:
                return APIResponse.error(result['error'], 'TRANSFER_ERROR', status_code)
                
        except Exception as e:
            return APIResponse.server_error(str(e))
    
    @staticmethod
    def get_stock_levels(current_user, params):
        """Get stock levels"""
        try:
            result, status_code = InventoryService.get_stock_levels(params)
            return APIResponse.success(result, 'Stock levels retrieved successfully', status_code)
        except Exception as e:
            return APIResponse.server_error(str(e))
    
    @staticmethod
    def get_stock_history(current_user, params):
        """Get stock movement history"""
        try:
            result, status_code = InventoryService.get_stock_history(params)
            return APIResponse.success(result, 'Stock history retrieved successfully', status_code)
        except Exception as e:
            return APIResponse.server_error(str(e))
    
    @staticmethod
    def adjust_stock(current_user, data):
        """Adjust stock levels"""
        try:
            result, status_code = InventoryService.adjust_stock(current_user, data)
            
            if status_code == 200:
                return APIResponse.success(result, 'Stock adjusted successfully')
            else:
                return APIResponse.error(result['error'], 'ADJUST_ERROR', status_code)
                
        except Exception as e:
            return APIResponse.server_error(str(e))
    
    @staticmethod
    def get_low_stock_alerts(current_user):
        """Get low stock alerts"""
        try:
            result, status_code = InventoryService.get_low_stock_alerts()
            return APIResponse.success(result, 'Low stock alerts retrieved successfully', status_code)
        except Exception as e:
            return APIResponse.server_error(str(e))
    
    @staticmethod
    def get_expired_products(current_user):
        """Get expired products"""
        try:
            result, status_code = InventoryService.get_expired_products()
            return APIResponse.success(result, 'Expired products retrieved successfully', status_code)
        except Exception as e:
            return APIResponse.server_error(str(e))
    
    @staticmethod
    def get_overstock_alerts(current_user):
        """Get overstock alerts"""
        try:
            result, status_code = InventoryService.get_overstock_alerts()
            return APIResponse.success(result, 'Overstock alerts retrieved successfully', status_code)
        except Exception as e:
            return APIResponse.server_error(str(e))
    
    @staticmethod
    def dismiss_alert(current_user, alert_id):
        """Dismiss stock alert"""
        try:
            result, status_code = InventoryService.dismiss_alert(current_user, alert_id)
            
            if status_code == 200:
                return APIResponse.success(None, result['message'])
            else:
                return APIResponse.error(result['error'], 'DISMISS_ERROR', status_code)
                
        except Exception as e:
            return APIResponse.server_error(str(e))
    
    @staticmethod
    def get_inventory_reports(current_user, params):
        """Get inventory reports"""
        try:
            result, status_code = InventoryService.get_inventory_reports(params)
            return APIResponse.success(result, 'Inventory reports retrieved successfully', status_code)
        except Exception as e:
            return APIResponse.server_error(str(e))
    
    @staticmethod
    def get_valuation_report(current_user, params):
        """Get inventory valuation report"""
        try:
            result, status_code = InventoryService.get_valuation_report(params)
            return APIResponse.success(result, 'Valuation report retrieved successfully', status_code)
        except Exception as e:
            return APIResponse.server_error(str(e))
    
    @staticmethod
    def get_movement_report(current_user, params):
        """Get stock movement report"""
        try:
            result, status_code = InventoryService.get_movement_report(params)
            return APIResponse.success(result, 'Movement report retrieved successfully', status_code)
        except Exception as e:
            return APIResponse.server_error(str(e))
    
    @staticmethod
    def get_inventory_summary(current_user):
        """Get inventory summary"""
        try:
            result, status_code = InventoryService.get_inventory_summary()
            return APIResponse.success(result, 'Inventory summary retrieved successfully', status_code)
        except Exception as e:
            return APIResponse.server_error(str(e))
    
    @staticmethod
    def export_inventory_report(current_user, data):
        """Export inventory report"""
        try:
            result, status_code = InventoryService.export_inventory_report(data)
            return APIResponse.success(result, 'Report exported successfully', status_code)
        except Exception as e:
            return APIResponse.server_error(str(e))
    
    @staticmethod
    def get_batches(current_user, params):
        """Get product batches"""
        try:
            result, status_code = InventoryService.get_batches(params)
            return APIResponse.success(result, 'Batches retrieved successfully', status_code)
        except Exception as e:
            return APIResponse.server_error(str(e))
    
    @staticmethod
    def get_batch(current_user, batch_id):
        """Get batch details"""
        try:
            result, status_code = InventoryService.get_batch(current_user, batch_id)
            return APIResponse.success(result, 'Batch details retrieved successfully', status_code)
        except Exception as e:
            return APIResponse.server_error(str(e))
    
    @staticmethod
    def update_batch(current_user, batch_id, data):
        """Update batch"""
        try:
            result, status_code = InventoryService.update_batch(current_user, batch_id, data)
            
            if status_code == 200:
                return APIResponse.success(result, 'Batch updated successfully')
            else:
                return APIResponse.error(result['error'], 'UPDATE_ERROR', status_code)
                
        except Exception as e:
            return APIResponse.server_error(str(e))

    # ================================================================
    # ✅ FIXED: Missing method to return notifications for the frontend
    # ================================================================
    @staticmethod
    def get_notifications(current_user, params):
        """Get inventory notifications"""
        try:
            # Pass the request parameters directly to the notification service
            page = int(params.get('page', 1))
            limit = int(params.get('limit', 20))
            
            # 🚨 CRITICAL FIX: Pass current_user.id instead of current_user
            result, status_code = NotificationService.get_notifications(current_user.id, params)
            
            if status_code == 200:
                return APIResponse.success(result, 'Notifications retrieved successfully')
            else:
                return APIResponse.error(result.get('error', 'Failed to get notifications'), status_code)
                
        except Exception as e:
            return APIResponse.server_error(str(e))