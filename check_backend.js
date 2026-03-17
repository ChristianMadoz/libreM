/**
 * Script para verificar metadata del backend InsForge
 */

const BASE_URL = 'https://ciyndj73.us-east.insforge.app';
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3OC0xMjM0LTU2NzgtOTBhYi1jZGVmMTIzNDU2NzgiLCJlbWFpbCI6ImFub25AaW5zZm9yZ2UuY29tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA5NDIxNzN9.3xiBFcR3uIMyK8Y5-EE4GLYKQyNEfZQrL2tGbIqZiMo';

async function checkBackend() {
    console.log('📋 Verificando metadata del backend InsForge:\n');

    try {
        // Check base URL
        const response = await fetch(`${BASE_URL}/`, {
            headers: {
                'Authorization': `Bearer ${ANON_KEY}`,
            },
        });

        console.log(`Backend URL: ${BASE_URL}`);
        console.log(`Status: ${response.status} ${response.statusText}`);
        
        // Try to access tables via SDK-style REST API
        console.log('\n📋 Probando acceso a tablas:\n');
        
        const tablesToCheck = ['categories', 'products', 'companies', 'contacts', 'deals'];
        
        for (const table of tablesToCheck) {
            try {
                const response = await fetch(`${BASE_URL}/api/v1/rest/${table}?select=*&limit=0`, {
                    headers: {
                        'apikey': ANON_KEY,
                        'Authorization': `Bearer ${ANON_KEY}`,
                        'Prefer': 'count=exact'
                    }
                });
                
                console.log(`  ${table}: ${response.status} ${response.statusText}`);
                
                if (!response.ok) {
                    const text = await response.text();
                    console.log(`    Response: ${text.substring(0, 200)}`);
                }
            } catch (err) {
                console.log(`  ${table}: ERROR - ${err.message}`);
            }
        }

    } catch (err) {
        console.log(`❌ ERROR: ${err.message}`);
    }
}

checkBackend().catch(console.error);
