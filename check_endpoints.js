/**
 * Script para probar diferentes endpoints de InsForge
 */

const BASE_URL = 'https://ciyndj73.us-east.insforge.app';
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3OC0xMjM0LTU2NzgtOTBhYi1jZGVmMTIzNDU2NzgiLCJlbWFpbCI6ImFub25AaW5zZm9yZ2UuY29tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA5NDIxNzN9.3xiBFcR3uIMyK8Y5-EE4GLYKQyNEfZQrL2tGbIqZiMo';

async function checkEndpoints() {
    console.log('📋 Probando endpoints de InsForge:\n');

    const endpoints = [
        '/api/v1/database/categories?select=*&limit=1',
        '/rest/v1/categories?select=*&limit=1',
        '/categories?select=*&limit=1',
        '/api/v1/sql',
        '/health',
        '/'
    ];

    for (const endpoint of endpoints) {
        try {
            const url = `${BASE_URL}${endpoint}`;
            const response = await fetch(url, {
                headers: {
                    'apikey': ANON_KEY,
                    'Authorization': `Bearer ${ANON_KEY}`,
                    'Content-Type': 'application/json'
                }
            });
            
            const text = await response.text();
            console.log(`\n${endpoint}:`);
            console.log(`  Status: ${response.status} ${response.statusText}`);
            console.log(`  Response: ${text.substring(0, 300)}`);
        } catch (err) {
            console.log(`\n${endpoint}:`);
            console.log(`  ERROR: ${err.message}`);
        }
    }
}

checkEndpoints().catch(console.error);
