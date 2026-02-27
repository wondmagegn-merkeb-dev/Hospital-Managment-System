import smtplib
import os
import logging
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)

# Email configuration from environment variables
SMTP_HOST = os.getenv("SMTP_HOST", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USER = os.getenv("SMTP_USER", "")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "")
FROM_EMAIL = os.getenv("FROM_EMAIL", SMTP_USER)
APP_NAME = os.getenv("APP_NAME", "Hospital Management System")
# Set to "true" to skip sending emails (e.g. in dev when SMTP is not configured)
SMTP_DISABLED = os.getenv("SMTP_DISABLED", "").lower() in ("true", "1", "yes")


def _is_smtp_configured() -> bool:
    """Check if SMTP credentials are properly configured."""
    return bool(SMTP_USER and SMTP_PASSWORD)


def _get_auth_error_hint() -> str:
    """Return troubleshooting hint for Gmail SMTP auth errors."""
    if "gmail" in SMTP_HOST.lower():
        return (
            " (Gmail requires an App Password, not your regular password. "
            "Enable 2FA at myaccount.google.com > Security, then create an App Password at "
            "myaccount.google.com/apppasswords)"
        )
    return ""


def _send_email(msg: MIMEMultipart, recipient: str) -> bool:
    """
    Internal helper to send an email via SMTP.
    Returns True on success, False on failure.
    """
    if SMTP_DISABLED:
        logger.info(f"Skipping email send (SMTP_DISABLED): would have sent to {recipient}")
        return True  # Don't fail the flow when SMTP is disabled

    if not _is_smtp_configured():
        logger.warning(
            "SMTP not configured. Set SMTP_USER and SMTP_PASSWORD in .env. "
            "For Gmail, use an App Password (not your regular password)."
        )
        return False

    try:
        with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
            server.starttls()
            server.login(SMTP_USER, SMTP_PASSWORD)
            server.send_message(msg)
        return True
    except smtplib.SMTPAuthenticationError as e:
        hint = _get_auth_error_hint()
        logger.error(f"SMTP authentication failed: {e}{hint}")
        return False
    except Exception as e:
        logger.error(f"Error sending email: {e}")
        return False


