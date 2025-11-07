
/**@type {import('next').NextConfig} */
const isProd = process.env.NODE_ENV === "production";
const nextConfig = {
  // output: "export",  // Disabled for API routes support - this app uses server-side API routes
  trailingSlash: true,
  reactStrictMode: false,
  // swcMinify: true,
  basePath: isProd ? "" : undefined,
  assetPrefix: isProd ? "" : undefined,
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true
  },
};

module.exports = nextConfig