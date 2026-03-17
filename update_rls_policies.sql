-- =====================================================
-- Actualizar políticas RLS para products y categories
-- Permitir escritura a usuarios autenticados
-- =====================================================

-- Drop políticas viejas si existen
DROP POLICY IF EXISTS "Auth users can manage categories" ON categories;
DROP POLICY IF EXISTS "Auth users can manage products" ON products;

-- =====================================================
-- CATEGORIES - Permitir CRUD a usuarios autenticados
-- =====================================================

-- Lectura pública (ya existe)
-- "Anyone can view categories" - ya está creada

-- Escritura para autenticados
CREATE POLICY "Auth users can manage categories" ON categories
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- =====================================================
-- PRODUCTS - Permitir CRUD a usuarios autenticados
-- =====================================================

-- Lectura pública (ya existe)
-- "Anyone can view products" - ya está creada

-- Escritura para autenticados
CREATE POLICY "Auth users can manage products" ON products
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- =====================================================
-- Verificar políticas creadas
-- =====================================================
SELECT 
    tablename,
    policyname,
    cmd,
    roles,
    qual IS NOT NULL as has_using,
    with_check IS NOT NULL as has_with_check
FROM pg_policies 
WHERE schemaname = 'public'
AND tablename IN ('categories', 'products')
ORDER BY tablename, policyname;
