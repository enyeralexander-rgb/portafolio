"use client";

import type { ElementoAbrible, ElementoEscritorio } from "@/data/contenido";
import { EtiquetaPartida } from "./etiqueta-partida";
import { IconoCarpeta, IconoPdf, IconoTexto, IconoVideo, Munequitos } from "./iconos";

interface Props {
  elemento: ElementoEscritorio;
  seleccionado: boolean;
  onSeleccionar: (id: string) => void;
  onAbrir: (elemento: ElementoAbrible) => void;
}

function dibujo({ tipo }: ElementoEscritorio) {
  switch (tipo) {
    case "nota":
      return <IconoTexto />;
    case "cv":
      return <IconoPdf />;
    case "video":
      return <IconoVideo />;
    case "contacto":
      return (
        <span className="tile">
          <Munequitos />
        </span>
      );
    default:
      return <IconoCarpeta />;
  }
}

export function IconoEscritorio({ elemento, seleccionado, onSeleccionar, onAbrir }: Props) {
  const abrir = () =>
    onAbrir({
      id: elemento.id,
      titulo: elemento.etiqueta,
      tipo: elemento.tipo,
      ...(elemento.tipo === "video" ? { origen: "escritorio" as const } : {}),
    });

  return (
    <button
      type="button"
      className={`icono icono-${elemento.tipo}${seleccionado ? " sel" : ""}`}
      aria-current={seleccionado ? "true" : undefined}
      data-abre={elemento.id}
      onClick={() => {
        if (window.matchMedia("(pointer: coarse)").matches) abrir();
        else onSeleccionar(elemento.id);
      }}
      onDoubleClick={abrir}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          onSeleccionar(elemento.id);
          abrir();
        }
      }}
    >
      {dibujo(elemento)}
      <span className="etiqueta">
        <EtiquetaPartida texto={elemento.etiqueta} />
      </span>
    </button>
  );
}
