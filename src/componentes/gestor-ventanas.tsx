"use client";

import { createContext, useContext, useEffect, useMemo, useReducer, type ReactNode } from "react";
import type { Escritorio } from "@/lib/geometria-ventanas";
import {
  estadoInicial,
  reducir,
  ventanaActiva,
  type EstadoGestor,
  type NuevaVentana,
} from "@/lib/gestor-ventanas";

interface ValorGestor {
  estado: EstadoGestor;
  abrir: (ventana: NuevaVentana) => void;
  cerrar: (id: string) => void;
  enfocar: (id: string) => void;
  minimizar: (id: string) => void;
  maximizar: (id: string) => void;
  mover: (id: string, x: number, y: number) => void;
  navegar: (id: string, lugar: string) => void;
  atras: (id: string) => void;
  adelante: (id: string) => void;
}

const Contexto = createContext<ValorGestor | null>(null);

function medirEscritorio(): Escritorio {
  const altoMenu = Number.parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--alto-menu"));
  return { ancho: window.innerWidth, alto: window.innerHeight, ...(altoMenu > 0 ? { altoMenu } : {}) };
}

const origenes = new Map<string, HTMLElement>();

function visible(el: HTMLElement | null | undefined): el is HTMLElement {
  return !!el && el.isConnected && el.getClientRects().length > 0;
}

export function GestorVentanasProvider({ children }: { children: ReactNode }) {
  const [estado, despachar] = useReducer(reducir, estadoInicial);

  useEffect(() => {
    const alAjustar = () => despachar({ accion: "ajustar", escritorio: medirEscritorio() });
    window.addEventListener("resize", alAjustar);
    return () => window.removeEventListener("resize", alAjustar);
  }, []);

  const valor = useMemo<ValorGestor>(() => {
    const enfocarLuego = (buscar: () => HTMLElement | null | undefined) => {
      requestAnimationFrame(() => {
        const el = buscar();
        if (visible(el)) el.focus();
      });
    };

    return {
      estado,
      abrir: (ventana) => {
        const activo = document.activeElement;
        if (activo instanceof HTMLElement && activo !== document.body) {
          origenes.set(ventana.id, activo);
        }
        despachar({ accion: "abrir", ventana, escritorio: medirEscritorio() });
        enfocarLuego(() => document.querySelector<HTMLElement>(`[data-ventana="${ventana.id}"]`));
      },
      cerrar: (id) => {
        const origen = origenes.get(id);
        origenes.delete(id);
        despachar({ accion: "cerrar", id });
        enfocarLuego(() =>
          visible(origen) ? origen : document.querySelector<HTMLElement>(`[data-abre="${id}"]`),
        );
      },
      enfocar: (id) => despachar({ accion: "enfocar", id }),
      minimizar: (id) => {
        despachar({ accion: "minimizar", id });
        enfocarLuego(() => document.querySelector<HTMLElement>(`.dock-nav [data-abre="${id}"]`));
      },
      maximizar: (id) => despachar({ accion: "maximizar", id }),
      mover: (id, x, y) => despachar({ accion: "mover", id, x, y, escritorio: medirEscritorio() }),
      navegar: (id, lugar) => despachar({ accion: "navegar", id, lugar }),
      atras: (id) => despachar({ accion: "atras", id }),
      adelante: (id) => despachar({ accion: "adelante", id }),
    };
  }, [estado]);

  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>;
}

export function useGestorVentanas(): ValorGestor {
  const valor = useContext(Contexto);
  if (valor === null) throw new Error("useGestorVentanas se usa dentro de GestorVentanasProvider");
  return valor;
}

export function AtajosVentanas() {
  const { estado, cerrar } = useGestorVentanas();
  const activa = estado.activa;

  useEffect(() => {
    if (activa === null) return;
    const alTeclear = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !e.defaultPrevented) cerrar(activa);
    };
    document.addEventListener("keydown", alTeclear);
    return () => document.removeEventListener("keydown", alTeclear);
  }, [activa, cerrar]);

  return null;
}

export function AvisoVentanaActiva() {
  const { estado } = useGestorVentanas();
  const activa = ventanaActiva(estado);
  return (
    <p className="solo-lectores" role="status">
      {activa ? `Abierto: ${activa.titulo}` : ""}
    </p>
  );
}
