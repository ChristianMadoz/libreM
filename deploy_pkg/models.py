from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

# User Models
class User(BaseModel):
    user_id: str
    google_id: str
    email: str
    name: str
    picture: Optional[str] = None
    favorites: List[str] = []
    created_at: datetime = Field(default_factory=datetime.utcnow)

class UserSession(BaseModel):
    user_id: str
    session_token: str
    expires_at: datetime
    created_at: datetime = Field(default_factory=datetime.utcnow)

# Product Models
class Product(BaseModel):
    product_id: str
    name: str
    price: float
    original_price: Optional[float] = None
    discount: int = 0
    image: str
    category: str
    category_id: int
    free_shipping: bool = False
    rating: Optional[float] = None
    reviews: int = 0
    sold: int = 0
    stock: int = 0
    description: str
    features: List[str] = []
    colors: List[str] = []
    seller: str
    verified: bool = False

class Category(BaseModel):
    category_id: int
    name: str
    icon: str

# Cart Models
class CartItem(BaseModel):
    product_id: str
    quantity: int
    color: Optional[str] = None
    added_at: datetime = Field(default_factory=datetime.utcnow)

class Cart(BaseModel):
    user_id: str
    items: List[CartItem] = []
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class AddToCartRequest(BaseModel):
    product_id: str
    quantity: int = 1
    color: Optional[str] = None

class UpdateCartRequest(BaseModel):
    quantity: int

# Order Models
class ShippingData(BaseModel):
    full_name: str
    email: str
    phone: str
    address: str
    city: str
    province: str
    postal_code: str

class PaymentData(BaseModel):
    card_number: str
    card_name: str
    expiry_date: str
    cvv: str

class OrderItem(BaseModel):
    product_id: str
    name: str
    price: float
    quantity: int
    color: Optional[str] = None
    image: str

class Order(BaseModel):
    order_id: str
    user_id: str
    order_number: str
    items: List[OrderItem]
    shipping: ShippingData
    total: float
    status: str = "confirmed"
    created_at: datetime = Field(default_factory=datetime.utcnow)

class CreateOrderRequest(BaseModel):
    shipping_data: ShippingData
    payment_data: PaymentData