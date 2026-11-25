import { afterEach, describe, expect, it, vi } from "vitest";

afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetModules();
});

async function cargarSitemap(noindex: string, sitio?: string) {
  vi.resetModules();
  vi.stubEnv("SITE_NOINDEX", noindex);
  vi.stubEnv("SITE_URL", sitio ?? "");
  const { default: sitemap } = await import("./sitemap");
  return sitemap();
}

describe("sitemap.xml", () => {
  it("en modo indexable incluye la portada y /simple", async () => {
    const s = await cargarSitemap("", "https://web.ejemplo.com/");
    expect(s.map((e) => e.url)).toEqual(["https://web.ejemplo.com", "https://web.ejemplo.com/simple"]);
  });

  it("en modo sin indexar sale vacío", async () => {
    expect(await cargarSitemap("1", "https://web.ejemplo.com")).toEqual([]);
  });

  it("sin SITE_URL sale vacío", async () => {
    expect(await cargarSitemap("")).toEqual([]);
  });
});
