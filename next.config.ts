import type { NextConfig } from "next";

export const ENCABEZADOS_SEGURIDAD = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Content-Security-Policy", value: "frame-ancestors 'none'" },
];

export const ENCABEZADOS_MINIJUEGOS = [
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Content-Security-Policy", value: "frame-ancestors 'self'" },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  async headers() {
    const reglas = [
      { source: "/:path*", headers: ENCABEZADOS_SEGURIDAD },
      { source: "/minijuegos/:path*", headers: ENCABEZADOS_MINIJUEGOS },
    ];
    if (process.env.SITE_NOINDEX === "1") {
      reglas.push({ source: "/:path*", headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }] });
    }
    return reglas;
  },
};

export default nextConfig;
