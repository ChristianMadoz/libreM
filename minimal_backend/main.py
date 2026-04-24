import os
import sys
import logging
from fastapi import FastAPI, APIRouter, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

# Ensure the current directory is in sys.path for Vercel
current_dir = os.path.dirname(os.path.abspath(__file__))
if current_dir not in sys.path:
    sys.path.insert(0, current_dir)

# Import dependencies after sys.path hack
from database import get_db
from routers import auth, products, categories, cart, favorites, orders

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create the main app
app = FastAPI(title="LibreM API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"], # Allow all origins for Vercel preview/production flexibility
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create a master router with the /api prefix
api_router = APIRouter(prefix="/api")

# Basic health check
@api_router.get("/health")
def health_check():
    return {"status": "fully-functional", "version": "1.0.0"}

# Include all modular routers
api_router.include_router(auth.router)
api_router.include_router(products.router)
api_router.include_router(categories.router)
api_router.include_router(cart.router)
api_router.include_router(favorites.router)
api_router.include_router(orders.router)

# Register the master router to the app
app.include_router(api_router)
