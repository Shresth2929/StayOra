from pydantic import BaseModel, conint
from typing import Optional
from datetime import datetime


class ReviewCreate(BaseModel):
    listing_id: int
    user_id: int
    rating: conint(ge=1, le=5)
    comment: Optional[str]


class ReviewOut(BaseModel):
    id: int
    listing_id: int
    user_id: int
    rating: int
    comment: Optional[str]
    created_at: datetime

    class Config:
        orm_mode = True
