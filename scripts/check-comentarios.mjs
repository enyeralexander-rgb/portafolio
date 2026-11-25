#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, statSync } from "node:fs";
import { createRequire } from "node:module";
import { basename, extname, join } from "node:path";

const AYUDA = `Uso:
  node scripts/check-comentarios.mjs                 archivos nuevos o modificados respecto de HEAD
  node scripts/check-comentarios.mjs --base <ref>    archivos cambiados respecto de <ref> (por ejemplo main)
  node scripts/check-comentarios.mjs --todos         todos los archivos versionados y no ignorados
  node scripts/check-comentarios.mjs <archivo...>    solo esos archivos
Sale con 1 si encuentra comentarios, 0 si no, 2 si hay un error.
Exclusiones extra: un archivo .comentarios-excluir en la raíz, una ruta o patrón con * por línea.
En .tsx, .jsx y .js usa el TypeScript del proyecto, si está instalado, para no tomar el texto JSX como comentario.`;

const CARPETAS_EXCLUIDAS = new Set([
  "node_modules", ".next", ".nuxt", ".svelte-kit", "dist", "build", "out", "coverage",
  "vendor", ".git", ".turbo", ".vercel", ".pnpm-store", "test-results", "playwright-report",
  "blob-report", "__pycache__", ".venv", "venv", "Pods", ".dart_tool",
]);

const ARCHIVOS_EXCLUIDOS = new Set([
  "pnpm-lock.yaml", "package-lock.json", "yarn.lock", "bun.lockb", "Cargo.lock",
  "poetry.lock", "composer.lock", "Gemfile.lock", "next-env.d.ts",
]);

const EXT_EXCLUIDAS = new Set([
  ".md", ".mdx", ".markdown", ".txt", ".map", ".lock", ".png", ".jpg", ".jpeg", ".gif",
  ".webp", ".avif", ".ico", ".pdf", ".woff", ".woff2", ".ttf", ".otf", ".eot", ".mp4",
  ".mov", ".webm", ".mp3", ".wav", ".zip", ".gz", ".tgz", ".csv", ".snap",
]);

const C = new Set([
  ".js", ".mjs", ".cjs", ".jsx", ".ts", ".mts", ".cts", ".tsx", ".json", ".jsonc", ".json5",
  ".java", ".kt", ".kts", ".swift", ".go", ".rs", ".c", ".h", ".cc", ".cpp", ".hpp", ".cs",
  ".dart", ".scala", ".groovy", ".gradle", ".scss", ".less", ".vue", ".svelte", ".astro",
  ".prisma", ".graphql", ".gql", ".proto",
]);
const SOLO_BLOQUE = new Set([".css"]);
const ALMOHADILLA = new Set([
  ".sh", ".bash", ".zsh", ".fish", ".py", ".rb", ".yml", ".yaml", ".toml", ".ini", ".cfg",
  ".conf", ".r", ".pl", ".ps1", ".tf", ".nix", ".properties",
]);
const ALMOHADILLA_NOMBRES = new Set(["Dockerfile", "Makefile", "Procfile", "Gemfile", "Rakefile", "Brewfile"]);
const SOLO_LINEA_ALMOHADILLA = (n) =>
  n.startsWith(".env") || (n.startsWith(".") && n.endsWith("ignore")) || n === ".editorconfig" ||
  n === ".npmrc" || n === ".nvmrc" || n === "CODEOWNERS" || n === ".gitattributes";
const SQL = new Set([".sql", ".psql"]);
const HTML = new Set([".html", ".htm", ".xml", ".svg", ".xhtml"]);
const CON_HTML = new Set([".vue", ".svelte", ".astro"]);
const PHP = new Set([".php"]);

const CON_JSX = new Set([".tsx", ".jsx", ".js", ".mjs", ".cjs"]);

let ts;
function typescript() {
  if (ts === undefined) {
    try {
      ts = createRequire(join(process.cwd(), "package.json"))("typescript");
    } catch {
      ts = null;
    }
  }
  return ts;
}

