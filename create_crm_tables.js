/**
 * Script para crear tablas usando POST en SQL endpoint
 */

const BASE_URL = 'https://ciyndj73.us-east.insforge.app';
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3OC0xMjM0LTU2NzgtOTBhYi1jZGVmMTIzNDU2NzgiLCJlbWFpbCI6ImFub25AaW5zZm9yZ2UuY29tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA5NDIxNzN9.3xiBFcR3uIMyK8Y5-EE4GLYKQyNEfZQrL2tGbIqZiMo';

async function createTables() {
    console.log('📋 Creando tablas en InsForge:\n');

    // SQL para crear tablas de CRM
    const sql = `
        -- Tabla companies
        CREATE TABLE IF NOT EXISTS companies (
            id SERIAL PRIMARY KEY,
            name TEXT NOT NULL,
            industry TEXT,
            website TEXT,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW()
        );

        -- Tabla contacts
        CREATE TABLE IF NOT EXISTS contacts (
            id SERIAL PRIMARY KEY,
            first_name TEXT NOT NULL,
            last_name TEXT NOT NULL,
            email TEXT NOT NULL,
            phone TEXT,
            company_id INTEGER REFERENCES companies(id),
            tags JSONB DEFAULT '[]',
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW()
        );

        -- Tabla deals
        CREATE TABLE IF NOT EXISTS deals (
            id SERIAL PRIMARY KEY,
            title TEXT NOT NULL,
            value NUMERIC(12, 2),
            stage TEXT DEFAULT 'Lead',
            company_id INTEGER REFERENCES companies(id),
            contact_id INTEGER REFERENCES contacts(id),
            expected_close_date DATE,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW()
        );

        -- Habilitar RLS
        ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
        ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
        ALTER TABLE deals ENABLE ROW LEVEL SECURITY;

        -- Políticas RLS - companies
        CREATE POLICY "Anyone can view companies" ON companies FOR SELECT USING (true);
        CREATE POLICY "Auth users can insert companies" ON companies FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
        CREATE POLICY "Auth users can update companies" ON companies FOR UPDATE USING (auth.uid() IS NOT NULL);
        CREATE POLICY "Auth users can delete companies" ON companies FOR DELETE USING (auth.uid() IS NOT NULL);

        -- Políticas RLS - contacts
        CREATE POLICY "Anyone can view contacts" ON contacts FOR SELECT USING (true);
        CREATE POLICY "Auth users can insert contacts" ON contacts FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
        CREATE POLICY "Auth users can update contacts" ON contacts FOR UPDATE USING (auth.uid() IS NOT NULL);
        CREATE POLICY "Auth users can delete contacts" ON contacts FOR DELETE USING (auth.uid() IS NOT NULL);

        -- Políticas RLS - deals
        CREATE POLICY "Anyone can view deals" ON deals FOR SELECT USING (true);
        CREATE POLICY "Auth users can insert deals" ON deals FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
        CREATE POLICY "Auth users can update deals" ON deals FOR UPDATE USING (auth.uid() IS NOT NULL);
        CREATE POLICY "Auth users can delete deals" ON deals FOR DELETE USING (auth.uid() IS NOT NULL);
    `;

    try {
        const response = await fetch(`${BASE_URL}/api/v1/sql`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${ANON_KEY}`,
            },
            body: JSON.stringify({ 
                query: sql,
                array: true
            }),
        });

        const text = await response.text();
        console.log(`Status: ${response.status} ${response.statusText}`);
        console.log(`Response: ${text}`);
        
        if (response.ok) {
            console.log('\n✅ Tablas creadas exitosamente!');
        } else {
            console.log('\n❌ Error creando tablas');
        }

    } catch (err) {
        console.log(`❌ ERROR: ${err.message}`);
    }
}

createTables().catch(console.error);
