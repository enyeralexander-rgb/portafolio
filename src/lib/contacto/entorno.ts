export const VARIABLES_REQUERIDAS = [
  "DATABASE_URL",
  "SMTP_HOST",
  "SMTP_PORT",
  "SMTP_USER",
  "SMTP_PASSWORD",
  "MAIL_TO",
  "FORM_SECRET",
  "IP_SALT",
] as const;

export class EntornoIncompleto extends Error {
  constructor(readonly faltan: readonly string[]) {
    super(`Faltan variables de entorno: ${faltan.join(", ")}`);
    this.name = "EntornoIncompleto";
  }
}

export interface EntornoContacto {
  databaseUrl: string;
  smtp: { host: string; puerto: number; usuario: string; clave: string };
  destino: string;
  formSecret: string;
  ipSalt: string;
}

type Origen = Readonly<Record<string, string | undefined>>;

export function leerEntorno(origen: Origen): EntornoContacto {
  const faltan = VARIABLES_REQUERIDAS.filter((n) => !origen[n]?.trim());
  const puerto = Number(origen.SMTP_PORT);
  const invalidas = faltan.includes("SMTP_PORT") || (Number.isInteger(puerto) && puerto > 0 && puerto < 65536)
    ? []
    : ["SMTP_PORT"];
  const todas = [...faltan, ...invalidas];
  if (todas.length > 0) throw new EntornoIncompleto(todas);
  return {
    databaseUrl: origen.DATABASE_URL!.trim(),
    smtp: {
      host: origen.SMTP_HOST!.trim(),
      puerto,
      usuario: origen.SMTP_USER!.trim(),
      clave: origen.SMTP_PASSWORD!,
    },
    destino: origen.MAIL_TO!.trim(),
    formSecret: origen.FORM_SECRET!,
    ipSalt: origen.IP_SALT!,
  };
}
