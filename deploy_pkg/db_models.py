from sqlalchemy import Column, String, Float, Integer, Boolean, DateTime, ForeignKey, JSON, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base

class DbUser(Base):
    __tablename__ = "users"

    user_id = Column(String, primary_key=True)
    google_id = Column(String, unique=True, nullable=True)
    email = Column(String, unique=True, index=True)
    name = Column(String)
    password_hash = Column(String, nullable=True)
    picture = Column(String, nullable=True)
    favorites = Column(JSON, default=list) # Store as list of product_ids
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    sessions = relationship("DbUserSession", back_populates="user", cascade="all, delete-orphan")
    orders = relationship("DbOrder", back_populates="user")
    cart = relationship("DbCart", back_populates="user", uselist=False)

class DbUserSession(Base):
    __tablename__ = "user_sessions"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(String, ForeignKey("users.user_id"))
    session_token = Column(String, unique=True, index=True)
    expires_at = Column(DateTime(timezone=True))
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("DbUser", back_populates="sessions")

class DbCategory(Base):
    __tablename__ = "categories"

    category_id = Column(Integer, primary_key=True)
    name = Column(String, unique=True)
    icon = Column(String)

    products = relationship("DbProduct", back_populates="category_rel")

class DbProduct(Base):
    __tablename__ = "products"

    product_id = Column(String, primary_key=True)
    name = Column(String, index=True)
    price = Column(Float)
    original_price = Column(Float, nullable=True)
    discount = Column(Integer, default=0)
    image = Column(String)
    category = Column(String)
    category_id = Column(Integer, ForeignKey("categories.category_id"))
    free_shipping = Column(Boolean, default=False)
    rating = Column(Float, nullable=True)
    reviews = Column(Integer, default=0)
    sold = Column(Integer, default=0)
    stock = Column(Integer, default=0)
    description = Column(Text)
    features = Column(JSON, default=list)
    colors = Column(JSON, default=list)
    seller = Column(String)
    verified = Column(Boolean, default=False)

    category_rel = relationship("DbCategory", back_populates="products")

class DbCart(Base):
    __tablename__ = "carts"

    user_id = Column(String, ForeignKey("users.user_id"), primary_key=True)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), server_default=func.now())

    user = relationship("DbUser", back_populates="cart")
    items = relationship("DbCartItem", back_populates="cart", cascade="all, delete-orphan")

class DbCartItem(Base):
    __tablename__ = "cart_items"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(String, ForeignKey("carts.user_id"))
    product_id = Column(String, ForeignKey("products.product_id"))
    quantity = Column(Integer, default=1)
    color = Column(String, nullable=True)
    added_at = Column(DateTime(timezone=True), server_default=func.now())

    cart = relationship("DbCart", back_populates="items")
    product = relationship("DbProduct")

class DbOrder(Base):
    __tablename__ = "orders"

    order_id = Column(String, primary_key=True)
    user_id = Column(String, ForeignKey("users.user_id"))
    order_number = Column(String, unique=True)
    total = Column(Float)
    status = Column(String, default="confirmed")
    shipping_data = Column(JSON) # Store ShippingData model as JSON
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("DbUser", back_populates="orders")
    items = relationship("DbOrderItem", back_populates="order", cascade="all, delete-orphan")

class DbOrderItem(Base):
    __tablename__ = "order_items"

    id = Column(Integer, primary_key=True, autoincrement=True)
    order_id = Column(String, ForeignKey("orders.order_id"))
    product_id = Column(String)
    name = Column(String)
    price = Column(Float)
    quantity = Column(Integer)
    color = Column(String, nullable=True)
    image = Column(String)

    order = relationship("DbOrder", back_populates="items")
