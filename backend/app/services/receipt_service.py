from app.extensions import db
from app.models.receipt import Receipt
from app.models.payment import Payment
from app.models.appointment import Appointment
from app.models.customer import Customer
from app.models.user import User
from app.models.branch import Branch
from app.models.service import Service
from app.models.appointment_service import AppointmentService as AppointmentServiceModel
from app.models.loyalty import Loyalty
from datetime import datetime
import logging
import json
import os
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter, A4
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, Image, PageBreak
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib.enums import TA_CENTER, TA_RIGHT, TA_LEFT, TA_JUSTIFY
from reportlab.lib import utils
import io

logger = logging.getLogger(__name__)

class ReceiptService:
    
    # ==================== LOGO ====================
    @staticmethod
    def get_logo_path(receipt=None):
        """Get the logo image path from receipt or file system"""
        # First try to get logo from receipt
        if receipt:
            if hasattr(receipt, 'logo_path') and receipt.logo_path and os.path.exists(receipt.logo_path):
                return receipt.logo_path
            if hasattr(receipt, 'company_logo') and receipt.company_logo and os.path.exists(receipt.company_logo):
                return receipt.company_logo
        
        # Then try file system
        current_dir = os.path.dirname(os.path.abspath(__file__))
        app_dir = os.path.dirname(current_dir)
        backend_dir = os.path.dirname(app_dir)
        
        possible_paths = [
            os.path.join(app_dir, 'static', 'images', 'logo.png'),
            os.path.join(app_dir, 'static', 'logo.png'),
            os.path.join(backend_dir, 'frontend', 'public', 'logo.png'),
            os.path.join(backend_dir, 'logo.png'),
            '/home/zakaria/development/code/phase-4/URBAN.CHIC.boutiq/backend/static/images/logo.png',
            os.path.join(os.getcwd(), 'static', 'images', 'logo.png'),
        ]
        
        for path in possible_paths:
            if os.path.exists(path):
                logger.info(f"Found logo at: {path}")
                return path
        
        logger.warning("No logo image found, using text-only header")
        return None
    
    # ==================== CREATE RECEIPT ====================
    @staticmethod
    def create_receipt(payment_id):
        """Create a receipt for a payment with multiple services"""
        try:
            payment = Payment.query.get(payment_id)
            if not payment:
                return {'error': 'Payment not found'}, 404
            
            existing_receipt = Receipt.query.filter_by(payment_id=payment_id).first()
            if existing_receipt:
                return {'receipt': existing_receipt.to_dict()}, 200
            
            appointment = Appointment.query.get(payment.appointment_id)
            if not appointment:
                return {'error': 'Appointment not found'}, 404
            
            customer = Customer.query.get(payment.customer_id)
            if not customer:
                return {'error': 'Customer not found'}, 404
            
            user = User.query.get(customer.user_id)
            if not user:
                return {'error': 'User not found'}, 404
            
            services = []
            total_amount = 0
            
            appt_services = AppointmentServiceModel.query.filter_by(
                appointment_id=appointment.id
            ).all()
            
            if appt_services:
                for appt_service in appt_services:
                    service = Service.query.get(appt_service.service_id)
                    if service:
                        services.append({
                            'id': service.id,
                            'name': service.name,
                            'price': float(appt_service.price or service.price or 0),
                            'duration': appt_service.duration or service.duration_minutes or 30
                        })
                        total_amount += float(appt_service.price or service.price or 0)
            else:
                service = Service.query.get(appointment.service_id)
                if service:
                    services.append({
                        'id': service.id,
                        'name': service.name,
                        'price': float(appointment.final_amount or service.price or 0),
                        'duration': service.duration_minutes or 30
                    })
                    total_amount = float(appointment.final_amount or service.price or 0)
            
            if total_amount == 0:
                total_amount = float(payment.amount or 0)
            
            receipt_number = f"RCP-{datetime.utcnow().strftime('%Y%m%d%H%M%S')}-{payment.id}"
            branch = Branch.query.get(appointment.branch_id)
            
            # Calculate tax
            tax_rate = 0.16
            subtotal = total_amount
            tax = subtotal * tax_rate
            discount = 0
            grand_total = subtotal + tax - discount
            
            # Get loyalty points
            loyalty = Loyalty.query.filter_by(customer_id=customer.id).first()
            current_points = loyalty.points if loyalty else 0
            points_earned = int(grand_total / 100)
            
            # Get stylist and receptionist names
            stylist_name = 'N/A'
            if appointment.stylist and appointment.stylist.user:
                stylist_name = f"{appointment.stylist.user.first_name or ''} {appointment.stylist.user.last_name or ''}".strip()
            
            receptionist_name = 'N/A'
            if appointment.receptionist and appointment.receptionist.user:
                receptionist_name = f"{appointment.receptionist.user.first_name or ''} {appointment.receptionist.user.last_name or ''}".strip()
            
            # Get logo path
            logo_path = ReceiptService.get_logo_path()
            
            receipt = Receipt(
                appointment_id=appointment.id,
                payment_id=payment.id,
                customer_id=customer.id,
                receipt_number=receipt_number,
                receipt_date=datetime.utcnow(),
                subtotal=subtotal,
                tax=tax,
                discount=discount,
                total=grand_total,
                payment_method=payment.payment_method or 'pending',
                transaction_id=payment.transaction_id or payment.reference_number,
                transaction_code=payment.transaction_id or payment.reference_number,
                items=services,
                customer_details={
                    'name': f"{user.first_name or ''} {user.last_name or ''}",
                    'email': user.email,
                    'phone': user.phone
                },
                business_details={
                    'name': branch.name if branch else 'Urban Chic Boutique',
                    'address': branch.address if branch else '',
                    'phone': branch.phone if branch else '',
                    'email': branch.email if branch else ''
                },
                customer_name=f"{user.first_name or ''} {user.last_name or ''}".strip(),
                customer_phone=user.phone,
                customer_email=user.email,
                branch_name=branch.name if branch else 'Urban Chic Boutique',
                branch_address=branch.address if branch else '',
                branch_phone=branch.phone if branch else '',
                branch_email=branch.email if branch else '',
                branch_website=getattr(branch, 'website', '') if branch else '',
                stylist_name=stylist_name,
                receptionist_name=receptionist_name,
                amount_paid=grand_total,
                tax_rate=tax_rate,
                points_earned=points_earned,
                points_balance=current_points + points_earned,
                status='generated',
                invoice_number=f"INV-{datetime.utcnow().strftime('%Y%m%d')}-{payment.id}",
                logo_path=logo_path,
                logo_url=logo_path,
                image_style='professional',
                image_position='top-left'
            )
            
            db.session.add(receipt)
            db.session.commit()
            
            payment.receipt_number = receipt_number
            db.session.commit()
            
            return {'receipt': receipt.to_dict()}, 201
            
        except Exception as e:
            db.session.rollback()
            logger.error(f"Error creating receipt: {str(e)}")
            import traceback
            traceback.print_exc()
            return {'error': str(e)}, 500
    
    # ==================== GENERATE PDF ====================
    @staticmethod
    def generate_receipt_pdf(receipt_id):
        """Generate professional receipt PDF with logo"""
        try:
            receipt = Receipt.query.get(receipt_id)
            if not receipt:
                logger.error(f"Receipt {receipt_id} not found")
                return None
            
            payment = Payment.query.get(receipt.payment_id)
            if not payment:
                logger.error(f"Payment {receipt.payment_id} not found")
                return None
            
            appointment = Appointment.query.get(receipt.appointment_id)
            if not appointment:
                logger.error(f"Appointment {receipt.appointment_id} not found")
                return None
            
            customer = Customer.query.get(receipt.customer_id)
            if not customer:
                logger.error(f"Customer {receipt.customer_id} not found")
                return None
            
            user = User.query.get(customer.user_id)
            if not user:
                logger.error(f"User {customer.user_id} not found")
                return None
            
            branch = Branch.query.get(appointment.branch_id)
            
            items = receipt.items or []
            if not items:
                appt_services = AppointmentServiceModel.query.filter_by(
                    appointment_id=appointment.id
                ).all()
                
                for appt_service in appt_services:
                    service = Service.query.get(appt_service.service_id)
                    if service:
                        items.append({
                            'id': service.id,
                            'name': service.name,
                            'price': float(appt_service.price or service.price or 0),
                            'duration': appt_service.duration or service.duration_minutes or 30,
                            'quantity': 1
                        })
                
                if not items:
                    service = Service.query.get(appointment.service_id)
                    if service:
                        items.append({
                            'id': service.id,
                            'name': service.name,
                            'price': float(appointment.final_amount or service.price or 0),
                            'duration': service.duration_minutes or 30,
                            'quantity': 1
                        })
                
                receipt.items = items
                db.session.commit()
            
            # Create PDF buffer
            buffer = io.BytesIO()
            doc = SimpleDocTemplate(buffer, pagesize=A4, 
                                   rightMargin=56, leftMargin=56, 
                                   topMargin=56, bottomMargin=56)
            
            # Styles
            styles = getSampleStyleSheet()
            
            # Custom styles
            title_style = ParagraphStyle(
                'CustomTitle',
                parent=styles['Heading1'],
                fontSize=22,
                textColor=colors.HexColor('#1a1a2e'),
                alignment=TA_CENTER,
                spaceAfter=2,
                fontName='Helvetica-Bold'
            )
            
            subtitle_style = ParagraphStyle(
                'Subtitle',
                parent=styles['Normal'],
                fontSize=11,
                textColor=colors.HexColor('#666666'),
                alignment=TA_CENTER,
                spaceAfter=14
            )
            
            section_header_style = ParagraphStyle(
                'SectionHeader',
                parent=styles['Heading2'],
                fontSize=12,
                textColor=colors.HexColor('#1a1a2e'),
                spaceAfter=6,
                spaceBefore=10,
                fontName='Helvetica-Bold'
            )
            
            normal_style = ParagraphStyle(
                'Normal',
                parent=styles['Normal'],
                fontSize=9,
                textColor=colors.HexColor('#333333'),
                leading=14
            )
            
            bold_style = ParagraphStyle(
                'Bold',
                parent=styles['Normal'],
                fontSize=9,
                textColor=colors.HexColor('#1a1a2e'),
                fontName='Helvetica-Bold',
                leading=14
            )
            
            right_style = ParagraphStyle(
                'Right',
                parent=styles['Normal'],
                fontSize=9,
                alignment=TA_RIGHT,
                textColor=colors.HexColor('#333333')
            )
            
            # Build content
            story = []
            
            # ===== HEADER WITH LOGO =====
            logo_path = receipt.logo_path or ReceiptService.get_logo_path()
            
            if logo_path and os.path.exists(logo_path):
                try:
                    logo = Image(logo_path, width=1.0*inch, height=1.0*inch)
                    logo.hAlign = 'CENTER'
                    
                    header_data = [
                        [logo, Paragraph("OFFICIAL RECEIPT", title_style)],
                        ['', Paragraph(receipt.branch_name or "Urban Chic Boutique", subtitle_style)]
                    ]
                    
                    header_table = Table(header_data, colWidths=[1.2*inch, 4.8*inch])
                    header_table.setStyle(TableStyle([
                        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
                        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
                        ('LEFTPADDING', (0, 0), (0, -1), 0),
                        ('RIGHTPADDING', (1, 0), (-1, -1), 0),
                    ]))
                    story.append(header_table)
                except Exception as e:
                    logger.error(f"Error adding logo: {e}")
                    story.append(Paragraph("OFFICIAL RECEIPT", title_style))
                    story.append(Paragraph(receipt.branch_name or "Urban Chic Boutique", subtitle_style))
            else:
                story.append(Paragraph("OFFICIAL RECEIPT", title_style))
                story.append(Paragraph(receipt.branch_name or "Urban Chic Boutique", subtitle_style))
            
            # Business info
            branch_info = ""
            if receipt.branch_name:
                branch_info += f"{receipt.branch_name}"
            if receipt.branch_address:
                branch_info += f"<br/>{receipt.branch_address}"
            if receipt.branch_phone:
                branch_info += f"<br/>📞 {receipt.branch_phone}"
            if receipt.branch_email:
                branch_info += f"<br/>✉ {receipt.branch_email}"
            if receipt.branch_website:
                branch_info += f"<br/>🌐 {receipt.branch_website}"
            
            if branch_info:
                story.append(Paragraph(branch_info, subtitle_style))
            
            story.append(Spacer(1, 0.15*inch))
            
            # Divider line
            story.append(Table([['']], colWidths=[6*inch], 
                              style=[('LINEABOVE', (0, 0), (-1, -1), 1, colors.HexColor('#1a1a2e'))]))
            story.append(Spacer(1, 0.15*inch))
            
            # ===== RECEIPT INFO =====
            receipt_left = [
                [Paragraph("Receipt No.", bold_style), Paragraph(f": {receipt.receipt_number or 'N/A'}", normal_style)],
                [Paragraph("Invoice No.", bold_style), Paragraph(f": {receipt.invoice_number or 'N/A'}", normal_style)],
                [Paragraph("Date", bold_style), Paragraph(f": {receipt.receipt_date.strftime('%d %B %Y') if receipt.receipt_date else datetime.now().strftime('%d %B %Y')}", normal_style)],
                [Paragraph("Time", bold_style), Paragraph(f": {receipt.receipt_date.strftime('%I:%M %p') if receipt.receipt_date else datetime.now().strftime('%I:%M %p')}", normal_style)],
            ]
            
            receipt_right = [
                [Paragraph("Appointment ID", bold_style), Paragraph(f": APT-{appointment.id:06d}", normal_style)],
                [Paragraph("Branch", bold_style), Paragraph(f": {receipt.branch_name or 'N/A'}", normal_style)],
                [Paragraph("Payment Method", bold_style), Paragraph(f": {receipt.payment_method or 'N/A'}", normal_style)],
                [Paragraph("Payment Status", bold_style), Paragraph(f": {payment.payment_status.upper() if payment.payment_status else 'PENDING'}", normal_style)],
            ]
            
            receipt_left_table = Table(receipt_left, colWidths=[1.2*inch, 2.0*inch])
            receipt_left_table.setStyle(TableStyle([
                ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
                ('PADDING', (0, 0), (-1, -1), 2),
            ]))
            
            receipt_right_table = Table(receipt_right, colWidths=[1.2*inch, 2.0*inch])
            receipt_right_table.setStyle(TableStyle([
                ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
                ('PADDING', (0, 0), (-1, -1), 2),
            ]))
            
            receipt_info_table = Table([[receipt_left_table, receipt_right_table]], colWidths=[3.2*inch, 3.2*inch])
            receipt_info_table.setStyle(TableStyle([
                ('VALIGN', (0, 0), (-1, -1), 'TOP'),
                ('PADDING', (0, 0), (-1, -1), 4),
            ]))
            story.append(receipt_info_table)
            story.append(Spacer(1, 0.15*inch))
            
            # Divider line
            story.append(Table([['']], colWidths=[6*inch], 
                              style=[('LINEABOVE', (0, 0), (-1, -1), 0.5, colors.HexColor('#cccccc'))]))
            story.append(Spacer(1, 0.15*inch))
            
            # ===== CUSTOMER INFORMATION =====
            story.append(Paragraph("CUSTOMER INFORMATION", section_header_style))
            
            customer_data = [
                [Paragraph("Customer Name", bold_style), Paragraph(f": {receipt.customer_name or 'N/A'}", normal_style)],
                [Paragraph("Phone", bold_style), Paragraph(f": {receipt.customer_phone or 'N/A'}", normal_style)],
                [Paragraph("Email", bold_style), Paragraph(f": {receipt.customer_email or 'N/A'}", normal_style)],
            ]
            
            if customer and customer.address:
                customer_data.append([Paragraph("Address", bold_style), Paragraph(f": {customer.address or 'N/A'}", normal_style)])
            
            customer_table = Table(customer_data, colWidths=[1.5*inch, 4.5*inch])
            customer_table.setStyle(TableStyle([
                ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
                ('PADDING', (0, 0), (-1, -1), 3),
            ]))
            story.append(customer_table)
            story.append(Spacer(1, 0.1*inch))
            
            # ===== APPOINTMENT INFORMATION =====
            story.append(Paragraph("APPOINTMENT INFORMATION", section_header_style))
            
            appointment_data = [
                [Paragraph("Appointment ID", bold_style), Paragraph(f": APT-{appointment.id:06d}", normal_style)],
                [Paragraph("Branch", bold_style), Paragraph(f": {receipt.branch_name or 'N/A'}", normal_style)],
                [Paragraph("Receptionist", bold_style), Paragraph(f": {receipt.receptionist_name or 'N/A'}", normal_style)],
                [Paragraph("Stylist", bold_style), Paragraph(f": {receipt.stylist_name or 'N/A'}", normal_style)],
                [Paragraph("Appointment Time", bold_style), Paragraph(f": {appointment.appointment_date.strftime('%d %B %Y') if appointment.appointment_date else 'N/A'} at {appointment.appointment_time.strftime('%I:%M %p') if appointment.appointment_time else 'N/A'}", normal_style)],
            ]
            
            appointment_table = Table(appointment_data, colWidths=[1.5*inch, 4.5*inch])
            appointment_table.setStyle(TableStyle([
                ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
                ('PADDING', (0, 0), (-1, -1), 3),
            ]))
            story.append(appointment_table)
            story.append(Spacer(1, 0.15*inch))
            
            # ===== SERVICES =====
            story.append(Paragraph("SERVICES", section_header_style))
            
            # Build items table
            item_table_data = [
                ['#', 'SERVICE', 'QTY', 'UNIT PRICE', 'TOTAL']
            ]
            
            subtotal = 0
            for idx, item in enumerate(items, 1):
                item_name = item.get('name') if isinstance(item, dict) else str(item)
                if not item_name:
                    item_name = 'Service'
                
                item_price = float(item.get('price') if isinstance(item, dict) and item.get('price') is not None else 0)
                quantity = int(item.get('quantity') if isinstance(item, dict) and item.get('quantity') is not None else 1)
                total_item = item_price * quantity
                subtotal += total_item
                
                item_table_data.append([
                    str(idx),
                    Paragraph(item_name, normal_style),
                    str(quantity),
                    f"KES {item_price:,.2f}",
                    f"KES {total_item:,.2f}"
                ])
            
            # Add totals
            tax = receipt.tax or (subtotal * 0.16)
            discount = receipt.discount or 0
            grand_total = receipt.total or (subtotal + tax - discount)
            
            item_table_data.append(['', '', '', Paragraph("Subtotal", bold_style), f"KES {subtotal:,.2f}"])
            if discount > 0:
                item_table_data.append(['', '', '', Paragraph(f"Discount", bold_style), f"-KES {discount:,.2f}"])
            item_table_data.append(['', '', '', Paragraph("Tax (16% VAT)", bold_style), f"KES {tax:,.2f}"])
            item_table_data.append(['', '', '', Paragraph("TOTAL AMOUNT PAID", bold_style), f"KES {grand_total:,.2f}"])
            
            item_table = Table(item_table_data, colWidths=[0.4*inch, 2.2*inch, 0.6*inch, 1.4*inch, 1.4*inch])
            item_table.setStyle(TableStyle([
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('FONTSIZE', (0, 0), (-1, 0), 10),
                ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1a1a2e')),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
                ('FONTNAME', (0, -4), (-1, -1), 'Helvetica-Bold'),
                ('FONTSIZE', (0, -4), (-1, -1), 10),
                ('BACKGROUND', (0, -1), (-1, -1), colors.HexColor('#f5f5f5')),
                ('BACKGROUND', (0, -2), (-1, -2), colors.HexColor('#fafafa')),
                ('GRID', (0, 0), (-1, -4), 0.5, colors.HexColor('#cccccc')),
                ('LINEABOVE', (0, -4), (-1, -4), 1, colors.HexColor('#1a1a2e')),
                ('LINEABOVE', (0, -1), (-1, -1), 2, colors.HexColor('#1a1a2e')),
                ('ALIGN', (2, 0), (-1, -1), 'RIGHT'),
                ('ALIGN', (0, 0), (0, -1), 'CENTER'),
                ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
                ('PADDING', (0, 0), (-1, -1), 6),
                ('FONTNAME', (3, -4), (3, -1), 'Helvetica-Bold'),
                ('FONTNAME', (4, -4), (4, -1), 'Helvetica-Bold'),
            ]))
            story.append(item_table)
            story.append(Spacer(1, 0.15*inch))
            
            # ===== PAYMENT INFORMATION =====
            story.append(Paragraph("PAYMENT INFORMATION", section_header_style))
            
            payment_data = [
                [Paragraph("Payment ID", bold_style), Paragraph(f": {payment.reference_number or 'N/A'}", normal_style)],
                [Paragraph("Payment Method", bold_style), Paragraph(f": {receipt.payment_method or 'N/A'}", normal_style)],
                [Paragraph("Transaction Code", bold_style), Paragraph(f": {receipt.transaction_code or 'N/A'}", normal_style)],
                [Paragraph("Payment Status", bold_style), Paragraph(f": {payment.payment_status.upper() if payment.payment_status else 'PENDING'}", normal_style)],
                [Paragraph("Amount Paid", bold_style), Paragraph(f": KES {grand_total:,.2f}", normal_style)],
            ]
            
            payment_table = Table(payment_data, colWidths=[1.5*inch, 4.5*inch])
            payment_table.setStyle(TableStyle([
                ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
                ('PADDING', (0, 0), (-1, -1), 3),
            ]))
            story.append(payment_table)
            story.append(Spacer(1, 0.15*inch))
            
            # ===== LOYALTY POINTS =====
            story.append(Paragraph("LOYALTY POINTS", section_header_style))
            
            loyalty_data = [
                [Paragraph("Points Earned", bold_style), Paragraph(f": {receipt.points_earned or 0} Points", normal_style)],
                [Paragraph("Current Balance", bold_style), Paragraph(f": {receipt.points_balance or 0} Points", normal_style)],
            ]
            
            loyalty_table = Table(loyalty_data, colWidths=[1.5*inch, 4.5*inch])
            loyalty_table.setStyle(TableStyle([
                ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
                ('PADDING', (0, 0), (-1, -1), 3),
            ]))
            story.append(loyalty_table)
            story.append(Spacer(1, 0.15*inch))
            
            # Divider line
            story.append(Table([['']], colWidths=[6*inch], 
                              style=[('LINEABOVE', (0, 0), (-1, -1), 1, colors.HexColor('#1a1a2e'))]))
            story.append(Spacer(1, 0.1*inch))
            
            # ===== FOOTER =====
            thanks_style = ParagraphStyle(
                'Thanks',
                parent=styles['Normal'],
                fontSize=11,
                textColor=colors.HexColor('#1a1a2e'),
                alignment=TA_CENTER,
                fontName='Helvetica-Bold'
            )
            
            footer_style = ParagraphStyle(
                'Footer',
                parent=styles['Normal'],
                fontSize=9,
                textColor=colors.HexColor('#333333'),
                alignment=TA_CENTER
            )
            
            story.append(Paragraph("Thank you for being our valued customer!", thanks_style))
            story.append(Spacer(1, 0.05*inch))
            story.append(Paragraph("Thank you for choosing Urban Chic Boutique Beauty Salon & Spa.", footer_style))
            story.append(Paragraph("We appreciate your visit and look forward to serving you again.", footer_style))
            story.append(Spacer(1, 0.1*inch))
            
            # Signatures
            sig_data = [
                ['Customer Signature', 'Receptionist Signature', 'Authorized By'],
                ['___________________', '___________________', '___________________']
            ]
            
            sig_table = Table(sig_data, colWidths=[2*inch, 2*inch, 2*inch])
            sig_table.setStyle(TableStyle([
                ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
                ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
                ('FONTSIZE', (0, 0), (-1, 0), 8),
                ('FONTSIZE', (0, 1), (-1, 1), 10),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.HexColor('#666666')),
                ('TOPPADDING', (0, 1), (-1, 1), 8),
                ('BOTTOMPADDING', (0, 1), (-1, 1), 4),
            ]))
            story.append(sig_table)
            story.append(Spacer(1, 0.15*inch))
            
            # Contact info footer
            contact_style = ParagraphStyle(
                'Contact',
                parent=styles['Normal'],
                fontSize=8,
                textColor=colors.HexColor('#666666'),
                alignment=TA_CENTER
            )
            
            contact_info = "📞 +254 700 000 000  |  ✉ info@urbanchicboutique.com  |  🌐 www.urbanchicboutique.com"
            story.append(Paragraph(contact_info, contact_style))
            
            # Build PDF
            doc.build(story)
            buffer.seek(0)
            return buffer.getvalue()
            
        except Exception as e:
            logger.error(f"Error generating receipt PDF: {str(e)}")
            import traceback
            traceback.print_exc()
            return None
    
    # ==================== GET RECEIPTS ====================
    @staticmethod
    def get_receipts(customer_id=None, payment_id=None, limit=50, offset=0):
        """Get receipts with filters"""
        try:
            query = Receipt.query
            
            if customer_id:
                query = query.filter_by(customer_id=customer_id)
            
            if payment_id:
                query = query.filter_by(payment_id=payment_id)
            
            total = query.count()
            receipts = query.order_by(Receipt.created_at.desc()).offset(offset).limit(limit).all()
            
            result = []
            for receipt in receipts:
                receipt_dict = receipt.to_dict()
                # Add customer name
                if receipt.customer:
                    user = User.query.get(receipt.customer.user_id)
                    if user:
                        receipt_dict['customer_name'] = f"{user.first_name or ''} {user.last_name or ''}".strip()
                result.append(receipt_dict)
            
            return {
                'items': result,
                'total': total,
                'limit': limit,
                'offset': offset
            }, 200
            
        except Exception as e:
            logger.error(f"Error in get_receipts: {str(e)}")
            return {'error': str(e)}, 500
    
    @staticmethod
    def get_receipt_by_id(receipt_id):
        """Get receipt by ID"""
        try:
            receipt = Receipt.query.get(receipt_id)
            if not receipt:
                return {'error': 'Receipt not found'}, 404
            return receipt.to_dict(), 200
        except Exception as e:
            logger.error(f"Error in get_receipt_by_id: {str(e)}")
            return {'error': str(e)}, 500
    
    @staticmethod
    def get_receipts_by_customer(customer_id, limit=50, offset=0):
        """Get receipts by customer ID"""
        try:
            query = Receipt.query.filter_by(customer_id=customer_id)
            total = query.count()
            receipts = query.order_by(Receipt.created_at.desc()).offset(offset).limit(limit).all()
            
            result = []
            for receipt in receipts:
                result.append(receipt.to_dict())
            
            return {
                'items': result,
                'total': total,
                'limit': limit,
                'offset': offset
            }, 200
            
        except Exception as e:
            logger.error(f"Error in get_receipts_by_customer: {str(e)}")
            return {'error': str(e)}, 500
    
    @staticmethod
    def get_receipt_by_payment(payment_id):
        """Get receipt by payment ID"""
        try:
            receipt = Receipt.query.filter_by(payment_id=payment_id).first()
            if not receipt:
                return {'error': 'Receipt not found for this payment'}, 404
            return receipt.to_dict(), 200
        except Exception as e:
            logger.error(f"Error getting receipt by payment: {str(e)}")
            return {'error': str(e)}, 500
    
    # ==================== SEND RECEIPTS ====================
    @staticmethod
    def send_receipt(receipt_id, method='email'):
        """Send receipt via email or SMS"""
        try:
            receipt = Receipt.query.get(receipt_id)
            if not receipt:
                return {'error': 'Receipt not found'}, 404
            
            if method == 'email':
                receipt.is_emailed = True
                receipt.sent_at = datetime.utcnow()
                receipt.sent_via = 'email'
                db.session.commit()
                return {'message': 'Receipt sent via email'}, 200
            elif method == 'sms':
                return ReceiptService.send_receipt_sms(receipt_id)
            else:
                return {'error': 'Invalid method'}, 400
            
        except Exception as e:
            db.session.rollback()
            logger.error(f"Error sending receipt: {str(e)}")
            return {'error': str(e)}, 500
    
    @staticmethod
    def send_receipt_sms(receipt_id):
        """Send receipt via SMS"""
        try:
            receipt = Receipt.query.get(receipt_id)
            if not receipt:
                return {'error': 'Receipt not found'}, 404
            
            customer = Customer.query.get(receipt.customer_id)
            if not customer:
                return {'error': 'Customer not found'}, 404
            
            user = User.query.get(customer.user_id)
            if not user:
                return {'error': 'User not found'}, 404
            
            phone = user.phone
            if not phone:
                return {'error': 'No phone number found'}, 404
            
            receipt.is_sms = True
            receipt.sent_at = datetime.utcnow()
            receipt.sent_via = 'sms'
            db.session.commit()
            
            return {'message': f'Receipt sent via SMS to {phone}'}, 200
            
        except Exception as e:
            logger.error(f"Error in send_receipt_sms: {str(e)}")
            return {'error': str(e)}, 500
    
    @staticmethod
    def send_receipt_email(receipt_id, email):
        """Send receipt via email with PDF attachment"""
        try:
            receipt = Receipt.query.get(receipt_id)
            if not receipt:
                return {'error': 'Receipt not found'}, 404
            
            pdf_data = ReceiptService.generate_receipt_pdf(receipt_id)
            if not pdf_data:
                return {'error': 'Failed to generate PDF'}, 500
            
            # Here you would implement actual email sending
            # For now, just mark as emailed
            receipt.is_emailed = True
            receipt.sent_at = datetime.utcnow()
            receipt.sent_via = 'email'
            db.session.commit()
            
            return {'message': f'Receipt sent to {email}'}, 200
            
        except Exception as e:
            logger.error(f"Error sending receipt email: {str(e)}")
            return {'error': str(e)}, 500
    
    # ==================== GENERATE WITH LOGO ====================
    @staticmethod
    def generate_receipt_with_logo(payment_id, logo_path=None):
        """Generate receipt with custom logo"""
        result, status = ReceiptService.create_receipt(payment_id)
        if status != 201:
            return result, status
        
        receipt = Receipt.query.filter_by(payment_id=payment_id).first()
        if receipt:
            pdf_data = ReceiptService.generate_receipt_pdf(receipt.id)
            if pdf_data:
                return {'receipt': receipt.to_dict(), 'pdf': pdf_data}, 200
        
        return {'error': 'Failed to generate receipt with logo'}, 500
    
    @staticmethod
    def generate_receipt_for_payment(payment_id):
        """Generate receipt for a payment - wrapper for create_receipt"""
        result, status = ReceiptService.create_receipt(payment_id)
        return result, status
    
    @staticmethod
    def regenerate_receipt_pdf(receipt_id):
        """Regenerate receipt PDF (force refresh)"""
        try:
            receipt = Receipt.query.get(receipt_id)
            if not receipt:
                return {'error': 'Receipt not found'}, 404
            
            # Clear items to force regeneration
            receipt.items = None
            db.session.commit()
            
            pdf_data = ReceiptService.generate_receipt_pdf(receipt_id)
            if pdf_data:
                return {'pdf': pdf_data, 'receipt': receipt.to_dict()}, 200
            return {'error': 'Failed to generate PDF'}, 500
            
        except Exception as e:
            logger.error(f"Error in regenerate_receipt_pdf: {str(e)}")
            return {'error': str(e)}, 500
    
    # ==================== MARK STATUS ====================
    @staticmethod
    def mark_receipt_as_downloaded(receipt_id):
        """Mark receipt as downloaded"""
        try:
            receipt = Receipt.query.get(receipt_id)
            if not receipt:
                return {'error': 'Receipt not found'}, 404
            
            receipt.is_downloaded = True
            receipt.downloaded_at = datetime.utcnow()
            db.session.commit()
            
            return {'message': 'Receipt marked as downloaded'}, 200
            
        except Exception as e:
            logger.error(f"Error in mark_receipt_as_downloaded: {str(e)}")
            return {'error': str(e)}, 500
    
    @staticmethod
    def mark_receipt_as_printed(receipt_id):
        """Mark receipt as printed"""
        try:
            receipt = Receipt.query.get(receipt_id)
            if not receipt:
                return {'error': 'Receipt not found'}, 404
            
            receipt.is_printed = True
            receipt.printed_at = datetime.utcnow()
            db.session.commit()
            
            return {'message': 'Receipt marked as printed'}, 200
            
        except Exception as e:
            logger.error(f"Error in mark_receipt_as_printed: {str(e)}")
            return {'error': str(e)}, 500
    
    @staticmethod
    def update_receipt_status(receipt_id, status):
        """Update receipt status"""
        try:
            receipt = Receipt.query.get(receipt_id)
            if not receipt:
                return {'error': 'Receipt not found'}, 404
            
            valid_statuses = ['generated', 'sent', 'viewed', 'downloaded', 'printed', 'resent', 'expired']
            if status not in valid_statuses:
                return {'error': f'Invalid status. Must be one of: {", ".join(valid_statuses)}'}, 400
            
            receipt.status = status
            db.session.commit()
            
            return {'message': f'Receipt status updated to {status}'}, 200
            
        except Exception as e:
            logger.error(f"Error in update_receipt_status: {str(e)}")
            return {'error': str(e)}, 500