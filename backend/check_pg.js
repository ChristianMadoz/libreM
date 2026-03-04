const { Client } = require('pg');

const client = new Client({
    connectionString: 'postgresql://postgres:eca71ec8ff16ce808ef35cf63598b488@ciyndj73.us-east.database.insforge.app:5432/insforge?sslmode=require',
});

async function main() {
    try {
        await client.connect();
        console.log("Connected to DB!");
        const res = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users';
    `);
        console.log("Columns in 'users' table:", res.rows.map(r => r.column_name));

        // Check if password_hash is there. If not, add it.
        const columns = res.rows.map(r => r.column_name);
        if (!columns.includes('password_hash')) {
            console.log("password_hash not found. Adding it...");
            await client.query("ALTER TABLE users ADD COLUMN password_hash VARCHAR;");
            console.log("Added password_hash column!");
        } else {
            console.log("password_hash already exists.");
        }
    } catch (err) {
        console.error("Error:", err);
    } finally {
        await client.end();
    }
}
main();
