import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { AVISO_NUEVA_PESTANA, SIMPLE, SITIO } from "@/data/contenido";
import { EtiquetaPartida } from "@/componentes/etiqueta-partida";
import { IconoPdf } from "@/componentes/iconos";
import { RESUMEN_SIMPLE, seccionesSimple, type EnlaceSimple } from "@/lib/simple";

export const metadata: Metadata = {
  title: SIMPLE.titulo,
  description: SIMPLE.descripcion,
  alternates: process.env.SITE_URL ? { canonical: "/simple" } : undefined,
  openGraph: { title: SIMPLE.titulo, description: SIMPLE.descripcion, url: "/simple" },
};

function Enlace({ enlace, className }: { enlace: EnlaceSimple; className?: string }) {
  if (!enlace.nuevaPestana) {
    return (
      <Link className={className} href={enlace.href}>
        <EtiquetaPartida texto={enlace.etiqueta} />
      </Link>
    );
  }
  return (
    <a
      className={className}
      href={enlace.href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`${enlace.etiqueta}, ${AVISO_NUEVA_PESTANA}`}
    >
      <EtiquetaPartida texto={enlace.etiqueta} />
    </a>
  );
}

export default function Simple() {
  const s = seccionesSimple();

  return (
    <div className="simple">
      <nav className="simple-arriba">
        <Link className="simple-enlace" href="/">
          {SIMPLE.verEscritorio}
        </Link>
      </nav>
      <main className="simple-main">
        <header className="simple-cabecera">
          <h1 className="simple-nombre">
            {SITIO.nombre.nombre} <span>{SITIO.nombre.apellido}</span>
          </h1>
          <p className="rol">{SITIO.rol}</p>
          <p className="simple-resumen">{RESUMEN_SIMPLE}</p>
        </header>

        <section aria-labelledby="simple-marcas">
          <h2 id="simple-marcas">{s.marcas.titulo}</h2>
          <ul className="simple-lista">
            {s.marcas.elementos.map((m) => (
              <li key={m.id}>
                <b>{m.nombre}</b>
                <p>{m.descripcion}</p>
                <Enlace enlace={m.enlace} className="simple-enlace" />
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="simple-juegos">
          <h2 id="simple-juegos">{s.juegos.titulo}</h2>
          <p className="simple-nota">{s.juegos.aviso}</p>
          <ul className="files apps">
            {s.juegos.elementos.map((j) => (
              <li key={j.id}>
                <a className="file app-cuadro" href={j.enlace.href} aria-label={`${j.enlace.etiqueta}, ${j.marca}`}>
                  <Image src={j.icono} alt="" width={56} height={56} unoptimized draggable={false} />
                  <span>{j.titulo}</span>
                  <small>{j.marca}</small>
                </a>
              </li>
            ))}
          </ul>
        </section>

        {s.video.elementos.length > 0 && (
          <section aria-labelledby="simple-video">
            <h2 id="simple-video">{s.video.titulo}</h2>
            <ul className="simple-lista">
              {s.video.elementos.map((v) => (
                <li key={v.id}>
                  <p>{v.descripcion}</p>
                  <Enlace enlace={v.enlace} className="simple-enlace" />
                </li>
              ))}
            </ul>
          </section>
        )}

        <section aria-labelledby="simple-cv">
          <h2 id="simple-cv">{s.cv.titulo}</h2>
          <p>{s.cv.descripcion}</p>
          <ul className="files">
            {s.cv.enlaces.map((e) => (
              <li key={e.href}>
                <a
                  className="file"
                  href={e.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${e.etiqueta}, ${AVISO_NUEVA_PESTANA}`}
                >
                  <IconoPdf />
                  <span>{e.etiqueta}</span>
                </a>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="simple-servicios">
          <h2 id="simple-servicios">{s.servicios.titulo}</h2>
          <ul className="nota-lista">
            {s.servicios.lineas.map((linea) => (
              <li key={linea}>{linea}</li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="simple-contacto">
          <h2 id="simple-contacto">{s.contacto.titulo}</h2>
          <ul className="simple-enlaces">
            {s.contacto.enlaces.map((e) => (
              <li key={e.href}>
                <Enlace enlace={e} className="simple-enlace" />
              </li>
            ))}
          </ul>
        </section>
      </main>
    </div>
  );
}
