import { describe, expect, it } from "vitest";
import { debeCopiarse, limpiarRutasLocales } from "../../scripts/copiar-minijuegos.mjs";

describe("limpiarRutasLocales", () => {
  it("deja solo el nombre final de cada ruta local absoluta", () => {
    expect(limpiarRutasLocales("entregadas por el propietario (`/Users/alexander/Downloads/CHANGAN/image1–5.jpeg`) y recortadas")).toBe(
      "entregadas por el propietario (`image1–5.jpeg`) y recortadas",
    );
    expect(limpiarRutasLocales("`Logo Baby Finger - Pantone_Carpeta/` de `/Users/alexander/Downloads/PRODUCTOS BABY FINGER/`, reducido")).toBe(
      "`Logo Baby Finger - Pantone_Carpeta/` de `PRODUCTOS BABY FINGER`, reducido",
    );
    expect(limpiarRutasLocales("desde /Volumes/DATOS/fotos/logo.png y ~/Descargas/sonido.mp3.")).toBe(
      "desde logo.png y sonido.mp3.",
    );
  });

  it("no toca el resto del texto ni las rutas relativas o de internet", () => {
    const texto = "SIL Open Font License 1.1 · `packages/game-core/assets/fonts/` · https://github.com/google/fonts/blob/main/ofl/cinzel/OFL.txt";
    expect(limpiarRutasLocales(texto)).toBe(texto);
  });
});

describe("debeCopiarse", () => {
  it("deja fuera .DS_Store y webview-viejo.html", () => {
    expect(debeCopiarse("/a/dist-apk/.DS_Store")).toBe(false);
    expect(debeCopiarse("/a/dist-apk/webview-viejo.html")).toBe(false);
    expect(debeCopiarse("/a/dist-apk/index.html")).toBe(true);
    expect(debeCopiarse("/a/dist-apk/img/carta-1.png")).toBe(true);
  });
});
