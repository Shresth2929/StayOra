import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import Base, engine

app = FastAPI(title="Stayora API")

origins = [os.getenv("FRONTEND_URL", "http://localhost:3000")]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup():
    # create tables if they don't exist
    Base.metadata.create_all(bind=engine)


# include routers
from routers.listings import router as listings_router
from routers.bookings import router as bookings_router
from routers.host import router as host_router
from routers.reviews import router as reviews_router
from routers.favorites import router as favorites_router


app.include_router(listings_router, prefix="/api/listings", tags=["listings"])
app.include_router(bookings_router, prefix="/api/bookings", tags=["bookings"])
app.include_router(host_router, prefix="/api/host", tags=["host"])
app.include_router(reviews_router, prefix="/api", tags=["reviews"])
app.include_router(favorites_router, prefix="/api/favorites", tags=["favorites"])


@app.get("/api/health")
def health():
    return {"status": "ok"}
