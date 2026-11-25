import { describe, expect, it } from "vitest";
import {
  DOCK_ALCANCE,
  DOCK_BASE,
  DOCK_EXTRA,
  punteroCercaDelDock,
  tamanoDockIcono,
} from "./zoom-dock";

describe("zoom del dock", () => {
  it("el ícono justo bajo el puntero llega al tamaño máximo", () => {
    expect(tamanoDockIcono(0, true)).toBe(DOCK_BASE + DOCK_EXTRA);
  });

  it("lejos del puntero se queda en el tamaño base", () => {
    expect(tamanoDockIcono(DOCK_ALCANCE, true)).toBe(DOCK_BASE);
    expect(tamanoDockIcono(DOCK_ALCANCE * 3, true)).toBe(DOCK_BASE);
    expect(tamanoDockIcono(-DOCK_ALCANCE * 3, true)).toBe(DOCK_BASE);
  });

  it("si el puntero no está cerca del dock no hay zoom", () => {
    expect(tamanoDockIcono(0, false)).toBe(DOCK_BASE);
  });

  it("crece de forma simétrica y va bajando con la distancia", () => {
    expect(tamanoDockIcono(40, true)).toBe(tamanoDockIcono(-40, true));
    expect(tamanoDockIcono(20, true)).toBeGreaterThan(tamanoDockIcono(60, true));
    expect(tamanoDockIcono(60, true)).toBeGreaterThan(tamanoDockIcono(120, true));
  });

  it("detecta si el puntero anda cerca de la barra", () => {
    expect(punteroCercaDelDock(850, 800, 895)).toBe(true);
    expect(punteroCercaDelDock(730, 800, 895)).toBe(true);
    expect(punteroCercaDelDock(500, 800, 895)).toBe(false);
    expect(punteroCercaDelDock(950, 800, 895)).toBe(false);
  });
});
