import { describe, expect, it } from "vitest";
import { ALTO_MENU } from "./geometria-ventanas";
import {
  type AccionGestor,
  type EstadoGestor,
  type NuevaVentana,
  esVentanaFinder,
  estaEnUso,
  estadoInicial,
  reducir,
  ventanaActiva,
} from "./gestor-ventanas";
import { lugarActual } from "./historial";

const escritorio = { ancho: 1280, alto: 800 };
const sal = { id: "sal", titulo: "SAL CELESTIAL", tipo: "carpeta" } as const;
const par = { id: "par", titulo: "PARMIGIANA", tipo: "carpeta" } as const;
const sobre = { id: "sobre", titulo: "SOBRE MÍ.TXT", tipo: "nota" } as const;
const contacto = { id: "contacto", titulo: "CONTACTO", tipo: "contacto" } as const;
const reelEscritorio = { id: "reel", titulo: "REEL.MOV", tipo: "video", origen: "escritorio" } as const;
const reelCarpeta = { id: "reel", titulo: "REEL.MOV", tipo: "video", origen: "audiovisual" } as const;

const abrir = (ventana: NuevaVentana): AccionGestor => ({
  accion: "abrir",
  ventana,
  escritorio,
});

function aplicar(...acciones: AccionGestor[]): EstadoGestor {
  return acciones.reduce(reducir, estadoInicial);
}

function buscar(e: EstadoGestor, id: string) {
  const v = e.ventanas.find((x) => x.id === id);
  if (!v) throw new Error(`no existe la ventana ${id}`);
  return v;
}

