from flask import Blueprint, request, jsonify
from app.controllers.auth_controller import AuthController
from app.utils.auth import token_required, role_required

auth_bp = Blueprint('auth', __name__, url_prefix='/api/auth')

# Public Authentication Routes
@auth_bp.route('/register', methods=['POST'])
def register():
    """Register a new user account"""
    return AuthController.register(request.json)

@auth_bp.route('/select-account-type', methods=['POST'])
def select_account_type():
    """Select account type during registration"""
    return AuthController.select_account_type(request.json)

@auth_bp.route('/login', methods=['POST'])
def login():
    """Login user"""
    return AuthController.login(request.json)

@auth_bp.route('/logout', methods=['POST'])
@token_required
def logout(current_user):
    """Logout user"""
    return AuthController.logout(current_user)

@auth_bp.route('/forgot-password', methods=['POST'])
def forgot_password():
    """Request password reset"""
    return AuthController.forgot_password(request.json)

@auth_bp.route('/reset-password', methods=['POST'])
def reset_password():
    """Reset password with token"""
    return AuthController.reset_password(request.json)

@auth_bp.route('/verify-email/<token>', methods=['GET'])
def verify_email(token):
    """Verify email address"""
    return AuthController.verify_email(token)

@auth_bp.route('/change-password', methods=['POST'])
@token_required
def change_password(current_user):
    """Change user password"""
    return AuthController.change_password(current_user, request.json)

@auth_bp.route('/refresh-token', methods=['POST'])
def refresh_token():
    """Refresh access token"""
    return AuthController.refresh_token(request.json)

@auth_bp.route('/profile', methods=['GET'])
@token_required
def get_profile(current_user):
    """Get user profile"""
    return AuthController.get_profile(current_user)

@auth_bp.route('/profile', methods=['PUT'])
@token_required
def update_profile(current_user):
    """Update user profile"""
    return AuthController.update_profile(current_user, request.json)

@auth_bp.route('/resend-verification', methods=['POST'])
@token_required
def resend_verification(current_user):
    """Resend email verification"""
    return AuthController.resend_verification(current_user)

@auth_bp.route('/check-email', methods=['POST'])
def check_email():
    """Check if email exists"""
    return AuthController.check_email(request.json)

@auth_bp.route('/check-username', methods=['POST'])
def check_username():
    """Check if username exists"""
    return AuthController.check_username(request.json)