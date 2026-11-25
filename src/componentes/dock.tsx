"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { APLICACIONES_DOCK, MARCAS, type TipoElemento } from "@/data/contenido";
import { estaEnUso } from "@/lib/gestor-ventanas";
import { dominioDe, idNavegador } from "@/lib/navegador";
import { punteroCercaDelDock, tamanoDockIcono } from "@/lib/zoom-dock";
import { useGestorVentanas } from "./gestor-ventanas";
import { IconoJuego, IconoPapelera, IconoPdf, IconoTexto, IconoVideo, Munequitos } from "./iconos";
import { LogoMarca } from "./logo-marca";

const CONSULTA_ZOOM =
  "(min-width: 768px) and (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)";

interface ItemDock {
  id: string;
  etiqueta: string;
  titulo: string;
  tipo: TipoElemento;
  clase: string;
  icono: ReactNode;
}

const ITEMS_MARCAS: readonly ItemDock[] = MARCAS.map((m): ItemDock => ({
  id: idNavegador(m.id),
  etiqueta: m.nombre,
  titulo: dominioDe(m.sitio),
  tipo: "navegador",
  clase: "app",
  icono: <LogoMarca marca={m} />,
}));

const ITEMS_APPS: readonly ItemDock[] = APLICACIONES_DOCK.map((a): ItemDock => ({
  id: a.id,
  etiqueta: a.etiqueta,
  titulo: a.titulo,
  tipo: a.tipo,
  clase: a.tipo === "contacto" ? "app msn-app" : "app",
  icono: a.tipo === "contacto" ? <Munequitos /> : <IconoPapelera />,
}));

const IDS_CON_HUECO = new Set([...ITEMS_MARCAS, ...ITEMS_APPS].map((i) => i.id));

export function Dock() {
  const { estado, abrir } = useGestorVentanas();
  const fondoRef = useRef<HTMLDivElement>(null);
  const listaRef = useRef<HTMLDivElement>(null);
  const botones = useRef<(HTMLButtonElement | null)[]>([]);
  const medirRef = useRef<() => void>(() => {});

  const extras = estado.ventanas.filter((v) => v.estado === "minimizada" && !IDS_CON_HUECO.has(v.id));

  useEffect(() => {
    const consulta = window.matchMedia(CONSULTA_ZOOM);
    let cuadro = 0;
    let x = -999;
    let y = -999;

    const restablecer = () => {
      for (const b of botones.current) {
        if (b) {
          b.style.width = "";
          b.style.height = "";
        }
      }
    };

    const medir = () => {
      restablecer();
      const fondo = fondoRef.current;
      const lista = listaRef.current;
      if (fondo && lista) {
        fondo.style.width = `${lista.offsetWidth + 4}px`;
        fondo.dataset.medido = "1";
      }
    };
    medirRef.current = medir;

    const aplicar = () => {
      cuadro = 0;
      const fondo = fondoRef.current;
      if (!consulta.matches || !fondo) {
        restablecer();
        return;
      }
      const r = fondo.getBoundingClientRect();
      const cerca = punteroCercaDelDock(y, r.top, r.bottom);
      for (const b of botones.current) {
        if (!b) continue;
        const rb = b.getBoundingClientRect();
        const lado = tamanoDockIcono(x - (rb.left + rb.width / 2), cerca);
        b.style.width = `${lado}px`;
        b.style.height = `${lado}px`;
      }
    };

    const alMover = (e: globalThis.PointerEvent) => {
      if (e.pointerType === "touch") return;
      x = e.clientX;
      y = e.clientY;
      if (cuadro === 0) cuadro = requestAnimationFrame(aplicar);
    };

    const alSalir = () => {
      x = -999;
      y = -999;
      restablecer();
    };

    medir();
    window.addEventListener("pointermove", alMover, { passive: true });
    window.addEventListener("resize", medir);
    window.addEventListener("blur", alSalir);
    document.documentElement.addEventListener("mouseleave", alSalir);
    consulta.addEventListener("change", restablecer);

    return () => {
      cancelAnimationFrame(cuadro);
      window.removeEventListener("pointermove", alMover);
      window.removeEventListener("resize", medir);
      window.removeEventListener("blur", alSalir);
      document.documentElement.removeEventListener("mouseleave", alSalir);
      consulta.removeEventListener("change", restablecer);
    };
  }, []);

  const cantidadExtras = extras.length;
  useEffect(() => {
    medirRef.current();
  }, [cantidadExtras]);

  const botonDe = (item: ItemDock, i: number) => (
    <li key={item.id}>
      <button
        type="button"
        ref={(el) => {
          botones.current[i] = el;
        }}
        className={`${item.clase}${estaEnUso(estado, item.id) ? " running" : ""}`}
        aria-label={item.etiqueta}
        data-abre={item.id}
        onClick={() => abrir({ id: item.id, titulo: item.titulo, tipo: item.tipo })}
      >
        <span className="ico">{item.icono}</span>
        <b aria-hidden="true">{item.etiqueta}</b>
        <span className="dot" aria-hidden="true" />
      </button>
    </li>
  );

  return (
    <nav className="dock-nav" aria-label="Dock">
      <div ref={fondoRef} className="dock-bg" aria-hidden="true" />
      <div ref={listaRef} className="dock">
        <ul className="dock-grupo dock-marcas">{ITEMS_MARCAS.map((item, i) => botonDe(item, i))}</ul>
        <span className="dock-sep" aria-hidden="true" />
        <ul className="dock-grupo dock-apps">
          {ITEMS_APPS.map((item, i) => botonDe(item, ITEMS_MARCAS.length + i))}
          {extras.map((v, i) => (
            <li key={v.id}>
                <button
                  type="button"
                  ref={(el) => {
                    botones.current[ITEMS_MARCAS.length + ITEMS_APPS.length + i] = el;
                  }}
                  className="app running"
                  aria-label={`${v.titulo}, minimizada`}
                  data-abre={v.id}
                  onClick={() => abrir({ id: v.id, titulo: v.titulo, tipo: v.tipo, ...(v.origen ? { origen: v.origen } : {}) })}
                >
                  <span className="ico">
                    {v.tipo === "juego" ? (
                      <IconoJuego />
                    ) : v.tipo === "video" ? (
                      <IconoVideo />
                    ) : v.tipo === "cv" ? (
                      <IconoPdf />
                    ) : (
                      <IconoTexto />
                    )}
                  </span>
                  <b aria-hidden="true">{v.titulo}</b>
                  <span className="dot" aria-hidden="true" />
                </button>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
