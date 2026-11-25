import { describe, expect, it } from "vitest";
import {
  PASO_VOLUMEN,
  VOLUMEN_INICIAL,
  ajustarVolumen,
  alTerminar,
  crearLista,
  formatearTiempo,
  hayAnterior,
  haySiguiente,
  idActual,
  irAnterior,
  irSiguiente,
  limitarVolumen,
  porcentajeVolumen,
} from "./reproductor";

const tres = ["a", "b", "c"];

describe("crearLista", () => {
  it("desde el escritorio solo se reproduce ese video, aunque haya más", () => {
    const lista = crearLista(tres, "b", "escritorio")!;
    expect(lista).toEqual({ ids: ["b"], indice: 0 });
    expect(hayAnterior(lista)).toBe(false);
    expect(haySiguiente(lista)).toBe(false);
  });

  it("desde Audiovisual entra la lista completa, parada en el video elegido", () => {
    expect(crearLista(tres, "a", "audiovisual")).toEqual({ ids: tres, indice: 0 });
    expect(crearLista(tres, "c", "audiovisual")).toEqual({ ids: tres, indice: 2 });
    const lista = crearLista(tres, "b", "audiovisual")!;
    expect(idActual(lista)).toBe("b");
    expect(hayAnterior(lista)).toBe(true);
    expect(haySiguiente(lista)).toBe(true);
  });

  it("con un solo video, de cualquier origen, ANTERIOR y SIGUIENTE quedan apagados", () => {
    for (const origen of ["escritorio", "audiovisual"] as const) {
      const lista = crearLista(["reel"], "reel", origen)!;
      expect(hayAnterior(lista)).toBe(false);
      expect(haySiguiente(lista)).toBe(false);
    }
  });

  it("un video que no existe no arma lista", () => {
    expect(crearLista(tres, "z", "audiovisual")).toBeNull();
    expect(crearLista([], "a", "escritorio")).toBeNull();
  });

  it("no cambia el arreglo que recibe", () => {
    const original = ["a", "b"];
    const lista = crearLista(original, "a", "audiovisual")!;
    expect(lista.ids).not.toBe(original);
  });
});

describe("recorrer la lista", () => {
  it("avanza y retrocede de uno en uno", () => {
    let lista = crearLista(tres, "a", "audiovisual")!;
    lista = irSiguiente(lista);
    expect(idActual(lista)).toBe("b");
    lista = irSiguiente(lista);
    expect(idActual(lista)).toBe("c");
    lista = irAnterior(lista);
    expect(idActual(lista)).toBe("b");
  });

  it("sin vuelta circular: en los extremos se queda donde está", () => {
    const primero = crearLista(tres, "a", "audiovisual")!;
    expect(irAnterior(primero)).toBe(primero);
    const ultimo = crearLista(tres, "c", "audiovisual")!;
    expect(irSiguiente(ultimo)).toBe(ultimo);
    expect(haySiguiente(ultimo)).toBe(false);
    expect(hayAnterior(primero)).toBe(false);
  });
});

describe("alTerminar", () => {
  it("pasa al siguiente y sigue reproduciendo", () => {
    const r = alTerminar(crearLista(tres, "a", "audiovisual")!);
    expect(idActual(r.lista)).toBe("b");
    expect(r.continuar).toBe(true);
  });

  it("en el último se detiene y no vuelve al primero", () => {
    const ultimo = crearLista(tres, "c", "audiovisual")!;
    const r = alTerminar(ultimo);
    expect(r.lista).toBe(ultimo);
    expect(r.continuar).toBe(false);
  });

  it("desde el escritorio nunca pasa a otro video", () => {
    const r = alTerminar(crearLista(tres, "a", "escritorio")!);
    expect(idActual(r.lista)).toBe("a");
    expect(r.continuar).toBe(false);
  });
});

describe("formatearTiempo", () => {
  it("da minutos y segundos con dos dígitos de segundos", () => {
    expect(formatearTiempo(0)).toBe("0:00");
    expect(formatearTiempo(7)).toBe("0:07");
    expect(formatearTiempo(65)).toBe("1:05");
    expect(formatearTiempo(44)).toBe("0:44");
    expect(formatearTiempo(600)).toBe("10:00");
  });

  it("corta los decimales en vez de redondear hacia arriba", () => {
    expect(formatearTiempo(59.99)).toBe("0:59");
    expect(formatearTiempo(0.4)).toBe("0:00");
  });

  it("agrega horas cuando pasa de una hora", () => {
    expect(formatearTiempo(3600)).toBe("1:00:00");
    expect(formatearTiempo(3723)).toBe("1:02:03");
  });

  it("lo que no es un tiempo válido se muestra como 0:00", () => {
    expect(formatearTiempo(Number.NaN)).toBe("0:00");
    expect(formatearTiempo(Number.POSITIVE_INFINITY)).toBe("0:00");
    expect(formatearTiempo(-5)).toBe("0:00");
  });
});

describe("volumen", () => {
  it("queda siempre entre 0 y 1", () => {
    expect(limitarVolumen(-0.5)).toBe(0);
    expect(limitarVolumen(1.7)).toBe(1);
    expect(limitarVolumen(0.5)).toBe(0.5);
    expect(limitarVolumen(Number.NaN)).toBe(VOLUMEN_INICIAL);
  });

  it("sube y baja de a una décima sin arrastrar error de decimales", () => {
    let v = 0;
    for (let i = 0; i < 3; i++) v = ajustarVolumen(v, 1);
    expect(v).toBe(0.3);
    expect(ajustarVolumen(0.7, -1)).toBe(0.6);
    expect(PASO_VOLUMEN).toBe(0.1);
  });

  it("no pasa de los extremos", () => {
    expect(ajustarVolumen(1, 1)).toBe(1);
    expect(ajustarVolumen(0, -1)).toBe(0);
    expect(ajustarVolumen(0.95, 1)).toBe(1);
    expect(ajustarVolumen(0.05, -1)).toBe(0);
  });

  it("diez pasos recorren todo el rango exacto", () => {
    let v = 0;
    for (let i = 0; i < 10; i++) v = ajustarVolumen(v, 1);
    expect(v).toBe(1);
    expect(porcentajeVolumen(v)).toBe(100);
    expect(porcentajeVolumen(0.3)).toBe(30);
    expect(porcentajeVolumen(Number.NaN)).toBe(100);
  });
});
