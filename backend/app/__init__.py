from flask import Flask
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_mail import Mail
from flask_login import LoginManager
from flask_session import Session
import os
from datetime import datetime

# Import config from root (parent directory)
import sys
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from config import config

from .extensions import db, migrate, login_manager, server_session, mail, cors
from .routes import register_routes
from .errors import register_error_handlers
from .utils.auth import init_auth

def create_app(config_name=None):
    """Application factory pattern"""
    app = Flask(__name__)
    
    # Load configuration
    if config_name is None:
        config_name = os.environ.get('FLASK_ENV', 'development')
    
    app.config.from_object(config[config_name])
    
    # Store start time
    app.config['START_TIME'] = datetime.utcnow().isoformat()
    
    # Initialize extensions
    db.init_app(app)
    migrate.init_app(app, db)
    login_manager.init_app(app)
    server_session.init_app(app)
    cors.init_app(app)
    
    # Initialize mail with app
    mail.init_app(app)
    
    # Print email config for debugging
    print("=" * 60)
    print("📧 EMAIL CONFIGURATION")
    print("=" * 60)
    print(f"MAIL_SERVER: {app.config.get('MAIL_SERVER')}")
    print(f"MAIL_PORT: {app.config.get('MAIL_PORT')}")
    print(f"MAIL_USE_TLS: {app.config.get('MAIL_USE_TLS')}")
    print(f"MAIL_USERNAME: {app.config.get('MAIL_USERNAME')}")
    print(f"MAIL_DEFAULT_SENDER: {app.config.get('MAIL_DEFAULT_SENDER')}")
    print(f"MAIL_PASSWORD: {'***' if app.config.get('MAIL_PASSWORD') else 'NOT SET'}")
    print("=" * 60)
    
    # Initialize authentication
    init_auth(app)
    
    # Register routes
    register_routes(app)
    
    # Register error handlers
    register_error_handlers(app)
    
    return app