import type { Destino } from "@/lib/enlace-profundo";
import type { LugarMenu } from "@/lib/menu";

export const REEL_DISPONIBLE: boolean = true;

export const SITIO = {
  titulo: "Alexander Urbaneja · Product Engineer · Full Stack",
  descripcion:
    "Portafolio de Alexander Urbaneja, Product Engineer y desarrollador Full Stack en Caracas: sistemas ERP, comercio electrónico con punto de venta, sitios web y minijuegos con Next.js, React, TypeScript, Node.js y PostgreSQL.",
  nombre: { nombre: "Alexander", apellido: "Urbaneja" },
  archivoDelFondo: "plano_FINAL_final_v3_ahora_si.dwg",
  fotoPerfil: "/yo.png",
  rol: "Product Engineer · Full Stack",
} as const;

export const AVISO_NUEVA_PESTANA = "se abre en una pestaña nueva";

export const ENLACES = {
  linkedin: "https://www.linkedin.com/in/alexanderojas",
  correo: "mailto:enyeralexander@gmail.com",
  github: "https://github.com/enyeralexander-rgb",
  behance: "https://www.behance.net/alestudiocreative",
} as const;

export const CORREO = "enyeralexander@gmail.com";

export interface Marca {
  id: string;
  nombre: string;
  nombreLateral: string;
  logo: string;
  descripcion: string;
  sitio: string;
  ajustado?: boolean;
  soloPestana?: boolean;
}

export const MARCAS: readonly Marca[] = [
  {
    id: "osi",
    nombre: "OSIIRIS",
    nombreLateral: "Osiiris",
    logo: "/logos/logo-osiiris.png",
    descripcion:
      "E-commerce de moda de alta gama. Tienda con pagos por PayPal y Binance Pay, control de stock automatizado y correos transaccionales. Next.js · Auth.js · PostgreSQL.",
    sitio: "https://osiiris.com",
    soloPestana: true,
  },
  {
    id: "sal",
    nombre: "SAL CELESTIAL",
    nombreLateral: "Sal Celestial",
    logo: "/logos/logo-sal.png",
    descripcion: "Sal premium venezolana. Sitio con panel de administración para que el equipo edite textos, fotos y videos sin programar. Next.js · TypeScript · PostgreSQL.",
    sitio: "https://www.salcelestialve.com",
  },
  {
    id: "par",
    nombre: "PARMIGIANA",
    nombreLateral: "Parmigiana",
    logo: "/logos/logo-parmigiana.png",
    descripcion: "Pasta artesanal. Sitio con catálogo, recetas y boletín. Next.js · TypeScript · PostgreSQL.",
    sitio: "https://www.parmigianave.com",
  },
  {
    id: "all",
    nombre: "ALLAVEN",
    nombreLateral: "Allaven",
    logo: "/logos/logo-allaven.png",
    descripcion: "Publicidad exterior y digital. Sitio con generador de vistas previas de vallas. Next.js · TypeScript · PostgreSQL.",
    sitio: "https://www.allavenve.com",
    ajustado: true,
  },
  {
    id: "bes",
    nombre: "BESPOKEN",
    nombreLateral: "Bespoken",
    logo: "/logos/logo-bespoken.png",
    descripcion:
      "Experiencias de marca 360. Sitio con editor visual por bloques, borradores e historial. Next.js · Drizzle · PostgreSQL.",
    sitio: "https://www.bespokenve.com",
  },
];

export const CV = {
  id: "cv",
  titulo: "CV.PDF",
  descripcion: "Currículum de una página, en español y en inglés.",
} as const;

export const ARCHIVOS_CV = [
  { id: "es", etiqueta: "CV ESPAÑOL.PDF", href: "/cv/Alexander_Urbaneja_CV_ES.pdf" },
  { id: "en", etiqueta: "CV ENGLISH.PDF", href: "/cv/Alexander_Urbaneja_CV_EN.pdf" },
] as const;

export type OrigenVideo = "escritorio" | "audiovisual";

