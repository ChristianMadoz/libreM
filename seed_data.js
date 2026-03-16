/**
 * Seed Data para LibreM
 * Pobla categories y products con los datos del mock original
 * 
 * Run: node seed_data.js
 */

const { Client } = require('pg');

const connectionString = "postgresql://postgres:eca71ec8ff16ce808ef35cf63598b488@ciyndj73.us-east.database.insforge.app:5432/insforge?sslmode=require";

async function seed() {
    const client = new Client({
        connectionString: connectionString,
    });

    try {
        await client.connect();
        console.log('✅ Conectado a la base de datos\n');

        // =====================================================
        // CATEGORÍAS
        // =====================================================
        console.log('📁 Insertando categorías...');

        const categories = [
            { id: 1, name: 'Tecnología', icon: 'Laptop' },
            { id: 2, name: 'Hogar y Muebles', icon: 'Home' },
            { id: 3, name: 'Deportes y Fitness', icon: 'Dumbbell' },
            { id: 4, name: 'Moda', icon: 'Shirt' },
            { id: 5, name: 'Electrodomésticos', icon: 'Refrigerator' },
            { id: 6, name: 'Juguetes', icon: 'Gamepad2' },
            { id: 7, name: 'Belleza', icon: 'Sparkles' },
            { id: 8, name: 'Libros', icon: 'Book' },
            { id: 9, name: 'Construcción', icon: 'Hammer' },
            { id: 10, name: 'Automotriz', icon: 'Car' },
        ];

        for (const cat of categories) {
            await client.query(
                `INSERT INTO categories (category_id, name, icon) 
                 VALUES ($1, $2, $3)
                 ON CONFLICT (category_id) DO UPDATE SET name = $2, icon = $3`,
                [cat.id, cat.name, cat.icon]
            );
        }
        console.log(`   ✓ ${categories.length} categorías insertadas\n`);

        // =====================================================
        // PRODUCTOS
        // =====================================================
        console.log('📦 Insertando productos...');

        const products = [
            {
                product_id: 'MLB1A2B3C4D5E6',
                name: 'iPhone 15 Pro Max 256GB',
                price: 1299.99,
                original_price: 1499.99,
                discount: 13,
                image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=500&q=80',
                category: 'Tecnología',
                category_id: 1,
                free_shipping: true,
                rating: 4.8,
                reviews: 2847,
                sold: 1523,
                stock: 45,
                description: 'iPhone 15 Pro Max con sistema de cámara avanzado, chip A17 Pro y diseño de titanio. Pantalla Super Retina XDR de 6.7 pulgadas.',
                features: ['256GB almacenamiento', 'Cámara 48MP', 'Chip A17 Pro', '5G', 'Titanio'],
                colors: ['Natural', 'Azul', 'Blanco', 'Negro'],
                seller: 'Apple Store Oficial',
                verified: true
            },
            {
                product_id: 'MLB2F3G4H5I6J7',
                name: 'Samsung Smart TV 55" 4K UHD',
                price: 549.99,
                original_price: 799.99,
                discount: 31,
                image: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=500&q=80',
                category: 'Tecnología',
                category_id: 1,
                free_shipping: true,
                rating: 4.6,
                reviews: 1234,
                sold: 856,
                stock: 23,
                description: 'Smart TV Samsung 55 pulgadas con resolución 4K UHD, HDR y sistema operativo Tizen.',
                features: ['55 pulgadas', '4K UHD', 'HDR10+', 'Smart TV', 'WiFi'],
                colors: ['Negro'],
                seller: 'Samsung Official',
                verified: true
            },
            {
                product_id: 'MLB3K4L5M6N7O8',
                name: 'Sony PlayStation 5 Digital Edition',
                price: 449.99,
                original_price: null,
                discount: 0,
                image: 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=500&q=80',
                category: 'Tecnología',
                category_id: 1,
                free_shipping: true,
                rating: 4.9,
                reviews: 5678,
                sold: 3421,
                stock: 12,
                description: 'PlayStation 5 Edición Digital con SSD ultra rápido y compatibilidad con juegos PS4.',
                features: ['SSD 825GB', 'Ray Tracing', '4K 120fps', 'Control DualSense', 'Sin lector'],
                colors: ['Blanco'],
                seller: 'Sony Gaming',
                verified: true
            },
            {
                product_id: 'MLB4P5Q6R7S8T9',
                name: 'MacBook Air M2 13" 256GB',
                price: 1099.00,
                original_price: 1199.00,
                discount: 8,
                image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500&q=80',
                category: 'Tecnología',
                category_id: 1,
                free_shipping: true,
                rating: 4.9,
                reviews: 1876,
                sold: 943,
                stock: 34,
                description: 'MacBook Air con chip M2, pantalla Liquid Retina de 13.6 pulgadas y hasta 18 horas de batería.',
                features: ['Chip M2', '8GB RAM', '256GB SSD', '13.6 pulgadas', 'Touch ID'],
                colors: ['Plata', 'Gris espacial', 'Oro', 'Azul medianoche'],
                seller: 'Apple Store',
                verified: true
            },
            {
                product_id: 'MLB5U6V7W8X9Y0',
                name: 'Sofá Seccional Moderno 3 Plazas',
                price: 899.99,
                original_price: 1299.99,
                discount: 31,
                image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=500&q=80',
                category: 'Hogar y Muebles',
                category_id: 2,
                free_shipping: true,
                rating: 4.5,
                reviews: 456,
                sold: 234,
                stock: 8,
                description: 'Sofá seccional moderno de 3 plazas con tapizado de tela premium y estructura de madera maciza.',
                features: ['Tela premium', '3 plazas', 'Cojines removibles', 'Estructura madera', 'Moderno'],
                colors: ['Gris', 'Beige', 'Azul marino'],
                seller: 'Muebles Premium',
                verified: false
            },
            {
                product_id: 'MLB6Z7A8B9C0D1',
                name: 'Nike Air Max 90 Running Shoes',
                price: 129.99,
                original_price: 160.00,
                discount: 19,
                image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&q=80',
                category: 'Deportes y Fitness',
                category_id: 3,
                free_shipping: true,
                rating: 4.7,
                reviews: 3421,
                sold: 2876,
                stock: 156,
                description: 'Zapatillas Nike Air Max 90 con amortiguación Air visible y diseño icónico.',
                features: ['Air Max', 'Suela de goma', 'Mesh transpirable', 'Running', 'Unisex'],
                colors: ['Blanco/Negro', 'Negro', 'Azul', 'Rojo'],
                seller: 'Nike Official',
                verified: true
            },
            {
                product_id: 'MLB7E8F9G0H1I2',
                name: 'Cámara Canon EOS R6 Mark II',
                price: 2499.00,
                original_price: null,
                discount: 0,
                image: 'https://images.unsplash.com/photo-1606980441434-a72d0e8d4954?w=500&q=80',
                category: 'Tecnología',
                category_id: 1,
                free_shipping: true,
                rating: 4.9,
                reviews: 876,
                sold: 423,
                stock: 15,
                description: 'Cámara mirrorless full-frame con sensor de 24.2MP, vídeo 4K y estabilización de 5 ejes.',
                features: ['24.2MP', '4K 60fps', 'Estabilización 5 ejes', 'WiFi', 'Full Frame'],
                colors: ['Negro'],
                seller: 'Canon Store',
                verified: true
            },
            {
                product_id: 'MLB8J9K0L1M2N3',
                name: 'Samsung Galaxy S24 Ultra 512GB',
                price: 1199.99,
                original_price: 1399.99,
                discount: 14,
                image: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=500&q=80',
                category: 'Tecnología',
                category_id: 1,
                free_shipping: true,
                rating: 4.8,
                reviews: 2134,
                sold: 1567,
                stock: 67,
                description: 'Galaxy S24 Ultra con S Pen integrado, cámara de 200MP y pantalla Dynamic AMOLED 2X.',
                features: ['512GB', 'Cámara 200MP', 'S Pen', '5G', 'Titanio'],
                colors: ['Titanio Negro', 'Titanio Gris', 'Titanio Violeta'],
                seller: 'Samsung Official',
                verified: true
            },
            {
                product_id: 'MLB9O0P1Q2R3S4',
                name: 'Refrigerador LG Side by Side 601L',
                price: 1899.99,
                original_price: 2299.99,
                discount: 17,
                image: 'https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?w=500&q=80',
                category: 'Electrodomésticos',
                category_id: 5,
                free_shipping: true,
                rating: 4.6,
                reviews: 567,
                sold: 234,
                stock: 12,
                description: 'Refrigerador LG Side by Side con dispensador de agua y hielo, tecnología Inverter.',
                features: ['601L', 'Inverter', 'Dispensador', 'No Frost', 'Smart Diagnosis'],
                colors: ['Acero inoxidable'],
                seller: 'LG Electronics',
                verified: true
            },
            {
                product_id: 'MLB0T1U2V3W4X5',
                name: 'Bicicleta Mountain Bike Rodado 29',
                price: 599.99,
                original_price: 799.99,
                discount: 25,
                image: 'https://images.unsplash.com/photo-1576435728678-68d0fbf94e91?w=500&q=80',
                category: 'Deportes y Fitness',
                category_id: 3,
                free_shipping: true,
                rating: 4.5,
                reviews: 789,
                sold: 456,
                stock: 23,
                description: 'Bicicleta Mountain Bike rodado 29 con cuadro de aluminio y cambios Shimano 21 velocidades.',
                features: ['Rodado 29', 'Aluminio', 'Shimano 21v', 'Frenos disco', 'Suspensión'],
                colors: ['Negro/Rojo', 'Negro/Azul', 'Blanco/Negro'],
                seller: 'BikeStore Pro',
                verified: false
            },
            {
                product_id: 'MLB1Y2Z3A4B5C6',
                name: 'Auriculares Sony WH-1000XM5',
                price: 349.99,
                original_price: 399.99,
                discount: 13,
                image: 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=500&q=80',
                category: 'Tecnología',
                category_id: 1,
                free_shipping: true,
                rating: 4.9,
                reviews: 4567,
                sold: 3421,
                stock: 89,
                description: 'Auriculares inalámbricos con cancelación de ruido líder en la industria y 30 horas de batería.',
                features: ['Cancelación ruido', '30h batería', 'Bluetooth 5.2', 'LDAC', 'Multipunto'],
                colors: ['Negro', 'Plata'],
                seller: 'Sony Audio',
                verified: true
            },
            {
                product_id: 'MLB2D3E4F5G6H7',
                name: 'Silla Gamer Ergonómica RGB',
                price: 299.99,
                original_price: 449.99,
                discount: 33,
                image: 'https://images.unsplash.com/photo-1598550476439-6847785fcea6?w=500&q=80',
                category: 'Hogar y Muebles',
                category_id: 2,
                free_shipping: true,
                rating: 4.4,
                reviews: 1234,
                sold: 876,
                stock: 34,
                description: 'Silla gamer ergonómica con iluminación RGB, reposabrazos 4D y reclinable hasta 180°.',
                features: ['RGB', 'Reclinable 180°', 'Reposabrazos 4D', 'Cuero PU', 'Ergonómica'],
                colors: ['Negro/Rojo', 'Negro/Azul', 'Negro/Rosa'],
                seller: 'Gaming Gear',
                verified: false
            }
        ];

        for (const prod of products) {
            await client.query(
                `INSERT INTO products (
                    product_id, name, price, original_price, discount, image, 
                    category, category_id, free_shipping, rating, reviews, sold, 
                    stock, description, features, colors, seller, verified
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
                ON CONFLICT (product_id) DO UPDATE SET
                    name = $2, price = $3, original_price = $4, discount = $5, image = $6,
                    category = $7, category_id = $8, free_shipping = $9, rating = $10,
                    reviews = $11, sold = $12, stock = $13, description = $14,
                    features = $15, colors = $16, seller = $17, verified = $18`,
                [
                    prod.product_id, prod.name, prod.price, prod.original_price, prod.discount,
                    prod.image, prod.category, prod.category_id, prod.free_shipping,
                    prod.rating, prod.reviews, prod.sold, prod.stock, prod.description,
                    JSON.stringify(prod.features), JSON.stringify(prod.colors), prod.seller, prod.verified
                ]
            );
        }
        console.log(`   ✓ ${products.length} productos insertados\n`);

        // =====================================================
        // RESUMEN FINAL
        // =====================================================
        console.log('📊 Resumen final:\n');

        const tables = ['categories', 'products'];
        for (const table of tables) {
            const result = await client.query(`SELECT COUNT(*) FROM ${table}`);
            console.log(`  ✓ ${table}: ${result.rows[0].count} registros`);
        }

        console.log('\n✅ ¡Seed completado exitosamente!');

    } catch (err) {
        console.error('❌ Error:', err.message);
        throw err;
    } finally {
        await client.end();
    }
}

seed().catch(console.error);
