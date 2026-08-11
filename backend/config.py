
import os
from dotenv import load_dotenv
from datetime import timedelta

# ============================================================
# BASE DIRECTORY
# ============================================================

BASE_DIR = os.path.abspath(os.path.dirname(__file__))

# ============================================================
# LOAD ENVIRONMENT VARIABLES
# ============================================================

ENV_FILE = os.path.join(BASE_DIR, ".env")

load_dotenv(
    dotenv_path=ENV_FILE,
    override=True
)

print(f"Environment file loaded from: {ENV_FILE}")


class Config:
    """Base configuration."""

    # ========================================================
    # APPLICATION SETTINGS
    # ========================================================

    APP_NAME = os.environ.get(
        "APP_NAME",
        "Urban Chic Boutique"
    )

    SECRET_KEY = os.environ.get(
        "SECRET_KEY",
        "dev-secret-key-change-in-production"
    )

    DEBUG = os.environ.get(
        "DEBUG",
        "False"
    ).lower() == "true"

    TESTING = os.environ.get(
        "TESTING",
        "False"
    ).lower() == "true"

    ENV = os.environ.get(
        "FLASK_ENV",
        "development"
    )

    # ========================================================
    # DATABASE SETTINGS
    # ========================================================
    #
    # DATABASE_URL should be defined in .env:
    #
    # mysql+pymysql://urban_chic_user:PASSWORD@localhost:3306/urban_chic_boutique
    #
    # We intentionally do NOT use the old SQLite database
    # as the default application database.
    #

    DATABASE_URL = os.environ.get("DATABASE_URL")

    if not DATABASE_URL:
        raise RuntimeError(
            "DATABASE_URL is not configured. "
            "Set DATABASE_URL in the .env file."
        )

    SQLALCHEMY_DATABASE_URI = DATABASE_URL

    SQLALCHEMY_TRACK_MODIFICATIONS = False

    SQLALCHEMY_ECHO = os.environ.get(
        "SQL_ECHO",
        "False"
    ).lower() == "true"

    SQLALCHEMY_ENGINE_OPTIONS = {
        "pool_size": int(
            os.environ.get("DB_POOL_SIZE", 10)
        ),
        "pool_recycle": int(
            os.environ.get("DB_POOL_RECYCLE", 3600)
        ),
        "pool_pre_ping": True
    }

    # ========================================================
    # CORS SETTINGS
    # ========================================================

    CORS_ORIGINS = os.environ.get(
        "CORS_ORIGINS",
        "http://localhost:3000,"
        "http://127.0.0.1:3000,"
        "http://localhost:5173"
    )

    # ========================================================
    # UPLOAD SETTINGS
    # ========================================================

    UPLOAD_FOLDER = os.path.join(
        BASE_DIR,
        "app",
        "uploads"
    )

    MAX_CONTENT_LENGTH = int(
        os.environ.get(
            "MAX_CONTENT_LENGTH",
            16 * 1024 * 1024
        )
    )

    # ========================================================
    # EMAIL SETTINGS
    # ========================================================

    MAIL_SERVER = os.environ.get(
        "MAIL_SERVER",
        "smtp.gmail.com"
    )

    MAIL_PORT = int(
        os.environ.get(
            "MAIL_PORT",
            "587"
        )
    )

    MAIL_USE_TLS = os.environ.get(
        "MAIL_USE_TLS",
        "True"
    ).lower() == "true"

    MAIL_USE_SSL = os.environ.get(
        "MAIL_USE_SSL",
        "False"
    ).lower() == "true"

    MAIL_USERNAME = os.environ.get(
        "MAIL_USERNAME"
    )

    MAIL_PASSWORD = os.environ.get(
        "MAIL_PASSWORD"
    )

    MAIL_DEFAULT_SENDER = os.environ.get(
        "MAIL_DEFAULT_SENDER",
        MAIL_USERNAME
    )

    MAIL_DEBUG = os.environ.get(
        "MAIL_DEBUG",
        "False"
    ).lower() == "true"

    # ========================================================
    # FRONTEND URL
    # ========================================================

    FRONTEND_URL = os.environ.get(
        "FRONTEND_URL",
        "http://localhost:3000"
    )

    # ========================================================
    # SESSION SETTINGS
    # ========================================================

    SESSION_TYPE = "filesystem"

    SESSION_FILE_DIR = os.path.join(
        BASE_DIR,
        "flask_session"
    )

    SESSION_PERMANENT = True

    SESSION_USE_SIGNER = True

    SESSION_KEY_PREFIX = "urban_chic_"

    SESSION_COOKIE_SECURE = os.environ.get(
        "SESSION_COOKIE_SECURE",
        "False"
    ).lower() == "true"

    SESSION_COOKIE_HTTPONLY = True

    SESSION_COOKIE_SAMESITE = "Lax"

    SESSION_COOKIE_DOMAIN = None

    PERMANENT_SESSION_LIFETIME = timedelta(
        days=7
    )

    # ========================================================
    # RATE LIMITING
    # ========================================================

    RATELIMIT_ENABLED = os.environ.get(
        "RATELIMIT_ENABLED",
        "True"
    ).lower() == "true"

    RATELIMIT_DEFAULT = os.environ.get(
        "RATELIMIT_DEFAULT",
        "100/hour"
    )

    RATELIMIT_STORAGE_URI = os.environ.get(
        "RATELIMIT_STORAGE_URI",
        "memory://"
    )

    # ========================================================
    # LOGGING
    # ========================================================

    LOG_LEVEL = os.environ.get(
        "LOG_LEVEL",
        "INFO"
    )

    LOG_FILE = os.environ.get(
        "LOG_FILE",
        "app.log"
    )

    LOG_FORMAT = (
        "%(asctime)s - "
        "%(name)s - "
        "%(levelname)s - "
        "%(message)s"
    )

    # ========================================================
    # BUSINESS DETAILS
    # ========================================================

    BUSINESS_NAME = os.environ.get(
        "BUSINESS_NAME",
        "Urban Chic Boutique"
    )

    BUSINESS_ADDRESS = os.environ.get(
        "BUSINESS_ADDRESS",
        "123 Fashion Street, Nairobi, Kenya"
    )

    BUSINESS_PHONE = os.environ.get(
        "BUSINESS_PHONE",
        "+254 700 000 000"
    )

    BUSINESS_EMAIL = os.environ.get(
        "BUSINESS_EMAIL",
        "info@urbanchic.com"
    )

    TAX_ID = os.environ.get(
        "TAX_ID",
        "1234567890"
    )

    TAX_RATE = float(
        os.environ.get(
            "TAX_RATE",
            0.16
        )
    )

    # ========================================================
    # LOYALTY SETTINGS
    # ========================================================

    LOYALTY_POINTS_PER_KES = float(
        os.environ.get(
            "LOYALTY_POINTS_PER_KES",
            0.1
        )
    )

    LOYALTY_POINTS_EXPIRY_DAYS = int(
        os.environ.get(
            "LOYALTY_POINTS_EXPIRY_DAYS",
            365
        )
    )

    # ========================================================
    # COMMISSION SETTINGS
    # ========================================================

    DEFAULT_COMMISSION_RATE = float(
        os.environ.get(
            "DEFAULT_COMMISSION_RATE",
            0.10
        )
    )

    # ========================================================
    # SECURITY
    # ========================================================

    CSRF_ENABLED = os.environ.get(
        "CSRF_ENABLED",
        "True"
    ).lower() == "true"

    # ========================================================
    # BACKUP SETTINGS
    # ========================================================

    BACKUP_DIR = os.environ.get(
        "BACKUP_DIR",
        "backups"
    )

    BACKUP_RETENTION_DAYS = int(
        os.environ.get(
            "BACKUP_RETENTION_DAYS",
            30
        )
    )


# ============================================================
# DEVELOPMENT CONFIGURATION
# ============================================================

class DevelopmentConfig(Config):
    """Development configuration."""

    DEBUG = True

    SQLALCHEMY_ECHO = True

    SESSION_COOKIE_SECURE = False

    SESSION_TYPE = "filesystem"

    MAIL_DEBUG = True


# ============================================================
# TESTING CONFIGURATION
# ============================================================

class TestingConfig(Config):
    """Testing configuration."""

    TESTING = True

    DEBUG = True

    # Tests use an isolated SQLite database.
    SQLALCHEMY_DATABASE_URI = "sqlite:///:memory:"

    SESSION_COOKIE_SECURE = False

    SESSION_TYPE = "filesystem"

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

    SESSION_TYPE = "redis"

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
    "default": DevelopmentConfig
}
