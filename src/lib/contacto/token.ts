import { createHmac, timingSafeEqual } from "node:crypto";

export const TIEMPO_MINIMO_MS = 4_000;
export const TIEMPO_MAXIMO_MS = 2 * 60 * 60 * 1000;

export type ResultadoToken = "ok" | "invalido" | "muy_rapido" | "vencido";

const FORMA_TOKEN = /^\d{10,15}\.[A-Za-z0-9_-]{43}$/;

function firmar(secreto: string, marca: number): string {
  return createHmac("sha256", secreto).update(`contacto-v1.${marca}`).digest("base64url");
}

export function crearToken(secreto: string, ahoraMs: number): string {
  if (!secreto) throw new Error("Falta FORM_SECRET para firmar el token");
  const marca = Math.floor(ahoraMs);
  return `${marca}.${firmar(secreto, marca)}`;
}

export function verificarToken(token: unknown, secreto: string, ahoraMs: number): ResultadoToken {
  if (!secreto) throw new Error("Falta FORM_SECRET para verificar el token");
  if (typeof token !== "string" || !FORMA_TOKEN.test(token)) return "invalido";
  const [marcaTexto = "", firma = ""] = token.split(".");
  const esperada = Buffer.from(firmar(secreto, Number(marcaTexto)));
  const recibida = Buffer.from(firma);
  if (esperada.length !== recibida.length || !timingSafeEqual(esperada, recibida)) return "invalido";

  const edad = ahoraMs - Number(marcaTexto);
  if (edad < TIEMPO_MINIMO_MS) return "muy_rapido";
  if (edad > TIEMPO_MAXIMO_MS) return "vencido";
  return "ok";
}
