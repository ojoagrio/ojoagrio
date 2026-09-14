/** @type {import('next').NextConfig} */
const nextConfig = {
  // Served under ojoagrio.com/agriolinks/* via a rewrite in the ojoagrio
  // Vercel project (see /vercel.json at the repo root).
  basePath: '/agriolinks',
  transpilePackages: ['@ojoagrio/ui'],
};

export default nextConfig;
