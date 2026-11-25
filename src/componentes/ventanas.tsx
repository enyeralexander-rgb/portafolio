"use client";

import Image from "next/image";
import { useRef, useState, type MouseEvent, type PointerEvent, type ReactNode } from "react";
import {
  ARCHIVOS_CV,
  AVISO_NUEVA_PESTANA,
  CV,
  LUGARES_FAVORITOS,
  MARCAS,
  MENU,
  NOTAS,
  SOBRE_MI,
  abreNuevaPestana,
  type EnlaceNota,
  type Nota,
} from "@/data/contenido";
import { elementoDeDestino } from "@/lib/enlace-profundo";
import { elementoDeLugar } from "@/lib/menu";
import { lugarActual, puedeIrAdelante, puedeIrAtras } from "@/lib/historial";
import { describirLugar, textoElementos, tituloDeLugar, type ElementoLugar } from "@/lib/lugares";
import { dominioDe, idNavegador } from "@/lib/navegador";
import type { Ventana } from "@/lib/gestor-ventanas";
import { CuerpoBienvenida } from "./bienvenida";
import { EtiquetaPartida } from "./etiqueta-partida";
import { useGestorVentanas } from "./gestor-ventanas";
import {
  IconoCarpeta,
  IconoLateral,
  IconoPdf,
  IconoTexto,
  IconoVideo,
  IconoWeb,
} from "./iconos";
import { Mensajero } from "./mensajero";
import { CuerpoJuego } from "./juego";
import { CuerpoNavegador } from "./navegador";
import { CuerpoVideo } from "./reproductor";

function IconoElemento({ icono }: { icono: ElementoLugar["icono"] }) {
  if (icono === "texto") return <IconoTexto />;
  if (icono === "web") return <IconoWeb />;
  if (icono === "pdf") return <IconoPdf />;
  if (icono === "video") return <IconoVideo />;
  return <IconoCarpeta />;
}

