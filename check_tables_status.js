/**
 * Verificar estado de tablas y políticas RLS
 */

const { Client } = require('pg');

const connectionString = "postgresql://postgres:eca71ec8ff16ce808ef35cf63598b488@ciyndj73.us-east.database.insforge.app:5432/insforge?sslmode=require";

async function checkTables() {
    const client = new Client({ connectionString });
    
    try {
        await client.connect();
        console.log('✅ Conectado\n');

        // Verificar tablas existentes
        console.log('📋 Tablas relacionadas con carrito:');
        const tables = await client.query(`
            SELECT tablename, rowsecurity
            FROM pg_tables 
            WHERE schemaname = 'public' 
            AND tablename IN ('carts', 'cart_items', 'favorites', 'orders')
            ORDER BY tablename
        `);
        
        tables.rows.forEach(row => {
            const rls = row.rowsecurity ? '✅ RLS activado' : '❌ RLS desactivado';
            console.log(`  ${row.tablename}: ${rls}`);
        });

        // Verificar columnas de carts
        console.log('\n📋 Columnas de carts:');
        const columns = await client.query(`
            SELECT column_name, data_type
            FROM information_schema.columns
            WHERE table_name = 'carts'
            ORDER BY ordinal_position
        `);
        
        columns.rows.forEach(row => {
            console.log(`  ${row.column_name}: ${row.data_type}`);
        });

        // Verificar políticas RLS en carts
        console.log('\n📋 Políticas RLS en carts:');
        const policies = await client.query(`
            SELECT policyname, cmd, roles, qual IS NOT NULL as has_using
            FROM pg_policies
            WHERE tablename = 'carts'
        `);
        
        policies.rows.forEach(row => {
            console.log(`  ${row.policyname} (${row.cmd}) - ${row.roles.join(',')}`);
        });

        // Verificar políticas RLS en favorites
        console.log('\n📋 Políticas RLS en favorites:');
        const favPolicies = await client.query(`
            SELECT policyname, cmd, roles
            FROM pg_policies
            WHERE tablename = 'favorites'
        `);
        
        favPolicies.rows.forEach(row => {
            console.log(`  ${row.policyname} (${row.cmd}) - ${row.roles.join(',')}`);
        });

    } catch (err) {
        console.error('❌ Error:', err.message);
    } finally {
        await client.end();
    }
}

checkTables().catch(console.error);
