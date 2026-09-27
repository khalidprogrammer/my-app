import type { NextConfig } from "next";

const securityHeaders = [
  // No iframe embedding (clickjacking defense; the admin uses no iframes).
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  // Stop MIME sniffing so uploads can never execute as something else.
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // No browser-stored upload should access device hardware.
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  // Enforced by browsers only over HTTPS; ignored on plain-http localhost.
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
];

const nextConfig: NextConfig = {
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
