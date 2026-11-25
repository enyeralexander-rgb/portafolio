"use client";

import { useEffect, useRef, type CSSProperties } from "react";

const PARALAJE = 14;
const SUAVIDAD = 0.2;

const retraso = (s: number): CSSProperties => ({ animationDelay: `${s}s` });

function coordenada(valor: number): string {
  return String(Math.max(0, Math.round(valor))).padStart(4, "0");
}

export function FondoTecnico() {
  const capa = useRef<HTMLDivElement>(null);
  const lectura = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = capa.current;
    if (!el) return;
    const reducir = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let x = window.innerWidth * 0.6;
    let y = window.innerHeight * 0.45;
    let destinoX = x;
    let destinoY = y;
    let cuadro = 0;

    const pintar = () => {
      x += (destinoX - x) * (reducir ? 1 : SUAVIDAD);
      y += (destinoY - y) * (reducir ? 1 : SUAVIDAD);
      const px = reducir ? 0 : (x / window.innerWidth - 0.5) * -PARALAJE;
      const py = reducir ? 0 : (y / window.innerHeight - 0.5) * -PARALAJE;
      el.style.setProperty("--fx", `${x}px`);
      el.style.setProperty("--fy", `${y}px`);
      el.style.setProperty("--px", `${px}px`);
      el.style.setProperty("--py", `${py}px`);
      if (lectura.current) lectura.current.textContent = `X ${coordenada(x)} · Y ${coordenada(y)}`;
      cuadro = Math.abs(destinoX - x) > 0.4 || Math.abs(destinoY - y) > 0.4 ? requestAnimationFrame(pintar) : 0;
    };

    const mover = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      destinoX = e.clientX;
      destinoY = e.clientY;
      el.dataset.activo = "1";
      if (!cuadro) cuadro = requestAnimationFrame(pintar);
    };

    const salir = () => {
      delete el.dataset.activo;
    };

    const marcar = (e: PointerEvent) => {
      if (reducir) return;
      const cota = document.createElement("i");
      cota.className = "ft-cota";
      cota.style.left = `${e.clientX}px`;
      cota.style.top = `${e.clientY}px`;
      cota.addEventListener("animationend", () => cota.remove(), { once: true });
      el.appendChild(cota);
    };

    window.addEventListener("pointermove", mover, { passive: true });
    window.addEventListener("pointerdown", marcar, { passive: true });
    document.documentElement.addEventListener("pointerleave", salir);
    window.addEventListener("blur", salir);
    return () => {
      cancelAnimationFrame(cuadro);
      window.removeEventListener("pointermove", mover);
      window.removeEventListener("pointerdown", marcar);
      document.documentElement.removeEventListener("pointerleave", salir);
      window.removeEventListener("blur", salir);
    };
  }, []);

  return (
    <div className="wall fondo-tecnico" ref={capa} aria-hidden="true">
      <div className="ft-rejilla" />
      <div className="ft-foco" />
      <svg className="ft-trazos" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" focusable="false">
        <g className="ft-giro">
          <circle cx="760" cy="560" r="196" className="guia" />
        </g>
        <line x1="300" y1="560" x2="1220" y2="560" className="guia" />
        <line x1="760" y1="260" x2="760" y2="860" className="guia" />
        <circle cx="760" cy="560" r="150" pathLength={1} className="t" style={retraso(0)} />
        <circle cx="760" cy="560" r="58" pathLength={1} className="t" style={retraso(0.8)} />
        <path d="M760 560 L866 454" pathLength={1} className="t naranja" style={retraso(1.6)} />
        <text x="830" y="490" className="ft-nota" style={retraso(2.2)}>
          R 150
        </text>
        <path d="M610 760 L910 760 M610 750 V770 M910 750 V770" pathLength={1} className="t naranja" style={retraso(2.6)} />
        <text x="738" y="750" className="ft-nota" style={retraso(3.2)}>
          300
        </text>
        <rect x="330" y="330" width="170" height="110" pathLength={1} className="t" style={retraso(3.6)} />
        <path d="M330 330 L500 440 M500 330 L330 440" pathLength={1} className="t tenue" style={retraso(4.4)} />
        <text x="330" y="320" className="ft-nota" style={retraso(5)}>
          DETALLE A
        </text>
        <path d="M180 600 A 120 120 0 0 1 300 720" pathLength={1} className="t" style={retraso(5.4)} />
        <path d="M180 600 V720 H300" pathLength={1} className="t tenue" style={retraso(6)} />
        <text x="196" y="708" className="ft-nota" style={retraso(6.6)}>
          90°
        </text>
      </svg>
      <div className="ft-barrido" />
      <div className="ft-mira">
        <i className="ft-h" />
        <i className="ft-v" />
        <span className="ft-coord" ref={lectura} />
      </div>
    </div>
  );
}
