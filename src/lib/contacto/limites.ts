export const MAX_POR_HUELLA = 3;
export const VENTANA_HUELLA_SEG = 60 * 60;

export const MAX_GLOBAL = 30;
export const VENTANA_GLOBAL_SEG = 24 * 60 * 60;

export interface LimitesEnvio {
  maxPorHuella: number;
  ventanaHuellaSeg: number;
  maxGlobal: number;
  ventanaGlobalSeg: number;
}

export const LIMITES_ENVIO: LimitesEnvio = {
  maxPorHuella: MAX_POR_HUELLA,
  ventanaHuellaSeg: VENTANA_HUELLA_SEG,
  maxGlobal: MAX_GLOBAL,
  ventanaGlobalSeg: VENTANA_GLOBAL_SEG,
};

export const MAX_CUERPO_BYTES = 8 * 1024;

export const PENDIENTE_COLGADO_SEG = 60;
