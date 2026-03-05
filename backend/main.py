import os
import sys
from fastapi import FastAPI, APIRouter, Depends
from fastapi.middleware.cors import CORSMiddleware
import logging

# Ensure the current directory is in sys.path for Vercel
current_dir = os.path.dirname(os.path.abspath(__file__))
if current_dir not in sys.path:
    sys.path.insert(0, current_dir)

from database import get_db
from config import settings
from routers import auth, products, categories, cart, favorites, orders

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Create the main app
app = FastAPI(title="LibreM API", version="1.0.0")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=settings.CORS_ORIGINS,
    allow_origin_regex=r"https://.*\.insforge\.(app|site)",
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create a master router with the /api prefix
api_router = APIRouter(prefix="/api")

@api_router.get("/health")
def health_check():
    return {"status": "ok", "db": "postgres"}

# Include modular routers
api_router.include_router(auth.router)
api_router.include_router(products.router)
api_router.include_router(categories.router)
api_router.include_router(cart.router)
api_router.include_router(favorites.router)
api_router.include_router(orders.router)

# Register the master router to the app
app.include_router(api_router)
