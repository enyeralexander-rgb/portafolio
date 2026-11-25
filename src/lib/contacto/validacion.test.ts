import { describe, expect, it } from "vitest";
import { MENSAJE_MAX, largoTexto, normalizarCorreo, normalizarMensaje, validarMensaje } from "./validacion";

const ID = "3f2b8c1e-5a47-4d1a-9b0e-6c7d8e9f0a1b";
const base = { correo: "visitante@ejemplo.com", mensaje: "Hola, quiero cotizar un sitio web.", envioId: ID };

describe("normalizarCorreo", () => {
  it("acepta correos normales y los pasa a minúsculas", () => {
    expect(normalizarCorreo("  Visitante@Ejemplo.COM ")).toBe("visitante@ejemplo.com");
    expect(normalizarCorreo("a.b+c@sub.dominio.com.ve")).toBe("a.b+c@sub.dominio.com.ve");
  });

  it("rechaza lo que no es un correo", () => {
    for (const malo of ["", " ", "sin-arroba", "a@b", "a@b.c", "@ejemplo.com", "a@.com", "a@ejemplo..com", "a b@ejemplo.com", "a@ejemplo.123", ".a@ejemplo.com", "a.@ejemplo.com", "a..b@ejemplo.com", "a@-ejemplo.com", "ñu@ejemplo.com"]) {
      expect(normalizarCorreo(malo), malo).toBeNull();
    }
  });

  it("rechaza lo que no es texto", () => {
    for (const malo of [undefined, null, 5, {}, [], ["a@b.com"], true]) {
      expect(normalizarCorreo(malo)).toBeNull();
    }
  });

  it("rechaza saltos de línea y otros caracteres de control (inyección de cabeceras)", () => {
    expect(normalizarCorreo("a@ejemplo.com\r\nBcc: otro@ejemplo.com")).toBeNull();
    expect(normalizarCorreo("a@ejemplo.com\nBcc:x@ejemplo.com")).toBeNull();
    expect(normalizarCorreo("a\u0000@ejemplo.com")).toBeNull();
  });

  it("respeta los límites de largo: 254 en total y 64 antes de la arroba", () => {
    const dominio = `${"d".repeat(60)}.${"e".repeat(60)}.${"f".repeat(60)}.com`;
    const largo = `${"a".repeat(64)}@${dominio}`;
    expect(largo.length).toBeLessThanOrEqual(254);
    expect(normalizarCorreo(largo)).toBe(largo);
    expect(normalizarCorreo(`${"a".repeat(65)}@ejemplo.com`)).toBeNull();
    expect(normalizarCorreo(`a@${"d".repeat(63)}.${"e".repeat(63)}.${"f".repeat(63)}.${"g".repeat(60)}.com`)).toBeNull();
  });
});

describe("normalizarMensaje", () => {
  it("recorta espacios y unifica los saltos de línea", () => {
    expect(normalizarMensaje("  hola\r\nmundo \r")).toEqual({ texto: "hola\nmundo" });
  });

  it("pide entre 2 y 1000 caracteres", () => {
    expect(normalizarMensaje("")).toEqual({ codigo: "mensaje_corto" });
    expect(normalizarMensaje("   ")).toEqual({ codigo: "mensaje_corto" });
    expect(normalizarMensaje("a")).toEqual({ codigo: "mensaje_corto" });
    expect(normalizarMensaje("ab")).toEqual({ texto: "ab" });
    expect(normalizarMensaje("a".repeat(MENSAJE_MAX))).toEqual({ texto: "a".repeat(MENSAJE_MAX) });
    expect(normalizarMensaje("a".repeat(MENSAJE_MAX + 1))).toEqual({ codigo: "mensaje_largo" });
  });

  it("cuenta caracteres, no unidades internas: un emoji vale uno", () => {
    expect(largoTexto("😀😀")).toBe(2);
    expect(normalizarMensaje("😀".repeat(MENSAJE_MAX))).toEqual({ texto: "😀".repeat(MENSAJE_MAX) });
    expect(normalizarMensaje("😀".repeat(MENSAJE_MAX + 1))).toEqual({ codigo: "mensaje_largo" });
  });

  it("rechaza lo que no es texto y los caracteres nulos o de control", () => {
    for (const malo of [undefined, null, 12, {}, ["hola"]]) {
      expect(normalizarMensaje(malo)).toEqual({ codigo: "mensaje_invalido" });
    }
    expect(normalizarMensaje("hola\u0000mundo")).toEqual({ codigo: "mensaje_invalido" });
    expect(normalizarMensaje("hola\u001bmundo")).toEqual({ codigo: "mensaje_invalido" });
    expect(normalizarMensaje("hola\n\tmundo")).toEqual({ texto: "hola\n\tmundo" });
  });
});

describe("validarMensaje", () => {
  it("acepta un envío completo sin estado", () => {
    expect(validarMensaje(base)).toEqual({
      ok: true,
      datos: { correo: "visitante@ejemplo.com", mensaje: base.mensaje, estado: null, envioId: ID },
    });
  });

  it("acepta los tres estados y también null o ausente", () => {
    for (const estado of ["disponible", "ocupado", "ausente"]) {
      const r = validarMensaje({ ...base, estado });
      expect(r.ok && r.datos.estado).toBe(estado);
    }
    const r = validarMensaje({ ...base, estado: null });
    expect(r.ok && r.datos.estado).toBeNull();
  });

  it("rechaza estados inválidos", () => {
    for (const estado of ["", "Disponible", "invisible", 1, {}, [], false]) {
      expect(validarMensaje({ ...base, estado }), String(estado)).toEqual({ ok: false, codigo: "estado_invalido" });
    }
  });

  it("rechaza identificadores de envío que no son UUID", () => {
    for (const envioId of [undefined, "", "123", "no-es-uuid", `${ID}x`, 7, null]) {
      expect(validarMensaje({ ...base, envioId }), String(envioId)).toEqual({ ok: false, codigo: "envio_invalido" });
    }
  });

  it("rechaza cuerpos que no son un objeto", () => {
    for (const cuerpo of [null, undefined, "texto", 5, [], [base]]) {
      expect(validarMensaje(cuerpo)).toEqual({ ok: false, codigo: "cuerpo_invalido" });
    }
  });

  it("revisa el correo antes que el mensaje", () => {
    expect(validarMensaje({ ...base, correo: "malo", mensaje: "" })).toEqual({ ok: false, codigo: "correo_invalido" });
    expect(validarMensaje({ ...base, mensaje: "" })).toEqual({ ok: false, codigo: "mensaje_corto" });
  });

  it("ignora campos de más y no los devuelve", () => {
    const r = validarMensaje({ ...base, admin: true, estado: "ocupado" });
    expect(r.ok && Object.keys(r.datos).sort()).toEqual(["correo", "envioId", "estado", "mensaje"]);
  });
});
