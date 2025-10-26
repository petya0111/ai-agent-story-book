/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api',
  },
  // Enable compression
  compress: true,
  // Output standalone for better performance
  output: 'standalone',
  experimental: {
    // Enable the App Router if you plan to use it
    appDir: false
  }
}

module.exports = nextConfig