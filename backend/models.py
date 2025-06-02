from typing import List, Optional, Union
from pydantic import BaseModel

class Broker(BaseModel):
    name: str
    phone: str

class Property(BaseModel):
    id: str
    title: str
    address: str
    submarket: str
    property_type: str
    built_year: Optional[Union[int, str]] = None  # accept int or string here
    size_sf: int
    available_sf: str  # must be string
    rent: str
    status: str
    brokers: List[Broker]
    notes: Optional[str] = None
    image_url: Optional[str] = None
    email_sent: bool = False
    email_error: Optional[str] = None

class ExtractedDataResponse(BaseModel):
    data: List[Property]

class PropertyResponse(BaseModel):
    status: str
    data: List[Property]
