import os
import tempfile
import json
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from dealer_reply_ai import analyze_dealer_replies
from extraction.pdf_utils import extract_pdf_text, extract_property_images_from_pdf
from extraction.ai_extractor import run_property_extraction, analyze_dealer_reply
from dealer_reply_ai import get_gmail_service, fetch_recent_reply_emails, extract_email_body,extract_subject_from_email
from utils import logger, send_email, load_json, save_json
from email_utils import fetch_reply_details
from models import PropertyResponse
from models import ContactBrokerRequest
from dotenv import load_dotenv
from datetime import datetime
import aiofiles
from typing import Dict, Any
import asyncio
from typing import Optional
from pydantic import BaseModel

load_dotenv()

STATIC_IMAGE_DIR = "static"
DATA_DIR = "data"
os.makedirs(STATIC_IMAGE_DIR, exist_ok=True)
os.makedirs(DATA_DIR, exist_ok=True)

EMAIL_LOG_FILE = os.path.join(DATA_DIR, "email_logs.json")
if not os.path.exists(EMAIL_LOG_FILE):
    with open(EMAIL_LOG_FILE, "w") as f:
        json.dump([], f)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Restrict this in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/images", StaticFiles(directory=STATIC_IMAGE_DIR), name="images")


async def add_sent_email_log(
    email_id: str,
    to_email: str,
    subject: str,
    body: str,
    status: str = "sent"
) -> None:
    logs = load_json(EMAIL_LOG_FILE)
    logs.append({
        "id": email_id,
        "from": "Agent",
        "to": to_email,
        "subject": subject,
        "body": body,
        "status": status,
        "timestamp": datetime.utcnow().isoformat()
    })
    async with aiofiles.open(EMAIL_LOG_FILE, "w") as f:
        await f.write(json.dumps(logs, indent=2))


async def send_property_email(
    prop: dict,
    broker: dict,
    fallback_email: str,
    image_url: Optional[str] = None
) -> None:
    broker_name = broker.get("name", "Dealer")
    broker_email = broker.get("email")  # Make sure your extraction has emails!
    to_email = broker_email if broker_email else fallback_email

    subject = f"Interest in Property: {prop.get('title', 'N/A')}"
    body = f"""Dear {broker_name},

We are interested in the following property:

Title: {prop.get('title', 'N/A')}
Address: {prop.get('address', 'N/A')}
Rent: ₹{prop.get('rent', 'N/A')}

Please share your best rent or offer details.

Regards,
Real Estate Agent Bot
"""

    try:
        await asyncio.to_thread(send_email, to_email, subject, body)
        await add_sent_email_log(prop["id"], to_email, subject, body)
        logger.info(f"Email sent successfully to {to_email} for property {prop['id']}, broker {broker_name}")
    except Exception as e:
        logger.error(f"Email failed to {to_email} for property {prop['id']}, broker {broker_name}: {e}")
        await add_sent_email_log(prop["id"], to_email, subject, body, status="failed")


@app.post("/extract_data", response_model=PropertyResponse)
async def extract_data(pdf: UploadFile = File(...)):
    if pdf.content_type != "application/pdf":
        raise HTTPException(status_code=400, detail="File must be a PDF")

    tmp_path = None
    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp:
            tmp_path = tmp.name
            content = await pdf.read()
            tmp.write(content)

        pdf_text = extract_pdf_text(tmp_path)
        images = extract_property_images_from_pdf(tmp_path, STATIC_IMAGE_DIR)

        result = await run_property_extraction(pdf_text)

        fallback_email = os.getenv("FALLBACK_EMAIL", "shah70099053@gmail.com")

        if isinstance(result, list):
            tasks = []
            for i, prop in enumerate(result):
                prop["id"] = str(i + 1)
                prop["image_url"] = images[i]["url"] if i < len(images) else None

                if "available_sf" in prop:
                    prop["available_sf"] = str(prop["available_sf"])

                brokers = prop.get("brokers", [])
                if brokers:
                    for broker in brokers:
                        tasks.append(send_property_email(prop, broker, fallback_email, prop["image_url"]))
                else:
                    # No brokers - send to fallback email once
                    tasks.append(send_property_email(prop, {}, fallback_email, prop["image_url"]))

            await asyncio.gather(*tasks)

        return {"status": "success", "data": result}

    finally:
        if tmp_path and os.path.exists(tmp_path):
            os.remove(tmp_path)


