"use client";

import { BIENVENIDA, TEXTO_ENLACE_SIMPLE } from "@/data/contenido";
import { VENTANA_BIENVENIDA } from "@/lib/bienvenida";
import { elementoDeDestino } from "@/lib/enlace-profundo";
import { useGestorVentanas } from "./gestor-ventanas";

export function CuerpoBienvenida() {
  const g = useGestorVentanas();

  return (
    <div className="paper-body bienvenida">
      {BIENVENIDA.parrafos.map((parrafo) => (
        <p key={parrafo}>{parrafo}</p>
      ))}
      <ul className="bienvenida-botones">
        {BIENVENIDA.botones.map((b) => (
          <li key={b.destino}>
            <button
              type="button"
              onClick={() => {
                g.cerrar(VENTANA_BIENVENIDA.id);
                g.abrir(elementoDeDestino(b.destino));
              }}
            >
              {b.etiqueta}
            </button>
          </li>
        ))}
      </ul>
      <a className="bienvenida-simple" href={BIENVENIDA.enlaceSimple}>
        {TEXTO_ENLACE_SIMPLE}
      </a>
    </div>
  );
}
