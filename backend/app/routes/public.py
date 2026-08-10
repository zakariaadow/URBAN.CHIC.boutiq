from flask import Blueprint, request, jsonify
from app.controllers.public_controller import PublicController

public_bp = Blueprint('public', __name__, url_prefix='/api/public')

# Home Page Routes
@public_bp.route('/', methods=['GET'])
def home():
    """Public home page data"""
    return PublicController.get_home_data()

@public_bp.route('/about', methods=['GET'])
def about():
    """About page data"""
    return PublicController.get_about_data()

@public_bp.route('/services', methods=['GET'])
def services():
    """List all services"""
    return PublicController.get_services(request.args)

@public_bp.route('/services/<int:service_id>', methods=['GET'])
def service_detail(service_id):
    """Get service details"""
    return PublicController.get_service_detail(service_id)

@public_bp.route('/gallery', methods=['GET'])
def gallery():
    """Get gallery images"""
    return PublicController.get_gallery(request.args)

@public_bp.route('/pricing', methods=['GET'])
def pricing():
    """Get pricing information"""
    return PublicController.get_pricing()

@public_bp.route('/team', methods=['GET'])
def team():
    """Get team members"""
    return PublicController.get_team(request.args)

@public_bp.route('/branches', methods=['GET'])
def branches():
    """Get all branches"""
    return PublicController.get_branches()

@public_bp.route('/branches/<int:branch_id>', methods=['GET'])
def branch_detail(branch_id):
    """Get branch details"""
    return PublicController.get_branch_detail(branch_id)

@public_bp.route('/contact', methods=['POST'])
def contact():
    """Submit contact form"""
    return PublicController.submit_contact(request.json)

@public_bp.route('/promotions', methods=['GET'])
def promotions():
    """Get active promotions"""
    return PublicController.get_promotions()

@public_bp.route('/promotions/<int:promotion_id>', methods=['GET'])
def promotion_detail(promotion_id):
    """Get promotion details"""
    return PublicController.get_promotion_detail(promotion_id)

@public_bp.route('/availability', methods=['GET'])
def check_availability():
    """Check appointment availability"""
    return PublicController.check_availability(request.args)

@public_bp.route('/testimonials', methods=['GET'])
def testimonials():
    """Get customer testimonials"""
    return PublicController.get_testimonials()

@public_bp.route('/faqs', methods=['GET'])
def faqs():
    """Get frequently asked questions"""
    return PublicController.get_faqs()

@public_bp.route('/newsletter', methods=['POST'])
def subscribe_newsletter():
    """Subscribe to newsletter"""
    return PublicController.subscribe_newsletter(request.json)