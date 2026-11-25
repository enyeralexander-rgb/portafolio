import type { MetadataRoute } from "next";
import { SITE_NOINDEX } from "@/lib/noindex";

export default function robots(): MetadataRoute.Robots {
  if (SITE_NOINDEX) return { rules: { userAgent: "*", disallow: ["/", "/api/"] } };

  const sitio = process.env.SITE_URL;
  return {
    rules: { userAgent: "*", allow: "/", disallow: "/api/" },
    sitemap: sitio ? `${sitio.replace(/\/$/, "")}/sitemap.xml` : undefined,
  };
}
