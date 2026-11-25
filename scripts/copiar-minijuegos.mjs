#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { cpSync, existsSync, mkdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { basename, join, resolve } from "node:path";
import { pathToFileURL } from "node:url";

const raiz = resolve(import.meta.dirname, "..");
const destino = join(raiz, "public", "minijuegos");
const ruletas = process.env.RULETAS_DIR ?? resolve(raiz, "..", "RULETAS PARA PANTALLAS");
const babyFinger = process.env.MINIJUEGOS_DIR ?? join(homedir(), "AndroidStudioProjects", "MINIJUEGOS");

const iconoAndroid = (app) => `apps/${app}/android/app/src/main/res/mipmap-xxxhdpi/ic_launcher.png`;
const ICONO_BABY_FINGER = "marcas/baby-finger/src/main/res/mipmap-xxxhdpi/icono.png";

const WEB = [
  { id: "memoria-celestial", app: "memoria-celestial", seccion: "## Memoria Celestial (gaitas, Sal Celestial)", ofl: ["OFL-archivo.txt"], icono: iconoAndroid("memoria-celestial-android") },
  { id: "ruleta-celestial", app: "ruleta-celestial", seccion: "## Ruleta Celestial · La Copa (Sal Celestial)", ofl: ["OFL-cinzel.txt"], icono: iconoAndroid("ruleta-celestial-android") },
  { id: "memoria-changan", app: "memoria-changan", seccion: "## Memoria CHANGAN (APK)", ofl: [], icono: iconoAndroid("memoria-android") },
];

const MAQUETAS = [
  { id: "sopa-baby-finger", maqueta: "sopa-de-letras" },
  { id: "memoria-baby-finger", maqueta: "memoria" },
  { id: "rompecabezas-baby-finger", maqueta: "rompecabezas" },
];

const RUTA_LOCAL = String.raw`(?:/Users/|/Volumes/|~/)`;
const OMITIDOS = new Set([".DS_Store", "webview-viejo.html"]);

function nombreFinal(ruta) {
  const partes = ruta.replace(/\/+$/, "").split("/");
  return partes[partes.length - 1];
}

export function limpiarRutasLocales(texto) {
  return texto
    .replace(new RegExp("`(" + RUTA_LOCAL + "[^`\\n]*)`", "g"), (_, ruta) => "`" + nombreFinal(ruta) + "`")
    .replace(new RegExp("(?<![\\w`/:])" + RUTA_LOCAL + "[^\\s`)|,;]*", "g"), (ruta) => nombreFinal(ruta.replace(/\.$/, "")) + (ruta.endsWith(".") ? "." : ""));
}

export function debeCopiarse(ruta) {
  return !OMITIDOS.has(basename(ruta));
}

function git(repo, args) {
  return execFileSync("git", ["-C", repo, ...args], { encoding: "utf8" }).trim();
}

function exigirLimpio(repo, ruta) {
  const cambios = git(repo, ["status", "--porcelain", "--", ruta]);
  if (cambios) throw new Error(`${basename(repo)}: hay cambios sin commit en ${ruta}`);
}

function exigir(archivo) {
  if (!existsSync(archivo)) throw new Error(`Falta ${archivo}`);
  return archivo;
}

function seccion(texto, titulo) {
  const inicio = texto.indexOf(`${titulo}\n`);
  if (inicio === -1) throw new Error(`No está la sección «${titulo}» en CREDITS.md`);
  const fin = texto.indexOf("\n## ", inicio + titulo.length);
  return texto.slice(inicio, fin === -1 ? undefined : fin).trim();
}

function copiarCarpeta(origen, salida) {
  cpSync(origen, salida, { recursive: true, filter: debeCopiarse });
}

function pesoDe(ruta) {
  const s = statSync(ruta);
  if (!s.isDirectory()) return s.size;
  return execFileSync("find", [ruta, "-type", "f"], { encoding: "utf8" })
    .split("\n")
    .filter(Boolean)
    .reduce((t, f) => t + statSync(f).size, 0);
}

