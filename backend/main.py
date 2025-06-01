import os
import tempfile
import json
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from extraction.pdf_utils import extract_pdf_text, extract_property_images_from_pdf
from extraction.ai_extractor import run_property_extraction
from utils import logger, send_email, load_json, save_json
from models import PropertyResponse
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
    allow_origins=["*"],  # Consider restricting in production
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
    """
    Append a log entry about sent or failed email asynchronously.
    """
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
    # Write updated logs asynchronously
    async with aiofiles.open(EMAIL_LOG_FILE, "w") as f:
        await f.write(json.dumps(logs, indent=2))


async def send_property_email(
    prop: dict,
    fallback_email: str,
    image_url: Optional[str] = None
) -> None:
    """
    Compose and send an email about a property asynchronously.
    If dealer email missing, use fallback_email.
    Log success or failure.
    """
    dealer_email = prop.get("dealer_email") or fallback_email
    subject = f"Interest in Property: {prop.get('title', 'N/A')}"
    body = f"""Dear Dealer,

We are interested in the following property:

Title: {prop.get('title', 'N/A')}
Address: {prop.get('address', 'N/A')}
Rent: ₹{prop.get('rent', 'N/A')}

Please share your best rent or offer details.

Regards,
Real Estate Agent Bot
"""

    try:
        # Run synchronous send_email in thread to avoid blocking
        await asyncio.to_thread(send_email, dealer_email, subject, body)
        prop["email_sent"] = True
        prop["email_error"] = None
        await add_sent_email_log(prop["id"], dealer_email, subject, body)
        logger.info(f"Email sent successfully to {dealer_email} for property {prop['id']}")
    except Exception as e:
        logger.error(f"Email failed to {dealer_email} for property {prop['id']}: {e}")
        prop["email_sent"] = False
        prop["email_error"] = str(e)
        await add_sent_email_log(prop["id"], dealer_email, subject, body, status="failed")


@app.post("/extract_data", response_model=PropertyResponse)
async def extract_data(pdf: UploadFile = File(...)):
    if pdf.content_type != "application/pdf":
        raise HTTPException(status_code=400, detail="File must be a PDF")

    tmp_path = None
    try:
        # Save uploaded file to temp path
        with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp:
            tmp_path = tmp.name
            content = await pdf.read()
            tmp.write(content)

        # Extract text and images from PDF
        pdf_text = extract_pdf_text(tmp_path)
        images = extract_property_images_from_pdf(tmp_path, STATIC_IMAGE_DIR)

        # Extract properties asynchronously using your AI extractor
        result = await run_property_extraction(pdf_text)

        fallback_email = os.getenv("FALLBACK_EMAIL", "fallback@example.com")

        if isinstance(result, list):
            tasks = []
            for i, prop in enumerate(result):
                prop["id"] = str(i + 1)
                prop["image_url"] = images[i]["url"] if i < len(images) else None
                # Convert available_sf to string to match schema
                if "available_sf" in prop:
                    prop["available_sf"] = str(prop["available_sf"])
                # Rename keys if they exist (optional here)
                if "address" in prop:
                    prop["address"] = prop.pop("address")
                if "rent" in prop:
                    prop["rent"] = prop.pop("rent")

                tasks.append(send_property_email(prop, fallback_email, prop["image_url"]))

            # Run all email sends concurrently
            await asyncio.gather(*tasks)

        return {"status": "success", "data": result}

    finally:
        # Clean up temp file safely
        if tmp_path and os.path.exists(tmp_path):
            os.remove(tmp_path)


@app.get("/api/email_logs")
async def get_email_logs():
    """
    Returns the email logs from the JSON file.
    """
    return load_json(EMAIL_LOG_FILE)
