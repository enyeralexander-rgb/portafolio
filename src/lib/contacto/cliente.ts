import { esCodigoError, type CodigoError } from "./errores";
import type { DatosMensaje } from "./validacion";

export const RUTA_CONTACTO = "/api/contacto";
const ESPERA_RESPUESTA_MS = 20_000;

type Fetch = typeof fetch;

export type RespuestaEnvio =
  | { ok: true }
  | { ok: false; codigo: CodigoError; reintentarEnSeg?: number };

async function conEspera(f: Fetch, url: string, init: RequestInit): Promise<Response> {
  const control = new AbortController();
  const reloj = setTimeout(() => control.abort(), ESPERA_RESPUESTA_MS);
  try {
    return await f(url, { ...init, signal: control.signal });
  } finally {
    clearTimeout(reloj);
  }
}

export async function pedirToken(f: Fetch = fetch): Promise<string | null> {
  try {
    const r = await conEspera(f, RUTA_CONTACTO, { method: "GET", cache: "no-store" });
    if (!r.ok) return null;
    const cuerpo: unknown = await r.json();
    const token = (cuerpo as { token?: unknown } | null)?.token;
    return typeof token === "string" ? token : null;
  } catch {
    return null;
  }
}

export async function enviarMensaje(
  datos: DatosMensaje,
  token: string,
  trampa: string,
  f: Fetch = fetch,
): Promise<RespuestaEnvio> {
  try {
    const r = await conEspera(f, RUTA_CONTACTO, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...datos, token, sitio: trampa }),
    });
    if (r.ok) return { ok: true };
    let codigo: CodigoError = "servidor";
    try {
      const cuerpo: unknown = await r.json();
      const enviado = (cuerpo as { error?: unknown } | null)?.error;
      if (esCodigoError(enviado)) codigo = enviado;
    } catch {}
    const espera = Number(r.headers.get("Retry-After"));
    return { ok: false, codigo, reintentarEnSeg: Number.isFinite(espera) && espera > 0 ? espera : undefined };
  } catch {
    return { ok: false, codigo: "red" };
  }
}
