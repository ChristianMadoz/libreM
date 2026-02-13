from fastapi import FastAPI, HTTPException, Request, Response, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from datetime import datetime, timedelta, timezone
from typing import Optional, List
import uuid
import logging
from auth import get_session_user, exchange_session_id
from config import settings  # Import centralized configuration
from fastapi import APIRouter

from models import (
    User, UserSession, Product, Category, Cart, CartItem,
    Order, OrderItem, AddToCartRequest, UpdateCartRequest,
    CreateOrderRequest, ShippingData
)

# MongoDB connection - lazily initialized
_client = None

def get_motor_client():
    global _client
    if _client is None:
        if not settings.MONGODB_URI:
            logger.error("MONGODB_URI is not set!")
            return None
        _client = AsyncIOMotorClient(settings.MONGODB_URI)
    return _client

# Dependency to get database
async def get_db() -> AsyncIOMotorDatabase:
    client = get_motor_client()
    if client is None:
        raise HTTPException(status_code=500, detail="Database configuration missing")
    return client.get_database()

# Create the main app without a prefix
app = FastAPI(title="LibreM API", version="1.0.0")

@app.get("/")
async def root():
    return {"message": "Libre Mercado Unified API is running"}

@app.get("/api/health")
async def health():
    return {"status": "ok", "timestamp": datetime.now(timezone.utc)}

# Configure CORS BEFORE adding routes (middleware order matters!)
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=settings.CORS_ORIGINS,  # From config
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Dependency to get database
async def get_db() -> AsyncIOMotorDatabase:
    return db

# ============= AUTH ENDPOINTS =============

@api_router.post("/auth/google")
async def google_auth(request: Request, response: Response):
    """
    Exchange session_id from Google OAuth for user data and session_token
    REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
    """
    body = await request.json()
    session_id = body.get("session_id")
    
    if not session_id:
        raise HTTPException(status_code=400, detail="session_id is required")
    
    # Exchange session_id for user data
    auth_data = await exchange_session_id(session_id)
    
    # Check if user exists
    existing_user = await db.users.find_one(
        {"email": auth_data["email"]},
        {"_id": 0}
    )
    
    if existing_user:
        user_id = existing_user["user_id"]
        # Update user data if changed
        await db.users.update_one(
            {"user_id": user_id},
            {"$set": {
                "name": auth_data["name"],
                "picture": auth_data.get("picture"),
                "google_id": auth_data["id"]
            }}
        )
    else:
        # Create new user with custom user_id
        user_id = f"user_{uuid.uuid4().hex[:12]}"
        new_user = {
            "user_id": user_id,
            "google_id": auth_data["id"],
            "email": auth_data["email"],
            "name": auth_data["name"],
            "picture": auth_data.get("picture"),
            "favorites": [],
            "created_at": datetime.now(timezone.utc)
        }
        await db.users.insert_one(new_user)
    
    # Store session in database (timezone-aware, 7 days expiry)
    session_token = auth_data["session_token"]
    expires_at = datetime.now(timezone.utc) + timedelta(days=7)
    
    # Delete old sessions for this user
    await db.user_sessions.delete_many({"user_id": user_id})
    
    # Create new session
    await db.user_sessions.insert_one({
        "user_id": user_id,
        "session_token": session_token,
        "expires_at": expires_at,
        "created_at": datetime.now(timezone.utc)
    })
    
    # Set secure httponly cookie
    response.set_cookie(
        key="session_token",
        value=session_token,
        httponly=True,
        secure=settings.COOKIE_SECURE,
        samesite=settings.COOKIE_SAMESITE,
        max_age=settings.SESSION_EXPIRY_DAYS * 24 * 60 * 60
    )
    
    return {
        "user": {
            "user_id": user_id,
            "email": auth_data["email"],
            "name": auth_data["name"],
            "picture": auth_data.get("picture"),
            "favorites": existing_user.get("favorites", []) if existing_user else []
        },
        "token": session_token
    }

