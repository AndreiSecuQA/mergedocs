import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Prevent Next.js from bundling these server-side packages so they
  // can use their native Node.js require() and binary helpers on Vercel.
  serverExternalPackages: ['mammoth', 'html-to-docx'],
};

export default nextConfig;