function CuerpoFinder({ ventana }: { ventana: Ventana }) {
  const g = useGestorVentanas();
  const [seleccionado, setSeleccionado] = useState<string | null>(null);
  const historial = ventana.historial;
  if (!historial) return null;

  const lugar = lugarActual(historial);
  const vista = describirLugar(lugar);

  const activar = (el: ElementoLugar) => {
    if (el.accion.tipo === "ir") g.navegar(ventana.id, el.accion.lugar);
    else if (el.accion.tipo === "abrir") g.abrir(el.accion.elemento);
  };

  const claseLateral = (destino: string) => (destino === lugar ? "on" : "");

  return (
    <>
      <div className="toolbar">
        <div className="nav">
          <button
            type="button"
            aria-label="Atrás"
            disabled={!puedeIrAtras(historial)}
            onClick={() => g.atras(ventana.id)}
          >
            <span aria-hidden="true">‹</span>
          </button>
          <button
            type="button"
            aria-label="Adelante"
            disabled={!puedeIrAdelante(historial)}
            onClick={() => g.adelante(ventana.id)}
          >
            <span aria-hidden="true">›</span>
          </button>
        </div>
        <p className="path">
          {MENU.marca}
          {vista.ruta.map((tramo, i) => (
            <span key={tramo}>
              {" › "}
              {i === vista.ruta.length - 1 ? <b>{tramo}</b> : tramo}
            </span>
          ))}
        </p>
      </div>

      <div className="main">
        <nav className="side" aria-label="Lugares">
          <p className="side-titulo">FAVORITOS</p>
          <ul>
            {LUGARES_FAVORITOS.map((f) => (
              <li key={f.lugar}>
                <button
                  type="button"
                  className={claseLateral(f.lugar)}
                  aria-current={f.lugar === lugar ? "page" : undefined}
                  onClick={() => g.navegar(ventana.id, f.lugar)}
                >
                  <IconoLateral tipo={f.lugar as "escritorio" | "proyectos" | "audiovisual" | "juegos"} />
                  {f.etiqueta}
                </button>
              </li>
            ))}
          </ul>
          <p className="side-titulo">MARCAS</p>
          <ul>
            {MARCAS.map((m) => (
              <li key={m.id}>
                <button
                  type="button"
                  onClick={() => g.abrir({ id: idNavegador(m.id), titulo: dominioDe(m.sitio), tipo: "navegador" })}
                >
                  <i aria-hidden="true" />
                  {m.nombreLateral}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <div className="content">
          <div className="head">
            <div className="lg">{vista.icono === "video" ? <IconoVideo /> : <IconoCarpeta />}</div>
            <div>
              <h3>
                <EtiquetaPartida texto={vista.titulo} />
              </h3>
              <p>{vista.subtitulo}</p>
            </div>
          </div>

          {vista.elementos.length > 0 && (
            <ul className={vista.vista === "apps" ? "files apps" : "files"}>
              {vista.elementos.map((el) => (
                <li key={el.clave}>
                  {el.accion.tipo === "enlace" ? (
                    <a
                      className="file"
                      href={el.accion.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`${el.etiqueta} de ${vista.titulo}, ${AVISO_NUEVA_PESTANA}`}
                    >
                      <IconoElemento icono={el.icono} />
                      <span>{el.etiqueta}</span>
                    </a>
                  ) : el.icono === "app" ? (
                    <button type="button" className="file app-cuadro" onClick={() => activar(el)}>
                      {el.imagen && <Image src={el.imagen} alt="" width={56} height={56} unoptimized draggable={false} />}
                      <span>{el.etiqueta}</span>
                      {el.subetiqueta && <small>{el.subetiqueta}</small>}
                    </button>
                  ) : el.icono === "video" ? (
                    <button
                      type="button"
                      className={seleccionado === `${lugar}:${el.clave}` ? "file sel" : "file"}
                      aria-label={`${el.etiqueta}, video. Doble clic o Enter para abrir`}
                      data-abre={el.accion.tipo === "abrir" ? el.accion.elemento.id : undefined}
                      onClick={(e: MouseEvent<HTMLButtonElement>) => {
                        if (e.detail === 0 || window.matchMedia("(pointer: coarse)").matches) activar(el);
                        else setSeleccionado(`${lugar}:${el.clave}`);
                      }}
                      onDoubleClick={() => activar(el)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          setSeleccionado(`${lugar}:${el.clave}`);
                          activar(el);
                        }
                      }}
                    >
                      <IconoElemento icono={el.icono} />
                      <span>{el.etiqueta}</span>
                    </button>
                  ) : (
                    <button type="button" className="file" onClick={() => activar(el)}>
                      <IconoElemento icono={el.icono} />
                      <span>
                        <EtiquetaPartida texto={el.etiqueta} />
                      </span>
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}
          {vista.vacio && <p className="vacio">{vista.vacio}</p>}
        </div>
      </div>

      <div className="status">{textoElementos(vista.elementos.length)}</div>
    </>
  );
}

function notaDe(id: string): Nota | undefined {
  return Object.values(NOTAS).find((n) => n.id === id);
}

function EnlaceDeNota({ enlace }: { enlace: EnlaceNota }) {
  const g = useGestorVentanas();
  if (enlace.href && !abreNuevaPestana(enlace.href)) {
    return (
      <a className="nota-enlace" href={enlace.href}>
        {enlace.etiqueta}
      </a>
    );
  }
  if (enlace.href) {
    return (
      <a
        className="nota-enlace"
        href={enlace.href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`${enlace.etiqueta}, ${AVISO_NUEVA_PESTANA}`}
      >
        {enlace.etiqueta}
      </a>
    );
  }
  const elemento = enlace.destino ? elementoDeDestino(enlace.destino) : enlace.lugar ? elementoDeLugar(enlace.lugar) : null;
  if (!elemento) return null;
  return (
    <button type="button" className={enlace.principal ? "nota-boton" : "nota-enlace"} onClick={() => g.abrir(elemento)}>
      {enlace.etiqueta}
    </button>
  );
}

function CuerpoNota({ ventana }: { ventana: Ventana }) {
  const nota = notaDe(ventana.id);
  if (!nota) return null;

  return (
    <>
      <div className="nmenu" aria-hidden="true">
        <span>ARCHIVO</span>
        <span>EDICIÓN</span>
        <span>FORMATO</span>
        <span>VER</span>
      </div>
      <div className="paper-body">
        {nota.id === NOTAS.sobre.id && (
          <figure className="exp">
            <span className="tape t1" aria-hidden="true" />
            <span className="tape t2" aria-hidden="true" />
            <div className="cut">
              <Image src="/yo.png" alt={SOBRE_MI.fotoAlt} width={240} height={360} unoptimized draggable={false} />
            </div>
            <figcaption>{SOBRE_MI.fotoPie}</figcaption>
          </figure>
        )}
        {nota.bloques.map((bloque, i) => {
          const [primera, ...resto] = bloque.lineas;
          return (
            <div key={bloque.titulo ?? i}>
              {bloque.titulo ? (
                <p>
                  <b>{bloque.titulo}:</b>
                  {primera ? ` ${primera}` : null}
                </p>
              ) : (
                bloque.lineas.map((linea) => <p key={linea}>{linea}</p>)
              )}
              {bloque.titulo && resto.length > 0 && (
                <ul className="nota-lista">
                  {resto.map((linea) => (
                    <li key={linea}>{linea}</li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
        {nota.enlaces.length > 0 && (
          <ul className="nota-enlaces">
            {nota.enlaces.map((e) => (
              <li key={e.etiqueta}>
                <EnlaceDeNota enlace={e} />
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="status">{nota.pie}</div>
    </>
  );
}

function CuerpoCv() {
  return (
    <>
      <div className="content cv-contenido">
        <div className="head">
          <div className="lg">
            <IconoPdf />
          </div>
          <div>
            <h3>CV</h3>
            <p>{CV.descripcion}</p>
          </div>
        </div>
        <ul className="files">
          {ARCHIVOS_CV.map((a) => (
            <li key={a.id}>
              <a
                className="file"
                href={a.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${a.etiqueta}, ${AVISO_NUEVA_PESTANA}`}
              >
                <IconoPdf />
                <span>{a.etiqueta}</span>
              </a>
            </li>
          ))}
        </ul>
      </div>
      <div className="status">{textoElementos(ARCHIVOS_CV.length)}</div>
    </>
  );
}

function VentanaEscritorio({ ventana: v, activa }: { ventana: Ventana; activa: boolean }) {
  const g = useGestorVentanas();
  const arrastre = useRef<{ dx: number; dy: number } | null>(null);
  const idTitulo = `titulo-${v.id}`;
  const titulo = v.historial ? tituloDeLugar(lugarActual(v.historial)) : v.titulo;

  const alBajar = (e: PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    if ((e.target as Element).closest("button, a")) return;
    if (v.maximizada || !window.matchMedia("(min-width: 768px)").matches) return;
    arrastre.current = { dx: e.clientX - v.x, dy: e.clientY - v.y };
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const alMover = (e: PointerEvent<HTMLDivElement>) => {
    const a = arrastre.current;
    if (a) g.mover(v.id, e.clientX - a.dx, e.clientY - a.dy);
  };
  const alSoltar = () => {
    arrastre.current = null;
  };

  const clases = [
    "win",
    `win-${v.tipo}`,
    activa ? "" : "inactive",
    v.maximizada ? "max" : "",
  ]
    .filter(Boolean)
    .join(" ");

  let cuerpo: ReactNode = null;
  if (v.tipo === "nota") cuerpo = <CuerpoNota ventana={v} />;
  else if (v.tipo === "contacto") cuerpo = <Mensajero idVentana={v.id} />;
  else if (v.tipo === "cv") cuerpo = <CuerpoCv />;
  else if (v.tipo === "video") cuerpo = <CuerpoVideo ventana={v} />;
  else if (v.tipo === "navegador") cuerpo = <CuerpoNavegador ventana={v} />;
  else if (v.tipo === "juego") cuerpo = <CuerpoJuego ventana={v} />;
  else if (v.tipo === "bienvenida") cuerpo = <CuerpoBienvenida />;
  else if (v.historial) cuerpo = <CuerpoFinder ventana={v} />;

  return (
    <div
      className={clases}
      role="dialog"
      aria-labelledby={idTitulo}
      tabIndex={-1}
      hidden={v.estado === "minimizada"}
      data-ventana={v.id}
      style={{ left: v.x, top: v.y, width: v.ancho, height: v.alto, zIndex: v.orden }}
      onPointerDown={() => {
        if (!activa) g.enfocar(v.id);
      }}
    >
      <div
        className="titlebar"
        onPointerDown={alBajar}
        onPointerMove={alMover}
        onPointerUp={alSoltar}
        onPointerCancel={alSoltar}
        onDoubleClick={(e) => {
          if (!(e.target as Element).closest("button, a")) g.maximizar(v.id);
        }}
      >
        <button type="button" className="volver" onClick={() => g.cerrar(v.id)}>
          <span aria-hidden="true">‹</span> Volver
        </button>
        <div className="lights">
          <button type="button" className="luz c" aria-label="Cerrar ventana" onClick={() => g.cerrar(v.id)}>
            <i />
          </button>
          <button type="button" className="luz m" aria-label="Minimizar ventana" onClick={() => g.minimizar(v.id)}>
            <i />
          </button>
          <button
            type="button"
            className="luz z"
            aria-label={v.maximizada ? "Restaurar tamaño de la ventana" : "Maximizar ventana"}
            onClick={() => g.maximizar(v.id)}
          >
            <i />
          </button>
        </div>
        <h2 id={idTitulo} className="title">
          {titulo}
        </h2>
      </div>
      {cuerpo}
    </div>
  );
}

export function CapaVentanas() {
  const { estado } = useGestorVentanas();
  return (
    <div className="ventanas">
      {estado.ventanas.map((v) => (
        <VentanaEscritorio key={v.id} ventana={v} activa={estado.activa === v.id} />
      ))}
    </div>
  );
}
