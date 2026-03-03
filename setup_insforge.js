/**
 * InsForge Infrastructure Setup Script
 * Creates the `posts` and `profiles` tables, and the `profiles` storage bucket.
 * 
 * Run with: node setup_insforge.js
 */

const BASE_URL = 'https://ciyndj73.us-east.insforge.app';
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3OC0xMjM0LTU2NzgtOTBhYi1jZGVmMTIzNDU2NzgiLCJlbWFpbCI6ImFub25AaW5zZm9yZ2UuY29tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA5NDIxNzN9.3xiBFcR3uIMyK8Y5-EE4GLYKQyNEfZQrL2tGbIqZiMo';

async function runSQL(sql) {
  const res = await fetch(`${BASE_URL}/api/v1/sql`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${ANON_KEY}`,
    },
    body: JSON.stringify({ query: sql }),
  });
  const data = await res.json();
  if (!res.ok) {
    console.error('SQL Error:', data);
    return false;
  }
  console.log('SQL OK:', sql.substring(0, 60) + '...');
  return true;
}

async function createBucket(name) {
  const res = await fetch(`${BASE_URL}/api/v1/storage/buckets`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${ANON_KEY}`,
    },
    body: JSON.stringify({ name, public: true }),
  });
  const data = await res.json();
  if (!res.ok) {
    if (data?.error?.includes('already exists')) {
      console.log(`Bucket '${name}' already exists`);
      return true;
    }
    console.error('Bucket Error:', data);
    return false;
  }
  console.log(`Bucket '${name}' created`);
  return true;
}

async function main() {
  console.log('=== InsForge Infrastructure Setup ===\n');

  // 1. Create posts table
  console.log('1. Creating posts table...');
  await runSQL(`
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

  // 2. Create profiles table
  console.log('\n2. Creating profiles table...');
  await runSQL(`
    CREATE TABLE IF NOT EXISTS profiles (
      id TEXT PRIMARY KEY,
      avatar_url TEXT,
      avatar_key TEXT,
      display_name TEXT,
      bio TEXT,
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);

  // 3. Create profiles storage bucket
  console.log('\n3. Creating profiles storage bucket...');
  await createBucket('profiles');

  console.log('\n=== Setup Complete ===');
}

main().catch(console.error);
