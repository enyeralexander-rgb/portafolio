import { describe, expect, it } from "vitest";
import { esCodigoError, sePuedeReintentar, textoDeError } from "./errores";

describe("textos de error", () => {
  it("cada código tiene un texto en español, sin saltos ni tecnicismos", () => {
    for (const codigo of ["correo_invalido", "mensaje_corto", "mensaje_largo", "token_invalido", "muy_rapido", "vencido", "limite", "en_proceso", "correo_fallido", "servidor", "red"] as const) {
      const t = textoDeError(codigo);
      expect(t.length).toBeGreaterThan(10);
      expect(t).not.toMatch(/\b(error|exception|500|undefined|null)\b/i);
    }
  });

  it("el límite dice cuánto falta, redondeando hacia arriba", () => {
    expect(textoDeError("limite", 1)).toContain("1 minuto");
    expect(textoDeError("limite", 61)).toContain("2 minutos");
    expect(textoDeError("limite", 3600)).toContain("60 minutos");
    expect(textoDeError("limite")).not.toContain("minuto");
  });

  it("reconoce solo los códigos conocidos", () => {
    expect(esCodigoError("limite")).toBe(true);
    expect(esCodigoError("otro")).toBe(false);
    expect(esCodigoError(undefined)).toBe(false);
    expect(esCodigoError("constructor")).toBe(false);
  });

  it("se puede reintentar lo transitorio, no lo que pide corregir algo", () => {
    expect(sePuedeReintentar("correo_fallido")).toBe(true);
    expect(sePuedeReintentar("red")).toBe(true);
    expect(sePuedeReintentar("servidor")).toBe(true);
    expect(sePuedeReintentar("limite")).toBe(false);
    expect(sePuedeReintentar("correo_invalido")).toBe(false);
  });
});
