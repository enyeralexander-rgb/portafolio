import { ETIQUETA_ESTADO, type EstadoVisitante } from "./validacion";

export const NOMBRE_REMITENTE = "A.U. Messenger";
export const ESPERA_SMTP_MS = 8_000;

export function sanearCabecera(valor: string): string {
  return valor.replace(/[\u0000-\u001F\u007F\u2028\u2029]+/g, " ").replace(/\s{2,}/g, " ").trim();
}

export function escaparHtml(texto: string): string {
  return texto
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export const limpiarClaveSmtp = (clave: string): string => clave.replace(/\s+/g, "");

export interface ConfigSmtp {
  host: string;
  port: number;
  secure: boolean;
  requireTLS: boolean;
  auth: { user: string; pass: string };
  connectionTimeout: number;
  greetingTimeout: number;
  socketTimeout: number;
}

export function configSmtp(e: { host: string; puerto: number; usuario: string; clave: string }): ConfigSmtp {
  const seguro = e.puerto === 465;
  return {
    host: e.host,
    port: e.puerto,
    secure: seguro,
    requireTLS: !seguro,
    auth: { user: e.usuario, pass: limpiarClaveSmtp(e.clave) },
    connectionTimeout: ESPERA_SMTP_MS,
    greetingTimeout: ESPERA_SMTP_MS,
    socketTimeout: ESPERA_SMTP_MS,
  };
}

export interface EntradaCorreo {
  remitente: string;
  destino: string;
  correoVisitante: string;
  estado: EstadoVisitante | null;
  mensaje: string;
  fecha: Date;
}

export interface CorreoListo {
  from: { name: string; address: string };
  to: string;
  replyTo: string;
  subject: string;
  text: string;
  html: string;
}

const formatoFecha = new Intl.DateTimeFormat("es-VE", {
  timeZone: "America/Caracas",
  dateStyle: "medium",
  timeStyle: "short",
});

export function construirCorreo(e: EntradaCorreo): CorreoListo {
  const visitante = sanearCabecera(e.correoVisitante);
  const estado = e.estado ? ETIQUETA_ESTADO[e.estado] : "Sin indicar";
  const fecha = formatoFecha.format(e.fecha);

  const text = [
    "Mensaje recibido desde A.U. Messenger",
    "",
    `De: ${visitante}`,
    `Estado: ${estado}`,
    `Fecha: ${fecha} (hora de Caracas)`,
    "",
    e.mensaje,
    "",
    "Puedes responder a este correo: la respuesta va directo al visitante.",
  ].join("\n");

  const html =
    `<div style="font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#1d1a17;max-width:560px">` +
    `<p style="margin:0 0 4px"><strong>Mensaje recibido desde A.U. Messenger</strong></p>` +
    `<p style="margin:0;color:#5d544a">De: ${escaparHtml(visitante)}<br>` +
    `Estado: ${escaparHtml(estado)}<br>` +
    `Fecha: ${escaparHtml(fecha)} (hora de Caracas)</p>` +
    `<div style="margin:16px 0;padding:12px 14px;border-left:4px solid #ff5a1f;background:#f7f2e8;white-space:pre-wrap">${escaparHtml(e.mensaje)}</div>` +
    `<p style="margin:0;color:#5d544a;font-size:12px">Puedes responder a este correo: la respuesta va directo al visitante.</p>` +
    `</div>`;

  return {
    from: { name: NOMBRE_REMITENTE, address: sanearCabecera(e.remitente) },
    to: sanearCabecera(e.destino),
    replyTo: visitante,
    subject: sanearCabecera(`Mensaje de ${visitante} · A.U. Messenger`),
    text,
    html,
  };
}

export function resumirError(error: unknown, secretos: readonly string[] = []): string {
  let texto = "error desconocido";
  if (error instanceof Error) {
    const codigo = (error as Error & { code?: unknown }).code;
    texto = `${typeof codigo === "string" ? `${codigo}: ` : ""}${error.message}`;
  } else if (typeof error === "string") {
    texto = error;
  }
  for (const secreto of secretos) {
    if (secreto.length >= 4) texto = texto.split(secreto).join("***");
  }
  return sanearCabecera(texto).slice(0, 200);
}
