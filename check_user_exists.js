/**
 * Verificar si el usuario existe en la tabla users
 */

const { Client } = require('pg');

const connectionString = "postgresql://postgres:eca71ec8ff16ce808ef35cf63598b488@ciyndj73.us-east.database.insforge.app:5432/insforge?sslmode=require";

async function checkUser() {
    const client = new Client({ connectionString });
    
    try {
        await client.connect();
        console.log('✅ Conectado\n');

        // Verificar si el usuario existe
        const userId = 'ce2309db-566d-4fd8-8d99-a8e5e02c33bd';
        
        console.log(`🔍 Buscando usuario: ${userId}\n`);
        
        const user = await client.query(
            'SELECT user_id, email, name FROM users WHERE user_id = $1',
            [userId]
        );
        
        if (user.rows.length > 0) {
            console.log('✅ Usuario encontrado en tabla users:');
            user.rows.forEach(row => {
                console.log(`   user_id: ${row.user_id}`);
                console.log(`   email: ${row.email}`);
                console.log(`   name: ${row.name}`);
            });
        } else {
            console.log('❌ Usuario NO encontrado en tabla users');
            console.log('   El usuario existe en auth.users pero no en la tabla users');
        }

        // Verificar políticas de favorites
        console.log('\n📋 Políticas en favorites:');
        const policies = await client.query(`
            SELECT policyname, cmd, roles, 
                   pg_get_expr(qual, 0) as using_expr,
                   pg_get_expr(with_check, 0) as check_expr
            FROM pg_policies
            WHERE tablename = 'favorites'
        `);
        
        policies.rows.forEach(row => {
            console.log(`  ${row.policyname} (${row.cmd})`);
        });

        // Verificar si RLS está habilitado
        console.log('\n🔒 Estado RLS:');
        const rls = await client.query(`
            SELECT relname, relrowsecurity
            FROM pg_class
            WHERE relname IN ('favorites', 'carts', 'users')
        `);
        
        rls.rows.forEach(row => {
            const status = row.relrowsecurity ? '✅ Activado' : '❌ Desactivado';
            console.log(`  ${row.relname}: ${status}`);
        });

    } catch (err) {
        console.error('❌ Error:', err.message);
    } finally {
        await client.end();
    }
}

checkUser().catch(console.error);
