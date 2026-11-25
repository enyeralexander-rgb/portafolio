export interface Historial {
  lugares: readonly string[];
  indice: number;
}

export function crearHistorial(lugar: string): Historial {
  return { lugares: [lugar], indice: 0 };
}

export function lugarActual(h: Historial): string {
  return h.lugares[h.indice] ?? "";
}

export const puedeIrAtras = (h: Historial): boolean => h.indice > 0;
export const puedeIrAdelante = (h: Historial): boolean => h.indice < h.lugares.length - 1;

export function navegarA(h: Historial, lugar: string): Historial {
  if (lugarActual(h) === lugar) return h;
  return { lugares: [...h.lugares.slice(0, h.indice + 1), lugar], indice: h.indice + 1 };
}

export function irAtras(h: Historial): Historial {
  return puedeIrAtras(h) ? { ...h, indice: h.indice - 1 } : h;
}

export function irAdelante(h: Historial): Historial {
  return puedeIrAdelante(h) ? { ...h, indice: h.indice + 1 } : h;
}
