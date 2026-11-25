import { describe, expect, it } from "vitest";
import { CARPETA_JUEGOS, CARPETA_PROYECTOS, ELEMENTOS_ESCRITORIO, MARCAS, MINIJUEGOS } from "@/data/contenido";
import { partesEtiqueta } from "./etiquetas";
import { dominioDe } from "./navegador";

const cortaDentroDePalabra = (partes: readonly string[]): boolean =>
  partes.some((p, i) => i > 0 && !partes[i - 1]!.endsWith("/") && !p.startsWith("."));

describe("partesEtiqueta", () => {
  it("corta MINIJUEGOS/DINÁMICAS solo después de la barra", () => {
    expect(partesEtiqueta("MINIJUEGOS/DINÁMICAS")).toEqual(["MINIJUEGOS/", "DINÁMICAS"]);
  });

  it("corta un dominio solo antes de la terminación", () => {
    expect(partesEtiqueta("SALCELESTIALVE.COM")).toEqual(["SALCELESTIALVE", ".COM"]);
    for (const m of MARCAS) expect(partesEtiqueta(dominioDe(m.sitio)), m.id).toEqual([dominioDe(m.sitio).slice(0, -4), ".COM"]);
  });

  it("sin barra ni punto no hay corte, y los bordes no dejan partes vacías", () => {
    expect(partesEtiqueta("LOCALHOST")).toEqual(["LOCALHOST"]);
    expect(partesEtiqueta("PROYECTOS WEB")).toEqual(["PROYECTOS WEB"]);
    expect(partesEtiqueta("A/")).toEqual(["A/"]);
    expect(partesEtiqueta(".ENV")).toEqual([".ENV"]);
    expect(partesEtiqueta("X.")).toEqual(["X."]);
    expect(partesEtiqueta("")).toEqual([""]);
  });

  it("ninguna etiqueta de la web se corta dentro de una palabra ni pierde letras", () => {
    const etiquetas = [
      ...ELEMENTOS_ESCRITORIO.map((e) => e.etiqueta),
      ...MINIJUEGOS.map((j) => j.titulo),
      ...MARCAS.map((m) => dominioDe(m.sitio)),
      CARPETA_JUEGOS.nombre,
      CARPETA_PROYECTOS.nombre,
    ];
    for (const t of etiquetas) {
      const partes = partesEtiqueta(t);
      expect(partes.join(""), t).toBe(t);
      expect(partes.every((p) => p.length > 0), t).toBe(true);
      expect(cortaDentroDePalabra(partes), t).toBe(false);
    }
  });
});
