from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from database import Base


class Amenity(Base):
    __tablename__ = "amenities"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False)

    listings = relationship("Listing", secondary="listing_amenities", back_populates="amenities")


class ListingAmenity(Base):
    __tablename__ = "listing_amenities"

    listing_id = Column(Integer, ForeignKey("listings.id", ondelete="CASCADE"), primary_key=True)
    amenity_id = Column(Integer, ForeignKey("amenities.id", ondelete="CASCADE"), primary_key=True)