function copiarIcono(repo, ruta, salida) {
  exigirLimpio(repo, ruta);
  const archivo = join(salida, "icono.png");
  cpSync(exigir(join(repo, ruta)), archivo);
  return { ruta, ultimoCambio: git(repo, ["log", "-1", "--format=%H", "--", ruta]), bytes: statSync(archivo).size };
}

function copiarTodo() {
  const origen = {};
  const commitRuletas = git(ruletas, ["rev-parse", "HEAD"]);
  const commitBabyFinger = git(babyFinger, ["rev-parse", "HEAD"]);
  const creditos = readFileSync(exigir(join(ruletas, "CREDITS.md")), "utf8");

  rmSync(destino, { recursive: true, force: true });
  mkdirSync(destino, { recursive: true });

  for (const j of WEB) {
    const carpetaApp = join("apps", j.app);
    exigirLimpio(ruletas, carpetaApp);
    const salida = join(destino, j.id);
    exigir(join(ruletas, carpetaApp, "dist-apk", "index.html"));
    copiarCarpeta(join(ruletas, carpetaApp, "dist-apk"), salida);
    cpSync(exigir(join(ruletas, carpetaApp, "FONT-LICENSE.txt")), join(salida, "FONT-LICENSE.txt"));
    for (const ofl of j.ofl) {
      cpSync(exigir(join(ruletas, "packages", "game-core", "assets", "fonts", ofl)), join(salida, ofl));
    }
    writeFileSync(
      join(salida, "CREDITOS.md"),
      `# Créditos\n\nCopia de la sección «${j.seccion.slice(3)}» de \`CREDITS.md\` del repositorio RULETAS PARA PANTALLAS (commit \`${commitRuletas}\`).\n\n${limpiarRutasLocales(seccion(creditos, j.seccion))}\n`,
    );
    origen[j.id] = {
      repositorio: "RULETAS PARA PANTALLAS",
      ruta: `${carpetaApp}/dist-apk`,
      commit: commitRuletas,
      generado: `pnpm --filter @minijuegos/${j.app} build:apk`,
      bytes: pesoDe(salida),
      icono: copiarIcono(ruletas, j.icono, salida),
    };
  }

  for (const j of MAQUETAS) {
    const carpeta = join("docs", "maquetas", j.maqueta);
    exigirLimpio(babyFinger, carpeta);
    const salida = join(destino, j.id);
    mkdirSync(salida, { recursive: true });
    cpSync(exigir(join(babyFinger, carpeta, `${j.maqueta}-compartible.html`)), join(salida, "index.html"));
    writeFileSync(join(salida, "CREDITOS.md"), limpiarRutasLocales(readFileSync(exigir(join(babyFinger, carpeta, "CREDITOS.md")), "utf8")));
    cpSync(exigir(join(babyFinger, carpeta, "fuentes", "OFL-Fredoka.txt")), join(salida, "OFL-Fredoka.txt"));
    origen[j.id] = {
      repositorio: "MINIJUEGOS",
      ruta: `${carpeta}/${j.maqueta}-compartible.html`,
      commit: commitBabyFinger,
      ultimoCambio: git(babyFinger, ["log", "-1", "--format=%H", "--", carpeta]),
      bytes: pesoDe(salida),
      icono: copiarIcono(babyFinger, ICONO_BABY_FINGER, salida),
    };
  }

  writeFileSync(join(destino, "ORIGEN.json"), `${JSON.stringify(origen, null, 2)}\n`);
  const total = Object.values(origen).reduce((t, o) => t + o.bytes, 0);
  for (const [id, o] of Object.entries(origen)) console.log(`${id.padEnd(26)} ${(o.bytes / 1048576).toFixed(2)} MB`);
  console.log(`${"total".padEnd(26)} ${(total / 1048576).toFixed(2)} MB`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) copiarTodo();
