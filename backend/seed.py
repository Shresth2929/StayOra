"""Richer seed script for Stayora database."""
import random
from datetime import date, timedelta
from database import engine, Base, SessionLocal
from models import User, Listing, ListingImage, Amenity, Booking, Review, Favorite


def seed():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        if db.query(User).first():
            print("Seed data already exists")
            return

        # Users (hosts and guests)
        users = [
            User(name="Asha Host", email="asha@stayora.com", role="HOST"),
            User(name="Ravi Host", email="ravi@stayora.com", role="HOST"),
            User(name="Maya Host", email="maya@stayora.com", role="HOST"),
            User(name="Kunal Guest", email="kunal@stayora.com", role="GUEST"),
            User(name="Neha Guest", email="neha@stayora.com", role="GUEST"),
        ]
        db.add_all(users)
        db.commit()

        hosts = db.query(User).filter(User.role == "HOST").all()
        guests = db.query(User).filter(User.role == "GUEST").all()

        # Amenities
        amenity_names = ["WiFi", "Kitchen", "Pool", "Parking", "Air Conditioning", "Washer", "TV", "Workspace"]
        amenities = []
        for n in amenity_names:
            a = Amenity(name=n)
            db.add(a)
            amenities.append(a)
        db.commit()

        locations = [
            ("Calangute Beach", "Goa", "India"),
            ("Manali Valley", "Manali", "India"),
            ("Hawa Mahal Area", "Jaipur", "India"),
            ("Lake Pichola", "Udaipur", "India"),
            ("Juhu", "Mumbai", "India"),
            ("Connaught Place", "Delhi", "India"),
            ("Koramangala", "Bangalore", "India"),
            ("Ram Jhula", "Rishikesh", "India"),
            ("Alleppey Backwaters", "Kerala", "India"),
        ]

        property_types = ["Apartment", "Villa", "House", "Cabin", "Hotel"]

        # Image pool (Unsplash sample images)
        image_pool = [
            "https://images.unsplash.com/photo-1501117716987-c8e3f0a7d1d6",
            "https://images.unsplash.com/photo-1505691723518-36a9b0b3f5f9",
            "https://images.unsplash.com/photo-1494526585095-c41746248156",
            "https://images.unsplash.com/photo-1507089947368-19c1da9775ae",
            "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df",
        ]

        listings = []
        for i in range(20):
            host = random.choice(hosts)
            loc = random.choice(locations)
            ptype = random.choice(property_types)
            title = f"{ptype} near {loc[1]} #{i+1}"
            price = random.randint(2000, 15000)
            max_guests = random.choice([2, 4, 6, 8])

            listing = Listing(
                host_id=host.id,
                title=title,
                description=f"Comfortable {ptype.lower()} located in {loc[1]}. Perfect for a relaxing stay.",
                location=loc[0],
                city=loc[1],
                country=loc[2],
                price_per_night=price,
                property_type=ptype,
                max_guests=max_guests,
            )
            db.add(listing)
            db.commit()
            db.refresh(listing)

            # images
            for pos in range(3):
                url = random.choice(image_pool) + f"?w=1200&q=80&img={i}-{pos}"
                img = ListingImage(listing_id=listing.id, image_url=url, position=pos)
                db.add(img)

            # random amenities
            chosen = random.sample(amenities, k=random.randint(2, 5))
            for a in chosen:
                listing.amenities.append(a)

            db.commit()
            listings.append(listing)

        # Create some bookings (non-overlapping per listing)
        today = date.today()
        for idx, listing in enumerate(random.sample(listings, 8)):
            guest = random.choice(guests)
            ci = today + timedelta(days=10 + idx * 3)
            co = ci + timedelta(days=random.randint(2, 6))
            nights = (co - ci).days
            booking = Booking(
                listing_id=listing.id,
                guest_id=guest.id,
                check_in=ci,
                check_out=co,
                guests=min(listing.max_guests, 2),
                nights=nights,
                nightly_price=listing.price_per_night,
                cleaning_fee=500,
                service_fee=250,
                total_price=listing.price_per_night * nights + 500 + 250,
                status="CONFIRMED",
            )
            db.add(booking)
        db.commit()

        # Reviews
        sample_comments = [
            "Amazing stay, highly recommend!",
            "Very comfortable and clean.",
            "Great host and location.",
            "Decent place for a weekend getaway.",
            "Would stay again!",
        ]
        for listing in random.sample(listings, 12):
            reviewer = random.choice(users)
            rating = random.randint(3, 5)
            comment = random.choice(sample_comments)
            review = Review(listing_id=listing.id, user_id=reviewer.id, rating=rating, comment=comment)
            db.add(review)
        db.commit()

        # Favorites
        for user in guests:
            favs = random.sample(listings, k=3)
            for f in favs:
                db.add(Favorite(user_id=user.id, listing_id=f.id))
        db.commit()

        print("Seed complete: users=%d listings=%d" % (len(users), len(listings)))
    finally:
        db.close()


if __name__ == "__main__":
    seed()
