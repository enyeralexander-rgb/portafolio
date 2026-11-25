"use client";

import { useEffect, useState } from "react";
import { ARRANQUE } from "@/data/contenido";
import { lineaArranque, progresoArranque } from "@/lib/arranque";

export function Arranque({ onTerminar }: { onTerminar: () => void }) {
  const [porcentaje, setPorcentaje] = useState(0);
  const [oculto, setOculto] = useState(false);

  useEffect(() => {
    const reducido = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const duracion = reducido ? 0 : ARRANQUE.duracionMs;
    const respiro = reducido ? 0 : 250;

    let cuadro = 0;
    let espera = 0;
    const inicio = performance.now();

    const paso = (ahora: number) => {
      const avance = progresoArranque(ahora - inicio, duracion);
      setPorcentaje(Math.round(avance * 100));
      if (avance < 1) {
        cuadro = requestAnimationFrame(paso);
      } else {
        espera = window.setTimeout(() => {
          setOculto(true);
          onTerminar();
        }, respiro);
      }
    };

    cuadro = requestAnimationFrame(paso);
    return () => {
      cancelAnimationFrame(cuadro);
      window.clearTimeout(espera);
    };
  }, [onTerminar]);

  return (
    <div className={oculto ? "boot gone" : "boot"} aria-hidden={oculto || undefined}>
      <p className="boot-titulo">
        {ARRANQUE.titulo[0]}
        <br />
        {ARRANQUE.titulo[1]}
      </p>
      <div
        className="meter"
        role="progressbar"
        aria-label="Cargando el escritorio"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={porcentaje}
      >
        <i style={{ width: `${porcentaje}%` }} />
      </div>
      <p className="boot-linea">
        <span>{lineaArranque(porcentaje / 100, ARRANQUE.lineas)}...</span>
        <span>{porcentaje}%</span>
      </p>
    </div>
  );
}
