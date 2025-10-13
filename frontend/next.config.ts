import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:8080/api/:path*', // 백엔드 서버 주소로 변경
      },
    ];
  },
};

export default nextConfig;
