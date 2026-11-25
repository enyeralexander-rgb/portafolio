export const CORREO_MAX = 254;
export const MENSAJE_MIN = 2;
export const MENSAJE_MAX = 1000;

export const ESTADOS_VISITANTE = ["disponible", "ocupado", "ausente"] as const;
export type EstadoVisitante = (typeof ESTADOS_VISITANTE)[number];

export const ETIQUETA_ESTADO: Record<EstadoVisitante, string> = {
  disponible: "Disponible",
  ocupado: "Ocupado",
  ausente: "Ausente",
};

export type CodigoValidacion =
  | "cuerpo_invalido"
  | "correo_invalido"
  | "mensaje_corto"
  | "mensaje_largo"
  | "mensaje_invalido"
  | "estado_invalido"
  | "envio_invalido";

export interface DatosMensaje {
  correo: string;
  mensaje: string;
  estado: EstadoVisitante | null;
  envioId: string;
}

export type ResultadoValidacion =
  | { ok: true; datos: DatosMensaje }
  | { ok: false; codigo: CodigoValidacion };

const ETIQUETA_DNS = "[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?";
const PATRON_CORREO = new RegExp(
  `^[A-Za-z0-9.!#$%&'*+/=?^_\`{|}~-]+@${ETIQUETA_DNS}(?:\\.${ETIQUETA_DNS})+$`,
);
const PATRON_UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const PATRON_CONTROL = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/;

export function normalizarCorreo(valor: unknown): string | null {
  if (typeof valor !== "string") return null;
  const correo = valor.trim().toLowerCase();
  if (correo.length < 6 || correo.length > CORREO_MAX) return null;
  if (!PATRON_CORREO.test(correo)) return null;
  const [local = "", dominio = ""] = correo.split("@");
  if (local.length > 64) return null;
  if (local.startsWith(".") || local.endsWith(".") || local.includes("..")) return null;
  const ultima = dominio.split(".").at(-1) ?? "";
  if (!/^[a-z]{2,}$/.test(ultima)) return null;
  return correo;
}

export const largoTexto = (texto: string): number => Array.from(texto).length;

export function normalizarMensaje(valor: unknown): { texto: string } | { codigo: CodigoValidacion } {
  if (typeof valor !== "string") return { codigo: "mensaje_invalido" };
  const texto = valor.replace(/\r\n?/g, "\n").trim();
  if (PATRON_CONTROL.test(texto)) return { codigo: "mensaje_invalido" };
  const largo = largoTexto(texto);
  if (largo < MENSAJE_MIN) return { codigo: "mensaje_corto" };
  if (largo > MENSAJE_MAX) return { codigo: "mensaje_largo" };
  return { texto };
}

export function esEstadoVisitante(valor: unknown): valor is EstadoVisitante {
  return typeof valor === "string" && (ESTADOS_VISITANTE as readonly string[]).includes(valor);
}

export const esIdEnvio = (valor: unknown): valor is string =>
  typeof valor === "string" && PATRON_UUID.test(valor);

export function validarMensaje(entrada: unknown): ResultadoValidacion {
  if (typeof entrada !== "object" || entrada === null || Array.isArray(entrada)) {
    return { ok: false, codigo: "cuerpo_invalido" };
  }
  const e = entrada as Record<string, unknown>;

  const correo = normalizarCorreo(e.correo);
  if (correo === null) return { ok: false, codigo: "correo_invalido" };

  const mensaje = normalizarMensaje(e.mensaje);
  if ("codigo" in mensaje) return { ok: false, codigo: mensaje.codigo };

  let estado: EstadoVisitante | null = null;
  if (e.estado !== undefined && e.estado !== null) {
    if (!esEstadoVisitante(e.estado)) return { ok: false, codigo: "estado_invalido" };
    estado = e.estado;
  }

  if (!esIdEnvio(e.envioId)) return { ok: false, codigo: "envio_invalido" };

  return { ok: true, datos: { correo, mensaje: mensaje.texto, estado, envioId: e.envioId.toLowerCase() } };
}
