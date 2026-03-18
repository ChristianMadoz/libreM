/**
 * Sincronizar usuario de auth.users a tabla users
 */

const { Client } = require('pg');

const connectionString = "postgresql://postgres:eca71ec8ff16ce808ef35cf63598b488@ciyndj73.us-east.database.insforge.app:5432/insforge?sslmode=require";

async function syncUser() {
    const client = new Client({ connectionString });

    try {
        await client.connect();
        console.log('✅ Conectado\n');

        const userId = 'ce2309db-566d-4fd8-8d99-a8e5e02c33bd';
        const email = 'cmadoz@gmail.com';

        console.log(`📝 Creando usuario en tabla users...\n`);

        // Insertar usuario (sin updated_at que no existe)
        const result = await client.query(`
            INSERT INTO users (user_id, email, name, favorites)
            VALUES ($1, $2, $3, $4)
            ON CONFLICT (user_id) DO UPDATE SET
                email = EXCLUDED.email
            RETURNING *
        `, [userId, email, 'Christian Madoz', '{}']);

        console.log('✅ Usuario creado/actualizado:');
        console.log(`   user_id: ${result.rows[0].user_id}`);
        console.log(`   email: ${result.rows[0].email}`);
        console.log(`   name: ${result.rows[0].name}`);

        console.log('\n✅ ¡Usuario sincronizado!');
        console.log('   Ahora las políticas RLS deberían funcionar correctamente.');

    } catch (err) {
        console.error('❌ Error:', err.message);
        throw err;
    } finally {
        await client.end();
    }
}

syncUser().catch(console.error);
