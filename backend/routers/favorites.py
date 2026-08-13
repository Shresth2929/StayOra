from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import Optional
from database import get_db
from models import Favorite, Listing, User

router = APIRouter()


@router.get("/", response_model=dict)
def get_favorites(user_id: Optional[int] = Query(None), db: Session = Depends(get_db)):
    if not user_id:
        raise HTTPException(status_code=422, detail="user_id required")
    favs = db.query(Favorite).filter(Favorite.user_id == user_id).all()
    out = []
    for f in favs:
        listing = db.query(Listing).filter(Listing.id == f.listing_id).first()
        out.append({
            "id": f.id,
            "listing_id": f.listing_id,
            "listing_title": listing.title if listing else None,
            "created_at": f.created_at,
        })
    return {"data": out}


@router.post("/", status_code=status.HTTP_201_CREATED)
def add_favorite(user_id: int = Query(...), listing_id: int = Query(...), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    listing = db.query(Listing).filter(Listing.id == listing_id).first()
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")
    existing = db.query(Favorite).filter(Favorite.user_id == user_id, Favorite.listing_id == listing_id).first()
    if existing:
        return {"message": "Already favorited"}
    fav = Favorite(user_id=user_id, listing_id=listing_id)
    db.add(fav)
    db.commit()
    db.refresh(fav)
    return {"id": fav.id, "listing_id": fav.listing_id}


@router.delete("/{listing_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_favorite(listing_id: int, user_id: int = Query(...), db: Session = Depends(get_db)):
    fav = db.query(Favorite).filter(Favorite.user_id == user_id, Favorite.listing_id == listing_id).first()
    if not fav:
        raise HTTPException(status_code=404, detail="Favorite not found")
    db.delete(fav)
    db.commit()
    return {}
