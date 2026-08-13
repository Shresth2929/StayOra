from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from datetime import datetime
from database import Base
from sqlalchemy.orm import relationship


class Listing(Base):
    __tablename__ = "listings"

    id = Column(Integer, primary_key=True, index=True)
    host_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    location = Column(String, nullable=True)
    city = Column(String, nullable=True)
    country = Column(String, nullable=True)
    price_per_night = Column(Integer, nullable=False, default=0)
    property_type = Column(String, nullable=True)
    max_guests = Column(Integer, nullable=False, default=1)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow)

    host = relationship("User", back_populates="listings")
    images = relationship("ListingImage", back_populates="listing", cascade="all, delete-orphan")
    amenities = relationship("Amenity", secondary="listing_amenities", back_populates="listings")
    bookings = relationship("Booking", back_populates="listing")
    reviews = relationship("Review", back_populates="listing")
    favorites = relationship("Favorite", back_populates="listing")
