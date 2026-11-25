import { describe, expect, it } from "vitest";
import {
  crearHistorial,
  irAdelante,
  irAtras,
  lugarActual,
  navegarA,
  puedeIrAdelante,
  puedeIrAtras,
} from "./historial";

describe("historial de una ventana", () => {
  it("empieza en un solo lugar y con atrás y adelante apagados", () => {
    const h = crearHistorial("sal");
    expect(lugarActual(h)).toBe("sal");
    expect(puedeIrAtras(h)).toBe(false);
    expect(puedeIrAdelante(h)).toBe(false);
  });

  it("navegar agrega un lugar y habilita atrás", () => {
    const h = navegarA(crearHistorial("sal"), "proyectos");
    expect(lugarActual(h)).toBe("proyectos");
    expect(puedeIrAtras(h)).toBe(true);
    expect(puedeIrAdelante(h)).toBe(false);
  });

  it("atrás y adelante recorren el historial y se apagan en los extremos", () => {
    let h = crearHistorial("a");
    h = navegarA(h, "b");
    h = navegarA(h, "c");
    h = irAtras(h);
    expect(lugarActual(h)).toBe("b");
    expect(puedeIrAdelante(h)).toBe(true);
    h = irAtras(h);
    expect(lugarActual(h)).toBe("a");
    expect(puedeIrAtras(h)).toBe(false);
    expect(irAtras(h)).toBe(h);
    h = irAdelante(irAdelante(h));
    expect(lugarActual(h)).toBe("c");
    expect(puedeIrAdelante(h)).toBe(false);
    expect(irAdelante(h)).toBe(h);
  });

  it("navegar después de volver atrás descarta lo que había adelante", () => {
    let h = crearHistorial("a");
    h = navegarA(navegarA(h, "b"), "c");
    h = irAtras(irAtras(h));
    h = navegarA(h, "d");
    expect(h.lugares).toEqual(["a", "d"]);
    expect(puedeIrAdelante(h)).toBe(false);
  });

  it("ir al lugar donde ya se está no repite entradas", () => {
    const h = crearHistorial("a");
    expect(navegarA(h, "a")).toBe(h);
  });

  it("no modifica el historial anterior", () => {
    const h = crearHistorial("a");
    navegarA(h, "b");
    expect(h.lugares).toEqual(["a"]);
  });
});