function taparTextoJsx(ruta, texto) {
  const t = typescript();
  if (!t) return null;
  const tipo = extname(ruta).toLowerCase() === ".tsx" ? t.ScriptKind.TSX : t.ScriptKind.JSX;
  const archivo = t.createSourceFile(ruta, texto, t.ScriptTarget.Latest, false, tipo);
  const tramos = [];
  const visitar = (nodo) => {
    if (nodo.kind === t.SyntaxKind.JsxText) tramos.push([nodo.pos, nodo.end]);
    t.forEachChild(nodo, visitar);
  };
  visitar(archivo);
  if (!tramos.length) return texto;
  let salida = "";
  let desde = 0;
  for (const [a, b] of tramos) {
    salida += texto.slice(desde, a) + texto.slice(a, b).replace(/[^\n]/g, " ");
    desde = b;
  }
  return salida + texto.slice(desde);
}

const PALABRAS_ANTES_DE_REGEX = new Set([
  "return", "typeof", "instanceof", "case", "do", "else", "in", "of", "new", "delete",
  "void", "throw", "yield", "await",
]);

function tipoDe(ruta) {
  const n = basename(ruta);
  const e = extname(n).toLowerCase();
  if (ARCHIVOS_EXCLUIDOS.has(n) || EXT_EXCLUIDAS.has(e) || n.endsWith(".min.js") || n.endsWith(".min.css")) return null;
  if (SOLO_LINEA_ALMOHADILLA(n)) return "linea#";
  if (ALMOHADILLA_NOMBRES.has(n) || n.startsWith("Dockerfile")) return "#";
  if (C.has(e)) return "c";
  if (SOLO_BLOQUE.has(e)) return "css";
  if (ALMOHADILLA.has(e)) return "#";
  if (SQL.has(e)) return "sql";
  if (HTML.has(e)) return "html";
  if (PHP.has(e)) return "php";
  return null;
}

function hallazgo(lista, texto, inicio, linea) {
  const fin = texto.indexOf("\n", inicio);
  const fragmento = texto.slice(inicio, fin === -1 ? undefined : fin).trim();
  lista.push({ linea, texto: fragmento.length > 90 ? fragmento.slice(0, 87) + "..." : fragmento });
}

function escanearC(texto, { regex = true, lineaDoble = true, plantillas = true, urlEnTexto = false } = {}) {
  const res = [];
  const pila = [];
  let i = 0;
  let linea = 1;
  let previo = "";
  let palabra = "";
  const n = texto.length;
  const avanzar = (c) => { if (c === "\n") linea++; };
  const puedeSerRegex = () => {
    if (!regex) return false;
    if (palabra && PALABRAS_ANTES_DE_REGEX.has(palabra)) return true;
    if (palabra) return false;
    return previo === "" || "(,=:[!&|?{};+-*%<>~^".includes(previo);
  };
  const leerCadena = (cierre) => {
    i++;
    while (i < n && texto[i] !== cierre) {
      if (texto[i] === "\\") { avanzar(texto[i + 1]); i += 2; continue; }
      if (texto[i] === "\n") linea++;
      i++;
    }
    i++;
  };
  const leerPlantilla = () => {
    while (i < n) {
      const c = texto[i];
      if (c === "\\") { avanzar(texto[i + 1]); i += 2; continue; }
      if (c === "`") { i++; return false; }
      if (c === "$" && texto[i + 1] === "{") { i += 2; pila.push("p"); return true; }
      avanzar(c);
      i++;
    }
    return false;
  };
  while (i < n) {
    const c = texto[i];
    const s = texto[i + 1];
    if (c === "/" && s === "/" && lineaDoble) {
      if (urlEnTexto && texto[i - 1] === ":" && /[A-Za-z]/.test(texto[i - 2] || "")) { i += 2; continue; }
      hallazgo(res, texto, i, linea);
      while (i < n && texto[i] !== "\n") i++;
      continue;
    }
    if (c === "/" && s === "*") {
      hallazgo(res, texto, i, linea);
      i += 2;
      while (i < n && !(texto[i] === "*" && texto[i + 1] === "/")) { avanzar(texto[i]); i++; }
      i += 2;
      continue;
    }
    if (c === "'" || c === '"') { leerCadena(c); previo = "a"; palabra = ""; continue; }
    if (c === "`" && plantillas) {
      i++;
      if (!leerPlantilla()) { previo = "a"; palabra = ""; }
      else { previo = "{"; palabra = ""; }
      continue;
    }
    if (c === "/" && puedeSerRegex()) {
      const inicio = i;
      i++;
      let clase = false;
      while (i < n && texto[i] !== "\n") {
        if (texto[i] === "\\") { i += 2; continue; }
        if (texto[i] === "[") clase = true;
        else if (texto[i] === "]") clase = false;
        else if (texto[i] === "/" && !clase) break;
        i++;
      }
      if (i >= n || texto[i] !== "/") {
        i = inicio + 1;
        previo = "/";
        palabra = "";
        continue;
      }
      i++;
      while (i < n && /[a-z]/i.test(texto[i])) i++;
      previo = "a";
      palabra = "";
      continue;
    }
    if (c === "{") { pila.push("b"); }
    if (c === "}") {
      const tope = pila.pop();
      if (tope === "p") {
        i++;
        if (!leerPlantilla()) { previo = "a"; palabra = ""; }
        continue;
      }
    }
    if (/\s/.test(c)) { avanzar(c); i++; continue; }
    if (/[A-Za-z0-9_$]/.test(c)) {
      let j = i;
      while (j < n && /[A-Za-z0-9_$]/.test(texto[j])) j++;
      palabra = texto.slice(i, j);
      previo = "a";
      i = j;
      continue;
    }
    previo = c;
    palabra = "";
    i++;
  }
  return res;
}

