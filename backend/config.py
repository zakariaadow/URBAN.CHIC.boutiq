
import os
from datetime import timedelta
from dotenv import load_dotenv


# ============================================================
# BASE DIRECTORY
# ============================================================

BASE_DIR = os.path.abspath(os.path.dirname(__file__))


# ============================================================
# ENVIRONMENT
# ============================================================

IS_VERCEL = bool(os.environ.get("VERCEL"))

# Load .env for local development only.
# On Vercel, environment variables are provided by Vercel.
ENV_FILE = os.path.join(BASE_DIR, ".env")

if not IS_VERCEL:
    load_dotenv(
        dotenv_path=ENV_FILE,
        override=False
    )
else:
    # Do not allow a .env file inside the deployment
    # to overwrite Vercel environment variables.
    load_dotenv(
        dotenv_path=ENV_FILE,
        override=False
    )


print(f"Environment: {'VERCEL' if IS_VERCEL else 'LOCAL'}")


# ============================================================
# BASE CONFIGURATION
# ============================================================

class Config:
    """Base application configuration."""

    # ========================================================
    # APPLICATION SETTINGS
    # ========================================================

    APP_NAME = os.environ.get(
        "APP_NAME",
        "Urban Chic Boutique"
    )

    SECRET_KEY = os.environ.get(
        "SECRET_KEY"
    )

    if not SECRET_KEY:
        if IS_VERCEL:
            raise RuntimeError(
                "SECRET_KEY is not configured in Vercel."
            )

        SECRET_KEY = "dev-secret-key-change-in-production"

    DEBUG = os.environ.get(
        "DEBUG",
        "False"
    ).lower() == "true"

    TESTING = os.environ.get(
        "TESTING",
        "False"
    ).lower() == "true"

    # Vercel should use production unless explicitly changed.
    ENV = os.environ.get(
        "FLASK_ENV",
        "production" if IS_VERCEL else "development"
    )


    # ========================================================
    # DATABASE SETTINGS
    # ========================================================

    DATABASE_URL = os.environ.get("DATABASE_URL")

    if not DATABASE_URL:
        raise RuntimeError(
            "DATABASE_URL is not configured. "
            "Add DATABASE_URL to the Vercel project "
            "Environment Variables."
        )

    SQLALCHEMY_DATABASE_URI = DATABASE_URL

    SQLALCHEMY_TRACK_MODIFICATIONS = False

    SQLALCHEMY_ECHO = os.environ.get(
        "SQL_ECHO",
        "False"
    ).lower() == "true"

    # MySQL connection settings.
    #
    # Vercel is serverless, so use a small connection pool.
    # The database provider must allow remote connections.
    SQLALCHEMY_ENGINE_OPTIONS = {
        "pool_pre_ping": True,
        "pool_recycle": int(
            os.environ.get(
                "DB_POOL_RECYCLE",
                "280"
            )
        ),
        "pool_size": int(
            os.environ.get(
                "DB_POOL_SIZE",
                "5"
            )
        ),
        "max_overflow": int(
            os.environ.get(
                "DB_MAX_OVERFLOW",
                "2"
            )
        )
    }


    # ========================================================
    # CORS SETTINGS
    # ========================================================

    CORS_ORIGINS = os.environ.get(
        "CORS_ORIGINS",
        "http://localhost:3000,"
        "http://localhost:5173,"
        "http://127.0.0.1:3000,"
        "http://127.0.0.1:5173"
    )


    # ========================================================
    # UPLOAD SETTINGS
    # ========================================================

    if IS_VERCEL:
        # Vercel filesystem is read-only except /tmp.
        UPLOAD_FOLDER = "/tmp/urban_chic_uploads"
    else:
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
        "http://localhost:5173"
    )


    # ========================================================
    # SESSION SETTINGS
    # ========================================================

    SESSION_TYPE = "filesystem"

    # Vercel serverless functions can only write to /tmp.
    if IS_VERCEL:
        SESSION_FILE_DIR = "/tmp/flask_session"
    else:
        SESSION_FILE_DIR = os.path.join(
            BASE_DIR,
            "flask_session"
        )

    SESSION_PERMANENT = True

    SESSION_USE_SIGNER = True

    SESSION_KEY_PREFIX = "urban_chic_"

    SESSION_COOKIE_SECURE = (
        os.environ.get(
            "SESSION_COOKIE_SECURE",
            "True" if IS_VERCEL else "False"
        ).lower() == "true"
    )

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
            "0.16"
        )
    )


    # ========================================================
    # LOYALTY SETTINGS
    # ========================================================

    LOYALTY_POINTS_PER_KES = float(
        os.environ.get(
            "LOYALTY_POINTS_PER_KES",
            "0.1"
        )
    )

    LOYALTY_POINTS_EXPIRY_DAYS = int(
        os.environ.get(
            "LOYALTY_POINTS_EXPIRY_DAYS",
            "365"
        )
    )


    # ========================================================
    # COMMISSION SETTINGS
    # ========================================================

    DEFAULT_COMMISSION_RATE = float(
        os.environ.get(
            "DEFAULT_COMMISSION_RATE",
            "0.10"
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

    if IS_VERCEL:
        BACKUP_DIR = "/tmp/urban_chic_backups"
    else:
        BACKUP_DIR = os.environ.get(
            "BACKUP_DIR",
            os.path.join(
                BASE_DIR,
                "backups"
            )
        )

    BACKUP_RETENTION_DAYS = int(
        os.environ.get(
            "BACKUP_RETENTION_DAYS",
            "30"
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

    # SQLite is used ONLY for tests.
    SQLALCHEMY_DATABASE_URI = "sqlite:///:memory:"

    SESSION_COOKIE_SECURE = False

    SESSION_TYPE = "filesystem"

    RATELIMIT_ENABLED = False

    CSRF_ENABLED = False


# ============================================================
# PRODUCTION CONFIGURATION
# ============================================================

class ProductionConfig(Config):
    """Production configuration for Vercel."""

    DEBUG = False

    TESTING = False

    SESSION_COOKIE_SECURE = True

    SESSION_TYPE = "filesystem"

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
