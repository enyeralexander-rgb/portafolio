import { describe, expect, it } from "vitest";
import { CLAVE_BIENVENIDA, VENTANA_BIENVENIDA, debeMostrarBienvenida } from "./bienvenida";

describe("debeMostrarBienvenida", () => {
  it("se muestra en la primera visita, sin destino", () => {
    expect(debeMostrarBienvenida(() => null, null)).toBe(true);
  });

  it("no se muestra si ya se vio", () => {
    expect(debeMostrarBienvenida(() => "1", null)).toBe(false);
  });

  it("no se muestra si la visita trae un destino, aunque nunca se haya visto", () => {
    expect(debeMostrarBienvenida(() => null, "contacto")).toBe(false);
  });

  it("si leer el almacenamiento falla, se muestra igual", () => {
    expect(
      debeMostrarBienvenida(() => {
        throw new Error("almacenamiento bloqueado");
      }, null),
    ).toBe(true);
  });
});

describe("bienvenida", () => {
  it("usa la clave acordada y abre una ventana de tipo bienvenida", () => {
    expect(CLAVE_BIENVENIDA).toBe("bienvenida-vista");
    expect(VENTANA_BIENVENIDA).toEqual({ id: "bienvenida", titulo: "BIENVENIDA", tipo: "bienvenida" });
  });
});
