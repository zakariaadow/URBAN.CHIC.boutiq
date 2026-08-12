import os
import re
from datetime import timedelta
from dotenv import load_dotenv

# ============================================================
# DATABASE URL FIX
# ============================================================

def fix_database_url(url):
    """Convert database URL to SQLAlchemy compatible format"""
    if not url:
        return url
    
    # If already has pymysql, return as is
    if 'mysql+pymysql://' in url:
        return url
    
    # Fix MySQL URL for SQLAlchemy
    if url.startswith('mysql://'):
        url = re.sub(r'mysql://', 'mysql+pymysql://', url, count=1)
    # Fix PostgreSQL URL for SQLAlchemy
    elif url.startswith('postgres://'):
        url = re.sub(r'postgres://', 'postgresql://', url, count=1)
    
    return url

# ============================================================
# BASE DIRECTORY
# ============================================================

BASE_DIR = os.path.abspath(os.path.dirname(__file__))

# ============================================================
# ENVIRONMENT
# ============================================================

IS_VERCEL = bool(os.environ.get("VERCEL"))
IS_RENDER = bool(os.environ.get("RENDER"))
IS_LOCAL = not (IS_VERCEL or IS_RENDER)

# Load .env only for local development
if IS_LOCAL:
    load_dotenv(
        dotenv_path=os.path.join(BASE_DIR, ".env"),
        override=False
    )

print(f"Environment: {'VERCEL' if IS_VERCEL else 'RENDER' if IS_RENDER else 'LOCAL'}")

# ============================================================
# BASE CONFIGURATION
# ============================================================