@app.get("/api/email_logs")
async def get_email_logs():
    return load_json(EMAIL_LOG_FILE)

@app.post("/api/contact-broker")
async def contact_broker(data: ContactBrokerRequest):
    try:
        fallback_email = os.getenv("FALLBACK_EMAIL", "shah70099053@gmail.com")
        email_id = f"manual-{datetime.utcnow().timestamp()}"
        subject = f"Message Regarding Property: {data.propertyTitle}"
        body = f"""Dear {data.brokerName},

You have received a new message regarding the property "{data.propertyTitle}".

Message:
{data.message}

Regards,
Real Estate Contact Bot
"""

        # Actually send the email
        await asyncio.to_thread(send_email, fallback_email, subject, body)

        # Log the email
        await add_sent_email_log(
            email_id=email_id,
            to_email=fallback_email,
            subject=subject,
            body=data.message,
        )

        return {"message": f"Message successfully sent to {data.brokerName}"}

    except Exception as e:
        logger.error(f"Failed to send contact message to {data.brokerEmail}: {e}")
        raise HTTPException(status_code=500, detail="Failed to send message. Please try again.")
    
class AnalyzeRequest(BaseModel):
    title: str
    property_data: dict

def compare_property_data(old_data: Dict[str, Any], analyzed_reply: Dict[str, Any]) -> Dict[str, Any]:
    changes = {}
    messages = []
    latest_data = old_data.copy()

    # Handle rent changes
    new_rent_info = analyzed_reply.get("proposed_rent_change", {})
    if new_rent_info:
        pct = new_rent_info.get("percentage_increase", 0)
        add_charge = new_rent_info.get("additional_charge", 0)

        try:
            old_rent = float(re.sub(r"[^\d.]", "", str(old_data.get("rent", 0))))
            updated_rent = round(old_rent * (1 + pct / 100) + add_charge, 2)
            latest_data["rent"] = updated_rent
            changes["rent"] = {
                "from": old_rent,
                "to": updated_rent,
                "reason": f"Dealer proposed {pct}% increase + ₹{add_charge} extra"
            }
            messages.append(f"Rent updated from ₹{old_rent} to ₹{updated_rent} (↑ {pct}% + ₹{add_charge})")
        except Exception as e:
            messages.append("Failed to parse rent info")

    # Handle status change
    old_status = old_data.get("status", "").strip().lower()
    new_status = analyzed_reply.get("status", "").strip().lower()
    if new_status and new_status != old_status:
        latest_data["status"] = new_status
        changes["status"] = {
            "from": old_status,
            "to": new_status
        }
        messages.append(f"Status changed from '{old_status}' to '{new_status}'")

    # Availability notes
    old_notes = old_data.get("availability_notes", "").strip()
    new_notes = analyzed_reply.get("availability_notes", "").strip()
    if new_notes and new_notes != old_notes:
        latest_data["availability_notes"] = new_notes
        changes["availability_notes"] = {
            "from": old_notes,
            "to": new_notes
        }
        messages.append("Availability notes were updated.")

    # Suggestion logic (basic)
    suggestion = "Buy"
    if "rent" in changes and changes["rent"]["to"] > float(re.sub(r"[^\d.]", "", str(old_data.get("rent", 0)))) * 1.3:
        suggestion = "Don't buy — rent increased too much"
    elif latest_data.get("status", "") in ["unavailable", "not available"]:
        suggestion = "Don't buy — not available"

    latest_data["changes"] = changes
    latest_data["suggestion"] = suggestion

    return {
        "latest_data": latest_data,
        "changes": changes,
        "summary": messages,
        "suggestion": suggestion
    }


