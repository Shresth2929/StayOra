from typing import List, Optional, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import func, and_, distinct
from models import Listing, Amenity, ListingAmenity, ListingImage, Review


def get_listing_by_id(db: Session, listing_id: int) -> Optional[Listing]:
    return db.query(Listing).filter(Listing.id == listing_id).first()


def create_or_get_amenity(db: Session, name: str) -> Amenity:
    name = name.strip()
    amen = db.query(Amenity).filter(func.lower(Amenity.name) == name.lower()).first()
    if amen:
        return amen
    amen = Amenity(name=name)
    db.add(amen)
    db.commit()
    db.refresh(amen)
    return amen


def apply_filters(query, params: dict):
    # params may include: location, min_price, max_price, property_type, guests
    if params.get("location"):
        loc = params["location"].lower()
        query = query.filter(
            func.lower(Listing.city).contains(loc) | func.lower(Listing.location).contains(loc) | func.lower(Listing.country).contains(loc)
        )
    if params.get("min_price") is not None:
        query = query.filter(Listing.price_per_night >= int(params["min_price"]))
    if params.get("max_price") is not None:
        query = query.filter(Listing.price_per_night <= int(params["max_price"]))
    if params.get("property_type"):
        query = query.filter(Listing.property_type == params["property_type"])
    if params.get("guests") is not None:
        query = query.filter(Listing.max_guests >= int(params["guests"]))
    return query


def get_listings(
    db: Session,
    location: Optional[str] = None,
    min_price: Optional[int] = None,
    max_price: Optional[int] = None,
    property_type: Optional[str] = None,
    guests: Optional[int] = None,
    amenities: Optional[List[str]] = None,
    page: int = 1,
    limit: int = 12,
) -> Tuple[List[Listing], int]:
    query = db.query(Listing)
    params = {
        "location": location,
        "min_price": min_price,
        "max_price": max_price,
        "property_type": property_type,
        "guests": guests,
    }
    query = apply_filters(query, params)

    if amenities:
        # filter listings that have all listed amenities
        names = [a.strip() for a in amenities if a.strip()]
        if names:
            subq = (
                db.query(ListingAmenity.listing_id)
                .join(Amenity, Amenity.id == ListingAmenity.amenity_id)
                .filter(func.lower(Amenity.name).in_([n.lower() for n in names]))
                .group_by(ListingAmenity.listing_id)
                .having(func.count(distinct(ListingAmenity.amenity_id)) == len(names))
                .subquery()
            )
            query = query.join(subq, Listing.id == subq.c.listing_id)

    total = query.count()
    page = max(1, page)
    limit = max(1, limit)
    items = query.offset((page - 1) * limit).limit(limit).all()
    return items, total
