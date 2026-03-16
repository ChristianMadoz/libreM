/**
 * Script para ejecutar el esquema SQL en InsForge
 * 
 * Run: node run_schema.js
 */

const { Client } = require('pg');

const connectionString = "postgresql://postgres:eca71ec8ff16ce808ef35cf63598b488@ciyndj73.us-east.database.insforge.app:5432/insforge?sslmode=require";

async function runSchema() {
    const client = new Client({
        connectionString: connectionString,
    });

    try {
        await client.connect();
        console.log('✅ Conectado a la base de datos InsForge\n');

        // Leer el archivo SQL
        const fs = require('fs');
        const path = require('path');
        const sqlFile = path.join(__dirname, 'setup_schema.sql');
        const sql = fs.readFileSync(sqlFile, 'utf-8');

        console.log('📄 Ejecutando setup_schema.sql...\n');

        // Ejecutar el script SQL completo
        await client.query(sql);

        console.log('✅ Esquema ejecutado exitosamente\n');

        // Verificar tablas creadas
        console.log('📋 Verificando tablas creadas...\n');

        const tables = ['categories', 'products', 'users', 'carts', 'cart_items', 'orders', 'favorites'];

        for (const table of tables) {
            const result = await client.query(
                `SELECT COUNT(*) FROM ${table}`
            );
            const count = result.rows[0].count;
            console.log(`  ✓ ${table}: ${count} registros`);
        }

        console.log('\n✅ ¡Setup completo!');

    } catch (err) {
        console.error('❌ Error:', err.message);
        throw err;
    } finally {
        await client.end();
    }
}

runSchema().catch(console.error);
