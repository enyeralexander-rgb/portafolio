import { afterEach, describe, expect, it, vi } from "vitest";
import nextConfig, { ENCABEZADOS_SEGURIDAD } from "../../next.config";

afterEach(() => vi.unstubAllEnvs());

const comoObjeto = (lista: { key: string; value: string }[]) => Object.fromEntries(lista.map((h) => [h.key, h.value]));

const patron = (source: string) => new RegExp(`^${source.replace("/:path*", "(/.*)?")}$`);

async function encabezadosDe(ruta: string): Promise<Record<string, string>> {
  const reglas = await nextConfig.headers!();
  const final: Record<string, string> = {};
  for (const r of reglas) if (patron(r.source).test(ruta)) Object.assign(final, comoObjeto(r.headers));
  return final;
}

describe("headers() de next.config", () => {
  it("todas las rutas llevan los cuatro encabezados de seguridad", async () => {
    vi.stubEnv("SITE_NOINDEX", "");
    const reglas = await nextConfig.headers!();
    expect(reglas[0]!.source).toBe("/:path*");
    expect(comoObjeto(reglas[0]!.headers)).toEqual({
      "X-Content-Type-Options": "nosniff",
      "Referrer-Policy": "strict-origin-when-cross-origin",
      "X-Frame-Options": "DENY",
      "Content-Security-Policy": "frame-ancestors 'none'",
    });
  });

  it("la política de contenido solo tiene frame-ancestors", () => {
    const csp = ENCABEZADOS_SEGURIDAD.find((h) => h.key === "Content-Security-Policy")!.value;
    expect(csp.split(";").map((d) => d.trim().split(" ")[0])).toEqual(["frame-ancestors"]);
  });

  it("con SITE_NOINDEX=1 se agrega X-Robots-Tag sin quitar los de seguridad", async () => {
    vi.stubEnv("SITE_NOINDEX", "1");
    const reglas = await nextConfig.headers!();
    const todos = comoObjeto(reglas.flatMap((r) => r.headers));
    expect(todos["X-Robots-Tag"]).toBe("noindex, nofollow");
    expect(comoObjeto(reglas[0]!.headers)["X-Frame-Options"]).toBe("DENY");
    expect((await encabezadosDe("/"))["X-Robots-Tag"]).toBe("noindex, nofollow");
    expect((await encabezadosDe("/minijuegos/x"))["X-Robots-Tag"]).toBe("noindex, nofollow");
  });

  it("los minijuegos se dejan mostrar solo en el mismo origen; el resto sigue cerrado", async () => {
    vi.stubEnv("SITE_NOINDEX", "");
    const juego = await encabezadosDe("/minijuegos/x");
    expect(juego["X-Frame-Options"]).toBe("SAMEORIGIN");
    expect(juego["Content-Security-Policy"]).toBe("frame-ancestors 'self'");
    expect(juego["X-Content-Type-Options"]).toBe("nosniff");
    const inicio = await encabezadosDe("/");
    expect(inicio["X-Frame-Options"]).toBe("DENY");
    expect(inicio["Content-Security-Policy"]).toBe("frame-ancestors 'none'");
    expect((await encabezadosDe("/minijuegosx"))["X-Frame-Options"]).toBe("DENY");
  });

  it("cualquier otro valor de SITE_NOINDEX no activa el modo sin indexar", async () => {
    vi.stubEnv("SITE_NOINDEX", "true");
    const reglas = await nextConfig.headers!();
    expect(comoObjeto(reglas.flatMap((r) => r.headers))["X-Robots-Tag"]).toBeUndefined();
  });
});
