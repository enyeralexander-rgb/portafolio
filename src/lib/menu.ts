import { BIENVENIDA, type ElementoAbrible } from "@/data/contenido";
import type { Destino } from "./enlace-profundo";
import { tituloDeLugar } from "./lugares";

export type LugarMenu = "audiovisual";

export type AccionMenu =
  | { tipo: "abrir"; destino: Destino }
  | { tipo: "lugar"; lugar: LugarMenu }
  | { tipo: "bienvenida" }
  | { tipo: "enlace"; href: string };

export interface AccionDeMenu {
  etiqueta: string;
  accion: AccionMenu;
}

const VERSION_SIMPLE: AccionDeMenu = { etiqueta: "Versión simple", accion: { tipo: "enlace", href: BIENVENIDA.enlaceSimple } };
const QUE_ES_ESTO: AccionDeMenu = { etiqueta: "¿Qué es esto?", accion: { tipo: "bienvenida" } };
const RECLUTADORES: AccionDeMenu = { etiqueta: "Para reclutadores", accion: { tipo: "abrir", destino: "reclutadores" } };
const SERVICIOS: AccionDeMenu = { etiqueta: "Servicios", accion: { tipo: "abrir", destino: "servicios" } };

export const MENU_ITEMS: readonly { etiqueta: string; acciones: readonly AccionDeMenu[] }[] = [
  {
    etiqueta: "ARCHIVO",
    acciones: [
      { etiqueta: "CV.PDF", accion: { tipo: "abrir", destino: "cv" } },
      { etiqueta: "CONTACTO", accion: { tipo: "abrir", destino: "contacto" } },
    ],
  },
  { etiqueta: "VER", acciones: [VERSION_SIMPLE, { etiqueta: "Bienvenida", accion: { tipo: "bienvenida" } }] },
  {
    etiqueta: "PROYECTOS",
    acciones: [
      { etiqueta: "Proyectos web", accion: { tipo: "abrir", destino: "proyectos" } },
      { etiqueta: "Minijuegos/Dinámicas", accion: { tipo: "abrir", destino: "juegos" } },
      { etiqueta: "Audiovisual", accion: { tipo: "lugar", lugar: "audiovisual" } },
    ],
  },
  { etiqueta: "AYUDA", acciones: [QUE_ES_ESTO, RECLUTADORES, SERVICIOS] },
];

export const MENU_TELEFONO = ["AYUDA"] as const;

export const ACCIONES_AYUDA_TELEFONO: readonly AccionDeMenu[] = [QUE_ES_ESTO, VERSION_SIMPLE, RECLUTADORES, SERVICIOS];

export function elementoDeLugar(lugar: LugarMenu): ElementoAbrible {
  return { id: lugar, titulo: tituloDeLugar(lugar), tipo: "carpeta" };
}

export function moverFoco(actual: number, total: number, tecla: string): number {
  if (total <= 0) return 0;
  if (tecla === "ArrowDown") return (actual + 1) % total;
  if (tecla === "ArrowUp") return (actual - 1 + total) % total;
  if (tecla === "Home") return 0;
  if (tecla === "End") return total - 1;
  return actual;
}
