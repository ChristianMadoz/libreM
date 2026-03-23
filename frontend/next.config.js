/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  env: {
    INSFORGE_URL: process.env.INSFORGE_URL || 'https://ciyndj73.us-east.insforge.app',
    INSFORGE_ANON_KEY: process.env.INSFORGE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3OC0xMjM0LTU2NzgtOTBhYi1jZGVmMTIzNDU2NzgiLCJlbWFpbCI6ImFub25AaW5zZm9yZ2UuY29tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA5NDIxNzN9.3xiBFcR3uIMyK8Y5-EE4GLYKQyNEfZQrL2tGbIqZiMo',
  },
};

module.exports = nextConfig;
