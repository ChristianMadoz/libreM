const { Client } = require('pg');

const connectionString = 'postgresql://postgres:eca71ec8ff16ce808ef35cf63598b488@ciyndj73.us-east.database.insforge.app:5432/insforge?sslmode=require';

const mock_categories = [
    { category_id: 1, name: "Tecnología", icon: "Laptop" },
    { category_id: 2, name: "Hogar y Muebles", icon: "Home" },
    { category_id: 3, name: "Deportes y Fitness", icon: "Dumbbell" },
    { category_id: 4, name: "Moda", icon: "Shirt" },
    { category_id: 5, name: "Electrodomésticos", icon: "Refrigerator" },
    { category_id: 6, name: "Juguetes", icon: "Gamepad2" },
    { category_id: 7, name: "Belleza", icon: "Sparkles" },
    { category_id: 8, name: "Libros", icon: "Book" },
    { category_id: 9, name: "Construcción", icon: "Hammer" },
    { category_id: 10, name: "Automotriz", icon: "Car" },
];

const mock_products = [
    {
        product_id: "prod_1",
        name: "iPhone 15 Pro Max 256GB",
        price: 1299.99,
        original_price: 1499.99,
        discount: 13,
        image: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=500&q=80",
        category: "Tecnología",
        category_id: 1,
        free_shipping: true,
        rating: 4.8,
        reviews: 2847,
        sold: 1523,
        stock: 45,
        description: "iPhone 15 Pro Max con sistema de cámara avanzado, chip A17 Pro y diseño de titanio. Pantalla Super Retina XDR de 6.7 pulgadas.",
        features: JSON.stringify(["256GB almacenamiento", "Cámara 48MP", "Chip A17 Pro", "5G", "Titanio"]),
        colors: JSON.stringify(["Natural", "Azul", "Blanco", "Negro"]),
        seller: "Apple Store Oficial",
        verified: true
    },
    {
        product_id: "prod_2",
        name: "Samsung Smart TV 55\" 4K UHD",
        price: 549.99,
        original_price: 799.99,
        discount: 31,
        image: "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=500&q=80",
        category: "Tecnología",
        category_id: 1,
        free_shipping: true,
        rating: 4.6,
        reviews: 1234,
        sold: 856,
        stock: 23,
        description: "Smart TV Samsung 55 pulgadas con resolución 4K UHD, HDR y sistema operativo Tizen.",
        features: JSON.stringify(["55 pulgadas", "4K UHD", "HDR10+", "Smart TV", "WiFi"]),
        colors: JSON.stringify(["Negro"]),
        seller: "Samsung Official",
        verified: true
    },
    {
        product_id: "prod_3",
        name: "Sony PlayStation 5 Digital Edition",
        price: 449.99,
        original_price: null,
        discount: 0,
        image: "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=500&q=80",
        category: "Tecnología",
        category_id: 1,
        free_shipping: true,
        rating: 4.9,
        reviews: 5678,
        sold: 3421,
        stock: 12,
        description: "PlayStation 5 Edición Digital con SSD ultra rápido y compatibilidad con juegos PS4.",
        features: JSON.stringify(["SSD 825GB", "Ray Tracing", "4K 120fps", "Control DualSense", "Sin lector"]),
        colors: JSON.stringify(["Blanco"]),
        seller: "Sony Gaming",
        verified: true
    },
    {
        product_id: "prod_4",
        name: "MacBook Air M2 13\" 256GB",
        price: 1099.00,
        original_price: 1199.00,
        discount: 8,
        image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500&q=80",
        category: "Tecnología",
        category_id: 1,
        free_shipping: true,
        rating: 4.9,
        reviews: 1876,
        sold: 943,
        stock: 34,
        description: "MacBook Air con chip M2, pantalla Liquid Retina de 13.6 pulgadas y hasta 18 horas de batería.",
        features: JSON.stringify(["Chip M2", "8GB RAM", "256GB SSD", "13.6 pulgadas", "Touch ID"]),
        colors: JSON.stringify(["Plata", "Gris espacial", "Oro", "Azul medianoche"]),
        seller: "Apple Store",
        verified: true
    },
    {
        product_id: "prod_5",
        name: "Sofá Seccional Moderno 3 Plazas",
        price: 899.99,
        original_price: 1299.99,
        discount: 31,
        image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=500&q=80",
        category: "Hogar y Muebles",
        category_id: 2,
        free_shipping: true,
        rating: 4.5,
        reviews: 456,
        sold: 234,
        stock: 8,
        description: "Sofá seccional moderno de 3 plazas con tapizado de tela premium y estructura de madera maciza.",
        features: JSON.stringify(["Tela premium", "3 plazas", "Cojines removibles", "Estructura madera", "Moderno"]),
        colors: JSON.stringify(["Gris", "Beige", "Azul marino"]),
        seller: "Muebles Premium",
        verified: false
    },
    {
        product_id: "prod_6",
        name: "Nike Air Max 90 Running Shoes",
        price: 129.99,
        original_price: 160.00,
        discount: 19,
        image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&q=80",
        category: "Deportes y Fitness",
        category_id: 3,
        free_shipping: true,
        rating: 4.7,
        reviews: 3421,
        sold: 2876,
        stock: 156,
        description: "Zapatillas Nike Air Max 90 con amortiguación Air visible y diseño icónico.",
        features: JSON.stringify(["Air Max", "Suela de goma", "Mesh transpirable", "Running", "Unisex"]),
        colors: JSON.stringify(["Blanco/Negro", "Negro", "Azul", "Rojo"]),
        seller: "Nike Official",
        verified: true
    }
];

async function seed() {
    const client = new Client({ connectionString });
    try {
        await client.connect();
        console.log("Connected to database for seeding...");

        // Clear existing data
        console.log("Clearing existing products and categories...");
        await client.query("DELETE FROM products");
        await client.query("DELETE FROM categories");

        // Seed Categories
        console.log("Seeding categories...");
        for (const cat of mock_categories) {
            await client.query(
                "INSERT INTO categories (category_id, name, icon) VALUES ($1, $2, $3)",
                [cat.category_id, cat.name, cat.icon]
            );
        }
        console.log(`Inserted ${mock_categories.length} categories.`);

        // Seed Products
        console.log("Seeding products...");
        for (const prod of mock_products) {
            await client.query(
                `INSERT INTO products (
                    product_id, name, price, original_price, discount, image, category, 
                    category_id, free_shipping, rating, reviews, sold, stock, description, 
                    features, colors, seller, verified
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)`,
                [
                    prod.product_id, prod.name, prod.price, prod.original_price, prod.discount, 
                    prod.image, prod.category, prod.category_id, prod.free_shipping, 
                    prod.rating, prod.reviews, prod.sold, prod.stock, prod.description, 
                    prod.features, prod.colors, prod.seller, prod.verified
                ]
            );
        }
        console.log(`Inserted ${mock_products.length} products.`);

        console.log("Database seeding completed successfully!");
    } catch (err) {
        console.error("Seeding error:", err);
    } finally {
        await client.end();
    }
}

seed();
