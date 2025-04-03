import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'openweathermap.org',
        port: '',
        pathname: '/img/wn/**', // Allow images from the /img/wn/ path
      },
    ],
  },
  /* other config options can go here */
};

export default nextConfig;
