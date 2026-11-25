export function sitioSinIndexar(valor: string | undefined): boolean {
  return valor === "1";
}

export const SITE_NOINDEX = sitioSinIndexar(process.env.SITE_NOINDEX);
