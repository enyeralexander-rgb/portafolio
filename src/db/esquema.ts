import { sql } from "drizzle-orm";
import { check, index, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const ESTADOS_ENVIO = ["pendiente", "enviado", "fallido"] as const;
export type EstadoEnvio = (typeof ESTADOS_ENVIO)[number];

export const mensajes = pgTable(
  "mensajes",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    creadoEn: timestamp("creado_en", { withTimezone: true }).notNull().defaultNow(),
    actualizadoEn: timestamp("actualizado_en", { withTimezone: true }).notNull().defaultNow(),
    envioId: uuid("envio_id").notNull().unique(),
    correo: text("correo").notNull(),
    estadoVisitante: text("estado_visitante"),
    mensaje: text("mensaje").notNull(),
    ipHuella: text("ip_huella").notNull(),
    estadoEnvio: text("estado_envio").notNull().default("pendiente"),
    errorResumen: text("error_resumen"),
  },
  (t) => [
    index("mensajes_huella_fecha_idx").on(t.ipHuella, t.creadoEn),
    index("mensajes_fecha_idx").on(t.creadoEn),
    check("mensajes_correo_largo", sql`char_length(${t.correo}) between 6 and 254`),
    check("mensajes_mensaje_largo", sql`char_length(${t.mensaje}) between 2 and 1000`),
    check(
      "mensajes_estado_visitante",
      sql`${t.estadoVisitante} is null or ${t.estadoVisitante} in ('disponible', 'ocupado', 'ausente')`,
    ),
    check("mensajes_estado_envio", sql`${t.estadoEnvio} in ('pendiente', 'enviado', 'fallido')`),
    check("mensajes_error_largo", sql`${t.errorResumen} is null or char_length(${t.errorResumen}) <= 200`),
  ],
).enableRLS();

export type Mensaje = typeof mensajes.$inferSelect;
