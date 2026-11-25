import { Fragment } from "react";
import { partesEtiqueta } from "@/lib/etiquetas";

export function EtiquetaPartida({ texto }: { texto: string }) {
  return (
    <>
      {partesEtiqueta(texto).map((parte, i) => (
        <Fragment key={i}>
          {i > 0 && <wbr />}
          {parte}
        </Fragment>
      ))}
    </>
  );
}
