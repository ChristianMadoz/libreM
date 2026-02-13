"""
Initialize database tables
Run this script to create all tables in the database
"""
from database import engine, Base
from db_models import User, UserSession, Category, Product, Cart, CartItem, Order

def init_db():
    """Create all tables in the database"""
    print("Creating database tables...")
    Base.metadata.create_all(bind=engine)
    print("Database tables created successfully!")

if __name__ == "__main__":
    init_db()
