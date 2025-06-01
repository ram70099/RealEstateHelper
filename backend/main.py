import os
import tempfile
import json
from fastapi import FastAPI, UploadFile, File, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from extraction.pdf_utils import extract_pdf_text, extract_property_images_from_pdf
from extraction.ai_extractor import run_property_extraction
from utils import logger, send_email, load_json, save_json, compare_property_data
from models import PropertyResponse
from dotenv import load_dotenv
from ws_manager import manager
import asyncio
from datetime import datetime

load_dotenv()

STATIC_IMAGE_DIR = "static"
os.makedirs(STATIC_IMAGE_DIR, exist_ok=True)

EMAIL_LOG_FILE = "data/email_logs.json"
REPLY_LOG_FILE = "data/reply_logs.json"
os.makedirs("data", exist_ok=True)

# Initialize empty JSON files if not exists
for path in [EMAIL_LOG_FILE, REPLY_LOG_FILE]:
    if not os.path.exists(path):
        with open(path, "w") as f:
            json.dump([], f)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # TODO: restrict in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/images", StaticFiles(directory=STATIC_IMAGE_DIR), name="images")

async def get_new_dealer_replies_somehow():
    # For demo/testing: simulate a dealer reply every poll
    from random import randint
    import time
    # This simulates one new reply randomly
    if randint(0, 1) == 1:
        return [{
            "id": f"reply-{int(time.time() * 1000)}",
            "from": "dealer@example.com",
            "subject": "Re: Interest in Property",
            "body": "This property is still available. Price increased by 5%.",
            "timestamp": datetime.utcnow().isoformat()
        }]
    return []

# Helpers for email and reply logs
async def add_sent_email_log(email_id, to_email, subject, body, status="sent"):
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
    save_json(EMAIL_LOG_FILE, logs)

async def add_dealer_reply_log(reply_id, from_email, subject, body, timestamp=None):
    logs = load_json(REPLY_LOG_FILE)
    logs.append({
        "id": reply_id,
        "from": from_email,
        "to": "Agent",
        "subject": subject,
        "body": body,
        "status": "replied",
        "timestamp": timestamp or datetime.utcnow().isoformat()
    })
    save_json(REPLY_LOG_FILE, logs)

@app.post("/extract_data", response_model=PropertyResponse)
async def extract_data(pdf: UploadFile = File(...)):
    if pdf.content_type != "application/pdf":
        raise HTTPException(status_code=400, detail="File must be a PDF")

    tmp_path = None
    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp:
            tmp_path = tmp.name
            tmp.write(await pdf.read())

        logger.info(f"PDF saved to: {tmp_path}")

        pdf_text = extract_pdf_text(tmp_path)
        images = extract_property_images_from_pdf(tmp_path, STATIC_IMAGE_DIR)
        result = await run_property_extraction(pdf_text)
        fallback_email = os.getenv("FALLBACK_EMAIL", "fallback@example.com")

        if isinstance(result, list):
            for i, prop in enumerate(result):
                prop["id"] = str(i + 1)
                prop["image_url"] = images[i]["url"] if i < len(images) else None
                dealer_email = prop.get("dealer_email", fallback_email)

                subject = f"Interest in Property: {prop.get('title', 'N/A')}"
                body = f"""Dear Dealer,

We are interested in the following property:

Title: {prop.get('title', 'N/A')}
Location: {prop.get('location', 'N/A')}
OPD Price: ₹{prop.get('price', 'N/A')}

Please share your best price or offer details.

Regards,
Real Estate Agent Bot
"""

                try:
                    send_email(dealer_email, subject, body)
                    prop["email_sent"] = True
                    prop["email_error"] = None
                    await add_sent_email_log(prop["id"], dealer_email, subject, body)
                except Exception as e:
                    logger.error(f"Email failed: {e}")
                    prop["email_sent"] = False
                    prop["email_error"] = str(e)
                    await add_sent_email_log(prop["id"], dealer_email, subject, body, status="failed")

        return {"status": "success", "data": result}

    finally:
        if tmp_path and os.path.exists(tmp_path):
            os.remove(tmp_path)

@app.get("/api/email_logs")
async def get_email_logs():
    return load_json(EMAIL_LOG_FILE)

@app.get("/api/reply_logs")
async def get_reply_logs():
    return load_json(REPLY_LOG_FILE)

@app.websocket("/ws/dealer_replies")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)

async def poll_dealer_replies():
    while True:
        try:
            new_replies = await get_new_dealer_replies_somehow()
            email_logs = load_json(EMAIL_LOG_FILE)

            for reply in new_replies:
                await add_dealer_reply_log(reply["id"], reply["from"], reply["subject"], reply["body"], reply["timestamp"])

                # Compare reply with original sent data
                sent_email = next((e for e in email_logs if e["to"] == reply["from"]), None)
                if sent_email:
                    comparison = compare_property_data(sent_email["body"], reply["body"])
                    await manager.broadcast({
                        "type": "dealer_reply",
                        "reply": reply,
                        "analysis": comparison
                    })
        except Exception as e:
            logger.error(f"Polling error: {e}")

        await asyncio.sleep(15)

@app.on_event("startup")
async def startup_event():
    asyncio.create_task(poll_dealer_replies())
