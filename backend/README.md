# Backend (FastAPI + SQLAlchemy)

This folder contains the FastAPI backend for Stayora.

Local setup:

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate    # Windows
pip install -r requirements.txt

# Create DB and seed
python seed.py

# Start server
uvicorn main:app --reload --port 8000
```

Set `DATABASE_URL` in `.env` if you want a custom path. Default is `sqlite:///./stayora.db`.

## Booking API

Endpoints:

- `POST /api/bookings` — create a booking
	- Body: `{ listing_id, guest_id, check_in (YYYY-MM-DD), check_out (YYYY-MM-DD), guests }`
	- Responses: `201 Created` with booking details; `409 Conflict` if dates unavailable; `422` for invalid input; `404` if listing or guest not found.

- `GET /api/bookings?guest_id=1` — list bookings for a guest (mock auth)
	- Returns `{ data: [ booking objects ] }`.

- `GET /api/bookings/{id}` — get booking details

- `GET /api/host/listings?host_id=1` — get bookings for listings owned by host

Price calculation and validation:

- Backend calculates `nights = (check_out - check_in).days`.
- `subtotal = nights * listing.price_per_night`.
- `cleaning_fee = 500` (flat).
- `service_fee = round(subtotal * 0.05)`.
- `total = subtotal + cleaning_fee + service_fee`.

Overlap validation:

- A new booking overlaps an existing confirmed booking unless `(new_check_out <= existing_check_in) OR (new_check_in >= existing_check_out)`.
- If overlap detected, server returns `409 Conflict` and does not create the booking.

Examples:

- Existing booking: `2026-08-20` → `2026-08-25`.
	- Rejects `2026-08-22` → `2026-08-24` (inside)
	- Rejects `2026-08-18` → `2026-08-21` (partial)
	- Rejects `2026-08-24` → `2026-08-28` (overlaps on checkout-night semantics)
	- Allows `2026-08-26` → `2026-08-29`

	## Host API

	Host endpoints (mock auth using `host_id` query parameter):

	- `GET /api/host/listings?host_id={id}` — returns listings owned by the host.

	- `GET /api/host/bookings?host_id={id}` — returns bookings for listings owned by the host.

	- `GET /api/host/stats?host_id={id}` — returns basic stats:
		- `listing_count`, `booking_count`, `confirmed_booking_count`, `total_booking_value`

	Ownership rules:

	- Host actions that modify a listing require ownership. For the mocked auth flow we expect a `host_id` to be provided when calling protected endpoints:
		- `PUT /api/listings/{id}?host_id={host_id}` — only allowed if the host owns the listing.
		- `DELETE /api/listings/{id}?host_id={host_id}` — only allowed if the host owns the listing.

	If host does not own the listing, the server returns `403 Forbidden`.

	Mock authentication note:

	- This project uses a simplified/mock authentication for development and the assignment. The backend expects `host_id` or `guest_id` query/body parameters to determine the acting user. Do not use this approach in production.

	## Reviews API

	- `GET /api/listings/{listing_id}/reviews` — list reviews for a listing.
	- `POST /api/reviews` — submit a review. Body: `{ listing_id, user_id, rating (1-5), comment }`

	## Favorites API

	- `GET /api/favorites?user_id={id}` — list favorites for a user.
	- `POST /api/favorites?user_id={id}&listing_id={id}` — add favorite.
	- `DELETE /api/favorites/{listing_id}?user_id={id}` — remove favorite.



