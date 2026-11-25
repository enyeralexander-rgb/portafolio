import { describe, expect, it } from "vitest";
import { PASOS_SOBRE, PAUSA_INICIO_SESION_MS, esperaParaVuelo, lineaDeTiempoChat } from "./linea-tiempo";

describe("lineaDeTiempoChat", () => {
  it("Alexander escribe al abrir, saluda a los 3 s y manda el zumbido a los 6 s", () => {
    expect(lineaDeTiempoChat(false)).toEqual([
      { en: 0, tipo: "escribiendo" },
      { en: 3_000, tipo: "saludo" },
      { en: 6_000, tipo: "zumbido", temblor: true },
    ]);
  });

  it("con movimiento reducido el zumbido sale igual pero sin temblor", () => {
    const zumbido = lineaDeTiempoChat(true).find((e) => e.tipo === "zumbido");
    expect(zumbido).toEqual({ en: 6_000, tipo: "zumbido", temblor: false });
    expect(lineaDeTiempoChat(true).map((e) => e.en)).toEqual([0, 3_000, 6_000]);
  });

  it("los eventos van en orden y sin repetir", () => {
    const tiempos = lineaDeTiempoChat(false).map((e) => e.en);
    expect([...tiempos].sort((a, b) => a - b)).toEqual(tiempos);
    expect(new Set(tiempos).size).toBe(tiempos.length);
  });

  it("la pantalla de inicio de sesión dura 1,3 s", () => {
    expect(PAUSA_INICIO_SESION_MS).toBe(1_300);
  });
});

describe("pasos del sobre", () => {
  it("son cinco, en orden: aparece, entra la carta, se cierra, sello y vuelo", () => {
    expect(PASOS_SOBRE.map((p) => p.paso)).toEqual([1, 2, 3, 4, 5]);
    const tiempos = PASOS_SOBRE.map((p) => p.en);
    expect([...tiempos].sort((a, b) => a - b)).toEqual(tiempos);
  });

  it("el vuelo espera lo que falte, y si ya pasó el momento sale de una vez", () => {
    expect(esperaParaVuelo(0)).toBe(2_050);
    expect(esperaParaVuelo(1_000)).toBe(1_050);
    expect(esperaParaVuelo(2_050)).toBe(0);
    expect(esperaParaVuelo(9_000)).toBe(0);
  });
});
