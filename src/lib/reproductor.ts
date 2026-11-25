import type { OrigenVideo } from "@/data/contenido";

export interface ListaReproduccion {
  ids: readonly string[];
  indice: number;
}

export function crearLista(
  idsDisponibles: readonly string[],
  idInicial: string,
  origen: OrigenVideo,
): ListaReproduccion | null {
  const posicion = idsDisponibles.indexOf(idInicial);
  if (posicion === -1) return null;
  if (origen === "escritorio") return { ids: [idInicial], indice: 0 };
  return { ids: [...idsDisponibles], indice: posicion };
}

export function idActual(lista: ListaReproduccion): string {
  return lista.ids[lista.indice] ?? "";
}

export function hayAnterior(lista: ListaReproduccion): boolean {
  return lista.indice > 0;
}

export function haySiguiente(lista: ListaReproduccion): boolean {
  return lista.indice < lista.ids.length - 1;
}

export function irAnterior(lista: ListaReproduccion): ListaReproduccion {
  return hayAnterior(lista) ? { ...lista, indice: lista.indice - 1 } : lista;
}

export function irSiguiente(lista: ListaReproduccion): ListaReproduccion {
  return haySiguiente(lista) ? { ...lista, indice: lista.indice + 1 } : lista;
}

export function alTerminar(lista: ListaReproduccion): { lista: ListaReproduccion; continuar: boolean } {
  return haySiguiente(lista)
    ? { lista: irSiguiente(lista), continuar: true }
    : { lista, continuar: false };
}

const dosDigitos = (n: number): string => String(n).padStart(2, "0");

export function formatearTiempo(segundos: number): string {
  if (!Number.isFinite(segundos) || segundos < 0) return "0:00";
  const total = Math.floor(segundos);
  const horas = Math.floor(total / 3600);
  const minutos = Math.floor((total % 3600) / 60);
  const seg = total % 60;
  return horas > 0 ? `${horas}:${dosDigitos(minutos)}:${dosDigitos(seg)}` : `${minutos}:${dosDigitos(seg)}`;
}

export const VOLUMEN_INICIAL = 1;
export const PASO_VOLUMEN = 0.1;

export function limitarVolumen(volumen: number): number {
  if (!Number.isFinite(volumen)) return VOLUMEN_INICIAL;
  const acotado = Math.min(1, Math.max(0, volumen));
  return Math.round(acotado * 100) / 100;
}

export function ajustarVolumen(volumen: number, direccion: 1 | -1): number {
  return limitarVolumen(limitarVolumen(volumen) + direccion * PASO_VOLUMEN);
}

export function porcentajeVolumen(volumen: number): number {
  return Math.round(limitarVolumen(volumen) * 100);
}
