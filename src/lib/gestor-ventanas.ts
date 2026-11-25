import type { OrigenVideo, TipoElemento } from "@/data/contenido";
import {
  type Escritorio,
  limitarPosicion,
  posicionCascada,
  tamanoInicial,
} from "./geometria-ventanas";
import { type Historial, crearHistorial, irAdelante, irAtras, navegarA } from "./historial";

export type EstadoVentana = "abierta" | "minimizada";

export interface NuevaVentana {
  id: string;
  titulo: string;
  tipo: TipoElemento;
  origen?: OrigenVideo;
}

export interface Ventana extends NuevaVentana {
  estado: EstadoVentana;
  orden: number;
  x: number;
  y: number;
  ancho: number;
  alto: number;
  maximizada: boolean;
  historial: Historial | null;
}

export interface EstadoGestor {
  ventanas: readonly Ventana[];
  activa: string | null;
  contador: number;
}

export type AccionGestor =
  | { accion: "abrir"; ventana: NuevaVentana; escritorio: Escritorio }
  | { accion: "cerrar"; id: string }
  | { accion: "enfocar"; id: string }
  | { accion: "minimizar"; id: string }
  | { accion: "maximizar"; id: string }
  | { accion: "mover"; id: string; x: number; y: number; escritorio: Escritorio }
  | { accion: "ajustar"; escritorio: Escritorio }
  | { accion: "navegar"; id: string; lugar: string }
  | { accion: "atras"; id: string }
  | { accion: "adelante"; id: string };

export const estadoInicial: EstadoGestor = { ventanas: [], activa: null, contador: 0 };

export function esVentanaFinder(tipo: TipoElemento): boolean {
  return tipo === "carpeta" || tipo === "papelera";
}

function visibleSuperior(ventanas: readonly Ventana[]): string | null {
  let mejor: Ventana | null = null;
  for (const v of ventanas) {
    if (v.estado === "abierta" && (mejor === null || v.orden > mejor.orden)) mejor = v;
  }
  return mejor === null ? null : mejor.id;
}

function cambiar(
  estado: EstadoGestor,
  id: string,
  hacer: (v: Ventana) => Ventana,
): EstadoGestor {
  const actual = estado.ventanas.find((v) => v.id === id);
  if (!actual) return estado;
  const nueva = hacer(actual);
  if (nueva === actual) return estado;
  return { ...estado, ventanas: estado.ventanas.map((v) => (v.id === id ? nueva : v)) };
}

export function reducir(estado: EstadoGestor, accion: AccionGestor): EstadoGestor {
  switch (accion.accion) {
    case "abrir": {
      const id = accion.ventana.id;
      const orden = estado.contador + 1;
      const existe = estado.ventanas.some((v) => v.id === id);
      if (existe) {
        const traida = cambiar(estado, id, (v) => ({
          ...v,
          estado: "abierta",
          orden,
          origen: accion.ventana.origen ?? v.origen,
        }));
        return { ...traida, activa: id, contador: orden };
      }
      const tam = tamanoInicial(accion.ventana.tipo, accion.escritorio);
      const pos = posicionCascada(
        tam,
        accion.escritorio,
        estado.ventanas.map((v) => ({ x: v.x, y: v.y })),
      );
      const nueva: Ventana = {
        ...accion.ventana,
        estado: "abierta",
        orden,
        x: pos.x,
        y: pos.y,
        ancho: tam.ancho,
        alto: tam.alto,
        maximizada: accion.ventana.tipo === "juego",
        historial: esVentanaFinder(accion.ventana.tipo) ? crearHistorial(id) : null,
      };
      return { ventanas: [...estado.ventanas, nueva], activa: id, contador: orden };
    }
    case "enfocar": {
      if (!estado.ventanas.some((v) => v.id === accion.id)) return estado;
      const orden = estado.contador + 1;
      const traida = cambiar(estado, accion.id, (v) => ({ ...v, estado: "abierta", orden }));
      return { ...traida, activa: accion.id, contador: orden };
    }
    case "minimizar": {
      const objetivo = estado.ventanas.find((v) => v.id === accion.id);
      if (!objetivo || objetivo.estado === "minimizada") return estado;
      const cambiada = cambiar(estado, accion.id, (v) => ({ ...v, estado: "minimizada" }));
      const activa =
        estado.activa === accion.id ? visibleSuperior(cambiada.ventanas) : estado.activa;
      return { ...cambiada, activa };
    }
    case "cerrar": {
      if (!estado.ventanas.some((v) => v.id === accion.id)) return estado;
      const ventanas = estado.ventanas.filter((v) => v.id !== accion.id);
      const activa = estado.activa === accion.id ? visibleSuperior(ventanas) : estado.activa;
      return { ...estado, ventanas, activa };
    }
    case "maximizar":
      return cambiar(estado, accion.id, (v) => ({ ...v, maximizada: !v.maximizada }));
    case "mover":
      return cambiar(estado, accion.id, (v) => {
        if (v.maximizada) return v;
        const p = limitarPosicion({ x: accion.x, y: accion.y }, v, accion.escritorio);
        return p.x === v.x && p.y === v.y ? v : { ...v, ...p };
      });
    case "ajustar": {
      const ventanas = estado.ventanas.map((v) => {
        const p = limitarPosicion(v, v, accion.escritorio);
        return p.x === v.x && p.y === v.y ? v : { ...v, ...p };
      });
      return { ...estado, ventanas };
    }
    case "navegar":
      return cambiar(estado, accion.id, (v) =>
        v.historial ? { ...v, historial: navegarA(v.historial, accion.lugar) } : v,
      );
    case "atras":
      return cambiar(estado, accion.id, (v) =>
        v.historial ? { ...v, historial: irAtras(v.historial) } : v,
      );
    case "adelante":
      return cambiar(estado, accion.id, (v) =>
        v.historial ? { ...v, historial: irAdelante(v.historial) } : v,
      );
  }
}

export function estaEnUso(estado: EstadoGestor, id: string): boolean {
  return estado.ventanas.some((v) => v.id === id);
}

export function ventanaActiva(estado: EstadoGestor): Ventana | null {
  if (estado.activa === null) return null;
  return estado.ventanas.find((v) => v.id === estado.activa) ?? null;
}
