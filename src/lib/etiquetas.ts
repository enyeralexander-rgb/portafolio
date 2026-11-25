export function partesEtiqueta(texto: string): string[] {
  const partes = texto.split(/(?<=\/)(?=.)/);
  const ultima = partes.pop() ?? "";
  const punto = ultima.lastIndexOf(".");
  if (punto > 0 && punto < ultima.length - 1) partes.push(ultima.slice(0, punto), ultima.slice(punto));
  else partes.push(ultima);
  return partes;
}
