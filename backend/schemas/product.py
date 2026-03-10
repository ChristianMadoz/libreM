from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional

class ProductBase(BaseModel):
    name: str
    price: float
    original_price: Optional[float] = Field(None, alias="originalPrice")
    discount: int = 0
    image: str
    category: str
    category_id: int = Field(..., alias="categoryId")
    free_shipping: bool = Field(False, alias="freeShipping")
    stock: int = 0
    description: str
    features: List[str] = []
    colors: List[str] = []
    seller: str
    verified: bool = False

    model_config = ConfigDict(
        from_attributes=True,
        populate_by_name=True
    )

class ProductCreate(ProductBase):
    pass

class Product(ProductBase):
    product_id: str = Field(..., alias="id")
    rating: Optional[float] = None
    reviews: int = 0
    sold: int = 0

class Category(BaseModel):
    category_id: int = Field(..., alias="id")
    name: str
    icon: str

    model_config = ConfigDict(
        from_attributes=True,
        populate_by_name=True
    )

class ProductList(BaseModel):
    products: List[Product]

class CategoryList(BaseModel):
    categories: List[Category]
