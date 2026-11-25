import { describe, expect, it } from "vitest";
import { EntornoIncompleto, VARIABLES_REQUERIDAS, leerEntorno } from "./entorno";

const completo: Record<string, string> = {
  DATABASE_URL: "postgres://usuario:clave@host/base",
  SMTP_HOST: "smtp.gmail.com",
  SMTP_PORT: "465",
  SMTP_USER: "alexander@gmail.com",
  SMTP_PASSWORD: "abcd efgh ijkl mnop",
  MAIL_TO: "alexander@gmail.com",
  FORM_SECRET: "secreto-form",
  IP_SALT: "sal-ip",
};

describe("leerEntorno", () => {
  it("lee las variables y convierte el puerto en número", () => {
    const e = leerEntorno(completo);
    expect(e.smtp).toEqual({ host: "smtp.gmail.com", puerto: 465, usuario: "alexander@gmail.com", clave: "abcd efgh ijkl mnop" });
    expect(e.destino).toBe("alexander@gmail.com");
  });

  it("si falta alguna avisa cuáles, solo por nombre", () => {
    for (const nombre of VARIABLES_REQUERIDAS) {
      const incompleto = { ...completo };
      delete incompleto[nombre];
      try {
        leerEntorno(incompleto);
        expect.unreachable(nombre);
      } catch (error) {
        expect(error).toBeInstanceOf(EntornoIncompleto);
        expect((error as EntornoIncompleto).faltan).toEqual([nombre]);
        const mensaje = (error as Error).message;
        expect(mensaje).toContain(nombre);
        for (const valor of Object.values(completo)) expect(mensaje).not.toContain(valor);
      }
    }
  });

  it("una variable vacía o con solo espacios cuenta como faltante", () => {
    expect(() => leerEntorno({ ...completo, IP_SALT: "   " })).toThrow(EntornoIncompleto);
    expect(() => leerEntorno({ ...completo, MAIL_TO: "" })).toThrow(EntornoIncompleto);
  });

  it("un puerto que no es un número válido se rechaza", () => {
    for (const malo of ["abc", "0", "-5", "70000", "46.5"]) {
      expect(() => leerEntorno({ ...completo, SMTP_PORT: malo }), malo).toThrow(EntornoIncompleto);
    }
  });
});
