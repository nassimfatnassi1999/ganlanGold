import type { NextConfig } from "next";

/** Pure static site: no server, database or back-end API. USD/EUR rates are fetched in the browser. */
const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
  poweredByHeader: false,
};
export default nextConfig;
