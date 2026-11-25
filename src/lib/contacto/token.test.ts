import { describe, expect, it } from "vitest";
import { TIEMPO_MAXIMO_MS, TIEMPO_MINIMO_MS, crearToken, verificarToken } from "./token";

const SECRETO = "secreto-de-prueba-largo-y-solo-para-tests";
const T0 = 1_760_000_000_000;

describe("token del tiempo mínimo", () => {
  it("un token recién firmado es válido después de los 4 segundos", () => {
    const token = crearToken(SECRETO, T0);
    expect(verificarToken(token, SECRETO, T0 + TIEMPO_MINIMO_MS)).toBe("ok");
    expect(verificarToken(token, SECRETO, T0 + 60_000)).toBe("ok");
    expect(verificarToken(token, SECRETO, T0 + TIEMPO_MAXIMO_MS)).toBe("ok");
  });

  it("antes de los 4 segundos es demasiado rápido", () => {
    const token = crearToken(SECRETO, T0);
    expect(verificarToken(token, SECRETO, T0)).toBe("muy_rapido");
    expect(verificarToken(token, SECRETO, T0 + TIEMPO_MINIMO_MS - 1)).toBe("muy_rapido");
  });

  it("pasadas las 2 horas está vencido", () => {
    const token = crearToken(SECRETO, T0);
    expect(verificarToken(token, SECRETO, T0 + TIEMPO_MAXIMO_MS + 1)).toBe("vencido");
  });

  it("un token manipulado no vale: ni la hora ni la firma se pueden cambiar", () => {
    const token = crearToken(SECRETO, T0);
    const [marca, firma] = token.split(".");
    expect(verificarToken(`${Number(marca) - 60_000}.${firma}`, SECRETO, T0 + 10_000)).toBe("invalido");
    const alterada = `${marca}.${firma!.slice(0, -1)}${firma!.endsWith("A") ? "B" : "A"}`;
    expect(verificarToken(alterada, SECRETO, T0 + 10_000)).toBe("invalido");
  });

  it("un token firmado con otro secreto no vale", () => {
    const ajeno = crearToken("otro-secreto-distinto-del-servidor", T0);
    expect(verificarToken(ajeno, SECRETO, T0 + 10_000)).toBe("invalido");
  });

  it("lo que no tiene forma de token no vale", () => {
    for (const malo of [undefined, null, 5, "", "abc", "123.456", `${T0}.`, `.${"a".repeat(43)}`, `${T0}.${"!".repeat(43)}`, {}, []]) {
      expect(verificarToken(malo, SECRETO, T0 + 10_000), String(malo)).toBe("invalido");
    }
  });

  it("sin secreto no se firma ni se verifica", () => {
    expect(() => crearToken("", T0)).toThrow();
    expect(() => verificarToken("x", "", T0)).toThrow();
  });
});
