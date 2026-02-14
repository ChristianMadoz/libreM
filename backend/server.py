from fastapi import FastAPI, HTTPException, Request, Response, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from datetime import datetime, timedelta, timezone
from typing import Optional, List
import uuid
import logging
from auth import get_session_user, exchange_session_id
from config import settings
from fastapi import APIRouter
from database import get_db, engine, Base
import db_models
from models import (
    AddToCartRequest, UpdateCartRequest,
    CreateOrderRequest, ShippingData
)

# Create database tables
# Base.metadata.create_all(bind=engine)

# Create the main app without a prefix
app = FastAPI(title="LibreM API", version="1.0.0")

# Configure CORS BEFORE adding routes (middleware order matters!)
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=settings.CORS_ORIGINS,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create a router with the /api prefix
api_router = APIRouter()

@api_router.get("/health")
def health_check():
    return {"status": "ok", "db": "postgres"}

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# ============= AUTH ENDPOINTS =============

@api_router.post("/auth/google")
async def google_auth(request: Request, response: Response, db: Session = Depends(get_db)):
    """
    Exchange session_id from Google OAuth for user data and session_token
    """
    body = await request.json()
    session_id = body.get("session_id")
    
    if not session_id:
        raise HTTPException(status_code=400, detail="session_id is required")
    
    # Exchange session_id for user data
    auth_data = await exchange_session_id(session_id)
    
    # Check if user exists
    existing_user = db.query(db_models.User).filter(
        db_models.User.email == auth_data["email"]
    ).first()
    
    if existing_user:
        user_id = existing_user.user_id
        # Update user data if changed
        existing_user.name = auth_data["name"]
        existing_user.picture = auth_data.get("picture")
        existing_user.google_id = auth_data["id"]
        db.commit()
        favorites = existing_user.favorites or []
    else:
        # Create new user with custom user_id
        user_id = f"user_{uuid.uuid4().hex[:12]}"
        new_user = db_models.User(
            user_id=user_id,
            google_id=auth_data["id"],
            email=auth_data["email"],
            name=auth_data["name"],
            picture=auth_data.get("picture"),
            favorites=[],
            created_at=datetime.now(timezone.utc)
        )
        db.add(new_user)
        db.commit()
        favorites = []
    
    # Store session in database
    session_token = auth_data["session_token"]
    expires_at = datetime.now(timezone.utc) + timedelta(days=settings.SESSION_EXPIRY_DAYS)
    
    # Delete old sessions for this user
    db.query(db_models.UserSession).filter(
        db_models.UserSession.user_id == user_id
    ).delete()
    
    # Create new session
    new_session = db_models.UserSession(
        user_id=user_id,
        session_token=session_token,
        expires_at=expires_at,
        created_at=datetime.now(timezone.utc)
    )
    db.add(new_session)
    db.commit()
    
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
            "favorites": favorites
        },
        "token": session_token
    }

@api_router.post("/auth/register")
async def register(request: Request, response: Response, db: Session = Depends(get_db)):
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
    existing_user = db.query(db_models.User).filter(
        db_models.User.email == email
    ).first()
    
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Hash password
    password_hash = hashlib.sha256(password.encode()).hexdigest()
    
    # Create new user
    user_id = f"user_{uuid.uuid4().hex[:12]}"
    new_user = db_models.User(
        user_id=user_id,
        email=email,
        name=name,
        password_hash=password_hash,
        picture=None,
        favorites=[],
        created_at=datetime.now(timezone.utc)
    )
    db.add(new_user)
    db.commit()
    
    # Create session
    session_token = uuid.uuid4().hex
    expires_at = datetime.now(timezone.utc) + timedelta(days=settings.SESSION_EXPIRY_DAYS)
    
    new_session = db_models.UserSession(
        user_id=user_id,
        session_token=session_token,
        expires_at=expires_at,
        created_at=datetime.now(timezone.utc)
    )
    db.add(new_session)
    db.commit()
    
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
    db: Session = Depends(get_db)
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
    db: Session = Depends(get_db)
):
    """
    Logout user by deleting session
    """
    session_token = request.cookies.get("session_token")
    
    if session_token:
        db.query(db_models.UserSession).filter(
            db_models.UserSession.session_token == session_token
        ).delete()
        db.commit()
        response.delete_cookie(key="session_token", path="/")
    
    return {"success": True}

# ============= PRODUCTS ENDPOINTS =============

