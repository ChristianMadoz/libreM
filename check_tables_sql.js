/**
 * Script para verificar tablas usando SQL endpoint
 */

const BASE_URL = 'https://ciyndj73.us-east.insforge.app';
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3OC0xMjM0LTU2NzgtOTBhYi1jZGVmMTIzNDU2NzgiLCJlbWFpbCI6ImFub25AaW5zZm9yZ2UuY29tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA5NDIxNzN9.3xiBFcR3uIMyK8Y5-EE4GLYKQyNEfZQrL2tGbIqZiMo';

async function checkTables() {
    console.log('📋 Verificando tablas existentes en InsForge via SQL:\n');

    try {
        // Query to list all tables
        const sql = `
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            ORDER BY table_name
        `;

        const response = await fetch(`${BASE_URL}/api/v1/sql`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${ANON_KEY}`,
            },
            body: JSON.stringify({ query: sql }),
        });

        const data = await response.json();
        
        if (response.ok && data.results) {
            console.log('✅ Tablas existentes:\n');
            data.results.forEach(row => {
                console.log(`  - ${row.table_name}`);
            });
        } else {
            console.log('❌ Error:', data);
        }

    } catch (err) {
        console.log(`❌ ERROR: ${err.message}`);
    }
}

checkTables().catch(console.error);
