/**
 * Script para verificar tablas existentes en InsForge
 */

const { Client } = require('pg');

const connectionString = "postgresql://postgres:eca71ec8ff16ce808ef35cf63598b488@ciyndj73.us-east.database.insforge.app:5432/insforge?sslmode=require";

async function checkTables() {
    const client = new Client({
        connectionString: connectionString,
    });

    try {
        await client.connect();
        console.log('✅ Conectado a la base de datos InsForge\n');

        // List all tables
        console.log('📋 Tablas existentes en la base de datos:\n');
        
        const result = await client.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            ORDER BY table_name
        `);

        result.rows.forEach(row => {
            console.log(`  - ${row.table_name}`);
        });

        console.log('\n\n📋 Verificando tablas de E-commerce:\n');
        const ecommerceTables = ['categories', 'products', 'users', 'carts', 'cart_items', 'orders', 'favorites'];
        
        for (const table of ecommerceTables) {
            try {
                const countResult = await client.query(`SELECT COUNT(*) FROM ${table}`);
                console.log(`  ✓ ${table}: ${countResult.rows[0].count} registros`);
            } catch (err) {
                console.log(`  ✗ ${table}: NO EXISTE`);
            }
        }

        console.log('\n\n📋 Verificando tablas de CRM:\n');
        const crmTables = ['companies', 'contacts', 'deals'];
        
        for (const table of crmTables) {
            try {
                const countResult = await client.query(`SELECT COUNT(*) FROM ${table}`);
                console.log(`  ✓ ${table}: ${countResult.rows[0].count} registros`);
            } catch (err) {
                console.log(`  ✗ ${table}: NO EXISTE - ${err.message}`);
            }
        }

    } catch (err) {
        console.error('❌ Error:', err.message);
    } finally {
        await client.end();
    }
}

checkTables().catch(console.error);
