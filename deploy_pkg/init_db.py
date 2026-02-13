import asyncio
from database import engine, Base
import db_models # Ensure all models are imported

async def init_models():
    async with engine.begin() as conn:
        # For development, we drop and recreate (be careful in production!)
        # await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)

if __name__ == "__main__":
    asyncio.run(init_models())
    print("Database tables created successfully!")