class Config:
    """Base application configuration."""

    # ========================================================
    # APPLICATION SETTINGS
    # ========================================================

    APP_NAME = os.environ.get("APP_NAME", "Urban Chic Boutique")
    
    SECRET_KEY = os.environ.get("SECRET_KEY")
    if not SECRET_KEY:
        if not IS_LOCAL:
            raise RuntimeError("SECRET_KEY is not configured in environment variables.")
        SECRET_KEY = "dev-secret-key-change-in-production"
        print("⚠️ Using development SECRET_KEY")
    
    # ✅ FIX: Ensure SECRET_KEY is a string
    if isinstance(SECRET_KEY, bytes):
        SECRET_KEY = SECRET_KEY.decode('utf-8')

    DEBUG = os.environ.get("DEBUG", "False").lower() == "true"
    TESTING = os.environ.get("TESTING", "False").lower() == "true"
    
    ENV = os.environ.get("FLASK_ENV", "production" if not IS_LOCAL else "development")

    # ========================================================
    # DATABASE SETTINGS
    # ========================================================

    DATABASE_URL = os.environ.get("DATABASE_URL")
    
    if not DATABASE_URL:
        if IS_LOCAL:
            DATABASE_URL = "sqlite:///instance/urban_chic.db"
            print("⚠️ DATABASE_URL not set, using SQLite for local development")
        else:
            raise RuntimeError("DATABASE_URL is not configured in environment variables.")

    # Fix the URL if needed (but your URL already has pymysql)
    SQLALCHEMY_DATABASE_URI = fix_database_url(DATABASE_URL)
    print(f"✅ Database URL configured: {SQLALCHEMY_DATABASE_URI[:50]}...")

    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_ECHO = os.environ.get("SQL_ECHO", "False").lower() == "true"

    # MySQL connection settings for production
    SQLALCHEMY_ENGINE_OPTIONS = {
        "pool_pre_ping": True,
        "pool_recycle": int(os.environ.get("DB_POOL_RECYCLE", "280")),
        "pool_size": int(os.environ.get("DB_POOL_SIZE", "5")),
        "max_overflow": int(os.environ.get("DB_MAX_OVERFLOW", "2"))
    }

    # ========================================================
    # CORS SETTINGS
    # ========================================================

    CORS_ORIGINS = os.environ.get(
        "CORS_ORIGINS",
        "http://localhost:3000,http://localhost:5173,http://localhost:5000"
    ).split(',')

    # ========================================================
    # UPLOAD SETTINGS
    # ========================================================

    if IS_VERCEL or IS_RENDER:
        UPLOAD_FOLDER = "/tmp/urban_chic_uploads"
    else:
        UPLOAD_FOLDER = os.path.join(BASE_DIR, "app", "uploads")

    MAX_CONTENT_LENGTH = int(
        os.environ.get("MAX_CONTENT_LENGTH", 16 * 1024 * 1024)
    )

    # ========================================================
    # EMAIL SETTINGS
    # ========================================================

    MAIL_SERVER = os.environ.get("MAIL_SERVER", "smtp.gmail.com")
    MAIL_PORT = int(os.environ.get("MAIL_PORT", "587"))
    MAIL_USE_TLS = os.environ.get("MAIL_USE_TLS", "True").lower() == "true"
    MAIL_USE_SSL = os.environ.get("MAIL_USE_SSL", "False").lower() == "true"
    MAIL_USERNAME = os.environ.get("MAIL_USERNAME")
    MAIL_PASSWORD = os.environ.get("MAIL_PASSWORD")
    MAIL_DEFAULT_SENDER = os.environ.get("MAIL_DEFAULT_SENDER", MAIL_USERNAME)
    MAIL_DEBUG = os.environ.get("MAIL_DEBUG", "False").lower() == "true"

    # ========================================================
    # FRONTEND URL
    # ========================================================

    FRONTEND_URL = os.environ.get("FRONTEND_URL", "http://localhost:5173")

    # ========================================================
    # SESSION SETTINGS - ✅ DISABLED
    # ========================================================

    # Use 'null' session type to disable sessions (bypasses cookie issues)
    SESSION_TYPE = "null"
    SESSION_COOKIE_NAME = "urban_chic_session"
    SESSION_PERMANENT = True
    SESSION_USE_SIGNER = True
    SESSION_KEY_PREFIX = "urban_chic_"
    SESSION_COOKIE_SECURE = os.environ.get("SESSION_COOKIE_SECURE", "True" if not IS_LOCAL else "False").lower() == "true"
    SESSION_COOKIE_HTTPONLY = True
    SESSION_COOKIE_SAMESITE = "Lax"
    SESSION_COOKIE_DOMAIN = None
    PERMANENT_SESSION_LIFETIME = timedelta(days=7)

    # ========================================================
    # RATE LIMITING
    # ========================================================

    RATELIMIT_ENABLED = os.environ.get("RATELIMIT_ENABLED", "True").lower() == "true"
    RATELIMIT_DEFAULT = os.environ.get("RATELIMIT_DEFAULT", "100/hour")
    RATELIMIT_STORAGE_URI = os.environ.get("RATELIMIT_STORAGE_URI", "memory://")

    # ========================================================
    # LOGGING
    # ========================================================

    LOG_LEVEL = os.environ.get("LOG_LEVEL", "INFO")
    LOG_FILE = os.environ.get("LOG_FILE", "app.log")
    LOG_FORMAT = "%(asctime)s - %(name)s - %(levelname)s - %(message)s"

    # ========================================================
    # BUSINESS DETAILS
    # ========================================================

    BUSINESS_NAME = os.environ.get("BUSINESS_NAME", "Urban Chic Boutique")
    BUSINESS_ADDRESS = os.environ.get("BUSINESS_ADDRESS", "123 Fashion Street, Nairobi, Kenya")
    BUSINESS_PHONE = os.environ.get("BUSINESS_PHONE", "+254 700 000 000")
    BUSINESS_EMAIL = os.environ.get("BUSINESS_EMAIL", "info@urbanchic.com")
    TAX_ID = os.environ.get("TAX_ID", "1234567890")
    TAX_RATE = float(os.environ.get("TAX_RATE", "0.16"))

    # ========================================================
    # LOYALTY SETTINGS
    # ========================================================

    LOYALTY_POINTS_PER_KES = float(os.environ.get("LOYALTY_POINTS_PER_KES", "0.1"))
    LOYALTY_POINTS_EXPIRY_DAYS = int(os.environ.get("LOYALTY_POINTS_EXPIRY_DAYS", "365"))

    # ========================================================
    # COMMISSION SETTINGS
    # ========================================================

    DEFAULT_COMMISSION_RATE = float(os.environ.get("DEFAULT_COMMISSION_RATE", "0.10"))

    # ========================================================
    # SECURITY
    # ========================================================

    CSRF_ENABLED = os.environ.get("CSRF_ENABLED", "True").lower() == "true"

    # ========================================================
    # BACKUP SETTINGS
    # ========================================================

    if IS_VERCEL or IS_RENDER:
        BACKUP_DIR = "/tmp/urban_chic_backups"
    else:
        BACKUP_DIR = os.environ.get("BACKUP_DIR", os.path.join(BASE_DIR, "backups"))

    BACKUP_RETENTION_DAYS = int(os.environ.get("BACKUP_RETENTION_DAYS", "30"))

# ============================================================
# DEVELOPMENT CONFIGURATION
# ============================================================

class DevelopmentConfig(Config):
    """Development configuration."""
    DEBUG = True
    SQLALCHEMY_ECHO = True
    SESSION_COOKIE_SECURE = False
    MAIL_DEBUG = True

# ============================================================
# TESTING CONFIGURATION
# ============================================================

class TestingConfig(Config):
    """Testing configuration."""
    TESTING = True
    DEBUG = True
    SQLALCHEMY_DATABASE_URI = "sqlite:///:memory:"
    SESSION_COOKIE_SECURE = False
    RATELIMIT_ENABLED = False
    CSRF_ENABLED = False

# ============================================================
# PRODUCTION CONFIGURATION
# ============================================================

class ProductionConfig(Config):
    """Production configuration."""
    DEBUG = False
    TESTING = False
    SESSION_COOKIE_SECURE = True
    CSRF_ENABLED = True
    RATELIMIT_ENABLED = True
    MAIL_DEBUG = False

# ============================================================
# CONFIGURATION DICTIONARY
# ============================================================

config = {
    "development": DevelopmentConfig,
    "testing": TestingConfig,
    "production": ProductionConfig,
    "default": ProductionConfig
}