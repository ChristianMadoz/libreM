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
