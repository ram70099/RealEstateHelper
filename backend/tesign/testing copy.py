import os
import base64
import pickle
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
from google.auth.transport.requests import Request

SCOPES = ['https://www.googleapis.com/auth/gmail.readonly']

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

def get_latest_email():
    service = authenticate_gmail()
    results = service.users().messages().list(userId='me', labelIds=['INBOX'], maxResults=1).execute()
    messages = results.get('messages', [])

    if not messages:
        return "No messages found."

    message = service.users().messages().get(userId='me', id=messages[0]['id'], format='full').execute()
    payload = message['payload']

    parts = payload.get('parts', [])
    for part in parts:
        if part['mimeType'] == 'text/plain':
            body_data = part['body']['data']
            decoded = base64.urlsafe_b64decode(body_data).decode('utf-8')
            return decoded

    return "No plain text email found."

if __name__ == "__main__":
    print("📬 Reading latest email...\n")
    print(get_latest_email())
