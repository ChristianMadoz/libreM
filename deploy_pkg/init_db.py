import asyncio
from sqlalchemy import text
from database import engine, Base
import db_models # Ensure all models are imported

async def init_models():
    # List of tables in order (if CASCADE is used, order matters less but still good practice)
    tables = ["order_items", "orders", "cart_items", "carts", "products", "categories", "user_sessions", "users"]
    
    async with engine.begin() as conn:
        print("Cleaning up database...")
        for table in tables:
            try:
                await conn.execute(text(f'DROP TABLE IF EXISTS "{table}" CASCADE'))
            except Exception as e:
                print(f"Notice: Could not drop table {table}: {e}")
                
        print("Creating new tables...")
        await conn.run_sync(Base.metadata.create_all)

if __name__ == "__main__":
    asyncio.run(init_models())
    print("Database tables created successfully!")
