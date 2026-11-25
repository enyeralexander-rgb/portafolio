import type { MetadataRoute } from "next";
import { SITE_NOINDEX } from "@/lib/noindex";

export default function sitemap(): MetadataRoute.Sitemap {
  const sitio = process.env.SITE_URL;
  if (SITE_NOINDEX || !sitio) return [];
  const base = sitio.replace(/\/$/, "");
  return [{ url: base }, { url: `${base}/simple` }];
}
