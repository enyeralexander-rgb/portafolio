import { randomUUID } from "node:crypto";
import nodemailer from "nodemailer";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import { like, sql } from "drizzle-orm";
import { procesarEnvio, type DependenciasEnvio, type Transporte } from "@/lib/contacto/procesar";
import type { CorreoListo } from "@/lib/contacto/correo";
import { LIMITES_ENVIO, type LimitesEnvio } from "@/lib/contacto/limites";
import type { DatosMensaje } from "@/lib/contacto/validacion";
import { crearDb, type Db } from "./cliente";
import { mensajes } from "./esquema";
import { marcarEnvio, reclamarReintento, registrarMensaje } from "./mensajes";

const URL_BASE = process.env.DATABASE_URL;
const PREFIJO = "__test__";

const huellaUnica = () => `${PREFIJO}${randomUUID()}`;
const datos = (extra: Partial<DatosMensaje> = {}): DatosMensaje => ({
  correo: `${PREFIJO}${randomUUID().slice(0, 8)}@ejemplo.com`,
  mensaje: "Mensaje de prueba de integración",
  estado: "disponible",
  envioId: randomUUID(),
  ...extra,
});

const holgados: LimitesEnvio = { ...LIMITES_ENVIO, maxPorHuella: 1000, maxGlobal: 1_000_000 };

