const OCULTO = { "aria-hidden": true, focusable: false } as const;

export function IconoCarpeta() {
  return (
    <svg viewBox="0 0 92 74" {...OCULTO}>
      <path
        d="M4 12 Q4 5 11 5 H34 L42 12 H81 Q88 12 88 19 V64 Q88 70 81 70 H11 Q4 70 4 64 Z"
        style={{ fill: "var(--f-tab)" }}
      />
      <path
        d="M4 22 Q4 16 10 16 H82 Q88 16 88 22 V63 Q88 70 81 70 H11 Q4 70 4 63 Z"
        style={{ fill: "var(--f-front)" }}
      />
      <path d="M10 20 H82" strokeWidth="3" strokeLinecap="round" style={{ stroke: "var(--f-hi)" }} />
    </svg>
  );
}

export function IconoTexto() {
  return (
    <svg viewBox="0 0 56 56" {...OCULTO}>
      <path d="M12 4h22l12 12v36H12z" fill="#fff" stroke="#c9bfae" strokeWidth="2" />
      <g stroke="#b3a993" strokeWidth="2.4" strokeLinecap="round">
        <path d="M18 24h20M18 31h20M18 38h14" />
      </g>
    </svg>
  );
}

export function IconoPdf() {
  return (
    <svg viewBox="0 0 56 56" {...OCULTO}>
      <path d="M12 4h22l12 12v36H12z" fill="#fff" stroke="#c9bfae" strokeWidth="2" />
      <path d="M34 4v12h12" fill="#eee5d4" stroke="#c9bfae" strokeWidth="2" />
      <rect x="16" y="34" width="26" height="12" rx="3" fill="#ff5f57" />
      <text x="29" y="43.5" textAnchor="middle" fontSize="9" fontFamily="Space Mono, monospace" fontWeight="700" fill="#fff">
        PDF
      </text>
    </svg>
  );
}

export function IconoVideo() {
  return (
    <svg viewBox="0 0 56 56" {...OCULTO}>
      <rect x="6" y="10" width="44" height="36" rx="6" fill="#1d1a17" />
      <path d="M23 19 L37 28 L23 37 Z" fill="#ff5a1f" />
    </svg>
  );
}

export function Munequitos({
  frente = "#ff5a1f",
  fondo = "#1f6f78",
  animado = false,
}: {
  frente?: string;
  fondo?: string;
  animado?: boolean;
}) {
  return (
    <svg viewBox="0 0 40 40" {...OCULTO}>
      <g className={animado ? "brinca b2" : undefined}>
        <circle cx="25" cy="11" r="6" fill={fondo} />
        <path d="M15 31 q10 -15 20 0 v3 h-20z" fill={fondo} />
      </g>
      <g className={animado ? "brinca b1" : undefined}>
        <circle cx="16" cy="15" r="6.8" fill={frente} />
        <path d="M4.5 36 q11.5 -16 23 0 v2 h-23z" fill={frente} />
      </g>
    </svg>
  );
}

export function IconoPapelera() {
  return (
    <svg viewBox="0 0 40 40" {...OCULTO}>
      <path d="M10 12h20l-2 22H12z" fill="none" stroke="#1d1a17" strokeWidth="2.4" />
      <path d="M8 12h24M16 8h8" stroke="#1d1a17" strokeWidth="2.4" strokeLinecap="round" />
      <path d="M16 17v12M20 17v12M24 17v12" stroke="#1d1a17" strokeWidth="1.6" />
    </svg>
  );
}

export function IconoWeb() {
  return (
    <svg viewBox="0 0 56 56" {...OCULTO}>
      <circle cx="28" cy="28" r="22" fill="#2f6bff" />
      <g fill="none" stroke="#fff" strokeWidth="2.4">
        <ellipse cx="28" cy="28" rx="9" ry="22" />
        <path d="M6 28h44M10 17h36M10 39h36" />
      </g>
    </svg>
  );
}

export function IconoJuego() {
  return (
    <svg viewBox="0 0 56 56" {...OCULTO}>
      <rect x="6" y="14" width="44" height="28" rx="14" fill="#1d1a17" />
      <path d="M17 24v8M13 28h8" stroke="#f2e8d5" strokeWidth="3" strokeLinecap="round" />
      <circle cx="36" cy="25" r="3" fill="#ff5a1f" />
      <circle cx="42" cy="31" r="3" style={{ fill: "var(--f-front)" }} />
    </svg>
  );
}

