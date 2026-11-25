import { CARPETA_JUEGOS, CARPETA_PROYECTOS, CV, NOTAS, type ElementoAbrible } from "@/data/contenido";

export type Destino = "contacto" | "cv" | "reclutadores" | "servicios" | "proyectos" | "juegos";

const ELEMENTOS: Record<Destino, ElementoAbrible> = {
  contacto: { id: "contacto", titulo: "CONTACTO", tipo: "contacto" },
  cv: { id: CV.id, titulo: CV.titulo, tipo: "cv" },
  reclutadores: { id: "reclutadores", titulo: NOTAS.reclutadores.titulo, tipo: "nota" },
  servicios: { id: "servicios", titulo: NOTAS.servicios.titulo, tipo: "nota" },
  proyectos: { id: CARPETA_PROYECTOS.id, titulo: CARPETA_PROYECTOS.nombre, tipo: "carpeta" },
  juegos: { id: CARPETA_JUEGOS.id, titulo: CARPETA_JUEGOS.nombre, tipo: "carpeta" },
};

const esDestino = (valor: string): valor is Destino => Object.hasOwn(ELEMENTOS, valor);

export function destinoDeParametro(valor: string | null): Destino | null {
  return valor !== null && esDestino(valor) ? valor : null;
}

export function elementoDeDestino(d: Destino): ElementoAbrible {
  return ELEMENTOS[d];
}