function escanearAlmohadilla(texto, soloLinea, conBloquesC = false) {
  const res = [];
  const lineas = texto.split("\n");
  for (let k = 0; k < lineas.length; k++) {
    const l = lineas[k];
    if (k === 0 && l.startsWith("#!")) continue;
    if (soloLinea) {
      if (/^\s*#/.test(l)) res.push({ linea: k + 1, texto: l.trim().slice(0, 90) });
      continue;
    }
    let comilla = "";
    for (let j = 0; j < l.length; j++) {
      const c = l[j];
      if (comilla) {
        if (c === "\\" && comilla === '"') { j++; continue; }
        if (c === comilla) comilla = "";
        continue;
      }
      if (c === "'" || c === '"') { comilla = c; continue; }
      if (c === "\\") { j++; continue; }
      if (c === "#" && (j === 0 || /\s/.test(l[j - 1]))) {
        res.push({ linea: k + 1, texto: l.slice(j).trim().slice(0, 90) });
        break;
      }
    }
  }
  return conBloquesC ? res.concat(escanearC(texto, { regex: false, plantillas: false })) : res;
}

function escanearSql(texto) {
  const res = [];
  let i = 0;
  let linea = 1;
  const n = texto.length;
  while (i < n) {
    const c = texto[i];
    if (c === "\n") { linea++; i++; continue; }
    if (c === "'" || c === '"') {
      const cierre = c;
      i++;
      while (i < n) {
        if (texto[i] === cierre && texto[i + 1] === cierre) { i += 2; continue; }
        if (texto[i] === cierre) break;
        if (texto[i] === "\n") linea++;
        i++;
      }
      i++;
      continue;
    }
    if (c === "$") {
      const m = /^\$[A-Za-z_]*\$/.exec(texto.slice(i, i + 64));
      if (m) {
        const fin = texto.indexOf(m[0], i + m[0].length);
        const hasta = fin === -1 ? n : fin + m[0].length;
        for (let j = i; j < hasta; j++) if (texto[j] === "\n") linea++;
        i = hasta;
        continue;
      }
    }
    if (c === "-" && texto[i + 1] === "-") {
      const fin = texto.indexOf("\n", i);
      const contenido = texto.slice(i, fin === -1 ? n : fin).trim();
      if (contenido !== "--> statement-breakpoint") hallazgo(res, texto, i, linea);
      i = fin === -1 ? n : fin;
      continue;
    }
    if (c === "/" && texto[i + 1] === "*") {
      hallazgo(res, texto, i, linea);
      i += 2;
      while (i < n && !(texto[i] === "*" && texto[i + 1] === "/")) { if (texto[i] === "\n") linea++; i++; }
      i += 2;
      continue;
    }
    i++;
  }
  return res;
}

function escanearHtml(texto) {
  const res = [];
  const re = /<!--/g;
  let m;
  while ((m = re.exec(texto))) {
    const linea = texto.slice(0, m.index).split("\n").length;
    hallazgo(res, texto, m.index, linea);
  }
  return res;
}

function escanear(ruta, texto) {
  const tipo = tipoDe(ruta);
  const e = extname(ruta).toLowerCase();
  if (tipo === "c") {
    const json = e === ".json";
    const css = e === ".scss" || e === ".less";
    let fuente = texto;
    let urlEnTexto = false;
    if (CON_JSX.has(e)) {
      const tapado = taparTextoJsx(ruta, texto);
      if (tapado === null) urlEnTexto = true;
      else fuente = tapado;
    }
    let r = escanearC(fuente, { regex: !json && !css, plantillas: !json && !css, urlEnTexto });
    if (CON_HTML.has(e)) r = r.concat(escanearHtml(texto));
    return r;
  }
  if (tipo === "css") return escanearC(texto, { regex: false, lineaDoble: false, plantillas: false });
  if (tipo === "#") return escanearAlmohadilla(texto, false);
  if (tipo === "linea#") return escanearAlmohadilla(texto, true);
  if (tipo === "sql") return escanearSql(texto);
  if (tipo === "html") return escanearHtml(texto);
  if (tipo === "php") return escanearAlmohadilla(texto, false, true).concat(escanearHtml(texto));
  return [];
}

function git(args) {
  return execFileSync("git", args, { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] })
    .split("\n").map((s) => s.trim()).filter(Boolean);
}

