import { describe, expect, it } from "vitest";
import { enviarMensaje, pedirToken } from "./cliente";

const datos = {
  correo: "visitante@ejemplo.com",
  mensaje: "Hola",
  estado: null,
  envioId: "3f2b8c1e-5a47-4d1a-9b0e-6c7d8e9f0a1b",
};

const respuesta = (estado: number, cuerpo: unknown, cabeceras: Record<string, string> = {}) =>
  new Response(typeof cuerpo === "string" ? cuerpo : JSON.stringify(cuerpo), { status: estado, headers: cabeceras });

describe("pedirToken", () => {
  it("devuelve el token del servidor", async () => {
    expect(await pedirToken(async () => respuesta(200, { token: "abc" }))).toBe("abc");
  });

  it("devuelve null si falla la red, el servidor o la respuesta no trae token", async () => {
    expect(await pedirToken(async () => { throw new TypeError("sin red"); })).toBeNull();
    expect(await pedirToken(async () => respuesta(500, { error: "servidor" }))).toBeNull();
    expect(await pedirToken(async () => respuesta(200, { token: 5 }))).toBeNull();
    expect(await pedirToken(async () => respuesta(200, "no es json"))).toBeNull();
  });
});

describe("enviarMensaje", () => {
  it("manda el mensaje con el token y la trampa vacía", async () => {
    let enviado: { cuerpo: Record<string, unknown>; metodo?: string } | null = null;
    const r = await enviarMensaje(datos, "tok", "", async (_url, init) => {
      enviado = { cuerpo: JSON.parse(String(init?.body)), metodo: init?.method };
      return respuesta(200, { ok: true });
    });
    expect(r).toEqual({ ok: true });
    expect(enviado).toEqual({ metodo: "POST", cuerpo: { ...datos, token: "tok", sitio: "" } });
  });

  it("traduce la respuesta de error a un código y lee Retry-After", async () => {
    const limite = await enviarMensaje(datos, "t", "", async () => respuesta(429, { error: "limite" }, { "Retry-After": "1800" }));
    expect(limite).toEqual({ ok: false, codigo: "limite", reintentarEnSeg: 1800 });
    const fallo = await enviarMensaje(datos, "t", "", async () => respuesta(502, { error: "correo_fallido" }));
    expect(fallo).toEqual({ ok: false, codigo: "correo_fallido", reintentarEnSeg: undefined });
  });

  it("un código desconocido o una respuesta que no es JSON cuenta como error del servidor", async () => {
    expect(await enviarMensaje(datos, "t", "", async () => respuesta(500, { error: "raro" }))).toMatchObject({ codigo: "servidor" });
    expect(await enviarMensaje(datos, "t", "", async () => respuesta(502, "<html>"))).toMatchObject({ codigo: "servidor" });
  });

  it("sin conexión devuelve 'red'", async () => {
    expect(await enviarMensaje(datos, "t", "", async () => { throw new TypeError("fallo"); })).toEqual({ ok: false, codigo: "red" });
  });
});
