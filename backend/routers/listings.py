from fastapi import APIRouter, Depends, HTTPException, Query
from typing import List, Optional
from sqlalchemy.orm import Session
from database import get_db
from services.listing_service import get_listings, get_listing_by_id, create_or_get_amenity
from schemas.listing import ListingCreate, ListingUpdate, ListingOut
from models import Listing, ListingImage, Amenity
from fastapi import status

router = APIRouter()


@router.get("/", response_model=dict)
def list_listings(
    location: Optional[str] = Query(None),
    min_price: Optional[int] = Query(None, alias="min_price"),
    max_price: Optional[int] = Query(None, alias="max_price"),
    property_type: Optional[str] = Query(None),
    guests: Optional[int] = Query(None),
    amenities: Optional[str] = Query(None, description="Comma-separated amenity names"),
    page: int = Query(1, ge=1),
    limit: int = Query(12, ge=1, le=100),
    db: Session = Depends(get_db),
):
    amen_list = [a.strip() for a in amenities.split(",")] if amenities else None
    items, total = get_listings(
        db,
        location=location,
        min_price=min_price,
        max_price=max_price,
        property_type=property_type,
        guests=guests,
        amenities=amen_list,
        page=page,
        limit=limit,
    )

    data = []
    for l in items:
        images = [img.image_url for img in sorted(l.images, key=lambda x: x.position)]
        amenities_out = [a.name for a in l.amenities]
        avg = None
        if l.reviews:
            try:
                avg = round(sum(r.rating for r in l.reviews) / len(l.reviews), 2)
            except Exception:
                avg = None

        data.append(
            {
                "id": l.id,
                "host_id": l.host_id,
                "title": l.title,
                "description": l.description,
                "location": l.location,
                "city": l.city,
                "country": l.country,
                "price_per_night": l.price_per_night,
                "property_type": l.property_type,
                "max_guests": l.max_guests,
                "images": images,
                "amenities": amenities_out,
                "average_rating": avg,
                "reviews_count": len(l.reviews or []),
                "created_at": l.created_at,
            }
        )

    pages = (total + limit - 1) // limit if total else 0
    return {"data": data, "meta": {"total": total, "page": page, "limit": limit, "pages": pages}}


@router.get("/{listing_id}", response_model=ListingOut)
def get_listing(listing_id: int, db: Session = Depends(get_db)):
    l = get_listing_by_id(db, listing_id)
    if not l:
        raise HTTPException(status_code=404, detail="Listing not found")
    images = [img.image_url for img in sorted(l.images, key=lambda x: x.position)]
    amenities_out = [a.name for a in l.amenities]
    avg = None
    if l.reviews:
        avg = round(sum(r.rating for r in l.reviews) / len(l.reviews), 2)

    return {
        "id": l.id,
        "host_id": l.host_id,
        "title": l.title,
        "description": l.description,
        "location": l.location,
        "city": l.city,
        "country": l.country,
        "price_per_night": l.price_per_night,
        "property_type": l.property_type,
        "max_guests": l.max_guests,
        "images": images,
        "amenities": amenities_out,
        "average_rating": avg,
        "reviews_count": len(l.reviews or []),
        "created_at": l.created_at,
    }


@router.post("/", status_code=status.HTTP_201_CREATED, response_model=ListingOut)
def create_listing(payload: ListingCreate, db: Session = Depends(get_db)):
    # basic validation of host existence
    from models import User

    host = db.query(User).filter(User.id == payload.host_id).first()
    if not host:
        raise HTTPException(status_code=400, detail="Host user not found")

    # create listing
    listing = Listing(
        host_id=payload.host_id,
        title=payload.title,
        description=payload.description,
        location=payload.location,
        city=payload.city,
        country=payload.country,
        price_per_night=payload.price_per_night,
        property_type=payload.property_type,
        max_guests=payload.max_guests,
    )
    db.add(listing)
    db.commit()
    db.refresh(listing)

    # images
    pos = 0
    for url in payload.images or []:
        img = ListingImage(listing_id=listing.id, image_url=url, position=pos)
        db.add(img)
        pos += 1

    # amenities
    for name in payload.amenities or []:
        amen = create_or_get_amenity(db, name)
        listing.amenities.append(amen)

    db.commit()
    db.refresh(listing)

    images = [img.image_url for img in sorted(listing.images, key=lambda x: x.position)]
    return {
        "id": listing.id,
        "host_id": listing.host_id,
        "title": listing.title,
        "description": listing.description,
        "location": listing.location,
        "city": listing.city,
        "country": listing.country,
        "price_per_night": listing.price_per_night,
        "property_type": listing.property_type,
        "max_guests": listing.max_guests,
        "images": images,
        "amenities": [a.name for a in listing.amenities],
        "average_rating": None,
        "reviews_count": 0,
        "created_at": listing.created_at,
    }


@router.put("/{listing_id}", response_model=ListingOut)
def update_listing(listing_id: int, payload: ListingUpdate, host_id: int = Query(...), db: Session = Depends(get_db)):
    listing = db.query(Listing).filter(Listing.id == listing_id).first()
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")
    # ownership check (mock auth via host_id)
    if listing.host_id != host_id:
        raise HTTPException(status_code=403, detail="Forbidden: not the listing owner")

    # update scalar fields
    for field, value in payload.__dict__.items():
        if value is None:
            continue
        if field in ["images", "amenities"]:
            continue
        setattr(listing, field, value)

    # update images if provided
    if payload.images is not None:
        # delete existing
        db.query(ListingImage).filter(ListingImage.listing_id == listing.id).delete()
        pos = 0
        for url in payload.images:
            img = ListingImage(listing_id=listing.id, image_url=url, position=pos)
            db.add(img)
            pos += 1

    # update amenities if provided
    if payload.amenities is not None:
        listing.amenities = []
        for name in payload.amenities:
            amen = create_or_get_amenity(db, name)
            listing.amenities.append(amen)

    db.commit()
    db.refresh(listing)

    images = [img.image_url for img in sorted(listing.images, key=lambda x: x.position)]
    avg = None
    if listing.reviews:
        avg = round(sum(r.rating for r in listing.reviews) / len(listing.reviews), 2)

    return {
        "id": listing.id,
        "host_id": listing.host_id,
        "title": listing.title,
        "description": listing.description,
        "location": listing.location,
        "city": listing.city,
        "country": listing.country,
        "price_per_night": listing.price_per_night,
        "property_type": listing.property_type,
        "max_guests": listing.max_guests,
        "images": images,
        "amenities": [a.name for a in listing.amenities],
        "average_rating": avg,
        "reviews_count": len(listing.reviews or []),
        "created_at": listing.created_at,
    }


@router.delete("/{listing_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_listing(listing_id: int, host_id: int = Query(...), db: Session = Depends(get_db)):
    listing = db.query(Listing).filter(Listing.id == listing_id).first()
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")
    # ownership check when host_id provided
    if listing.host_id != host_id:
        raise HTTPException(status_code=403, detail="Forbidden: not the listing owner")
    db.delete(listing)
    db.commit()
    return {}
