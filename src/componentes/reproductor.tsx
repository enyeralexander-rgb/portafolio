"use client";

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { VIDEOS, nombreDeVideo, type OrigenVideo } from "@/data/contenido";
import type { Ventana } from "@/lib/gestor-ventanas";
import {
  VOLUMEN_INICIAL,
  ajustarVolumen,
  alTerminar,
  crearLista,
  formatearTiempo,
  hayAnterior,
  haySiguiente,
  idActual,
  irAnterior,
  irSiguiente,
  limitarVolumen,
  porcentajeVolumen,
  type ListaReproduccion,
} from "@/lib/reproductor";

type Carga = "cargando" | "lista" | "error";

const IDS_VIDEOS = VIDEOS.map((v) => v.id);
const AVISO_SIN_AUDIO = "Este video no tiene audio";

function Glifo({ children }: { children: ReactNode }) {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" focusable="false" fill="currentColor">
      {children}
    </svg>
  );
}

const GlifoAnterior = () => (
  <Glifo>
    <rect x="5" y="5" width="3" height="14" rx="1" />
    <path d="M19 5.5v13a1 1 0 0 1-1.6.8L9 13.2a1.6 1.6 0 0 1 0-2.4l8.4-6.1a1 1 0 0 1 1.6.8Z" />
  </Glifo>
);
const GlifoSiguiente = () => (
  <Glifo>
    <rect x="16" y="5" width="3" height="14" rx="1" />
    <path d="M5 5.5v13a1 1 0 0 0 1.6.8l8.4-6.1a1.6 1.6 0 0 0 0-2.4L6.6 4.7A1 1 0 0 0 5 5.5Z" />
  </Glifo>
);
const GlifoPlay = () => (
  <Glifo>
    <path d="M7 4.6v14.8a1 1 0 0 0 1.5.9l12-7.4a1 1 0 0 0 0-1.8l-12-7.4A1 1 0 0 0 7 4.6Z" />
  </Glifo>
);
const GlifoPausa = () => (
  <Glifo>
    <rect x="6" y="5" width="4.5" height="14" rx="1.2" />
    <rect x="13.5" y="5" width="4.5" height="14" rx="1.2" />
  </Glifo>
);
const GlifoSonido = () => (
  <Glifo>
    <path d="M4 9.5v5h3.6l4.4 3.7V5.8L7.6 9.5H4Z" />
    <path d="M15 9a4 4 0 0 1 0 6M17.2 6.6a7.4 7.4 0 0 1 0 10.8" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
  </Glifo>
);
const GlifoSilencio = () => (
  <Glifo>
    <path d="M4 9.5v5h3.6l4.4 3.7V5.8L7.6 9.5H4Z" />
    <path d="m15.5 9.5 5 5m0-5-5 5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
  </Glifo>
);

export function CuerpoVideo({ ventana }: { ventana: Ventana }) {
  const origen: OrigenVideo = ventana.origen ?? "escritorio";
  return <Reproductor key={`${ventana.id}-${origen}`} idInicial={ventana.id} origen={origen} />;
}

