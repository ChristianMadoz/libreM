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
        
        const tablesToCheck = ['categories', 'products'];
        
        for (const table of tablesToCheck) {
            try {
                // Check FastAPI endpoint
                const apiResponse = await fetch(`${BASE_URL}/api/${table}`, {
                    headers: {
                        'Authorization': `Bearer ${ANON_KEY}`,
                    }
                });
                console.log(`  FastAPI ${table}: ${apiResponse.status} ${apiResponse.statusText}`);

                // Check Raw InsForge (PostgREST) endpoint
                const rawResponse = await fetch(`${BASE_URL}/rest/v1/${table}?select=*&limit=1`, {
                    headers: {
                        'apikey': ANON_KEY,
                        'Authorization': `Bearer ${ANON_KEY}`,
                        'Prefer': 'count=exact'
                    }
                });
                console.log(`  Raw InsForge ${table}: ${rawResponse.status} ${rawResponse.statusText}`);
                
                if (!rawResponse.ok) {
                    const text = await rawResponse.text();
                    console.log(`    Raw Response Error: ${text.substring(0, 100)}`);
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
