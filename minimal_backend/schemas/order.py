from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
from datetime import datetime

class ShippingData(BaseModel):
    full_name: str = Field(..., alias="fullName")
    email: str
    phone: str
    address: str
    city: str
    province: str
    postal_code: str = Field(..., alias="postalCode")

    model_config = ConfigDict(
        from_attributes=True,
        populate_by_name=True
    )

class PaymentData(BaseModel):
    card_number: str = Field(..., alias="cardNumber")
    card_name: str = Field(..., alias="cardName")
    expiry_date: str = Field(..., alias="expiryDate")
    cvv: str

class OrderItem(BaseModel):
    product_id: str = Field(..., alias="productId")
    name: str
    price: float
    quantity: int
    color: Optional[str] = None
    image: str

class Order(BaseModel):
    order_id: str = Field(..., alias="id")
    order_number: str = Field(..., alias="orderNumber")
    items: List[OrderItem]
    shipping: ShippingData
    total: float
    status: str = "confirmed"
    created_at: datetime = Field(default_factory=datetime.utcnow)

    model_config = ConfigDict(
        from_attributes=True,
        populate_by_name=True
    )

class OrderCreate(BaseModel):
    shipping_data: ShippingData = Field(..., alias="shipping")
    payment_data: PaymentData = Field(..., alias="payment")

class OrderList(BaseModel):
    orders: List[Order]
