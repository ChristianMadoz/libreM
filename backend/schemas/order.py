from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

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
    order_number: str
    items: List[OrderItem]
    shipping: ShippingData
    total: float
    status: str = "confirmed"
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        from_attributes = True

class OrderCreate(BaseModel):
    shipping_data: ShippingData
    payment_data: PaymentData

class OrderList(BaseModel):
    orders: List[Order]
