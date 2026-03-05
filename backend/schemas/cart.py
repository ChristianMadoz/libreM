from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
from .product import Product

class CartItemBase(BaseModel):
    product_id: str
    quantity: int = 1
    color: Optional[str] = None

class CartItemCreate(CartItemBase):
    pass

class CartItemUpdate(BaseModel):
    quantity: int

class CartItem(CartItemBase):
    added_at: datetime = Field(default_factory=datetime.utcnow)
    product: Optional[Product] = None
    item_total: Optional[float] = None

    class Config:
        from_attributes = True

class Cart(BaseModel):
    items: List[CartItem] = []
    total: float = 0
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        from_attributes = True
