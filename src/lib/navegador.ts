import { MARCAS, type Marca } from "@/data/contenido";

export const DURACION_MAX_CARGA_MS = 2000;

export function dominioDe(sitio: string): string {
  return new URL(sitio).hostname.replace(/^www\./, "").toUpperCase();
}

export function idNavegador(marcaId: string): string {
  return `web-${marcaId}`;
}

export function marcaDeNavegador(idVentana: string): Marca | undefined {
  return MARCAS.find((m) => idNavegador(m.id) === idVentana);
}

export function mostrarAnimacionCarga(transcurridoMs: number, cargado: boolean): boolean {
  return !cargado && transcurridoMs < DURACION_MAX_CARGA_MS;
}
