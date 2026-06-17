/** @type {import('next').NextConfig} */
const nextConfig = {
  reactCompiler: true,
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'https://campaign-management-backend-qywr.onrender.com/api/:path*',
      },
    ];
  },
};

export default nextConfig;
