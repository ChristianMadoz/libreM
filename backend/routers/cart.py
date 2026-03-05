from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from datetime import datetime, timezone
from typing import Optional
from database import get_db
from auth import get_session_user
import db_models
from schemas.cart import Cart, CartItemCreate, CartItemUpdate

router = APIRouter(prefix="/cart", tags=["cart"])

@router.get("", response_model=Cart)
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
        return {"items": [], "total": 0}
    
    # Calculate item totals and overall total
    items_with_details = []
    total = 0
    
    for cart_item in cart.items:
        product = cart_item.product
        if product:
            item_total = product.price * cart_item.quantity
            total += item_total
            # We add virtual fields for the response model
            cart_item.item_total = item_total
            items_with_details.append(cart_item)
    
    return {
        "items": items_with_details,
        "total": total,
        "updated_at": cart.updated_at
    }

@router.post("", response_model=Cart)
async def add_to_cart(
    cart_item: CartItemCreate,
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

@router.put("/{product_id}", response_model=Cart)
async def update_cart_item(
    product_id: str,
    update_data: CartItemUpdate,
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

@router.delete("/{product_id}", response_model=Cart)
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

@router.delete("", response_model=dict)
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