@api_router.post("/auth/register")
async def register(request: Request, response: Response):
    """
    Register a new user with email and password
    """
    import hashlib
    
    body = await request.json()
    email = body.get("email")
    password = body.get("password")
    name = body.get("name")
    
    if not email or not password or not name:
        raise HTTPException(status_code=400, detail="Email, password, and name are required")
    
    # Validate email format
    import re
    email_pattern = r'^[^\s@]+@[^\s@]+\.[^\s@]+$'
    if not re.match(email_pattern, email):
        raise HTTPException(status_code=400, detail="Invalid email format")
    
    # Check if user already exists
    existing_user = await db.users.find_one(
        {"email": email},
        {"_id": 0}
    )
    
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Hash password (simple hash for now - in production use bcrypt)
    password_hash = hashlib.sha256(password.encode()).hexdigest()
    
    # Create new user
    user_id = f"user_{uuid.uuid4().hex[:12]}"
    new_user = {
        "user_id": user_id,
        "email": email,
        "name": name,
        "password_hash": password_hash,
        "picture": None,
        "favorites": [],
        "created_at": datetime.now(timezone.utc)
    }
    await db.users.insert_one(new_user)
    
    # Create session
    session_token = uuid.uuid4().hex
    expires_at = datetime.now(timezone.utc) + timedelta(days=settings.SESSION_EXPIRY_DAYS)
    
    await db.user_sessions.insert_one({
        "user_id": user_id,
        "session_token": session_token,
        "expires_at": expires_at,
        "created_at": datetime.now(timezone.utc)
    })
    
    # Set secure httponly cookie
    response.set_cookie(
        key="session_token",
        value=session_token,
        httponly=True,
        secure=settings.COOKIE_SECURE,
        samesite=settings.COOKIE_SAMESITE,
        max_age=settings.SESSION_EXPIRY_DAYS * 24 * 60 * 60
    )
    
    return {
        "user": {
            "user_id": user_id,
            "email": email,
            "name": name,
            "picture": None,
            "favorites": []
        },
        "token": session_token
    }

