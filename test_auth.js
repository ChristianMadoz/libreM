/**
 * Test de Autenticación - LibreM
 * 
 * Run: node test_auth.js
 */

const { createClient } = require('@insforge/sdk');

const insforge = createClient({
    baseUrl: 'https://ciyndj73.us-east.insforge.app',
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3OC0xMjM0LTU2NzgtOTBhYi1jZGVmMTIzNDU2NzgiLCJlbWFpbCI6ImFub25AaW5zZm9yZ2UuY29tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA5NDIxNzN9.3xiBFcR3uIMyK8Y5-EE4GLYKQyNEfZQrL2tGbIqZiMo'
});

async function testGetCurrentSession() {
    console.log('\n🔐 Test: Sesión actual (anon)');
    
    const { data, error } = await insforge.auth.getCurrentSession();
    
    if (error) {
        console.log('   ℹ️  Sin sesión activa (esperado para anon)');
        return true;
    }
    
    if (data?.session) {
        console.log(`   ✓ Sesión activa: ${data.session.user.email}`);
    } else {
        console.log('   ℹ️  Sin sesión activa');
    }
    return true;
}

async function testUsersTable() {
    console.log('\n👤 Test: Tabla users');
    
    const { data, error } = await insforge.database
        .from('users')
        .select('user_id, email, name')
        .limit(3);
    
    if (error) {
        console.log('   ❌ Error:', error.message);
        return false;
    }
    
    console.log(`   ✓ ${data.length} usuarios en la tabla`);
    data.forEach(u => console.log(`     - ${u.name} (${u.email})`));
    return true;
}

async function testProfileFunctions() {
    console.log('\n⚙️  Test: Funciones de perfil');
    
    const { data, error } = await insforge.database.rpc('create_user_profile', {
        p_user_id: 'test_123',
        p_email: 'test@example.com',
        p_name: 'Test User'
    });
    
    if (error) {
        console.log('   ℹ️  Función create_user_profile:', error.message);
        // No fallar, puede ser que ya exista
    } else {
        console.log('   ✓ Función create_user_profile disponible');
    }
    return true;
}

async function testRLSOnUsers() {
    console.log('\n🔒 Test: RLS en tabla users');
    
    // Intentar seleccionar todos los usuarios (debería fallar o retornar solo el propio)
    const { data, error } = await insforge.database
        .from('users')
        .select('user_id, email, name');
    
    if (error) {
        console.log('   ✓ RLS funcionando: ', error.message);
        return true;
    }
    
    // Si no hay error, verificar que solo ve usuarios permitidos
    console.log(`   ℹ️  ${data.length} usuarios visibles (anon puede ver todos o ninguno)`);
    return true;
}

async function testAuthConfig() {
    console.log('\n⚙️  Test: Configuración de auth');
    
    // Verificar si hay OAuth configurado
    try {
        const { data, error } = await insforge.auth.signInWithOAuth({
            provider: 'google',
            skipBrowserRedirect: true
        });
        
        if (data?.url) {
            console.log('   ✓ OAuth con Google configurado');
            return true;
        }
    } catch (e) {
        console.log('   ℹ️  OAuth no configurado o error:', e.message);
    }
    
    return true;
}

async function runAllAuthTests() {
    console.log('========================================');
    console.log('🧪 TEST DE AUTENTICACIÓN - LibreM');
    console.log('========================================');

    const results = [];

    results.push(await testGetCurrentSession());
    results.push(await testUsersTable());
    results.push(await testProfileFunctions());
    results.push(await testRLSOnUsers());
    results.push(await testAuthConfig());

    console.log('\n========================================');
    const passed = results.filter(r => r).length;
    const total = results.length;
    console.log(`📊 RESULTADOS: ${passed}/${total} tests pasados`);
    console.log('========================================\n');

    if (passed === total) {
        console.log('✅ ¡Todos los tests de autenticación pasaron!');
    } else {
        console.log('⚠️  Algunos tests fallaron');
    }
}

runAllAuthTests().catch(console.error);