export interface Video {
  id: string;
  titulo: string;
  archivo: string;
  poster: string;
  duracion: number;
  tieneAudio: boolean;
  descripcion: string;
}

export const VIDEOS: readonly Video[] = [
  {
    id: "reel",
    titulo: "REEL",
    archivo: "/reel/reel.mp4",
    poster: "/reel/reel-poster.webp",
    duracion: 44,
    tieneAudio: false,
    descripcion:
      "Reel de 44 segundos, sin audio: presenta cinco proyectos web (Sal Celestial, Allaven, Bespoken, LuckyLY y MONT) con la captura de cada sitio desplazándose, las tecnologías usadas y el enlace a Behance.",
  },
];

export const nombreDeVideo = (v: Video): string => `${v.titulo}.MOV`;

export interface Minijuego {
  id: string;
  titulo: string;
  marca: string;
  icono: string;
  archivo: string;
  descripcion: string;
}

export const CARPETA_JUEGOS = { id: "juegos", nombre: "MINIJUEGOS/DINÁMICAS", nombreLateral: "Minijuegos" } as const;

export const CARPETA_PROYECTOS = { id: "proyectos", nombre: "PROYECTOS WEB" } as const;

const juego = (id: string, titulo: string, marca: string, descripcion: string): Minijuego => ({
  id,
  titulo,
  marca,
  icono: `/minijuegos/${id}/icono.png`,
  archivo: `/minijuegos/${id}/index.html`,
  descripcion,
});

export const MINIJUEGOS: readonly Minijuego[] = [
  juego("memoria-celestial", "MEMORIA CELESTIAL", "SAL CELESTIAL", "Juego de memoria de Sal Celestial con instrumentos y símbolos de la gaita zuliana."),
  juego("ruleta-celestial", "RULETA CELESTIAL · LA COPA", "SAL CELESTIAL", "Ruleta de Sal Celestial con ambientación de casino, hecha para activaciones de marca."),
  juego("memoria-changan", "MEMORIA CHANGAN", "CHANGAN", "Juego de memoria con las cartas de CHANGAN, hecho para una activación de la marca."),
  juego("sopa-baby-finger", "SOPA DE LETRAS", "BABY FINGER", "Sopa de letras de Baby Finger, versión 0.1."),
  juego("memoria-baby-finger", "MEMORIA", "BABY FINGER", "Juego de memoria de Baby Finger, versión 0.1."),
  juego("rompecabezas-baby-finger", "ROMPECABEZAS", "BABY FINGER", "Rompecabezas de Baby Finger, versión 0.1."),
];

export function idJuego(juegoId: string): string {
  return `juego-${juegoId}`;
}

export function juegoDeVentana(idVentana: string): Minijuego | undefined {
  return MINIJUEGOS.find((j) => idJuego(j.id) === idVentana);
}

export function tituloDeJuego(j: Minijuego): string {
  return `${j.titulo} · DEMOSTRACIÓN`;
}

export type TipoElemento =
  | "carpeta"
  | "nota"
  | "video"
  | "contacto"
  | "papelera"
  | "cv"
  | "navegador"
  | "juego"
  | "bienvenida";

export interface ElementoAbrible {
  id: string;
  titulo: string;
  tipo: TipoElemento;
  origen?: OrigenVideo;
}

export interface ElementoEscritorio {
  id: string;
  etiqueta: string;
  tipo: TipoElemento;
}

export const ELEMENTOS_ESCRITORIO: readonly ElementoEscritorio[] = [
  { id: CARPETA_PROYECTOS.id, etiqueta: CARPETA_PROYECTOS.nombre, tipo: "carpeta" },
  { id: CARPETA_JUEGOS.id, etiqueta: CARPETA_JUEGOS.nombre, tipo: "carpeta" },
  { id: "reclutadores", etiqueta: "PARA RECLUTADORES.TXT", tipo: "nota" },
  { id: "servicios", etiqueta: "SERVICIOS.TXT", tipo: "nota" },
  { id: "sobre", etiqueta: "SOBRE MÍ.TXT", tipo: "nota" },
  { id: CV.id, etiqueta: CV.titulo, tipo: "cv" },
  ...(REEL_DISPONIBLE
    ? VIDEOS.map((v): ElementoEscritorio => ({ id: v.id, etiqueta: nombreDeVideo(v), tipo: "video" }))
    : []),
  { id: "contacto", etiqueta: "CONTACTO", tipo: "contacto" },
];

