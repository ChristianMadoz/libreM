from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from database import get_db
from auth_helper import get_session_user
import db_models
from schemas.product import Product

router = APIRouter(prefix="/favorites", tags=["favorites"])

@router.get("", response_model=dict)
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
            products.append(product)
    
    return {"favorites": favorites, "products": products}

@router.post("/{product_id}", response_model=dict)
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

@router.delete("/{product_id}", response_model=dict)
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
