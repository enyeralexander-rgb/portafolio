"use client";

import Image from "next/image";
import { useEffect, useId, useRef, useState, type FormEvent, type KeyboardEvent, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { AVISO_NUEVA_PESTANA, CORREO, ENLACES_CONTACTO, SITIO, abreNuevaPestana } from "@/data/contenido";
import { enviarMensaje, pedirToken } from "@/lib/contacto/cliente";
import { sePuedeReintentar, textoDeError, type CodigoError } from "@/lib/contacto/errores";
import {
  DURACION_VUELO_MS,
  PASOS_SOBRE,
  PAUSA_INICIO_SESION_MS,
  esperaParaVuelo,
  lineaDeTiempoChat,
} from "@/lib/contacto/linea-tiempo";
import {
  ETIQUETA_ESTADO,
  ESTADOS_VISITANTE,
  MENSAJE_MAX,
  esEstadoVisitante,
  largoTexto,
  normalizarCorreo,
  validarMensaje,
  type DatosMensaje,
  type EstadoVisitante,
} from "@/lib/contacto/validacion";
import { useGestorVentanas } from "./gestor-ventanas";
import { IconoBehance, IconoCorreo, IconoGithub, IconoLinkedin, Munequitos } from "./iconos";

const NOMBRE_ALEXANDER = "Alexander Urbaneja";

type EnlaceDeContacto = (typeof ENLACES_CONTACTO)[number];

const NOMBRES_DE_RED: Record<string, string> = { LINKEDIN: "LinkedIn", GITHUB: "GitHub" };

function nombreDeRed(etiqueta: string): string {
  return NOMBRES_DE_RED[etiqueta] ?? etiqueta[0] + etiqueta.slice(1).toLowerCase();
}

function IconoDeRed({ id }: { id: EnlaceDeContacto["id"] }) {
  if (id === "linkedin") return <IconoLinkedin />;
  if (id === "correo") return <IconoCorreo />;
  if (id === "behance") return <IconoBehance />;
  return <IconoGithub />;
}

function EnlaceContacto({
  enlace,
  className,
  children,
}: {
  enlace: EnlaceDeContacto;
  className?: string;
  children: ReactNode;
}) {
  if (!abreNuevaPestana(enlace.href)) {
    return (
      <a className={className} href={enlace.href} aria-label={`Escribir a ${CORREO}`}>
        {children}
      </a>
    );
  }
  return (
    <a
      className={className}
      href={enlace.href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`${nombreDeRed(enlace.etiqueta)}, ${AVISO_NUEVA_PESTANA}`}
    >
      {children}
    </a>
  );
}
const SALUDO = "Hola, gracias por escribir. Cuéntame de tu proyecto y te respondo a tu correo.";

type Fase = "sesion" | "cargando" | "chat";

type Linea =
  | { id: number; tipo: "mensaje"; autor: string; texto: string }
  | { id: number; tipo: "sistema"; texto: string }
  | { id: number; tipo: "fallo"; texto: string; reintento: DatosMensaje | null };

type NuevaLinea = Linea extends infer L ? (L extends Linea ? Omit<L, "id"> : never) : never;

const CLASE_ESTADO: Record<EstadoVisitante, string> = { disponible: "on", ocupado: "busy", ausente: "away" };

const relojPreciso = (): number => performance.now();
const relojPared = (): number => Date.now();

const movimientoReducido = (): boolean => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function temblar(desde: HTMLElement | null): void {
  const ventana = desde?.closest<HTMLElement>(".win");
  if (!ventana || typeof ventana.animate !== "function") return;
  const pasos: [number, number][] = [[0, 0], [-12, 4], [10, -6], [-10, -4], [12, 6], [-8, 2], [8, -4], [-6, 4], [5, -2], [-3, 1], [0, 0]];
  ventana.animate(
    pasos.map(([x, y]) => ({ transform: `translate(${x}px, ${y}px)` })),
    { duration: 500, easing: "linear" },
  );
}

function Marco({ clase = "", children }: { clase?: string; children: ReactNode }) {
  return (
    <div className={`frame ${clase}`.trim()}>
      <div>{children}</div>
    </div>
  );
}

function FotoAlexander() {
  return <Image src={SITIO.fotoPerfil} alt="" width={240} height={360} unoptimized draggable={false} />;
}

function Silueta() {
  return (
    <svg viewBox="0 0 100 100" aria-hidden="true" focusable="false">
      <circle cx="50" cy="38" r="20" fill="#b9c4c6" />
      <path d="M14 100 q36 -52 72 0z" fill="#b9c4c6" />
    </svg>
  );
}

export function Mensajero({ idVentana }: { idVentana: string }) {
  const g = useGestorVentanas();
  const raiz = useRef<HTMLDivElement>(null);
  const areaTexto = useRef<HTMLTextAreaElement>(null);
  const registro = useRef<HTMLDivElement>(null);
  const idCorreo = useId();
  const idEstado = useId();
  const idMensaje = useId();

  const [fase, setFase] = useState<Fase>("sesion");
  const [correo, setCorreo] = useState("");
  const [estado, setEstado] = useState<EstadoVisitante>("disponible");
  const [errorSesion, setErrorSesion] = useState("");
  const [yo, setYo] = useState<{ correo: string; estado: EstadoVisitante }>({ correo: "", estado: "disponible" });

  const [lineas, setLineas] = useState<Linea[]>([]);
  const [escribiendo, setEscribiendo] = useState(false);
  const [texto, setTexto] = useState("");
  const [errorEnvio, setErrorEnvio] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [sobre, setSobre] = useState(0);
  const [textoSobre, setTextoSobre] = useState("");
  const [avisoEnviado, setAvisoEnviado] = useState(false);
  const [aviso, setAviso] = useState<{ texto: string; visible: boolean }>({ texto: "", visible: false });

  const temporizadores = useRef<number[]>([]);
  const contador = useRef(0);
  const token = useRef<string | null>(null);
  const generacion = useRef(0);
  const enviandoRef = useRef(false);
  const ultimoZumbido = useRef(0);

  const despues = (fn: () => void, ms: number) => {
    temporizadores.current.push(window.setTimeout(fn, ms));
  };
  const limpiarTemporizadores = () => {
    temporizadores.current.forEach((t) => window.clearTimeout(t));
    temporizadores.current = [];
  };
  useEffect(() => {
    return () => {
      limpiarTemporizadores();
      generacion.current += 1;
    };
  }, []);

  const agregar = (linea: NuevaLinea) => {
    contador.current += 1;
    setLineas((previas) => [...previas, { ...linea, id: contador.current } as Linea]);
  };

  const mostrarAviso = (textoAviso: string, ms: number) => {
    setAviso({ texto: textoAviso, visible: true });
    despues(() => setAviso((a) => ({ ...a, visible: false })), ms);
  };

  useEffect(() => {
    const el = registro.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [lineas, escribiendo, avisoEnviado]);

  useEffect(() => {
    if (fase !== "chat") return;
    const t = window.setTimeout(() => areaTexto.current?.focus(), 50);
    return () => window.clearTimeout(t);
  }, [fase]);

  const iniciarSesion = (e: FormEvent) => {
    e.preventDefault();
    const limpio = normalizarCorreo(correo);
    if (limpio === null) {
      setErrorSesion("Ese correo no parece válido.");
      if (!movimientoReducido()) temblar(raiz.current);
      return;
    }
    setErrorSesion("");
    setYo({ correo: limpio, estado });
    limpiarTemporizadores();
    setFase("cargando");
    despues(abrirChat, PAUSA_INICIO_SESION_MS);
  };

  function abrirChat() {
    setLineas([]);
    setFase("chat");
    mostrarAviso("acaba de iniciar sesión.", 2600);
    token.current = null;
    void pedirToken().then((t) => {
      token.current = t;
    });

    const reducido = movimientoReducido();
    for (const evento of lineaDeTiempoChat(reducido)) {
      despues(() => {
        if (evento.tipo === "escribiendo") {
          setEscribiendo(true);
        } else if (evento.tipo === "saludo") {
          setEscribiendo(false);
          agregar({ tipo: "mensaje", autor: NOMBRE_ALEXANDER, texto: SALUDO });
          mostrarAviso("te envió un mensaje.", 2600);
        } else {
          agregar({ tipo: "sistema", texto: `${NOMBRE_ALEXANDER} te ha enviado un zumbido.` });
          g.enfocar(idVentana);
          if (evento.temblor) temblar(raiz.current);
          mostrarAviso("te envió un zumbido.", 4500);
        }
      }, evento.en);
    }
  }

  const cerrarSesion = () => {
    limpiarTemporizadores();
    generacion.current += 1;
    enviandoRef.current = false;
    setEnviando(false);
    setSobre(0);
    setEscribiendo(false);
    setLineas([]);
    setTexto("");
    setErrorEnvio("");
    setAviso({ texto: "", visible: false });
    setFase("sesion");
  };

  const ejecutarEnvio = async (datos: DatosMensaje) => {
    if (enviandoRef.current) return;
    enviandoRef.current = true;
    setEnviando(true);
    setErrorEnvio("");
    setTextoSobre(datos.mensaje.slice(0, 220));
    const numero = (generacion.current += 1);
    const vigente = () => generacion.current === numero;
    const reducido = movimientoReducido();
    const inicio = relojPreciso();

    if (!reducido) {
      for (const p of PASOS_SOBRE.filter((x) => x.paso < 5)) {
        despues(() => vigente() && setSobre(p.paso), p.en);
      }
    }

    let tokenActual = token.current;
    if (!tokenActual) {
      tokenActual = await pedirToken();
      token.current = tokenActual;
    }
    const respuesta = tokenActual
      ? await enviarMensaje(datos, tokenActual, "")
      : ({ ok: false, codigo: "servidor" } as { ok: false; codigo: CodigoError; reintentarEnSeg?: number });

    if (!vigente()) return;

    if (respuesta.ok) {
      if (!reducido) {
        await new Promise<void>((r) => despues(r, esperaParaVuelo(relojPreciso() - inicio)));
        if (!vigente()) return;
        setSobre(5);
        await new Promise<void>((r) => despues(r, DURACION_VUELO_MS));
        if (!vigente()) return;
      }
      setSobre(0);
      agregar({ tipo: "sistema", texto: "Mensaje enviado por correo." });
      setAvisoEnviado(true);
      despues(() => setAvisoEnviado(false), 3500);
    } else {
      generacion.current += 1;
      setSobre(0);
      if (respuesta.codigo === "vencido" || respuesta.codigo === "token_invalido") {
        token.current = null;
        void pedirToken().then((t) => {
          token.current = t;
        });
      }
      agregar({
        tipo: "fallo",
        texto: textoDeError(respuesta.codigo, respuesta.reintentarEnSeg),
        reintento: sePuedeReintentar(respuesta.codigo) ? datos : null,
      });
    }
    enviandoRef.current = false;
    setEnviando(false);
  };

  const enviar = () => {
    if (enviandoRef.current) return;
    const datos = {
      correo: yo.correo,
      mensaje: texto,
      estado: yo.estado,
      envioId: crypto.randomUUID(),
    };
    const validado = validarMensaje(datos);
    if (!validado.ok) {
      setErrorEnvio(textoDeError(validado.codigo));
      areaTexto.current?.focus();
      return;
    }
    agregar({ tipo: "mensaje", autor: yo.correo, texto: validado.datos.mensaje });
    setTexto("");
    void ejecutarEnvio(validado.datos);
  };

  const reintentar = (datos: DatosMensaje, idLinea: number) => {
    if (enviandoRef.current) return;
    setLineas((previas) => previas.filter((l) => l.id !== idLinea));
    void ejecutarEnvio(datos);
  };

  const alTeclear = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      enviar();
    }
  };

  const zumbido = () => {
    const ahora = relojPared();
    if (ahora - ultimoZumbido.current < 1500) return;
    ultimoZumbido.current = ahora;
    agregar({ tipo: "sistema", texto: "Enviaste un zumbido." });
    if (!movimientoReducido()) temblar(raiz.current);
  };

  const clasesSobre = ["env-stage", ...[1, 2, 3, 4, 5].filter((n) => sobre >= n).map((n) => `s${n}`)].join(" ");

  return (
    <div className="msn" ref={raiz}>
      {fase === "sesion" && (
        <div className="msn-vista msn-sesion">
          <div className="hero">
            <Marco clase={CLASE_ESTADO[estado]}>
              <Silueta />
            </Marco>
            <h3>
              INICIA SESIÓN
              <br />
              PARA ESCRIBIRME
            </h3>
          </div>
          <form className="form" onSubmit={iniciarSesion} noValidate>
            <label htmlFor={idCorreo}>TU CORREO ELECTRÓNICO</label>
            <input
              id={idCorreo}
              type="email"
              inputMode="email"
              autoComplete="email"
              placeholder="tu@correo.com"
              maxLength={254}
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              aria-invalid={errorSesion ? true : undefined}
              aria-describedby={errorSesion ? `${idCorreo}-error` : undefined}
            />
            <label htmlFor={idEstado}>INICIAR SESIÓN COMO</label>
            <select
              id={idEstado}
              value={estado}
              onChange={(e) => esEstadoVisitante(e.target.value) && setEstado(e.target.value)}
            >
              {ESTADOS_VISITANTE.map((v) => (
                <option key={v} value={v}>
                  ● {ETIQUETA_ESTADO[v]}
                </option>
              ))}
            </select>
            <p className="err" id={`${idCorreo}-error`} role="alert">
              {errorSesion}
            </p>
            <button type="submit" className="go">
              INICIAR SESIÓN
            </button>
            <p className="note">Sin contraseña. Tu correo se usa solo para responderte.</p>
            <p className="redes-sesion">
              O encuéntrame en{" "}
              {ENLACES_CONTACTO.map((e, i) => (
                <span key={e.id}>
                  {i > 0 && (i === ENLACES_CONTACTO.length - 1 ? " y " : ", ")}
                  <EnlaceContacto enlace={e}>{e.id === "correo" ? CORREO : nombreDeRed(e.etiqueta)}</EnlaceContacto>
                </span>
              ))}
            </p>
          </form>
        </div>
      )}

      {fase === "cargando" && (
        <div className="msn-vista">
          <div className="loading" role="status">
            <Munequitos animado />
            <p>INICIANDO SESIÓN...</p>
          </div>
        </div>
      )}

      {fase === "chat" && (
        <div className="msn-vista msn-chat">
          <div className="chead">
            <Marco clase="on">
              <FotoAlexander />
            </Marco>
            <div>
              <b>
                ALEXANDER URBANEJA<small>(Disponible)</small>
              </b>
              <p>Product Engineer · Full Stack</p>
            </div>
          </div>
          <div className="tbar">
            {ENLACES_CONTACTO.map((e) => (
              <EnlaceContacto key={e.id} enlace={e} className="msn-tool">
                <IconoDeRed id={e.id} />
                {e.etiqueta}
              </EnlaceContacto>
            ))}
          </div>
          <div className="cmain">
            <div className={sobre > 0 ? "convo con-sobre" : "convo"}>
              <div className="log" ref={registro} role="log" aria-live="polite" aria-relevant="additions" aria-label="Conversación">
                {lineas.map((l) =>
                  l.tipo === "mensaje" ? (
                    <div key={l.id}>
                      <div className="who">{l.autor} dice:</div>
                      <div className="msg">{l.texto}</div>
                    </div>
                  ) : l.tipo === "sistema" ? (
                    <div key={l.id} className="sys">
                      {l.texto}
                    </div>
                  ) : (
                    <div key={l.id} className="sys fallo" role="alert">
                      <span>{l.texto}</span>
                      {l.reintento && (
                        <button type="button" className="reintentar" onClick={() => reintentar(l.reintento!, l.id)} disabled={enviando}>
                          REINTENTAR
                        </button>
                      )}
                    </div>
                  ),
                )}
                {escribiendo && (
                  <div className="sys typing">
                    {NOMBRE_ALEXANDER} está escribiendo un mensaje<i>.</i>
                    <i>.</i>
                    <i>.</i>
                  </div>
                )}
              </div>
              <div className={clasesSobre} aria-hidden="true">
                <div className="env">
                  <div className="back" />
                  <div className="paper">
                    <b>PARA: ALEXANDER URBANEJA</b>
                    <span>{textoSobre}</span>
                  </div>
                  <svg className="front" viewBox="0 0 260 170">
                    <path d="M0 0 L130 92 L260 0 V170 H0 Z" fill="#e9dcc2" />
                    <path d="M0 170 L112 80 M260 170 L148 80" stroke="#cdb994" strokeWidth="2" />
                  </svg>
                  <svg className="flap" viewBox="0 0 260 100">
                    <path d="M0 0 H260 L130 96 Z" fill="#dfcfae" stroke="#cdb994" strokeWidth="2" />
                  </svg>
                  <div className="stamp">A.U.</div>
                </div>
              </div>
              <p className="solo-lectores" role="status">
                {enviando ? "Enviando mensaje..." : ""}
              </p>
              <div className="fbar">
                <button type="button" onClick={zumbido}>
                  <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true" focusable="false">
                    <path d="M2 8h3l2-5 2 10 2-5h3" fill="none" stroke="#ff5a1f" strokeWidth="2" />
                  </svg>
                  ZUMBIDO
                </button>
              </div>
              <div className="compose">
                <label htmlFor={idMensaje} className="solo-lectores">
                  Tu mensaje
                </label>
                <textarea
                  id={idMensaje}
                  ref={areaTexto}
                  placeholder="Cuéntame de tu proyecto..."
                  value={texto}
                  maxLength={MENSAJE_MAX}
                  onChange={(e) => {
                    setTexto(e.target.value);
                    if (errorEnvio) setErrorEnvio("");
                  }}
                  onKeyDown={alTeclear}
                  aria-invalid={errorEnvio ? true : undefined}
                  aria-describedby={`${idMensaje}-ayuda`}
                />
                <button type="button" className="go" onClick={enviar} disabled={enviando}>
                  ENVIAR
                </button>
              </div>
              <p className="ayuda" id={`${idMensaje}-ayuda`}>
                <span className="err" role="alert">
                  {errorEnvio}
                </span>
                <span className="cuenta">
                  {largoTexto(texto)}/{MENSAJE_MAX} · Tu correo se usa solo para responderte.
                </span>
              </p>
            </div>
            <div className="side2">
              <Marco clase="on">
                <FotoAlexander />
              </Marco>
              <Marco clase={CLASE_ESTADO[yo.estado]}>
                <Silueta />
              </Marco>
              <small>{yo.correo}</small>
            </div>
          </div>
          <div className="cfoot">
            <span>
              Conectado como <b>{yo.correo}</b> ·{" "}
              <button type="button" className="enlace" onClick={cerrarSesion}>
                Cerrar sesión
              </button>
            </span>
            <span className={avisoEnviado ? "ok show" : "ok"} aria-hidden="true">
              MENSAJE ENVIADO
            </span>
          </div>
        </div>
      )}

      <p className="solo-lectores" role="status">
        {aviso.visible ? `${NOMBRE_ALEXANDER} ${aviso.texto}` : ""}
      </p>
      {createPortal(
        <div className={aviso.visible ? "toast show" : "toast"} aria-hidden="true">
          <Marco clase="on">
            <FotoAlexander />
          </Marco>
          <div>
            <b>ALEXANDER URBANEJA</b>
            <p>{aviso.texto}</p>
          </div>
        </div>,
        document.body,
      )}
    </div>
  );
}
