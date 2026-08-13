from .listings import router as listings_router
from .bookings import router as bookings_router
from .host import router as host_router
from .reviews import router as reviews_router
from .favorites import router as favorites_router

__all__ = ["listings_router", "bookings_router", "host_router", "reviews_router", "favorites_router"]
