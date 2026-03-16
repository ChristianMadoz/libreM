/**
 * Verificar políticas RLS en la base de datos
 * 
 * Run: node verify_rls.js
 */

const { Client } = require('pg');

const connectionString = "postgresql://postgres:eca71ec8ff16ce808ef35cf63598b488@ciyndj73.us-east.database.insforge.app:5432/insforge?sslmode=require";

async function verifyRLS() {
    const client = new Client({
        connectionString: connectionString,
    });

    try {
        await client.connect();
        console.log('✅ Conectado a la base de datos\n');

        // Verificar RLS habilitado en tablas
        console.log('📋 Estado de RLS por tabla:\n');
        
        const tablesResult = await client.query(`
            SELECT schemaname, tablename, rowsecurity 
            FROM pg_tables 
            WHERE schemaname = 'public' 
            AND tablename IN ('categories', 'products', 'users', 'carts', 'cart_items', 'orders', 'favorites')
            ORDER BY tablename
        `);

        for (const row of tablesResult.rows) {
            const status = row.rowsecurity ? '✅ RLS activado' : '❌ RLS desactivado';
            console.log(`  ${row.tablename}: ${status}`);
        }

        // Verificar políticas existentes
        console.log('\n📋 Políticas RLS existentes:\n');

        const policiesResult = await client.query(`
            SELECT tablename, policyname, cmd, roles, qual, with_check
            FROM pg_policies 
            WHERE schemaname = 'public'
            ORDER BY tablename, policyname
        `);

        let currentTable = '';
        for (const row of policiesResult.rows) {
            if (row.tablename !== currentTable) {
                currentTable = row.tablename;
                console.log(`\n  ${currentTable}:`);
            }
            console.log(`    - ${row.policyname} (${row.cmd})`);
        }

        console.log('\n\n✅ Verificación RLS completada');

    } catch (err) {
        console.error('❌ Error:', err.message);
        throw err;
    } finally {
        await client.end();
    }
}

verifyRLS().catch(console.error);
