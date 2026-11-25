import { describe, expect, it } from "vitest";
import { cssCursores, cursorDesdeCuadricula, cursorFlecha, cursorManito } from "./cursores";

describe("cursores", () => {
  it("la flecha es una imagen con la flecha normal como respaldo", () => {
    const c = cursorFlecha();
    expect(c.startsWith('url("data:image/svg+xml,')).toBe(true);
    expect(c.endsWith(" 0 0, default")).toBe(true);
  });

  it("la manito tiene el punto activo en la punta del dedo y respaldo pointer", () => {
    const c = cursorManito();
    expect(c.endsWith(" 10 0, pointer")).toBe(true);
  });

  it("el SVG codificado trae solo pixeles blancos y negros", () => {
    const svg = decodeURIComponent(cursorFlecha().split(",")[1]!.split('")')[0]!);
    expect(svg).toContain('fill="#000"');
    expect(svg).toContain('fill="#fff"');
    expect(svg).toContain("crispEdges");
  });

  it("ignora los espacios de la cuadrícula", () => {
    const c = cursorDesdeCuadricula(["X X"], 1, 0, 0, "default");
    const svg = decodeURIComponent(c.split(",")[1]!.split('")')[0]!);
    expect(svg.match(/<rect/g)).toHaveLength(2);
  });

  it("el CSS define las dos variables", () => {
    const css = cssCursores();
    expect(css).toContain("--cursor-flecha:");
    expect(css).toContain("--cursor-manito:");
    expect(css).not.toContain("</style");
  });
});