describe.skipIf(!URL_BASE)("mensajes en la base de pruebas", () => {
  let db: Db;

  const limpiar = async () => {
    await db.delete(mensajes).where(like(mensajes.correo, `${PREFIJO}%`));
  };

  beforeAll(async () => {
    db = crearDb(URL_BASE!);
    await db.select({ id: mensajes.id }).from(mensajes).limit(1);
    await limpiar();
  });
  afterEach(limpiar);
  afterAll(limpiar);

  it("guarda el mensaje como pendiente y luego cambia su estado", async () => {
    const d = datos();
    const huella = huellaUnica();
    const r = await registrarMensaje(db, d, huella, holgados);
    expect(r.tipo).toBe("creado");
    if (r.tipo !== "creado") return;

    const [fila] = await db.select().from(mensajes).where(like(mensajes.correo, d.correo));
    expect(fila).toMatchObject({ correo: d.correo, mensaje: d.mensaje, estadoVisitante: "disponible", ipHuella: huella, estadoEnvio: "pendiente", errorResumen: null });
    expect(fila!.envioId).toBe(d.envioId);

    await marcarEnvio(db, r.id, "enviado");
    const [enviado] = await db.select().from(mensajes).where(like(mensajes.correo, d.correo));
    expect(enviado!.estadoEnvio).toBe("enviado");
    expect(enviado!.actualizadoEn.getTime()).toBeGreaterThanOrEqual(fila!.actualizadoEn.getTime());
  });

  it("el límite por huella es atómico: 10 envíos simultáneos con tope 3 dejan exactamente 3", async () => {
    const huella = huellaUnica();
    const limites: LimitesEnvio = { ...holgados, maxPorHuella: 3 };
    const resultados = await Promise.all(
      Array.from({ length: 10 }, () => registrarMensaje(db, datos(), huella, limites)),
    );
    expect(resultados.filter((r) => r.tipo === "creado")).toHaveLength(3);
    const rechazados = resultados.filter((r) => r.tipo === "limite");
    expect(rechazados).toHaveLength(7);
    for (const r of rechazados) {
      expect(r).toMatchObject({ tipo: "limite", motivo: "huella" });
      if (r.tipo === "limite") {
        expect(r.reintentarEnSeg).toBeGreaterThan(0);
        expect(r.reintentarEnSeg).toBeLessThanOrEqual(limites.ventanaHuellaSeg);
      }
    }
    const [{ n }] = (await db.execute(sql`select count(*)::int as n from mensajes where ip_huella = ${huella}`)).rows as { n: number }[];
    expect(n).toBe(3);
  });

  it("cada huella lleva su propia cuenta", async () => {
    const limites: LimitesEnvio = { ...holgados, maxPorHuella: 1 };
    const a = huellaUnica();
    const b = huellaUnica();
    expect((await registrarMensaje(db, datos(), a, limites)).tipo).toBe("creado");
    expect((await registrarMensaje(db, datos(), a, limites)).tipo).toBe("limite");
    expect((await registrarMensaje(db, datos(), b, limites)).tipo).toBe("creado");
  });

  it("el límite global también es atómico y se reparte entre huellas distintas", async () => {
    const [{ n }] = (await db.execute(sql`select count(*)::int as n from mensajes where creado_en > now() - interval '1 day'`)).rows as { n: number }[];
    const limites: LimitesEnvio = { ...holgados, maxGlobal: n + 2 };
    const resultados = await Promise.all(
      Array.from({ length: 6 }, () => registrarMensaje(db, datos(), huellaUnica(), limites)),
    );
    expect(resultados.filter((r) => r.tipo === "creado")).toHaveLength(2);
    expect(resultados.filter((r) => r.tipo === "limite" && r.motivo === "global")).toHaveLength(4);
  });

  it("el mismo identificador de envío no duplica el mensaje, ni en serie ni a la vez", async () => {
    const d = datos();
    const huella = huellaUnica();
    const primero = await registrarMensaje(db, d, huella, holgados);
    expect(primero.tipo).toBe("creado");
    const segundo = await registrarMensaje(db, d, huella, holgados);
    expect(segundo).toMatchObject({ tipo: "existente", estadoEnvio: "pendiente" });

    const d2 = datos();
    const dobles = await Promise.all(Array.from({ length: 5 }, () => registrarMensaje(db, d2, huella, holgados)));
    expect(dobles.filter((r) => r.tipo === "creado")).toHaveLength(1);
    expect(dobles.filter((r) => r.tipo === "existente")).toHaveLength(4);
    const [{ n }] = (await db.execute(sql`select count(*)::int as n from mensajes where envio_id = ${d2.envioId}::uuid`)).rows as { n: number }[];
    expect(n).toBe(1);
  });

  it("un envío repetido con el mismo identificador devuelve lo que quedó guardado, no lo nuevo", async () => {
    const d = datos({ mensaje: "El mensaje original" });
    const huella = huellaUnica();
    await registrarMensaje(db, d, huella, holgados);
    const otra = await registrarMensaje(db, { ...d, mensaje: "Otro texto distinto", correo: `${PREFIJO}otro@ejemplo.com` }, huella, holgados);
    expect(otra).toMatchObject({ tipo: "existente", datos: { mensaje: "El mensaje original", correo: d.correo, estado: "disponible", envioId: d.envioId } });
  });

  it("la tabla tiene la seguridad por filas activada y ninguna política", async () => {
    const { rows } = await db.execute(sql`select relrowsecurity as rls from pg_class where relname = 'mensajes' and relkind = 'r'`);
    expect(rows).toEqual([{ rls: true }]);
    const politicas = await db.execute(sql`select count(*)::int as n from pg_policies where tablename = 'mensajes'`);
    expect((politicas.rows as { n: number }[])[0]!.n).toBe(0);
  });

  it("un reintento repetido no cuenta contra el límite", async () => {
    const huella = huellaUnica();
    const limites: LimitesEnvio = { ...holgados, maxPorHuella: 1 };
    const d = datos();
    expect((await registrarMensaje(db, d, huella, limites)).tipo).toBe("creado");
    expect((await registrarMensaje(db, d, huella, limites)).tipo).toBe("existente");
  });

  it("la base rechaza por sí sola estados, largos y mensajes inválidos", async () => {
    const base = { ipHuella: huellaUnica() };
    const intento = (extra: Record<string, unknown>) =>
      db.insert(mensajes).values({ envioId: randomUUID(), correo: `${PREFIJO}x@ejemplo.com`, mensaje: "mensaje válido", ...base, ...extra } as typeof mensajes.$inferInsert);
    await expect(intento({ estadoEnvio: "enviando" })).rejects.toThrow();
    await expect(intento({ estadoVisitante: "invisible" })).rejects.toThrow();
    await expect(intento({ mensaje: "a" })).rejects.toThrow();
    await expect(intento({ mensaje: "a".repeat(1001) })).rejects.toThrow();
    await expect(intento({ correo: "a@b.c" })).rejects.toThrow();
    await expect(intento({ errorResumen: "e".repeat(201) })).rejects.toThrow();
    await expect(intento({ envioId: "no-es-uuid" })).rejects.toThrow();
  });

  it("un envío fallido se reclama una sola vez aunque lleguen varios reintentos a la vez", async () => {
    const d = datos();
    const r = await registrarMensaje(db, d, huellaUnica(), holgados);
    if (r.tipo !== "creado") throw new Error("no se creó");
    expect(await reclamarReintento(db, r.id)).toBe(false);
    await marcarEnvio(db, r.id, "fallido", "ETIMEDOUT: prueba");
    const reclamos = await Promise.all(Array.from({ length: 5 }, () => reclamarReintento(db, r.id)));
    expect(reclamos.filter(Boolean)).toHaveLength(1);
  });
});

