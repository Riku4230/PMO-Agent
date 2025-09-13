// next.config.mjs もしくは next.config.ts
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  serverExternalPackages: ["@mastra/*"],
};
export default nextConfig;
