"use client";

import { useEffect, useState, type CSSProperties } from "react";
import type { Marca } from "@/data/contenido";
import type { Ventana } from "@/lib/gestor-ventanas";
import { LogoMarca } from "./logo-marca";
import {
  DURACION_MAX_CARGA_MS,
  dominioDe,
  marcaDeNavegador,
  mostrarAnimacionCarga,
} from "@/lib/navegador";

export function CuerpoNavegador({ ventana }: { ventana: Ventana }) {
  const marca = marcaDeNavegador(ventana.id);
  if (!marca) {
    return (
      <div className="content">
        <p className="vacio">No hay sitio para mostrar.</p>
      </div>
    );
  }
  return <Navegador marca={marca} />;
}

function Navegador({ marca }: { marca: Marca }) {
  const [intento, setIntento] = useState(0);
  const [cargado, setCargado] = useState(false);
  const [transcurrido, setTranscurrido] = useState(0);
  const dominio = dominioDe(marca.sitio);

  useEffect(() => {
    const id = window.setTimeout(
      () => setTranscurrido(DURACION_MAX_CARGA_MS),
      DURACION_MAX_CARGA_MS,
    );
    return () => window.clearTimeout(id);
  }, [intento]);

  const recargar = () => {
    setCargado(false);
    setTranscurrido(0);
    setIntento((n) => n + 1);
  };

  return (
    <>
      <div className="toolbar">
        <div className="nav">
          <button type="button" aria-label="Recargar" onClick={recargar}>
            <span aria-hidden="true">↻</span>
          </button>
        </div>
        <p className="direccion" title={marca.sitio}>
          <span className="solo-lectores">Dirección: </span>
          {marca.sitio}
        </p>
        <a
          className="abrir-pestana"
          href={marca.sitio}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Abrir en pestaña nueva ${dominio.toLowerCase()}`}
        >
          Abrir en pestaña nueva
        </a>
      </div>
      <div className="web-pantalla">
        {marca.soloPestana ? (
          <div className="web-externa">
            <span className="web-externa-logo">
              <LogoMarca marca={marca} />
            </span>
            <p>Este sitio no permite mostrarse dentro de otra página.</p>
            <a
              className="web-externa-boton"
              href={marca.sitio}
              target="_blank"
              rel="noopener noreferrer"
            >
              Visitar {dominio.toLowerCase()} ↗
            </a>
          </div>
        ) : (
          <iframe
            key={intento}
            className="web-marco"
            src={marca.sitio}
            title={marca.nombre}
            loading="lazy"
            referrerPolicy="strict-origin-when-cross-origin"
            onLoad={() => setCargado(true)}
          />
        )}
        {!marca.soloPestana && mostrarAnimacionCarga(transcurrido, cargado) && (
          <div
            className="web-carga"
            role="status"
            style={
              {
                "--duracion-carga": `${DURACION_MAX_CARGA_MS}ms`,
              } as CSSProperties
            }
          >
            <span className="web-barra" aria-hidden="true">
              <i />
            </span>
            <p>Cargando {dominio}…</p>
          </div>
        )}
      </div>
      <div className="status">{marca.descripcion}</div>
    </>
  );
}
