from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
import uuid
from database import get_db
import db_models
from schemas.product import Product, ProductCreate, ProductList

router = APIRouter(prefix="/products", tags=["products"])

@router.get("", response_model=ProductList)
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
    
    return {"products": products}

@router.get("/{product_id}", response_model=dict)
async def get_product(product_id: str, db: Session = Depends(get_db)):
    """
    Get product by ID
    """
    product = db.query(db_models.Product).filter(
        db_models.Product.product_id == product_id
    ).first()
    
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    return {"product": product}

@router.post("", response_model=dict)
async def create_product(
    product_data: ProductCreate,
    db: Session = Depends(get_db)
):
    """
    Create a new product
    """
    # Generate a unique product_id
    product_id = f"MLB{uuid.uuid4().hex[:12].upper()}"
    
    new_product = db_models.Product(
        product_id=product_id,
        name=product_data.name,
        price=product_data.price,
        original_price=product_data.original_price,
        discount=product_data.discount,
        image=product_data.image,
        category=product_data.category,
        category_id=product_data.category_id,
        free_shipping=product_data.free_shipping,
        rating=5.0, # Default rating for new products
        reviews=0,
        sold=0,
        stock=product_data.stock,
        description=product_data.description,
        features=product_data.features,
        colors=product_data.colors,
        seller=product_data.seller,
        verified=product_data.verified
    )
    
    db.add(new_product)
    db.commit()
    db.refresh(new_product)
    
    return {"success": True, "product_id": product_id, "product": new_product}
