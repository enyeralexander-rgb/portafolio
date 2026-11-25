import { describe, expect, it } from "vitest";
import { MARCAS } from "@/data/contenido";
import {
  DURACION_MAX_CARGA_MS,
  dominioDe,
  idNavegador,
  marcaDeNavegador,
  mostrarAnimacionCarga,
} from "./navegador";

describe("dominioDe", () => {
  it("da el nombre de host sin www y en mayúsculas para las 4 marcas", () => {
    expect(dominioDe("https://www.salcelestialve.com")).toBe("SALCELESTIALVE.COM");
    expect(dominioDe("https://www.parmigianave.com")).toBe("PARMIGIANAVE.COM");
    expect(dominioDe("https://www.allavenve.com")).toBe("ALLAVENVE.COM");
    expect(dominioDe("https://www.bespokenve.com")).toBe("BESPOKENVE.COM");
  });
});

describe("idNavegador y marcaDeNavegador", () => {
  it("van y vuelven para cada marca", () => {
    expect(idNavegador("sal")).toBe("web-sal");
    for (const m of MARCAS) expect(marcaDeNavegador(idNavegador(m.id)), m.id).toBe(m);
  });

  it("un id desconocido no da ninguna marca", () => {
    expect(marcaDeNavegador("web-xyz")).toBeUndefined();
    expect(marcaDeNavegador("sal")).toBeUndefined();
    expect(marcaDeNavegador("")).toBeUndefined();
  });
});

describe("mostrarAnimacionCarga", () => {
  it("dura 2000 ms como máximo", () => {
    expect(DURACION_MAX_CARGA_MS).toBe(2000);
  });

  it("solo se ve si no ha cargado y no han pasado 2000 ms", () => {
    expect(mostrarAnimacionCarga(0, false)).toBe(true);
    expect(mostrarAnimacionCarga(1999, false)).toBe(true);
    expect(mostrarAnimacionCarga(2000, false)).toBe(false);
    expect(mostrarAnimacionCarga(0, true)).toBe(false);
    expect(mostrarAnimacionCarga(1999, true)).toBe(false);
    expect(mostrarAnimacionCarga(2000, true)).toBe(false);
  });
});
