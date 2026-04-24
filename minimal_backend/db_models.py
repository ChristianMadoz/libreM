"""
SQLAlchemy database models for PostgreSQL
"""
from sqlalchemy import Column, String, Integer, Float, Boolean, DateTime, JSON, ForeignKey, Text
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from database import Base

class User(Base):
    __tablename__ = "users"
    
    user_id = Column(String, primary_key=True, index=True)
    google_id = Column(String, nullable=True, unique=True)
    email = Column(String, unique=True, nullable=False, index=True)
    name = Column(String, nullable=False)
    password_hash = Column(String, nullable=True)  # For email/password auth
    picture = Column(String, nullable=True)
    favorites = Column(JSON, default=list)  # List of product_ids
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    
    # Relationships
    sessions = relationship("UserSession", back_populates="user", cascade="all, delete-orphan")
    carts = relationship("Cart", back_populates="user", cascade="all, delete-orphan")
    orders = relationship("Order", back_populates="user", cascade="all, delete-orphan")

class UserSession(Base):
    __tablename__ = "user_sessions"
    
    session_token = Column(String, primary_key=True, index=True)
    user_id = Column(String, ForeignKey("users.user_id", ondelete="CASCADE"), nullable=False)
    expires_at = Column(DateTime(timezone=True), nullable=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    
    # Relationships
    user = relationship("User", back_populates="sessions")

class Category(Base):
    __tablename__ = "categories"
    
    category_id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    icon = Column(String, nullable=False)
    
    # Relationships
    products = relationship("Product", back_populates="category_rel")

class Product(Base):
    __tablename__ = "products"
    
    product_id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False, index=True)
    price = Column(Float, nullable=False)
    original_price = Column(Float, nullable=True)
    discount = Column(Integer, default=0)
    image = Column(String, nullable=False)
    category = Column(String, nullable=False)  # Category name as string
    category_id = Column(Integer, ForeignKey("categories.category_id"), nullable=False)
    free_shipping = Column(Boolean, default=False)
    rating = Column(Float, nullable=True)
    reviews = Column(Integer, default=0)
    sold = Column(Integer, default=0)
    stock = Column(Integer, default=0)
    description = Column(Text, nullable=False)
    features = Column(JSON, default=list)  # List of strings
    colors = Column(JSON, default=list)  # List of strings
    seller = Column(String, nullable=False)
    verified = Column(Boolean, default=False)
    
    # Relationships
    category_rel = relationship("Category", back_populates="products")
    cart_items = relationship("CartItem", back_populates="product", cascade="all, delete-orphan")

class Cart(Base):
    __tablename__ = "carts"
    
    cart_id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(String, ForeignKey("users.user_id", ondelete="CASCADE"), nullable=False, unique=True, index=True)
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
    
    # Relationships
    user = relationship("User", back_populates="carts")
    items = relationship("CartItem", back_populates="cart", cascade="all, delete-orphan")

class CartItem(Base):
    __tablename__ = "cart_items"
    
    cart_item_id = Column(Integer, primary_key=True, autoincrement=True)
    cart_id = Column(Integer, ForeignKey("carts.cart_id", ondelete="CASCADE"), nullable=False)
    product_id = Column(String, ForeignKey("products.product_id"), nullable=False)
    quantity = Column(Integer, nullable=False, default=1)
    color = Column(String, nullable=True)
    added_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    
    # Relationships
    cart = relationship("Cart", back_populates="items")
    product = relationship("Product", back_populates="cart_items")

class Order(Base):
    __tablename__ = "orders"
    
    order_id = Column(String, primary_key=True, index=True)
    user_id = Column(String, ForeignKey("users.user_id", ondelete="CASCADE"), nullable=False, index=True)
    order_number = Column(String, unique=True, nullable=False, index=True)
    items = Column(JSON, nullable=False)  # List of order items
    shipping = Column(JSON, nullable=False)  # Shipping data
    total = Column(Float, nullable=False)
    status = Column(String, default="confirmed")
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    
    # Relationships
    user = relationship("User", back_populates="orders")
