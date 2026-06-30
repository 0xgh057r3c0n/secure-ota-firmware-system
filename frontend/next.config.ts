import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // allow your LAN IP during development for Next dev tools
  allowedDevOrigins: ["192.168.29.95"],
};

export default nextConfig;
