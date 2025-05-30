import os
import fitz  # PyMuPDF
import tempfile
import json
import re
from uuid import uuid4
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from azure.core.credentials import AzureKeyCredential
from autogen_agentchat.agents import AssistantAgent
from autogen_ext.models.azure import AzureAIChatCompletionClient
from autogen_agentchat.base import TaskResult
from dotenv import load_dotenv

# --- Setup ---
STATIC_IMAGE_DIR = "static"
os.makedirs(STATIC_IMAGE_DIR, exist_ok=True)

load_dotenv()

AZURE_ENDPOINT = "https://models.inference.ai.azure.com"
AZURE_TOKEN = os.getenv("GITHUB_TOKEN")
if not AZURE_TOKEN:
    raise EnvironmentError("GITHUB_TOKEN not set.")

# --- FastAPI App ---
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # loosen for dev only
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/images", StaticFiles(directory=STATIC_IMAGE_DIR), name="images")

# --- Azure AI Setup ---
client = AzureAIChatCompletionClient(
    model="gpt-4o-mini",
    endpoint=AZURE_ENDPOINT,
    credential=AzureKeyCredential(AZURE_TOKEN),
    model_info={
        "json_output": True,
        "function_calling": True,
        "vision": True,
        "family": "unknown",
    },
)

property_extractor = AssistantAgent(
    "property_extractor",
    model_client=client,
    system_message="""
You are a real estate data extractor. Given text from a commercial property listing document, extract structured JSON:
- title
- address
- submarket
- property_type
- built_year
- size_sf
- available_sf
- rent
- status
- brokers (list of name + phone)
- notes

Return an array of JSON objects. Only return valid JSON.
""",
)


# --- PDF Processing ---
def extract_pdf_text(file_path: str) -> str:
    doc = fitz.open(file_path)
    return "".join([page.get_text() for page in doc])


def extract_property_images_from_pdf(file_path: str):
    doc = fitz.open(file_path)
    property_images = []
    seen_xrefs = set()

    for page_num in range(len(doc)):
        for img_index, img in enumerate(doc[page_num].get_images(full=True)):
            xref = img[0]
            if xref in seen_xrefs:
                continue
            seen_xrefs.add(xref)

            base_image = doc.extract_image(xref)
            width = base_image.get("width", 0)
            height = base_image.get("height", 0)
            filesize = len(base_image["image"])
            ext = base_image["ext"]
            aspect_ratio = width / height if height else 0

            if (
                width < 150 or height < 130 or
                filesize < 8 * 1024 or
                not (1.2 <= aspect_ratio <= 4.0)
            ):
                continue

            filename = f"{uuid4().hex}_p{page_num + 1}.{ext}"
            filepath = os.path.join(STATIC_IMAGE_DIR, filename)
            with open(filepath, "wb") as f:
                f.write(base_image["image"])
            property_images.append({
                "page": page_num + 1,
                "filename": filename,
                "filepath": filepath,
                "size": filesize,
                "width": width,
                "height": height,
                "url": f"/images/{filename}",
            })

    # Sort by page number and image size (descending)
    property_images.sort(key=lambda x: (x["page"], -x["size"]))
    return property_images


# --- AI Extraction ---
async def run_property_extraction(text: str):
    result = None
    async for message in property_extractor.run_stream(task=text):
        if isinstance(message, TaskResult):
            break
        else:
            try:
                cleaned = re.sub(r"^```json\s*|\s*```$", "", message.content.strip(), flags=re.DOTALL)
                result = json.loads(cleaned)
            except Exception as e:
                result = {
                    "error": "JSON parse error",
                    "details": str(e),
                    "raw": message.content
                }
    return result


# --- Endpoint ---
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

        # Attach images
        if isinstance(result, list):
            for i, prop in enumerate(result):
                prop["image_url"] = images[i]["url"] if i < len(images) else None
            if len(result) != len(images):
                print(f"⚠️ Mismatch: {len(result)} properties vs {len(images)} images.")
        else:
            print("⚠️ AI returned non-list result:", result)

        return {"status": "success", "data": result}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    finally:
        if tmp_path and os.path.exists(tmp_path):
            os.remove(tmp_path)
