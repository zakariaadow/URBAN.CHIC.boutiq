from flask import Blueprint, jsonify
from datetime import datetime

# Import all route blueprints
from .auth import auth_bp
from .public import public_bp
from .customer import customer_bp
from .receptionist import receptionist_bp
from .stylist import stylist_bp
from .finance import finance_bp
from .inventory import inventory_bp
from .manager import manager_bp
from .admin import admin_bp

# Import additional route modules
from .appointment import appointment_bp
from .payment import payment_bp
from .receipt import receipt_bp
from .service import service_bp
from .category import category_bp
from .product import product_bp
from .supplier import supplier_bp
from .stock import stock_bp
from .report import report_bp
from .review import review_bp
from .notification import notification_bp
from .promotion import promotion_bp
from .branch import branch_bp

def register_routes(app):
    """Register all route blueprints with the app"""
    
    # Register main blueprints
    app.register_blueprint(auth_bp)
    app.register_blueprint(public_bp)
    app.register_blueprint(customer_bp)
    app.register_blueprint(receptionist_bp)
    app.register_blueprint(stylist_bp)
    app.register_blueprint(finance_bp)
    app.register_blueprint(inventory_bp)
    app.register_blueprint(manager_bp)
    app.register_blueprint(admin_bp)
    
    # Register additional blueprints
    app.register_blueprint(appointment_bp)
    app.register_blueprint(payment_bp)
    app.register_blueprint(receipt_bp)
    app.register_blueprint(service_bp)
    app.register_blueprint(category_bp)
    app.register_blueprint(product_bp)
    app.register_blueprint(supplier_bp)
    app.register_blueprint(stock_bp)
    app.register_blueprint(report_bp)
    app.register_blueprint(review_bp)
    app.register_blueprint(notification_bp)
    app.register_blueprint(promotion_bp)
    app.register_blueprint(branch_bp)
    
    # Add root route
    @app.route('/')
    def index():
        return jsonify({
            'status': 'success',
            'message': 'Welcome to Urban Chic Boutique API',
            'version': '1.0.0',
            'timestamp': datetime.utcnow().isoformat(),
            'endpoints': {
                'auth': '/api/auth',
                'public': '/api/public',
                'customer': '/api/customer',
                'receptionist': '/api/receptionist',
                'stylist': '/api/stylist',
                'finance': '/api/finance',
                'inventory': '/api/inventory',
                'manager': '/api/manager',
                'admin': '/api/admin',
                'appointments': '/api/appointments',
                'payments': '/api/payments',
                'receipts': '/api/receipts',
                'services': '/api/services',
                'categories': '/api/categories',
                'products': '/api/products',
                'suppliers': '/api/suppliers',
                'stock': '/api/stock',
                'reports': '/api/reports',
                'reviews': '/api/reviews',
                'notifications': '/api/notifications',
                'promotions': '/api/promotions',
                'branches': '/api/branches'
            }
        })
    
    @app.route('/health')
    def health_check():
        return jsonify({
            'status': 'healthy',
            'timestamp': app.config.get('START_TIME', datetime.utcnow().isoformat()),
            'app_name': app.config.get('APP_NAME', 'Urban Chic Boutique'),
            'environment': app.config.get('ENV', 'development')
        })
    
    @app.route('/api/version')
    def api_version():
        return jsonify({
            'version': '1.0.0',
            'api_version': 'v1',
            'release_date': '2024-01-01',
            'app_name': app.config.get('APP_NAME', 'Urban Chic Boutique')
        })