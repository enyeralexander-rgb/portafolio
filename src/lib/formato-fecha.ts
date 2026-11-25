export const LOCALE = "es-VE";
export const ZONA_HORARIA = "America/Caracas";

const formatoHora = new Intl.DateTimeFormat(LOCALE, {
  hour: "2-digit",
  minute: "2-digit",
  timeZone: ZONA_HORARIA,
});

const formatoFecha = new Intl.DateTimeFormat(LOCALE, {
  weekday: "short",
  day: "numeric",
  month: "short",
  timeZone: ZONA_HORARIA,
});

function normalizarEspacios(texto: string): string {
  return texto.replace(/[  ]/g, " ");
}

export function formatearHora(fecha: Date): string {
  return normalizarEspacios(formatoHora.format(fecha));
}

export function formatearFecha(fecha: Date): string {
  return normalizarEspacios(formatoFecha.format(fecha)).replace(/\./g, "");
}
