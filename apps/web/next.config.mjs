/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: [],
  experimental: {
    typedRoutes: true,
  },
  webpack(config) {
    config.resolve.alias = {
      ...config.resolve.alias,
      "@aria/tokens": new URL("./packages/tokens/src/index.json", import.meta.url).pathname,
      "@aria/ui": new URL("./packages/ui/src/index.ts", import.meta.url).pathname,
      "@aria/api-client": new URL("./packages/api-client/src/index.ts", import.meta.url).pathname,
    };
    return config;
  },
};

export default nextConfig;
