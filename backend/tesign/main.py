import os
import base64
import pickle
import json
from datetime import datetime, timedelta
from email.utils import parsedate_to_datetime
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
from google.auth.transport.requests import Request

SCOPES = ['https://www.googleapis.com/auth/gmail.readonly']
KEYWORDS = ['property', 'rent', 'site visit', 'real estate', 'broker']
OUTPUT_FILE = 'property_emails.json'

def authenticate_gmail():
    creds = None
    if os.path.exists('token.pkl'):
        with open('token.pkl', 'rb') as token:
            creds = pickle.load(token)

    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            flow = InstalledAppFlow.from_client_secrets_file('credentials.json', SCOPES)
            creds = flow.run_local_server(port=0)
        with open('token.pkl', 'wb') as token:
            pickle.dump(creds, token)

    return build('gmail', 'v1', credentials=creds)

def get_recent_property_emails():
    service = authenticate_gmail()
    now = datetime.utcnow()
    thirty_minutes_ago = now - timedelta(minutes=30)

    # Get recent messages from inbox and sent (not using newer_than because it's not granular enough)
    inbox_results = service.users().messages().list(userId='me', labelIds=['INBOX'], maxResults=50).execute()
    sent_results = service.users().messages().list(userId='me', labelIds=['SENT'], maxResults=50).execute()

    inbox_messages = inbox_results.get('messages', []) or []
    sent_messages = sent_results.get('messages', []) or []

    matched_emails = []
    seen_ids = set()

    def process_messages(messages, msg_type):
        for msg in messages:
            if msg['id'] in seen_ids:
                continue
            seen_ids.add(msg['id'])

            message = service.users().messages().get(userId='me', id=msg['id'], format='full').execute()
            payload = message['payload']
            headers = {h['name']: h['value'] for h in payload.get('headers', [])}
            subject = headers.get("Subject", "(No Subject)")
            sender = headers.get("From", "(Unknown Sender)")
            date_str = headers.get("Date", None)

            if not date_str:
                continue

            try:
                email_datetime = parsedate_to_datetime(date_str).astimezone()
                if email_datetime < thirty_minutes_ago.astimezone():
                    continue  # Skip if older than 30 mins
            except Exception:
                continue

            # Get plain text body
            body = ""
            if payload.get("parts"):
                for part in payload["parts"]:
                    if part.get("mimeType") == "text/plain":
                        data = part["body"].get("data")
                        if data:
                            body = base64.urlsafe_b64decode(data).decode("utf-8", errors='ignore')
                            break
            else:
                data = payload["body"].get("data")
                if data:
                    body = base64.urlsafe_b64decode(data).decode("utf-8", errors='ignore')

            content = f"{subject.lower()} {body.lower()}"
            if any(keyword in content for keyword in KEYWORDS):
                matched_emails.append({
                    "from": sender,
                    "subject": subject,
                    "date": email_datetime.isoformat(),
                    "body": body.strip(),
                    "type": msg_type
                })

    process_messages(inbox_messages, "received")
    process_messages(sent_messages, "sent")

    return matched_emails

def save_to_json(data, filename=OUTPUT_FILE):
    with open(filename, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

if __name__ == "__main__":
    print("📬 Collecting last 30 minutes of property-related emails (received + sent)...\n")
    emails = get_recent_property_emails()
    save_to_json(emails)
    print(f"✅ Saved {len(emails)} matching emails to {OUTPUT_FILE}")