export function IconoBehance() {
  return (
    <svg viewBox="0 0 24 24" {...OCULTO}>
      <rect x="3" y="3" width="18" height="18" rx="3" fill="#1d1a17" />
      <text
        x="12"
        y="16.5"
        textAnchor="middle"
        fontFamily="Arial Black, Arial"
        fontWeight="900"
        fontSize="9.5"
        fill="#fff"
      >
        Bē
      </text>
    </svg>
  );
}

export function IconoGithub() {
  return (
    <svg viewBox="0 0 24 24" {...OCULTO}>
      <circle cx="12" cy="12" r="9.5" fill="#1d1a17" />
      <path
        d="M9 18.5v-2.2c-2.4.5-2.8-1-2.8-1-.4-1-.9-1.2-.9-1.2-.8-.5.1-.5.1-.5.9.1 1.3.9 1.3.9.8 1.3 2 .9 2.4.7.1-.6.3-.9.6-1.1-2-.2-3.9-1-3.9-4.2 0-.9.3-1.7.9-2.3-.1-.2-.4-1.1.1-2.3 0 0 .7-.2 2.4.9a8 8 0 0 1 4.3 0c1.7-1.1 2.4-.9 2.4-.9.5 1.2.2 2.1.1 2.3.6.6.9 1.4.9 2.3 0 3.2-2 4-3.9 4.2.3.3.6.8.6 1.6v2.6"
        fill="#fff"
      />
    </svg>
  );
}

export function IconoLinkedin() {
  return (
    <svg viewBox="0 0 24 24" {...OCULTO}>
      <rect x="3" y="3" width="18" height="18" rx="3" fill="#1d1a17" />
      <rect x="6.6" y="10" width="2.4" height="7.4" fill="#fff" />
      <circle cx="7.8" cy="7.4" r="1.45" fill="#fff" />
      <path d="M11 10h2.3v1.1c.4-.7 1.3-1.3 2.6-1.3 2.2 0 2.7 1.4 2.7 3.3v4.3h-2.4v-3.8c0-.9-.1-1.9-1.3-1.9s-1.5.9-1.5 1.9v3.8H11z" fill="#fff" />
    </svg>
  );
}

export function IconoCorreo() {
  return (
    <svg viewBox="0 0 24 24" {...OCULTO}>
      <rect x="3" y="5.5" width="18" height="13" rx="2" fill="#1d1a17" />
      <path d="M5 8l7 5 7-5" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinejoin="round" />
    </svg>
  );
}

export function IconoLateral({ tipo }: { tipo: "escritorio" | "proyectos" | "audiovisual" | "juegos" }) {
  if (tipo === "escritorio") {
    return (
      <svg viewBox="0 0 16 16" {...OCULTO}>
        <rect x="1.5" y="2.5" width="13" height="9" rx="1.5" fill="none" stroke="#1d1a17" strokeWidth="1.4" />
        <path d="M5 14h6" stroke="#1d1a17" strokeWidth="1.4" />
      </svg>
    );
  }
  if (tipo === "juegos") {
    return (
      <svg viewBox="0 0 16 16" {...OCULTO}>
        <rect x="1.5" y="4" width="13" height="8" rx="4" fill="#1d1a17" />
        <path d="M5 6.5v3M3.5 8h3" stroke="#f2e8d5" strokeWidth="1.2" strokeLinecap="round" />
        <circle cx="11" cy="8" r="1.2" fill="#ff5a1f" />
      </svg>
    );
  }
  if (tipo === "proyectos") {
    return (
      <svg viewBox="0 0 16 16" {...OCULTO}>
        <path d="M1.5 4.5v8h13v-7H7.5l-1.5-1.5h-4z" style={{ fill: "var(--f-front)" }} />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 16 16" {...OCULTO}>
      <rect x="1.5" y="3" width="13" height="10" rx="2" fill="#1d1a17" />
      <path d="M6.5 5.5l4 2.5-4 2.5z" fill="#ff5a1f" />
    </svg>
  );
}