@api_router.get("/products")
async def get_products(
    category: Optional[int] = None,
    search: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    sort: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    Get all products with optional filters
    """
    query = db.query(db_models.Product)
    
    if category:
        query = query.filter(db_models.Product.category_id == category)
    
    if search:
        search_pattern = f"%{search}%"
        query = query.filter(
            (db_models.Product.name.ilike(search_pattern)) |
            (db_models.Product.description.ilike(search_pattern)) |
            (db_models.Product.category.ilike(search_pattern))
        )
    
    if min_price is not None:
        query = query.filter(db_models.Product.price >= min_price)
    
    if max_price is not None:
        query = query.filter(db_models.Product.price <= max_price)
    
    # Apply sorting
    if sort == "price-asc":
        query = query.order_by(db_models.Product.price.asc())
    elif sort == "price-desc":
        query = query.order_by(db_models.Product.price.desc())
    elif sort == "rating":
        query = query.order_by(db_models.Product.rating.desc())
    elif sort == "discount":
        query = query.order_by(db_models.Product.discount.desc())
    
    products = query.limit(1000).all()
    
    # Convert to dict
    products_list = [
        {
            "product_id": p.product_id,
            "name": p.name,
            "price": p.price,
            "original_price": p.original_price,
            "discount": p.discount,
            "image": p.image,
            "category": p.category,
            "category_id": p.category_id,
            "free_shipping": p.free_shipping,
            "rating": p.rating,
            "reviews": p.reviews,
            "sold": p.sold,
            "stock": p.stock,
            "description": p.description,
            "features": p.features or [],
            "colors": p.colors or [],
            "seller": p.seller,
            "verified": p.verified
        }
        for p in products
    ]
    
    return {"products": products_list}

@api_router.get("/products/{product_id}")
async def get_product(product_id: str, db: Session = Depends(get_db)):
    """
    Get product by ID
    """
    product = db.query(db_models.Product).filter(
        db_models.Product.product_id == product_id
    ).first()
    
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    return {
        "product": {
            "product_id": product.product_id,
            "name": product.name,
            "price": product.price,
            "original_price": product.original_price,
            "discount": product.discount,
            "image": product.image,
            "category": product.category,
            "category_id": product.category_id,
            "free_shipping": product.free_shipping,
            "rating": product.rating,
            "reviews": product.reviews,
            "sold": product.sold,
            "stock": product.stock,
            "description": product.description,
            "features": product.features or [],
            "colors": product.colors or [],
            "seller": product.seller,
            "verified": product.verified
        }
    }

@api_router.get("/categories")
async def get_categories(db: Session = Depends(get_db)):
    """
    Get all categories
    """
    categories = db.query(db_models.Category).limit(100).all()
    
    categories_list = [
        {
            "category_id": c.category_id,
            "name": c.name,
            "icon": c.icon
        }
        for c in categories
    ]
    
    return {"categories": categories_list}

# ============= CART ENDPOINTS =============

@api_router.get("/cart")
async def get_cart(
    request: Request,
    db: Session = Depends(get_db)
):
    """
    Get user's cart
    """
    user = await get_session_user(request, db)
    
    cart = db.query(db_models.Cart).filter(
        db_models.Cart.user_id == user["user_id"]
    ).first()
    
    if not cart:
        return {"cart": {"items": [], "total": 0}}
    
    # Get cart items with product details
    items_with_details = []
    total = 0
    
    for cart_item in cart.items:
        product = cart_item.product
        if product:
            item_total = product.price * cart_item.quantity
            total += item_total
            items_with_details.append({
                "product_id": product.product_id,
                "name": product.name,
                "price": product.price,
                "original_price": product.original_price,
                "discount": product.discount,
                "image": product.image,
                "category": product.category,
                "category_id": product.category_id,
                "free_shipping": product.free_shipping,
                "rating": product.rating,
                "reviews": product.reviews,
                "sold": product.sold,
                "stock": product.stock,
                "description": product.description,
                "features": product.features or [],
                "colors": product.colors or [],
                "seller": product.seller,
                "verified": product.verified,
                "cart_quantity": cart_item.quantity,
                "cart_color": cart_item.color,
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
    db: Session = Depends(get_db)
):
    """
    Add product to cart
    """
    user = await get_session_user(request, db)
    
    # Check if product exists and has stock
    product = db.query(db_models.Product).filter(
        db_models.Product.product_id == cart_item.product_id
    ).first()
    
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    if product.stock < cart_item.quantity:
        raise HTTPException(status_code=400, detail="Insufficient stock")
    
    # Get or create cart
    cart = db.query(db_models.Cart).filter(
        db_models.Cart.user_id == user["user_id"]
    ).first()
    
    if not cart:
        cart = db_models.Cart(
            user_id=user["user_id"],
            updated_at=datetime.now(timezone.utc)
        )
        db.add(cart)
        db.commit()
        db.refresh(cart)
    
    # Check if item already exists in cart
    existing_item = db.query(db_models.CartItem).filter(
        db_models.CartItem.cart_id == cart.cart_id,
        db_models.CartItem.product_id == cart_item.product_id,
        db_models.CartItem.color == cart_item.color
    ).first()
    
    if existing_item:
        # Update quantity
        new_quantity = existing_item.quantity + cart_item.quantity
        if product.stock < new_quantity:
            raise HTTPException(status_code=400, detail="Insufficient stock")
        existing_item.quantity = new_quantity
    else:
        # Add new item
        new_cart_item = db_models.CartItem(
            cart_id=cart.cart_id,
            product_id=cart_item.product_id,
            quantity=cart_item.quantity,
            color=cart_item.color,
            added_at=datetime.now(timezone.utc)
        )
        db.add(new_cart_item)
    
    cart.updated_at = datetime.now(timezone.utc)
    db.commit()
    
    # Return updated cart
    return await get_cart(request, db)

@api_router.put("/cart/{product_id}")
async def update_cart_item(
    product_id: str,
    update_data: UpdateCartRequest,
    request: Request,
    color: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    Update cart item quantity
    """
    user = await get_session_user(request, db)
    
    if update_data.quantity < 1:
        raise HTTPException(status_code=400, detail="Quantity must be at least 1")
    
    # Check stock
    product = db.query(db_models.Product).filter(
        db_models.Product.product_id == product_id
    ).first()
    
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    if product.stock < update_data.quantity:
        raise HTTPException(status_code=400, detail="Insufficient stock")
    
    # Get cart
    cart = db.query(db_models.Cart).filter(
        db_models.Cart.user_id == user["user_id"]
    ).first()
    
    if not cart:
        raise HTTPException(status_code=404, detail="Cart not found")
    
    # Find and update item
    cart_item = db.query(db_models.CartItem).filter(
        db_models.CartItem.cart_id == cart.cart_id,
        db_models.CartItem.product_id == product_id,
        db_models.CartItem.color == color
    ).first()
    
    if not cart_item:
        raise HTTPException(status_code=404, detail="Item not found in cart")
    
    cart_item.quantity = update_data.quantity
    cart.updated_at = datetime.now(timezone.utc)
    db.commit()
    
    return await get_cart(request, db)

@api_router.delete("/cart/{product_id}")
async def remove_from_cart(
    product_id: str,
    request: Request,
    color: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    Remove item from cart
    """
    user = await get_session_user(request, db)
    
    cart = db.query(db_models.Cart).filter(
        db_models.Cart.user_id == user["user_id"]
    ).first()
    
    if not cart:
        raise HTTPException(status_code=404, detail="Cart not found")
    
    # Remove item
    db.query(db_models.CartItem).filter(
        db_models.CartItem.cart_id == cart.cart_id,
        db_models.CartItem.product_id == product_id,
        db_models.CartItem.color == color
    ).delete()
    
    cart.updated_at = datetime.now(timezone.utc)
    db.commit()
    
    return await get_cart(request, db)

@api_router.delete("/cart")
async def clear_cart(
    request: Request,
    db: Session = Depends(get_db)
):
    """
    Clear entire cart
    """
    user = await get_session_user(request, db)
    
    db.query(db_models.Cart).filter(
        db_models.Cart.user_id == user["user_id"]
    ).delete()
    db.commit()
    
    return {"success": True}

# ============= FAVORITES ENDPOINTS =============

@api_router.get("/favorites")
async def get_favorites(
    request: Request,
    db: Session = Depends(get_db)
):
    """
    Get user's favorite products
    """
    user_data = await get_session_user(request, db)
    
    user = db.query(db_models.User).filter(
        db_models.User.user_id == user_data["user_id"]
    ).first()
    
    favorites = user.favorites or []
    
    # Get product details
    products = []
    for product_id in favorites:
        product = db.query(db_models.Product).filter(
            db_models.Product.product_id == product_id
        ).first()
        if product:
            products.append({
                "product_id": product.product_id,
                "name": product.name,
                "price": product.price,
                "original_price": product.original_price,
                "discount": product.discount,
                "image": product.image,
                "category": product.category,
                "category_id": product.category_id,
                "free_shipping": product.free_shipping,
                "rating": product.rating,
                "reviews": product.reviews,
                "sold": product.sold,
                "stock": product.stock,
                "description": product.description,
                "features": product.features or [],
                "colors": product.colors or [],
                "seller": product.seller,
                "verified": product.verified
            })
    
    return {"favorites": favorites, "products": products}

@api_router.post("/favorites/{product_id}")
async def add_favorite(
    product_id: str,
    request: Request,
    db: Session = Depends(get_db)
):
    """
    Add product to favorites
    """
    user_data = await get_session_user(request, db)
    
    # Check if product exists
    product = db.query(db_models.Product).filter(
        db_models.Product.product_id == product_id
    ).first()
    
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    # Get user
    user = db.query(db_models.User).filter(
        db_models.User.user_id == user_data["user_id"]
    ).first()
    
    # Add to favorites if not already there
    favorites = user.favorites or []
    if product_id not in favorites:
        favorites.append(product_id)
        user.favorites = favorites
        db.commit()
    
    return {"favorites": favorites}

@api_router.delete("/favorites/{product_id}")
async def remove_favorite(
    product_id: str,
    request: Request,
    db: Session = Depends(get_db)
):
    """
    Remove product from favorites
    """
    user_data = await get_session_user(request, db)
    
    user = db.query(db_models.User).filter(
        db_models.User.user_id == user_data["user_id"]
    ).first()
    
    favorites = user.favorites or []
    if product_id in favorites:
        favorites.remove(product_id)
        user.favorites = favorites
        db.commit()
    
    return {"favorites": favorites}

# ============= ORDERS ENDPOINTS =============

@api_router.post("/orders")
async def create_order(
    order_data: CreateOrderRequest,
    request: Request,
    db: Session = Depends(get_db)
):
    """
    Create order from cart (checkout)
    """
    user = await get_session_user(request, db)
    
    # Get cart
    cart = db.query(db_models.Cart).filter(
        db_models.Cart.user_id == user["user_id"]
    ).first()
    
    if not cart or not cart.items:
        raise HTTPException(status_code=400, detail="Cart is empty")
    
    # Build order items and calculate total
    order_items = []
    total = 0
    
    for cart_item in cart.items:
        product = cart_item.product
        
        if not product:
            continue
        
        # Check stock
        if product.stock < cart_item.quantity:
            raise HTTPException(
                status_code=400,
                detail=f"Insufficient stock for {product.name}"
            )
        
        item_total = product.price * cart_item.quantity
        total += item_total
        
        order_items.append({
            "product_id": product.product_id,
            "name": product.name,
            "price": product.price,
            "quantity": cart_item.quantity,
            "color": cart_item.color,
            "image": product.image
        })
        
        # Reduce stock
        product.stock -= cart_item.quantity
        product.sold += cart_item.quantity
    
    # Create order
    order_id = f"order_{uuid.uuid4().hex[:12]}"
    order_number = f"ML-{datetime.now().strftime('%Y%m%d')}-{uuid.uuid4().hex[:8].upper()}"
    
    new_order = db_models.Order(
        order_id=order_id,
        user_id=user["user_id"],
        order_number=order_number,
        items=order_items,
        shipping=order_data.shipping_data.dict(),
        total=total,
        status="confirmed",
        created_at=datetime.now(timezone.utc)
    )
    
    db.add(new_order)
    
    # Clear cart
    db.query(db_models.Cart).filter(
        db_models.Cart.user_id == user["user_id"]
    ).delete()
    
    db.commit()
    db.refresh(new_order)
    
    return {
        "order": {
            "order_id": new_order.order_id,
            "user_id": new_order.user_id,
            "order_number": new_order.order_number,
            "items": new_order.items,
            "shipping": new_order.shipping,
            "total": new_order.total,
            "status": new_order.status,
            "created_at": new_order.created_at.isoformat()
        }
    }

@api_router.get("/orders")
async def get_orders(
    request: Request,
    db: Session = Depends(get_db)
):
    """
    Get user's orders
    """
    user = await get_session_user(request, db)
    
    orders = db.query(db_models.Order).filter(
        db_models.Order.user_id == user["user_id"]
    ).order_by(db_models.Order.created_at.desc()).limit(100).all()
    
    orders_list = [
        {
            "order_id": o.order_id,
            "user_id": o.user_id,
            "order_number": o.order_number,
            "items": o.items,
            "shipping": o.shipping,
            "total": o.total,
            "status": o.status,
            "created_at": o.created_at.isoformat()
        }
        for o in orders
    ]
    
    return {"orders": orders_list}

@api_router.get("/orders/{order_id}")
async def get_order(
    order_id: str,
    request: Request,
    db: Session = Depends(get_db)
):
    """
    Get order by ID
    """
    user = await get_session_user(request, db)
    
    order = db.query(db_models.Order).filter(
        db_models.Order.order_id == order_id,
        db_models.Order.user_id == user["user_id"]
    ).first()
    
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    return {
        "order": {
            "order_id": order.order_id,
            "user_id": order.user_id,
            "order_number": order.order_number,
            "items": order.items,
            "shipping": order.shipping,
            "total": order.total,
            "status": order.status,
            "created_at": order.created_at.isoformat()
        }
    }

# Include the router in the main app
# Include the router twice to handle both cases (gateway stripping prefix or not)
app.include_router(api_router, prefix="/api")
app.include_router(api_router)