function patronesExtra() {
  if (!existsSync(".comentarios-excluir")) return [];
  return readFileSync(".comentarios-excluir", "utf8").split("\n").map((s) => s.trim()).filter(Boolean)
    .map((p) => new RegExp("^" + p.replace(/[.+?^${}()|[\]\\]/g, "\\$&").replace(/\*/g, ".*") + "(/.*)?$"));
}

function excluida(ruta, extra) {
  const partes = ruta.split("/");
  if (partes.slice(0, -1).some((p) => CARPETAS_EXCLUIDAS.has(p))) return true;
  return extra.some((re) => re.test(ruta));
}

function archivosPedidos(argv) {
  if (argv.includes("--todos")) return git(["ls-files", "--cached", "--others", "--exclude-standard"]);
  const b = argv.indexOf("--base");
  if (b !== -1) {
    const ref = argv[b + 1];
    if (!ref) throw new Error("Falta la referencia después de --base.");
    return [...new Set([
      ...git(["diff", "--name-only", "--diff-filter=ACMR", `${ref}...HEAD`]),
      ...git(["diff", "--name-only", "--diff-filter=ACMR", "HEAD"]),
      ...git(["ls-files", "--others", "--exclude-standard"]),
    ])];
  }
  const sueltos = argv.filter((a) => !a.startsWith("--"));
  if (sueltos.length) return sueltos;
  let cambiados;
  try {
    cambiados = git(["diff", "--name-only", "--diff-filter=ACMR", "HEAD"]);
  } catch {
    return git(["ls-files", "--cached", "--others", "--exclude-standard"]);
  }
  return [...new Set([...cambiados, ...git(["ls-files", "--others", "--exclude-standard"])])];
}

function main() {
  const argv = process.argv.slice(2);
  if (argv.includes("--ayuda") || argv.includes("-h") || argv.includes("--help")) {
    console.log(AYUDA);
    return 0;
  }
  const extra = patronesExtra();
  const archivos = archivosPedidos(argv).filter((r) => existsSync(r) && statSync(r).isFile() && !excluida(r, extra) && tipoDe(r));
  let total = 0;
  let conHallazgos = 0;
  for (const ruta of archivos) {
    const texto = readFileSync(ruta, "utf8");
    if (texto.includes("\u0000")) continue;
    const r = escanear(ruta, texto);
    if (!r.length) continue;
    conHallazgos++;
    total += r.length;
    for (const h of r) console.log(`${ruta}:${h.linea}: ${h.texto}`);
  }
  if (total) {
    console.log(`\n${total} comentario(s) en ${conHallazgos} archivo(s). Regla: cero comentarios en el código; quítalos en este mismo cambio.`);
    return 1;
  }
  console.log(`Sin comentarios en ${archivos.length} archivo(s) revisado(s).`);
  return 0;
}

try {
  process.exitCode = main();
} catch (e) {
  console.error("check-comentarios: " + (e && e.message ? e.message : String(e)));
  process.exitCode = 2;
}
