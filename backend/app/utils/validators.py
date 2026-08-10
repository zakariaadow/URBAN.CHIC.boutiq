import re
from datetime import datetime

class ValidationError(Exception):
    """Custom validation error"""
    pass

class Validator:
    """Data validation utilities"""
    
    @staticmethod
    def required(value, field_name):
        """Validate required field"""
        if value is None or (isinstance(value, str) and not value.strip()):
            raise ValidationError(f"{field_name} is required")
        return True
    
    @staticmethod
    def min_length(value, length, field_name):
        """Validate minimum length"""
        if len(str(value)) < length:
            raise ValidationError(f"{field_name} must be at least {length} characters")
        return True
    
    @staticmethod
    def max_length(value, length, field_name):
        """Validate maximum length"""
        if len(str(value)) > length:
            raise ValidationError(f"{field_name} must not exceed {length} characters")
        return True
    
    @staticmethod
    def min_value(value, min_val, field_name):
        """Validate minimum value"""
        if value < min_val:
            raise ValidationError(f"{field_name} must be at least {min_val}")
        return True
    
    @staticmethod
    def max_value(value, max_val, field_name):
        """Validate maximum value"""
        if value > max_val:
            raise ValidationError(f"{field_name} must not exceed {max_val}")
        return True
    
    @staticmethod
    def pattern(value, pattern, field_name, message=None):
        """Validate against regex pattern"""
        if not re.match(pattern, str(value)):
            message = message or f"{field_name} has invalid format"
            raise ValidationError(message)
        return True
    
    @staticmethod
    def email(value, field_name='Email'):
        """Validate email format"""
        pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        return Validator.pattern(value, pattern, field_name, f"{field_name} must be a valid email address")
    
    @staticmethod
    def phone(value, field_name='Phone'):
        """Validate phone number format"""
        # Remove any non-digit characters
        phone = re.sub(r'\D', '', str(value))
        if len(phone) < 10 or len(phone) > 15:
            raise ValidationError(f"{field_name} must be a valid phone number")
        return True
    
    @staticmethod
    def password(value, field_name='Password'):
        """Validate password strength"""
        if len(value) < 8:
            raise ValidationError(f"{field_name} must be at least 8 characters")
        if not re.search(r'[A-Z]', value):
            raise ValidationError(f"{field_name} must contain at least one uppercase letter")
        if not re.search(r'[a-z]', value):
            raise ValidationError(f"{field_name} must contain at least one lowercase letter")
        if not re.search(r'[0-9]', value):
            raise ValidationError(f"{field_name} must contain at least one number")
        if not re.search(r'[!@#$%^&*(),.?":{}|<>]', value):
            raise ValidationError(f"{field_name} must contain at least one special character")
        return True
    
    @staticmethod
    def url(value, field_name='URL'):
        """Validate URL format"""
        pattern = r'^https?://[a-zA-Z0-9-]+\.[a-zA-Z]{2,}(/[a-zA-Z0-9-._~:/?#[\]@!$&\'()*+,;=]*)?$'
        return Validator.pattern(value, pattern, field_name, f"{field_name} must be a valid URL")
    
    @staticmethod
    def date(value, field_name='Date', format='%Y-%m-%d'):
        """Validate date format"""
        try:
            datetime.strptime(str(value), format)
            return True
        except ValueError:
            raise ValidationError(f"{field_name} must be in format {format}")
    
    @staticmethod
    def datetime(value, field_name='DateTime', format='%Y-%m-%d %H:%M'):
        """Validate datetime format"""
        try:
            datetime.strptime(str(value), format)
            return True
        except ValueError:
            raise ValidationError(f"{field_name} must be in format {format}")
    
    @staticmethod
    def time(value, field_name='Time', format='%H:%M'):
        """Validate time format"""
        try:
            datetime.strptime(str(value), format)
            return True
        except ValueError:
            raise ValidationError(f"{field_name} must be in format {format}")
    
    @staticmethod
    def boolean(value, field_name='Boolean'):
        """Validate boolean"""
        if not isinstance(value, bool):
            raise ValidationError(f"{field_name} must be true or false")
        return True
    
    @staticmethod
    def integer(value, field_name='Integer'):
        """Validate integer"""
        try:
            int(value)
            return True
        except (ValueError, TypeError):
            raise ValidationError(f"{field_name} must be a valid integer")
    
    @staticmethod
    def float(value, field_name='Float'):
        """Validate float"""
        try:
            float(value)
            return True
        except (ValueError, TypeError):
            raise ValidationError(f"{field_name} must be a valid number")
    
    @staticmethod
    def one_of(value, allowed_values, field_name):
        """Validate value is one of allowed values"""
        if value not in allowed_values:
            raise ValidationError(f"{field_name} must be one of: {', '.join(allowed_values)}")
        return True
    
    @staticmethod
    def validate_dict(data, schema, allow_extra=False):
        """Validate dictionary against schema"""
        errors = {}
        
        # Check required fields
        for field, rules in schema.items():
            if field not in data:
                if rules.get('required', False):
                    errors[field] = f"{field} is required"
                continue
            
            value = data[field]
            
            # Apply validations
            for rule, params in rules.items():
                if rule == 'required':
                    continue
                try:
                    validator = getattr(Validator, rule)
                    if isinstance(params, dict):
                        validator(value, **params)
                    else:
                        validator(value, field_name=field)
                except ValidationError as e:
                    errors[field] = str(e)
                    break
        
        # Check for extra fields
        if not allow_extra:
            for field in data:
                if field not in schema:
                    errors[field] = f"Unexpected field: {field}"
        
        return errors
    
    @staticmethod
    def validate_email_format(email):
        """Validate email format (static method)"""
        if not email:
            return False
        pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        return re.match(pattern, email) is not None
    
    @staticmethod
    def validate_phone_format(phone):
        """Validate phone format (static method)"""
        if not phone:
            return False
        phone = re.sub(r'\D', '', str(phone))
        return len(phone) >= 10 and len(phone) <= 15
    
    @staticmethod
    def validate_password_strength(password):
        """Validate password strength (static method)"""
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
    def sanitize_string(text):
        """Sanitize string (static method)"""
        if not text:
            return text
        # Remove HTML tags
        text = re.sub(r'<[^>]+>', '', text)
        # Escape special characters
        text = text.replace('&', '&amp;')
        text = text.replace('<', '&lt;')
        text = text.replace('>', '&gt;')
        text = text.replace('"', '&quot;')
        text = text.replace("'", '&#x27;')
        return text
    
    @staticmethod
    def validate_amount(value, field_name='Amount'):
        """Validate monetary amount"""
        try:
            amount = float(value)
            if amount < 0:
                raise ValidationError(f"{field_name} must be greater than or equal to 0")
            if amount > 999999999.99:
                raise ValidationError(f"{field_name} exceeds maximum allowed value")
            return True
        except (ValueError, TypeError):
            raise ValidationError(f"{field_name} must be a valid amount")
    
    @staticmethod
    def validate_percentage(value, field_name='Percentage'):
        """Validate percentage"""
        try:
            percentage = float(value)
            if percentage < 0 or percentage > 100:
                raise ValidationError(f"{field_name} must be between 0 and 100")
            return True
        except (ValueError, TypeError):
            raise ValidationError(f"{field_name} must be a valid percentage")