import { ImageResponse } from "next/og";
import { SITIO } from "@/data/contenido";

export const alt = SITIO.titulo;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const STACK = "Next.js · React · TypeScript · Node.js · PostgreSQL";

export default function ImagenParaCompartir() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "72px 88px",
          background: "#1d1a17",
          color: "#f4ecdc",
        }}
      >
        <div style={{ display: "flex", fontSize: 30, letterSpacing: 6, color: "#ff5a1f" }}>PORTAFOLIO</div>
        <div style={{ display: "flex", flexDirection: "column", marginTop: 18, fontSize: 118, fontWeight: 800, lineHeight: 0.95 }}>
          <span>{SITIO.nombre.nombre.toUpperCase()}</span>
          <span style={{ color: "#ff5a1f" }}>{SITIO.nombre.apellido.toUpperCase()}</span>
        </div>
        <div style={{ display: "flex", marginTop: 36, fontSize: 40, fontWeight: 700 }}>{SITIO.rol}</div>
        <div style={{ display: "flex", marginTop: 14, fontSize: 30, color: "#c9bfae" }}>{STACK}</div>
      </div>
    ),
    size,
  );
}