describe("abrir, enfocar, minimizar y cerrar", () => {
  it("empieza sin ventanas ni activa", () => {
    expect(estadoInicial.ventanas).toHaveLength(0);
    expect(estadoInicial.activa).toBeNull();
    expect(ventanaActiva(estadoInicial)).toBeNull();
  });

  it("abre una ventana y la deja activa", () => {
    const e = aplicar(abrir(sal));
    expect(e.ventanas).toHaveLength(1);
    expect(e.activa).toBe("sal");
    expect(ventanaActiva(e)?.titulo).toBe("SAL CELESTIAL");
    expect(estaEnUso(e, "sal")).toBe(true);
    expect(estaEnUso(e, "sobre")).toBe(false);
  });

  it("tres ventanas seguidas quedan abiertas, en cascada y cada una al frente de la anterior", () => {
    const e = aplicar(abrir(sal), abrir(par), abrir(sobre));
    expect(e.ventanas).toHaveLength(3);
    expect(e.ventanas.every((v) => v.estado === "abierta")).toBe(true);
    const [a, b, c] = e.ventanas;
    expect(b!.x).toBeGreaterThan(a!.x);
    expect(b!.y).toBeGreaterThan(a!.y);
    expect(c!.x).toBeGreaterThan(b!.x);
    expect(c!.y).toBeGreaterThan(b!.y);
    expect(a!.orden).toBeLessThan(b!.orden);
    expect(b!.orden).toBeLessThan(c!.orden);
    expect(e.activa).toBe("sobre");
  });

  it("abrir lo que ya está abierto no lo duplica ni lo mueve: lo trae al frente", () => {
    const antes = aplicar(abrir(sal), abrir(sobre));
    const posicion = { x: buscar(antes, "sal").x, y: buscar(antes, "sal").y };
    const e = reducir(antes, abrir(sal));
    expect(e.ventanas).toHaveLength(2);
    expect(e.activa).toBe("sal");
    expect(buscar(e, "sal").orden).toBeGreaterThan(buscar(e, "sobre").orden);
    expect({ x: buscar(e, "sal").x, y: buscar(e, "sal").y }).toEqual(posicion);
  });

  it("un video guarda desde dónde se abrió y, si se abre de nuevo desde otro lugar, toma el origen nuevo", () => {
    const e = aplicar(abrir(reelEscritorio));
    expect(buscar(e, "reel").origen).toBe("escritorio");
    expect(buscar(e, "reel").historial).toBeNull();
    const otra = reducir(e, abrir(reelCarpeta));
    expect(otra.ventanas).toHaveLength(1);
    expect(buscar(otra, "reel").origen).toBe("audiovisual");
    const restaurada = reducir(reducir(otra, { accion: "minimizar", id: "reel" }), abrir({ id: "reel", titulo: "REEL.MOV", tipo: "video" }));
    expect(buscar(restaurada, "reel").origen).toBe("audiovisual");
    expect(buscar(restaurada, "reel").estado).toBe("abierta");
  });

  it("minimizar quita la activa y pasa el foco a la siguiente visible", () => {
    const e = aplicar(abrir(sal), abrir(sobre), { accion: "minimizar", id: "sobre" });
    expect(buscar(e, "sobre").estado).toBe("minimizada");
    expect(e.activa).toBe("sal");
    expect(estaEnUso(e, "sobre")).toBe(true);
  });

  it("desde el dock se restaura: abrir una minimizada la pone al frente", () => {
    const e = aplicar(abrir(sal), { accion: "minimizar", id: "sal" }, abrir(sal));
    expect(e.ventanas).toHaveLength(1);
    expect(buscar(e, "sal").estado).toBe("abierta");
    expect(e.activa).toBe("sal");
  });

  it("enfocar trae al frente una ventana existente", () => {
    const e = aplicar(abrir(sal), abrir(sobre), { accion: "enfocar", id: "sal" });
    expect(e.activa).toBe("sal");
    expect(buscar(e, "sal").orden).toBeGreaterThan(buscar(e, "sobre").orden);
  });

  it("acciones sobre algo que no existe no cambian nada", () => {
    const base = aplicar(abrir(sal));
    for (const a of [
      { accion: "enfocar", id: "nada" },
      { accion: "minimizar", id: "nada" },
      { accion: "cerrar", id: "nada" },
      { accion: "maximizar", id: "nada" },
      { accion: "mover", id: "nada", x: 1, y: 1, escritorio },
      { accion: "navegar", id: "nada", lugar: "x" },
    ] as const) {
      expect(reducir(base, a)).toBe(base);
    }
  });

  it("cerrar quita la ventana y activa la visible de más arriba", () => {
    const e = aplicar(abrir(sal), abrir(sobre), abrir(contacto), { accion: "cerrar", id: "contacto" });
    expect(e.ventanas).toHaveLength(2);
    expect(estaEnUso(e, "contacto")).toBe(false);
    expect(e.activa).toBe("sobre");
  });

  it("cerrar la última deja el gestor sin activa", () => {
    const e = aplicar(abrir(sal), { accion: "cerrar", id: "sal" });
    expect(e.ventanas).toHaveLength(0);
    expect(e.activa).toBeNull();
  });

  it("no modifica el estado anterior", () => {
    const antes = aplicar(abrir(sal));
    const copia = JSON.stringify(antes);
    reducir(antes, abrir(sobre));
    reducir(antes, { accion: "cerrar", id: "sal" });
    reducir(antes, { accion: "maximizar", id: "sal" });
    expect(JSON.stringify(antes)).toBe(copia);
  });
});

describe("ventana de juego", () => {
  it("abrir un juego la deja maximizada, sin historial de Finder", () => {
    const juego = { id: "juego-memoria-changan", titulo: "MEMORIA CHANGAN · DEMOSTRACIÓN", tipo: "juego" } as const;
    const e = aplicar(abrir(juego));
    expect(buscar(e, juego.id).maximizada).toBe(true);
    expect(buscar(e, juego.id).historial).toBeNull();
    expect(buscar(aplicar(abrir(sobre)), "sobre").maximizada).toBe(false);
  });
});

