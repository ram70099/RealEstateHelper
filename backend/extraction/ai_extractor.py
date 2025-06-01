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

async def run_property_extraction(text: str):
    result = None
    async for message in property_extractor.run_stream(task=text):
        if isinstance(message, TaskResult):
            break
        else:
            try:
                # Extract JSON block
                json_blocks = re.findall(r"```json(.*?)```", message.content, flags=re.DOTALL)
                json_text = json_blocks[-1].strip() if json_blocks else message.content.strip()
                result = json.loads(json_text)
            except Exception as e:
                logger.error(f"JSON parse error: {e} | Content: {message.content}")
                result = {
                    "error": "JSON parse error",
                    "details": str(e),
                    "raw": message.content
                }
    return result
