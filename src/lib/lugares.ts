import {
  AVISO_JUEGOS,
  CARPETA_JUEGOS,
  CARPETA_PROYECTOS,
  CV,
  ELEMENTOS_ESCRITORIO,
  MARCAS,
  MINIJUEGOS,
  NOTAS,
  VIDEOS,
  nombreDeVideo,
  idJuego,
  tituloDeJuego,
  type ElementoAbrible,
  type Marca,
  type OrigenVideo,
  type Video,
} from "@/data/contenido";
import { dominioDe, idNavegador } from "./navegador";

export type AccionElemento =
  | { tipo: "ir"; lugar: string }
  | { tipo: "abrir"; elemento: ElementoAbrible }
  | { tipo: "enlace"; href: string };

export interface ElementoLugar {
  clave: string;
  etiqueta: string;
  icono: "carpeta" | "texto" | "web" | "pdf" | "video" | "app";
  accion: AccionElemento;
  imagen?: string;
  subetiqueta?: string;
}

export interface VistaLugar {
  lugar: string;
  titulo: string;
  ruta: string[];
  subtitulo: string;
  icono: "carpeta" | "video";
  vista: "lista" | "apps";
  elementos: ElementoLugar[];
  vacio: string | null;
}

const CARPETAS_ESCRITORIO: Record<string, string> = {
  [CARPETA_PROYECTOS.id]: CARPETA_PROYECTOS.nombre,
  [CARPETA_JUEGOS.id]: CARPETA_JUEGOS.nombre,
};

const carpetaDe = (id: string, nombre: string): ElementoLugar => ({
  clave: id,
  etiqueta: nombre,
  icono: "carpeta",
  accion: { tipo: "ir", lugar: id },
});

const accesoWebDe = (m: Marca): ElementoLugar => ({
  clave: idNavegador(m.id),
  etiqueta: dominioDe(m.sitio),
  icono: "web",
  accion: { tipo: "abrir", elemento: { id: idNavegador(m.id), titulo: dominioDe(m.sitio), tipo: "navegador" } },
});

const archivoDeVideo = (v: Video, origen: OrigenVideo): ElementoLugar => ({
  clave: v.id,
  etiqueta: nombreDeVideo(v),
  icono: "video",
  accion: { tipo: "abrir", elemento: { id: v.id, titulo: nombreDeVideo(v), tipo: "video", origen } },
});

export function describirLugar(lugar: string): VistaLugar {
  switch (lugar) {
    case CARPETA_JUEGOS.id:
      return {
        lugar,
        titulo: CARPETA_JUEGOS.nombre,
        ruta: [CARPETA_JUEGOS.nombre],
        subtitulo: AVISO_JUEGOS,
        icono: "carpeta",
        vista: "apps",
        elementos: MINIJUEGOS.map((j) => ({
          clave: j.id,
          etiqueta: j.titulo,
          icono: "app",
          imagen: j.icono,
          subetiqueta: j.marca,
          accion: { tipo: "abrir", elemento: { id: idJuego(j.id), titulo: tituloDeJuego(j), tipo: "juego" } },
        })),
        vacio: null,
      };
    case CARPETA_PROYECTOS.id:
      return {
        lugar,
        titulo: CARPETA_PROYECTOS.nombre,
        ruta: [CARPETA_PROYECTOS.nombre],
        subtitulo: `Las ${MARCAS.length} marcas de este portafolio.`,
        icono: "carpeta",
        vista: "lista",
        elementos: MARCAS.map(accesoWebDe),
        vacio: null,
      };
    case "audiovisual":
      return {
        lugar,
        titulo: "AUDIOVISUAL",
        ruta: ["AUDIOVISUAL"],
        subtitulo: "Piezas de video.",
        icono: "video",
        vista: "lista",
        elementos: VIDEOS.map((v) => archivoDeVideo(v, "audiovisual")),
        vacio: VIDEOS.length > 0 ? null : "Todavía no hay videos publicados.",
      };
    case "papelera":
      return {
        lugar,
        titulo: "PAPELERA",
        ruta: ["PAPELERA"],
        subtitulo: "Vacía. Aquí no se bota ningún proyecto.",
        icono: "carpeta",
        vista: "lista",
        elementos: [],
        vacio: "No hay nada en la papelera.",
      };
    default: {
      const elementos: ElementoLugar[] = [];
      for (const el of ELEMENTOS_ESCRITORIO) {
        const nombreCarpeta = el.tipo === "carpeta" ? CARPETAS_ESCRITORIO[el.id] : undefined;
        if (nombreCarpeta) elementos.push(carpetaDe(el.id, nombreCarpeta));
        else if (el.tipo === "cv") {
          elementos.push({
            clave: el.id,
            etiqueta: CV.titulo,
            icono: "pdf",
            accion: { tipo: "abrir", elemento: { id: el.id, titulo: CV.titulo, tipo: "cv" } },
          });
        } else if (el.tipo === "video") {
          const v = VIDEOS.find((x) => x.id === el.id);
          if (v) elementos.push(archivoDeVideo(v, "escritorio"));
        } else if (el.tipo === "nota") {
          const nota = Object.values(NOTAS).find((n) => n.id === el.id);
          if (nota) {
            elementos.push({
              clave: el.id,
              etiqueta: nota.titulo,
              icono: "texto",
              accion: { tipo: "abrir", elemento: { id: el.id, titulo: nota.titulo, tipo: "nota" } },
            });
          }
        }
      }
      return {
        lugar: "escritorio",
        titulo: "ESCRITORIO",
        ruta: ["ESCRITORIO"],
        subtitulo: "Todo lo que hay en el escritorio.",
        icono: "carpeta",
        vista: "lista",
        elementos,
        vacio: null,
      };
    }
  }
}

export const tituloDeLugar = (lugar: string): string => describirLugar(lugar).titulo;

export function textoElementos(n: number): string {
  if (n === 0) return "Sin elementos";
  return n === 1 ? "1 elemento" : `${n} elementos`;
}
