export function progresoArranque(transcurridoMs: number, duracionMs: number): number {
  if (duracionMs <= 0) return 1;
  return Math.min(1, Math.max(0, transcurridoMs / duracionMs));
}

export function lineaArranque(progreso: number, lineas: readonly string[]): string {
  if (lineas.length === 0) return "";
  const p = Math.min(1, Math.max(0, progreso));
  const indice = Math.min(lineas.length - 1, Math.floor(p * lineas.length));
  return lineas[indice] ?? "";
}
