from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional
from database import get_db
from models import Listing, Booking

router = APIRouter()


@router.get("/bookings", response_model=dict)
def get_host_bookings(host_id: Optional[int] = Query(None), db: Session = Depends(get_db)):
    if not host_id:
        raise HTTPException(status_code=422, detail="host_id required")
    # find listings for host
    listings = db.query(Listing).filter(Listing.host_id == host_id).all()
    listing_ids = [l.id for l in listings]
    if not listing_ids:
        return {"data": []}
    items = db.query(Booking).filter(Booking.listing_id.in_(listing_ids)).order_by(Booking.created_at.desc()).all()
    out = []
    for b in items:
        listing = next((l for l in listings if l.id == b.listing_id), None)
        out.append(
            {
                "id": b.id,
                "listing_id": b.listing_id,
                "listing_title": listing.title if listing else None,
                "guest_id": b.guest_id,
                "check_in": b.check_in,
                "check_out": b.check_out,
                "guests": b.guests,
                "nights": b.nights,
                "nightly_price": b.nightly_price,
                "cleaning_fee": b.cleaning_fee,
                "service_fee": b.service_fee,
                "total_price": b.total_price,
                "status": b.status,
                "created_at": b.created_at,
            }
        )
    return {"data": out}


@router.get("/listings", response_model=dict)
def get_host_listings(host_id: Optional[int] = Query(None), db: Session = Depends(get_db)):
    if not host_id:
        raise HTTPException(status_code=422, detail="host_id required")
    listings = db.query(Listing).filter(Listing.host_id == host_id).all()
    out = []
    for l in listings:
        images = [img.image_url for img in sorted(l.images, key=lambda x: x.position)]
        out.append(
            {
                "id": l.id,
                "host_id": l.host_id,
                "title": l.title,
                "city": l.city,
                "price_per_night": l.price_per_night,
                "property_type": l.property_type,
                "max_guests": l.max_guests,
                "images": images,
            }
        )
    return {"data": out}


@router.get("/stats", response_model=dict)
def get_host_stats(host_id: Optional[int] = Query(None), db: Session = Depends(get_db)):
    if not host_id:
        raise HTTPException(status_code=422, detail="host_id required")
    listings = db.query(Listing).filter(Listing.host_id == host_id).all()
    listing_ids = [l.id for l in listings]
    listing_count = len(listings)
    if not listing_ids:
        return {"listing_count": 0, "booking_count": 0, "confirmed_booking_count": 0, "total_booking_value": 0}
    bookings = db.query(Booking).filter(Booking.listing_id.in_(listing_ids)).all()
    booking_count = len(bookings)
    confirmed_booking_count = len([b for b in bookings if b.status == "CONFIRMED"])
    total_booking_value = sum(b.total_price or 0 for b in bookings)
    return {
        "listing_count": listing_count,
        "booking_count": booking_count,
        "confirmed_booking_count": confirmed_booking_count,
        "total_booking_value": total_booking_value,
    }
