import { describe, expect, it } from "vitest";
import {
  ALTO_MENU,
  SEPARACION_X,
  SEPARACION_Y,
  limitarPosicion,
  posicionCascada,
  tamanoInicial,
} from "./geometria-ventanas";

const esc = { ancho: 1280, alto: 800 };

describe("tamanoInicial", () => {
  it("las carpetas son las más grandes y tienen tope", () => {
    expect(tamanoInicial("carpeta", esc)).toEqual({ ancho: 768, alto: 540 });
    expect(tamanoInicial("carpeta", { ancho: 3000, alto: 2000 })).toEqual({ ancho: 840, alto: 540 });
  });

  it("el navegador es mayor que una carpeta y no pasa del escritorio ni tapa el dock", () => {
    const web = tamanoInicial("navegador", esc);
    const carpeta = tamanoInicial("carpeta", esc);
    expect(web).toEqual({ ancho: 1240, alto: 620 });
    expect(web.ancho).toBeGreaterThan(carpeta.ancho);
    expect(web.alto).toBeGreaterThan(carpeta.alto);
    expect(web.ancho).toBeLessThanOrEqual(esc.ancho);
    expect(web.alto).toBeLessThanOrEqual(esc.alto);
    const pos = posicionCascada(web, esc, []);
    expect(pos.x).toBeGreaterThanOrEqual(0);
    expect(pos.x + web.ancho).toBeLessThanOrEqual(esc.ancho);
    expect(pos.y).toBeGreaterThanOrEqual(ALTO_MENU);
    expect(pos.y + web.alto).toBeLessThanOrEqual(esc.alto - 107);
  });

  it("el mensajero cabe en pantallas pequeñas y tiene tope en las grandes", () => {
    expect(tamanoInicial("contacto", esc)).toEqual({ ancho: 720, alto: 560 });
    expect(tamanoInicial("contacto", { ancho: 3000, alto: 2000 })).toEqual({ ancho: 720, alto: 560 });
    const chico = tamanoInicial("contacto", { ancho: 800, alto: 600 });
    expect(chico.ancho).toBeLessThanOrEqual(800);
    expect(chico.alto).toBeLessThanOrEqual(600);
  });

  it("el reproductor de video tiene tope y cabe en pantallas pequeñas", () => {
    expect(tamanoInicial("video", esc)).toEqual({ ancho: 794, alto: 620 });
    expect(tamanoInicial("video", { ancho: 3000, alto: 2000 })).toEqual({ ancho: 820, alto: 620 });
    const chico = tamanoInicial("video", { ancho: 500, alto: 500 });
    expect(chico.ancho).toBeLessThanOrEqual(500);
    expect(chico.alto).toBeLessThanOrEqual(500);
  });

  it("la bienvenida abre tan ancha como una nota pero más baja, para no dejar hueco abajo", () => {
    const b = tamanoInicial("bienvenida", esc);
    expect(b).toEqual({ ancho: 680, alto: 380 });
    expect(b.ancho).toBe(tamanoInicial("nota", esc).ancho);
    expect(b.alto).toBeLessThan(tamanoInicial("nota", esc).alto);
    const chica = tamanoInicial("bienvenida", { ancho: 390, alto: 500 });
    expect(chica.ancho).toBeLessThanOrEqual(390);
    expect(chica.alto).toBeLessThanOrEqual(500 * 0.7);
  });

  it("la ventana del CV es pequeña", () => {
    const t = tamanoInicial("cv", esc);
    expect(t).toEqual({ ancho: 440, alto: 330 });
    expect(t.ancho).toBeLessThan(tamanoInicial("carpeta", esc).ancho);
  });
});

