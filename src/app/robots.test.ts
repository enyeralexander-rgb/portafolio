import { afterEach, describe, expect, it, vi } from "vitest";

afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetModules();
});

async function cargarRobots(noindex: string, sitio?: string) {
  vi.resetModules();
  vi.stubEnv("SITE_NOINDEX", noindex);
  vi.stubEnv("SITE_URL", sitio ?? "");
  const { default: robots } = await import("./robots");
  return robots();
}

describe("robots.txt", () => {
  it("en modo indexable permite todo salvo /api/ y apunta al sitemap", async () => {
    const r = await cargarRobots("", "https://web.ejemplo.com/");
    expect(r.rules).toEqual({ userAgent: "*", allow: "/", disallow: "/api/" });
    expect(r.sitemap).toBe("https://web.ejemplo.com/sitemap.xml");
  });

  it("sin SITE_URL no inventa sitemap", async () => {
    const r = await cargarRobots("");
    expect(r.sitemap).toBeUndefined();
  });

  it("en modo sin indexar cierra todo el sitio y también /api/", async () => {
    const r = await cargarRobots("1", "https://web.ejemplo.com");
    expect(r.rules).toEqual({ userAgent: "*", disallow: ["/", "/api/"] });
    expect(r.sitemap).toBeUndefined();
  });
});
