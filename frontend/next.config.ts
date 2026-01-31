import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  /** Next.js 16: PPR + use cache enabled via cacheComponents. */
  cacheComponents: true,
  devIndicators: {
    position: "bottom-right",
  },
  images: {
    formats: ["image/avif", "image/webp"],
  },
  /** Pin project root so Next.js ignores lockfiles outside this directory (e.g. user home). */
  outputFileTracingRoot: path.join(__dirname),
  /** Turbopack: use this directory as workspace root (avoids multiple-lockfile warning). */
  turbopack: { root: __dirname },
};

export default nextConfig;
