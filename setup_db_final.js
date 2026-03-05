const { Client } = require('pg');

const connectionString = "postgresql://postgres:eca71ec8ff16ce808ef35cf63598b488@ciyndj73.us-east.database.insforge.app:5432/insforge?sslmode=require";

async function setup() {
    const client = new Client({
        connectionString: connectionString,
    });

    try {
        await client.connect();
        console.log('Connected to database');

        // Create posts table
        console.log('Creating posts table...');
        await client.query(`
            CREATE TABLE IF NOT EXISTS posts (
                id SERIAL PRIMARY KEY,
                title TEXT NOT NULL,
                content TEXT NOT NULL,
                author TEXT NOT NULL,
                author_id TEXT,
                created_at TIMESTAMPTZ DEFAULT NOW(),
                updated_at TIMESTAMPTZ DEFAULT NOW()
            );
        `);

        // Create profiles table
        console.log('Creating profiles table...');
        await client.query(`
            CREATE TABLE IF NOT EXISTS profiles (
                id TEXT PRIMARY KEY,
                avatar_url TEXT,
                avatar_key TEXT,
                display_name TEXT,
                bio TEXT,
                updated_at TIMESTAMPTZ DEFAULT NOW()
            );
        `);

        console.log('Infrastructure setup complete');
    } catch (err) {
        console.error('Error setting up infrastructure:', err);
    } finally {
        await client.end();
    }
}

setup();
