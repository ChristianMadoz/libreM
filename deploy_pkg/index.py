from fastapi import FastAPI, HTTPException, Request, Response, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from datetime import datetime, timedelta, timezone
from typing import Optional, List
import uuid
import logging
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, delete, insert
from database import get_db, engine
from db_models import (
    DbUser, DbUserSession, DbProduct, DbCategory, 
    DbCart, DbCartItem, DbOrder, DbOrderItem
)
from auth import get_session_user, exchange_session_id
from config import settings
from fastapi import APIRouter

from models import (
    User, UserSession, Product, Category, Cart, CartItem,
    Order, OrderItem, AddToCartRequest, UpdateCartRequest,
    CreateOrderRequest, ShippingData
)

from fastapi.staticfiles import StaticFiles
import os

# Create the main app without a prefix
app = FastAPI(title="LibreM API", version="1.0.0")

# Determine paths
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
STATIC_DIR = os.path.join(BASE_DIR, "static")

# Mount static files correctly
if os.path.exists(STATIC_DIR):
    app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")
else:
    print(f"WARNING: Static directory not found at {STATIC_DIR}")

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


# ============= AUTH ENDPOINTS =============

@api_router.post("/auth/google")
async def google_auth(
    request: Request, 
    response: Response,
    db: AsyncSession = Depends(get_db)
):
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
    result = await db.execute(select(DbUser).where(DbUser.email == auth_data["email"]))
    user_obj = result.scalar_one_or_none()
    
    if user_obj:
        user_id = user_obj.user_id
        # Update user data
        user_obj.name = auth_data["name"]
        user_obj.picture = auth_data.get("picture")
        user_obj.google_id = auth_data["id"]
    else:
        # Create new user
        user_id = f"user_{uuid.uuid4().hex[:12]}"
        user_obj = DbUser(
            user_id=user_id,
            google_id=auth_data["id"],
            email=auth_data["email"],
            name=auth_data["name"],
            picture=auth_data.get("picture"),
            favorites=[]
        )
        db.add(user_obj)
    
    # Create or update session
    session_token = auth_data["session_token"]
    expires_at = datetime.now(timezone.utc) + timedelta(days=7)
    
    # Delete old sessions for this user
    await db.execute(delete(DbUserSession).where(DbUserSession.user_id == user_id))
    
    # Create new session
    new_session = DbUserSession(
        user_id=user_id,
        session_token=session_token,
        expires_at=expires_at
    )
    db.add(new_session)
    
    await db.commit()
    
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
            "favorites": user_obj.favorites if user_obj else []
        },
        "token": session_token
    }

@api_router.post("/auth/register")
async def register(
    request: Request, 
    response: Response,
    db: AsyncSession = Depends(get_db)
):
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
    result = await db.execute(select(DbUser).where(DbUser.email == email))
    if result.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Hash password
    password_hash = hashlib.sha256(password.encode()).hexdigest()
    
    # Create new user
    user_id = f"user_{uuid.uuid4().hex[:12]}"
    new_user = DbUser(
        user_id=user_id,
        email=email,
        name=name,
        password_hash=password_hash,
        favorites=[]
    )
    db.add(new_user)
    
    # Create session
    session_token = uuid.uuid4().hex
    expires_at = datetime.now(timezone.utc) + timedelta(days=settings.SESSION_EXPIRY_DAYS)
    
    new_session = DbUserSession(
        user_id=user_id,
        session_token=session_token,
        expires_at=expires_at
    )
    db.add(new_session)
    
    await db.commit()
    
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
    db: AsyncSession = Depends(get_db)
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
    db: AsyncSession = Depends(get_db)
):
    """
    Logout user by deleting session
    """
    session_token = request.cookies.get("session_token")
    
    if session_token:
        await db.execute(delete(DbUserSession).where(DbUserSession.session_token == session_token))
        await db.commit()
        response.delete_cookie(key="session_token", path="/")
    
    return {"success": True}

# ============= PRODUCTS ENDPOINTS =============

