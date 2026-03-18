/**
 * Corregir políticas RLS para carrito y favoritos
 */

const { Client } = require('pg');

const connectionString = "postgresql://postgres:eca71ec8ff16ce808ef35cf63598b488@ciyndj73.us-east.database.insforge.app:5432/insforge?sslmode=require";

async function fixRLS() {
    const client = new Client({ connectionString });
    
    try {
        await client.connect();
        console.log('✅ Conectado\n');

        // Leer el archivo SQL
        const fs = require('fs');
        const path = require('path');
        const sqlFile = path.join(__dirname, 'fix_rls_policies.sql');
        const sql = fs.readFileSync(sqlFile, 'utf-8');

        console.log('📄 Ejecutando fix_rls_policies.sql...\n');

        // Ejecutar el script SQL
        const result = await client.query(sql);

        console.log('✅ Políticas RLS actualizadas\n');

        // Mostrar resultados
        if (result.rows && result.rows.length > 0) {
            console.log('📋 Políticas actuales:\n');
            let currentTable = '';
            result.rows.forEach(row => {
                if (row.tablename !== currentTable) {
                    currentTable = row.tablename;
                    console.log(`\n  ${currentTable}:`);
                }
                console.log(`    - ${row.policyname} (${row.cmd})`);
            });
        }

        console.log('\n✅ ¡RLS corregido exitosamente!');

    } catch (err) {
        console.error('❌ Error:', err.message);
        throw err;
    } finally {
        await client.end();
    }
}

fixRLS().catch(console.error);
