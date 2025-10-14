import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:8080/api/:path*',
      },
      {
        source: '/api/member/:path*',
        destination: 'http://localhost:8080/member/:path*',
      },
    ];
  },
};

export default nextConfig;
