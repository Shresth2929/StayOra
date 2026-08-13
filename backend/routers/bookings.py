from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from typing import Optional, List
from database import get_db
from schemas.booking import BookingCreate, BookingOut
from services.booking_service import listing_is_available, create_booking
from models import Listing, User, Booking
from datetime import date

router = APIRouter()


@router.post("/", response_model=BookingOut, status_code=status.HTTP_201_CREATED)
def post_booking(payload: BookingCreate, db: Session = Depends(get_db)):
    # validation
    if payload.check_out <= payload.check_in:
        raise HTTPException(status_code=422, detail="check_out must be after check_in")

    listing = db.query(Listing).filter(Listing.id == payload.listing_id).first()
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")

    guest = db.query(User).filter(User.id == payload.guest_id).first()
    if not guest:
        raise HTTPException(status_code=404, detail="Guest user not found")

    if payload.guests <= 0:
        raise HTTPException(status_code=422, detail="guests must be > 0")
    if payload.guests > listing.max_guests:
        raise HTTPException(status_code=422, detail="Guest count exceeds listing capacity")

    # availability
    available = listing_is_available(db, listing.id, payload.check_in, payload.check_out)
    if not available:
        raise HTTPException(status_code=409, detail="Booking dates unavailable")

    # create booking and compute prices server-side
    booking = create_booking(db, listing, payload.guest_id, payload.check_in, payload.check_out, payload.guests)

    return BookingOut(
        id=booking.id,
        listing_id=booking.listing_id,
        listing_title=listing.title,
        listing_city=listing.city,
        guest_id=booking.guest_id,
        check_in=booking.check_in,
        check_out=booking.check_out,
        guests=booking.guests,
        nights=booking.nights,
        nightly_price=booking.nightly_price,
        cleaning_fee=booking.cleaning_fee,
        service_fee=booking.service_fee,
        total_price=booking.total_price,
        status=booking.status,
        created_at=booking.created_at,
    )


@router.get("/", response_model=dict)
def get_bookings(guest_id: Optional[int] = Query(None), db: Session = Depends(get_db)):
    q = db.query(Booking)
    if guest_id:
        q = q.filter(Booking.guest_id == guest_id)
    items = q.order_by(Booking.created_at.desc()).all()
    out = []
    for b in items:
        listing = db.query(Listing).filter(Listing.id == b.listing_id).first()
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


@router.get("/{booking_id}", response_model=BookingOut)
def get_booking(booking_id: int, db: Session = Depends(get_db)):
    b = db.query(Booking).filter(Booking.id == booking_id).first()
    if not b:
        raise HTTPException(status_code=404, detail="Booking not found")
    listing = db.query(Listing).filter(Listing.id == b.listing_id).first()
    return BookingOut(
        id=b.id,
        listing_id=b.listing_id,
        listing_title=listing.title if listing else None,
        listing_city=listing.city if listing else None,
        guest_id=b.guest_id,
        check_in=b.check_in,
        check_out=b.check_out,
        guests=b.guests,
        nights=b.nights,
        nightly_price=b.nightly_price,
        cleaning_fee=b.cleaning_fee,
        service_fee=b.service_fee,
        total_price=b.total_price,
        status=b.status,
        created_at=b.created_at,
    )

