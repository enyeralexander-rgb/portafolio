import {
  ARCHIVOS_CV,
  AVISO_JUEGOS,
  BIENVENIDA,
  CORREO,
  CV,
  ENLACES_CONTACTO,
  MARCAS,
  MINIJUEGOS,
  NOTAS,
  REEL_DISPONIBLE,
  SIMPLE,
  VIDEOS,
  abreNuevaPestana,
  nombreDeVideo,
  tituloDeJuego,
} from "@/data/contenido";
import type { Destino } from "./enlace-profundo";
import { dominioDe } from "./navegador";

export interface EnlaceSimple {
  etiqueta: string;
  href: string;
  nuevaPestana: boolean;
}

export const RESUMEN_SIMPLE = (BIENVENIDA.parrafos[0] ?? "").split(/(?<=\.)\s/)[0] ?? "";

const DESTINO_CONTACTO: Destino = "contacto";

export function seccionesSimple() {
  const escribirme = BIENVENIDA.botones.find((b) => b.destino === DESTINO_CONTACTO);
  return {
    marcas: {
      titulo: SIMPLE.rotulos.marcas,
      elementos: MARCAS.map((m) => ({
        id: m.id,
        nombre: m.nombre,
        descripcion: m.descripcion,
        enlace: { etiqueta: dominioDe(m.sitio), href: m.sitio, nuevaPestana: true } satisfies EnlaceSimple,
      })),
    },
    juegos: {
      titulo: SIMPLE.rotulos.juegos,
      aviso: AVISO_JUEGOS,
      elementos: MINIJUEGOS.map((j) => ({
        id: j.id,
        titulo: j.titulo,
        marca: j.marca,
        icono: j.icono,
        enlace: { etiqueta: tituloDeJuego(j), href: j.archivo, nuevaPestana: false } satisfies EnlaceSimple,
      })),
    },
    video: {
      titulo: SIMPLE.rotulos.video,
      elementos: (REEL_DISPONIBLE ? VIDEOS : []).map((v) => ({
        id: v.id,
        descripcion: v.descripcion,
        enlace: { etiqueta: nombreDeVideo(v), href: v.archivo, nuevaPestana: true } satisfies EnlaceSimple,
      })),
    },
    cv: {
      titulo: SIMPLE.rotulos.cv,
      descripcion: CV.descripcion,
      enlaces: ARCHIVOS_CV.map((a): EnlaceSimple => ({ etiqueta: a.etiqueta, href: a.href, nuevaPestana: true })),
    },
    servicios: {
      titulo: SIMPLE.rotulos.servicios,
      lineas: NOTAS.servicios.enlaces.filter((e) => e.destino !== DESTINO_CONTACTO).map((e) => e.etiqueta),
    },
    contacto: {
      titulo: SIMPLE.rotulos.contacto,
      enlaces: [
        ...ENLACES_CONTACTO.map((e): EnlaceSimple => ({
          etiqueta: e.id === "correo" ? CORREO : e.etiqueta,
          href: e.href,
          nuevaPestana: abreNuevaPestana(e.href),
        })),
        ...(escribirme
          ? [{ etiqueta: escribirme.etiqueta, href: `/?abrir=${DESTINO_CONTACTO}`, nuevaPestana: false } satisfies EnlaceSimple]
          : []),
      ],
    },
  };
}