@api_router.get("/products")
async def get_products(
    db: AsyncSession = Depends(get_db),
    category: Optional[int] = None,
    search: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    sort: Optional[str] = None
):
    """
    Get all products with optional filters
    """
    stmt = select(DbProduct)
    
    if category:
        stmt = stmt.where(DbProduct.category_id == category)
    
    if search:
        search_filter = f"%{search}%"
        stmt = stmt.where(
            (DbProduct.name.ilike(search_filter)) |
            (DbProduct.description.ilike(search_filter)) |
            (DbProduct.category.ilike(search_filter))
        )
    
    if min_price is not None:
        stmt = stmt.where(DbProduct.price >= min_price)
    if max_price is not None:
        stmt = stmt.where(DbProduct.price <= max_price)
    
    # Sorting
    if sort == "price-asc":
        stmt = stmt.order_by(DbProduct.price.asc())
    elif sort == "price-desc":
        stmt = stmt.order_by(DbProduct.price.desc())
    elif sort == "rating":
        stmt = stmt.order_by(DbProduct.rating.desc().nulls_last())
    elif sort == "discount":
        stmt = stmt.order_by(DbProduct.discount.desc())
    
    result = await db.execute(stmt)
    products_objs = result.scalars().all()
    
    # Convert to dictionaries
    products = []
    for p in products_objs:
        p_dict = {c.name: getattr(p, c.name) for c in p.__table__.columns}
        products.append(p_dict)
    
    return {"products": products}

@api_router.get("/products/{product_id}")
async def get_product(product_id: str, db: AsyncSession = Depends(get_db)):
    """
    Get product by ID
    """
    result = await db.execute(select(DbProduct).where(DbProduct.product_id == product_id))
    product_obj = result.scalar_one_or_none()
    
    if not product_obj:
        raise HTTPException(status_code=404, detail="Product not found")
    
    product_dict = {c.name: getattr(product_obj, c.name) for c in product_obj.__table__.columns}
    return {"product": product_dict}

@api_router.get("/categories")
async def get_categories(db: AsyncSession = Depends(get_db)):
    """
    Get all categories
    """
    result = await db.execute(select(DbCategory))
    categories_objs = result.scalars().all()
    categories = [{c.name: getattr(cat, c.name) for c in cat.__table__.columns} for cat in categories_objs]
    return {"categories": categories}

# ============= CART ENDPOINTS =============

