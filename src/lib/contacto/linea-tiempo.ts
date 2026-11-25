export const PAUSA_INICIO_SESION_MS = 1_300;

export type TipoEventoChat = "escribiendo" | "saludo" | "zumbido";

export interface EventoChat {
  en: number;
  tipo: TipoEventoChat;
  temblor?: boolean;
}

export function lineaDeTiempoChat(movimientoReducido: boolean): readonly EventoChat[] {
  return [
    { en: 0, tipo: "escribiendo" },
    { en: 3_000, tipo: "saludo" },
    { en: 6_000, tipo: "zumbido", temblor: !movimientoReducido },
  ];
}

export type PasoSobre = 1 | 2 | 3 | 4 | 5;

export interface EventoSobre {
  en: number;
  paso: PasoSobre;
}

export const PASOS_SOBRE: readonly EventoSobre[] = [
  { en: 350, paso: 1 },
  { en: 750, paso: 2 },
  { en: 1_250, paso: 3 },
  { en: 1_700, paso: 4 },
  { en: 2_050, paso: 5 },
];

export const DURACION_VUELO_MS = 850;

export function esperaParaVuelo(transcurridoMs: number): number {
  const vuelo = PASOS_SOBRE.find((p) => p.paso === 5)!;
  return Math.max(0, vuelo.en - transcurridoMs);
}
