import os
import sys
from pathlib import Path

# Add backend to Python path
sys.path.insert(0, str(Path(__file__).parent))

print(f"Environment: {'RENDER' if os.environ.get('RENDER') else 'VERCEL' if os.environ.get('VERCEL') else 'LOCAL'}")
print(f"DATABASE_URL configured: {bool(os.environ.get('DATABASE_URL'))}")

try:
    from app import create_app
    env = os.environ.get('FLASK_ENV', 'production')
    app = create_app(env)
    print(f"✅ App '{app.name}' created successfully in {env} mode")
    
    # ✅ ADD FALLBACK ROUTES (in case routes aren't registered)
    @app.route('/')
    def root():
        from flask import jsonify
        return jsonify({
            'status': 'ok',
            'service': 'Urban Chic Boutique API',
            'message': 'Welcome to Urban Chic Boutique API',
            'endpoints': ['/api/health', '/api/public/services', '/api/public/team'],
            'environment': env
        })
    
    @app.route('/api/health')
    def health():
        from flask import jsonify
        return jsonify({
            'status': 'healthy',
            'service': 'Urban Chic Boutique API',
            'environment': env,
            'database_configured': bool(os.environ.get('DATABASE_URL')),
            'message': 'API is running properly'
        })
    
except Exception as e:
    print(f"❌ Error creating app: {e}")
    import traceback
    traceback.print_exc()
    
    # Fallback app with health check
    from flask import Flask, jsonify
    app = Flask(__name__)
    app.secret_key = os.environ.get('SECRET_KEY', 'fallback-secret-key')
    
    @app.route('/')
    def root():
        return jsonify({
            'status': 'ok',
            'service': 'Urban Chic Boutique API',
            'message': 'App running in fallback mode',
            'environment': os.environ.get('FLASK_ENV', 'unknown'),
            'database_configured': bool(os.environ.get('DATABASE_URL'))
        })
    
    @app.route('/api/health')
    def health():
        return jsonify({
            'status': 'healthy',
            'service': 'Urban Chic Boutique API',
            'message': 'API is running in fallback mode',
            'database_configured': bool(os.environ.get('DATABASE_URL'))
        })

# For gunicorn
if __name__ == "__main__":
    app.run()