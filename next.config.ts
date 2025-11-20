// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  // If your Python backend is on different domain/port:
  async rewrites() {
    return [
      {
        source: '/python-api/:path*',
        destination: 'http://localhost:8000/:path*',
      },
    ];
  },
};

module.exports = nextConfig;