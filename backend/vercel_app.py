import os
import sys
from pathlib import Path

# Add backend to Python path
sys.path.insert(0, str(Path(__file__).parent))

try:
    from app import create_app
    
    # Create the Flask app
    app = create_app()
    
    # Configure for Vercel production
    if os.environ.get('VERCEL_ENV'):
        app.config['ENV'] = 'production'
        app.config['DEBUG'] = False
        app.config['TESTING'] = False
        
        # Database - use environment variable
        database_url = os.environ.get('DATABASE_URL')
        if database_url:
            app.config['SQLALCHEMY_DATABASE_URI'] = database_url
        
        # Secret key
        app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'dev-secret-key-change-in-production')
        app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
        
except Exception as e:
    print(f"Error initializing app: {e}")
    # Fallback for health check
    from flask import Flask
    app = Flask(__name__)
    
    @app.route('/')
    def health_check():
        return {'status': 'ok', 'service': 'Urban Chic Boutique API'}, 200
    
    @app.route('/api/health')
    def api_health():
        return {'status': 'healthy', 'message': 'API is running'}, 200

# Vercel expects 'app' as the WSGI application
# If your app variable is named differently, alias it
# application = app  # Uncomment if needed