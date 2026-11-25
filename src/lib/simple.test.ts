import { describe, expect, it } from "vitest";
import { ARCHIVOS_CV, CORREO, ENLACES, MARCAS, MINIJUEGOS, NOTAS, SIMPLE } from "@/data/contenido";
import { RESUMEN_SIMPLE, seccionesSimple } from "./simple";

describe("seccionesSimple", () => {
  const s = seccionesSimple();

  it("usa los rótulos de sección acordados", () => {
    expect([s.marcas.titulo, s.juegos.titulo, s.video.titulo, s.cv.titulo, s.servicios.titulo, s.contacto.titulo]).toEqual([
      "Sitios web",
      "Minijuegos y dinámicas",
      "Video",
      "CV",
      "Servicios",
      "Contacto",
    ]);
    expect(SIMPLE.titulo).toBe("Alexander Urbaneja · Product Engineer · Full Stack");
    expect(SIMPLE.verEscritorio).toBe("Ver el escritorio");
    expect(SIMPLE.descripcion).toBe(
      "Alexander Urbaneja, Product Engineer y desarrollador Full Stack en Caracas: sitios web, minijuegos, CV y contacto. Next.js, React, TypeScript, Node.js y PostgreSQL.",
    );
  });

  it("trae las 5 marcas con su descripción y su sitio en pestaña nueva", () => {
    expect(s.marcas.elementos.map((m) => m.id)).toEqual(["osi", "sal", "par", "all", "bes"]);
    for (const [i, m] of MARCAS.entries()) {
      expect(s.marcas.elementos[i]!.descripcion, m.id).toBe(m.descripcion);
      expect(s.marcas.elementos[i]!.enlace, m.id).toMatchObject({ href: m.sitio, nuevaPestana: true });
    }
  });

  it("trae los 6 juegos con su ícono, su marca y un enlace a su index.html", () => {
    expect(s.juegos.elementos).toHaveLength(6);
    for (const [i, j] of MINIJUEGOS.entries()) {
      const e = s.juegos.elementos[i]!;
      expect(e.icono, j.id).toBe(`/minijuegos/${j.id}/icono.png`);
      expect(e.marca, j.id).toBe(j.marca);
      expect(e.enlace.href, j.id).toBe(j.archivo);
      expect(e.enlace.href.endsWith("/index.html"), j.id).toBe(true);
      expect(e.enlace.etiqueta, j.id).toBe(`${j.titulo} · DEMOSTRACIÓN`);
    }
    expect(s.juegos.aviso).toContain("Son demostraciones: ningún premio es real.");
  });

  it("trae el reel y el CV en los 2 idiomas", () => {
    expect(s.video.elementos.map((v) => v.enlace.href)).toEqual(["/reel/reel.mp4"]);
    expect(s.cv.enlaces.map((e) => e.href)).toEqual(ARCHIVOS_CV.map((a) => a.href));
    expect(s.cv.enlaces.every((e) => e.nuevaPestana)).toBe(true);
  });

  it("trae los 5 servicios aprobados", () => {
    expect(s.servicios.lineas).toEqual(NOTAS.servicios.enlaces.slice(0, 5).map((e) => e.etiqueta));
    expect(s.servicios.lineas).toHaveLength(5);
  });

  it("contacto lleva LinkedIn, el correo visible, GitHub, Behance y «Escribirme» hacia /?abrir=contacto", () => {
    expect(s.contacto.enlaces).toEqual([
      { etiqueta: "LINKEDIN", href: ENLACES.linkedin, nuevaPestana: true },
      { etiqueta: CORREO, href: ENLACES.correo, nuevaPestana: false },
      { etiqueta: "GITHUB", href: ENLACES.github, nuevaPestana: true },
      { etiqueta: "BEHANCE", href: ENLACES.behance, nuevaPestana: true },
      { etiqueta: "Escribirme", href: "/?abrir=contacto", nuevaPestana: false },
    ]);
  });

  it("el resumen es la primera oración de la bienvenida, sin hablar del escritorio", () => {
    expect(RESUMEN_SIMPLE).toBe(
      "Hola, soy Alexander Urbaneja: Product Engineer y desarrollador Full Stack en Caracas.",
    );
    expect(RESUMEN_SIMPLE).not.toMatch(/escritorio|doble clic/);
  });

  it("ningún texto habla de montos de dinero", () => {
    const todo = JSON.stringify({ s, RESUMEN_SIMPLE, SIMPLE });
    expect(todo).not.toMatch(/\$|\bbs\.?\b|\busd\b|\d[\d.,]*\s*dólares|precio|tarifa/i);
  });
});
