export const DOCK_BASE = 70;
export const DOCK_EXTRA = 50;
export const DOCK_ALCANCE = 150;
export const DOCK_MARGEN_SUPERIOR = 80;
export const DOCK_MARGEN_INFERIOR = 10;

export function punteroCercaDelDock(y: number, arriba: number, abajo: number): boolean {
  return y > arriba - DOCK_MARGEN_SUPERIOR && y < abajo + DOCK_MARGEN_INFERIOR;
}

export function tamanoDockIcono(distanciaX: number, cerca: boolean): number {
  const k = cerca ? Math.max(0, 1 - Math.abs(distanciaX) / DOCK_ALCANCE) : 0;
  return DOCK_BASE + DOCK_EXTRA * k * k;
}
