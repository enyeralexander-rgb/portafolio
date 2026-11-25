"use client";

import { juegoDeVentana } from "@/data/contenido";
import type { Ventana } from "@/lib/gestor-ventanas";

export function CuerpoJuego({ ventana }: { ventana: Ventana }) {
  const juego = juegoDeVentana(ventana.id);
  if (!juego) {
    return (
      <div className="content">
        <p className="vacio">No hay juego para mostrar.</p>
      </div>
    );
  }
  return (
    <div className="juego-pantalla">
      <iframe className="juego-marco" src={juego.archivo} title={juego.titulo} allow="autoplay; fullscreen" />
    </div>
  );
}
