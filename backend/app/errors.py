from flask import jsonify, current_app
from werkzeug.exceptions import HTTPException
import logging
from datetime import datetime

logger = logging.getLogger(__name__)

def register_error_handlers(app):
    """Register error handlers for the app"""
    
    @app.errorhandler(400)
    def bad_request(error):
        return jsonify({
            'status': 'error',
            'message': 'Bad request',
            'code': 'BAD_REQUEST',
            'timestamp': datetime.utcnow().isoformat()
        }), 400
    
    @app.errorhandler(401)
    def unauthorized(error):
        return jsonify({
            'status': 'error',
            'message': 'Unauthorized access',
            'code': 'UNAUTHORIZED',
            'timestamp': datetime.utcnow().isoformat()
        }), 401
    
    @app.errorhandler(403)
    def forbidden(error):
        return jsonify({
            'status': 'error',
            'message': 'Forbidden access',
            'code': 'FORBIDDEN',
            'timestamp': datetime.utcnow().isoformat()
        }), 403
    
    @app.errorhandler(404)
    def not_found(error):
        return jsonify({
            'status': 'error',
            'message': 'Resource not found',
            'code': 'NOT_FOUND',
            'timestamp': datetime.utcnow().isoformat()
        }), 404
    
    @app.errorhandler(405)
    def method_not_allowed(error):
        return jsonify({
            'status': 'error',
            'message': 'Method not allowed',
            'code': 'METHOD_NOT_ALLOWED',
            'timestamp': datetime.utcnow().isoformat()
        }), 405
    
    @app.errorhandler(409)
    def conflict(error):
        return jsonify({
            'status': 'error',
            'message': 'Resource conflict',
            'code': 'CONFLICT',
            'timestamp': datetime.utcnow().isoformat()
        }), 409
    
    @app.errorhandler(422)
    def unprocessable_entity(error):
        return jsonify({
            'status': 'error',
            'message': 'Unprocessable entity',
            'code': 'UNPROCESSABLE_ENTITY',
            'details': error.description if hasattr(error, 'description') else None,
            'timestamp': datetime.utcnow().isoformat()
        }), 422
    
    @app.errorhandler(429)
    def rate_limit_exceeded(error):
        return jsonify({
            'status': 'error',
            'message': 'Rate limit exceeded. Please try again later.',
            'code': 'RATE_LIMIT_EXCEEDED',
            'timestamp': datetime.utcnow().isoformat()
        }), 429
    
    @app.errorhandler(500)
    def internal_server_error(error):
        logger.error(f'Internal server error: {str(error)}')
        return jsonify({
            'status': 'error',
            'message': 'Internal server error',
            'code': 'INTERNAL_SERVER_ERROR',
            'timestamp': datetime.utcnow().isoformat()
        }), 500
    
    @app.errorhandler(503)
    def service_unavailable(error):
        return jsonify({
            'status': 'error',
            'message': 'Service unavailable',
            'code': 'SERVICE_UNAVAILABLE',
            'timestamp': datetime.utcnow().isoformat()
        }), 503
    
    @app.errorhandler(HTTPException)
    def handle_http_exception(error):
        return jsonify({
            'status': 'error',
            'message': error.description,
            'code': error.__class__.__name__.upper(),
            'timestamp': datetime.utcnow().isoformat()
        }), error.code
    
    @app.errorhandler(Exception)
    def handle_exception(error):
        logger.error(f'Unhandled exception: {str(error)}')
        logger.error(f'Exception type: {type(error).__name__}')
        if app.debug:
            import traceback
            logger.error(traceback.format_exc())
        
        return jsonify({
            'status': 'error',
            'message': 'An unexpected error occurred',
            'code': 'UNEXPECTED_ERROR',
            'timestamp': datetime.utcnow().isoformat()
        }), 500

# Custom exception classes
class BusinessException(Exception):
    """Base business exception"""
    def __init__(self, message, code='BUSINESS_ERROR', status_code=400):
        self.message = message
        self.code = code
        self.status_code = status_code
        super().__init__(message)

class NotFoundException(BusinessException):
    def __init__(self, message='Resource not found'):
        super().__init__(message, 'NOT_FOUND', 404)

class ValidationException(BusinessException):
    def __init__(self, message='Validation error', details=None):
        self.details = details
        super().__init__(message, 'VALIDATION_ERROR', 422)

class AuthenticationException(BusinessException):
    def __init__(self, message='Authentication failed'):
        super().__init__(message, 'AUTH_ERROR', 401)

class AuthorizationException(BusinessException):
    def __init__(self, message='Authorization failed'):
        super().__init__(message, 'AUTHORIZATION_ERROR', 403)

class ConflictException(BusinessException):
    def __init__(self, message='Resource conflict'):
        super().__init__(message, 'CONFLICT', 409)