import os
import base64
from datetime import datetime, timedelta
from fastapi import HTTPException
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
from utils import logger
import asyncio

SCOPES = ['https://www.googleapis.com/auth/gmail.readonly']
TOKEN_PATH = 'token.json'
CREDENTIALS_PATH = 'credentials.json'


def get_gmail_service():
    creds = None
    if os.path.exists(TOKEN_PATH):
        creds = Credentials.from_authorized_user_file(TOKEN_PATH, SCOPES)

    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            flow = InstalledAppFlow.from_client_secrets_file(CREDENTIALS_PATH, SCOPES)
            creds = flow.run_local_server(port=0)
        with open(TOKEN_PATH, 'w') as token_file:
            token_file.write(creds.to_json())

    return build('gmail', 'v1', credentials=creds)


async def fetch_email(service, user_id, msg_id):
    # This is sync, so run it in threadpool for async
    loop = asyncio.get_event_loop()
    return await loop.run_in_executor(None,
        lambda: service.users().messages().get(userId=user_id, id=msg_id, format='full').execute()
    )


async def fetch_recent_reply_emails(service, user_id='me', query=None):
    if query is None:
        # Filter for unread replies only, change as needed
        query = 'in:inbox is:unread subject:"Re:" newer_than:1d'

    response = service.users().messages().list(userId=user_id, q=query).execute()
    messages = response.get('messages', [])

    if not messages:
        return []

    # Fetch all emails concurrently (max ~100 at once)
    tasks = [fetch_email(service, user_id, msg['id']) for msg in messages]
    email_datas = await asyncio.gather(*tasks)
    return email_datas


def extract_email_body(email_message):
    parts = email_message.get('payload', {}).get('parts', [])
    if not parts:
        body_data = email_message.get('payload', {}).get('body', {}).get('data')
        if body_data:
            return base64.urlsafe_b64decode(body_data).decode('utf-8')
        return ""

    for part in parts:
        if part.get('mimeType') == 'text/plain':
            data = part.get('body', {}).get('data')
            if data:
                return base64.urlsafe_b64decode(data).decode('utf-8')
    return ""


async def analyze_dealer_replies():
    try:
        service = get_gmail_service()

        emails = await fetch_recent_reply_emails(service)
        if not emails:
            return {"emails": [], "message": "No new reply emails found"}

        email_replies = []
        for email in emails:
            headers = email.get('payload', {}).get('headers', [])
            subject = next((h['value'] for h in headers if h['name'].lower() == 'subject'), "")
            body = extract_email_body(email)

            email_replies.append({
                "subject": subject,
                "body": body
            })

        return {"emails": email_replies}

    except Exception as e:
        logger.error(f"Failed to fetch dealer replies: {e}")
        raise HTTPException(status_code=500, detail="Error fetching dealer replies")
