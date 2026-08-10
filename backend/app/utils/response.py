from flask import jsonify
from datetime import datetime

class APIResponse:
    """Standard API response builder"""
    
    @staticmethod
    def success(data=None, message='Success', status_code=200):
        """Return success response"""
        response = {
            'status': 'success',
            'message': message,
            'timestamp': datetime.utcnow().isoformat()
        }
        if data is not None:
            response['data'] = data
        return jsonify(response), status_code
    
    @staticmethod
    def error(message='Error occurred', code='ERROR', status_code=400, details=None):
        """Return error response"""
        response = {
            'status': 'error',
            'message': message,
            'code': code,
            'timestamp': datetime.utcnow().isoformat()
        }
        if details is not None:
            response['details'] = details
        return jsonify(response), status_code
    
    @staticmethod
    def paginated(items, total, page, per_page, message='Success'):
        """Return paginated response"""
        return jsonify({
            'status': 'success',
            'message': message,
            'timestamp': datetime.utcnow().isoformat(),
            'data': {
                'items': items,
                'pagination': {
                    'total': total,
                    'page': page,
                    'per_page': per_page,
                    'pages': (total + per_page - 1) // per_page if per_page > 0 else 0
                }
            }
        }), 200
    
    @staticmethod
    def created(data=None, message='Resource created successfully'):
        """Return created response"""
        return APIResponse.success(data, message, 201)
    
    @staticmethod
    def updated(data=None, message='Resource updated successfully'):
        """Return updated response"""
        return APIResponse.success(data, message, 200)
    
    @staticmethod
    def deleted(message='Resource deleted successfully'):
        """Return deleted response"""
        return APIResponse.success(None, message, 200)
    
    @staticmethod
    def not_found(message='Resource not found'):
        """Return not found response"""
        return APIResponse.error(message, 'NOT_FOUND', 404)
    
    @staticmethod
    def bad_request(message='Bad request', details=None):
        """Return bad request response"""
        return APIResponse.error(message, 'BAD_REQUEST', 400, details)
    
    @staticmethod
    def unauthorized(message='Unauthorized access'):
        """Return unauthorized response"""
        return APIResponse.error(message, 'UNAUTHORIZED', 401)
    
    @staticmethod
    def forbidden(message='Forbidden access'):
        """Return forbidden response"""
        return APIResponse.error(message, 'FORBIDDEN', 403)
    
    @staticmethod
    def conflict(message='Resource conflict', details=None):
        """Return conflict response"""
        return APIResponse.error(message, 'CONFLICT', 409, details)
    
    @staticmethod
    def validation_error(details):
        """Return validation error response"""
        return APIResponse.error('Validation error', 'VALIDATION_ERROR', 422, details)
    
    @staticmethod
    def server_error(message='Internal server error'):
        """Return server error response"""
        return APIResponse.error(message, 'SERVER_ERROR', 500)

class SuccessResponse:
    """Success response wrapper for controllers"""
    
    def __init__(self, data=None, message='Success', status_code=200):
        self.data = data
        self.message = message
        self.status_code = status_code
    
    def to_response(self):
        return APIResponse.success(self.data, self.message, self.status_code)

class ErrorResponse:
    """Error response wrapper for controllers"""
    
    def __init__(self, message='Error occurred', code='ERROR', status_code=400, details=None):
        self.message = message
        self.code = code
        self.status_code = status_code
        self.details = details
    
    def to_response(self):
        return APIResponse.error(self.message, self.code, self.status_code, self.details)