describe("limitarPosicion", () => {
  const t = { ancho: 400, alto: 300 };

  it("deja igual una posición que cabe", () => {
    expect(limitarPosicion({ x: 100, y: 100 }, t, esc)).toEqual({ x: 100, y: 100 });
  });

  it("no deja salir por los cuatro lados", () => {
    expect(limitarPosicion({ x: -50, y: 100 }, t, esc).x).toBe(0);
    expect(limitarPosicion({ x: 5000, y: 100 }, t, esc).x).toBe(esc.ancho - t.ancho);
    expect(limitarPosicion({ x: 100, y: -50 }, t, esc).y).toBe(ALTO_MENU);
    expect(limitarPosicion({ x: 100, y: 5000 }, t, esc).y).toBe(esc.alto - t.alto);
  });

  it("si la ventana es más grande que la pantalla, la pega arriba a la izquierda", () => {
    const grande = { ancho: 2000, alto: 2000 };
    expect(limitarPosicion({ x: 300, y: 300 }, grande, esc)).toEqual({ x: 0, y: ALTO_MENU });
  });

  it("con la barra de 44 px de las tabletas, ninguna ventana queda debajo de la barra", () => {
    const tableta = { ...esc, altoMenu: 44 };
    expect(limitarPosicion({ x: 100, y: 10 }, t, tableta).y).toBe(44);
    expect(limitarPosicion({ x: 100, y: 100 }, t, tableta).y).toBe(100);
    expect(limitarPosicion({ x: 0, y: 0 }, { ancho: 2000, alto: 2000 }, tableta).y).toBe(44);
  });
});

describe("posicionCascada", () => {
  const t = tamanoInicial("carpeta", esc);

  it("tres ventanas seguidas quedan en cascada, cada una más abajo y a la derecha", () => {
    const ocupadas: { x: number; y: number }[] = [];
    const posiciones = [0, 1, 2].map(() => {
      const p = posicionCascada(t, esc, ocupadas);
      ocupadas.push(p);
      return p;
    });
    expect(posiciones[1]!.x - posiciones[0]!.x).toBe(SEPARACION_X);
    expect(posiciones[1]!.y - posiciones[0]!.y).toBe(SEPARACION_Y);
    expect(posiciones[2]!.x - posiciones[1]!.x).toBe(SEPARACION_X);
    expect(posiciones[2]!.y - posiciones[1]!.y).toBe(SEPARACION_Y);
  });

  it("al cerrar una del medio, la siguiente ocupa el hueco y no se encima", () => {
    const a = posicionCascada(t, esc, []);
    const b = posicionCascada(t, esc, [a]);
    const c = posicionCascada(t, esc, [a, b]);
    const nueva = posicionCascada(t, esc, [a, c]);
    expect(nueva).toEqual(b);
  });

  it("nunca se sale de la pantalla, aunque se abran muchas", () => {
    const ocupadas: { x: number; y: number }[] = [];
    for (let i = 0; i < 40; i++) {
      const p = posicionCascada(t, esc, ocupadas);
      ocupadas.push(p);
      expect(p.x).toBeGreaterThanOrEqual(0);
      expect(p.y).toBeGreaterThanOrEqual(ALTO_MENU);
      expect(p.x + t.ancho).toBeLessThanOrEqual(esc.ancho);
      expect(p.y + t.alto).toBeLessThanOrEqual(esc.alto);
    }
  });

  it("cuando la cascada se acaba, vuelve a empezar desde arriba", () => {
    const ocupadas: { x: number; y: number }[] = [];
    const primera = posicionCascada(t, esc, ocupadas);
    for (let i = 0; i < 40; i++) ocupadas.push(posicionCascada(t, esc, ocupadas));
    const despues = posicionCascada(t, esc, ocupadas);
    expect(ocupadas.some((o) => o.x === primera.x && o.y === primera.y)).toBe(true);
    expect(despues.y).toBeGreaterThanOrEqual(primera.y);
  });

  it("en una pantalla pequeña igual da una posición válida", () => {
    const chica = { ancho: 800, alto: 600 };
    const p = posicionCascada(tamanoInicial("carpeta", chica), chica, []);
    expect(p.x).toBeGreaterThanOrEqual(0);
    expect(p.y).toBeGreaterThanOrEqual(ALTO_MENU);
  });
});
