import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MAX_CUERPO_BYTES } from "@/lib/contacto/limites";
import { TIEMPO_MINIMO_MS, crearToken, verificarToken } from "@/lib/contacto/token";
import { GET, POST } from "./route";

const SECRETO = "secreto-form-de-prueba";
const ID = "3f2b8c1e-5a47-4d1a-9b0e-6c7d8e9f0a1b";
const valido = { correo: "visitante@ejemplo.com", mensaje: "Hola, quiero una web", estado: "ocupado", envioId: ID };

function peticion(cuerpo: unknown, cabeceras: Record<string, string> = {}) {
  return new Request("https://web.ejemplo.com/api/contacto", {
    method: "POST",
    headers: { "content-type": "application/json", host: "web.ejemplo.com", ...cabeceras },
    body: typeof cuerpo === "string" ? cuerpo : JSON.stringify(cuerpo),
  });
}

beforeEach(() => {
  vi.stubEnv("DATABASE_URL", "postgres://no-se-usa");
  vi.stubEnv("SMTP_HOST", "smtp.ejemplo.com");
  vi.stubEnv("SMTP_PORT", "465");
  vi.stubEnv("SMTP_USER", "yo@ejemplo.com");
  vi.stubEnv("SMTP_PASSWORD", "abcd efgh ijkl mnop");
  vi.stubEnv("MAIL_TO", "destino@ejemplo.com");
  vi.stubEnv("FORM_SECRET", SECRETO);
  vi.stubEnv("IP_SALT", "sal");
  vi.spyOn(console, "error").mockImplementation(() => {});
});
afterEach(() => {
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
  vi.useRealTimers();
});

describe("GET /api/contacto", () => {
  it("entrega un token firmado que todavía es 'muy rápido' y sin caché", async () => {
    const r = await GET();
    expect(r.status).toBe(200);
    expect(r.headers.get("cache-control")).toBe("no-store");
    const { token } = (await r.json()) as { token: string };
    expect(verificarToken(token, SECRETO, Date.now())).toBe("muy_rapido");
    expect(verificarToken(token, SECRETO, Date.now() + TIEMPO_MINIMO_MS + 1000)).toBe("ok");
  });

  it("si falta una variable responde 500 sin decir cuál ni imprimir valores", async () => {
    vi.stubEnv("FORM_SECRET", "");
    const r = await GET();
    expect(r.status).toBe(500);
    expect(JSON.stringify(await r.json())).not.toContain("FORM_SECRET");
    const impreso = JSON.stringify((console.error as ReturnType<typeof vi.fn>).mock.calls);
    expect(impreso).toContain("FORM_SECRET");
    expect(impreso).not.toContain("abcd efgh");
  });
});

describe("POST /api/contacto: rechazos antes de tocar la base", () => {
  const codigo = async (r: Response) => ((await r.json()) as { error?: string }).error;

  it("rechaza un origen distinto al del sitio", async () => {
    const r = await POST(peticion(valido, { origin: "https://sitio-malo.com" }));
    expect(r.status).toBe(403);
    expect(await codigo(r)).toBe("origen");
  });

  it("rechaza lo que no es JSON y los cuerpos rotos", async () => {
    expect((await POST(peticion("x", { "content-type": "text/plain" }))).status).toBe(400);
    const r = await POST(peticion("{no es json"));
    expect(r.status).toBe(400);
    expect(await codigo(r)).toBe("cuerpo_invalido");
  });

  it("rechaza cuerpos que pasan del tope, aunque no declaren su largo", async () => {
    const r = await POST(peticion({ ...valido, mensaje: "a".repeat(MAX_CUERPO_BYTES) }));
    expect(r.status).toBe(413);
    expect(await codigo(r)).toBe("demasiado_grande");
  });

  it("el campo trampa lleno responde bien pero no sigue adelante", async () => {
    const r = await POST(peticion({ ...valido, sitio: "http://spam.ejemplo.com", token: "x" }));
    expect(r.status).toBe(200);
    expect(await r.json()).toEqual({ ok: true });
  });

  it("valida la entrada antes que el token", async () => {
    for (const [cambio, esperado] of [
      [{ correo: "malo" }, "correo_invalido"],
      [{ mensaje: "" }, "mensaje_corto"],
      [{ mensaje: "a".repeat(1001) }, "mensaje_largo"],
      [{ estado: "invisible" }, "estado_invalido"],
      [{ envioId: "123" }, "envio_invalido"],
    ] as const) {
      const r = await POST(peticion({ ...valido, ...cambio, token: "x" }));
      expect(r.status, esperado).toBe(400);
      expect(await codigo(r)).toBe(esperado);
    }
    expect(await codigo(await POST(peticion([1, 2])))).toBe("cuerpo_invalido");
  });

  it("rechaza el token ausente, manipulado, demasiado rápido y vencido", async () => {
    const ahora = Date.now();
    const rapido = crearToken(SECRETO, ahora);
    const viejo = crearToken(SECRETO, ahora - 3 * 60 * 60 * 1000);
    const ajeno = crearToken("otro-secreto", ahora - 60_000);

    const sinToken = await POST(peticion(valido));
    expect([sinToken.status, await codigo(sinToken)]).toEqual([403, "token_invalido"]);
    const manipulado = await POST(peticion({ ...valido, token: ajeno }));
    expect([manipulado.status, await codigo(manipulado)]).toEqual([403, "token_invalido"]);
    const deprisa = await POST(peticion({ ...valido, token: rapido }));
    expect([deprisa.status, await codigo(deprisa)]).toEqual([400, "muy_rapido"]);
    const vencido = await POST(peticion({ ...valido, token: viejo }));
    expect([vencido.status, await codigo(vencido)]).toEqual([400, "vencido"]);
  });

  it("ninguna respuesta de error trae datos del servidor ni trazas", async () => {
    const r = await POST(peticion({ ...valido, token: "x" }));
    const texto = JSON.stringify(await r.json());
    expect(texto).not.toMatch(/stack|at \w+ \(|SMTP|postgres|secreto/i);
  });
});