describe("maximizar y mover", () => {
  it("maximizar y restaurar vuelven al mismo tamaño y lugar", () => {
    const abierta = aplicar(abrir(sal));
    const antes = buscar(abierta, "sal");
    const maximizada = reducir(abierta, { accion: "maximizar", id: "sal" });
    expect(buscar(maximizada, "sal").maximizada).toBe(true);
    const restaurada = reducir(maximizada, { accion: "maximizar", id: "sal" });
    const despues = buscar(restaurada, "sal");
    expect(despues.maximizada).toBe(false);
    expect({ x: despues.x, y: despues.y, ancho: despues.ancho, alto: despues.alto }).toEqual({
      x: antes.x,
      y: antes.y,
      ancho: antes.ancho,
      alto: antes.alto,
    });
  });

  it("arrastrar mueve la ventana", () => {
    const e = aplicar(abrir(sal), { accion: "mover", id: "sal", x: 300, y: 200, escritorio });
    expect(buscar(e, "sal")).toMatchObject({ x: 300, y: 200 });
  });

  it("arrastrar nunca saca la ventana de la pantalla", () => {
    const base = aplicar(abrir(sal));
    const v = buscar(base, "sal");
    const afuera = (x: number, y: number) =>
      buscar(reducir(base, { accion: "mover", id: "sal", x, y, escritorio }), "sal");
    expect(afuera(-500, -500)).toMatchObject({ x: 0, y: ALTO_MENU });
    expect(afuera(9999, 9999)).toMatchObject({
      x: escritorio.ancho - v.ancho,
      y: escritorio.alto - v.alto,
    });
  });

  it("una ventana maximizada no se arrastra", () => {
    const e = aplicar(abrir(sal), { accion: "maximizar", id: "sal" });
    const antes = buscar(e, "sal");
    const despues = reducir(e, { accion: "mover", id: "sal", x: 5, y: 5, escritorio });
    expect(buscar(despues, "sal").x).toBe(antes.x);
  });

  it("al achicarse la pantalla, las ventanas vuelven a quedar dentro", () => {
    const e = aplicar(abrir(sal), { accion: "mover", id: "sal", x: 500, y: 250, escritorio });
    const chica = { ancho: 900, alto: 700 };
    const v = buscar(reducir(e, { accion: "ajustar", escritorio: chica }), "sal");
    expect(v.x + v.ancho).toBeLessThanOrEqual(chica.ancho);
    expect(v.y + v.alto).toBeLessThanOrEqual(chica.alto);
  });
});

describe("historial de las ventanas tipo Finder", () => {
  it("solo las carpetas y la papelera son ventanas de Finder", () => {
    expect(esVentanaFinder("carpeta")).toBe(true);
    expect(esVentanaFinder("papelera")).toBe(true);
    expect(esVentanaFinder("nota")).toBe(false);
    expect(esVentanaFinder("contacto")).toBe(false);
    expect(buscar(aplicar(abrir(sobre)), "sobre").historial).toBeNull();
  });

  it("la carpeta arranca en su propio lugar", () => {
    const h = buscar(aplicar(abrir(sal)), "sal").historial;
    expect(h && lugarActual(h)).toBe("sal");
  });

  it("navegar, atrás y adelante recorren el historial", () => {
    const e = aplicar(
      abrir(sal),
      { accion: "navegar", id: "sal", lugar: "proyectos" },
      { accion: "navegar", id: "sal", lugar: "par" },
    );
    const lugar = (x: EstadoGestor) => lugarActual(buscar(x, "sal").historial!);
    expect(lugar(e)).toBe("par");
    const atras = reducir(e, { accion: "atras", id: "sal" });
    expect(lugar(atras)).toBe("proyectos");
    expect(lugar(reducir(atras, { accion: "adelante", id: "sal" }))).toBe("par");
  });

  it("cada ventana lleva su propio historial", () => {
    const e = aplicar(abrir(sal), abrir(par), { accion: "navegar", id: "sal", lugar: "proyectos" });
    expect(lugarActual(buscar(e, "par").historial!)).toBe("par");
  });

  it("navegar en una ventana sin historial no hace nada", () => {
    const base = aplicar(abrir(sobre));
    expect(reducir(base, { accion: "navegar", id: "sobre", lugar: "x" })).toBe(base);
  });
});
