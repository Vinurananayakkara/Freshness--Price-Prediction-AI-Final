from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.db.database import Base, engine
from app.db import models  # noqa: F401  (ensures models are registered before create_all)

from app.api.auth import router as auth_router
from app.api.freshness import router as freshness_router
from app.api.price import router as price_router
from app.api.hybrid import router as hybrid_router

from app.api.profile import router as profile_router
from app.api.recommendations import router as recommendations_router

from app.utils.district_data import DISTRICT_NAMES
# Create the users table on startup if it doesn't exist yet.
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Sri Lankan Produce Intelligence API",
    version="1.1"
)

# CORS: allow the React frontend (dev + configurable prod origins) to call this API.
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.FRONTEND_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router, prefix="/api/auth", tags=["auth"])
app.include_router(freshness_router, prefix="/api", tags=["freshness"])
app.include_router(price_router, prefix="/api", tags=["price"])
app.include_router(hybrid_router, prefix="/api", tags=["hybrid"])

app.include_router(
    profile_router,
    prefix="/api/profile",
    tags=["profile"],
)
app.include_router(
    recommendations_router,
    prefix="/api/recommendations",
    tags=["recommendations"],
)

@app.get("/")
def home():
    return {
        "message": "Backend Running Successfully"
    }

@app.get("/api/districts")
def get_districts():
    return {"districts": DISTRICT_NAMES}
