"use client";

import { useEffect, useRef, useState, useSyncExternalStore, type KeyboardEvent } from "react";
import { MENU } from "@/data/contenido";
import { VENTANA_BIENVENIDA } from "@/lib/bienvenida";
import { elementoDeDestino } from "@/lib/enlace-profundo";
import { formatearFecha, formatearHora } from "@/lib/formato-fecha";
import { ACCIONES_AYUDA_TELEFONO, MENU_ITEMS, MENU_TELEFONO, elementoDeLugar, moverFoco, type AccionDeMenu } from "@/lib/menu";
import { useGestorVentanas } from "./gestor-ventanas";

function suscribir(avisar: () => void): () => void {
  const intervalo = window.setInterval(avisar, 1000);
  return () => window.clearInterval(intervalo);
}

function leerHora(): string {
  const ahora = new Date();
  return `${ahora.toISOString().slice(0, 16)}|${formatearHora(ahora)}|${formatearFecha(ahora)}`;
}

const SIN_HORA = "||";

function Reloj() {
  const foto = useSyncExternalStore(suscribir, leerHora, () => SIN_HORA);
  const [minuto, hora, fecha] = foto.split("|");
  const iso = minuto ? `${minuto}:00Z` : undefined;

  return (
    <div className="reloj">
      <time className="reloj-fecha" dateTime={iso}>
        {fecha}
      </time>
      <time className="reloj-hora" dateTime={iso}>
        {hora}
      </time>
    </div>
  );
}

interface PropsMenu {
  id: string;
  etiqueta: string;
  acciones: readonly AccionDeMenu[];
  abierto: boolean;
  alternar: () => void;
  cerrar: () => void;
}

function MenuDesplegable({ id, etiqueta, acciones, abierto, alternar, cerrar }: PropsMenu) {
  const g = useGestorVentanas();
  const boton = useRef<HTMLButtonElement>(null);
  const items = useRef<(HTMLElement | null)[]>([]);
  const idLista = `${id}-lista`;

  useEffect(() => {
    if (!abierto) return;
    const cuadro = requestAnimationFrame(() => items.current[0]?.focus());
    return () => cancelAnimationFrame(cuadro);
  }, [abierto]);

  const cerrarYVolver = () => {
    cerrar();
    boton.current?.focus();
  };

  const ejecutar = (a: AccionDeMenu) => {
    cerrarYVolver();
    if (a.accion.tipo === "abrir") g.abrir(elementoDeDestino(a.accion.destino));
    else if (a.accion.tipo === "lugar") g.abrir(elementoDeLugar(a.accion.lugar));
    else if (a.accion.tipo === "bienvenida") g.abrir(VENTANA_BIENVENIDA);
  };

  const alTeclearLista = (e: KeyboardEvent<HTMLUListElement>) => {
    if (e.key === "Escape") {
      e.preventDefault();
      cerrarYVolver();
      return;
    }
    if (e.key === "Tab") {
      cerrar();
      return;
    }
    const actual = items.current.findIndex((el) => el === document.activeElement);
    const siguiente = moverFoco(actual, acciones.length, e.key);
    if (siguiente !== actual) {
      e.preventDefault();
      items.current[siguiente]?.focus();
    }
  };

  return (
    <>
      <button
        ref={boton}
        type="button"
        id={id}
        className="menu-boton"
        aria-haspopup="menu"
        aria-expanded={abierto}
        aria-controls={abierto ? idLista : undefined}
        onClick={alternar}
        onKeyDown={(e) => {
          if ((e.key === "ArrowDown" || e.key === "ArrowUp") && !abierto) {
            e.preventDefault();
            alternar();
          }
        }}
      >
        {etiqueta}
      </button>
      {abierto && (
        <ul className="menu-lista" id={idLista} role="menu" aria-labelledby={id} onKeyDown={alTeclearLista}>
          {acciones.map((a, i) => (
            <li key={a.etiqueta} role="none">
              {a.accion.tipo === "enlace" ? (
                <a
                  ref={(el) => {
                    items.current[i] = el;
                  }}
                  role="menuitem"
                  tabIndex={-1}
                  className="menu-accion"
                  href={a.accion.href}
                  onClick={cerrar}
                >
                  {a.etiqueta}
                </a>
              ) : (
                <button
                  ref={(el) => {
                    items.current[i] = el;
                  }}
                  type="button"
                  role="menuitem"
                  tabIndex={-1}
                  className="menu-accion"
                  onClick={() => ejecutar(a)}
                >
                  {a.etiqueta}
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

export function BarraMenu() {
  const [abierto, setAbierto] = useState<string | null>(null);
  const barra = useRef<HTMLElement>(null);

  useEffect(() => {
    if (abierto === null) return;
    const alTocar = (e: PointerEvent) => {
      if (!barra.current?.contains(e.target as Node)) setAbierto(null);
    };
    document.addEventListener("pointerdown", alTocar);
    return () => document.removeEventListener("pointerdown", alTocar);
  }, [abierto]);

  const props = (clave: string) => ({
    id: `menu-${clave.toLowerCase()}`,
    abierto: abierto === clave,
    alternar: () => setAbierto((actual) => (actual === clave ? null : clave)),
    cerrar: () => setAbierto(null),
  });

  return (
    <header className="menubar" ref={barra}>
      <div className="menubar-logo">
        <i aria-hidden="true" />
        {MENU.marca}
      </div>
      <ul className="menubar-opciones">
        {MENU_ITEMS.map((m) => (
          <li key={m.etiqueta}>
            <MenuDesplegable etiqueta={m.etiqueta} acciones={m.acciones} {...props(m.etiqueta)} />
          </li>
        ))}
      </ul>
      <ul className="menubar-telefono">
        {MENU_TELEFONO.map((etiqueta) => (
          <li key={etiqueta}>
            <MenuDesplegable etiqueta={etiqueta} acciones={ACCIONES_AYUDA_TELEFONO} {...props(`telefono-${etiqueta}`)} />
          </li>
        ))}
      </ul>
      <Reloj />
    </header>
  );
}
