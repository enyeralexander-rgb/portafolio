import { eq, sql } from "drizzle-orm";
import { LIMITES_ENVIO, PENDIENTE_COLGADO_SEG, type LimitesEnvio } from "@/lib/contacto/limites";
import { esEstadoVisitante, type DatosMensaje } from "@/lib/contacto/validacion";
import type { Db } from "./cliente";
import { mensajes, type EstadoEnvio } from "./esquema";

export type ResultadoRegistro =
  | { tipo: "creado"; id: string }
  | { tipo: "existente"; id: string; estadoEnvio: EstadoEnvio; datos: DatosMensaje }
  | { tipo: "limite"; motivo: "huella" | "global"; reintentarEnSeg: number };

function filas<T>(resultado: unknown): T[] {
  const r = resultado as { rows?: T[] } | T[];
  return Array.isArray(r) ? r : (r.rows ?? []);
}

async function buscarPorEnvio(db: Db, envioId: string) {
  const [fila] = await db.select().from(mensajes).where(eq(mensajes.envioId, envioId)).limit(1);
  if (!fila) return null;
  return {
    id: fila.id,
    estadoEnvio: fila.estadoEnvio as EstadoEnvio,
    datos: {
      correo: fila.correo,
      mensaje: fila.mensaje,
      estado: esEstadoVisitante(fila.estadoVisitante) ? fila.estadoVisitante : null,
      envioId: fila.envioId,
    },
  };
}

export async function registrarMensaje(
  db: Db,
  datos: DatosMensaje,
  ipHuella: string,
  limites: LimitesEnvio = LIMITES_ENVIO,
): Promise<ResultadoRegistro> {
  const previo = await buscarPorEnvio(db, datos.envioId);
  if (previo) return { tipo: "existente", ...previo };

  const [, insercion] = await db.batch([
    db.execute(sql`select pg_advisory_xact_lock(hashtext('contacto_mensajes'))`),
    db.execute(sql`
      insert into mensajes (envio_id, correo, estado_visitante, mensaje, ip_huella)
      select ${datos.envioId}::uuid, ${datos.correo}::text, ${datos.estado}::text, ${datos.mensaje}::text, ${ipHuella}::text
      where (select count(*) from mensajes
             where ip_huella = ${ipHuella}::text
               and creado_en > now() - (${limites.ventanaHuellaSeg}::int * interval '1 second')) < ${limites.maxPorHuella}::int
        and (select count(*) from mensajes
             where creado_en > now() - (${limites.ventanaGlobalSeg}::int * interval '1 second')) < ${limites.maxGlobal}::int
      on conflict (envio_id) do nothing
      returning id`),
  ]);

  const creado = filas<{ id: string }>(insercion)[0];
  if (creado) return { tipo: "creado", id: creado.id };

  const concurrente = await buscarPorEnvio(db, datos.envioId);
  if (concurrente) return { tipo: "existente", ...concurrente };

  const [porHuella] = filas<{ n: number; espera: number | null }>(
    await db.execute(sql`
      select count(*)::int as n,
             extract(epoch from (min(creado_en) + (${limites.ventanaHuellaSeg}::int * interval '1 second') - now()))::int as espera
      from mensajes
      where ip_huella = ${ipHuella}::text
        and creado_en > now() - (${limites.ventanaHuellaSeg}::int * interval '1 second')`),
  );
  if (porHuella && porHuella.n >= limites.maxPorHuella) {
    return { tipo: "limite", motivo: "huella", reintentarEnSeg: Math.max(1, porHuella.espera ?? limites.ventanaHuellaSeg) };
  }

  const [global] = filas<{ espera: number | null }>(
    await db.execute(sql`
      select extract(epoch from (min(creado_en) + (${limites.ventanaGlobalSeg}::int * interval '1 second') - now()))::int as espera
      from mensajes
      where creado_en > now() - (${limites.ventanaGlobalSeg}::int * interval '1 second')`),
  );
  return { tipo: "limite", motivo: "global", reintentarEnSeg: Math.max(1, global?.espera ?? limites.ventanaGlobalSeg) };
}

export async function reclamarReintento(db: Db, id: string): Promise<boolean> {
  const tomadas = await db.execute(sql`
    update mensajes
    set estado_envio = 'pendiente', error_resumen = null, actualizado_en = now()
    where id = ${id}::uuid
      and (estado_envio = 'fallido'
           or (estado_envio = 'pendiente' and actualizado_en < now() - (${PENDIENTE_COLGADO_SEG}::int * interval '1 second')))
    returning id`);
  return filas<{ id: string }>(tomadas).length > 0;
}

export async function marcarEnvio(
  db: Db,
  id: string,
  estado: Exclude<EstadoEnvio, "pendiente">,
  errorResumen: string | null = null,
): Promise<void> {
  await db
    .update(mensajes)
    .set({ estadoEnvio: estado, errorResumen: estado === "fallido" ? errorResumen : null, actualizadoEn: sql`now()` })
    .where(eq(mensajes.id, id));
}
