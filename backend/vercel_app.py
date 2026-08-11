import os
import sys
from pathlib import Path

# Add backend to Python path
sys.path.insert(0, str(Path(__file__).parent))

print(f"Environment: {'RENDER' if os.environ.get('RENDER') else 'VERCEL' if os.environ.get('VERCEL') else 'LOCAL'}")
print(f"DATABASE_URL configured: {bool(os.environ.get('DATABASE_URL'))}")

try:
    from app import create_app
    
    # Determine environment
    env = os.environ.get('FLASK_ENV', 'production')
    app = create_app(env)
    
    print(f"✅ App '{app.name}' created successfully in {env} mode")
    
except Exception as e:
    print(f"❌ Error creating app: {e}")
    import traceback
    traceback.print_exc()
    
    # Fallback app
    from flask import Flask, jsonify
    app = Flask(__name__)
    
    @app.route('/')
    @app.route('/api/health')
    def health():
        return jsonify({
            'status': 'ok',
            'service': 'Urban Chic Boutique API',
            'database_configured': bool(os.environ.get('DATABASE_URL'))
        })

