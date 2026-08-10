from app.utils.response import APIResponse
from app.services.branch_service import BranchService

class BranchController:
    
    @staticmethod
    def get_branches(params):
        """Get all branches"""
        try:
            result, status_code = BranchService.get_branches(params)
            return APIResponse.success(result, 'Branches retrieved successfully', status_code)
        except Exception as e:
            return APIResponse.server_error(str(e))
    
    @staticmethod
    def create_branch(current_user, data):
        """Create a new branch"""
        try:
            result, status_code = BranchService.create_branch(current_user, data)
            
            if status_code == 201:
                return APIResponse.success(result, 'Branch created successfully', 201)
            else:
                return APIResponse.error(result['error'], 'CREATE_ERROR', status_code)
                
        except Exception as e:
            return APIResponse.server_error(str(e))
    
    @staticmethod
    def get_branch(branch_id):
        """Get branch details"""
        try:
            result, status_code = BranchService.get_branch(branch_id)
            
            if status_code == 200:
                return APIResponse.success(result, 'Branch details retrieved successfully')
            else:
                return APIResponse.error(result['error'], 'NOT_FOUND', status_code)
                
        except Exception as e:
            return APIResponse.server_error(str(e))
    
    @staticmethod
    def update_branch(current_user, branch_id, data):
        """Update a branch"""
        try:
            result, status_code = BranchService.update_branch(current_user, branch_id, data)
            
            if status_code == 200:
                return APIResponse.success(result, 'Branch updated successfully')
            else:
                return APIResponse.error(result['error'], 'UPDATE_ERROR', status_code)
                
        except Exception as e:
            return APIResponse.server_error(str(e))
    
    @staticmethod
    def delete_branch(current_user, branch_id):
        """Delete a branch"""
        try:
            result, status_code = BranchService.delete_branch(current_user, branch_id)
            
            if status_code == 200:
                return APIResponse.success(None, result['message'])
            else:
                return APIResponse.error(result['error'], 'DELETE_ERROR', status_code)
                
        except Exception as e:
            return APIResponse.server_error(str(e))
    
    @staticmethod
    def get_branch_staff(current_user, branch_id, params):
        """Get staff of a branch"""
        try:
            result, status_code = BranchService.get_branch_staff(branch_id, params)
            return APIResponse.success(result, 'Branch staff retrieved successfully', status_code)
        except Exception as e:
            return APIResponse.server_error(str(e))
    
    @staticmethod
    def get_branch_appointments(current_user, branch_id, params):
        """Get appointments of a branch"""
        try:
            result, status_code = BranchService.get_branch_appointments(branch_id, params)
            return APIResponse.success(result, 'Branch appointments retrieved successfully', status_code)
        except Exception as e:
            return APIResponse.server_error(str(e))
    
    @staticmethod
    def get_branch_services(branch_id, params):
        """Get services offered at a branch"""
        try:
            result, status_code = BranchService.get_branch_services(branch_id, params)
            return APIResponse.success(result, 'Branch services retrieved successfully', status_code)
        except Exception as e:
            return APIResponse.server_error(str(e))
    
    @staticmethod
    def get_branch_products(current_user, branch_id, params):
        """Get products available at a branch"""
        try:
            result, status_code = BranchService.get_branch_products(branch_id, params)
            return APIResponse.success(result, 'Branch products retrieved successfully', status_code)
        except Exception as e:
            return APIResponse.server_error(str(e))
    
    @staticmethod
    def get_branch_inventory(current_user, branch_id, params):
        """Get inventory of a branch"""
        try:
            result, status_code = BranchService.get_branch_inventory(branch_id, params)
            return APIResponse.success(result, 'Branch inventory retrieved successfully', status_code)
        except Exception as e:
            return APIResponse.server_error(str(e))
    
    @staticmethod
    def get_branch_sales(current_user, branch_id, params):
        """Get sales of a branch"""
        try:
            result, status_code = BranchService.get_branch_sales(branch_id, params)
            return APIResponse.success(result, 'Branch sales retrieved successfully', status_code)
        except Exception as e:
            return APIResponse.server_error(str(e))
    
    @staticmethod
    def get_branch_statistics(current_user, branch_id):
        """Get branch statistics"""
        try:
            result, status_code = BranchService.get_branch_statistics(branch_id)
            return APIResponse.success(result, 'Branch statistics retrieved successfully', status_code)
        except Exception as e:
            return APIResponse.server_error(str(e))
    
    @staticmethod
    def toggle_branch(current_user, branch_id):
        """Toggle branch status"""
        try:
            result, status_code = BranchService.toggle_branch(current_user, branch_id)
            
            if status_code == 200:
                return APIResponse.success(result, 'Branch toggled successfully')
            else:
                return APIResponse.error(result['error'], 'TOGGLE_ERROR', status_code)
                
        except Exception as e:
            return APIResponse.server_error(str(e))
    
    @staticmethod
    def get_branch_analytics(current_user, params):
        """Get branch analytics"""
        try:
            result, status_code = BranchService.get_branch_analytics(params)
            return APIResponse.success(result, 'Branch analytics retrieved successfully', status_code)
        except Exception as e:
            return APIResponse.server_error(str(e))
    
    @staticmethod
    def get_branch_performance(current_user, branch_id, params):
        """Get branch performance"""
        try:
            result, status_code = BranchService.get_branch_performance(branch_id, params)
            return APIResponse.success(result, 'Branch performance retrieved successfully', status_code)
        except Exception as e:
            return APIResponse.server_error(str(e))
    
    @staticmethod
    def export_branches(current_user, data):
        """Export branches to file"""
        try:
            result, status_code = BranchService.export_branches(data)
            return APIResponse.success(result, 'Branches exported successfully', status_code)
        except Exception as e:
            return APIResponse.server_error(str(e))