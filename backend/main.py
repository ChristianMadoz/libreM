print("--- MAIN.PY STARTING ---")
import os
import sys

# Get the directory of the current file
current_dir = os.path.dirname(os.path.abspath(__file__))
print(f"Current dir: {current_dir}")
print(f"Directory contents: {os.listdir(current_dir)}")

if current_dir not in sys.path:
    print(f"Adding {current_dir} to sys.path")
    sys.path.insert(0, current_dir)

print("Attempting to import FastAPI...")
from fastapi import FastAPI, APIRouter, Depends
from fastapi.middleware.cors import CORSMiddleware
import logging

print("Attempting to import database and config...")
try:
    from database import get_db
    from config import settings
    print("Database and config imported successfully")
except Exception as e:
    print(f"CRITICAL ERROR importing database/config: {str(e)}")
    import traceback
    traceback.print_exc()

print("Attempting to import routers...")
try:
    from routers import auth, products, categories, cart, favorites, orders
    print("Routers imported successfully")
except Exception as e:
    print(f"CRITICAL ERROR importing routers: {str(e)}")
    import traceback
    traceback.print_exc()

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