-- Enable RLS on users table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Policy: Allow users to read their own profile
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'users_read_own' AND tablename = 'users') THEN
        CREATE POLICY "users_read_own" ON users
        FOR SELECT
        TO authenticated
        USING (auth.uid()::text = user_id);
    END IF;
END $$;

-- Policy: Allow users to update their own profile
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'users_update_own' AND tablename = 'users') THEN
        CREATE POLICY "users_update_own" ON users
        FOR UPDATE
        TO authenticated
        USING (auth.uid()::text = user_id)
        WITH CHECK (auth.uid()::text = user_id);
    END IF;
END $$;

-- Grant permissions to authenticated role
GRANT SELECT, UPDATE ON users TO authenticated;
