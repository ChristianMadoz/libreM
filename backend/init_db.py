"""
Initialize database tables
Run this script to create all tables in the database
"""
import sys
import os

# Add current directory to path so we can import modules if run from root
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy import text
from database import engine, Base
import db_models  # Ensure all models are imported

def init_db():
    """Create all tables in the database"""
    print("Cleaning up database...")
    
    # List of tables to drop in order (child before parent)
    tables = [
        "order_items", # In case it exists from other versions
        "orders", 
        "cart_items", 
        "carts", 
        "products", 
        "categories", 
        "user_sessions", 
        "users"
    ]
    
    with engine.connect() as conn:
        for table in tables:
            try:
                conn.execute(text(f'DROP TABLE IF EXISTS "{table}" CASCADE'))
                conn.commit()
            except Exception as e:
                print(f"Notice: Could not drop table {table}: {e}")
                
    print("Creating database tables...")
    Base.metadata.create_all(bind=engine)
    print("Database tables created successfully!")

if __name__ == "__main__":
    init_db()
