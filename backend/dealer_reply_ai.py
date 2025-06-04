import os
import base64
from datetime import datetime, timedelta
from fastapi import HTTPException
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
from google.auth.transport.requests import AuthorizedSession
from utils import logger
import asyncio
import httplib2
from extraction.ai_extractor import dealer_response_analyzer
import json
import ssl
import re

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

    try:
        # Create authorized HTTP client with SSL configuration
        http = httplib2.Http(timeout=30)
        http.disable_ssl_certificate_validation = True
        
        # Configure SSL context
        ssl_context = ssl.create_default_context()
        ssl_context.check_hostname = False
        ssl_context.verify_mode = ssl.CERT_NONE
        
        return build('gmail', 'v1', 
                    credentials=creds,
                    cache_discovery=False)
    except Exception as e:
        logger.error(f"Failed to create Gmail service: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to initialize Gmail service: {str(e)}"
        )


async def fetch_email(service, user_id, msg_id):
    try:
        loop = asyncio.get_event_loop()
        # Create a new HTTP client for each request
        http = httplib2.Http(timeout=30)
        http.disable_ssl_certificate_validation = True
        
        def fetch():
            try:
                return service.users().messages().get(
                    userId=user_id,
                    id=msg_id,
                    format='full'
                ).execute()
            except Exception as e:
                logger.error(f"Error in fetch_email for {msg_id}: {str(e)}")
                return None

        return await loop.run_in_executor(None, fetch)
    except Exception as e:
        logger.error(f"Error fetching email {msg_id}: {str(e)}")
        return None


async def fetch_recent_reply_emails(service, user_id='me', query=None):
    if query is None:
        # Get today's date in YYYY/MM/DD format
        today = datetime.now().strftime('%Y/%m/%d')
        query = f'in:inbox subject:"Re:" after:{today}'

    try:
        logger.info(f"Fetching emails with query: {query}")
        response = service.users().messages().list(
            userId=user_id, 
            q=query,
            maxResults=50
        ).execute()
        
        messages = response.get('messages', [])
        if not messages:
            logger.info("No messages found matching the criteria")
            return []

        logger.info(f"Found {len(messages)} messages to process")
        tasks = [fetch_email(service, user_id, msg['id']) for msg in messages]
        email_datas = await asyncio.gather(*tasks)
        return [email for email in email_datas if email is not None]

    except Exception as e:
        logger.error(f"Error fetching emails: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch emails: {str(e)}"
        )


def extract_email_body(email_message):
    try:
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
    except Exception as e:
        logger.error(f"Error extracting email body: {str(e)}")
        return ""


async def analyze_dealer_replies():
    try:
        service = get_gmail_service()
        emails = await fetch_recent_reply_emails(service)
        
        if not emails:
            return {"emails": [], "message": "No new reply emails found"}

        email_replies = []
        for email in emails:
            try:
                headers = email.get('payload', {}).get('headers', [])
                subject = next((h['value'] for h in headers if h['name'].lower() == 'subject'), "")
                body = extract_email_body(email)

                # Use the dealer_response_analyzer agent to analyze the email
                task = f"""
Email Subject: {subject}
Email Body: {body}
"""
                analysis_result = None
                async for message in dealer_response_analyzer.run_stream(task=task):
                    if message.content:
                        try:
                            # Extract JSON from the response
                            json_blocks = re.findall(r"```json(.*?)```", message.content, flags=re.DOTALL)
                            if json_blocks:
                                json_text = json_blocks[-1].strip()
                            else:
                                # Try to find JSON in the content
                                json_text = message.content.strip()
                                # Remove any non-JSON text before the first {
                                json_text = json_text[json_text.find('{'):]
                                # Remove any non-JSON text after the last }
                                json_text = json_text[:json_text.rfind('}')+1]

                            if json_text:
                                analysis_result = json.loads(json_text)
                                break
                        except Exception as e:
                            logger.error(f"Error parsing AI response: {str(e)}")
                            logger.error(f"Raw content: {message.content}")
                            continue

                # Only include the analysis result if we got valid JSON
                if analysis_result:
                    email_replies.append(analysis_result)

            except Exception as e:
                logger.error(f"Error processing email: {str(e)}")
                continue

        # Save the latest data to a JSON file
        latest_data = {
            "timestamp": datetime.now().isoformat(),
            "responses": email_replies,
            "total_processed": len(email_replies)
        }
        
        with open('latest_dealer_replies.json', 'w') as f:
            json.dump(latest_data, f, indent=2)

        return {
            "status": "success",
            "data": latest_data,
            "message": f"Successfully processed {len(email_replies)} dealer replies"
        }

    except Exception as e:
        logger.error(f"Failed to fetch dealer replies: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail={
                "status": "error",
                "message": "Error fetching dealer replies",
                "error": str(e)
            }
        )

async def get_original_property_data(property_id: str):
    """
    Get the original property data from your database or storage.
    This is a placeholder - implement according to your data storage solution.
    """
    try:
        # TODO: Implement actual data retrieval from your database
        # For now, return a sample structure
        return {
            "id": property_id,
            "rent": 5000,
            "status": "available",
            "notes": "Original property details"
        }
    except Exception as e:
        logger.error(f"Error fetching original property data: {str(e)}")
        return None
