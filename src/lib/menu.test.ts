import { describe, expect, it } from "vitest";
import { ACCIONES_AYUDA_TELEFONO, MENU_ITEMS, MENU_TELEFONO, elementoDeLugar, moverFoco } from "./menu";

describe("MENU_ITEMS", () => {
  it("trae ARCHIVO, VER, PROYECTOS y AYUDA con sus acciones", () => {
    expect(MENU_ITEMS).toEqual([
      {
        etiqueta: "ARCHIVO",
        acciones: [
          { etiqueta: "CV.PDF", accion: { tipo: "abrir", destino: "cv" } },
          { etiqueta: "CONTACTO", accion: { tipo: "abrir", destino: "contacto" } },
        ],
      },
      {
        etiqueta: "VER",
        acciones: [
          { etiqueta: "Versión simple", accion: { tipo: "enlace", href: "/simple" } },
          { etiqueta: "Bienvenida", accion: { tipo: "bienvenida" } },
        ],
      },
      {
        etiqueta: "PROYECTOS",
        acciones: [
          { etiqueta: "Proyectos web", accion: { tipo: "abrir", destino: "proyectos" } },
          { etiqueta: "Minijuegos/Dinámicas", accion: { tipo: "abrir", destino: "juegos" } },
          { etiqueta: "Audiovisual", accion: { tipo: "lugar", lugar: "audiovisual" } },
        ],
      },
      {
        etiqueta: "AYUDA",
        acciones: [
          { etiqueta: "¿Qué es esto?", accion: { tipo: "bienvenida" } },
          { etiqueta: "Para reclutadores", accion: { tipo: "abrir", destino: "reclutadores" } },
          { etiqueta: "Servicios", accion: { tipo: "abrir", destino: "servicios" } },
        ],
      },
    ]);
  });

  it("en teléfono solo queda AYUDA, con la bienvenida y la versión simple a mano", () => {
    expect(MENU_TELEFONO).toEqual(["AYUDA"]);
    expect(ACCIONES_AYUDA_TELEFONO.map((a) => a.etiqueta)).toEqual([
      "¿Qué es esto?",
      "Versión simple",
      "Para reclutadores",
      "Servicios",
    ]);
    expect(ACCIONES_AYUDA_TELEFONO[1]!.accion).toEqual({ tipo: "enlace", href: "/simple" });
  });
});

describe("elementoDeLugar", () => {
  it("abre el Finder parado en Audiovisual, con su título", () => {
    expect(elementoDeLugar("audiovisual")).toEqual({ id: "audiovisual", titulo: "AUDIOVISUAL", tipo: "carpeta" });
  });
});

describe("moverFoco", () => {
  it("las flechas bajan y suben de uno en uno", () => {
    expect(moverFoco(0, 3, "ArrowDown")).toBe(1);
    expect(moverFoco(2, 3, "ArrowUp")).toBe(1);
  });

  it("del último pasa al primero y del primero al último", () => {
    expect(moverFoco(2, 3, "ArrowDown")).toBe(0);
    expect(moverFoco(0, 3, "ArrowUp")).toBe(2);
  });

  it("Inicio y Fin van a los extremos, y otra tecla no mueve", () => {
    expect(moverFoco(1, 3, "Home")).toBe(0);
    expect(moverFoco(1, 3, "End")).toBe(2);
    expect(moverFoco(1, 3, "a")).toBe(1);
  });

  it("sin acciones no hay a dónde moverse", () => {
    expect(moverFoco(0, 0, "ArrowDown")).toBe(0);
  });
});