describe.skipIf(!URL_BASE)("procesarEnvio con transporte de mentira", () => {
  let db: Db;
  const limpiar = async () => {
    await db.delete(mensajes).where(like(mensajes.correo, `${PREFIJO}%`));
  };
  beforeAll(async () => {
    db = crearDb(URL_BASE!);
    await limpiar();
  });
  afterEach(limpiar);
  afterAll(limpiar);

  const deps = (transporte: Transporte, extra: Partial<DependenciasEnvio> = {}): DependenciasEnvio => ({
    db,
    transporte,
    remitente: "remitente@ejemplo.com",
    destino: "destino@ejemplo.com",
    limites: holgados,
    ...extra,
  });
  const leer = async (correo: string) => (await db.select().from(mensajes).where(like(mensajes.correo, correo)))[0];

  it("camino feliz: guarda, arma el correo completo y lo marca como enviado", async () => {
    const real = nodemailer.createTransport({ jsonTransport: true });
    let capturado: Record<string, unknown> | null = null;
    const transporte: Transporte = {
      sendMail: async (c: CorreoListo) => {
        const info = await real.sendMail(c);
        capturado = JSON.parse(String(info.message));
        return info;
      },
    };
    const d = datos({ mensaje: "Hola <b>Alexander</b>\nquiero una web" });
    const r = await procesarEnvio(deps(transporte), d, huellaUnica());
    expect(r).toEqual({ tipo: "ok", repetido: false });

    const fila = await leer(d.correo);
    expect(fila).toMatchObject({ estadoEnvio: "enviado", errorResumen: null });

    expect(capturado).toMatchObject({ subject: expect.stringContaining(d.correo), replyTo: [{ address: d.correo }] });
    expect(JSON.stringify(capturado)).toContain("destino@ejemplo.com");
    expect(String((capturado as unknown as { html: string }).html)).toContain("&lt;b&gt;Alexander&lt;/b&gt;");
  });

  it("si el correo falla, el mensaje queda guardado como fallido con un resumen sin secretos", async () => {
    const clave = "claveMuySecreta123";
    const transporte: Transporte = {
      sendMail: async () => {
        throw Object.assign(new Error(`535 login rechazado con ${clave}\r\nreintenta`), { code: "EAUTH" });
      },
    };
    const d = datos();
    const r = await procesarEnvio(deps(transporte, { secretos: [clave] }), d, huellaUnica());
    expect(r).toEqual({ tipo: "correo_fallido" });

    const fila = await leer(d.correo);
    expect(fila!.estadoEnvio).toBe("fallido");
    expect(fila!.mensaje).toBe(d.mensaje);
    expect(fila!.errorResumen).toContain("EAUTH");
    expect(fila!.errorResumen).not.toContain(clave);
    expect(fila!.errorResumen).not.toMatch(/[\r\n]/);
  });

  it("reintentar el mismo envío después de un fallo lo manda una sola vez y no duplica la fila", async () => {
    let llamadas = 0;
    let fallar = true;
    const transporte: Transporte = {
      sendMail: async () => {
        llamadas += 1;
        if (fallar) throw new Error("sin conexión");
      },
    };
    const d = datos();
    const huella = huellaUnica();
    expect(await procesarEnvio(deps(transporte), d, huella)).toEqual({ tipo: "correo_fallido" });

    fallar = false;
    const resultados = await Promise.all([procesarEnvio(deps(transporte), d, huella), procesarEnvio(deps(transporte), d, huella)]);
    const enviados = resultados.filter((r) => r.tipo === "ok" && !r.repetido);
    expect(enviados).toHaveLength(1);
    const otro = resultados.find((r) => r !== enviados[0]);
    expect([{ tipo: "en_proceso" }, { tipo: "ok", repetido: true }]).toContainEqual(otro);
    expect(llamadas).toBe(2);

    expect(await procesarEnvio(deps(transporte), d, huella)).toEqual({ tipo: "ok", repetido: true });
    expect(llamadas).toBe(2);
    const [{ n }] = (await db.execute(sql`select count(*)::int as n from mensajes where envio_id = ${d.envioId}::uuid`)).rows as { n: number }[];
    expect(n).toBe(1);
    expect((await leer(d.correo))!.estadoEnvio).toBe("enviado");
  });

  it("el reintento manda lo guardado aunque llegue con el mismo identificador y otro texto", async () => {
    const enviados: CorreoListo[] = [];
    let fallar = true;
    const transporte: Transporte = {
      sendMail: async (c: CorreoListo) => {
        enviados.push(c);
        if (fallar) throw new Error("caído");
      },
    };
    const d = datos({ mensaje: "Texto guardado" });
    const huella = huellaUnica();
    await procesarEnvio(deps(transporte), d, huella);
    fallar = false;
    await procesarEnvio(deps(transporte), { ...d, mensaje: "Texto cambiado a escondidas" }, huella);
    expect(enviados).toHaveLength(2);
    expect(enviados[1]!.text).toContain("Texto guardado");
    expect(enviados[1]!.text).not.toContain("a escondidas");
  });

  it("un transporte que se cuelga se corta por tiempo y el mensaje queda fallido", async () => {
    const transporte: Transporte = { sendMail: () => new Promise(() => {}) };
    const d = datos();
    const r = await procesarEnvio(deps(transporte, { esperaMaximaMs: 150 }), d, huellaUnica());
    expect(r).toEqual({ tipo: "correo_fallido" });
    expect((await leer(d.correo))!.estadoEnvio).toBe("fallido");
  });

  it("al pasarse del límite no manda ningún correo y avisa cuánto esperar", async () => {
    let llamadas = 0;
    const transporte: Transporte = { sendMail: async () => void (llamadas += 1) };
    const huella = huellaUnica();
    const limites: LimitesEnvio = { ...holgados, maxPorHuella: 1 };
    expect((await procesarEnvio(deps(transporte, { limites }), datos(), huella)).tipo).toBe("ok");
    const r = await procesarEnvio(deps(transporte, { limites }), datos(), huella);
    expect(r.tipo).toBe("limite");
    if (r.tipo === "limite") expect(r.reintentarEnSeg).toBeGreaterThan(0);
    expect(llamadas).toBe(1);
  });
});