@api_router.get("/cart")
async def get_cart(
    request: Request,
    db: AsyncSession = Depends(get_db)
):
    """
    Get user's cart
    """
    user = await get_session_user(request, db)
    
    # Get cart with items and product details
    result = await db.execute(
        select(DbCartItem)
        .where(DbCartItem.user_id == user["user_id"])
    )
    cart_items = result.scalars().all()
    
    if not cart_items:
        return {"cart": {"items": [], "total": 0}}
    
    items_with_details = []
    total = 0
    
    for item in cart_items:
        # Get product details
        res = await db.execute(select(DbProduct).where(DbProduct.product_id == item.product_id))
        product = res.scalar_one_or_none()
        
        if product:
            product_dict = {c.name: getattr(product, c.name) for c in product.__table__.columns}
            item_total = product.price * item.quantity
            total += item_total
            items_with_details.append({
                **product_dict,
                "cart_quantity": item.quantity,
                "cart_color": item.color,
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
    db: AsyncSession = Depends(get_db)
):
    """
    Add product to cart
    """
    user = await get_session_user(request, db)
    
    # Check if product exists and has stock
    res = await db.execute(select(DbProduct).where(DbProduct.product_id == cart_item.product_id))
    product = res.scalar_one_or_none()
    
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    if product.stock < cart_item.quantity:
        raise HTTPException(status_code=400, detail="Insufficient stock")
    
    # Ensure cart exists for user
    res = await db.execute(select(DbCart).where(DbCart.user_id == user["user_id"]))
    cart = res.scalar_one_or_none()
    if not cart:
        cart = DbCart(user_id=user["user_id"])
        db.add(cart)
        await db.flush()
    
    # Check if item already exists in cart
    res = await db.execute(
        select(DbCartItem).where(
            (DbCartItem.user_id == user["user_id"]) & 
            (DbCartItem.product_id == cart_item.product_id) &
            (DbCartItem.color == cart_item.color)
        )
    )
    existing_item = res.scalar_one_or_none()
    
    if existing_item:
        new_quantity = existing_item.quantity + cart_item.quantity
        if product.stock < new_quantity:
            raise HTTPException(status_code=400, detail="Insufficient stock")
        existing_item.quantity = new_quantity
    else:
        new_item = DbCartItem(
            user_id=user["user_id"],
            product_id=cart_item.product_id,
            quantity=cart_item.quantity,
            color=cart_item.color
        )
        db.add(new_item)
    
    await db.commit()
    return await get_cart(request, db)

@api_router.put("/cart/{product_id}")
async def update_cart_item(
    product_id: str,
    update_data: UpdateCartRequest,
    request: Request,
    color: Optional[str] = None,
    db: AsyncSession = Depends(get_db)
):
    """
    Update cart item quantity
    """
    user = await get_session_user(request, db)
    
    if update_data.quantity < 1:
        raise HTTPException(status_code=400, detail="Quantity must be at least 1")
    
    # Check stock
    res = await db.execute(select(DbProduct).where(DbProduct.product_id == product_id))
    product = res.scalar_one_or_none()
    
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    if product.stock < update_data.quantity:
        raise HTTPException(status_code=400, detail="Insufficient stock")
    
    # Find and update item
    res = await db.execute(
        select(DbCartItem).where(
            (DbCartItem.user_id == user["user_id"]) & 
            (DbCartItem.product_id == product_id) &
            (DbCartItem.color == color)
        )
    )
    item = res.scalar_one_or_none()
    
    if not item:
        raise HTTPException(status_code=404, detail="Item not found in cart")
    
    item.quantity = update_data.quantity
    await db.commit()
    
    return await get_cart(request, db)

@api_router.delete("/cart/{product_id}")
async def remove_from_cart(
    product_id: str,
    request: Request,
    color: Optional[str] = None,
    db: AsyncSession = Depends(get_db)
):
    """
    Remove item from cart
    """
    user = await get_session_user(request, db)
    
    await db.execute(
        delete(DbCartItem).where(
            (DbCartItem.user_id == user["user_id"]) & 
            (DbCartItem.product_id == product_id) &
            (DbCartItem.color == color)
        )
    )
    await db.commit()
    
    return await get_cart(request, db)

@api_router.delete("/cart")
async def clear_cart(
    request: Request,
    db: AsyncSession = Depends(get_db)
):
    """
    Clear entire cart
    """
    user = await get_session_user(request, db)
    
    await db.execute(delete(DbCartItem).where(DbCartItem.user_id == user["user_id"]))
    await db.commit()
    
    return {"success": True}

# ============= FAVORITES ENDPOINTS =============

@api_router.get("/favorites")
async def get_favorites(
    request: Request,
    db: AsyncSession = Depends(get_db)
):
    """
    Get user's favorite products
    """
    user_data = await get_session_user(request, db)
    
    # Get user object to access favorites list
    result = await db.execute(select(DbUser).where(DbUser.user_id == user_data["user_id"]))
    user = result.scalar_one_or_none()
    
    favorites = user.favorites if user else []
    
    # Get product details
    products = []
    if favorites:
        result = await db.execute(select(DbProduct).where(DbProduct.product_id.in_(favorites)))
        products_objs = result.scalars().all()
        products = [{c.name: getattr(p, c.name) for c in p.__table__.columns} for p in products_objs]
    
    return {"favorites": favorites, "products": products}

@api_router.post("/favorites/{product_id}")
async def add_favorite(
    product_id: str,
    request: Request,
    db: AsyncSession = Depends(get_db)
):
    """
    Add product to favorites
    """
    user_data = await get_session_user(request, db)
    
    # Check if product exists
    result = await db.execute(select(DbProduct).where(DbProduct.product_id == product_id))
    if not result.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Product not found")
    
    # Get user object
    result = await db.execute(select(DbUser).where(DbUser.user_id == user_data["user_id"]))
    user = result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    favorites = list(user.favorites) # Create copy to ensure mutation is tracked
    if product_id not in favorites:
        favorites.append(product_id)
        user.favorites = favorites
        await db.commit()
    
    return {"favorites": favorites}

@api_router.delete("/favorites/{product_id}")
async def remove_favorite(
    product_id: str,
    request: Request,
    db: AsyncSession = Depends(get_db)
):
    """
    Remove product from favorites
    """
    user_data = await get_session_user(request, db)
    
    # Get user object
    result = await db.execute(select(DbUser).where(DbUser.user_id == user_data["user_id"]))
    user = result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    favorites = list(user.favorites)
    if product_id in favorites:
        favorites.remove(product_id)
        user.favorites = favorites
        await db.commit()
    
    return {"favorites": favorites}

# ============= ORDERS ENDPOINTS =============

@api_router.post("/orders")
async def create_order(
    order_data: CreateOrderRequest,
    request: Request,
    db: AsyncSession = Depends(get_db)
):
    """
    Create order from cart (checkout)
    """
    user_data = await get_session_user(request, db)
    user_id = user_data["user_id"]
    
    # Get cart items
    result = await db.execute(select(DbCartItem).where(DbCartItem.user_id == user_id))
    cart_items = result.scalars().all()
    
    if not cart_items:
        raise HTTPException(status_code=400, detail="Cart is empty")
    
    # Build order items and calculate total
    order_items_objs = []
    total = 0
    
    for item in cart_items:
        # Get product and lock for update
        res = await db.execute(select(DbProduct).where(DbProduct.product_id == item.product_id).with_for_update())
        product = res.scalar_one_or_none()
        
        if not product:
            continue
        
        if product.stock < item.quantity:
            raise HTTPException(
                status_code=400,
                detail=f"Insufficient stock for {product.name}"
            )
        
        item_total = product.price * item.quantity
        total += item_total
        
        order_items_objs.append(DbOrderItem(
            product_id=product.product_id,
            name=product.name,
            price=product.price,
            quantity=item.quantity,
            color=item.color,
            image=product.image
        ))
        
        # Reduce stock
        product.stock -= item.quantity
        product.sold += item.quantity
    
    # Create order
    order_id = f"order_{uuid.uuid4().hex[:12]}"
    order_number = f"ML-{datetime.now().strftime('%Y%m%d')}-{uuid.uuid4().hex[:8].upper()}"
    
    new_order = DbOrder(
        order_id=order_id,
        user_id=user_id,
        order_number=order_number,
        total=total,
        status="confirmed",
        shipping_data=order_data.shipping_data.dict()
    )
    db.add(new_order)
    
    # Add items to order
    for item_obj in order_items_objs:
        item_obj.order_id = order_id
        db.add(item_obj)
    
    # Clear cart
    await db.execute(delete(DbCartItem).where(DbCartItem.user_id == user_id))
    
    await db.commit()
    
    return {"order": {
        "order_id": order_id,
        "order_number": order_number,
        "total": total,
        "status": "confirmed"
    }}

@api_router.get("/orders")
async def get_orders(
    request: Request,
    db: AsyncSession = Depends(get_db)
):
    """
    Get user's orders
    """
    user_data = await get_session_user(request, db)
    
    result = await db.execute(
        select(DbOrder)
        .where(DbOrder.user_id == user_data["user_id"])
        .order_by(DbOrder.created_at.desc())
    )
    orders_objs = result.scalars().all()
    
    orders = []
    for o in orders_objs:
        o_dict = {c.name: getattr(o, c.name) for c in o.__table__.columns}
        orders.append(o_dict)
    
    return {"orders": orders}

@api_router.get("/orders/{order_id}")
async def get_order(
    order_id: str,
    request: Request,
    db: AsyncSession = Depends(get_db)
):
    """
    Get order by ID
    """
    user_data = await get_session_user(request, db)
    
    result = await db.execute(
        select(DbOrder)
        .where((DbOrder.order_id == order_id) & (DbOrder.user_id == user_data["user_id"]))
    )
    order = result.scalar_one_or_none()
    
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    # Get items for this order
    result = await db.execute(select(DbOrderItem).where(DbOrderItem.order_id == order_id))
    items_objs = result.scalars().all()
    items = [{c.name: getattr(i, c.name) for c in i.__table__.columns} for i in items_objs]
    
    order_dict = {c.name: getattr(order, c.name) for c in order.__table__.columns}
    order_dict["items"] = items
    
    return {"order": order_dict}

# Include the router in the main app
app.include_router(api_router)

@app.on_event("shutdown")
async def shutdown_db_client():
    await engine.dispose()

@app.get("/")
async def root():
    """Serve the index.html at root"""
    index_path = os.path.join(BASE_DIR, "index.html")
    if os.path.exists(index_path):
        from fastapi.responses import FileResponse
        return FileResponse(index_path)
    return {"message": "API is running. Frontend not found."}

@app.get("/favicon.ico")
async def favicon():
    file_path = os.path.join(BASE_DIR, "favicon.ico")
    if os.path.exists(file_path):
        from fastapi.responses import FileResponse
        return FileResponse(file_path)
    return Response(status_code=404)

@app.get("/asset-manifest.json")
async def manifest():
    file_path = os.path.join(BASE_DIR, "asset-manifest.json")
    if os.path.exists(file_path):
        from fastapi.responses import FileResponse
        return FileResponse(file_path)
    return Response(status_code=404)

@app.get("/{full_path:path}")
async def serve_spa(full_path: str):
    """Serve the React app for any unmatched routes"""
    index_path = os.path.join(BASE_DIR, "index.html")
    if os.path.exists(index_path):
        from fastapi.responses import FileResponse
        return FileResponse(index_path)
    return {"message": "API is running. Frontend static files not found."}