function Reproductor({ idInicial, origen }: { idInicial: string; origen: OrigenVideo }) {
  const [lista, setLista] = useState<ListaReproduccion | null>(() => crearLista(IDS_VIDEOS, idInicial, origen));
  const [seguir, setSeguir] = useState(false);
  const [carga, setCarga] = useState<Carga>("cargando");
  const [intento, setIntento] = useState(0);
  const idDescripcion = useId();
  const [reproduciendo, setReproduciendo] = useState(false);
  const [actual, setActual] = useState(0);
  const [total, setTotal] = useState(0);
  const [volumen, setVolumen] = useState(VOLUMEN_INICIAL);
  const [silenciado, setSilenciado] = useState(false);
  const [avisoAudio, setAvisoAudio] = useState(false);

  const contenedor = useRef<HTMLDivElement>(null);
  const reproductor = useRef<HTMLVideoElement>(null);
  const temporizador = useRef<number | undefined>(undefined);

  const video = lista ? VIDEOS.find((v) => v.id === idActual(lista)) : undefined;
  const idVideo = video?.id;
  const sinAudio = video ? !video.tieneAudio : false;
  const duracionTotal = total > 0 ? total : (video?.duracion ?? 0);

  useEffect(() => {
    const id = window.setTimeout(() => contenedor.current?.focus({ preventScroll: true }), 50);
    return () => window.clearTimeout(id);
  }, []);

  useEffect(() => () => window.clearTimeout(temporizador.current), []);

  useEffect(() => {
    const el = reproductor.current;
    if (!el) return;
    el.volume = volumen;
    el.muted = silenciado;
  }, [volumen, silenciado, idVideo, intento]);

  useEffect(() => {
    const el = reproductor.current;
    if (el && el.readyState >= 1) {
      setCarga("lista");
      if (Number.isFinite(el.duration) && el.duration > 0) setTotal(el.duration);
    }
  }, [idVideo, intento]);

  const mostrarAvisoAudio = useCallback(() => {
    if (!sinAudio) return;
    setAvisoAudio(true);
    window.clearTimeout(temporizador.current);
    temporizador.current = window.setTimeout(() => setAvisoAudio(false), 2600);
  }, [sinAudio]);

  if (!lista || !video) return <p className="vacio">No hay video para mostrar.</p>;

  const cambiarDeVideo = (nueva: ListaReproduccion, arrancar: boolean) => {
    setLista(nueva);
    setSeguir(arrancar);
    setCarga("cargando");
    setActual(0);
    setTotal(0);
    setReproduciendo(false);
  };

  const alternar = () => {
    const el = reproductor.current;
    if (!el || carga !== "lista") return;
    if (el.paused) void el.play().catch(() => undefined);
    else el.pause();
  };

  const fijarVolumen = (nuevo: number) => {
    const v = limitarVolumen(nuevo);
    setVolumen(v);
    setSilenciado(v === 0);
    mostrarAvisoAudio();
  };

  const alternarSilencio = () => {
    if (silenciado && volumen === 0) setVolumen(VOLUMEN_INICIAL);
    setSilenciado((s) => !s);
    mostrarAvisoAudio();
  };

  const alTeclear = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    const destino = e.target as HTMLElement;
    const enBoton = destino.closest("button") !== null;
    const enRango = destino instanceof HTMLInputElement && destino.type === "range";
    if (e.key === " ") {
      if (enBoton) return;
      e.preventDefault();
      alternar();
    } else if (e.key === "m" || e.key === "M") {
      e.preventDefault();
      alternarSilencio();
    } else if (!enRango && (e.key === "ArrowUp" || e.key === "ArrowRight")) {
      e.preventDefault();
      fijarVolumen(ajustarVolumen(silenciado ? 0 : volumen, 1));
    } else if (!enRango && (e.key === "ArrowDown" || e.key === "ArrowLeft")) {
      e.preventDefault();
      fijarVolumen(ajustarVolumen(silenciado ? 0 : volumen, -1));
    }
  };

  const fraccion = duracionTotal > 0 ? Math.min(1, actual / duracionTotal) : 0;
  const volumenVisible = silenciado ? 0 : volumen;
  const estiloProgreso = { "--p": `${(fraccion * 100).toFixed(2)}%` } as CSSProperties;
  const estiloVolumen = { "--p": `${porcentajeVolumen(volumenVisible)}%` } as CSSProperties;
  const posicion = lista.ids.length > 1 ? ` · video ${lista.indice + 1} de ${lista.ids.length}` : "";

  return (
    <>
      <div
        className="reproductor"
        ref={contenedor}
        tabIndex={0}
        role="group"
        aria-describedby={idDescripcion}
        aria-label={`Reproductor de ${nombreDeVideo(video)}. Espacio pausa o reproduce, las flechas ajustan el volumen y la tecla M silencia.`}
        onKeyDown={alTeclear}
      >
        <p id={idDescripcion} className="solo-lectores">
          {video.descripcion}
        </p>
        <div className="rp-pantalla">
          <video
            key={`${video.id}-${intento}`}
            ref={reproductor}
            className="rp-video"
            src={video.archivo}
            poster={video.poster}
            preload="metadata"
            playsInline
            autoPlay={seguir}
            aria-label={`Video ${video.titulo}`}
            aria-describedby={idDescripcion}
            onLoadedMetadata={(e) => {
              setCarga("lista");
              const d = e.currentTarget.duration;
              if (Number.isFinite(d) && d > 0) setTotal(d);
            }}
            onError={() => setCarga("error")}
            onPlay={() => setReproduciendo(true)}
            onPause={() => setReproduciendo(false)}
            onTimeUpdate={(e) => setActual(e.currentTarget.currentTime)}
            onEnded={() => {
              const siguiente = alTerminar(lista);
              if (siguiente.continuar) cambiarDeVideo(siguiente.lista, true);
              else setReproduciendo(false);
            }}
            onClick={alternar}
          />
          {carga === "lista" && !reproduciendo && (
            <span className="rp-grande" aria-hidden="true">
              <GlifoPlay />
            </span>
          )}
          {carga === "cargando" && (
            <p className="rp-aviso" role="status">
              Cargando video…
            </p>
          )}
          {carga === "error" && (
            <div className="rp-aviso" role="alert">
              <p>No se pudo cargar el video.</p>
              <button
                type="button"
                onClick={() => {
                  setCarga("cargando");
                  setIntento((n) => n + 1);
                }}
              >
                Reintentar
              </button>
            </div>
          )}
        </div>

        <div className="rp-progreso">
          <span className="rp-tiempo">{formatearTiempo(actual)}</span>
          <input
            type="range"
            className="rp-rango"
            style={estiloProgreso}
            min={0}
            max={duracionTotal > 0 ? duracionTotal : 1}
            step={0.1}
            value={Math.min(actual, duracionTotal > 0 ? duracionTotal : 1)}
            disabled={carga !== "lista"}
            aria-label="Progreso del video"
            aria-valuetext={`${formatearTiempo(actual)} de ${formatearTiempo(duracionTotal)}`}
            onChange={(e) => {
              const segundo = Number(e.target.value);
              if (reproductor.current) reproductor.current.currentTime = segundo;
              setActual(segundo);
            }}
          />
          <span className="rp-tiempo">{formatearTiempo(duracionTotal)}</span>
        </div>

        <div className="rp-controles">
          <p className="rp-titulo">{nombreDeVideo(video)}</p>
          <div className="rp-centro">
            <button
              type="button"
              className="rp-btn"
              aria-label="Video anterior"
              disabled={!hayAnterior(lista)}
              onClick={() => cambiarDeVideo(irAnterior(lista), reproduciendo)}
            >
              <GlifoAnterior />
            </button>
            <button
              type="button"
              className="rp-btn rp-principal"
              aria-label={reproduciendo ? "Pausar" : "Reproducir"}
              disabled={carga !== "lista"}
              onClick={alternar}
            >
              {reproduciendo ? <GlifoPausa /> : <GlifoPlay />}
            </button>
            <button
              type="button"
              className="rp-btn"
              aria-label="Video siguiente"
              disabled={!haySiguiente(lista)}
              onClick={() => cambiarDeVideo(irSiguiente(lista), reproduciendo)}
            >
              <GlifoSiguiente />
            </button>
          </div>
          <div className="rp-volumen">
            <button
              type="button"
              className="rp-btn"
              aria-label={silenciado ? "Activar el sonido" : "Silenciar"}
              aria-pressed={silenciado}
              onClick={alternarSilencio}
            >
              {silenciado ? <GlifoSilencio /> : <GlifoSonido />}
            </button>
            <input
              type="range"
              className="rp-rango rp-rango-volumen"
              style={estiloVolumen}
              min={0}
              max={100}
              step={10}
              value={porcentajeVolumen(volumenVisible)}
              aria-label="Volumen"
              aria-valuetext={`${porcentajeVolumen(volumenVisible)} por ciento`}
              onChange={(e) => fijarVolumen(Number(e.target.value) / 100)}
            />
            <span className="rp-ayuda" role="status">
              {avisoAudio ? AVISO_SIN_AUDIO : ""}
            </span>
          </div>
        </div>
      </div>
      <div className="status">
        {nombreDeVideo(video)} · {formatearTiempo(duracionTotal)}
        {sinAudio ? " · sin audio" : ""}
        {posicion}
      </div>
    </>
  );
}
