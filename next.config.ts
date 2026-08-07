import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["localhost:3001", "127.0.0.1:3001", "192.168.1.16:3001", "192.168.1.*"],
};

export default nextConfig;

