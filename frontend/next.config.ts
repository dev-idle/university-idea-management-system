import path from "node:path";
import type { NextConfig } from "next";
import bundleAnalyzer from "@next/bundle-analyzer";

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

const nextConfig: NextConfig = {
  /** Standalone output for Docker: minimal production bundle. */
  output: "standalone",
  reactCompiler: true,
  /** Next.js 16: PPR + use cache enabled via cacheComponents. */
  cacheComponents: true,
  devIndicators: {
    position: "bottom-right",
  },
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
    ],
  },
  /** Redirect legacy /staff to /ideas (Staff Ideas Hub). */
  async redirects() {
    return [{ source: "/staff", destination: "/ideas", permanent: false }];
  },
  /** Pin project root so Next.js ignores lockfiles outside this directory (e.g. user home). */
  outputFileTracingRoot: path.join(__dirname),
  /** Turbopack: use this directory as workspace root (avoids multiple-lockfile warning). */
  turbopack: { root: __dirname },
};

export default withBundleAnalyzer(nextConfig);
