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

from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

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

# Mount static files for the frontend
static_dir = os.path.join(current_dir, "static")
if os.path.exists(static_dir):
    app.mount("/assets", StaticFiles(directory=os.path.join(static_dir, "assets")), name="assets")

    @app.get("/{full_path:path}")
    async def serve_frontend(full_path: str):
        # If it's an API route that somehow got here, or a file that exists, return it
        # Otherwise, return index.html for SPA routing
        file_path = os.path.join(static_dir, full_path)
        if full_path and os.path.isfile(file_path):
            return FileResponse(file_path)
        return FileResponse(os.path.join(static_dir, "index.html"))
else:
    @app.get("/")
    def root():
        return {"message": "Welcome to LibreM API. Frontend not found in /static."}
