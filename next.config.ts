import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/**',
      },
    ],
  },
  // Deployment optimizations
  poweredByHeader: false,
  reactStrictMode: true,
  // Ensure proper trailing slashes for consistent routing
  trailingSlash: false,
};

export default nextConfig;
