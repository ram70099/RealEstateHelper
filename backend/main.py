import os
import tempfile
import json
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from dealer_reply_ai import analyze_dealer_replies
from extraction.pdf_utils import extract_pdf_text, extract_property_images_from_pdf
from extraction.ai_extractor import run_property_extraction
from utils import logger, send_email, load_json, save_json
from models import PropertyResponse
from models import ContactBrokerRequest
from dotenv import load_dotenv
from datetime import datetime
import aiofiles
import asyncio
from typing import Optional

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
    
@app.get("/api/analyze-dealer-replies")
async def api_analyze_dealer_replies():
    return await analyze_dealer_replies()