-- =====================================================
-- Actualizar políticas RLS para carrito y favoritos
-- =====================================================

-- =====================================================
-- CARTS
-- =====================================================

-- Drop políticas viejas
DROP POLICY IF EXISTS "Users can view own cart" ON carts;
DROP POLICY IF EXISTS "Users can update own cart" ON carts;
DROP POLICY IF EXISTS "Users can insert own cart" ON carts;
DROP POLICY IF EXISTS "Authenticated users can view own cart" ON carts;
DROP POLICY IF EXISTS "Authenticated users can manage own cart" ON carts;

-- Política para SELECT (lectura)
CREATE POLICY "Authenticated users can view own cart" ON carts
    FOR SELECT
    TO authenticated
    USING (auth.uid()::text = user_id);

-- Política para INSERT (creación)
CREATE POLICY "Authenticated users can create own cart" ON carts
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid()::text = user_id);

-- Política para UPDATE (actualización)
CREATE POLICY "Authenticated users can update own cart" ON carts
    FOR UPDATE
    TO authenticated
    USING (auth.uid()::text = user_id)
    WITH CHECK (auth.uid()::text = user_id);

-- Política para DELETE (eliminación)
CREATE POLICY "Authenticated users can delete own cart" ON carts
    FOR DELETE
    TO authenticated
    USING (auth.uid()::text = user_id);

-- =====================================================
-- CART_ITEMS
-- =====================================================

-- Drop políticas viejas
DROP POLICY IF EXISTS "Users can view own cart items" ON cart_items;
DROP POLICY IF EXISTS "Users can insert own cart items" ON cart_items;
DROP POLICY IF EXISTS "Users can update own cart items" ON cart_items;
DROP POLICY IF EXISTS "Users can delete own cart items" ON cart_items;
DROP POLICY IF EXISTS "Authenticated users can manage cart items" ON cart_items;

-- Política para SELECT
CREATE POLICY "Authenticated users can view own cart items" ON cart_items
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM carts 
            WHERE carts.cart_id = cart_items.cart_id 
            AND carts.user_id = auth.uid()::text
        )
    );

-- Política para INSERT
CREATE POLICY "Authenticated users can insert own cart items" ON cart_items
    FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM carts 
            WHERE carts.cart_id = cart_items.cart_id 
            AND carts.user_id = auth.uid()::text
        )
    );

-- Política para UPDATE
CREATE POLICY "Authenticated users can update own cart items" ON cart_items
    FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM carts 
            WHERE carts.cart_id = cart_items.cart_id 
            AND carts.user_id = auth.uid()::text
        )
    );

-- Política para DELETE
CREATE POLICY "Authenticated users can delete own cart items" ON cart_items
    FOR DELETE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM carts 
            WHERE carts.cart_id = cart_items.cart_id 
            AND carts.user_id = auth.uid()::text
        )
    );

-- =====================================================
-- FAVORITES
-- =====================================================

-- Drop políticas viejas
DROP POLICY IF EXISTS "Users can view own favorites" ON favorites;
DROP POLICY IF EXISTS "Users can insert own favorites" ON favorites;
DROP POLICY IF EXISTS "Users can delete own favorites" ON favorites;
DROP POLICY IF EXISTS "Authenticated users can manage favorites" ON favorites;

-- Política para SELECT
CREATE POLICY "Authenticated users can view own favorites" ON favorites
    FOR SELECT
    TO authenticated
    USING (auth.uid()::text = user_id);

-- Política para INSERT
CREATE POLICY "Authenticated users can insert own favorites" ON favorites
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid()::text = user_id);

-- Política para DELETE
CREATE POLICY "Authenticated users can delete own favorites" ON favorites
    FOR DELETE
    TO authenticated
    USING (auth.uid()::text = user_id);

-- =====================================================
-- ORDERS
-- =====================================================

-- Drop políticas viejas
DROP POLICY IF EXISTS "Users can view own orders" ON orders;
DROP POLICY IF EXISTS "Users can insert own orders" ON orders;
DROP POLICY IF EXISTS "Authenticated users can view own orders" ON orders;
DROP POLICY IF EXISTS "Authenticated users can create own orders" ON orders;

-- Política para SELECT
CREATE POLICY "Authenticated users can view own orders" ON orders
    FOR SELECT
    TO authenticated
    USING (auth.uid()::text = user_id);

-- Política para INSERT
CREATE POLICY "Authenticated users can create own orders" ON orders
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid()::text = user_id);

-- =====================================================
-- Verificar políticas creadas
-- =====================================================
SELECT 
    tablename,
    policyname,
    cmd
FROM pg_policies 
WHERE schemaname = 'public'
AND tablename IN ('carts', 'cart_items', 'favorites', 'orders')
ORDER BY tablename, policyname;
