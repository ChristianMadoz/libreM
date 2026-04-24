import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv

load_dotenv('.env')

async def check_db():
    try:
        client = AsyncIOMotorClient(os.environ['MONGO_URL'])
        db = client[os.environ['DB_NAME']]
        products_count = await db.products.count_documents({})
        categories_count = await db.categories.count_documents({})
        print(f"Products: {products_count}")
        print(f"Categories: {categories_count}")
    except ImportError:
        print("Error: motor not installed")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    try:
        asyncio.run(check_db())
    except ImportError:
        print("Error: motor not installed (from main)")
