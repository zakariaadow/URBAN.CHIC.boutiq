from functools import wraps
from flask import request, jsonify, current_app, session
import datetime
import secrets
import base64
from werkzeug.security import check_password_hash, generate_password_hash
from app.extensions import db
from app.models.user import User
from app.models.role import Role

# ============ TOKEN-BASED AUTHENTICATION ============

def generate_simple_token(user_id):
    """Generate a simple token without JWT"""
    timestamp = datetime.datetime.utcnow().isoformat()
    random_string = secrets.token_hex(16)
    token_string = f"{user_id}:{timestamp}:{random_string}"
    token = base64.b64encode(token_string.encode()).decode()
    return token

def decode_simple_token(token):
    """Decode a simple token"""
    try:
        if not token or token == 'null' or token == 'None' or token == '':
            return None
        
        token = token.strip()
        decoded = base64.b64decode(token.encode()).decode()
        parts = decoded.split(':')
        if len(parts) >= 3:
            return {
                'user_id': int(parts[0]),
                'timestamp': parts[1],
                'random': parts[2]
            }
        return None
    except Exception as e:
        print(f"Error decoding token: {e}")
        return None

def token_required(f):
    """Decorator to verify token - For API routes"""
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        
        # Get token from Authorization header
        auth_header = request.headers.get('Authorization')
        
        # Debug logging
        print("=" * 60)
        print(f"Authorization Header: {auth_header}")
        print(f"Session: {dict(session) if session else 'Empty'}")
        print("=" * 60)
        
        if auth_header:
            if auth_header.startswith('Bearer '):
                token = auth_header.split(' ')[1]
            else:
                token = auth_header
        
        if not token:
            token = request.args.get('token')
        
        if not token or token == 'null' or token == 'None' or token == '':
            return jsonify({
                'status': 'error',
                'message': 'Authentication required. Please login first.',
                'code': 'TOKEN_MISSING'
            }), 401
        
        try:
            token_data = decode_simple_token(token)
            
            if not token_data:
                return jsonify({
                    'status': 'error',
                    'message': 'Invalid token format. Please login again.',
                    'code': 'TOKEN_INVALID'
                }), 401
            
            # Use db.session.get() instead of User.query.get()
            current_user = db.session.get(User, token_data['user_id'])
            
            if not current_user:
                return jsonify({
                    'status': 'error',
                    'message': 'User not found. Please login again.',
                    'code': 'USER_NOT_FOUND'
                }), 401
            
            if not current_user.is_active:
                return jsonify({
                    'status': 'error',
                    'message': 'Account is deactivated',
                    'code': 'ACCOUNT_INACTIVE'
                }), 403
            
            role_name = current_user.role.name if current_user.role else None
            
            if role_name and role_name not in ['customer', 'admin']:
                if not current_user.is_approved:
                    return jsonify({
                        'status': 'error',
                        'message': 'Account not approved',
                        'code': 'ACCOUNT_NOT_APPROVED'
                    }), 403
            
        except Exception as e:
            print(f"Token validation error: {e}")
            return jsonify({
                'status': 'error',
                'message': f'Invalid token: {str(e)}',
                'code': 'TOKEN_INVALID'
            }), 401
        
        kwargs['current_user'] = current_user
        return f(*args, **kwargs)
    
    return decorated

# ============ SESSION-BASED AUTHENTICATION ============

def login_required(f):
    """Decorator to verify user is logged in"""
    @wraps(f)
    def decorated(*args, **kwargs):
        user_id = session.get('user_id')
        current_user = None
        
        if user_id:
            current_user = db.session.get(User, user_id)
        
        if not current_user:
            auth_header = request.headers.get('Authorization')
            if auth_header:
                if auth_header.startswith('Bearer '):
                    token = auth_header.split(' ')[1]
                else:
                    token = auth_header
                if token and token != 'null' and token != 'None':
                    token_data = decode_simple_token(token)
                    if token_data:
                        current_user = db.session.get(User, token_data['user_id'])
        
        if not current_user:
            return jsonify({
                'status': 'error',
                'message': 'Please log in to access this resource',
                'code': 'UNAUTHORIZED'
            }), 401
        
        if not current_user.is_active:
            session.clear()
            return jsonify({
                'status': 'error',
                'message': 'Account is deactivated',
                'code': 'ACCOUNT_INACTIVE'
            }), 403
        
        kwargs['current_user'] = current_user
        return f(*args, **kwargs)
    
    return decorated

