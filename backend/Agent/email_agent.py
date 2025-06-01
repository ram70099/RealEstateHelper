import os
import smtplib
from email.message import EmailMessage

def send_interest_email(property_info: dict):
    """
    Send an interest email about a property to the broker emails or fallback email.
    """
    SMTP_SERVER = "smtp.gmail.com"
    SMTP_PORT = 587

    EMAIL_ADDRESS = os.getenv("EMAIL_ADDRESS")
    EMAIL_PASSWORD = os.getenv("EMAIL_PASSWORD")

    if not EMAIL_ADDRESS or not EMAIL_PASSWORD:
        print("[Email Agent] ERROR: Email credentials are missing!")
        return False

    print(f"[Email Agent] Using email address: {EMAIL_ADDRESS}")

    broker_emails = []
    if "brokers" in property_info:
        for broker in property_info["brokers"]:
            email = broker.get("email")
            if email:
                broker_emails.append(email)

    fallback_email = os.getenv("TEST_BROKER_EMAIL", "your_email@example.com")
    recipients = broker_emails if broker_emails else [fallback_email]

    print(f"[Email Agent] Recipients: {recipients}")

    subject = f"Interest in property: {property_info.get('title', 'No Title')}"
    body = f"""
Hello,

I am interested in the property titled '{property_info.get('title', 'N/A')}'.
Details:
- Rent: {property_info.get('rent', 'N/A')}
- Status: {property_info.get('status', 'N/A')}
- Notes: {property_info.get('notes', '')}

Please contact me back.

Thanks,
Your Real Estate Helper Bot
"""

    try:
        with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as smtp:
            smtp.set_debuglevel(1)
            print("[Email Agent] Starting TLS encryption...")
            smtp.starttls()

            print("[Email Agent] Logging in to SMTP server...")
            smtp.login(EMAIL_ADDRESS, EMAIL_PASSWORD)

            for recipient in recipients:
                print(f"[Email Agent] Sending email to {recipient} ...")
                msg = EmailMessage()
                msg['From'] = EMAIL_ADDRESS
                msg['To'] = recipient
                msg['Subject'] = subject
                msg.set_content(body)

                smtp.send_message(msg)
                print(f"[Email Agent] Email sent successfully to {recipient}")

        return True

    except smtplib.SMTPAuthenticationError:
        print("[Email Agent] ERROR: Authentication failed. Check your email and password.")
    except smtplib.SMTPException as e:
        print(f"[Email Agent] SMTP error occurred: {e}")
    except Exception as e:
        print(f"[Email Agent] Unexpected error: {e}")

    return False
