/**
 * Actualizar políticas RLS para permitir escritura
 * 
 * Run: node update_rls.js
 */

const { Client } = require('pg');

const connectionString = "postgresql://postgres:eca71ec8ff16ce808ef35cf63598b488@ciyndj73.us-east.database.insforge.app:5432/insforge?sslmode=require";

async function updateRLS() {
    const client = new Client({ connectionString });
    
    try {
        await client.connect();
        console.log('✅ Conectado a la base de datos\n');

        // Leer el archivo SQL
        const fs = require('fs');
        const path = require('path');
        const sqlFile = path.join(__dirname, 'update_rls_policies.sql');
        const sql = fs.readFileSync(sqlFile, 'utf-8');

        console.log('📄 Ejecutando update_rls_policies.sql...\n');

        // Ejecutar el script SQL
        const result = await client.query(sql);

        console.log('✅ Políticas RLS actualizadas\n');

        // Mostrar resultados
        if (result.rows && result.rows.length > 0) {
            console.log('📋 Políticas actuales:\n');
            result.rows.forEach(row => {
                console.log(`  ${row.tablename}.${row.policyname} (${row.cmd})`);
            });
        }

        console.log('\n✅ ¡RLS actualizado exitosamente!');
        console.log('\nAhora los usuarios autenticados pueden:');
        console.log('  • Crear, editar y eliminar categorías');
        console.log('  • Crear, editar y eliminar productos\n');

    } catch (err) {
        console.error('❌ Error:', err.message);
        throw err;
    } finally {
        await client.end();
    }
}

updateRLS().catch(console.error);