# ============ ROLE-BASED AUTHENTICATION ============

def admin_required(f):
    """Decorator to check if user is admin"""
    @wraps(f)
    def decorated(*args, **kwargs):
        current_user = kwargs.get('current_user')
        
        if not current_user:
            return jsonify({
                'status': 'error',
                'message': 'User not authenticated',
                'code': 'USER_NOT_AUTHENTICATED'
            }), 401
        
        is_admin = False
        if current_user.role and current_user.role.name == 'admin':
            is_admin = True
        if hasattr(current_user, 'is_system_admin') and current_user.is_system_admin:
            is_admin = True
        
        if not is_admin:
            return jsonify({
                'status': 'error',
                'message': 'Admin access required',
                'code': 'ADMIN_REQUIRED'
            }), 403
        
        return f(*args, **kwargs)
    return decorated

def role_required(*required_roles):
    """Decorator to check user roles"""
    def decorator(f):
        @wraps(f)
        def decorated(*args, **kwargs):
            current_user = kwargs.get('current_user')
            
            if not current_user:
                return jsonify({
                    'status': 'error',
                    'message': 'User not authenticated',
                    'code': 'USER_NOT_AUTHENTICATED'
                }), 401
            
            is_admin = False
            if current_user.role and current_user.role.name == 'admin':
                is_admin = True
            if hasattr(current_user, 'is_system_admin') and current_user.is_system_admin:
                is_admin = True
            
            if is_admin:
                return f(*args, **kwargs)
            
            user_role = current_user.role.name if current_user.role else None
            
            if user_role not in required_roles:
                return jsonify({
                    'status': 'error',
                    'message': 'Insufficient permissions',
                    'code': 'PERMISSION_DENIED',
                    'required_roles': required_roles,
                    'user_role': user_role
                }), 403
            
            return f(*args, **kwargs)
        return decorated
    return decorator

def permission_required(permission_name):
    """Decorator to check specific permissions"""
    def decorator(f):
        @wraps(f)
        def decorated(*args, **kwargs):
            current_user = kwargs.get('current_user')
            
            if not current_user:
                return jsonify({
                    'status': 'error',
                    'message': 'User not authenticated',
                    'code': 'USER_NOT_AUTHENTICATED'
                }), 401
            
            is_admin = False
            if current_user.role and current_user.role.name == 'admin':
                is_admin = True
            if hasattr(current_user, 'is_system_admin') and current_user.is_system_admin:
                is_admin = True
            
            if is_admin:
                return f(*args, **kwargs)
            
            return f(*args, **kwargs)
        return decorated
    return decorator

# ============ SESSION MANAGEMENT ============

def create_session(user):
    """Create a session for the user"""
    session.permanent = True
    session['user_id'] = user.id
    session['email'] = user.email
    session['role'] = user.role.name if user.role else None
    if hasattr(user, 'username'):
        session['username'] = user.username
    if hasattr(user, 'first_name') and hasattr(user, 'last_name'):
        session['full_name'] = f"{user.first_name} {user.last_name}"

def destroy_session():
    """Destroy the current session"""
    session.clear()

def generate_token(user):
    """Generate token for user"""
    return generate_simple_token(user.id)

# ============ PASSWORD UTILITIES ============

def verify_password(hashed_password, plain_password):
    """Verify password hash"""
    return check_password_hash(hashed_password, plain_password)

def hash_password(password):
    """Hash password"""
    return generate_password_hash(password)

# ============ INITIALIZATION ============

def init_auth(app):
    """Initialize authentication components"""
    if not app.config.get('SECRET_KEY'):
        app.config['SECRET_KEY'] = secrets.token_hex(32)
        print("✅ AUTH: Generated new SECRET_KEY")
    print("✅ AUTH: Authentication initialized")
