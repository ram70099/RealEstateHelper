import os
import json
import re
from dotenv import load_dotenv
from azure.core.credentials import AzureKeyCredential
from autogen_agentchat.agents import AssistantAgent
from autogen_ext.models.azure import AzureAIChatCompletionClient
from autogen_agentchat.base import TaskResult
from utils import logger

load_dotenv()

AZURE_ENDPOINT = "https://models.inference.ai.azure.com"
AZURE_TOKEN = os.getenv("GITHUB_TOKEN")
if not AZURE_TOKEN:
    raise EnvironmentError("GITHUB_TOKEN not set in .env file.")

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

image_selector_agent = AssistantAgent(
    "image_selector_agent",
    model_client=client,
    system_message="""
You are a smart image selector for real estate PDFs.
Given a list of images with metadata (page number, width, height, filesize, aspect ratio, url),
select only images that clearly show property-related content (e.g., building photos, floor plans).
Return only the list of URLs for the selected images as a JSON array.

Example input:
[
  {"page": 1, "width": 1200, "height": 800, "filesize": 350000, "aspect_ratio": 1.5, "url": "/images/abc.png"},
  {"page": 2, "width": 200, "height": 150, "filesize": 5000, "aspect_ratio": 1.3, "url": "/images/thumb.png"}
]

Example output:
["/images/abc.png"]
""",
)

async def run_property_extraction(text: str):
    result = None
    async for message in property_extractor.run_stream(task=text):
        if isinstance(message, TaskResult):
            break
        else:
            try:
                json_blocks = re.findall(r"```json(.*?)```", message.content, flags=re.DOTALL)
                json_text = json_blocks[-1].strip() if json_blocks else message.content.strip()
                result = json.loads(json_text)
            except Exception as e:
                logger.error(f"JSON parse error: {e} ")
                result = {
                    "error": "JSON parse error",
                    "details": str(e),
                    "raw": message.content
                }
    return result

async def select_property_images_with_agent(images_metadata: list):
    """
    Pass image metadata list to AI agent for selecting property images.
    Returns list of selected image URLs.
    """
    prompt = json.dumps(images_metadata, indent=2)
    selected_urls = []

    async for message in image_selector_agent.run_stream(task=prompt):
        if isinstance(message, TaskResult):
            break
        else:
            try:
                # The agent returns JSON array of URLs
                json_blocks = re.findall(r"```json(.*?)```", message.content, flags=re.DOTALL)
                json_text = json_blocks[-1].strip() if json_blocks else message.content.strip()
                selected_urls = json.loads(json_text)
            except Exception as e:
                logger.error(f"Image selector JSON parse error: {e} ")
                selected_urls = []

    return selected_urls
