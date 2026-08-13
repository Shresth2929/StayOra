from datetime import date, datetime
from pydantic import BaseModel, conint
from typing import Optional


class BookingCreate(BaseModel):
    listing_id: int
    guest_id: int
    check_in: date
    check_out: date
    guests: conint(gt=0)


class BookingOut(BaseModel):
    id: int
    listing_id: int
    listing_title: Optional[str]
    listing_city: Optional[str]
    guest_id: int
    check_in: date
    check_out: date
    guests: int
    nights: int
    nightly_price: int
    cleaning_fee: int
    service_fee: int
    total_price: int
    status: str
    created_at: datetime

    class Config:
        orm_mode = True
