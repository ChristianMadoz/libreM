-- =====================================================
-- Trigger para sincronizar usuarios de InsForge Auth
-- =====================================================

-- Función para crear/actualizar usuario en tabla users
-- cuando se crea un usuario en auth.users

CREATE OR REPLACE FUNCTION sync_user_from_auth()
RETURNS TRIGGER AS $$
BEGIN
    -- Insertar o actualizar usuario en tabla users
    INSERT INTO users (
        user_id,
        google_id,
        email,
        name,
        password_hash,
        picture,
        favorites,
        created_at,
        updated_at
    ) VALUES (
        NEW.id::text,
        NEW.raw_user_meta_data->>'provider_id',
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
        NULL, -- Password hash se maneja por InsForge Auth
        NEW.raw_user_meta_data->>'picture',
        '{}',
        NEW.created_at,
        NOW()
    )
    ON CONFLICT (user_id) DO UPDATE SET
        email = EXCLUDED.email,
        name = EXCLUDED.name,
        picture = EXCLUDED.picture,
        google_id = EXCLUDED.google_id,
        updated_at = NOW();
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Crear trigger en la tabla auth.users
-- Nota: En InsForge, la tabla auth puede no ser accesible directamente
-- Si esto falla, usaremos un enfoque alternativo

-- Drop trigger si existe
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Intentar crear trigger (puede fallar dependiendo de permisos)
DO $$
BEGIN
    CREATE TRIGGER on_auth_user_created
        AFTER INSERT ON auth.users
        FOR EACH ROW
        EXECUTE FUNCTION sync_user_from_auth();
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'No se pudo crear trigger en auth.users - se usará enfoque alternativo';
END $$;

-- =====================================================
-- Enfoque alternativo: Función para llamar manualmente
-- después de crear usuario con el SDK
-- =====================================================

CREATE OR REPLACE FUNCTION create_user_profile(
    p_user_id TEXT,
    p_email TEXT,
    p_name TEXT,
    p_google_id TEXT DEFAULT NULL,
    p_picture TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
BEGIN
    INSERT INTO users (
        user_id,
        email,
        name,
        google_id,
        picture,
        favorites,
        created_at,
        updated_at
    ) VALUES (
        p_user_id,
        p_email,
        p_name,
        p_google_id,
        p_picture,
        '{}',
        NOW(),
        NOW()
    )
    ON CONFLICT (user_id) DO UPDATE SET
        email = EXCLUDED.email,
        name = EXCLUDED.name,
        picture = EXCLUDED.picture,
        google_id = EXCLUDED.google_id,
        updated_at = NOW();
    
    RETURN TRUE;
EXCEPTION WHEN OTHERS THEN
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- Política RLS para permitir insert desde auth
-- =====================================================

-- Asegurar que usuarios puedan ver su propio perfil
CREATE POLICY "Users can view own profile from users table" ON users
    FOR SELECT
    USING (auth.uid()::text = user_id);

-- Permitir que usuarios se inserten a sí mismos
CREATE POLICY "Users can insert own profile" ON users
    FOR INSERT
    WITH CHECK (auth.uid()::text = user_id);

-- Permitir que usuarios actualicen su propio perfil
CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE
    USING (auth.uid()::text = user_id);

-- =====================================================
-- Función wrapper para usar después del registro
-- =====================================================

CREATE OR REPLACE FUNCTION handle_new_user_registration(
    p_email TEXT,
    p_name TEXT
)
RETURNS TEXT AS $$
DECLARE
    v_user_id TEXT;
BEGIN
    -- Generar user_id único
    v_user_id := 'user_' || substr(md5(random()::text || now()::text), 1, 12);
    
    -- Insertar perfil
    INSERT INTO users (
        user_id,
        email,
        name,
        favorites,
        created_at,
        updated_at
    ) VALUES (
        v_user_id,
        p_email,
        p_name,
        '{}',
        NOW(),
        NOW()
    );
    
    RETURN v_user_id;
EXCEPTION WHEN OTHERS THEN
    RAISE EXCEPTION 'Error creando perfil de usuario: %', SQLERRM;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
