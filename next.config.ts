import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Single lockfile root — silences "multiple lockfiles" warning from /home/sebas
  outputFileTracingRoot: __dirname,
  experimental: {
    serverActions: {
      bodySizeLimit: "5mb",
    },
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**.amazonaws.com" },
      { protocol: "https", hostname: "**.cloudinary.com" },
    ],
  },
  // exceljs references Node core modules (stream, crypto, etc.)
  // that need to be provided in the server bundle.
  serverExternalPackages: ["exceljs", "bullmq", "@valkey/valkey-glide"],
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Allow exceljs to be bundled on the server without breaking
      // browser-only code paths.
      config.resolve = config.resolve || {};
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        stream: false,
        crypto: false,
      };
    }
    return config;
  },
  turbopack: {},
};

export default nextConfig;
