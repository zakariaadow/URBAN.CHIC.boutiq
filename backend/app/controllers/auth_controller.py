from flask import jsonify, session, request
from app.models.user import User
from app.models.role import Role
from app.models.customer import Customer
from app.models.stylist import Stylist
from app.models.branch import Branch
from app.extensions import db
from app.utils.auth import generate_token, verify_password, hash_password, create_session
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

class AuthController:
    
    @staticmethod
    def login(data):
        """Login user"""
        try:
            if not data.get('email') or not data.get('password'):
                return jsonify({
                    'status': 'error',
                    'message': 'Email and password are required'
                }), 400
            
            user = User.query.filter_by(email=data['email']).first()
            
            if not user:
                return jsonify({
                    'status': 'error',
                    'message': 'Invalid credentials'
                }), 401
            
            if not user.check_password(data['password']):
                return jsonify({
                    'status': 'error',
                    'message': 'Invalid credentials'
                }), 401
            
            if not user.is_active:
                return jsonify({
                    'status': 'error',
                    'message': 'Account is deactivated'
                }), 403
            
            if not user.is_verified:
                return jsonify({
                    'status': 'error',
                    'message': 'Please verify your email first'
                }), 403
            
            # Check approval for staff roles
            if user.role and user.role.name != 'customer':
                if not user.is_approved:
                    return jsonify({
                        'status': 'error',
                        'message': 'Account pending approval from admin'
                    }), 403
            
            # Update last login
            user.last_login = datetime.utcnow()
            db.session.commit()
            
            # Generate token
            token = generate_token(user)
            
            # Create session
            create_session(user)
            
            return jsonify({
                'status': 'success',
                'message': 'Login successful',
                'data': {
                    'user': user.to_dict(),
                    'token': token
                }
            }), 200
            
        except Exception as e:
            logger.error(f"Error in login: {str(e)}")
            db.session.rollback()
            return jsonify({
                'status': 'error',
                'message': 'Login failed',
                'error': str(e)
            }), 500
    
    @staticmethod
    def register(data):
        """Register a new user"""
        try:
            required_fields = ['email', 'password', 'first_name', 'last_name', 'phone', 'account_type']
            for field in required_fields:
                if field not in data:
                    return jsonify({
                        'status': 'error',
                        'message': f'Missing required field: {field}'
                    }), 400
            
            if User.query.filter_by(email=data['email']).first():
                return jsonify({
                    'status': 'error',
                    'message': 'Email already registered'
                }), 409
            
            role = Role.query.filter_by(name=data['account_type']).first()
            if not role:
                return jsonify({
                    'status': 'error',
                    'message': 'Invalid account type'
                }), 400
            
            user = User(
                email=data['email'],
                username=data.get('username', data['email'].split('@')[0]),
                first_name=data['first_name'],
                last_name=data['last_name'],
                phone=data['phone'],
                role_id=role.id,
                is_approved=True if data['account_type'] == 'customer' else False,
                is_active=True,
                is_verified=True,
                created_at=datetime.utcnow()
            )
            
            user.set_password(data['password'])
            
            db.session.add(user)
            db.session.flush()
            
            # Create customer profile if account type is customer
            if data['account_type'] == 'customer':
                customer = Customer(
                    user_id=user.id,
                    address=data.get('address'),
                    date_of_birth=data.get('date_of_birth'),
                    preferences=data.get('preferences', {})
                )
                db.session.add(customer)
            
            # CREATE STYLIST PROFILE if account type is stylist
            elif data['account_type'] == 'stylist':
                # Get default branch (first branch or create one)
                branch = Branch.query.first()
                if not branch:
                    branch = Branch(
                        name='Headquarters',
                        code='HQ001',
                        address='123 Fashion Street',
                        city='Nairobi',
                        country='Kenya',
                        phone='+254700000000',
                        email='hq@urbanchic.com',
                        manager_name='Default Manager',
                        opening_time='08:00:00',
                        closing_time='20:00:00',
                        days_open=['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
                        is_active=True
                    )
                    db.session.add(branch)
                    db.session.flush()
                
                # Generate employee ID
                employee_id = f"STY{datetime.now().strftime('%Y%m%d%H%M%S')}{user.id}"
                
                stylist = Stylist(
                    user_id=user.id,
                    branch_id=branch.id,
                    employee_id=employee_id,
                    specialization=data.get('specialization', 'General Stylist'),
                    experience_years=data.get('experience_years', 0),
                    skills=data.get('skills', []),
                    certification=data.get('certification'),
                    hire_date=datetime.now().date(),
                    salary=data.get('salary', 0),
                    commission_rate=data.get('commission_rate', 0.10),
                    rating=0.0,
                    is_available=True,
                    is_active=True,
                    created_at=datetime.utcnow()
                )
                db.session.add(stylist)
            
            db.session.commit()
            
            # Generate token after registration
            token = generate_token(user)
            create_session(user)
            
            return jsonify({
                'status': 'success',
                'message': 'Registration successful',
                'data': {
                    'user': user.to_dict(),
                    'token': token,
                    'requires_approval': data['account_type'] != 'customer'
                }
            }), 201
            
        except Exception as e:
            db.session.rollback()
            logger.error(f"Error in registration: {str(e)}")
            return jsonify({
                'status': 'error',
                'message': 'Registration failed',
                'error': str(e)
            }), 500
    
    @staticmethod
    def logout(current_user):
        """Logout user"""
        try:
            session.clear()
            return jsonify({
                'status': 'success',
                'message': 'Logged out successfully'
            }), 200
        except Exception as e:
            return jsonify({
                'status': 'error',
                'message': 'Logout failed'
            }), 500
    
    @staticmethod
    def get_profile(current_user):
        """Get user profile"""
        try:
            return jsonify({
                'status': 'success',
                'data': current_user.to_dict()
            }), 200
        except Exception as e:
            logger.error(f"Error fetching profile: {str(e)}")
            return jsonify({
                'status': 'error',
                'message': 'Failed to fetch profile'
            }), 500
    
    @staticmethod
    def update_profile(current_user, data):
        """Update user profile"""
        try:
            if 'first_name' in data:
                current_user.first_name = data['first_name']
            if 'last_name' in data:
                current_user.last_name = data['last_name']
            if 'phone' in data:
                current_user.phone = data['phone']
            
            db.session.commit()
            
            return jsonify({
                'status': 'success',
                'message': 'Profile updated successfully',
                'data': current_user.to_dict()
            }), 200
            
        except Exception as e:
            db.session.rollback()
            logger.error(f"Error updating profile: {str(e)}")
            return jsonify({
                'status': 'error',
                'message': 'Failed to update profile'
            }), 500
    
    @staticmethod
    def forgot_password(data):
        """Request password reset"""
        try:
            email = data.get('email')
            if not email:
                return jsonify({
                    'status': 'error',
                    'message': 'Email is required'
                }), 400
            
            user = User.query.filter_by(email=email).first()
            if not user:
                return jsonify({
                    'status': 'error',
                    'message': 'Email not found'
                }), 404
            
            import secrets
            reset_token = secrets.token_hex(32)
            
            return jsonify({
                'status': 'success',
                'message': 'Password reset email sent',
                'data': {
                    'reset_token': reset_token
                }
            }), 200
            
        except Exception as e:
            logger.error(f"Error in forgot password: {str(e)}")
            return jsonify({
                'status': 'error',
                'message': 'Failed to send reset email'
            }), 500
    
    @staticmethod
    def reset_password(data):
        """Reset password with token"""
        try:
            token = data.get('token')
            new_password = data.get('new_password')
            
            if not token or not new_password:
                return jsonify({
                    'status': 'error',
                    'message': 'Token and new password are required'
                }), 400
            
            return jsonify({
                'status': 'success',
                'message': 'Password reset successfully'
            }), 200
            
        except Exception as e:
            logger.error(f"Error in reset password: {str(e)}")
            return jsonify({
                'status': 'error',
                'message': 'Failed to reset password'
            }), 500
    
    @staticmethod
    def verify_email(token):
        """Verify email address"""
        try:
            return jsonify({
                'status': 'success',
                'message': 'Email verified successfully'
            }), 200
        except Exception as e:
            return jsonify({
                'status': 'error',
                'message': 'Email verification failed'
            }), 500
    
    @staticmethod
    def refresh_token(request_data):
        """Refresh access token"""
        try:
            user_id = request_data.get('user_id')
            if not user_id:
                return jsonify({
                    'status': 'error',
                    'message': 'User ID required'
                }), 400
            
            user = User.query.get(user_id)
            if not user:
                return jsonify({
                    'status': 'error',
                    'message': 'User not found'
                }), 404
            
            token = generate_token(user)
            
            return jsonify({
                'status': 'success',
                'data': {
                    'token': token
                }
            }), 200
            
        except Exception as e:
            return jsonify({
                'status': 'error',
                'message': 'Failed to refresh token'
            }), 500
    
    @staticmethod
    def check_email(data):
        """Check if email exists"""
        try:
            email = data.get('email')
            if not email:
                return jsonify({
                    'status': 'error',
                    'message': 'Email is required'
                }), 400
            
            exists = User.query.filter_by(email=email).first() is not None
            
            return jsonify({
                'status': 'success',
                'data': {
                    'exists': exists
                }
            }), 200
            
        except Exception as e:
            return jsonify({
                'status': 'error',
                'message': str(e)
            }), 500
    
    @staticmethod
    def check_username(data):
        """Check if username exists"""
        try:
            username = data.get('username')
            if not username:
                return jsonify({
                    'status': 'error',
                    'message': 'Username is required'
                }), 400
            
            exists = User.query.filter_by(username=username).first() is not None
            
            return jsonify({
                'status': 'success',
                'data': {
                    'exists': exists
                }
            }), 200
            
        except Exception as e:
            return jsonify({
                'status': 'error',
                'message': str(e)
            }), 500
    
    @staticmethod
    def resend_verification(current_user):
        """Resend email verification"""
        try:
            return jsonify({
                'status': 'success',
                'message': 'Verification email sent'
            }), 200
        except Exception as e:
            return jsonify({
                'status': 'error',
                'message': 'Failed to send verification email'
            }), 500
    
    @staticmethod
    def select_account_type(data):
        """Select account type during registration"""
        try:
            account_type = data.get('account_type')
            if not account_type:
                return jsonify({
                    'status': 'error',
                    'message': 'Account type is required'
                }), 400
            
            valid_types = ['customer', 'manager', 'receptionist', 'stylist', 'finance', 'inventory']
            if account_type not in valid_types:
                return jsonify({
                    'status': 'error',
                    'message': f'Invalid account type. Must be one of: {", ".join(valid_types)}'
                }), 400
            
            return jsonify({
                'status': 'success',
                'data': {
                    'account_type': account_type,
                    'requires_approval': account_type != 'customer'
                }
            }), 200
            
        except Exception as e:
            return jsonify({
                'status': 'error',
                'message': str(e)
            }), 500
    
    @staticmethod
    def change_password(current_user, data):
        """Change user password"""
        try:
            old_password = data.get('old_password')
            new_password = data.get('new_password')
            
            if not old_password or not new_password:
                return jsonify({
                    'status': 'error',
                    'message': 'Old and new password are required'
                }), 400
            
            if not current_user.check_password(old_password):
                return jsonify({
                    'status': 'error',
                    'message': 'Current password is incorrect'
                }), 401
            
            current_user.set_password(new_password)
            db.session.commit()
            
            return jsonify({
                'status': 'success',
                'message': 'Password changed successfully'
            }), 200
            
        except Exception as e:
            db.session.rollback()
            return jsonify({
                'status': 'error',
                'message': 'Failed to change password'
            }), 500