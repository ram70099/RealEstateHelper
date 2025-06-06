# utils/email_utils.py

from typing import List, Dict, Any
import base64
import re
from pydantic import BaseModel
from email.utils import parsedate_to_datetime, parseaddr
from googleapiclient.discovery import Resource

class EmailReply(BaseModel):
    id: str
    thread_id: str
    subject: str
    from_email: str
    from_name: str
    to: str
    to_names: List[str]
    body: str
    timestamp: str
    snippet: str
    message_direction: str  # 'sent' or 'received'

def extract_email_body(msg) -> str:
    try:
        # Gmail API sometimes puts the body in payload.body.data if no parts
        if "parts" not in msg["payload"]:
            data = msg["payload"]["body"].get("data", "")
            if data:
                decoded_bytes = base64.urlsafe_b64decode(data.encode("UTF-8"))
                return decoded_bytes.decode("UTF-8")
            return ""

        for part in msg["payload"].get("parts", []):
            if part["mimeType"] == "text/plain":
                data = part["body"]["data"]
                decoded_bytes = base64.urlsafe_b64decode(data.encode("UTF-8"))
                return decoded_bytes.decode("UTF-8")
    except Exception:
        return ""
    return ""

def extract_header(headers, name: str) -> str:
    for h in headers:
        if h["name"].lower() == name.lower():
            return h["value"]
    return ""

def parse_email_name(email_str: str) -> (str, str):
    # Parses "Name <email@domain.com>" or just "email@domain.com"
    name, email = parseaddr(email_str)
    return name, email

def parse_multiple_emails(emails_str: str) -> List[str]:
    # Parse multiple emails, e.g. "Name1 <email1>, Name2 <email2>"
    emails = []
    if not emails_str:
        return emails
    parts = emails_str.split(",")
    for part in parts:
        name, _ = parse_email_name(part.strip())
        emails.append(name if name else part.strip())
    return emails

def fetch_reply_details(service: Resource, query: str, user_email: str) -> List[Dict[str, Any]]:
    # user_email: your own email to detect sent/received
    response = service.users().messages().list(userId='me', q=query).execute()
    messages = response.get('messages', [])

    emails: List[Dict[str, Any]] = []

    for msg_meta in messages:
        msg = service.users().messages().get(userId='me', id=msg_meta['id'], format='full').execute()
        headers = msg["payload"]["headers"]

        subject = extract_header(headers, "Subject")
        sender_raw = extract_header(headers, "From")
        recipient_raw = extract_header(headers, "To")
        date = extract_header(headers, "Date")
        timestamp = parsedate_to_datetime(date).isoformat() if date else ""

        body = extract_email_body(msg)
        snippet = msg.get("snippet", "")

        from_name, from_email = parse_email_name(sender_raw)
        to_names = parse_multiple_emails(recipient_raw)

        # Determine message direction
        message_direction = "sent" if user_email.lower() == from_email.lower() else "received"

        emails.append({
            "id": msg["id"],
            "thread_id": msg.get("threadId", ""),
            "subject": subject,
            "from_email": from_email,
            "from_name": from_name or from_email,
            "to": recipient_raw,
            "to_names": to_names,
            "body": body,
            "timestamp": timestamp,
            "snippet": snippet,
            "message_direction": message_direction
        })

    # Group by thread_id to form conversations with participants
    conversations = {}
    for email in emails:
        thread = email["thread_id"]
        if thread not in conversations:
            conversations[thread] = {
                "participants": set(),
                "messages": []
            }
        # Add participants from from_name and to_names
        conversations[thread]["participants"].add(email["from_name"])
        for name in email["to_names"]:
            conversations[thread]["participants"].add(name)
        conversations[thread]["messages"].append(email)

    # Convert participants set to list
    final_conversations = []
    for thread_id, convo_data in conversations.items():
        final_conversations.append({
            "thread_id": thread_id,
            "participants": list(convo_data["participants"]),
            "messages": sorted(convo_data["messages"], key=lambda x: x["timestamp"])  # sort by time
        })

    return final_conversations
