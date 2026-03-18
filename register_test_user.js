
const BASE_URL = 'https://ciyndj73.us-east.insforge.app';
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3OC0xMjM0LTU2NzgtOTBhYi1jZGVmMTIzNDU2NzgiLCJlbWFpbCI6ImFub25AaW5zZm9yZ2UuY29tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA5NDIxNzN9.3xiBFcR3uIMyK8Y5-EE4GLYKQyNEfZQrL2tGbIqZiMo';

async function registerTestUser() {
    console.log('Registering test@test.com...');
    try {
        const response = await fetch(`${BASE_URL}/api/v1/auth/signup`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'apikey': ANON_KEY,
                'Authorization': `Bearer ${ANON_KEY}`
            },
            body: JSON.stringify({
                email: 'test@test.com',
                password: 'test123',
                data: {
                    name: 'Admin Test'
                }
            })
        });

        const data = await response.json();
        console.log('Response status:', response.status);
        console.log('Response data:', JSON.stringify(data, null, 2));
    } catch (error) {
        console.error('Error:', error);
    }
}

registerTestUser();
