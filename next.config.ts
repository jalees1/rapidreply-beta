import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  allowedDevOrigins: ["excuse-wrench-whiny.ngrok-free.dev"],
  turbopack: {
    root: process.cwd(),
  },
};

export default nextConfig;
