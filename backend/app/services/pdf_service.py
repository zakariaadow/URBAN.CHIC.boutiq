import os
from io import BytesIO
from reportlab.lib.pagesizes import letter, A4
from reportlab.pdfgen import canvas
from reportlab.lib.utils import ImageReader
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, Image
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib.enums import TA_CENTER, TA_RIGHT, TA_LEFT
from flask import current_app
import logging

logger = logging.getLogger(__name__)

class PDFService:
    
    @staticmethod
    def get_logo_path():
        """Find the logo path in multiple locations"""
        # Get the backend directory (where flask run is executed)
        backend_dir = os.getcwd()
        
        # Get the app directory
        app_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        
        # Possible logo locations
        possible_paths = [
            # From backend/static/images/ (most common)
            os.path.join(backend_dir, 'static', 'images', 'logo.png'),
            os.path.join(backend_dir, 'static', 'images', 'logo.jpg'),
            os.path.join(backend_dir, 'static', 'images', 'logo.jpeg'),
            os.path.join(backend_dir, 'static', 'logo.png'),
            os.path.join(backend_dir, 'static', 'logo.jpg'),
            # From app/static/images/
            os.path.join(app_dir, 'static', 'images', 'logo.png'),
            os.path.join(app_dir, 'static', 'images', 'logo.jpg'),
            os.path.join(app_dir, 'static', 'logo.png'),
            # From current_app root path
            os.path.join(current_app.root_path, 'static', 'images', 'logo.png') if hasattr(current_app, 'root_path') else None,
            os.path.join(current_app.root_path, 'static', 'logo.png') if hasattr(current_app, 'root_path') else None,
            # Uploads directory
            os.path.join(backend_dir, 'uploads', 'logo.png'),
            os.path.join(backend_dir, 'uploads', 'logo.jpg'),
            # Frontend public directory
            os.path.join(os.path.dirname(backend_dir), 'frontend', 'public', 'logo.png'),
            os.path.join(os.path.dirname(backend_dir), 'frontend', 'public', 'logo.jpg'),
            # Root directory
            os.path.join(os.path.dirname(backend_dir), 'logo.png'),
            # Current directory
            'static/images/logo.png',
            'static/logo.png',
            'logo.png',
        ]
        
        # Remove None values
        possible_paths = [p for p in possible_paths if p is not None]
        
        for path in possible_paths:
            if os.path.exists(path):
                logger.info(f"✅ Found logo at: {path}")
                return path
        
        # Try to find any image in static/images
        static_images_dir = os.path.join(backend_dir, 'static', 'images')
        if os.path.exists(static_images_dir):
            for file in os.listdir(static_images_dir):
                if file.lower().startswith('logo') and file.lower().endswith(('.png', '.jpg', '.jpeg', '.gif', '.svg')):
                    full_path = os.path.join(static_images_dir, file)
                    logger.info(f"✅ Found logo at: {full_path}")
                    return full_path
        
        # Try current_app static folder
        if hasattr(current_app, 'static_folder') and current_app.static_folder:
            static_folder = current_app.static_folder
            for file in ['logo.png', 'logo.jpg', 'images/logo.png', 'images/logo.jpg']:
                path = os.path.join(static_folder, file)
                if os.path.exists(path):
                    logger.info(f"✅ Found logo at: {path}")
                    return path
        
        logger.warning("❌ No logo image found, using text-only header")
        return None
    
    @staticmethod
    def generate_receipt_buffer(receipt_data):
        """
        Generates a PDF receipt into a BytesIO buffer to be attached to an email.
        """
        try:
            buffer = BytesIO()
            doc = SimpleDocTemplate(buffer, pagesize=A4, 
                                   rightMargin=72, leftMargin=72, 
                                   topMargin=72, bottomMargin=72)
            
            # Styles
            styles = getSampleStyleSheet()
            
            title_style = ParagraphStyle(
                'CustomTitle',
                parent=styles['Heading1'],
                fontSize=24,
                textColor=colors.HexColor('#2c3e50'),
                alignment=TA_CENTER,
                spaceAfter=5
            )
            
            subtitle_style = ParagraphStyle(
                'Subtitle',
                parent=styles['Normal'],
                fontSize=12,
                textColor=colors.HexColor('#7f8c8d'),
                alignment=TA_CENTER,
                spaceAfter=20
            )
            
            header_style = ParagraphStyle(
                'Header',
                parent=styles['Heading2'],
                fontSize=14,
                textColor=colors.HexColor('#34495e'),
                spaceAfter=12
            )
            
            normal_style = ParagraphStyle(
                'Normal',
                parent=styles['Normal'],
                fontSize=10,
                textColor=colors.HexColor('#2c3e50')
            )
            
            # Build content
            story = []
            
            # ===== HEADER WITH LOGO =====
            logo_path = PDFService.get_logo_path()
            
            if logo_path and os.path.exists(logo_path):
                try:
                    # Load image for reportlab
                    logo = Image(logo_path, width=1.2*inch, height=1.2*inch)
                    logo.hAlign = 'CENTER'
                    
                    # Header table with logo
                    header_data = [
                        [logo, Paragraph("Urban Chic Boutique", title_style)],
                        ['', Paragraph("Premium Beauty & Wellness", subtitle_style)]
                    ]
                    
                    header_table = Table(header_data, colWidths=[1.8*inch, 4.2*inch])
                    header_table.setStyle(TableStyle([
                        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
                        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
                        ('LEFTPADDING', (0, 0), (0, -1), 0),
                        ('RIGHTPADDING', (1, 0), (-1, -1), 0),
                    ]))
                    story.append(header_table)
                    logger.info("✅ Logo added to PDF")
                except Exception as e:
                    logger.error(f"Error adding logo: {e}")
                    # Fallback to text only
                    story.append(Paragraph("Urban Chic Boutique", title_style))
                    story.append(Paragraph("Premium Beauty & Wellness", subtitle_style))
            else:
                # Text-only header
                story.append(Paragraph("Urban Chic Boutique", title_style))
                story.append(Paragraph("Premium Beauty & Wellness", subtitle_style))
            
            # Business details
            branch_name = receipt_data.get('branch_name', '')
            branch_address = receipt_data.get('branch_address', '')
            branch_phone = receipt_data.get('branch_phone', '')
            branch_email = receipt_data.get('branch_email', '')
            
            if branch_name or branch_address:
                branch_info = f"{branch_name}"
                if branch_address:
                    branch_info += f"<br/>{branch_address}"
                if branch_phone:
                    branch_info += f"<br/>📞 {branch_phone}"
                if branch_email:
                    branch_info += f"<br/>✉ {branch_email}"
                
                story.append(Paragraph(branch_info, subtitle_style))
            
            story.append(Spacer(1, 0.2*inch))
            
            # Divider line
            story.append(Spacer(1, 0.1*inch))
            story.append(Table([['']], colWidths=[6*inch], 
                              style=[('LINEABOVE', (0, 0), (-1, -1), 1, colors.HexColor('#3498db'))]))
            story.append(Spacer(1, 0.2*inch))
            
            # ===== RECEIPT INFO =====
            story.append(Paragraph("RECEIPT", styles['Heading2']))
            story.append(Spacer(1, 0.1*inch))
            
            receipt_data_rows = [
                ['Receipt Number:', receipt_data.get('receipt_number', 'N/A')],
                ['Invoice Number:', receipt_data.get('invoice_number', 'N/A')],
                ['Date:', receipt_data.get('receipt_date', 'N/A')],
                ['Status:', receipt_data.get('status', 'Generated')]
            ]
            
            receipt_table = Table(receipt_data_rows, colWidths=[1.5*inch, 3.5*inch])
            receipt_table.setStyle(TableStyle([
                ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
                ('FONTSIZE', (0, 0), (-1, -1), 10),
                ('TEXTCOLOR', (0, 0), (-1, -1), colors.HexColor('#2c3e50')),
                ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
                ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#bdc3c7')),
                ('BACKGROUND', (0, 0), (0, -1), colors.HexColor('#ecf0f1')),
                ('PADDING', (0, 0), (-1, -1), 6),
            ]))
            story.append(receipt_table)
            story.append(Spacer(1, 0.2*inch))
            
            # ===== CUSTOMER INFO =====
            story.append(Paragraph("Customer Information", header_style))
            customer_data = [
                ['Name:', receipt_data.get('customer_name', 'N/A')],
                ['Email:', receipt_data.get('customer_email', 'N/A')],
                ['Phone:', receipt_data.get('customer_phone', 'N/A')],
            ]
            
            if receipt_data.get('customer_address'):
                customer_data.append(['Address:', receipt_data.get('customer_address')])
            
            customer_table = Table(customer_data, colWidths=[1.5*inch, 3.5*inch])
            customer_table.setStyle(TableStyle([
                ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
                ('FONTSIZE', (0, 0), (-1, -1), 10),
                ('TEXTCOLOR', (0, 0), (-1, -1), colors.HexColor('#2c3e50')),
                ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
                ('PADDING', (0, 0), (-1, -1), 4),
            ]))
            story.append(customer_table)
            story.append(Spacer(1, 0.2*inch))
            
            # ===== SERVICES =====
            story.append(Paragraph("Services Details", header_style))
            
            # Build items table with ALL services
            items = receipt_data.get('items', [])
            item_table_data = [
                ['#', 'Service', 'Duration', 'Price']
            ]
            
            total = 0
            for idx, item in enumerate(items, 1):
                item_name = item.get('name') if isinstance(item, dict) else str(item)
                if not item_name:
                    item_name = 'Service'
                
                item_price = float(item.get('price') if isinstance(item, dict) else 0) or 0
                item_duration = int(item.get('duration') if isinstance(item, dict) else 30) or 30
                total += item_price
                
                item_table_data.append([
                    str(idx),
                    Paragraph(item_name, normal_style),
                    f"{item_duration} min",
                    f"Ksh {item_price:,.2f}"
                ])
            
            # Add total row
            item_table_data.append(['', '', 'Total:', f"Ksh {total:,.2f}"])
            
            # If no items, add a default
            if len(item_table_data) == 1:
                total = float(receipt_data.get('amount_paid', 0))
                item_table_data.append([
                    '1',
                    Paragraph('Service', normal_style),
                    '30 min',
                    f"Ksh {total:,.2f}"
                ])
                item_table_data.append(['', '', 'Total:', f"Ksh {total:,.2f}"])
            
            item_table = Table(item_table_data, colWidths=[0.5*inch, 3*inch, 1*inch, 1.5*inch])
            item_table.setStyle(TableStyle([
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('FONTSIZE', (0, 0), (-1, 0), 10),
                ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#2c3e50')),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
                ('FONTNAME', (0, -1), (-1, -1), 'Helvetica-Bold'),
                ('FONTSIZE', (0, -1), (-1, -1), 11),
                ('BACKGROUND', (0, -1), (-1, -1), colors.HexColor('#ecf0f1')),
                ('GRID', (0, 0), (-1, -2), 0.5, colors.HexColor('#bdc3c7')),
                ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
                ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
                ('PADDING', (0, 0), (-1, -1), 6),
            ]))
            story.append(item_table)
            story.append(Spacer(1, 0.2*inch))
            
            # ===== PAYMENT INFO =====
            story.append(Paragraph("Payment Information", header_style))
            
            payment_data = [
                ['Payment Method:', receipt_data.get('payment_method', 'Pending')],
                ['Payment Status:', receipt_data.get('payment_status', 'Pending')],
                ['Total Amount:', f"Ksh {total:,.2f}"],
            ]
            
            if receipt_data.get('transaction_id'):
                payment_data.append(['Transaction ID:', receipt_data.get('transaction_id')])
            if receipt_data.get('reference_number'):
                payment_data.append(['Reference:', receipt_data.get('reference_number')])
            if receipt_data.get('payment_date'):
                payment_data.append(['Payment Date:', receipt_data.get('payment_date')])
            
            payment_table = Table(payment_data, colWidths=[1.5*inch, 3.5*inch])
            payment_table.setStyle(TableStyle([
                ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
                ('FONTSIZE', (0, 0), (-1, -1), 10),
                ('TEXTCOLOR', (0, 0), (-1, -1), colors.HexColor('#2c3e50')),
                ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
                ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#bdc3c7')),
                ('BACKGROUND', (0, 0), (0, -1), colors.HexColor('#ecf0f1')),
                ('PADDING', (0, 0), (-1, -1), 6),
            ]))
            story.append(payment_table)
            story.append(Spacer(1, 0.2*inch))
            
            # ===== FOOTER =====
            # Divider line
            story.append(Table([['']], colWidths=[6*inch], 
                              style=[('LINEABOVE', (0, 0), (-1, -1), 1, colors.HexColor('#3498db'))]))
            story.append(Spacer(1, 0.1*inch))
            
            footer_style = ParagraphStyle(
                'Footer',
                parent=styles['Normal'],
                fontSize=9,
                textColor=colors.HexColor('#7f8c8d'),
                alignment=TA_CENTER
            )
            
            story.append(Paragraph("Thank you for choosing Urban Chic Boutique!", footer_style))
            story.append(Paragraph("We appreciate your business and look forward to serving you again.", footer_style))
            story.append(Spacer(1, 0.05*inch))
            
            # Terms
            terms_style = ParagraphStyle(
                'Terms',
                parent=styles['Normal'],
                fontSize=7,
                textColor=colors.HexColor('#95a5a6'),
                alignment=TA_CENTER
            )
            story.append(Paragraph("This is a system-generated receipt. Please keep it for your records.", terms_style))
            
            # Build PDF
            doc.build(story)
            buffer.seek(0)
            return buffer
            
        except Exception as e:
            logger.error(f"Error generating receipt PDF: {str(e)}")
            import traceback
            traceback.print_exc()
            return None
    
    @staticmethod
    def generate_simple_receipt_pdf(receipt_data):
        """
        Generates a simple PDF receipt using canvas (fallback method)
        """
        try:
            buffer = BytesIO()
            c = canvas.Canvas(buffer, pagesize=letter)
            width, height = letter

            # 1. Add Logo
            logo_path = PDFService.get_logo_path()
            logo_added = False
            
            if logo_path and os.path.exists(logo_path):
                try:
                    logo = ImageReader(logo_path)
                    c.drawImage(logo, 40, height - 100, width=80, height=60, preserveAspectRatio=True)
                    logo_added = True
                except Exception as e:
                    logger.error(f"Error adding logo: {e}")
            
            if not logo_added:
                # Draw a placeholder circle if no logo
                c.setFillColorRGB(0.2, 0.4, 0.6)
                c.circle(80, height - 70, 30, fill=1)
                c.setFillColorRGB(1, 1, 1)
                c.setFont("Helvetica-Bold", 14)
                c.drawString(68, height - 78, "UB")

            # 2. Receipt Header
            c.setFillColorRGB(0, 0, 0)
            c.setFont("Helvetica-Bold", 16)
            c.drawString(140, height - 50, "Urban Chic Boutique")
            c.setFont("Helvetica", 10)
            c.drawString(140, height - 65, "Payment Receipt")

            # 3. Draw a line
            c.line(40, height - 90, width - 40, height - 90)

            # 4. Receipt Details
            c.setFont("Helvetica-Bold", 12)
            y = height - 120
            
            c.drawString(40, y, f"Receipt No: {receipt_data.get('receipt_number', 'N/A')}")
            c.drawString(300, y, f"Date: {receipt_data.get('receipt_date', 'N/A')}")
            
            y -= 25
            c.drawString(40, y, f"Customer: {receipt_data.get('customer_name', 'N/A')}")
            
            y -= 25
            c.drawString(40, y, f"Payment Method: {receipt_data.get('payment_method', 'N/A')}")
            
            y -= 40
            c.setFont("Helvetica-Bold", 14)
            c.setFillColorRGB(0, 0.5, 0)
            c.drawString(40, y, f"Amount Paid: Ksh {receipt_data.get('amount_paid', 0):,.0f}")
            
            # 5. Status
            c.setFillColorRGB(0, 0, 0)
            c.setFont("Helvetica", 12)
            c.drawString(300, y, f"Status: {receipt_data.get('status', 'PAID')}")

            # 6. Footer
            c.setFont("Helvetica-Oblique", 10)
            c.drawString(40, 50, "Thank you for shopping with Urban Chic Boutique!")

            c.save()
            buffer.seek(0)
            return buffer
            
        except Exception as e:
            logger.error(f"Error generating simple receipt PDF: {str(e)}")
            return None