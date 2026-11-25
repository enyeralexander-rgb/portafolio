import { existsSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  APLICACIONES_DOCK,
  ARCHIVOS_CV,
  BIENVENIDA,
  TEXTO_ENLACE_SIMPLE,
  CARPETA_JUEGOS,
  CARPETA_PROYECTOS,
  LUGARES_FAVORITOS,
  MINIJUEGOS,
  idJuego,
  juegoDeVentana,
  tituloDeJuego,
  CV,
  ELEMENTOS_ESCRITORIO,
  ENLACES,
  ENLACES_CONTACTO,
  MARCAS,
  REEL_DISPONIBLE,
  SITIO,
  NOTAS,
  SOBRE_MI,
  VIDEOS,
  nombreDeVideo,
} from "./contenido";
import * as contenido from "./contenido";
import { CORREO, abreNuevaPestana } from "./contenido";

const publico = join(process.cwd(), "public");

describe("contenido del sitio", () => {
  it("MARCAS tiene solo osi, sal, par, all y bes", () => {
    expect(MARCAS.map((m) => m.id)).toEqual(["osi", "sal", "par", "all", "bes"]);
  });

  it("ningún texto exportado nombra HIUK, Hidrocarburos ni Mineros", () => {
    expect(JSON.stringify(contenido)).not.toMatch(/hiuk|hidrocarburos|mineros/i);
  });

  it("trae las 5 marcas en el orden acordado", () => {
    expect(MARCAS.map((m) => m.nombre)).toEqual(["OSIIRIS", "SAL CELESTIAL", "PARMIGIANA", "ALLAVEN", "BESPOKEN"]);
  });

  it("cada logo existe en public/", () => {
    for (const marca of MARCAS) {
      expect(existsSync(join(publico, marca.logo)), marca.logo).toBe(true);
    }
    expect(existsSync(join(publico, SITIO.fotoPerfil))).toBe(true);
  });

  it("los identificadores no se repiten", () => {
    const ids = [...ELEMENTOS_ESCRITORIO.map((e) => e.id), ...APLICACIONES_DOCK.map((a) => a.id)];
    const sinContacto = ids.filter((id) => id !== "contacto");
    expect(new Set(sinContacto).size).toBe(sinContacto.length);
  });

  it("el escritorio lleva sus 8 elementos en el orden acordado", () => {
    expect(ELEMENTOS_ESCRITORIO).toEqual([
      { id: "proyectos", etiqueta: "PROYECTOS WEB", tipo: "carpeta" },
      { id: "juegos", etiqueta: "MINIJUEGOS/DINÁMICAS", tipo: "carpeta" },
      { id: "reclutadores", etiqueta: "PARA RECLUTADORES.TXT", tipo: "nota" },
      { id: "servicios", etiqueta: "SERVICIOS.TXT", tipo: "nota" },
      { id: "sobre", etiqueta: "SOBRE MÍ.TXT", tipo: "nota" },
      { id: "cv", etiqueta: "CV.PDF", tipo: "cv" },
      { id: "reel", etiqueta: "REEL.MOV", tipo: "video" },
      { id: "contacto", etiqueta: "CONTACTO", tipo: "contacto" },
    ]);
  });

  it("el escritorio ya no trae accesos web ni carpetas de marca", () => {
    for (const e of ELEMENTOS_ESCRITORIO) {
      expect(e.tipo, e.id).not.toBe("navegador");
      expect(e.id.startsWith("web-"), e.id).toBe(false);
      expect(e.id.startsWith("juegos-"), e.id).toBe(false);
    }
  });

  it("CARPETA_JUEGOS se llama MINIJUEGOS/DINÁMICAS y CARPETA_PROYECTOS, PROYECTOS WEB", () => {
    expect(CARPETA_JUEGOS).toEqual({ id: "juegos", nombre: "MINIJUEGOS/DINÁMICAS", nombreLateral: "Minijuegos" });
    expect(CARPETA_JUEGOS.nombre).toBe("MINIJUEGOS/DINÁMICAS");
    expect(CARPETA_PROYECTOS).toEqual({ id: "proyectos", nombre: "PROYECTOS WEB" });
  });

  it("el favorito Minijuegos lleva a la carpeta juegos", () => {
    expect(LUGARES_FAVORITOS.find((f) => f.etiqueta === "Minijuegos")).toEqual({ lugar: "juegos", etiqueta: "Minijuegos" });
  });

  it("MINIJUEGOS trae los 6 juegos con su marca, su ícono y su index.html", () => {
    expect(MINIJUEGOS.map((j) => [j.id, j.titulo, j.marca])).toEqual([
      ["memoria-celestial", "MEMORIA CELESTIAL", "SAL CELESTIAL"],
      ["ruleta-celestial", "RULETA CELESTIAL · LA COPA", "SAL CELESTIAL"],
      ["memoria-changan", "MEMORIA CHANGAN", "CHANGAN"],
      ["sopa-baby-finger", "SOPA DE LETRAS", "BABY FINGER"],
      ["memoria-baby-finger", "MEMORIA", "BABY FINGER"],
      ["rompecabezas-baby-finger", "ROMPECABEZAS", "BABY FINGER"],
    ]);
    for (const j of MINIJUEGOS) {
      expect(j.icono, j.id).toBe(`/minijuegos/${j.id}/icono.png`);
      expect(j.archivo, j.id).toBe(`/minijuegos/${j.id}/index.html`);
      expect(j.descripcion.length, j.id).toBeGreaterThan(20);
      expect(j, j.id).not.toHaveProperty("carpeta");
    }
  });

  it("cada copia de juego existe en public/minijuegos/<id>/index.html", () => {
    for (const j of MINIJUEGOS) expect(existsSync(join(publico, j.archivo)), j.archivo).toBe(true);
  });

  it("cada ícono existe en public/minijuegos/<id>/icono.png", () => {
    for (const j of MINIJUEGOS) expect(existsSync(join(publico, j.icono)), j.icono).toBe(true);
  });

  it("ORIGEN.json anota de dónde sale cada ícono y cuánto pesa", () => {
    const origen = JSON.parse(readFileSync(join(publico, "minijuegos", "ORIGEN.json"), "utf8")) as Record<
      string,
      { icono?: { ruta: string; ultimoCambio: string; bytes: number } }
    >;
    for (const j of MINIJUEGOS) {
      const icono = origen[j.id]?.icono;
      expect(icono, j.id).toBeDefined();
      expect(icono!.ruta, j.id).toMatch(/mipmap-xxxhdpi\/(ic_launcher|icono)\.png$/);
      expect(icono!.ultimoCambio, j.id).toMatch(/^[0-9a-f]{40}$/);
      expect(icono!.bytes, j.id).toBe(statSync(join(publico, j.icono)).size);
    }
  });

  it("idJuego y juegoDeVentana van y vuelven, y un id desconocido no da juego", () => {
    expect(idJuego("memoria-changan")).toBe("juego-memoria-changan");
    for (const j of MINIJUEGOS) expect(juegoDeVentana(idJuego(j.id)), j.id).toBe(j);
    expect(juegoDeVentana("juego-xyz")).toBeUndefined();
    expect(juegoDeVentana("memoria-changan")).toBeUndefined();
  });

  it("el título de la ventana de juego termina en « · DEMOSTRACIÓN»", () => {
    for (const j of MINIJUEGOS) expect(tituloDeJuego(j), j.id).toBe(`${j.titulo} · DEMOSTRACIÓN`);
  });

  it("CV.PDF abre una ventana con el CV en español y en inglés, que existen en public/cv/", () => {
    expect(CV).toMatchObject({ id: "cv", titulo: "CV.PDF" });
    expect(ELEMENTOS_ESCRITORIO.find((e) => e.id === "cv")).toEqual({ id: "cv", etiqueta: "CV.PDF", tipo: "cv" });
    expect(ARCHIVOS_CV.map((a) => a.etiqueta)).toEqual(["CV ESPAÑOL.PDF", "CV ENGLISH.PDF"]);
    for (const a of ARCHIVOS_CV) {
      expect(a.href.startsWith("/cv/") && a.href.endsWith(".pdf"), a.href).toBe(true);
      expect(existsSync(join(publico, a.href)), a.href).toBe(true);
    }
  });

  it("REEL.MOV solo aparece si REEL_DISPONIBLE está activo, y es un video de la lista", () => {
    expect(REEL_DISPONIBLE).toBe(true);
    const reel = ELEMENTOS_ESCRITORIO.find((e) => e.etiqueta === "REEL.MOV");
    expect(reel).toEqual({ id: "reel", etiqueta: "REEL.MOV", tipo: "video" });
    expect(VIDEOS.some((v) => v.id === reel!.id)).toBe(true);
  });

  it("cada video trae su archivo y su póster en public/reel/, su duración y si tiene audio", () => {
    expect(VIDEOS).toHaveLength(1);
    const [reel] = VIDEOS;
    expect(reel).toEqual({
      id: "reel",
      titulo: "REEL",
      archivo: "/reel/reel.mp4",
      poster: "/reel/reel-poster.webp",
      duracion: 44,
      tieneAudio: false,
      descripcion: expect.stringContaining("Reel de 44 segundos, sin audio"),
    });
    expect(nombreDeVideo(reel!)).toBe("REEL.MOV");
    expect(new Set(VIDEOS.map((v) => v.id)).size).toBe(VIDEOS.length);
    for (const v of VIDEOS) {
      expect(v.archivo.startsWith("/reel/"), v.archivo).toBe(true);
      expect(v.poster.startsWith("/reel/"), v.poster).toBe(true);
      expect(v.duracion).toBeGreaterThan(0);
      expect(v.descripcion.length, v.id).toBeGreaterThan(40);
      expect(v.descripcion).toContain(`${v.duracion} segundos`);
      if (!v.tieneAudio) expect(v.descripcion.toLowerCase()).toContain("sin audio");
    }
  });

  it("el dock termina con Contacto y Papelera", () => {
    expect(APLICACIONES_DOCK.map((a) => a.id)).toEqual(["contacto", "papelera"]);
  });

  it("solo hay enlaces a LinkedIn, correo, GitHub y Behance", () => {
    expect(Object.keys(ENLACES).sort()).toEqual(["behance", "correo", "github", "linkedin"]);
    expect(ENLACES.linkedin).toBe("https://www.linkedin.com/in/alexanderojas");
    expect(ENLACES.correo).toBe(`mailto:${CORREO}`);
    expect(ENLACES.behance).toBe("https://www.behance.net/alestudiocreative");
    expect(ENLACES.github).toBe("https://github.com/enyeralexander-rgb");
  });

  it("no hay redes descartadas, texto de revisión, teléfonos ni correos distintos del oficial", () => {
    const todo = JSON.stringify({
      SITIO,
      ENLACES,
      ENLACES_CONTACTO,
      MARCAS,
      SOBRE_MI,
      ELEMENTOS_ESCRITORIO,
      VIDEOS,
      APLICACIONES_DOCK,
      ARCHIVOS_CV,
      CV,
    });
    expect(todo).not.toMatch(/instagram|tiktok/i);
    expect(todo).not.toMatch(/me gusta as|contenido de ejemplo/i);
    expect(todo.match(/[\w.+-]+@[\w.-]+/g) ?? []).toEqual(expect.arrayContaining([CORREO]));
    for (const c of todo.match(/[\w.+-]+@[\w.-]+/g) ?? []) expect(c).toBe(CORREO);
    expect(todo).not.toMatch(/\d{7,}/);
  });

  it("los metadatos son los acordados", () => {
    expect(SITIO.titulo).toBe("Alexander Urbaneja · Product Engineer · Full Stack");
    expect(SITIO.descripcion).toBe(
      "Portafolio de Alexander Urbaneja, Product Engineer y desarrollador Full Stack en Caracas: sistemas ERP, comercio electrónico con punto de venta, sitios web y minijuegos con Next.js, React, TypeScript, Node.js y PostgreSQL.",
    );
    expect(SITIO.nombre).toEqual({ nombre: "Alexander", apellido: "Urbaneja" });
  });

  it("los sitios oficiales y las descripciones son los verificados", () => {
    const sitios = Object.fromEntries(MARCAS.map((m) => [m.id, m.sitio]));
    expect(sitios).toEqual({
      osi: "https://osiiris.com",
      sal: "https://www.salcelestialve.com",
      par: "https://www.parmigianave.com",
      all: "https://www.allavenve.com",
      bes: "https://www.bespokenve.com",
    });
    expect(MARCAS.find((m) => m.id === "all")!.descripcion).toBe(
      "Publicidad exterior y digital. Sitio con generador de vistas previas de vallas. Next.js · TypeScript · PostgreSQL.",
    );
    for (const m of MARCAS) expect(m.descripcion, m.id).toMatch(/Next\.js · .+ · PostgreSQL\.$/);
  });

  it("MONT no aparece en la web", () => {
    expect(JSON.stringify(MARCAS)).not.toMatch(/mont/i);
  });

  it("la barra lateral escribe los nombres con su capitalización oficial", () => {
    expect(MARCAS.map((m) => m.nombreLateral)).toEqual(["Osiiris", "Sal Celestial", "Parmigiana", "Allaven", "Bespoken"]);
    for (const m of MARCAS) expect(m.nombreLateral.toUpperCase(), m.id).toBe(m.nombre);
  });

  it("no hay montos de dinero en lo que se muestra", () => {
    const todo = JSON.stringify({ MARCAS, SOBRE_MI });
    expect(todo).not.toMatch(/\$|usd|us\$|bs\.|bolívares|€|precio/i);
  });

  it("la ventana de contacto trae LinkedIn, correo, GitHub y Behance, y el correo no abre pestaña nueva", () => {
    expect(ENLACES_CONTACTO.map((e) => e.href)).toEqual([ENLACES.linkedin, ENLACES.correo, ENLACES.github, ENLACES.behance]);
    expect(ENLACES_CONTACTO.map((e) => abreNuevaPestana(e.href))).toEqual([true, false, true, true]);
  });

  it("SOBRE MÍ trae el texto acordado", () => {
    expect(SOBRE_MI.lineas.join(" ")).toBe(
      "Alexander Urbaneja. Product Engineer y desarrollador Full Stack: construyo productos web completos junto a los equipos de negocio, del modelo de datos a la interfaz. Vengo del diseño y la edición audiovisual, por eso cuido la experiencia de usuario. Caracas, Venezuela. Disponible para trabajo remoto.",
    );
  });

  it("la línea de rol es la aprobada", () => {
    expect(SITIO.rol).toBe("Product Engineer · Full Stack");
  });

  it("la bienvenida trae el texto, los 5 botones y el enlace aprobados", () => {
    expect(BIENVENIDA).toEqual({
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
    });
    expect(TEXTO_ENLACE_SIMPLE).toBe("Ver versión simple");
  });

  it("NOTAS trae sobre, reclutadores y servicios, cada una con su id y su título", () => {
    expect(Object.keys(NOTAS).sort()).toEqual(["reclutadores", "servicios", "sobre"]);
    for (const [clave, nota] of Object.entries(NOTAS)) expect(nota.id, clave).toBe(clave);
    expect([NOTAS.sobre.titulo, NOTAS.reclutadores.titulo, NOTAS.servicios.titulo]).toEqual([
      "SOBRE MÍ.TXT",
      "PARA RECLUTADORES.TXT",
      "SERVICIOS.TXT",
    ]);
    for (const e of ELEMENTOS_ESCRITORIO.filter((x) => x.tipo === "nota")) {
      expect(NOTAS[e.id as keyof typeof NOTAS].titulo, e.id).toBe(e.etiqueta);
    }
  });

  it("SOBRE MÍ pasa a NOTAS sin cambiar su texto", () => {
    expect(NOTAS.sobre.bloques).toEqual([{ lineas: SOBRE_MI.lineas }]);
    expect(NOTAS.sobre.enlaces).toEqual([]);
    expect(NOTAS.sobre.pie).toBe(SOBRE_MI.pie);
  });

  it("PARA RECLUTADORES trae las líneas aprobadas", () => {
    expect(NOTAS.reclutadores.bloques).toEqual([
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
    ]);
    expect(NOTAS.reclutadores.enlaces).toEqual([
      { etiqueta: "CV en español", href: ARCHIVOS_CV[0].href },
      { etiqueta: "CV en inglés", href: ARCHIVOS_CV[1].href },
      { etiqueta: "LinkedIn", href: ENLACES.linkedin },
      { etiqueta: "Correo", href: ENLACES.correo },
      { etiqueta: "GitHub", href: ENLACES.github },
      { etiqueta: "Behance", href: ENLACES.behance },
    ]);
    expect(JSON.stringify(NOTAS.reclutadores)).not.toMatch(/\bCTO\b|ORDEN|Rojas/);
  });

  it("SERVICIOS trae las líneas aprobadas, cada una con su ejemplo, y cierra con contacto", () => {
    expect(NOTAS.servicios.bloques).toEqual([]);
    expect(NOTAS.servicios.enlaces).toEqual([
      {
        etiqueta: "Sitios web para marcas, con panel para que tu equipo cambie textos, fotos y videos sin programar.",
        destino: "proyectos",
      },
      { etiqueta: "Tiendas en línea y sistemas de gestión a la medida: inventario, ventas y punto de venta.", destino: "proyectos" },
      { etiqueta: "Identidad de marca y diseño de piezas.", href: ENLACES.behance },
      { etiqueta: "Video: guion, grabación y postproducción.", lugar: "audiovisual" },
      { etiqueta: "Minijuegos y dinámicas para pantallas táctiles en activaciones de marca.", destino: "juegos" },
      { etiqueta: "Cuéntame qué necesitas", destino: "contacto", principal: true },
    ]);
  });

  it("solo el cierre de SERVICIOS se muestra como botón", () => {
    const principales = Object.values(NOTAS).flatMap((n) => n.enlaces.filter((e) => e.principal));
    expect(principales).toEqual([{ etiqueta: "Cuéntame qué necesitas", destino: "contacto", principal: true }]);
  });

  it("cada enlace de las notas lleva exactamente uno: destino, lugar o href", () => {
    for (const nota of Object.values(NOTAS)) {
      for (const e of nota.enlaces) {
        const cuantos = [e.destino, e.lugar, e.href].filter((x) => x !== undefined).length;
        expect(cuantos, `${nota.id}: ${e.etiqueta}`).toBe(1);
      }
    }
  });

  it("ninguna nota habla de montos de dinero", () => {
    const todo = JSON.stringify(NOTAS);
    expect(todo).not.toMatch(/\$|\bbs\.?\b|\busd\b|\d[\d.,]*\s*dólares/i);
    expect(todo).not.toMatch(/precio|tarifa/i);
  });
});
