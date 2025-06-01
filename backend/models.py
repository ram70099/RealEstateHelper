from pydantic import BaseModel
from typing import List, Optional

class Broker(BaseModel):
    name: str
    phone: str

class Property(BaseModel):
    id: str
    title: str
    address: str
    submarket: str
    property_type: str
    built_year: Optional[int]
    size_sf: int
    available_sf: str
    rent: str
    status: str
    brokers: List[Broker]
    notes: Optional[str]
    image_url: str
    email_sent: bool
    email_error: Optional[str]
    location: str          # <--- Required field causing the error
    price: str             # <--- Required field causing the error

class ExtractDataResponse(BaseModel):
    data: List[Property]


class PropertyResponse(BaseModel):
    status: str
    data: List[Property]
