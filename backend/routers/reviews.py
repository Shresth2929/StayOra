from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from schemas.review import ReviewCreate, ReviewOut
from models import Review, Listing, User

router = APIRouter()


@router.get("/listings/{listing_id}/reviews", response_model=List[ReviewOut])
def get_reviews(listing_id: int, db: Session = Depends(get_db)):
    listing = db.query(Listing).filter(Listing.id == listing_id).first()
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")
    reviews = db.query(Review).filter(Review.listing_id == listing_id).order_by(Review.created_at.desc()).all()
    return reviews


@router.post("/reviews", response_model=ReviewOut, status_code=status.HTTP_201_CREATED)
def post_review(payload: ReviewCreate, db: Session = Depends(get_db)):
    # validate listing and user
    listing = db.query(Listing).filter(Listing.id == payload.listing_id).first()
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")
    user = db.query(User).filter(User.id == payload.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    review = Review(listing_id=payload.listing_id, user_id=payload.user_id, rating=payload.rating, comment=payload.comment)
    db.add(review)
    db.commit()
    db.refresh(review)
    return review
