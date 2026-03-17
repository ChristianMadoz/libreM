/**
 * Script para verificar tablas existentes en InsForge via API
 */

const BASE_URL = 'https://ciyndj73.us-east.insforge.app';
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3OC0xMjM0LTU2NzgtOTBhYi1jZGVmMTIzNDU2NzgiLCJlbWFpbCI6ImFub25AaW5zZm9yZ2UuY29tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA5NDIxNzN9.3xiBFcR3uIMyK8Y5-EE4GLYKQyNEfZQrL2tGbIqZiMo';

async function checkTables() {
    console.log('📋 Verificando tablas existentes en InsForge:\n');

    const tablesToCheck = [
        'categories', 'products', 'users', 'carts', 'cart_items', 
        'orders', 'favorites', 'companies', 'contacts', 'deals'
    ];

    for (const table of tablesToCheck) {
        try {
            const response = await fetch(`${BASE_URL}/api/v1/rest/${table}?select=*&limit=1`, {
                headers: {
                    'apikey': ANON_KEY,
                    'Authorization': `Bearer ${ANON_KEY}`,
                    'Prefer': 'count=exact'
                }
            });

            if (response.ok) {
                const count = response.headers.get('Content-Range');
                console.log(`  ✓ ${table}: EXISTE`);
            } else {
                const error = await response.json().catch(() => ({}));
                console.log(`  ✗ ${table}: NO EXISTE - ${response.status} ${error?.message || ''}`);
            }
        } catch (err) {
            console.log(`  ✗ ${table}: ERROR - ${err.message}`);
        }
    }
}

checkTables().catch(console.error);
