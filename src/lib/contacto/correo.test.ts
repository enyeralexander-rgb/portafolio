import { describe, expect, it } from "vitest";
import {
  ESPERA_SMTP_MS,
  configSmtp,
  construirCorreo,
  escaparHtml,
  limpiarClaveSmtp,
  resumirError,
  sanearCabecera,
} from "./correo";

const FECHA = new Date("2026-11-02T15:30:00Z");
const entrada = {
  remitente: "alexander@gmail.com",
  destino: "alexander@gmail.com",
  correoVisitante: "visitante@ejemplo.com",
  estado: "ocupado" as const,
  mensaje: "Hola\nquiero una web",
  fecha: FECHA,
};

describe("sanearCabecera", () => {
  it("quita saltos de línea y caracteres de control", () => {
    expect(sanearCabecera("a@b.com\r\nBcc: otro@x.com")).toBe("a@b.com Bcc: otro@x.com");
    expect(sanearCabecera("hola\u0000\u001bmundo\u2028fin")).toBe("hola mundo fin");
    expect(sanearCabecera("  normal  ")).toBe("normal");
  });
});

describe("escaparHtml", () => {
  it("escapa lo que podría ser código", () => {
    expect(escaparHtml(`<img src=x onerror="alert('1')">&`)).toBe(
      "&lt;img src=x onerror=&quot;alert(&#39;1&#39;)&quot;&gt;&amp;",
    );
  });
});

describe("limpiarClaveSmtp", () => {
  it("quita todos los espacios de la contraseña de aplicación", () => {
    expect(limpiarClaveSmtp("abcd efgh ijkl mnop")).toBe("abcdefghijklmnop");
    expect(limpiarClaveSmtp(" abcd\tefgh\nijkl  mnop ")).toBe("abcdefghijklmnop");
  });
});

describe("configSmtp", () => {
  const e = { host: "smtp.gmail.com", usuario: "alexander@gmail.com", clave: "abcd efgh ijkl mnop" };

  it("con el puerto 465 va cifrado desde el inicio", () => {
    const c = configSmtp({ ...e, puerto: 465 });
    expect(c.secure).toBe(true);
    expect(c.requireTLS).toBe(false);
    expect(c.auth).toEqual({ user: "alexander@gmail.com", pass: "abcdefghijklmnop" });
  });

  it("con el 587 usa STARTTLS y exige cifrado", () => {
    const c = configSmtp({ ...e, puerto: 587 });
    expect(c.secure).toBe(false);
    expect(c.requireTLS).toBe(true);
    expect(c.port).toBe(587);
  });

  it("las esperas son cortas (8 s como máximo)", () => {
    const c = configSmtp({ ...e, puerto: 465 });
    expect(ESPERA_SMTP_MS).toBeLessThanOrEqual(8_000);
    expect([c.connectionTimeout, c.greetingTimeout, c.socketTimeout]).toEqual([ESPERA_SMTP_MS, ESPERA_SMTP_MS, ESPERA_SMTP_MS]);
  });
});

describe("construirCorreo", () => {
  it("lleva remitente A.U. Messenger, destino, respuesta al visitante y su correo en el asunto", () => {
    const c = construirCorreo(entrada);
    expect(c.from).toEqual({ name: "A.U. Messenger", address: "alexander@gmail.com" });
    expect(c.to).toBe("alexander@gmail.com");
    expect(c.replyTo).toBe("visitante@ejemplo.com");
    expect(c.subject).toContain("visitante@ejemplo.com");
  });

  it("el texto plano trae el mensaje tal cual, con su estado y la hora de Caracas", () => {
    const c = construirCorreo(entrada);
    expect(c.text).toContain("Hola\nquiero una web");
    expect(c.text).toContain("Estado: Ocupado");
    expect(c.text).toContain("hora de Caracas");
  });

  it("el HTML escapa el mensaje y el correo del visitante", () => {
    const c = construirCorreo({
      ...entrada,
      correoVisitante: "a<b>@ejemplo.com",
      mensaje: `<script>alert("x")</script> & <b>negrita</b>`,
    });
    expect(c.html).not.toContain("<script>");
    expect(c.html).not.toContain("<b>negrita</b>");
    expect(c.html).toContain("&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt; &amp; &lt;b&gt;negrita&lt;/b&gt;");
    expect(c.html).toContain("a&lt;b&gt;@ejemplo.com");
  });

  it("ninguna cabecera lleva saltos de línea aunque el dato venga con ellos", () => {
    const c = construirCorreo({
      ...entrada,
      correoVisitante: "x@ejemplo.com\r\nBcc: robo@ejemplo.com",
      remitente: "yo@gmail.com\nBcc: otro@ejemplo.com",
      destino: "destino@gmail.com\r\nCc: otro@ejemplo.com",
    });
    for (const valor of [c.from.address, c.to, c.replyTo, c.subject]) {
      expect(valor).not.toMatch(/[\r\n]/);
    }
  });

  it("sin estado dice 'Sin indicar'", () => {
    expect(construirCorreo({ ...entrada, estado: null }).text).toContain("Estado: Sin indicar");
  });
});

describe("resumirError", () => {
  it("deja el código y el mensaje, sin saltos de línea y con un largo máximo", () => {
    const e = Object.assign(new Error("Connection timeout\r\nmás detalles"), { code: "ETIMEDOUT" });
    expect(resumirError(e)).toBe("ETIMEDOUT: Connection timeout más detalles");
    expect(resumirError(new Error("x".repeat(500))).length).toBeLessThanOrEqual(200);
    expect(resumirError("texto suelto")).toBe("texto suelto");
    expect(resumirError(undefined)).toBe("error desconocido");
  });

  it("nunca deja escritos los secretos", () => {
    const clave = "abcdefghijklmnop";
    const resumen = resumirError(new Error(`Invalid login: 535 user alexander@gmail.com pass ${clave} rechazada`), [clave, "ab"]);
    expect(resumen).not.toContain(clave);
    expect(resumen).toContain("***");
  });
});
