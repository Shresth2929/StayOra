from typing import List, Optional
from pydantic import BaseModel, Field, conint
from datetime import datetime


class ListingImageSchema(BaseModel):
    image_url: str
    position: Optional[int] = 0


class AmenitySchema(BaseModel):
    name: str


class ListingBase(BaseModel):
    title: str
    description: Optional[str]
    location: Optional[str]
    city: Optional[str]
    country: Optional[str]
    price_per_night: conint(gt=0)
    property_type: Optional[str]
    max_guests: conint(gt=0)


class ListingCreate(ListingBase):
    host_id: int
    images: Optional[List[str]] = []
    amenities: Optional[List[str]] = []


class ListingUpdate(BaseModel):
    title: Optional[str]
    description: Optional[str]
    location: Optional[str]
    city: Optional[str]
    country: Optional[str]
    price_per_night: Optional[conint(gt=0)]
    property_type: Optional[str]
    max_guests: Optional[conint(gt=0)]
    images: Optional[List[str]]
    amenities: Optional[List[str]]


class ListingOut(BaseModel):
    id: int
    host_id: int
    title: str
    description: Optional[str]
    location: Optional[str]
    city: Optional[str]
    country: Optional[str]
    price_per_night: int
    property_type: Optional[str]
    max_guests: int
    images: List[str] = []
    amenities: List[str] = []
    average_rating: Optional[float] = None
    reviews_count: int = 0
    created_at: Optional[datetime]

    class Config:
        orm_mode = True
