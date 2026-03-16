/**
 * Setup de sincronización de autenticación
 * 
 * Run: node setup_auth_sync.js
 */

const { Client } = require('pg');

const connectionString = "postgresql://postgres:eca71ec8ff16ce808ef35cf63598b488@ciyndj73.us-east.database.insforge.app:5432/insforge?sslmode=require";

async function setupAuthSync() {
    const client = new Client({
        connectionString: connectionString,
    });

    try {
        await client.connect();
        console.log('✅ Conectado a la base de datos\n');

        // Leer el archivo SQL
        const fs = require('fs');
        const path = require('path');
        const sqlFile = path.join(__dirname, 'setup_auth_sync.sql');
        const sql = fs.readFileSync(sqlFile, 'utf-8');

        console.log('📄 Ejecutando setup_auth_sync.sql...\n');

        // Ejecutar el script SQL
        await client.query(sql);

        console.log('✅ Sincronización de auth configurada\n');

        // Verificar funciones creadas
        console.log('📋 Verificando funciones y políticas:\n');

        const functions = await client.query(`
            SELECT routine_name 
            FROM information_schema.routines 
            WHERE routine_schema = 'public' 
            AND routine_name LIKE '%user%'
        `);

        console.log('  Funciones creadas:');
        for (const row of functions.rows) {
            console.log(`    - ${row.routine_name}`);
        }

        // Verificar políticas en tabla users
        const policies = await client.query(`
            SELECT policyname, cmd 
            FROM pg_policies 
            WHERE tablename = 'users'
        `);

        console.log('\n  Políticas RLS en users:');
        for (const row of policies.rows) {
            console.log(`    - ${row.policyname} (${row.cmd})`);
        }

        console.log('\n✅ Setup de autenticación completado');
        console.log('\n📝 Nota: Los usuarios se sincronizan automáticamente al registrarse.');
        console.log('   Para usuarios existentes, ejecutar:\n');
        console.log('   SELECT create_user_profile(user_id, email, name) FROM auth.users;\n');

    } catch (err) {
        console.error('❌ Error:', err.message);
        throw err;
    } finally {
        await client.end();
    }
}

setupAuthSync().catch(console.error);
