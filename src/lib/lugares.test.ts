import { describe, expect, it } from "vitest";
import { MARCAS, MINIJUEGOS } from "@/data/contenido";
import { describirLugar, textoElementos, tituloDeLugar } from "./lugares";
import { dominioDe, idNavegador } from "./navegador";

describe("describirLugar", () => {
  it("las marcas ya no son lugares: su id cae en el escritorio", () => {
    for (const m of MARCAS) expect(describirLugar(m.id).titulo, m.id).toBe("ESCRITORIO");
  });

  it("el escritorio lista las 2 carpetas, las 3 notas, CV.PDF y REEL.MOV", () => {
    const v = describirLugar("escritorio");
    expect(v.elementos.map((e) => e.etiqueta)).toEqual([
      "PROYECTOS WEB",
      "MINIJUEGOS/DINÁMICAS",
      "PARA RECLUTADORES.TXT",
      "SERVICIOS.TXT",
      "SOBRE MÍ.TXT",
      "CV.PDF",
      "REEL.MOV",
    ]);
    expect(v.elementos.slice(2, 5).map((e) => [e.icono, e.accion])).toEqual([
      ["texto", { tipo: "abrir", elemento: { id: "reclutadores", titulo: "PARA RECLUTADORES.TXT", tipo: "nota" } }],
      ["texto", { tipo: "abrir", elemento: { id: "servicios", titulo: "SERVICIOS.TXT", tipo: "nota" } }],
      ["texto", { tipo: "abrir", elemento: { id: "sobre", titulo: "SOBRE MÍ.TXT", tipo: "nota" } }],
    ]);
    expect(v.elementos.slice(0, 2).map((e) => [e.icono, e.accion])).toEqual([
      ["carpeta", { tipo: "ir", lugar: "proyectos" }],
      ["carpeta", { tipo: "ir", lugar: "juegos" }],
    ]);
    expect(v.vista).toBe("lista");
    expect(v.elementos.at(-3)!.accion.tipo).toBe("abrir");
    expect(v.elementos.at(-2)).toMatchObject({
      icono: "pdf",
      accion: { tipo: "abrir", elemento: { id: "cv", titulo: "CV.PDF", tipo: "cv" } },
    });
  });

  it("REEL.MOV abierto desde el escritorio se reproduce solo, sin pasar a otro video", () => {
    const reel = describirLugar("escritorio").elementos.at(-1)!;
    expect(reel).toMatchObject({
      icono: "video",
      accion: { tipo: "abrir", elemento: { id: "reel", titulo: "REEL.MOV", tipo: "video", origen: "escritorio" } },
    });
  });

  it("proyectos se llama PROYECTOS WEB, lista los 5 accesos web y cada uno abre el navegador de su marca", () => {
    const v = describirLugar("proyectos");
    expect(v.titulo).toBe("PROYECTOS WEB");
    expect(v.vista).toBe("lista");
    expect(v.elementos).toHaveLength(5);
    for (const [i, m] of MARCAS.entries()) {
      expect(v.elementos[i], m.id).toEqual({
        clave: idNavegador(m.id),
        etiqueta: dominioDe(m.sitio),
        icono: "web",
        accion: { tipo: "abrir", elemento: { id: idNavegador(m.id), titulo: dominioDe(m.sitio), tipo: "navegador" } },
      });
    }
    expect(textoElementos(v.elementos.length)).toBe("5 elementos");
  });

  it("juegos se muestra como aplicaciones: 6 cuadros con su ícono y su marca", () => {
    const v = describirLugar("juegos");
    expect(v.titulo).toBe("MINIJUEGOS/DINÁMICAS");
    expect(v.vista).toBe("apps");
    expect(v.subtitulo).toContain("Son demostraciones: ningún premio es real.");
    expect(v.elementos).toHaveLength(6);
    for (const [i, j] of MINIJUEGOS.entries()) {
      expect(v.elementos[i], j.id).toEqual({
        clave: j.id,
        etiqueta: j.titulo,
        icono: "app",
        imagen: `/minijuegos/${j.id}/icono.png`,
        subetiqueta: j.marca,
        accion: { tipo: "abrir", elemento: { id: `juego-${j.id}`, titulo: `${j.titulo} · DEMOSTRACIÓN`, tipo: "juego" } },
      });
    }
    expect(v.elementos.map((e) => e.subetiqueta)).toEqual([
      "SAL CELESTIAL",
      "SAL CELESTIAL",
      "CHANGAN",
      "BABY FINGER",
      "BABY FINGER",
      "BABY FINGER",
    ]);
  });

  it("las carpetas de juegos de la T4 ya no son lugares: caen en el escritorio", () => {
    for (const lugar of ["minijuegos", "juegos-sal", "juegos-changan", "juegos-baby-finger"]) {
      expect(describirLugar(lugar).titulo, lugar).toBe("ESCRITORIO");
    }
  });

  it("audiovisual muestra REEL.MOV y lo abre con la lista completa como origen", () => {
    const v = describirLugar("audiovisual");
    expect(v.elementos).toHaveLength(1);
    expect(v.elementos[0]).toMatchObject({
      etiqueta: "REEL.MOV",
      icono: "video",
      accion: { tipo: "abrir", elemento: { id: "reel", titulo: "REEL.MOV", tipo: "video", origen: "audiovisual" } },
    });
    expect(v.vacio).toBeNull();
  });

  it("la papelera sigue vacía y con su aviso", () => {
    expect(describirLugar("papelera").elementos).toHaveLength(0);
    expect(describirLugar("papelera").vacio).not.toBeNull();
  });

  it("un lugar desconocido cae en el escritorio", () => {
    expect(describirLugar("inexistente").titulo).toBe("ESCRITORIO");
    expect(tituloDeLugar("proyectos")).toBe("PROYECTOS WEB");
  });
});

describe("textoElementos", () => {
  it("usa singular, plural y vacío", () => {
    expect(textoElementos(0)).toBe("Sin elementos");
    expect(textoElementos(1)).toBe("1 elemento");
    expect(textoElementos(8)).toBe("8 elementos");
  });
});
