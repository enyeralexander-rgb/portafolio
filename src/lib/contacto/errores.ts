export type CodigoError =
  | "correo_invalido"
  | "mensaje_corto"
  | "mensaje_largo"
  | "mensaje_invalido"
  | "estado_invalido"
  | "envio_invalido"
  | "cuerpo_invalido"
  | "token_invalido"
  | "muy_rapido"
  | "vencido"
  | "origen"
  | "demasiado_grande"
  | "limite"
  | "en_proceso"
  | "correo_fallido"
  | "servidor"
  | "red";

const TEXTOS: Record<CodigoError, string> = {
  correo_invalido: "Ese correo no parece válido.",
  mensaje_corto: "El mensaje es muy corto.",
  mensaje_largo: "El mensaje es muy largo: el máximo son 1000 caracteres.",
  mensaje_invalido: "El mensaje trae caracteres que no se pueden enviar.",
  estado_invalido: "El estado elegido no es válido.",
  envio_invalido: "No se pudo preparar el envío. Inténtalo de nuevo.",
  cuerpo_invalido: "No se pudo leer el envío. Inténtalo de nuevo.",
  token_invalido: "La sesión del chat no es válida. Cierra la ventana y ábrela de nuevo.",
  muy_rapido: "Espera unos segundos antes de enviar e inténtalo de nuevo.",
  vencido: "La sesión del chat caducó. Cierra la ventana y ábrela de nuevo.",
  origen: "No se pudo enviar desde esta página.",
  demasiado_grande: "El mensaje es demasiado grande.",
  limite: "Has enviado varios mensajes seguidos. Espera un rato antes de escribir otra vez.",
  en_proceso: "Tu mensaje todavía se está enviando. Espera un momento.",
  correo_fallido: "Tu mensaje quedó guardado, pero el correo no salió. Puedes reintentar.",
  servidor: "Algo falló de nuestro lado. Inténtalo de nuevo en un momento.",
  red: "No hay conexión con el servidor. Revisa tu internet y reintenta.",
};

const CODIGOS = new Set<string>(Object.keys(TEXTOS));

export const esCodigoError = (valor: unknown): valor is CodigoError =>
  typeof valor === "string" && CODIGOS.has(valor);

export function textoDeError(codigo: CodigoError, reintentarEnSeg?: number): string {
  if (codigo === "limite" && reintentarEnSeg && reintentarEnSeg > 0) {
    const minutos = Math.ceil(reintentarEnSeg / 60);
    return minutos <= 1
      ? `${TEXTOS.limite} Podrás escribir de nuevo en cerca de 1 minuto.`
      : `${TEXTOS.limite} Podrás escribir de nuevo en cerca de ${minutos} minutos.`;
  }
  return TEXTOS[codigo];
}

export const sePuedeReintentar = (codigo: CodigoError): boolean =>
  codigo === "correo_fallido" || codigo === "servidor" || codigo === "red" || codigo === "en_proceso" || codigo === "muy_rapido";