export interface AplicacionDock {
  id: string;
  etiqueta: string;
  titulo: string;
  tipo: TipoElemento;
}

export const APLICACIONES_DOCK: readonly AplicacionDock[] = [
  { id: "contacto", etiqueta: "CONTACTO", titulo: "CONTACTO", tipo: "contacto" },
  { id: "papelera", etiqueta: "PAPELERA", titulo: "PAPELERA", tipo: "papelera" },
];

export const MENU = {
  marca: "A.U. OS",
} as const;

export const BIENVENIDA: {
  titulo: "BIENVENIDA";
  parrafos: readonly string[];
  botones: readonly { etiqueta: string; destino: Destino }[];
  enlaceSimple: "/simple";
} = {
  titulo: "BIENVENIDA",
  parrafos: [
    "Hola, soy Alexander Urbaneja: Product Engineer y desarrollador Full Stack en Caracas. Este es mi escritorio: aquí están mis sitios web, minijuegos, videos y cómo contactarme.",
    "Para abrir algo, haz doble clic sobre su ícono (en el teléfono, tócalo).",
  ],
  botones: [
    { etiqueta: "Ver mis sitios web", destino: "proyectos" },
    { etiqueta: "Jugar una dinámica", destino: "juegos" },
    { etiqueta: "Soy reclutador", destino: "reclutadores" },
    { etiqueta: "Tengo un negocio", destino: "servicios" },
    { etiqueta: "Escribirme", destino: "contacto" },
  ],
  enlaceSimple: "/simple",
};

export const TEXTO_ENLACE_SIMPLE = "Ver versión simple";

export const ARRANQUE = {
  titulo: ["A.U.", "CONTROL"],
  duracionMs: 1600,
  lineas: ["ENCENDIENDO REACTOR", "CALIBRANDO CARPETAS", "LISTO PARA DESPEGAR"],
} as const;

export const LUGARES_FAVORITOS: readonly { lugar: string; etiqueta: string }[] = [
  { lugar: "escritorio", etiqueta: "Escritorio" },
  { lugar: "proyectos", etiqueta: "Proyectos" },
  { lugar: "audiovisual", etiqueta: "Audiovisual" },
  { lugar: CARPETA_JUEGOS.id, etiqueta: CARPETA_JUEGOS.nombreLateral },
];

export const SOBRE_MI = {
  titulo: "SOBRE MÍ.TXT",
  lineas: [
    "Alexander Urbaneja.",
    "Product Engineer y desarrollador Full Stack: construyo productos web completos junto a los equipos de negocio, del modelo de datos a la interfaz. Vengo del diseño y la edición audiovisual, por eso cuido la experiencia de usuario.",
    "Caracas, Venezuela. Disponible para trabajo remoto.",
  ],
  fotoAlt: "Retrato de Alexander Urbaneja",
  fotoPie: "EXP. N° 001 · A. URBANEJA",
  pie: "Texto sin formato · UTF-8",
} as const;

export const ENLACES_CONTACTO = [
  { id: "linkedin", etiqueta: "LINKEDIN", href: ENLACES.linkedin },
  { id: "correo", etiqueta: "CORREO", href: ENLACES.correo },
  { id: "github", etiqueta: "GITHUB", href: ENLACES.github },
  { id: "behance", etiqueta: "BEHANCE", href: ENLACES.behance },
] as const;

export function abreNuevaPestana(href: string): boolean {
  return !href.startsWith("mailto:");
}

export interface EnlaceNota {
  etiqueta: string;
  destino?: Destino;
  lugar?: LugarMenu;
  href?: string;
  principal?: boolean;
}

