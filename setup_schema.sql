-- =====================================================
-- LibreM - Esquema completo de base de datos para InsForge
-- =====================================================

-- =====================================================
-- 1. TABLA: categories
-- =====================================================
CREATE TABLE IF NOT EXISTS categories (
    category_id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    icon TEXT NOT NULL
);

-- =====================================================
-- 2. TABLA: products
-- =====================================================
CREATE TABLE IF NOT EXISTS products (
    product_id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    price NUMERIC(10, 2) NOT NULL,
    original_price NUMERIC(10, 2),
    discount INTEGER DEFAULT 0,
    image TEXT NOT NULL,
    category TEXT NOT NULL,
    category_id INTEGER REFERENCES categories(category_id),
    free_shipping BOOLEAN DEFAULT FALSE,
    rating NUMERIC(3, 2),
    reviews INTEGER DEFAULT 0,
    sold INTEGER DEFAULT 0,
    stock INTEGER DEFAULT 0,
    description TEXT NOT NULL,
    features JSONB DEFAULT '[]',
    colors JSONB DEFAULT '[]',
    seller TEXT NOT NULL,
    verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 3. TABLA: users (gestiona perfiles de usuario)
-- =====================================================
CREATE TABLE IF NOT EXISTS users (
    user_id TEXT PRIMARY KEY,
    google_id TEXT UNIQUE,
    email TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    password_hash TEXT,
    picture TEXT,
    favorites TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 4. TABLA: carts (carrito por usuario)
-- =====================================================
CREATE TABLE IF NOT EXISTS carts (
    cart_id SERIAL PRIMARY KEY,
    user_id TEXT REFERENCES users(user_id) ON DELETE CASCADE UNIQUE,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 5. TABLA: cart_items (items del carrito)
-- =====================================================
CREATE TABLE IF NOT EXISTS cart_items (
    cart_item_id SERIAL PRIMARY KEY,
    cart_id INTEGER REFERENCES carts(cart_id) ON DELETE CASCADE,
    product_id TEXT REFERENCES products(product_id),
    quantity INTEGER NOT NULL DEFAULT 1,
    color TEXT,
    added_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 6. TABLA: orders (órdenes de compra)
-- =====================================================
CREATE TABLE IF NOT EXISTS orders (
    order_id TEXT PRIMARY KEY,
    user_id TEXT REFERENCES users(user_id) ON DELETE CASCADE,
    order_number TEXT UNIQUE NOT NULL,
    items JSONB NOT NULL,
    shipping JSONB NOT NULL,
    total NUMERIC(10, 2) NOT NULL,
    status TEXT DEFAULT 'confirmed',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 7. TABLA: favorites (productos favoritos)
-- =====================================================
CREATE TABLE IF NOT EXISTS favorites (
    favorite_id SERIAL PRIMARY KEY,
    user_id TEXT REFERENCES users(user_id) ON DELETE CASCADE,
    product_id TEXT REFERENCES products(product_id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, product_id)
);

-- =====================================================
-- ÍNDICES para mejorar rendimiento
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_name ON products(name);
CREATE INDEX IF NOT EXISTS idx_products_price ON products(price);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id);
CREATE INDEX IF NOT EXISTS idx_carts_user_id ON carts(user_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_cart_id ON cart_items(cart_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_product_id ON cart_items(product_id);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number);
CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_product_id ON favorites(product_id);

-- =====================================================
-- ROW LEVEL SECURITY (RLS) - Políticas de seguridad
-- =====================================================

-- Habilitar RLS en todas las tablas
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- POLÍTICAS RLS
-- =====================================================

-- categories: Todos pueden leer, solo auth para escribir
CREATE POLICY "Anyone can view categories" ON categories
    FOR SELECT USING (true);

-- products: Todos pueden leer, solo auth para escribir
CREATE POLICY "Anyone can view products" ON products
    FOR SELECT USING (true);

-- users: Cada usuario solo ve su propio registro
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert own profile" ON users
    FOR INSERT WITH CHECK (auth.uid()::text = user_id);

-- carts: Cada usuario solo ve y modifica su propio carrito
CREATE POLICY "Users can view own cart" ON carts
    FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Users can update own cart" ON carts
    FOR UPDATE USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert own cart" ON carts
    FOR INSERT WITH CHECK (auth.uid()::text = user_id);

-- cart_items: Acceso a través del carrito del usuario
CREATE POLICY "Users can view own cart items" ON cart_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM carts WHERE carts.cart_id = cart_items.cart_id 
            AND carts.user_id = auth.uid()::text
        )
    );

CREATE POLICY "Users can insert own cart items" ON cart_items
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM carts WHERE carts.cart_id = cart_items.cart_id 
            AND carts.user_id = auth.uid()::text
        )
    );

CREATE POLICY "Users can update own cart items" ON cart_items
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM carts WHERE carts.cart_id = cart_items.cart_id 
            AND carts.user_id = auth.uid()::text
        )
    );

CREATE POLICY "Users can delete own cart items" ON cart_items
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM carts WHERE carts.cart_id = cart_items.cart_id 
            AND carts.user_id = auth.uid()::text
        )
    );

-- orders: Cada usuario solo ve sus propias órdenes
CREATE POLICY "Users can view own orders" ON orders
    FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert own orders" ON orders
    FOR INSERT WITH CHECK (auth.uid()::text = user_id);

-- favorites: Cada usuario solo ve y modifica sus propios favoritos
CREATE POLICY "Users can view own favorites" ON favorites
    FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert own favorites" ON favorites
    FOR INSERT WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can delete own favorites" ON favorites
    FOR DELETE USING (auth.uid()::text = user_id);

-- =====================================================
-- Fin del script
-- =====================================================
