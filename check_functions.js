/**
 * Verificar funciones en la base de datos
 */

const { Client } = require('pg');

const connectionString = "postgresql://postgres:eca71ec8ff16ce808ef35cf63598b488@ciyndj73.us-east.database.insforge.app:5432/insforge?sslmode=require";

async function checkFunctions() {
    const client = new Client({ connectionString });
    
    try {
        await client.connect();
        
        const result = await client.query(`
            SELECT routine_name, routine_type
            FROM information_schema.routines 
            WHERE routine_schema = 'public' 
            AND (routine_name LIKE '%user%' 
                 OR routine_name LIKE '%profile%' 
                 OR routine_name LIKE '%registration%'
                 OR routine_name LIKE '%sync%')
            ORDER BY routine_name
        `);
        
        console.log('\n📋 Funciones encontradas:\n');
        result.rows.forEach(row => {
            console.log(`  - ${row.routine_name} (${row.routine_type})`);
        });
        
    } finally {
        await client.end();
    }
}

checkFunctions().catch(console.error);
