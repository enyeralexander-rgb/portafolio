import { createHmac } from "node:crypto";

export const IP_DESCONOCIDA = "desconocida";

interface Encabezados {
  get(nombre: string): string | null;
}

const PATRON_IPV4 = /^(?:(?:25[0-5]|2[0-4]\d|1?\d?\d)\.){3}(?:25[0-5]|2[0-4]\d|1?\d?\d)$/;

function expandirIpv6(ip: string): number[] | null {
  let texto = ip.split("%")[0]!.toLowerCase();
  const ultimoDosPuntos = texto.lastIndexOf(":");
  const cola = texto.slice(ultimoDosPuntos + 1);
  if (cola.includes(".")) {
    if (!PATRON_IPV4.test(cola)) return null;
    const [a, b, c, d] = cola.split(".").map(Number) as [number, number, number, number];
    texto = `${texto.slice(0, ultimoDosPuntos + 1)}${((a << 8) | b).toString(16)}:${((c << 8) | d).toString(16)}`;
  }
  const partes = texto.split("::");
  if (partes.length > 2) return null;
  const grupos = (t: string) => (t === "" ? [] : t.split(":"));
  const antes = grupos(partes[0]!);
  const despues = partes.length === 2 ? grupos(partes[1]!) : [];
  const faltan = 8 - antes.length - despues.length;
  if (partes.length === 1 ? faltan !== 0 : faltan < 1) return null;
  const todos = [...antes, ...Array<string>(partes.length === 2 ? faltan : 0).fill("0"), ...despues];
  if (todos.some((g) => !/^[0-9a-f]{1,4}$/.test(g))) return null;
  return todos.map((g) => parseInt(g, 16));
}

export function claveDeIp(ip: string): string | null {
  const limpia = ip.trim();
  if (PATRON_IPV4.test(limpia)) return limpia;
  if (!limpia.includes(":")) return null;
  const g = expandirIpv6(limpia);
  if (!g) return null;
  const mapeado = g.slice(0, 5).every((x) => x === 0) && g[5] === 0xffff;
  if (mapeado) return `${g[6]! >> 8}.${g[6]! & 255}.${g[7]! >> 8}.${g[7]! & 255}`;
  return `${g.slice(0, 4).map((x) => x.toString(16)).join(":")}::/64`;
}

export function ipDeEncabezados(h: Encabezados): string {
  const reenviado = h.get("x-forwarded-for")?.split(",")[0]?.trim();
  const candidato = reenviado || h.get("x-real-ip")?.trim() || "";
  return /^[0-9a-fA-F:.%]{2,64}$/.test(candidato) && claveDeIp(candidato) !== null ? candidato : IP_DESCONOCIDA;
}

export function huellaIp(ip: string, sal: string): string {
  if (!sal) throw new Error("Falta IP_SALT para calcular la huella");
  const clave = claveDeIp(ip) ?? ip;
  return createHmac("sha256", sal).update(`ip.${clave}`).digest("hex");
}
