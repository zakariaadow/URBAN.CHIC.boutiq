from flask import Blueprint, request, jsonify
from app.controllers.branch_controller import BranchController
from app.utils.auth import login_required, role_required

branch_bp = Blueprint('branch', __name__, url_prefix='/api/branches')

# Get all branches
@branch_bp.route('/', methods=['GET'])
def get_branches():
    """Get all branches"""
    return BranchController.get_branches(request.args)

# Create a new branch
@branch_bp.route('/', methods=['POST'])
@login_required
@role_required('admin')
def create_branch(current_user):
    """Create a new branch"""
    return BranchController.create_branch(current_user, request.json)

# Get branch by ID
@branch_bp.route('/<int:branch_id>', methods=['GET'])
def get_branch(branch_id):
    """Get branch details"""
    return BranchController.get_branch(branch_id)

# Update branch
@branch_bp.route('/<int:branch_id>', methods=['PUT'])
@login_required
@role_required(['admin', 'manager'])
def update_branch(current_user, branch_id):
    """Update a branch"""
    return BranchController.update_branch(current_user, branch_id, request.json)

# Delete branch
@branch_bp.route('/<int:branch_id>', methods=['DELETE'])
@login_required
@role_required('admin')
def delete_branch(current_user, branch_id):
    """Delete a branch"""
    return BranchController.delete_branch(current_user, branch_id)

# Get branch staff
@branch_bp.route('/<int:branch_id>/staff', methods=['GET'])
@login_required
def get_branch_staff(current_user, branch_id):
    """Get staff of a branch"""
    return BranchController.get_branch_staff(current_user, branch_id, request.args)

# Get branch appointments
@branch_bp.route('/<int:branch_id>/appointments', methods=['GET'])
@login_required
def get_branch_appointments(current_user, branch_id):
    """Get appointments of a branch"""
    return BranchController.get_branch_appointments(current_user, branch_id, request.args)

# Get branch services
@branch_bp.route('/<int:branch_id>/services', methods=['GET'])
def get_branch_services(branch_id):
    """Get services offered at a branch"""
    return BranchController.get_branch_services(branch_id, request.args)

# Get branch products
@branch_bp.route('/<int:branch_id>/products', methods=['GET'])
@login_required
def get_branch_products(current_user, branch_id):
    """Get products available at a branch"""
    return BranchController.get_branch_products(current_user, branch_id, request.args)

# Get branch inventory
@branch_bp.route('/<int:branch_id>/inventory', methods=['GET'])
@login_required
def get_branch_inventory(current_user, branch_id):
    """Get inventory of a branch"""
    return BranchController.get_branch_inventory(current_user, branch_id, request.args)

# Get branch sales
@branch_bp.route('/<int:branch_id>/sales', methods=['GET'])
@login_required
def get_branch_sales(current_user, branch_id):
    """Get sales of a branch"""
    return BranchController.get_branch_sales(current_user, branch_id, request.args)

# Get branch statistics
@branch_bp.route('/<int:branch_id>/statistics', methods=['GET'])
@login_required
def get_branch_statistics(current_user, branch_id):
    """Get branch statistics"""
    return BranchController.get_branch_statistics(current_user, branch_id)

# Toggle branch status
@branch_bp.route('/<int:branch_id>/toggle', methods=['POST'])
@login_required
@role_required('admin')
def toggle_branch(current_user, branch_id):
    """Toggle branch status"""
    return BranchController.toggle_branch(current_user, branch_id)

# Get branch analytics
@branch_bp.route('/analytics', methods=['GET'])
@login_required
@role_required(['admin', 'manager'])
def get_branch_analytics(current_user):
    """Get branch analytics"""
    return BranchController.get_branch_analytics(current_user, request.args)

# Get branch performance
@branch_bp.route('/<int:branch_id>/performance', methods=['GET'])
@login_required
@role_required(['admin', 'manager'])
def get_branch_performance(current_user, branch_id):
    """Get branch performance"""
    return BranchController.get_branch_performance(current_user, branch_id, request.args)

# Export branches
@branch_bp.route('/export', methods=['POST'])
@login_required
@role_required('admin')
def export_branches(current_user):
    """Export branches to file"""
    return BranchController.export_branches(current_user, request.json)