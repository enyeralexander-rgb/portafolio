CREATE TABLE "mensajes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"creado_en" timestamp with time zone DEFAULT now() NOT NULL,
	"actualizado_en" timestamp with time zone DEFAULT now() NOT NULL,
	"envio_id" uuid NOT NULL,
	"correo" text NOT NULL,
	"estado_visitante" text,
	"mensaje" text NOT NULL,
	"ip_huella" text NOT NULL,
	"estado_envio" text DEFAULT 'pendiente' NOT NULL,
	"error_resumen" text,
	CONSTRAINT "mensajes_envio_id_unique" UNIQUE("envio_id"),
	CONSTRAINT "mensajes_correo_largo" CHECK (char_length("mensajes"."correo") between 6 and 254),
	CONSTRAINT "mensajes_mensaje_largo" CHECK (char_length("mensajes"."mensaje") between 2 and 1000),
	CONSTRAINT "mensajes_estado_visitante" CHECK ("mensajes"."estado_visitante" is null or "mensajes"."estado_visitante" in ('disponible', 'ocupado', 'ausente')),
	CONSTRAINT "mensajes_estado_envio" CHECK ("mensajes"."estado_envio" in ('pendiente', 'enviado', 'fallido')),
	CONSTRAINT "mensajes_error_largo" CHECK ("mensajes"."error_resumen" is null or char_length("mensajes"."error_resumen") <= 200)
);
--> statement-breakpoint
CREATE INDEX "mensajes_huella_fecha_idx" ON "mensajes" USING btree ("ip_huella","creado_en");--> statement-breakpoint
CREATE INDEX "mensajes_fecha_idx" ON "mensajes" USING btree ("creado_en");