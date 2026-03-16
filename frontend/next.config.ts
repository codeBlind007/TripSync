import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images:{
    remotePatterns:[
      {
        hostname: "images.unsplash.com",
        protocol: 'https'
      }
    ]
  }
};

export default nextConfig;
