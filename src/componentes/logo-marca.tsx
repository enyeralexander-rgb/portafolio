import Image from "next/image";
import type { Marca } from "@/data/contenido";

export function LogoMarca({ marca }: { marca: Marca }) {
  return (
    <span className={marca.ajustado ? "logo tight" : "logo"}>
      <Image src={marca.logo} alt="" fill sizes="120px" unoptimized draggable={false} />
    </span>
  );
}
