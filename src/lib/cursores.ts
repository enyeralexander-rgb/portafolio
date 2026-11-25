const FLECHA = [
  "X",
  "XX",
  "XoX",
  "XooX",
  "XoooX",
  "XooooX",
  "XoooooX",
  "XooooooX",
  "XoooooooX",
  "XooooooooX",
  "XoooooooooX",
  "XooooooXXXXX",
  "XoooXooX",
  "XooX XooX",
  "XoX  XooX",
  "XX    XooX",
  "X     XooX",
  "       XX",
];

const MANITO = [
  "     XX",
  "    XooX",
  "    XooX",
  "    XooX",
  "    XooX",
  "    XooXXX",
  "    XooXooXXX",
  "    XooXooXooXX",
  " XX XooXooXooXoX",
  "XooXXoooooooooooX",
  "XoooXoooooooooooX",
  " XooooooooooooooX",
  "  XoooooooooooooX",
  "  XooooooooooooX",
  "   XoooooooooooX",
  "   XooooooooooX",
  "    XoooooooooX",
  "    XXXXXXXXXXX",
];

const ESCALA = 2;
const PUNTO_MANITO_X = 10;

export function cursorDesdeCuadricula(
  filas: readonly string[],
  escala: number,
  puntoX: number,
  puntoY: number,
  respaldo: string,
): string {
  let rectangulos = "";
  let ancho = 0;
  filas.forEach((fila, y) => {
    ancho = Math.max(ancho, fila.length);
    [...fila].forEach((c, x) => {
      if (c === "X" || c === "o") {
        const relleno = c === "X" ? "#000" : "#fff";
        rectangulos += `<rect x="${x * escala}" y="${y * escala}" width="${escala}" height="${escala}" fill="${relleno}"/>`;
      }
    });
  });
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${ancho * escala}" height="${filas.length * escala}" shape-rendering="crispEdges">${rectangulos}</svg>`;
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}") ${puntoX} ${puntoY}, ${respaldo}`;
}

export const cursorFlecha = (): string => cursorDesdeCuadricula(FLECHA, ESCALA, 0, 0, "default");
export const cursorManito = (): string =>
  cursorDesdeCuadricula(MANITO, ESCALA, PUNTO_MANITO_X, 0, "pointer");

export function cssCursores(): string {
  return `:root{--cursor-flecha:${cursorFlecha()};--cursor-manito:${cursorManito()}}`;
}
