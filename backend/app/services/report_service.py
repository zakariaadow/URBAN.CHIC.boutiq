from datetime import datetime, timedelta
from flask import current_app
from app.extensions import db
from app.models.appointment import Appointment
from app.models.payment import Payment
from app.models.product import Product
from app.models.customer import Customer
from app.models.stylist import Stylist
from app.models.report import Report
from app.services.pdf_service import PDFService

class ReportService:
    
    @staticmethod
    def generate_sales_report(start_date, end_date, branch_id=None):
        """Generate sales report"""
        try:
            query = Payment.query.filter(
                Payment.payment_date >= start_date,
                Payment.payment_date <= end_date,
                Payment.payment_status == 'paid'
            )
            
            if branch_id:
                query = query.join(Appointment).filter(Appointment.branch_id == branch_id)
            
            payments = query.all()
            
            total_sales = sum(p.amount for p in payments)
            total_count = len(payments)
            
            # Group by day
            daily_sales = {}
            for payment in payments:
                day = payment.payment_date.strftime('%Y-%m-%d')
                if day not in daily_sales:
                    daily_sales[day] = 0
                daily_sales[day] += payment.amount
            
            # Group by payment method
            method_breakdown = {}
            for payment in payments:
                method = payment.payment_method
                if method not in method_breakdown:
                    method_breakdown[method] = 0
                method_breakdown[method] += payment.amount
            
            report_data = {
                'period': {
                    'start_date': start_date.isoformat(),
                    'end_date': end_date.isoformat()
                },
                'summary': {
                    'total_sales': total_sales,
                    'total_transactions': total_count,
                    'average_transaction': total_sales / total_count if total_count > 0 else 0
                },
                'daily_breakdown': daily_sales,
                'method_breakdown': method_breakdown
            }
            
            return report_data, 200
            
        except Exception as e:
            return {'error': str(e)}, 500
    
    @staticmethod
    def generate_appointment_report(start_date, end_date, branch_id=None):
        """Generate appointment report"""
        try:
            query = Appointment.query.filter(
                Appointment.appointment_date >= start_date,
                Appointment.appointment_date <= end_date
            )
            
            if branch_id:
                query = query.filter(Appointment.branch_id == branch_id)
            
            appointments = query.all()
            
            total_appointments = len(appointments)
            
            # Status breakdown
            status_breakdown = {}
            for appointment in appointments:
                status = appointment.status
                if status not in status_breakdown:
                    status_breakdown[status] = 0
                status_breakdown[status] += 1
            
            # Stylist performance
            stylist_performance = {}
            for appointment in appointments:
                if appointment.stylist_id:
                    stylist_id = appointment.stylist_id
                    if stylist_id not in stylist_performance:
                        stylist_performance[stylist_id] = {
                            'total': 0,
                            'completed': 0,
                            'revenue': 0
                        }
                    stylist_performance[stylist_id]['total'] += 1
                    if appointment.status == 'completed':
                        stylist_performance[stylist_id]['completed'] += 1
                        stylist_performance[stylist_id]['revenue'] += appointment.final_amount
            
            report_data = {
                'period': {
                    'start_date': start_date.isoformat(),
                    'end_date': end_date.isoformat()
                },
                'summary': {
                    'total_appointments': total_appointments,
                    'completion_rate': (sum(1 for a in appointments if a.status == 'completed') / total_appointments * 100) if total_appointments > 0 else 0
                },
                'status_breakdown': status_breakdown,
                'stylist_performance': stylist_performance
            }
            
            return report_data, 200
            
        except Exception as e:
            return {'error': str(e)}, 500
    
    @staticmethod
    def generate_inventory_report():
        """Generate inventory report"""
        try:
            products = Product.query.filter(Product.is_active == True).all()
            
            total_items = len(products)
            total_value = sum(p.quantity * p.purchase_price for p in products)
            
            # Low stock items
            low_stock = [p for p in products if p.quantity <= p.min_quantity]
            
            # Category breakdown
            category_breakdown = {}
            for product in products:
                category_name = product.category.name if product.category else 'Uncategorized'
                if category_name not in category_breakdown:
                    category_breakdown[category_name] = {
                        'count': 0,
                        'value': 0
                    }
                category_breakdown[category_name]['count'] += 1
                category_breakdown[category_name]['value'] += product.quantity * product.purchase_price
            
            report_data = {
                'summary': {
                    'total_items': total_items,
                    'total_value': total_value,
                    'low_stock_items': len(low_stock),
                    'average_item_value': total_value / total_items if total_items > 0 else 0
                },
                'low_stock': [p.to_dict() for p in low_stock],
                'category_breakdown': category_breakdown
            }
            
            return report_data, 200
            
        except Exception as e:
            return {'error': str(e)}, 500
    
    @staticmethod
    def generate_staff_performance_report(start_date, end_date):
        """Generate staff performance report"""
        try:
            # Get all stylists
            stylists = Stylist.query.filter_by(is_active=True).all()
            
            staff_performance = []
            for stylist in stylists:
                # Get appointments for this stylist
                appointments = Appointment.query.filter(
                    Appointment.stylist_id == stylist.id,
                    Appointment.appointment_date >= start_date,
                    Appointment.appointment_date <= end_date
                ).all()
                
                total_appointments = len(appointments)
                completed = sum(1 for a in appointments if a.status == 'completed')
                revenue = sum(a.final_amount for a in appointments if a.status == 'completed')
                
                # Get average rating
                from app.models.review import Review
                reviews = Review.query.filter_by(stylist_id=stylist.id).all()
                avg_rating = sum(r.rating for r in reviews) / len(reviews) if reviews else 0
                
                staff_performance.append({
                    'stylist_id': stylist.id,
                    'name': stylist.user.full_name if stylist.user else 'Unknown',
                    'total_appointments': total_appointments,
                    'completed': completed,
                    'completion_rate': (completed / total_appointments * 100) if total_appointments > 0 else 0,
                    'revenue': revenue,
                    'average_rating': avg_rating
                })
            
            return staff_performance, 200
            
        except Exception as e:
            return {'error': str(e)}, 500
    
    @staticmethod
    def generate_customer_report(start_date, end_date):
        """Generate customer report"""
        try:
            customers = Customer.query.all()
            
            total_customers = len(customers)
            active_customers = sum(1 for c in customers if c.total_visits > 0)
            
            # New customers in period
            new_customers = Customer.query.filter(
                Customer.created_at >= start_date,
                Customer.created_at <= end_date
            ).count()
            
            # Loyalty breakdown
            loyal_customers = sum(1 for c in customers if c.total_visits >= 5)
            
            # Spending breakdown
            spending_by_tier = {
                'high': 0,  # > 10000
                'medium': 0,  # 5000-10000
                'low': 0  # < 5000
            }
            
            for customer in customers:
                if customer.total_spent > 10000:
                    spending_by_tier['high'] += 1
                elif customer.total_spent > 5000:
                    spending_by_tier['medium'] += 1
                else:
                    spending_by_tier['low'] += 1
            
            report_data = {
                'summary': {
                    'total_customers': total_customers,
                    'active_customers': active_customers,
                    'new_customers': new_customers,
                    'loyal_customers': loyal_customers
                },
                'spending_tiers': spending_by_tier
            }
            
            return report_data, 200
            
        except Exception as e:
            return {'error': str(e)}, 500
    
    @staticmethod
    def export_report(report_data, format='pdf'):
        """Export report to file"""
        try:
            filename = f"report_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}.{format}"
            
            if format == 'pdf':
                filepath = PDFService.generate_report_pdf(
                    report_data,
                    filename,
                    title="Report"
                )
            else:
                # For other formats (CSV, Excel) - implement as needed
                filepath = None
            
            return filepath, 200
            
        except Exception as e:
            return {'error': str(e)}, 500
    
    @staticmethod
    def save_report(report_data, name, type, generated_by, **kwargs):
        """Save report to database"""
        try:
            report = Report(
                branch_id=kwargs.get('branch_id'),
                generated_by=generated_by,
                report_type=type,
                report_name=name,
                start_date=kwargs.get('start_date'),
                end_date=kwargs.get('end_date'),
                parameters=kwargs.get('parameters', {}),
                data=report_data,
                summary=kwargs.get('summary', {})
            )
            
            db.session.add(report)
            db.session.commit()
            
            return report, 200
            
        except Exception as e:
            db.session.rollback()
            return {'error': str(e)}, 500
    @staticmethod
    def generate_sales_report(start_date, end_date, branch_id=None):
        """Generate sales report"""
        from app.models.payment import Payment
        from app.models.appointment import Appointment
        
        try:
            query = Payment.query.filter(
                Payment.payment_status == 'paid',
                Payment.payment_date >= start_date,
                Payment.payment_date <= end_date
            )
            
            if branch_id:
                query = query.join(Appointment).filter(Appointment.branch_id == branch_id)
            
            payments = query.all()
            
            total_sales = sum(p.amount for p in payments)
            total_count = len(payments)
            
            return {
                'total_sales': total_sales,
                'total_transactions': total_count,
                'average_transaction': total_sales / total_count if total_count > 0 else 0,
                'data': [p.to_dict() for p in payments[:100]]
            }, 200
            
        except Exception as e:
            return {'error': str(e)}, 500

    @staticmethod
    def generate_appointment_report(start_date, end_date, branch_id=None):
        """Generate appointment report"""
        from app.models.appointment import Appointment
        
        try:
            query = Appointment.query.filter(
                Appointment.appointment_date >= start_date,
                Appointment.appointment_date <= end_date
            )
            
            if branch_id:
                query = query.filter(Appointment.branch_id == branch_id)
            
            appointments = query.all()
            
            total = len(appointments)
            completed = sum(1 for a in appointments if a.status == 'completed')
            cancelled = sum(1 for a in appointments if a.status == 'cancelled')
            pending = sum(1 for a in appointments if a.status == 'pending')
            
            return {
                'total_appointments': total,
                'completed': completed,
                'cancelled': cancelled,
                'pending': pending,
                'completion_rate': (completed / total * 100) if total > 0 else 0,
                'data': [a.to_dict() for a in appointments[:100]]
            }, 200
            
        except Exception as e:
            return {'error': str(e)}, 500

    @staticmethod
    def generate_inventory_report():
        """Generate inventory report"""
        from app.models.product import Product
        
        try:
            products = Product.query.filter_by(is_active=True).all()
            
            total_items = len(products)
            total_value = sum(p.quantity * p.purchase_price for p in products)
            
            low_stock = [p for p in products if p.quantity <= p.min_quantity]
            
            return {
                'total_items': total_items,
                'total_value': total_value,
                'low_stock_items': len(low_stock),
                'data': [p.to_dict() for p in products[:100]]
            }, 200
            
        except Exception as e:
            return {'error': str(e)}, 500

    @staticmethod
    def generate_staff_performance_report(start_date, end_date):
        """Generate staff performance report"""
        from app.models.stylist import Stylist
        from app.models.appointment import Appointment
        from app.models.user import User
        
        try:
            stylists = Stylist.query.filter_by(is_active=True).all()
            
            results = []
            for stylist in stylists:
                user = User.query.get(stylist.user_id)
                appointments = Appointment.query.filter(
                    Appointment.stylist_id == stylist.id,
                    Appointment.appointment_date >= start_date,
                    Appointment.appointment_date <= end_date,
                    Appointment.status == 'completed'
                ).all()
                
                completed = len(appointments)
                revenue = sum(a.final_amount for a in appointments)
                
                results.append({
                    'stylist_id': stylist.id,
                    'name': user.full_name if user else 'Unknown',
                    'completed_appointments': completed,
                    'revenue': revenue,
                    'commission': revenue * (stylist.commission_rate or 0.10)
                })
            
            return results, 200
            
        except Exception as e:
            return {'error': str(e)}, 500

    @staticmethod
    def generate_customer_report(start_date, end_date):
        """Generate customer report"""
        from app.models.customer import Customer
        from app.models.appointment import Appointment
        
        try:
            customers = Customer.query.all()
            
            total_customers = len(customers)
            active_customers = sum(1 for c in customers if c.total_visits > 0)
            
            # New customers in period
            new_customers = Customer.query.filter(
                Customer.created_at >= start_date,
                Customer.created_at <= end_date
            ).count()
            
            return {
                'total_customers': total_customers,
                'active_customers': active_customers,
                'new_customers': new_customers,
                'data': [c.to_dict() for c in customers[:100]]
            }, 200
            
        except Exception as e:
            return {'error': str(e)}, 500