export interface Nota {
  id: string;
  titulo: string;
  bloques: readonly { titulo?: string; lineas: readonly string[] }[];
  enlaces: readonly EnlaceNota[];
  pie: string;
}

export const NOTAS: Record<"sobre" | "reclutadores" | "servicios", Nota> = {
  sobre: {
    id: "sobre",
    titulo: SOBRE_MI.titulo,
    bloques: [{ lineas: SOBRE_MI.lineas }],
    enlaces: [],
    pie: SOBRE_MI.pie,
  },
  reclutadores: {
    id: "reclutadores",
    titulo: "PARA RECLUTADORES.TXT",
    bloques: [
      {
        titulo: "Rol",
        lineas: [
          "Product Engineer · Desarrollador Full Stack. Disponible para trabajo remoto (Caracas, UTC-4).",
          `Correo: ${CORREO}`,
        ],
      },
      {
        titulo: "Experiencia",
        lineas: [
          "más de 5 años construyendo aplicaciones web en producción.",
          "Líder técnico y desarrollador full stack en GRUPO VA (06/2026 – 11/2026), con un equipo de 6 personas.",
          "ERP multiempresa de 22 módulos, en producción como sistema contable interno.",
          "4 sitios de marca en producción (Sal Celestial, Allaven, Bespoken y Parmigiana) y 2 tiendas en línea con punto de venta.",
          "Antes: Osiiris (comercio electrónico con punto de venta, osiiris.com) y Luckyly (plataforma de sorteos, luckyly.win).",
        ],
      },
      {
        titulo: "Stack",
        lineas: [
          "Next.js, React, TypeScript, Node.js y PostgreSQL. Seguridad (Row-Level Security, RBAC, 2FA), pruebas (Vitest y Playwright) y CI/CD con GitHub Actions.",
        ],
      },
      { titulo: "Idiomas", lineas: ["español nativo, inglés intermedio (B1)."] },
      { titulo: "Enlaces", lineas: [] },
    ],
    enlaces: [
      { etiqueta: "CV en español", href: ARCHIVOS_CV[0].href },
      { etiqueta: "CV en inglés", href: ARCHIVOS_CV[1].href },
      { etiqueta: "LinkedIn", href: ENLACES.linkedin },
      { etiqueta: "Correo", href: ENLACES.correo },
      { etiqueta: "GitHub", href: ENLACES.github },
      { etiqueta: "Behance", href: ENLACES.behance },
    ],
    pie: SOBRE_MI.pie,
  },
  servicios: {
    id: "servicios",
    titulo: "SERVICIOS.TXT",
    bloques: [],
    enlaces: [
      {
        etiqueta: "Sitios web para marcas, con panel para que tu equipo cambie textos, fotos y videos sin programar.",
        destino: "proyectos",
      },
      { etiqueta: "Tiendas en línea y sistemas de gestión a la medida: inventario, ventas y punto de venta.", destino: "proyectos" },
      { etiqueta: "Identidad de marca y diseño de piezas.", href: ENLACES.behance },
      { etiqueta: "Video: guion, grabación y postproducción.", lugar: "audiovisual" },
      { etiqueta: "Minijuegos y dinámicas para pantallas táctiles en activaciones de marca.", destino: "juegos" },
      { etiqueta: "Cuéntame qué necesitas", destino: "contacto", principal: true },
    ],
    pie: SOBRE_MI.pie,
  },
};

export const AVISO_JUEGOS = "Juegos hechos para activaciones de marca. Son demostraciones: ningún premio es real.";

export const SIMPLE = {
  titulo: "Alexander Urbaneja · Product Engineer · Full Stack",
  descripcion:
    "Alexander Urbaneja, Product Engineer y desarrollador Full Stack en Caracas: sitios web, minijuegos, CV y contacto. Next.js, React, TypeScript, Node.js y PostgreSQL.",
  verEscritorio: "Ver el escritorio",
  rotulos: {
    marcas: "Sitios web",
    juegos: "Minijuegos y dinámicas",
    video: "Video",
    cv: "CV",
    servicios: "Servicios",
    contacto: "Contacto",
  },
} as const;