@api_router.get("/auth/me")
async def get_current_user(
    request: Request,
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """
    Get current authenticated user
    """
    user = await get_session_user(request, db)
    return user

@api_router.post("/auth/logout")
async def logout(
    request: Request,
    response: Response,
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """
    Logout user by deleting session
    """
    session_token = request.cookies.get("session_token")
    
    if session_token:
        await db.user_sessions.delete_many({"session_token": session_token})
        response.delete_cookie(key="session_token", path="/")
    
    return {"success": True}

# ============= PRODUCTS ENDPOINTS =============

@api_router.get("/products")
async def get_products(
    category: Optional[int] = None,
    search: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    sort: Optional[str] = None
):
    """
    Get all products with optional filters
    """
    query = {}
    
    if category:
        query["category_id"] = category
    
    if search:
        query["$or"] = [
            {"name": {"$regex": search, "$options": "i"}},
            {"description": {"$regex": search, "$options": "i"}},
            {"category": {"$regex": search, "$options": "i"}}
        ]
    
    if min_price is not None or max_price is not None:
        query["price"] = {}
        if min_price is not None:
            query["price"]["$gte"] = min_price
        if max_price is not None:
            query["price"]["$lte"] = max_price
    
    products = await db.products.find(query, {"_id": 0}).to_list(1000)
    
    # Sort products
    if sort == "price-asc":
        products.sort(key=lambda x: x["price"])
    elif sort == "price-desc":
        products.sort(key=lambda x: x["price"], reverse=True)
    elif sort == "rating":
        products.sort(key=lambda x: x.get("rating", 0), reverse=True)
    elif sort == "discount":
        products.sort(key=lambda x: x.get("discount", 0), reverse=True)
    
    return {"products": products}

@api_router.get("/products/{product_id}")
async def get_product(product_id: str):
    """
    Get product by ID
    """
    product = await db.products.find_one({"product_id": product_id}, {"_id": 0})
    
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    return {"product": product}

@api_router.get("/categories")
async def get_categories():
    """
    Get all categories
    """
    categories = await db.categories.find({}, {"_id": 0}).to_list(100)
    return {"categories": categories}

# ============= CART ENDPOINTS =============

@api_router.get("/cart")
async def get_cart(
    request: Request,
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """
    Get user's cart
    """
    user = await get_session_user(request, db)
    
    cart = await db.carts.find_one(
        {"user_id": user["user_id"]},
        {"_id": 0}
    )
    
    if not cart:
        return {"cart": {"items": [], "total": 0}}
    
    # Get product details for each item
    items_with_details = []
    total = 0
    
    for item in cart.get("items", []):
        product = await db.products.find_one(
            {"product_id": item["product_id"]},
            {"_id": 0}
        )
        if product:
            item_total = product["price"] * item["quantity"]
            total += item_total
            items_with_details.append({
                **product,
                "cart_quantity": item["quantity"],
                "cart_color": item.get("color"),
                "item_total": item_total
            })
    
    return {
        "cart": {
            "items": items_with_details,
            "total": total
        }
    }

@api_router.post("/cart")
async def add_to_cart(
    cart_item: AddToCartRequest,
    request: Request,
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """
    Add product to cart
    """
    user = await get_session_user(request, db)
    
    # Check if product exists and has stock
    product = await db.products.find_one(
        {"product_id": cart_item.product_id},
        {"_id": 0}
    )
    
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    if product["stock"] < cart_item.quantity:
        raise HTTPException(status_code=400, detail="Insufficient stock")
    
    # Get or create cart
    cart = await db.carts.find_one(
        {"user_id": user["user_id"]},
        {"_id": 0}
    )
    
    if not cart:
        cart = {
            "user_id": user["user_id"],
            "items": [],
            "updated_at": datetime.now(timezone.utc)
        }
    
    # Check if item already exists in cart
    existing_item = None
    for item in cart["items"]:
        if item["product_id"] == cart_item.product_id and item.get("color") == cart_item.color:
            existing_item = item
            break
    
    if existing_item:
        # Update quantity
        new_quantity = existing_item["quantity"] + cart_item.quantity
        if product["stock"] < new_quantity:
            raise HTTPException(status_code=400, detail="Insufficient stock")
        existing_item["quantity"] = new_quantity
    else:
        # Add new item
        cart["items"].append({
            "product_id": cart_item.product_id,
            "quantity": cart_item.quantity,
            "color": cart_item.color,
            "added_at": datetime.now(timezone.utc)
        })
    
    cart["updated_at"] = datetime.now(timezone.utc)
    
    # Update in database
    await db.carts.update_one(
        {"user_id": user["user_id"]},
        {"$set": cart},
        upsert=True
    )
    
    # Return updated cart
    return await get_cart(request, db)

@api_router.put("/cart/{product_id}")
async def update_cart_item(
    product_id: str,
    update_data: UpdateCartRequest,
    request: Request,
    color: Optional[str] = None,
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """
    Update cart item quantity
    """
    user = await get_session_user(request, db)
    
    if update_data.quantity < 1:
        raise HTTPException(status_code=400, detail="Quantity must be at least 1")
    
    # Check stock
    product = await db.products.find_one(
        {"product_id": product_id},
        {"_id": 0}
    )
    
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    if product["stock"] < update_data.quantity:
        raise HTTPException(status_code=400, detail="Insufficient stock")
    
    # Update cart
    cart = await db.carts.find_one(
        {"user_id": user["user_id"]},
        {"_id": 0}
    )
    
    if not cart:
        raise HTTPException(status_code=404, detail="Cart not found")
    
    # Find and update item
    item_found = False
    for item in cart["items"]:
        if item["product_id"] == product_id and item.get("color") == color:
            item["quantity"] = update_data.quantity
            item_found = True
            break
    
    if not item_found:
        raise HTTPException(status_code=404, detail="Item not found in cart")
    
    cart["updated_at"] = datetime.now(timezone.utc)
    
    await db.carts.update_one(
        {"user_id": user["user_id"]},
        {"$set": cart}
    )
    
    return await get_cart(request, db)

@api_router.delete("/cart/{product_id}")
async def remove_from_cart(
    product_id: str,
    request: Request,
    color: Optional[str] = None,
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """
    Remove item from cart
    """
    user = await get_session_user(request, db)
    
    cart = await db.carts.find_one(
        {"user_id": user["user_id"]},
        {"_id": 0}
    )
    
    if not cart:
        raise HTTPException(status_code=404, detail="Cart not found")
    
    # Remove item
    cart["items"] = [
        item for item in cart["items"]
        if not (item["product_id"] == product_id and item.get("color") == color)
    ]
    
    cart["updated_at"] = datetime.now(timezone.utc)
    
    await db.carts.update_one(
        {"user_id": user["user_id"]},
        {"$set": cart}
    )
    
    return await get_cart(request, db)

@api_router.delete("/cart")
async def clear_cart(
    request: Request,
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """
    Clear entire cart
    """
    user = await get_session_user(request, db)
    
    await db.carts.delete_one({"user_id": user["user_id"]})
    
    return {"success": True}

# ============= FAVORITES ENDPOINTS =============

@api_router.get("/favorites")
async def get_favorites(
    request: Request,
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """
    Get user's favorite products
    """
    user = await get_session_user(request, db)
    
    favorites = user.get("favorites", [])
    
    # Get product details
    products = []
    for product_id in favorites:
        product = await db.products.find_one(
            {"product_id": product_id},
            {"_id": 0}
        )
        if product:
            products.append(product)
    
    return {"favorites": favorites, "products": products}

@api_router.post("/favorites/{product_id}")
async def add_favorite(
    product_id: str,
    request: Request,
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """
    Add product to favorites
    """
    user = await get_session_user(request, db)
    
    # Check if product exists
    product = await db.products.find_one(
        {"product_id": product_id},
        {"_id": 0}
    )
    
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    # Add to favorites if not already there
    favorites = user.get("favorites", [])
    if product_id not in favorites:
        favorites.append(product_id)
        await db.users.update_one(
            {"user_id": user["user_id"]},
            {"$set": {"favorites": favorites}}
        )
    
    return {"favorites": favorites}

@api_router.delete("/favorites/{product_id}")
async def remove_favorite(
    product_id: str,
    request: Request,
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """
    Remove product from favorites
    """
    user = await get_session_user(request, db)
    
    favorites = user.get("favorites", [])
    if product_id in favorites:
        favorites.remove(product_id)
        await db.users.update_one(
            {"user_id": user["user_id"]},
            {"$set": {"favorites": favorites}}
        )
    
    return {"favorites": favorites}

# ============= ORDERS ENDPOINTS =============

@api_router.post("/orders")
async def create_order(
    order_data: CreateOrderRequest,
    request: Request,
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """
    Create order from cart (checkout)
    """
    user = await get_session_user(request, db)
    
    # Get cart
    cart = await db.carts.find_one(
        {"user_id": user["user_id"]},
        {"_id": 0}
    )
    
    if not cart or not cart.get("items"):
        raise HTTPException(status_code=400, detail="Cart is empty")
    
    # Build order items and calculate total
    order_items = []
    total = 0
    
    for item in cart["items"]:
        product = await db.products.find_one(
            {"product_id": item["product_id"]},
            {"_id": 0}
        )
        
        if not product:
            continue
        
        # Check stock
        if product["stock"] < item["quantity"]:
            raise HTTPException(
                status_code=400,
                detail=f"Insufficient stock for {product['name']}"
            )
        
        item_total = product["price"] * item["quantity"]
        total += item_total
        
        order_items.append({
            "product_id": product["product_id"],
            "name": product["name"],
            "price": product["price"],
            "quantity": item["quantity"],
            "color": item.get("color"),
            "image": product["image"]
        })
        
        # Reduce stock
        await db.products.update_one(
            {"product_id": product["product_id"]},
            {"$inc": {"stock": -item["quantity"], "sold": item["quantity"]}}
        )
    
    # Create order
    order_id = f"order_{uuid.uuid4().hex[:12]}"
    order_number = f"ML-{datetime.now().strftime('%Y%m%d')}-{uuid.uuid4().hex[:8].upper()}"
    
    order = {
        "order_id": order_id,
        "user_id": user["user_id"],
        "order_number": order_number,
        "items": order_items,
        "shipping": order_data.shipping_data.dict(),
        "total": total,
        "status": "confirmed",
        "created_at": datetime.now(timezone.utc)
    }
    
    await db.orders.insert_one(order)
    
    # Clear cart
    await db.carts.delete_one({"user_id": user["user_id"]})
    
    # Return order without _id
    order_doc = await db.orders.find_one({"order_id": order_id}, {"_id": 0})
    
    return {"order": order_doc}

@api_router.get("/orders")
async def get_orders(
    request: Request,
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """
    Get user's orders
    """
    user = await get_session_user(request, db)
    
    orders = await db.orders.find(
        {"user_id": user["user_id"]},
        {"_id": 0}
    ).sort("created_at", -1).to_list(100)
    
    return {"orders": orders}

@api_router.get("/orders/{order_id}")
async def get_order(
    order_id: str,
    request: Request,
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """
    Get order by ID
    """
    user = await get_session_user(request, db)
    
    order = await db.orders.find_one(
        {"order_id": order_id, "user_id": user["user_id"]},
        {"_id": 0}
    )
    
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    return {"order": order}

# Include the router in the main app
app.include_router(api_router)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()