import { marcarEnvio, reclamarReintento, registrarMensaje } from "@/db/mensajes";
import type { Db } from "@/db/cliente";
import { construirCorreo, resumirError, type CorreoListo } from "./correo";
import { LIMITES_ENVIO, type LimitesEnvio } from "./limites";
import type { DatosMensaje } from "./validacion";

export interface Transporte {
  sendMail(correo: CorreoListo): Promise<unknown>;
}

export interface DependenciasEnvio {
  db: Db;
  transporte: Transporte;
  remitente: string;
  destino: string;
  secretos?: readonly string[];
  ahora?: () => Date;
  limites?: LimitesEnvio;
  esperaMaximaMs?: number;
}

export type ResultadoEnvio =
  | { tipo: "ok"; repetido: boolean }
  | { tipo: "limite"; reintentarEnSeg: number }
  | { tipo: "en_proceso" }
  | { tipo: "correo_fallido" };

const ESPERA_MAXIMA_MS = 15_000;

function conLimiteDeTiempo<T>(promesa: Promise<T>, ms: number): Promise<T> {
  return new Promise<T>((resolver, rechazar) => {
    const reloj = setTimeout(() => rechazar(new Error("El correo tardó demasiado en enviarse")), ms);
    promesa.then(
      (v) => {
        clearTimeout(reloj);
        resolver(v);
      },
      (e) => {
        clearTimeout(reloj);
        rechazar(e);
      },
    );
  });
}

export async function procesarEnvio(
  deps: DependenciasEnvio,
  datos: DatosMensaje,
  ipHuella: string,
): Promise<ResultadoEnvio> {
  const registro = await registrarMensaje(deps.db, datos, ipHuella, deps.limites ?? LIMITES_ENVIO);

  if (registro.tipo === "limite") return { tipo: "limite", reintentarEnSeg: registro.reintentarEnSeg };

  if (registro.tipo === "existente") {
    if (registro.estadoEnvio === "enviado") return { tipo: "ok", repetido: true };
    if (!(await reclamarReintento(deps.db, registro.id))) return { tipo: "en_proceso" };
  }

  const guardado = registro.tipo === "existente" ? registro.datos : datos;
  const correo = construirCorreo({
    remitente: deps.remitente,
    destino: deps.destino,
    correoVisitante: guardado.correo,
    estado: guardado.estado,
    mensaje: guardado.mensaje,
    fecha: (deps.ahora ?? (() => new Date()))(),
  });

  try {
    await conLimiteDeTiempo(deps.transporte.sendMail(correo), deps.esperaMaximaMs ?? ESPERA_MAXIMA_MS);
  } catch (error) {
    await marcarEnvio(deps.db, registro.id, "fallido", resumirError(error, deps.secretos));
    return { tipo: "correo_fallido" };
  }

  await marcarEnvio(deps.db, registro.id, "enviado");
  return { tipo: "ok", repetido: false };
}
