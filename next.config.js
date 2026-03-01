// next.config.js
/** @type {import("next").NextConfig} */
const config = {
  typescript: {
    tsconfigPath: "./tsconfig.json",
  },
  eslint: {
    dirs: ["src"],
  },
  reactStrictMode: true,
  swcMinify: true,
  experimental: {
    optimizePackageImports: ["lucide-react"],
  },
};

export default config;
