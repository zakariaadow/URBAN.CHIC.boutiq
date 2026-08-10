from app.utils.response import APIResponse
from app.services.product_service import ProductService

class ProductController:
    
    @staticmethod
    def get_products(current_user, params):
        """Get all products"""
        try:
            result, status_code = ProductService.get_products(params)
            return APIResponse.success(result, 'Products retrieved successfully', status_code)
        except Exception as e:
            return APIResponse.server_error(str(e))
    
    @staticmethod
    def create_product(current_user, data):
        """Create a new product"""
        try:
            result, status_code = ProductService.create_product(current_user, data)
            
            if status_code == 201:
                return APIResponse.success(result, 'Product created successfully', 201)
            else:
                return APIResponse.error(result['error'], 'CREATE_ERROR', status_code)
                
        except Exception as e:
            return APIResponse.server_error(str(e))
    
    @staticmethod
    def get_product(current_user, product_id):
        """Get product details"""
        try:
            result, status_code = ProductService.get_product(current_user, product_id)
            
            if status_code == 200:
                return APIResponse.success(result, 'Product details retrieved successfully')
            else:
                return APIResponse.error(result['error'], 'NOT_FOUND', status_code)
                
        except Exception as e:
            return APIResponse.server_error(str(e))
    
    @staticmethod
    def update_product(current_user, product_id, data):
        """Update a product"""
        try:
            result, status_code = ProductService.update_product(current_user, product_id, data)
            
            if status_code == 200:
                return APIResponse.success(result, 'Product updated successfully')
            else:
                return APIResponse.error(result['error'], 'UPDATE_ERROR', status_code)
                
        except Exception as e:
            return APIResponse.server_error(str(e))
    
    @staticmethod
    def delete_product(current_user, product_id):
        """Delete a product"""
        try:
            result, status_code = ProductService.delete_product(current_user, product_id)
            
            if status_code == 200:
                return APIResponse.success(None, result['message'])
            else:
                return APIResponse.error(result['error'], 'DELETE_ERROR', status_code)
                
        except Exception as e:
            return APIResponse.server_error(str(e))
    
    @staticmethod
    def get_product_by_barcode(current_user, barcode):
        """Get product by barcode"""
        try:
            result, status_code = ProductService.get_product_by_barcode(current_user, barcode)
            
            if status_code == 200:
                return APIResponse.success(result, 'Product retrieved successfully')
            else:
                return APIResponse.error(result['error'], 'NOT_FOUND', status_code)
                
        except Exception as e:
            return APIResponse.server_error(str(e))
    
    @staticmethod
    def get_products_by_category(current_user, category_id, params):
        """Get products by category"""
        try:
            result, status_code = ProductService.get_products_by_category(category_id, params)
            return APIResponse.success(result, 'Products retrieved successfully', status_code)
        except Exception as e:
            return APIResponse.server_error(str(e))
    
    @staticmethod
    def search_products(current_user, params):
        """Search products"""
        try:
            result, status_code = ProductService.search_products(params)
            return APIResponse.success(result, 'Products found successfully', status_code)
        except Exception as e:
            return APIResponse.server_error(str(e))
    
    @staticmethod
    def update_product_stock(current_user, product_id, data):
        """Update product stock"""
        try:
            result, status_code = ProductService.update_product_stock(current_user, product_id, data)
            
            if status_code == 200:
                return APIResponse.success(result, 'Product stock updated successfully')
            else:
                return APIResponse.error(result['error'], 'STOCK_ERROR', status_code)
                
        except Exception as e:
            return APIResponse.server_error(str(e))
    
    @staticmethod
    def toggle_product(current_user, product_id):
        """Toggle product status"""
        try:
            result, status_code = ProductService.toggle_product(current_user, product_id)
            
            if status_code == 200:
                return APIResponse.success(result, 'Product toggled successfully')
            else:
                return APIResponse.error(result['error'], 'TOGGLE_ERROR', status_code)
                
        except Exception as e:
            return APIResponse.server_error(str(e))
    
    @staticmethod
    def upload_product_image(current_user, product_id, files):
        """Upload product image"""
        try:
            result, status_code = ProductService.upload_product_image(current_user, product_id, files)
            
            if status_code == 200:
                return APIResponse.success(result, 'Product image uploaded successfully')
            else:
                return APIResponse.error(result['error'], 'UPLOAD_ERROR', status_code)
                
        except Exception as e:
            return APIResponse.server_error(str(e))
    
    @staticmethod
    def get_product_analytics(current_user, params):
        """Get product analytics"""
        try:
            result, status_code = ProductService.get_product_analytics(params)
            return APIResponse.success(result, 'Product analytics retrieved successfully', status_code)
        except Exception as e:
            return APIResponse.server_error(str(e))
    
    @staticmethod
    def export_products(current_user, data):
        """Export products to file"""
        try:
            result, status_code = ProductService.export_products(data)
            return APIResponse.success(result, 'Products exported successfully', status_code)
        except Exception as e:
            return APIResponse.server_error(str(e))
    
    @staticmethod
    def bulk_update_products(current_user, data):
        """Bulk update products"""
        try:
            result, status_code = ProductService.bulk_update_products(current_user, data)
            
            if status_code == 200:
                return APIResponse.success(result, 'Products updated successfully')
            else:
                return APIResponse.error(result['error'], 'BULK_ERROR', status_code)
                
        except Exception as e:
            return APIResponse.server_error(str(e))