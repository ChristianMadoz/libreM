from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from datetime import datetime
import uuid
from database import get_db
from auth_helper import get_session_user
import db_models
from schemas.order import OrderCreate, Order, OrderList

router = APIRouter(prefix="/orders", tags=["orders"])

@router.post("", response_model=Order)
async def create_order(
    order_data_req: OrderCreate,
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
    
    # Create the shipping dict for DB
    shipping_dict = order_data_req.shipping_data.dict()
    
    new_order = db_models.Order(
        order_id=order_id,
        user_id=user["user_id"],
        order_number=order_number,
        items=order_items,
        shipping=shipping_dict,
        total=total,
        status="confirmed",
        created_at=datetime.utcnow()
    )
    
    db.add(new_order)
    
    # Clear cart after order
    db.query(db_models.CartItem).filter(db_models.CartItem.cart_id == cart.cart_id).delete()
    db.commit()
    db.refresh(new_order)
    
    return new_order

@router.get("", response_model=OrderList)
async def get_orders(
    request: Request,
    db: Session = Depends(get_db)
):
    """
    Get user's order history
    """
    user = await get_session_user(request, db)
    
    orders = db.query(db_models.Order).filter(
        db_models.Order.user_id == user["user_id"]
    ).order_by(db_models.Order.created_at.desc()).all()
    
    return {"orders": orders}

@router.get("/{order_id}", response_model=Order)
async def get_order(
    order_id: str,
    request: Request,
    db: Session = Depends(get_db)
):
    """
    Get order details by ID
    """
    user = await get_session_user(request, db)
    
    order = db.query(db_models.Order).filter(
        db_models.Order.order_id == order_id,
        db_models.Order.user_id == user["user_id"]
    ).first()
    
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    return order
