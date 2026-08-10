import re
import uuid
import random
import string
from datetime import datetime, timedelta
from flask import request, current_app

class Helper:
    
    @staticmethod
    def generate_uuid():
        """Generate a UUID"""
        return str(uuid.uuid4())
    
    @staticmethod
    def generate_random_string(length=10):
        """Generate a random string"""
        return ''.join(random.choices(string.ascii_letters + string.digits, k=length))
    
    @staticmethod
    def generate_random_number(length=6):
        """Generate a random number string"""
        return ''.join(random.choices(string.digits, k=length))
    
    @staticmethod
    def generate_reference_number(prefix='REF'):
        """Generate a reference number"""
        timestamp = datetime.utcnow().strftime('%Y%m%d%H%M%S')
        random_part = Helper.generate_random_number(4)
        return f"{prefix}{timestamp}{random_part}"
    
    @staticmethod
    def format_currency(amount, currency='KES'):
        """Format currency amount"""
        return f"{currency} {amount:,.2f}"
    
    @staticmethod
    def format_date(date, format='%Y-%m-%d'):
        """Format date"""
        if not date:
            return None
        if isinstance(date, str):
            try:
                date = datetime.fromisoformat(date)
            except:
                return date
        return date.strftime(format)
    
    @staticmethod
    def format_datetime(dt, format='%Y-%m-%d %H:%M'):
        """Format datetime"""
        if not dt:
            return None
        if isinstance(dt, str):
            try:
                dt = datetime.fromisoformat(dt)
            except:
                return dt
        return dt.strftime(format)
    
    @staticmethod
    def parse_date(date_str, format='%Y-%m-%d'):
        """Parse date string"""
        try:
            return datetime.strptime(date_str, format).date()
        except:
            return None
    
    @staticmethod
    def parse_datetime(dt_str, format='%Y-%m-%d %H:%M'):
        """Parse datetime string"""
        try:
            return datetime.strptime(dt_str, format)
        except:
            return None
    
    @staticmethod
    def get_today():
        """Get today's date"""
        return datetime.utcnow().date()
    
    @staticmethod
    def get_now():
        """Get current datetime"""
        return datetime.utcnow()
    
    @staticmethod
    def get_date_range(days=30):
        """Get date range for last N days"""
        end_date = Helper.get_today()
        start_date = end_date - timedelta(days=days)
        return start_date, end_date
    
    @staticmethod
    def get_month_range():
        """Get date range for current month"""
        now = Helper.get_now()
        start_date = datetime(now.year, now.month, 1).date()
        end_date = Helper.get_today()
        return start_date, end_date
    
    @staticmethod
    def get_week_range():
        """Get date range for current week"""
        now = Helper.get_now()
        start_date = (now - timedelta(days=now.weekday())).date()
        end_date = Helper.get_today()
        return start_date, end_date
    
    @staticmethod
    def calculate_age(birth_date):
        """Calculate age from birth date"""
        if not birth_date:
            return None
        today = Helper.get_today()
        return today.year - birth_date.year - ((today.month, today.day) < (birth_date.month, birth_date.day))
    
    @staticmethod
    def is_valid_email(email):
        """Validate email format"""
        if not email:
            return False
        pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        return re.match(pattern, email) is not None
    
    @staticmethod
    def is_valid_phone(phone):
        """Validate phone number format"""
        if not phone:
            return False
        # Remove any non-digit characters
        phone = re.sub(r'\D', '', phone)
        # Check if it's a valid phone number (minimum 10 digits)
        return len(phone) >= 10 and len(phone) <= 15
    
    @staticmethod
    def is_valid_password(password):
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
    def is_valid_url(url):
        """Validate URL format"""
        if not url:
            return False
        pattern = r'^https?://[a-zA-Z0-9-]+\.[a-zA-Z]{2,}(/[a-zA-Z0-9-._~:/?#[\]@!$&\'()*+,;=]*)?$'
        return re.match(pattern, url) is not None
    
    @staticmethod
    def sanitize_string(text):
        """Sanitize string to prevent XSS"""
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
    def truncate_text(text, length=100, suffix='...'):
        """Truncate text to specified length"""
        if not text:
            return text
        if len(text) <= length:
            return text
        return text[:length] + suffix
    
    @staticmethod
    def snake_to_camel(text):
        """Convert snake_case to camelCase"""
        parts = text.split('_')
        return parts[0] + ''.join(word.capitalize() for word in parts[1:])
    
    @staticmethod
    def camel_to_snake(text):
        """Convert camelCase to snake_case"""
        return re.sub(r'(?<!^)(?=[A-Z])', '_', text).lower()
    
    @staticmethod
    def get_client_ip():
        """Get client IP address"""
        if request.headers.get('X-Forwarded-For'):
            return request.headers.get('X-Forwarded-For').split(',')[0].strip()
        if request.headers.get('X-Real-IP'):
            return request.headers.get('X-Real-IP')
        return request.remote_addr
    
    @staticmethod
    def get_user_agent():
        """Get user agent string"""
        return request.headers.get('User-Agent', 'Unknown')
    
    @staticmethod
    def is_ajax_request():
        """Check if request is AJAX"""
        return request.headers.get('X-Requested-With') == 'XMLHttpRequest'
    
    @staticmethod
    def get_request_metadata():
        """Get request metadata"""
        return {
            'ip': Helper.get_client_ip(),
            'user_agent': Helper.get_user_agent(),
            'method': request.method,
            'path': request.path,
            'timestamp': Helper.get_now().isoformat()
        }
    
    @staticmethod
    def calculate_percentage(part, whole):
        """Calculate percentage"""
        if not whole or whole == 0:
            return 0
        return (part / whole) * 100
    
    @staticmethod
    def round_to_two_decimals(value):
        """Round value to 2 decimal places"""
        return round(value, 2)
    
    @staticmethod
    def get_first_and_last_name(full_name):
        """Split full name into first and last name"""
        if not full_name:
            return '', ''
        parts = full_name.strip().split()
        if len(parts) == 1:
            return parts[0], ''
        return parts[0], ' '.join(parts[1:])
    
    @staticmethod
    def generate_slug(text):
        """Generate URL slug from text"""
        if not text:
            return ''
        # Convert to lowercase
        text = text.lower()
        # Replace spaces with hyphens
        text = re.sub(r'\s+', '-', text)
        # Remove special characters
        text = re.sub(r'[^a-z0-9-]', '', text)
        # Remove multiple hyphens
        text = re.sub(r'-+', '-', text)
        # Trim hyphens from ends
        return text.strip('-')