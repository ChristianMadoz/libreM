/**
 * Test de integración para verificar la API
 * 
 * Run: node test_integration.js
 */

const { createClient } = require('@insforge/sdk');

const insforge = createClient({
    baseUrl: 'https://ciyndj73.us-east.insforge.app',
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3OC0xMjM0LTU2NzgtOTBhYi1jZGVmMTIzNDU2NzgiLCJlbWFpbCI6ImFub25AaW5zZm9yZ2UuY29tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA5NDIxNzN9.3xiBFcR3uIMyK8Y5-EE4GLYKQyNEfZQrL2tGbIqZiMo'
});

async function testProducts() {
    console.log('\n📦 Test: Productos');
    
    const { data: products, error } = await insforge.database.from('products').select('*').limit(3);
    
    if (error) {
        console.log('   ❌ Error:', error.message);
        return false;
    }
    
    console.log(`   ✓ ${products.length} productos obtenidos`);
    console.log(`   Ejemplo: ${products[0]?.name}`);
    return true;
}

async function testCategories() {
    console.log('\n📁 Test: Categorías');
    
    const { data: categories, error } = await insforge.database.from('categories').select('*');
    
    if (error) {
        console.log('   ❌ Error:', error.message);
        return false;
    }
    
    console.log(`   ✓ ${categories.length} categorías obtenidas`);
    categories.forEach(cat => console.log(`     - ${cat.name}`));
    return true;
}

async function testProductWithCategory() {
    console.log('\n🔗 Test: Productos con categorías (JOIN)');
    
    const { data, error } = await insforge.database
        .from('products')
        .select('*, categories(*)')
        .limit(2);
    
    if (error) {
        console.log('   ❌ Error:', error.message);
        return false;
    }
    
    console.log(`   ✓ ${data.length} productos con categorías`);
    data.forEach(p => {
        console.log(`     - ${p.name} → ${p.categories?.name || 'N/A'}`);
    });
    return true;
}

async function testAuth() {
    console.log('\n🔐 Test: Autenticación (anon)');
    
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

async function testCartStructure() {
    console.log('\n🛒 Test: Estructura de carritos');
    
    // Verificar que la tabla existe
    const { data, error } = await insforge.database.from('carts').select('cart_id, user_id');
    
    if (error) {
        console.log('   ❌ Error:', error.message);
        return false;
    }
    
    console.log(`   ✓ Tabla carts accesible (${data.length} registros)`);
    return true;
}

async function testFavoritesStructure() {
    console.log('\n❤️ Test: Estructura de favoritos');
    
    const { data, error } = await insforge.database.from('favorites').select('favorite_id, user_id, product_id');
    
    if (error) {
        console.log('   ❌ Error:', error.message);
        return false;
    }
    
    console.log(`   ✓ Tabla favorites accesible (${data.length} registros)`);
    return true;
}

async function testOrdersStructure() {
    console.log('\n📋 Test: Estructura de órdenes');
    
    const { data, error } = await insforge.database.from('orders').select('order_id, user_id, order_number, total');
    
    if (error) {
        console.log('   ❌ Error:', error.message);
        return false;
    }
    
    console.log(`   ✓ Tabla orders accesible (${data.length} registros)`);
    return true;
}

async function runAllTests() {
    console.log('========================================');
    console.log('🧪 TEST DE INTEGRACIÓN - LibreM');
    console.log('========================================');

    const results = [];

    results.push(await testAuth());
    results.push(await testCategories());
    results.push(await testProducts());
    results.push(await testProductWithCategory());
    results.push(await testCartStructure());
    results.push(await testFavoritesStructure());
    results.push(await testOrdersStructure());

    console.log('\n========================================');
    const passed = results.filter(r => r).length;
    const total = results.length;
    console.log(`📊 RESULTADOS: ${passed}/${total} tests pasados`);
    console.log('========================================\n');

    if (passed === total) {
        console.log('✅ ¡Todos los tests pasaron!');
    } else {
        console.log('⚠️  Algunos tests fallaron');
    }
}

runAllTests().catch(console.error);
