import { describe, expect, it } from "vitest";
import { leerCuerpoLimitado, origenPermitido } from "./peticion";

const flujo = (...partes: string[]) =>
  new ReadableStream<Uint8Array>({
    start(c) {
      for (const p of partes) c.enqueue(new TextEncoder().encode(p));
      c.close();
    },
  });

describe("origenPermitido", () => {
  it("acepta el mismo host y rechaza otro", () => {
    expect(origenPermitido("https://web-personal.vercel.app", "web-personal.vercel.app")).toBe(true);
    expect(origenPermitido("http://localhost:3000", "localhost:3000")).toBe(true);
    expect(origenPermitido("https://sitio-malo.com", "web-personal.vercel.app")).toBe(false);
    expect(origenPermitido("https://web-personal.vercel.app.otro.com", "web-personal.vercel.app")).toBe(false);
  });

  it("sin cabecera Origin pasa; con un Origin ilegible o sin host no", () => {
    expect(origenPermitido(null, "localhost:3000")).toBe(true);
    expect(origenPermitido("no es una url", "localhost:3000")).toBe(false);
    expect(origenPermitido("https://a.com", null)).toBe(false);
  });
});

describe("leerCuerpoLimitado", () => {
  it("lee un cuerpo que cabe, incluso partido en trozos", async () => {
    expect(await leerCuerpoLimitado(flujo('{"a":', '"ñ"}'), 100, null)).toEqual({ ok: true, texto: '{"a":"ñ"}' });
    expect(await leerCuerpoLimitado(null, 100, null)).toEqual({ ok: true, texto: "" });
  });

  it("rechaza lo que se pasa del tope, lo diga o no la cabecera", async () => {
    expect(await leerCuerpoLimitado(flujo("x".repeat(101)), 100, null)).toEqual({ ok: false });
    expect(await leerCuerpoLimitado(flujo("x".repeat(60), "x".repeat(60)), 100, null)).toEqual({ ok: false });
    expect(await leerCuerpoLimitado(flujo("x"), 100, "5000")).toEqual({ ok: false });
  });

  it("cuenta bytes y no caracteres", async () => {
    expect(await leerCuerpoLimitado(flujo("ñ".repeat(60)), 100, null)).toEqual({ ok: false });
  });
});
