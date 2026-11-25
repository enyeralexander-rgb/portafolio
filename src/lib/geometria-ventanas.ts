import type { TipoElemento } from "@/data/contenido";

export interface Escritorio {
  ancho: number;
  alto: number;
  altoMenu?: number;
}

export interface Tamano {
  ancho: number;
  alto: number;
}

export interface Punto {
  x: number;
  y: number;
}

export const ALTO_MENU = 32;
export const SEPARACION_X = 34;
export const SEPARACION_Y = 30;
const MARGEN_DOCK = 120;
const MARGEN_DERECHO = 20;
const Y_CASCADA = 60;

export function tamanoInicial(tipo: TipoElemento, esc: Escritorio): Tamano {
  switch (tipo) {
    case "nota":
      return { ancho: Math.round(Math.min(680, esc.ancho * 0.55)), alto: Math.round(Math.min(520, esc.alto * 0.7)) };
    case "bienvenida":
      return { ancho: Math.round(Math.min(680, esc.ancho * 0.55)), alto: Math.round(Math.min(380, esc.alto * 0.7)) };
    case "contacto":
      return { ancho: Math.round(Math.min(720, esc.ancho * 0.9)), alto: Math.round(Math.min(560, esc.alto * 0.78)) };
    case "cv":
      return { ancho: Math.round(Math.min(440, esc.ancho * 0.9)), alto: Math.round(Math.min(330, esc.alto * 0.6)) };
    case "video":
      return { ancho: Math.round(Math.min(820, esc.ancho * 0.62)), alto: Math.round(Math.min(620, esc.alto * 0.78)) };
    case "navegador":
      return {
        ancho: Math.max(0, esc.ancho - 2 * MARGEN_DERECHO),
        alto: Math.max(0, esc.alto - Y_CASCADA - MARGEN_DOCK),
      };
    default:
      return { ancho: Math.round(Math.min(840, esc.ancho * 0.6)), alto: Math.round(Math.min(540, esc.alto * 0.68)) };
  }
}

export function limitarPosicion(p: Punto, t: Tamano, esc: Escritorio): Punto {
  const arriba = esc.altoMenu ?? ALTO_MENU;
  const maxX = Math.max(0, esc.ancho - t.ancho);
  const maxY = Math.max(arriba, esc.alto - t.alto);
  return {
    x: Math.round(Math.min(Math.max(p.x, 0), maxX)),
    y: Math.round(Math.min(Math.max(p.y, arriba), maxY)),
  };
}

export function posicionCascada(t: Tamano, esc: Escritorio, ocupadas: readonly Punto[]): Punto {
  const x0 = esc.ancho * 0.14;
  const y0 = Y_CASCADA;
  const maxX = esc.ancho - t.ancho - MARGEN_DERECHO;
  const maxY = esc.alto - t.alto - MARGEN_DOCK;
  const pasosX = maxX > x0 ? Math.floor((maxX - x0) / SEPARACION_X) + 1 : 1;
  const pasosY = maxY > y0 ? Math.floor((maxY - y0) / SEPARACION_Y) + 1 : 1;
  const pasos = Math.max(1, Math.min(pasosX, pasosY));

  const escalon = (k: number): Punto =>
    limitarPosicion(
      { x: Math.min(maxX, x0 + k * SEPARACION_X), y: Math.min(maxY, y0 + k * SEPARACION_Y) },
      t,
      esc,
    );

  for (let k = 0; k < pasos; k++) {
    const candidata = escalon(k);
    if (!ocupadas.some((o) => o.x === candidata.x && o.y === candidata.y)) return candidata;
  }
  return escalon(ocupadas.length % pasos);
}
