import { describe, expect, it } from "vitest";
import { formatearFecha, formatearHora } from "./formato-fecha";

describe("formatearHora", () => {
  it("da la hora de Caracas en formato de 12 horas", () => {
    expect(formatearHora(new Date(Date.UTC(2026, 10, 1, 16, 5)))).toBe("12:05 p. m.");
  });

  it("usa la zona de Caracas aunque en UTC ya sea otro día", () => {
    expect(formatearHora(new Date(Date.UTC(2026, 10, 2, 2, 30)))).toBe("10:30 p. m.");
  });

  it("escribe la mañana con a. m.", () => {
    expect(formatearHora(new Date(Date.UTC(2026, 10, 1, 13, 9)))).toBe("09:09 a. m.");
  });
});

describe("formatearFecha", () => {
  it("da el día de la semana, el día y el mes abreviados, sin puntos", () => {
    expect(formatearFecha(new Date(Date.UTC(2026, 10, 1, 16, 5)))).toBe("dom, 1 nov");
  });

  it("usa el día de Caracas aunque en UTC ya sea el siguiente", () => {
    expect(formatearFecha(new Date(Date.UTC(2026, 10, 2, 2, 30)))).toBe("dom, 1 nov");
  });

  it("no deja puntos en los meses largos abreviados", () => {
    expect(formatearFecha(new Date(Date.UTC(2026, 8, 2, 16, 5)))).not.toContain(".");
  });
});