def send_password_reset_email(email: str, otp_code: str) -> bool:
    """
    Send password reset OTP code to user's email
    
    Args:
        email: Recipient email address
        otp_code: 6-digit OTP code
        
    Returns:
        bool: True if email sent successfully, False otherwise
    """
    try:
        # Create message
        msg = MIMEMultipart("alternative")
        msg["Subject"] = f"{APP_NAME} - Password Reset Code"
        msg["From"] = FROM_EMAIL
        msg["To"] = email
        
        # Create email body
        text_content = f"""
        Password Reset Request
        
        You have requested to reset your password for {APP_NAME}.
        
        Your verification code is: {otp_code}
        
        This code will expire in 5 minutes.
        
        If you did not request this password reset, please ignore this email.
        
        Best regards,
        {APP_NAME} Team
        """
        
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                .header {{ background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }}
                .content {{ background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }}
                .otp-box {{ background: white; border: 2px solid #667eea; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0; }}
                .otp-code {{ font-size: 32px; font-weight: bold; color: #667eea; letter-spacing: 5px; }}
                .footer {{ text-align: center; margin-top: 20px; color: #666; font-size: 12px; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>{APP_NAME}</h1>
                </div>
                <div class="content">
                    <h2>Password Reset Request</h2>
                    <p>You have requested to reset your password for {APP_NAME}.</p>
                    <div class="otp-box">
                        <p style="margin: 0 0 10px 0; color: #666;">Your verification code is:</p>
                        <div class="otp-code">{otp_code}</div>
                    </div>
                    <p>This code will expire in <strong>5 minutes</strong>.</p>
                    <p>If you did not request this password reset, please ignore this email.</p>
                    <p>Best regards,<br>{APP_NAME} Team</p>
                </div>
                <div class="footer">
                    <p>This is an automated message. Please do not reply to this email.</p>
                </div>
            </div>
        </body>
        </html>
        """
        
        # Attach both plain text and HTML versions
        part1 = MIMEText(text_content, "plain")
        part2 = MIMEText(html_content, "html")
        
        msg.attach(part1)
        msg.attach(part2)
        
        return _send_email(msg, email)
    except Exception as e:
        logger.error(f"Error preparing password reset email: {e}")
        return False


def send_verification_email(email: str, otp_code: str) -> bool:
    """
    Send email verification OTP code to user's email
    
    Args:
        email: Recipient email address
        otp_code: 6-digit OTP code
        
    Returns:
        bool: True if email sent successfully, False otherwise
    """
    try:
        # Create message
        msg = MIMEMultipart("alternative")
        msg["Subject"] = f"{APP_NAME} - Email Verification Code"
        msg["From"] = FROM_EMAIL
        msg["To"] = email
        
        # Create email body
        text_content = f"""
        Email Verification
        
        Thank you for registering with {APP_NAME}!
        
        Please verify your email address by entering the following code:
        
        Verification code: {otp_code}
        
        This code will expire in 10 minutes.
        
        If you did not create an account, please ignore this email.
        
        Best regards,
        {APP_NAME} Team
        """
        
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                .header {{ background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }}
                .content {{ background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }}
                .otp-box {{ background: white; border: 2px solid #667eea; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0; }}
                .otp-code {{ font-size: 32px; font-weight: bold; color: #667eea; letter-spacing: 5px; }}
                .footer {{ text-align: center; margin-top: 20px; color: #666; font-size: 12px; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>{APP_NAME}</h1>
                </div>
                <div class="content">
                    <h2>Email Verification</h2>
                    <p>Thank you for registering with {APP_NAME}!</p>
                    <p>Please verify your email address by entering the following code:</p>
                    <div class="otp-box">
                        <p style="margin: 0 0 10px 0; color: #666;">Your verification code is:</p>
                        <div class="otp-code">{otp_code}</div>
                    </div>
                    <p>This code will expire in <strong>10 minutes</strong>.</p>
                    <p>If you did not create an account, please ignore this email.</p>
                    <p>Best regards,<br>{APP_NAME} Team</p>
                </div>
                <div class="footer">
                    <p>This is an automated message. Please do not reply to this email.</p>
                </div>
            </div>
        </body>
        </html>
        """
        
        # Attach both plain text and HTML versions
        part1 = MIMEText(text_content, "plain")
        part2 = MIMEText(html_content, "html")
        
        msg.attach(part1)
        msg.attach(part2)
        
        return _send_email(msg, email)
    except Exception as e:
        logger.error(f"Error preparing verification email: {e}")
        return False


def send_credentials_email(email: str, username: str, password: str) -> bool:
    """
    Send login credentials (username and password) to a newly created user.

    Args:
        email: Recipient email address
        username: Generated username for login
        password: Generated password for login (plain text - only sent once)

    Returns:
        bool: True if email sent successfully, False otherwise
    """
    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = f"{APP_NAME} - Your Login Credentials"
        msg["From"] = FROM_EMAIL
        msg["To"] = email

        text_content = f"""
        Welcome to {APP_NAME}!

        Your account has been created. Use the following credentials to log in:

        Username: {username}
        Password: {password}

        Please log in and change your password after your first login for security.

        Best regards,
        {APP_NAME} Team
        """

        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                .header {{ background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }}
                .content {{ background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }}
                .credentials-box {{ background: white; border: 2px solid #667eea; border-radius: 8px; padding: 20px; margin: 20px 0; }}
                .credential-row {{ margin: 10px 0; }}
                .label {{ font-weight: bold; color: #666; }}
                .value {{ font-family: monospace; font-size: 16px; color: #333; }}
                .footer {{ text-align: center; margin-top: 20px; color: #666; font-size: 12px; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>{APP_NAME}</h1>
                </div>
                <div class="content">
                    <h2>Welcome! Your account has been created</h2>
                    <p>Use the following credentials to log in:</p>
                    <div class="credentials-box">
                        <div class="credential-row">
                            <span class="label">Username: </span>
                            <span class="value">{username}</span>
                        </div>
                        <div class="credential-row">
                            <span class="label">Password: </span>
                            <span class="value">{password}</span>
                        </div>
                    </div>
                    <p><strong>Please change your password after your first login for security.</strong></p>
                    <p>Best regards,<br>{APP_NAME} Team</p>
                </div>
                <div class="footer">
                    <p>This is an automated message. Please do not reply to this email.</p>
                </div>
            </div>
        </body>
        </html>
        """

        part1 = MIMEText(text_content, "plain")
        part2 = MIMEText(html_content, "html")
        msg.attach(part1)
        msg.attach(part2)

        return _send_email(msg, email)
    except Exception as e:
        logger.error(f"Error preparing credentials email: {e}")
        return False
