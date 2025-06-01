import os
import tempfile
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from dotenv import load_dotenv

from property_extractor import extract_pdf_text, extract_property_images_from_pdf, run_property_extraction
from email_agent import send_interest_email

load_dotenv()

app = FastAPI()

STATIC_IMAGE_DIR = "static"
os.makedirs(STATIC_IMAGE_DIR, exist_ok=True)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/images", StaticFiles(directory=STATIC_IMAGE_DIR), name="images")

@app.post("/extract_data")
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
        images = extract_property_images_from_pdf(tmp_path)
        result = await run_property_extraction(pdf_text)

        if isinstance(result, list):
            for i, prop in enumerate(result):
                prop["image_url"] = images[i]["url"] if i < len(images) else None

            # Send interest email for the first property only
            if len(result) > 0:
                print("[Main] Sending interest email for first property...")
                success = send_interest_email(result[0])
                print(f"[Main] Email sent successfully: {success}")
        else:
            print("⚠️ Extraction result is not a list:", result)

        return {"status": "success", "data": result}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    finally:
        if tmp_path and os.path.exists(tmp_path):
            os.remove(tmp_path)
