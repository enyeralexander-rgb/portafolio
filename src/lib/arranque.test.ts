import { describe, expect, it } from "vitest";
import { lineaArranque, progresoArranque } from "./arranque";

const lineas = ["UNO", "DOS", "TRES"];

describe("progresoArranque", () => {
  it("avanza de 0 a 1 con el tiempo", () => {
    expect(progresoArranque(0, 1600)).toBe(0);
    expect(progresoArranque(800, 1600)).toBe(0.5);
    expect(progresoArranque(1600, 1600)).toBe(1);
  });

  it("no se sale del rango", () => {
    expect(progresoArranque(-50, 1600)).toBe(0);
    expect(progresoArranque(9000, 1600)).toBe(1);
  });

  it("con duración cero termina de inmediato", () => {
    expect(progresoArranque(0, 0)).toBe(1);
  });
});

describe("lineaArranque", () => {
  it("reparte las frases en partes iguales", () => {
    expect(lineaArranque(0, lineas)).toBe("UNO");
    expect(lineaArranque(0.34, lineas)).toBe("DOS");
    expect(lineaArranque(0.7, lineas)).toBe("TRES");
  });

  it("al llegar al final queda la última frase", () => {
    expect(lineaArranque(1, lineas)).toBe("TRES");
  });

  it("sin frases devuelve vacío", () => {
    expect(lineaArranque(0.5, [])).toBe("");
  });
});
