from pydantic import BaseModel, Field
from typing import List, Optional

class ProductBase(BaseModel):
    name: str
    price: float
    original_price: Optional[float] = None
    discount: int = 0
    image: str
    category: str
    category_id: int
    free_shipping: bool = False
    stock: int = 0
    description: str
    features: List[str] = []
    colors: List[str] = []
    seller: str
    verified: bool = False

class ProductCreate(ProductBase):
    pass

class Product(ProductBase):
    product_id: str
    rating: Optional[float] = None
    reviews: int = 0
    sold: int = 0

    class Config:
        from_attributes = True

class Category(BaseModel):
    category_id: int
    name: str
    icon: str

    class Config:
        from_attributes = True

class ProductList(BaseModel):
    products: List[Product]

class CategoryList(BaseModel):
    categories: List[Category]
