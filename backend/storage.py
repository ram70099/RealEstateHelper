import json
import os
from asyncio import Lock

STORAGE_FILE = "storage.json"
lock = Lock()

def _initialize_storage():
    if not os.path.exists(STORAGE_FILE):
        with open(STORAGE_FILE, "w") as f:
            json.dump({"email_logs": [], "replies": []}, f)

async def read_storage():
    async with lock:
        with open(STORAGE_FILE, "r") as f:
            return json.load(f)

async def write_storage(data):
    async with lock:
        with open(STORAGE_FILE, "w") as f:
            json.dump(data, f, indent=2)

async def add_email_log(log):
    data = await read_storage()
    data["email_logs"].append(log)
    await write_storage(data)

async def add_reply_log(reply):
    data = await read_storage()
    data["replies"].append(reply)
    await write_storage(data)

async def get_all_logs():
    return await read_storage()
