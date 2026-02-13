import asyncio
import hashlib
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from database import AsyncSessionLocal, engine
from db_models import DbProduct, DbCategory, DbUser
import uuid

# Re-using the mock data from original seed
mock_categories = [
    {"category_id": 1, "name": "Tecnología", "icon": "Laptop"},
    {"category_id": 2, "name": "Hogar y Muebles", "icon": "Home"},
    {"category_id": 3, "name": "Deportes y Fitness", "icon": "Dumbbell"},
    {"category_id": 4, "name": "Moda", "icon": "Shirt"},
    {"category_id": 5, "name": "Electrodomésticos", "icon": "Refrigerator"},
    {"category_id": 6, "name": "Juguetes", "icon": "Gamepad2"},
    {"category_id": 7, "name": "Belleza", "icon": "Sparkles"},
    {"category_id": 8, "name": "Libros", "icon": "Book"},
    {"category_id": 9, "name": "Construcción", "icon": "Hammer"},
    {"category_id": 10, "name": "Automotriz", "icon": "Car"},
]

mock_products = [
    {
        "product_id": "prod_1",
        "name": "iPhone 15 Pro Max 256GB",
        "price": 1299.99,
        "original_price": 1499.99,
        "discount": 13,
        "image": "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=500&q=80",
        "category": "Tecnología",
        "category_id": 1,
        "free_shipping": True,
        "rating": 4.8,
        "reviews": 2847,
        "sold": 1523,
        "stock": 45,
        "description": "iPhone 15 Pro Max con sistema de cámara avanzado, chip A17 Pro y diseño de titanio. Pantalla Super Retina XDR de 6.7 pulgadas.",
        "features": ["256GB almacenamiento", "Cámara 48MP", "Chip A17 Pro", "5G", "Titanio"],
        "colors": ["Natural", "Azul", "Blanco", "Negro"],
        "seller": "Apple Store Oficial",
        "verified": True
    },
    {
        "product_id": "prod_2",
        "name": "Samsung Smart TV 55\" 4K UHD",
        "price": 549.99,
        "original_price": 799.99,
        "discount": 31,
        "image": "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=500&q=80",
        "category": "Tecnología",
        "category_id": 1,
        "free_shipping": True,
        "rating": 4.6,
        "reviews": 1234,
        "sold": 856,
        "stock": 23,
        "description": "Smart TV Samsung 55 pulgadas con resolución 4K UHD, HDR y sistema operativo Tizen.",
        "features": ["55 pulgadas", "4K UHD", "HDR10+", "Smart TV", "WiFi"],
        "colors": ["Negro"],
        "seller": "Samsung Official",
        "verified": True
    },
    {
        "product_id": "prod_3",
        "name": "Sony PlayStation 5 Digital Edition",
        "price": 449.99,
        "original_price": None,
        "discount": 0,
        "image": "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=500&q=80",
        "category": "Tecnología",
        "category_id": 1,
        "free_shipping": True,
        "rating": 4.9,
        "reviews": 5678,
        "sold": 3421,
        "stock": 12,
        "description": "PlayStation 5 Edición Digital con SSD ultra rápido y compatibilidad con juegos PS4.",
        "features": ["SSD 825GB", "Ray Tracing", "4K 120fps", "Control DualSense", "Sin lector"],
        "colors": ["Blanco"],
        "seller": "Sony Gaming",
        "verified": True
    },
    {
        "product_id": "prod_4",
        "name": "MacBook Air M2 13\" 256GB",
        "price": 1099.00,
        "original_price": 1199.00,
        "discount": 8,
        "image": "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500&q=80",
        "category": "Tecnología",
        "category_id": 1,
        "free_shipping": True,
        "rating": 4.9,
        "reviews": 1876,
        "sold": 943,
        "stock": 34,
        "description": "MacBook Air con chip M2, pantalla Liquid Retina de 13.6 pulgadas y hasta 18 horas de batería.",
        "features": ["Chip M2", "8GB RAM", "256GB SSD", "13.6 pulgadas", "Touch ID"],
        "colors": ["Plata", "Gris espacial", "Oro", "Azul medianoche"],
        "seller": "Apple Store",
        "verified": True
    }
]

async def seed_postgres():
    print("Starting PostgreSQL seed...")
    async with AsyncSessionLocal() as db:
        # Create Categories
        print("Seeding categories...")
        for cat_data in mock_categories:
            cat = DbCategory(**cat_data)
            await db.merge(cat)
        
        # Create Products
        print("Seeding products...")
        for prod_data in mock_products:
            prod = DbProduct(**prod_data)
            await db.merge(prod)
        
        # Create Admin User
        print("Creating administrator...")
        admin_email = "admin@librem.com"
        res = await db.execute(select(DbUser).where(DbUser.email == admin_email))
        if not res.scalar_one_or_none():
            admin_pwd = hashlib.sha256("admin123".encode()).hexdigest()
            admin = DbUser(
                user_id="user_admin_001",
                email=admin_email,
                name="Administrador LibreM",
                password_hash=admin_pwd,
                favorites=[]
            )
            db.add(admin)
            print(f"Admin created: {admin_email} / pwd: admin123")

        # Create Common User
        print("Creating common user...")
        user_email = "usuario@test.com"
        res = await db.execute(select(DbUser).where(DbUser.email == user_email))
        if not res.scalar_one_or_none():
            user_pwd = hashlib.sha256("user123".encode()).hexdigest()
            user = DbUser(
                user_id=f"user_{uuid.uuid4().hex[:12]}",
                email=user_email,
                name="Usuario de Prueba",
                password_hash=user_pwd,
                favorites=[]
            )
            db.add(user)
            print(f"Common user created: {user_email} / pwd: user123")
            
        await db.commit()
    print("Seed process finished!")

if __name__ == "__main__":
    asyncio.run(seed_postgres())
