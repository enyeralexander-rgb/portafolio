import { describe, expect, it } from "vitest";
import { destinoDeParametro, elementoDeDestino, type Destino } from "./enlace-profundo";

const DESTINOS: readonly Destino[] = ["contacto", "cv", "reclutadores", "servicios", "proyectos", "juegos"];

describe("destinoDeParametro", () => {
  it("acepta los 6 destinos", () => {
    for (const d of DESTINOS) expect(destinoDeParametro(d), d).toBe(d);
  });

  it("sin parámetro o con un valor desconocido no hay destino", () => {
    expect(destinoDeParametro(null)).toBeNull();
    expect(destinoDeParametro("")).toBeNull();
    expect(destinoDeParametro("audiovisual")).toBeNull();
    expect(destinoDeParametro("CONTACTO")).toBeNull();
    expect(destinoDeParametro(" contacto")).toBeNull();
    expect(destinoDeParametro("toString")).toBeNull();
    expect(destinoDeParametro("__proto__")).toBeNull();
  });
});

describe("elementoDeDestino", () => {
  it("cada destino abre su ventana", () => {
    expect(elementoDeDestino("contacto")).toEqual({ id: "contacto", titulo: "CONTACTO", tipo: "contacto" });
    expect(elementoDeDestino("cv")).toEqual({ id: "cv", titulo: "CV.PDF", tipo: "cv" });
    expect(elementoDeDestino("reclutadores")).toEqual({ id: "reclutadores", titulo: "PARA RECLUTADORES.TXT", tipo: "nota" });
    expect(elementoDeDestino("servicios")).toEqual({ id: "servicios", titulo: "SERVICIOS.TXT", tipo: "nota" });
  });

  it("proyectos y juegos abren un Finder en ese lugar", () => {
    expect(elementoDeDestino("proyectos")).toEqual({ id: "proyectos", titulo: "PROYECTOS WEB", tipo: "carpeta" });
    expect(elementoDeDestino("juegos")).toEqual({ id: "juegos", titulo: "MINIJUEGOS/DINÁMICAS", tipo: "carpeta" });
  });
});