@app.post("/api/analyze-dealer-replies")
async def analyze_dealer_replies_api(req: AnalyzeRequest):
    try:
        service = get_gmail_service()
        title_lower = req.title.lower()
        query = f'in:inbox subject:"{title_lower}" OR body:"{title_lower}"'

        max_retries = 3
        retry_count = 0
        emails = []

        while retry_count < max_retries:
            try:
                emails = await fetch_recent_reply_emails(service, query=query)
                if emails:
                    break
            except Exception:
                retry_count += 1
                if retry_count < max_retries:
                    await asyncio.sleep(1)
                continue

        if emails:
            for email in emails:
                try:
                    subject = extract_subject_from_email(email).lower()
                    body = extract_email_body(email).lower()

                    if title_lower in subject or title_lower in body:
                        result = await analyze_dealer_reply(req.property_data, body)
                        updated_data = req.property_data.copy()
                        # Map AI/summary keys to property keys
                        updated_data["rent"] = result.get("updated_rent") or result.get("rent") or req.property_data.get("rent")
                        updated_data["available_sf"] = result.get("updated_available_sf") or result.get("available_space") or req.property_data.get("available_sf")
                        updated_data["status"] = result.get("status") or req.property_data.get("status")
                        updated_data["notes"] = result.get("notes") or req.property_data.get("notes")

                        comparison = {
                            "latest_data": updated_data,
                            "changes": {
                                "rent": {
                                    "from": req.property_data.get("rent", "Unknown"),
                                    "to": updated_data["rent"],
                                    "reason": "Updated by dealer"
                                },
                                "available_sf": {
                                    "from": req.property_data.get("available_sf", "Unknown"),
                                    "to": updated_data["available_sf"],
                                    "reason": "Updated by dealer"
                                },
                                "status": {
                                    "from": req.property_data.get("status", "Unknown"),
                                    "to": updated_data["status"],
                                    "reason": "Updated by dealer"
                                }
                            },
                            "summary": [
                                f"Rent updated from {req.property_data.get('rent', 'Unknown')} to {updated_data['rent']}",
                                f"Available space updated from {req.property_data.get('available_sf', 'Unknown')} to {updated_data['available_sf']}",
                                f"Status updated from {req.property_data.get('status', 'Unknown')} to {updated_data['status']}"
                            ],
                            "suggestion": "Buy",
                            "negotiation_summary": {
                                "status": "In Progress",
                                "key_points": [
                                    f"Rent: {updated_data['rent']}",
                                    f"Available Space: {updated_data['available_sf']}",
                                    f"Status: {updated_data['status']}"
                                ],
                                "next_steps": [result.get("next_steps", "Monitor for updates")]
                            }
                        }
                        return {
                            "status": "success",
                            "source": "email_match",
                            "title": req.title,
                            "summary": result,
                            "comparison": comparison
                        }
                except Exception:
                    break

        # Agar koi bhi error ya match na mile toh old data bhejo
        comparison = {
            "latest_data": req.property_data.copy(),
            "changes": {},
            "summary": [],
            "suggestion": "Buy",
            "negotiation_summary": {
                "status": "No Updates",
                "key_points": [],
                "next_steps": []
            }
        }
        return {
            "status": "success",
            "source": "original_data",
            "summary": req.property_data,
            "comparison": comparison
        }
    except Exception:
        comparison = {
            "latest_data": req.property_data.copy(),
            "changes": {},
            "summary": [],
            "suggestion": "Buy",
            "negotiation_summary": {
                "status": "No Updates",
                "key_points": [],
                "next_steps": []
            }
        }
        return {
            "status": "success",
            "source": "original_data",
            "summary": req.property_data,
            "comparison": comparison
        }
    

class EmailHistoryRequest(BaseModel):
    title: str
    address: str

@app.post("/api/get-email-history")
async def get_email_history(req: EmailHistoryRequest):
    try:
        query = f'{req.title} {req.address}'
        service = get_gmail_service()
        user_email = "ramrattan099.com"  # Set your actual email here to detect sent/received
        raw_conversations = await asyncio.to_thread(fetch_reply_details, service, query, user_email)

        return {
            "status": "success",
            "count": len(raw_conversations),
            "conversations": raw_conversations
        }

    except Exception as e:
        logger.error(f"Error fetching email history: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch email history.")
