import type { NextConfig } from "next";

/** Pure static site: no server, database, APIs or runtime currency feed. */
const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
  poweredByHeader: false,
};
export default nextConfig;
