from flask import Flask
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_mail import Mail
from flask_login import LoginManager
from flask_session import Session

import os
import sys
from datetime import datetime


# ============================================================
# CONFIGURATION PATH
# ============================================================

# Add the backend directory to Python's import path.
BACKEND_DIR = os.path.dirname(
    os.path.dirname(
        os.path.abspath(__file__)
    )
)

if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)


from config import config


# ============================================================
# APPLICATION EXTENSIONS
# ============================================================

from .extensions import (
    db,
    migrate,
    login_manager,
    server_session,
    mail,
    cors
)

from .routes import register_routes
from .errors import register_error_handlers
from .utils.auth import init_auth


# ============================================================
# APPLICATION FACTORY
# ============================================================

def create_app(config_name=None):
    """Create and configure the Flask application."""

    app = Flask(__name__)


    # ========================================================
    # LOAD CONFIGURATION
    # ========================================================

    if config_name is None:
        config_name = os.environ.get(
            "FLASK_ENV",
            "production"
        )

    # Make sure an invalid environment does not crash
    # because of a missing configuration key.
    if config_name not in config:
        config_name = "production"

    app.config.from_object(
        config[config_name]
    )


    # ========================================================
    # APPLICATION START TIME
    # ========================================================

    app.config["START_TIME"] = (
        datetime.utcnow().isoformat()
    )


    # ========================================================
    # INITIALIZE DATABASE
    # ========================================================

    db.init_app(app)


    # ========================================================
    # INITIALIZE DATABASE MIGRATIONS
    # ========================================================

    migrate.init_app(
        app,
        db
    )


    # ========================================================
    # INITIALIZE LOGIN MANAGER
    # ========================================================

    login_manager.init_app(app)


    # ========================================================
    # INITIALIZE SERVER SESSION - ✅ FIXED
    # ========================================================

    # Only initialize session if SESSION_TYPE is not 'null'
    if app.config.get('SESSION_TYPE') != 'null':
        # Make sure session cookie name is set
        if 'SESSION_COOKIE_NAME' not in app.config:
            app.config['SESSION_COOKIE_NAME'] = 'urban_chic_session'
        server_session.init_app(app)
    else:
        print("⚠️ Sessions are disabled (SESSION_TYPE = 'null')")


    # ========================================================
    # INITIALIZE CORS - ✅ EXPLICIT CONFIGURATION
    # ========================================================

    # Get CORS origins from config
    cors_origins = app.config.get('CORS_ORIGINS', ['*'])
    
    # Configure CORS with explicit settings
    cors.init_app(
        app,
        origins=cors_origins,
        supports_credentials=True,
        allow_headers=['Content-Type', 'Authorization', 'Accept'],
        methods=['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH']
    )
    
    # Add CORS headers after each request (fallback)
    @app.after_request
    def after_request(response):
        origin = request.headers.get('Origin')
        if origin and origin in cors_origins:
            response.headers.add('Access-Control-Allow-Origin', origin)
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization,Accept')
        response.headers.add('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS,PATCH')
        response.headers.add('Access-Control-Allow-Credentials', 'true')
        return response


    # ========================================================
    # INITIALIZE EMAIL
    # ========================================================

    mail.init_app(app)


    # ========================================================
    # EMAIL CONFIGURATION LOGGING
    # ========================================================

    print("=" * 60)
    print("EMAIL CONFIGURATION")
    print("=" * 60)

    print(
        f"MAIL_SERVER: "
        f"{app.config.get('MAIL_SERVER')}"
    )

    print(
        f"MAIL_PORT: "
        f"{app.config.get('MAIL_PORT')}"
    )

    print(
        f"MAIL_USE_TLS: "
        f"{app.config.get('MAIL_USE_TLS')}"
    )

    print(
        f"MAIL_USERNAME: "
        f"{app.config.get('MAIL_USERNAME')}"
    )

    print(
        f"MAIL_DEFAULT_SENDER: "
        f"{app.config.get('MAIL_DEFAULT_SENDER')}"
    )

    print(
        "MAIL_PASSWORD: "
        f"{'***' if app.config.get('MAIL_PASSWORD') else 'NOT SET'}"
    )

    print("=" * 60)


    # ========================================================
    # INITIALIZE AUTHENTICATION
    # ========================================================

    init_auth(app)


    # ========================================================
    # REGISTER ROUTES
    # ========================================================

    register_routes(app)


    # ========================================================
    # REGISTER ERROR HANDLERS
    # ========================================================

    register_error_handlers(app)


    # ========================================================
    # RETURN FLASK APPLICATION
    # ========================================================

    return app