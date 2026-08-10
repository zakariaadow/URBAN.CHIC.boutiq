from app.extensions import db
from app.models.user import User
from app.models.customer import Customer
from app.models.appointment import Appointment
from app.models.receipt import Receipt
from datetime import datetime
import logging
import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.mime.application import MIMEApplication
from flask import current_app
import io

logger = logging.getLogger(__name__)

class EmailService:
    
    @staticmethod
    def send_email(to_email, subject, body, html_body=None, attachments=None):
        """Send email with optional attachments"""
        try:
            # Get email configuration
            smtp_server = current_app.config.get('MAIL_SERVER', 'smtp.gmail.com')
            smtp_port = current_app.config.get('MAIL_PORT', 587)
            smtp_username = current_app.config.get('MAIL_USERNAME')
            smtp_password = current_app.config.get('MAIL_PASSWORD')
            default_sender = current_app.config.get('MAIL_DEFAULT_SENDER', smtp_username)
            mail_use_tls = current_app.config.get('MAIL_USE_TLS', True)
            mail_use_ssl = current_app.config.get('MAIL_USE_SSL', False)
            
            # IMPORTANT: Remove spaces from app password (Google App Passwords often have spaces)
            if smtp_password:
                smtp_password = smtp_password.replace(" ", "")
            
            # Validate credentials
            if not smtp_username or not smtp_password:
                logger.warning("Email credentials not configured. Skipping email send.")
                return {'success': False, 'message': 'Email not configured'}, 500
            
            # Create message
            msg = MIMEMultipart('alternative')
            msg['From'] = default_sender
            msg['To'] = to_email
            msg['Subject'] = subject
            
            # Add plain text body
            part_text = MIMEText(body, 'plain')
            msg.attach(part_text)
            
            # Add HTML body if provided
            if html_body:
                part_html = MIMEText(html_body, 'html')
                msg.attach(part_html)
            
            # Add attachments
            if attachments:
                for attachment in attachments:
                    if isinstance(attachment, dict):
                        part = MIMEApplication(
                            attachment.get('data', b''),
                            Name=attachment.get('filename', 'attachment.pdf')
                        )
                        part['Content-Disposition'] = f'attachment; filename="{attachment.get("filename", "attachment.pdf")}"'
                        msg.attach(part)
            
            # Send email with Gmail SMTP
            try:
                # Choose SSL or TLS based on configuration
                if mail_use_ssl:
                    # SSL connection (port 465)
                    server = smtplib.SMTP_SSL(smtp_server, smtp_port)
                else:
                    # TLS connection (port 587)
                    server = smtplib.SMTP(smtp_server, smtp_port)
                
                with server:
                    server.set_debuglevel(0)  # Set to 1 for debugging
                    
                    # Start TLS if using TLS (not SSL)
                    if mail_use_tls and not mail_use_ssl:
                        server.starttls()
                    
                    # Login with the app password (spaces removed)
                    server.login(smtp_username, smtp_password)
                    server.send_message(msg)
                
                logger.info(f"Email sent successfully to {to_email}")
                return {'success': True, 'message': f'Email sent to {to_email}'}, 200
                
            except smtplib.SMTPAuthenticationError as e:
                error_msg = f"Email authentication failed: {str(e)}"
                logger.error(error_msg)
                return {
                    'success': False, 
                    'message': 'Email authentication failed. Please check your email credentials.'
                }, 401
            except smtplib.SMTPException as e:
                logger.error(f"SMTP error: {str(e)}")
                return {'success': False, 'message': f'SMTP error: {str(e)}'}, 500
                
        except Exception as e:
            logger.error(f"Error sending email: {str(e)}")
            return {'success': False, 'message': str(e)}, 500
    
    @staticmethod
    def send_receipt_email(email, name, receipt, pdf_data):
        """Send receipt via email with PDF attachment"""
        try:
            if not email:
                return {'success': False, 'message': 'No email address provided'}, 400
            
            # Generate email subject and body
            subject = f"Your Receipt from Urban Chic Boutique - {receipt.receipt_number}"
            
            # Plain text body
            body = f"""
Dear {name or 'Customer'},

Thank you for your visit to Urban Chic Boutique.

Please find your receipt attached for your records.

Receipt Details:
-----------------
Receipt Number: {receipt.receipt_number}
Date: {receipt.receipt_date.strftime('%B %d, %Y %I:%M %p') if receipt.receipt_date else datetime.now().strftime('%B %d, %Y %I:%M %p')}
Total Amount: KES {receipt.total:,.2f}
Payment Method: {receipt.payment_method or 'N/A'}

Services Received:
{EmailService._format_services(receipt.items)}

Thank you for choosing Urban Chic Boutique!
We look forward to serving you again.

Best regards,
Urban Chic Boutique Team
{receipt.branch_name or 'Urban Chic Boutique'}
{receipt.branch_address or ''}
{receipt.branch_phone or ''}
{receipt.branch_email or ''}
"""
            
            # HTML body
            html_body = f"""
<!DOCTYPE html>
<html>
<head>
    <style>
        body {{ font-family: Arial, sans-serif; color: #333; }}
        .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
        .header {{ background: #1a1a2e; color: white; padding: 20px; text-align: center; }}
        .content {{ padding: 20px; }}
        .receipt-details {{ background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 15px 0; }}
        .footer {{ text-align: center; color: #666; font-size: 12px; margin-top: 20px; padding-top: 20px; border-top: 1px solid #ddd; }}
        .services {{ margin: 15px 0; }}
        .service-item {{ padding: 5px 0; border-bottom: 1px solid #eee; }}
        .total {{ font-weight: bold; font-size: 18px; color: #1a1a2e; }}
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Urban Chic Boutique</h1>
            <p>Receipt #{receipt.receipt_number}</p>
        </div>
        <div class="content">
            <p>Dear {name or 'Customer'},</p>
            <p>Thank you for your visit to Urban Chic Boutique.</p>
            <p>Please find your receipt attached for your records.</p>
            
            <div class="receipt-details">
                <p><strong>Receipt Number:</strong> {receipt.receipt_number}</p>
                <p><strong>Date:</strong> {receipt.receipt_date.strftime('%B %d, %Y %I:%M %p') if receipt.receipt_date else datetime.now().strftime('%B %d, %Y %I:%M %p')}</p>
                <p><strong>Total Amount:</strong> <span class="total">KES {receipt.total:,.2f}</span></p>
                <p><strong>Payment Method:</strong> {receipt.payment_method or 'N/A'}</p>
            </div>
            
            <div class="services">
                <h3>Services Received:</h3>
                {EmailService._format_services_html(receipt.items)}
            </div>
            
            <p>Thank you for choosing Urban Chic Boutique!</p>
            <p>We look forward to serving you again.</p>
            
            <div class="footer">
                <p><strong>{receipt.branch_name or 'Urban Chic Boutique'}</strong></p>
                <p>{receipt.branch_address or ''}</p>
                <p>{receipt.branch_phone or ''} | {receipt.branch_email or ''}</p>
                <p>&copy; {datetime.now().year} Urban Chic Boutique. All rights reserved.</p>
            </div>
        </div>
    </div>
</body>
</html>
"""
            
            # Prepare attachments
            attachments = []
            if pdf_data:
                attachments.append({
                    'data': pdf_data,
                    'filename': f"receipt-{receipt.receipt_number}.pdf"
                })
            
            # Send email
            result, status = EmailService.send_email(
                to_email=email,
                subject=subject,
                body=body,
                html_body=html_body,
                attachments=attachments
            )
            
            return result, status
            
        except Exception as e:
            logger.error(f"Error in send_receipt_email: {str(e)}")
            return {'success': False, 'message': str(e)}, 500
    
    @staticmethod
    def _format_services(items):
        """Format services for plain text email"""
        if not items:
            return "No services listed"
        
        lines = []
        for idx, item in enumerate(items, 1):
            name = item.get('name', 'Service') if isinstance(item, dict) else str(item)
            price = item.get('price', 0) if isinstance(item, dict) else 0
            lines.append(f"  {idx}. {name} - KES {price:,.2f}")
        
        return "\n".join(lines)
    
    @staticmethod
    def _format_services_html(items):
        """Format services for HTML email"""
        if not items:
            return "<p>No services listed</p>"
        
        html = ""
        for idx, item in enumerate(items, 1):
            name = item.get('name', 'Service') if isinstance(item, dict) else str(item)
            price = item.get('price', 0) if isinstance(item, dict) else 0
            html += f'<div class="service-item">{idx}. {name} - KES {price:,.2f}</div>'
        
        return html
    
    @staticmethod
    def send_appointment_confirmation(email, name, appointment):
        """Send appointment confirmation email"""
        try:
            subject = f"Appointment Confirmation - Urban Chic Boutique"
            
            body = f"""
Dear {name},

Your appointment has been confirmed!

Appointment Details:
-------------------
Date: {appointment.appointment_date.strftime('%B %d, %Y') if appointment.appointment_date else 'N/A'}
Time: {appointment.appointment_time.strftime('%I:%M %p') if appointment.appointment_time else 'N/A'}
Service: {appointment.service.name if appointment.service else 'N/A'}
Stylist: {appointment.stylist.user.first_name + ' ' + appointment.stylist.user.last_name if appointment.stylist and appointment.stylist.user else 'Not Assigned'}
Branch: {appointment.branch.name if appointment.branch else 'N/A'}

Please arrive 10 minutes before your appointment time.

Thank you for choosing Urban Chic Boutique!

Best regards,
Urban Chic Boutique Team
"""
            
            return EmailService.send_email(email, subject, body)
            
        except Exception as e:
            logger.error(f"Error sending appointment confirmation: {str(e)}")
            return {'success': False, 'message': str(e)}, 500
    
    @staticmethod
    def send_appointment_reminder(email, name, appointment):
        """Send appointment reminder email"""
        try:
            subject = f"Appointment Reminder - Urban Chic Boutique"
            
            body = f"""
Dear {name},

This is a reminder for your upcoming appointment.

Appointment Details:
-------------------
Date: {appointment.appointment_date.strftime('%B %d, %Y') if appointment.appointment_date else 'N/A'}
Time: {appointment.appointment_time.strftime('%I:%M %p') if appointment.appointment_time else 'N/A'}
Service: {appointment.service.name if appointment.service else 'N/A'}
Stylist: {appointment.stylist.user.first_name + ' ' + appointment.stylist.user.last_name if appointment.stylist and appointment.stylist.user else 'Not Assigned'}
Branch: {appointment.branch.name if appointment.branch else 'N/A'}

Please arrive 10 minutes before your appointment time.

If you need to reschedule, please contact us at least 24 hours in advance.

Thank you for choosing Urban Chic Boutique!

Best regards,
Urban Chic Boutique Team
"""
            
            return EmailService.send_email(email, subject, body)
            
        except Exception as e:
            logger.error(f"Error sending appointment reminder: {str(e)}")
            return {'success': False, 'message': str(e)}, 500
    
    @staticmethod
    def send_welcome_email(email, name, password=None):
        """Send welcome email to new user"""
        try:
            subject = "Welcome to Urban Chic Boutique!"
            
            body = f"""
Dear {name},

Welcome to Urban Chic Boutique!

We are excited to have you as part of our community.

Your account has been created successfully.
{'' if not password else f'Your temporary password is: {password}\nPlease change it after logging in.'}

You can now book appointments, track your loyalty points, and enjoy our premium services.

Get started by visiting our website and booking your first appointment.

Thank you for choosing Urban Chic Boutique!

Best regards,
Urban Chic Boutique Team
"""
            
            return EmailService.send_email(email, subject, body)
            
        except Exception as e:
            logger.error(f"Error sending welcome email: {str(e)}")
            return {'success': False, 'message': str(e)}, 500
    
    @staticmethod
    def send_password_reset_email(email, name, reset_link):
        """Send password reset email"""
        try:
            subject = "Password Reset - Urban Chic Boutique"
            
            body = f"""
Dear {name},

You requested to reset your password for your Urban Chic Boutique account.

Click the link below to reset your password:
{reset_link}

This link will expire in 1 hour.

If you did not request this, please ignore this email.

Best regards,
Urban Chic Boutique Team
"""
            
            return EmailService.send_email(email, subject, body)
            
        except Exception as e:
            logger.error(f"Error sending password reset email: {str(e)}")
            return {'success': False, 'message': str(e)}, 500