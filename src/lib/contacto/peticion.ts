export function origenPermitido(origin: string | null, host: string | null): boolean {
  if (!origin) return true;
  if (!host) return false;
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

export type CuerpoLeido = { ok: true; texto: string } | { ok: false };

export async function leerCuerpoLimitado(
  cuerpo: ReadableStream<Uint8Array> | null,
  maxBytes: number,
  largoDeclarado: string | null,
): Promise<CuerpoLeido> {
  const declarado = largoDeclarado === null ? 0 : Number(largoDeclarado);
  if (Number.isFinite(declarado) && declarado > maxBytes) return { ok: false };
  if (!cuerpo) return { ok: true, texto: "" };

  const lector = cuerpo.getReader();
  const decodificador = new TextDecoder("utf-8", { fatal: false });
  let total = 0;
  let texto = "";
  for (;;) {
    const { done, value } = await lector.read();
    if (done) break;
    total += value.byteLength;
    if (total > maxBytes) {
      await lector.cancel();
      return { ok: false };
    }
    texto += decodificador.decode(value, { stream: true });
  }
  return { ok: true, texto: texto + decodificador.decode() };
}
