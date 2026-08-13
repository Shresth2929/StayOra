from datetime import date
from typing import Optional, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import and_
from models import Booking, Listing


def nights_between(check_in: date, check_out: date) -> int:
    return (check_out - check_in).days


def is_overlapping(existing_check_in: date, existing_check_out: date, new_check_in: date, new_check_out: date) -> bool:
    # Overlap exists unless new_check_out <= existing_check_in OR new_check_in >= existing_check_out
    return not (new_check_out <= existing_check_in or new_check_in >= existing_check_out)


def listing_is_available(db: Session, listing_id: int, new_check_in: date, new_check_out: date) -> bool:
    # Find any confirmed booking for the listing that overlaps
    q = db.query(Booking).filter(Booking.listing_id == listing_id, Booking.status == "CONFIRMED")
    for b in q.all():
        if is_overlapping(b.check_in, b.check_out, new_check_in, new_check_out):
            return False
    return True


def calculate_price_for_booking(listing: Listing, nights: int) -> Tuple[int, int, int]:
    # simple fee model: cleaning flat 500, service 5% of subtotal (rounded)
    nightly = int(listing.price_per_night)
    subtotal = nightly * nights
    cleaning_fee = 500
    service_fee = int(round(subtotal * 0.05))
    total = subtotal + cleaning_fee + service_fee
    return cleaning_fee, service_fee, total


def create_booking(db: Session, listing: Listing, guest_id: int, check_in: date, check_out: date, guests: int) -> Booking:
    nights = nights_between(check_in, check_out)
    cleaning_fee, service_fee, total = calculate_price_for_booking(listing, nights)
    booking = Booking(
        listing_id=listing.id,
        guest_id=guest_id,
        check_in=check_in,
        check_out=check_out,
        guests=guests,
        nights=nights,
        nightly_price=listing.price_per_night,
        cleaning_fee=cleaning_fee,
        service_fee=service_fee,
        total_price=total,
        status="CONFIRMED",
    )
    db.add(booking)
    db.commit()
    db.refresh(booking)
    return booking
