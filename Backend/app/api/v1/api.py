from fastapi import APIRouter
from app.api.v1.endpoints import auth, matches, analytics, uploads

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(matches.router, prefix="/matches", tags=["matches"])
api_router.include_router(analytics.router, prefix="/analytics", tags=["analytics"])
api_router.include_router(uploads.router, prefix="/uploads", tags=["uploads"])
