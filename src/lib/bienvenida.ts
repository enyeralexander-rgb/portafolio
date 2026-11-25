import { BIENVENIDA, type ElementoAbrible } from "@/data/contenido";
import type { Destino } from "./enlace-profundo";

export const CLAVE_BIENVENIDA = "bienvenida-vista";

export const VENTANA_BIENVENIDA: ElementoAbrible = { id: "bienvenida", titulo: BIENVENIDA.titulo, tipo: "bienvenida" };

export function debeMostrarBienvenida(leer: () => string | null, destino: Destino | null): boolean {
  if (destino !== null) return false;
  try {
    return leer() !== "1";
  } catch {
    return true;
  }
}
