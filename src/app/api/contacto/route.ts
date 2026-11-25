import nodemailer from "nodemailer";
import { crearDb } from "@/db/cliente";
import { configSmtp } from "@/lib/contacto/correo";
import { EntornoIncompleto, leerEntorno } from "@/lib/contacto/entorno";
import { huellaIp, ipDeEncabezados } from "@/lib/contacto/huella-ip";
import { MAX_CUERPO_BYTES } from "@/lib/contacto/limites";
import { leerCuerpoLimitado, origenPermitido } from "@/lib/contacto/peticion";
import { procesarEnvio } from "@/lib/contacto/procesar";
import { crearToken, verificarToken } from "@/lib/contacto/token";
import { validarMensaje } from "@/lib/contacto/validacion";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

const SIN_CACHE = { "Cache-Control": "no-store" };

const responder = (estado: number, cuerpo: object, extra: Record<string, string> = {}) =>
  Response.json(cuerpo, { status: estado, headers: { ...SIN_CACHE, ...extra } });

function entornoOError() {
  try {
    return { entorno: leerEntorno(process.env) };
  } catch (error) {
    if (error instanceof EntornoIncompleto) console.error(`[contacto] ${error.message}`);
    else console.error("[contacto] no se pudo leer el entorno");
    return { entorno: null };
  }
}

export async function GET(): Promise<Response> {
  const { entorno } = entornoOError();
  if (!entorno) return responder(500, { error: "servidor" });
  return responder(200, { token: crearToken(entorno.formSecret, Date.now()) });
}

export async function POST(req: Request): Promise<Response> {
  const { entorno } = entornoOError();
  if (!entorno) return responder(500, { error: "servidor" });

  if (!origenPermitido(req.headers.get("origin"), req.headers.get("host"))) {
    return responder(403, { error: "origen" });
  }
  if (!(req.headers.get("content-type") ?? "").toLowerCase().startsWith("application/json")) {
    return responder(400, { error: "cuerpo_invalido" });
  }

  const cuerpo = await leerCuerpoLimitado(req.body, MAX_CUERPO_BYTES, req.headers.get("content-length"));
  if (!cuerpo.ok) return responder(413, { error: "demasiado_grande" });

  let entrada: unknown;
  try {
    entrada = JSON.parse(cuerpo.texto);
  } catch {
    return responder(400, { error: "cuerpo_invalido" });
  }

  const trampa = (entrada as { sitio?: unknown } | null)?.sitio;
  if (typeof trampa === "string" && trampa.trim() !== "") return responder(200, { ok: true });

  const validado = validarMensaje(entrada);
  if (!validado.ok) return responder(400, { error: validado.codigo });

  const token = (entrada as { token?: unknown }).token;
  const estadoToken = verificarToken(token, entorno.formSecret, Date.now());
  if (estadoToken !== "ok") {
    return responder(estadoToken === "invalido" ? 403 : 400, {
      error: estadoToken === "invalido" ? "token_invalido" : estadoToken,
    });
  }

  const huella = huellaIp(ipDeEncabezados(req.headers), entorno.ipSalt);

  try {
    const transporte = nodemailer.createTransport(configSmtp(entorno.smtp));
    const resultado = await procesarEnvio(
      {
        db: crearDb(entorno.databaseUrl),
        transporte,
        remitente: entorno.smtp.usuario,
        destino: entorno.destino,
        secretos: [entorno.smtp.clave, entorno.smtp.clave.replace(/\s+/g, ""), entorno.formSecret, entorno.ipSalt],
      },
      validado.datos,
      huella,
    );

    switch (resultado.tipo) {
      case "ok":
        return responder(200, { ok: true });
      case "limite":
        return responder(429, { error: "limite" }, { "Retry-After": String(resultado.reintentarEnSeg) });
      case "en_proceso":
        return responder(409, { error: "en_proceso" });
      case "correo_fallido":
        return responder(502, { error: "correo_fallido" });
    }
  } catch (error) {
    console.error(`[contacto] fallo al procesar el envío (${error instanceof Error ? error.name : "desconocido"})`);
    return responder(500, { error: "servidor" });
  }
}
