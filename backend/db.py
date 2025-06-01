# db.py
import os
from motor.motor_asyncio import AsyncIOMotorClient

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
client = AsyncIOMotorClient(MONGO_URI)
db = client["real_estate_db"]

properties_collection = db["properties"]
emails_collection = db["emails_sent"]
replies_collection = db["dealer_replies"]
comparisons_collection = db["comparisons"]
