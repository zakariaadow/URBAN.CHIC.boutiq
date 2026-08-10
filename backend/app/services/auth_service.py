from datetime import datetime, timedelta
import secrets
import hashlib
import re
from flask import current_app, session
from werkzeug.security import generate_password_hash, check_password_hash
from app.extensions import db
from app.models.user import User
from app.models.role import Role
from app.models.customer import Customer
from app.models.manager import Manager
from app.models.stylist import Stylist
from app.models.finance import Finance
from app.models.inventory import Inventory
from app.models.receptionist import Receptionist
from app.services.email_service import EmailService
from app.services.notification_service import NotificationService

class AuthService:
    
    @staticmethod
    def register_user(data):
        """Register a new user"""
        try:
            # Validate email
            if not AuthService._validate_email(data.get('email')):
                return {'error': 'Invalid email format'}, 400
            
            # Validate password
            if not AuthService._validate_password(data.get('password')):
                return {'error': 'Password must be at least 8 characters with uppercase, lowercase, number and special character'}, 400
            
            # Check if email exists
            if User.query.filter_by(email=data['email']).first():
                return {'error': 'Email already registered'}, 409
            
            # Check if username exists
            if User.query.filter_by(username=data['username']).first():
                return {'error': 'Username already taken'}, 409
            
            # Get role
            role = Role.query.filter_by(name=data.get('role', 'customer')).first()
            if not role:
                return {'error': 'Invalid role'}, 400
            
            # Create user
            user = User(
                email=data['email'],
                username=data['username'],
                first_name=data['first_name'],
                last_name=data['last_name'],
                phone=data.get('phone'),
                role_id=role.id,
                is_verified=False,
                is_approved=(role.name == 'customer')  # Customers auto-approved
            )
            user.set_password(data['password'])
            
            db.session.add(user)
            db.session.flush()
            
            # Create role-specific profile
            if role.name == 'customer':
                customer = Customer(
                    user_id=user.id,
                    date_of_birth=data.get('date_of_birth'),
                    gender=data.get('gender'),
                    address=data.get('address'),
                    city=data.get('city'),
                    state=data.get('state'),
                    country=data.get('country', 'Kenya'),
                    postal_code=data.get('postal_code')
                )
                db.session.add(customer)
                
            elif role.name == 'manager':
                manager = Manager(
                    user_id=user.id,
                    branch_id=data.get('branch_id'),
                    employee_id=AuthService._generate_employee_id('MGR'),
                    hire_date=data.get('hire_date', datetime.utcnow().date())
                )
                db.session.add(manager)
                
            elif role.name == 'stylist':
                stylist = Stylist(
                    user_id=user.id,
                    branch_id=data.get('branch_id'),
                    employee_id=AuthService._generate_employee_id('STY'),
                    specialization=data.get('specialization'),
                    experience_years=data.get('experience_years', 0),
                    skills=data.get('skills', []),
                    hire_date=data.get('hire_date', datetime.utcnow().date())
                )
                db.session.add(stylist)
                
            elif role.name == 'finance':
                finance = Finance(
                    user_id=user.id,
                    branch_id=data.get('branch_id'),
                    employee_id=AuthService._generate_employee_id('FIN'),
                    hire_date=data.get('hire_date', datetime.utcnow().date())
                )
                db.session.add(finance)
                
            elif role.name == 'inventory':
                inventory = Inventory(
                    user_id=user.id,
                    branch_id=data.get('branch_id'),
                    employee_id=AuthService._generate_employee_id('INV'),
                    hire_date=data.get('hire_date', datetime.utcnow().date())
                )
                db.session.add(inventory)
                
            elif role.name == 'receptionist':
                receptionist = Receptionist(
                    user_id=user.id,
                    branch_id=data.get('branch_id'),
                    employee_id=AuthService._generate_employee_id('REC'),
                    hire_date=data.get('hire_date', datetime.utcnow().date())
                )
                db.session.add(receptionist)
            
            db.session.commit()
            
            # Generate verification token (using secrets instead of JWT)
            token = AuthService.generate_verification_token(user.id)
            EmailService.send_verification_email(user.email, token)
            
            # Create welcome notification
            NotificationService.create_notification(
                user_id=user.id,
                title='Welcome to Urban Chic Boutique',
                message=f'Welcome {user.first_name}! Thank you for registering with us.',
                type='system'
            )
            
            return {
                'user': user.to_dict(),
                'message': 'Registration successful. Please verify your email.'
            }, 201
            
        except Exception as e:
            db.session.rollback()
            return {'error': str(e)}, 500
    
    @staticmethod
    def login_user(data):
        """Login user"""
        try:
            user = User.query.filter(
                (User.email == data.get('email')) | 
                (User.username == data.get('username'))
            ).first()
            
            if not user:
                return {'error': 'Invalid credentials'}, 401
            
            if not user.check_password(data.get('password')):
                return {'error': 'Invalid credentials'}, 401
            
            if not user.is_active:
                return {'error': 'Account is deactivated'}, 403
            
            if not user.is_verified:
                return {'error': 'Please verify your email first'}, 403
            
            if not user.is_approved and user.role.name != 'customer':
                return {'error': 'Account pending approval'}, 403
            
            # Update last login
            user.last_login = datetime.utcnow()
            db.session.commit()
            
            # Create session instead of token
            AuthService.create_session(user)
            
            return {
                'user': user.to_dict(),
                'message': 'Login successful'
            }, 200
            
        except Exception as e:
            return {'error': str(e)}, 500
    
    @staticmethod
    def create_session(user):
        """Create a session for the user"""
        session.permanent = True
        session['user_id'] = user.id
        session['email'] = user.email
        session['role'] = user.role.name if user.role else None
        session['username'] = user.username
        session['full_name'] = user.full_name
    
    @staticmethod
    def logout_user(user):
        """Logout user - clear session"""
        session.clear()
        return {'message': 'Logout successful'}, 200
    
    @staticmethod
    def forgot_password(data):
        """Request password reset"""
        try:
            user = User.query.filter_by(email=data.get('email')).first()
            if not user:
                return {'error': 'Email not found'}, 404
            
            # Generate reset token (using secrets instead of JWT)
            token = AuthService.generate_password_reset_token(user.id)
            EmailService.send_password_reset_email(user.email, token)
            
            return {'message': 'Password reset email sent'}, 200
            
        except Exception as e:
            return {'error': str(e)}, 500
    
    @staticmethod
    def reset_password(data):
        """Reset password with token"""
        try:
            token = data.get('token')
            new_password = data.get('new_password')
            
            if not AuthService._validate_password(new_password):
                return {'error': 'Invalid password format'}, 400
            
            # Verify token
            user_id = AuthService.verify_reset_token(token)
            if not user_id:
                return {'error': 'Invalid or expired token'}, 400
            
            user = User.query.get(user_id)
            if not user:
                return {'error': 'User not found'}, 404
            
            user.set_password(new_password)
            db.session.commit()
            
            return {'message': 'Password reset successful'}, 200
            
        except Exception as e:
            return {'error': str(e)}, 500
    
    @staticmethod
    def verify_email(token):
        """Verify email address"""
        try:
            # Verify token
            user_id = AuthService.verify_verification_token(token)
            if not user_id:
                return {'error': 'Invalid or expired token'}, 400
            
            user = User.query.get(user_id)
            if not user:
                return {'error': 'User not found'}, 404
            
            user.is_verified = True
            db.session.commit()
            
            return {'message': 'Email verified successfully'}, 200
            
        except Exception as e:
            return {'error': str(e)}, 500
    
    @staticmethod
    def change_password(user, data):
        """Change user password"""
        try:
            if not user.check_password(data.get('current_password')):
                return {'error': 'Current password is incorrect'}, 400
            
            if not AuthService._validate_password(data.get('new_password')):
                return {'error': 'Invalid password format'}, 400
            
            user.set_password(data['new_password'])
            db.session.commit()
            
            return {'message': 'Password changed successfully'}, 200
            
        except Exception as e:
            return {'error': str(e)}, 500
    
    @staticmethod
    def get_profile(user):
        """Get user profile"""
        try:
            profile = user.to_dict()
            
            # Add role-specific profile
            if user.role.name == 'customer':
                customer = Customer.query.filter_by(user_id=user.id).first()
                if customer:
                    profile['profile'] = customer.to_dict()
            elif user.role.name == 'manager':
                manager = Manager.query.filter_by(user_id=user.id).first()
                if manager:
                    profile['profile'] = manager.to_dict()
            elif user.role.name == 'stylist':
                stylist = Stylist.query.filter_by(user_id=user.id).first()
                if stylist:
                    profile['profile'] = stylist.to_dict()
            elif user.role.name == 'finance':
                finance = Finance.query.filter_by(user_id=user.id).first()
                if finance:
                    profile['profile'] = finance.to_dict()
            elif user.role.name == 'inventory':
                inventory = Inventory.query.filter_by(user_id=user.id).first()
                if inventory:
                    profile['profile'] = inventory.to_dict()
            elif user.role.name == 'receptionist':
                receptionist = Receptionist.query.filter_by(user_id=user.id).first()
                if receptionist:
                    profile['profile'] = receptionist.to_dict()
            
            return profile, 200
            
        except Exception as e:
            return {'error': str(e)}, 500
    
    @staticmethod
    def update_profile(user, data):
        """Update user profile"""
        try:
            # Update user fields
            if 'first_name' in data:
                user.first_name = data['first_name']
            if 'last_name' in data:
                user.last_name = data['last_name']
            if 'phone' in data:
                user.phone = data['phone']
            if 'profile_picture' in data:
                user.profile_picture = data['profile_picture']
            
            db.session.commit()
            
            return user.to_dict(), 200
            
        except Exception as e:
            db.session.rollback()
            return {'error': str(e)}, 500
    
    @staticmethod
    def generate_verification_token(user_id):
        """Generate email verification token (without JWT)"""
        import secrets
        import hashlib
        timestamp = datetime.utcnow().timestamp()
        raw = f"{user_id}:{timestamp}:{secrets.token_hex(16)}"
        token = hashlib.sha256(raw.encode()).hexdigest()
        # Store token with user for verification
        # You might want to store this in a separate table or in user record
        return token
    
    @staticmethod
    def generate_password_reset_token(user_id):
        """Generate password reset token (without JWT)"""
        import secrets
        import hashlib
        timestamp = datetime.utcnow().timestamp()
        raw = f"{user_id}:{timestamp}:{secrets.token_hex(16)}"
        token = hashlib.sha256(raw.encode()).hexdigest()
        # Store token with user for verification
        return token
    
    @staticmethod
    def verify_reset_token(token):
        """Verify password reset token (without JWT)"""
        # In a real implementation, you would check against stored tokens
        # For now, we'll return a mock implementation
        # You should implement proper token storage and verification
        return None
    
    @staticmethod
    def verify_verification_token(token):
        """Verify email verification token (without JWT)"""
        # In a real implementation, you would check against stored tokens
        # For now, we'll return a mock implementation
        # You should implement proper token storage and verification
        return None
    
    @staticmethod
    def _validate_email(email):
        """Validate email format"""
        if not email:
            return False
        pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        return re.match(pattern, email) is not None
    
    @staticmethod
    def _validate_password(password):
        """Validate password strength"""
        if not password or len(password) < 8:
            return False
        if not re.search(r'[A-Z]', password):
            return False
        if not re.search(r'[a-z]', password):
            return False
        if not re.search(r'[0-9]', password):
            return False
        if not re.search(r'[!@#$%^&*(),.?":{}|<>]', password):
            return False
        return True
    
    @staticmethod
    def _generate_employee_id(prefix):
        """Generate unique employee ID"""
        import random
        import string
        timestamp = datetime.utcnow().strftime('%Y%m%d')
        random_str = ''.join(random.choices(string.digits, k=4))
        return f"{prefix}{timestamp}{random_str}"
    
    @staticmethod
    def check_email_exists(email):
        """Check if email exists"""
        return User.query.filter_by(email=email).first() is not None
    
    @staticmethod
    def check_username_exists(username):
        """Check if username exists"""
        return User.query.filter_by(username=username).first() is not None