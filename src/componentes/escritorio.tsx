"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ELEMENTOS_ESCRITORIO, SITIO } from "@/data/contenido";
import { CLAVE_BIENVENIDA, VENTANA_BIENVENIDA, debeMostrarBienvenida } from "@/lib/bienvenida";
import { destinoDeParametro, elementoDeDestino, type Destino } from "@/lib/enlace-profundo";
import { Arranque } from "./arranque";
import { BarraMenu } from "./barra-menu";
import { Dock } from "./dock";
import {
  AtajosVentanas,
  AvisoVentanaActiva,
  GestorVentanasProvider,
  useGestorVentanas,
} from "./gestor-ventanas";
import { IconoEscritorio } from "./icono-escritorio";
import { FondoTecnico } from "./fondo-tecnico";
import { CapaVentanas } from "./ventanas";

function leerBienvenida(): string | null {
  return window.localStorage.getItem(CLAVE_BIENVENIDA);
}

function marcarBienvenida() {
  try {
    window.localStorage.setItem(CLAVE_BIENVENIDA, "1");
  } catch {}
}

function Contenido({ listo }: { listo: boolean }) {
  const { abrir } = useGestorVentanas();
  const [seleccionado, setSeleccionado] = useState<string | null>(null);
  const destino = useRef<Destino | null | undefined>(undefined);
  const atendido = useRef(false);

  useEffect(() => {
    destino.current = destinoDeParametro(new URLSearchParams(window.location.search).get("abrir"));
  }, []);

  useEffect(() => {
    if (!listo || atendido.current || destino.current === undefined) return;
    atendido.current = true;
    const d = destino.current;
    if (d !== null) {
      abrir(elementoDeDestino(d));
    } else if (debeMostrarBienvenida(leerBienvenida, null)) {
      marcarBienvenida();
      abrir(VENTANA_BIENVENIDA);
    }
  }, [listo, abrir]);

  return (
    <div
      className="desk"
      inert={!listo}
      onPointerDown={(e) => {
        if (!(e.target as Element).closest("button")) setSeleccionado(null);
      }}
    >
      <FondoTecnico />
      <p className="fname">{SITIO.archivoDelFondo}</p>
      <BarraMenu />
      <main className="main-escritorio">
        <h1 className="solo-lectores">
          {SITIO.nombre.nombre} {SITIO.nombre.apellido} · {SITIO.rol}
        </h1>
        <ul className="iconos" aria-label="Escritorio">
          {ELEMENTOS_ESCRITORIO.map((el) => (
            <li key={el.id}>
              <IconoEscritorio
                elemento={el}
                seleccionado={seleccionado === el.id}
                onSeleccionar={setSeleccionado}
                onAbrir={abrir}
              />
            </li>
          ))}
        </ul>
      </main>
      <CapaVentanas />
      <Dock />
      <AvisoVentanaActiva />
      <AtajosVentanas />
    </div>
  );
}

export function Escritorio() {
  const [listo, setListo] = useState(false);
  const terminarArranque = useCallback(() => setListo(true), []);

  return (
    <GestorVentanasProvider>
      <Contenido listo={listo} />
      <Arranque onTerminar={terminarArranque} />
    </GestorVentanasProvider>
  );
}
