import os
from dotenv import load_dotenv
from datetime import timedelta

# Load environment variables with override
BASE_DIR = os.path.abspath(os.path.dirname(__file__))
ENV_FILE = os.path.join(BASE_DIR, ".env")
load_dotenv(dotenv_path=ENV_FILE, override=True)

DB_PATH = os.path.join(BASE_DIR, "instance", "urban_chic_boutique.db")
print(f"DB_PATH = {DB_PATH}")
print(f"Environment file loaded from: {ENV_FILE}")
print(f"MAIL_USERNAME from env: {os.environ.get('MAIL_USERNAME')}")

class Config:
    """Base configuration"""
    
    # Application settings
    APP_NAME = os.environ.get('APP_NAME', 'Urban Chic Boutique')
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'dev-secret-key-change-in-production'
    DEBUG = os.environ.get('DEBUG', 'False').lower() == 'true'
    TESTING = os.environ.get('TESTING', 'False').lower() == 'true'
    ENV = os.environ.get('FLASK_ENV', 'development')
    
    # Database settings
    SQLALCHEMY_DATABASE_URI = os.environ.get(
        'DATABASE_URL',
        f"sqlite:///{DB_PATH}"
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_ECHO = os.environ.get('SQL_ECHO', 'False').lower() == 'true'
    SQLALCHEMY_ENGINE_OPTIONS = {
        'pool_size': int(os.environ.get('DB_POOL_SIZE', 10)),
        'pool_recycle': int(os.environ.get('DB_POOL_RECYCLE', 3600)),
        'pool_pre_ping': True
    }
    
    # CORS settings
    CORS_ORIGINS = os.environ.get('CORS_ORIGINS', 'http://localhost:3000,http://127.0.0.1:3000,http://localhost:5173')
    
    # Upload settings
    UPLOAD_FOLDER = os.path.join(BASE_DIR, 'app', 'uploads')
    MAX_CONTENT_LENGTH = int(os.environ.get('MAX_CONTENT_LENGTH', 16 * 1024 * 1024))
    
    # Email settings - Explicitly fetch from environment
    MAIL_SERVER = os.environ.get('MAIL_SERVER', 'smtp.gmail.com')
    MAIL_PORT = int(os.environ.get('MAIL_PORT', '587'))
    MAIL_USE_TLS = os.environ.get('MAIL_USE_TLS', 'True').lower() == 'true'
    MAIL_USE_SSL = os.environ.get('MAIL_USE_SSL', 'False').lower() == 'true'
    MAIL_USERNAME = os.environ.get('MAIL_USERNAME')
    MAIL_PASSWORD = os.environ.get('MAIL_PASSWORD')
    MAIL_DEFAULT_SENDER = os.environ.get('MAIL_DEFAULT_SENDER', MAIL_USERNAME)
    MAIL_DEBUG = os.environ.get('MAIL_DEBUG', 'False').lower() == 'true'
    
    # Debug print to verify
    print(f"Config: MAIL_USERNAME = {MAIL_USERNAME}")
    print(f"Config: MAIL_PASSWORD length = {len(MAIL_PASSWORD) if MAIL_PASSWORD else 0}")
    print(f"Config: MAIL_DEFAULT_SENDER = {MAIL_DEFAULT_SENDER}")
    
    # Frontend URL
    FRONTEND_URL = os.environ.get('FRONTEND_URL', 'http://localhost:3000')
    
    # Session settings
    SESSION_TYPE = 'filesystem'
    SESSION_FILE_DIR = os.path.join(BASE_DIR, 'flask_session')
    SESSION_PERMANENT = True
    SESSION_USE_SIGNER = True
    SESSION_KEY_PREFIX = 'urban_chic_'
    SESSION_COOKIE_SECURE = os.environ.get('SESSION_COOKIE_SECURE', 'False').lower() == 'true'
    SESSION_COOKIE_HTTPONLY = True
    SESSION_COOKIE_SAMESITE = 'Lax'
    SESSION_COOKIE_DOMAIN = None
    PERMANENT_SESSION_LIFETIME = timedelta(days=7)
    
    # Rate limiting
    RATELIMIT_ENABLED = os.environ.get('RATELIMIT_ENABLED', 'True').lower() == 'true'
    RATELIMIT_DEFAULT = os.environ.get('RATELIMIT_DEFAULT', '100/hour')
    RATELIMIT_STORAGE_URI = os.environ.get('RATELIMIT_STORAGE_URI', 'memory://')
    
    # Logging
    LOG_LEVEL = os.environ.get('LOG_LEVEL', 'INFO')
    LOG_FILE = os.environ.get('LOG_FILE', 'app.log')
    LOG_FORMAT = '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    
    # Business details
    BUSINESS_NAME = os.environ.get('BUSINESS_NAME', 'Urban Chic Boutique')
    BUSINESS_ADDRESS = os.environ.get('BUSINESS_ADDRESS', '123 Fashion Street, Nairobi, Kenya')
    BUSINESS_PHONE = os.environ.get('BUSINESS_PHONE', '+254 700 000 000')
    BUSINESS_EMAIL = os.environ.get('BUSINESS_EMAIL', 'info@urbanchic.com')
    TAX_ID = os.environ.get('TAX_ID', '1234567890')
    TAX_RATE = float(os.environ.get('TAX_RATE', 0.16))
    
    # Loyalty settings
    LOYALTY_POINTS_PER_KES = float(os.environ.get('LOYALTY_POINTS_PER_KES', 0.1))
    LOYALTY_POINTS_EXPIRY_DAYS = int(os.environ.get('LOYALTY_POINTS_EXPIRY_DAYS', 365))
    
    # Commission settings
    DEFAULT_COMMISSION_RATE = float(os.environ.get('DEFAULT_COMMISSION_RATE', 0.10))
    
    # Security
    CSRF_ENABLED = os.environ.get('CSRF_ENABLED', 'True').lower() == 'true'
    
    # Backup settings
    BACKUP_DIR = os.environ.get('BACKUP_DIR', 'backups')
    BACKUP_RETENTION_DAYS = int(os.environ.get('BACKUP_RETENTION_DAYS', 30))

class DevelopmentConfig(Config):
    """Development configuration"""
    DEBUG = True
    SQLALCHEMY_ECHO = True
    SESSION_COOKIE_SECURE = False
    SESSION_TYPE = 'filesystem'
    MAIL_DEBUG = True

class TestingConfig(Config):
    """Testing configuration"""
    TESTING = True
    DEBUG = True
    SQLALCHEMY_DATABASE_URI = 'sqlite:///:memory:'
    SESSION_COOKIE_SECURE = False
    SESSION_TYPE = 'filesystem'
    RATELIMIT_ENABLED = False
    CSRF_ENABLED = False

class ProductionConfig(Config):
    """Production configuration"""
    DEBUG = False
    TESTING = False
    SESSION_COOKIE_SECURE = True
    SESSION_TYPE = 'redis'
    CSRF_ENABLED = True
    RATELIMIT_ENABLED = True
    MAIL_DEBUG = False

# Configuration dictionary
config = {
    'development': DevelopmentConfig,
    'testing': TestingConfig,
    'production': ProductionConfig,
    'default': DevelopmentConfig
}