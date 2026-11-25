import { describe, expect, it } from "vitest";
import { IP_DESCONOCIDA, claveDeIp, huellaIp, ipDeEncabezados } from "./huella-ip";

const encabezados = (valores: Record<string, string>) => ({
  get: (n: string) => valores[n.toLowerCase()] ?? null,
});

describe("ipDeEncabezados", () => {
  it("toma el primer valor de x-forwarded-for", () => {
    expect(ipDeEncabezados(encabezados({ "x-forwarded-for": "190.1.2.3, 10.0.0.1, 10.0.0.2" }))).toBe("190.1.2.3");
    expect(ipDeEncabezados(encabezados({ "x-forwarded-for": "  2001:db8::1 " }))).toBe("2001:db8::1");
  });

  it("si no hay x-forwarded-for usa x-real-ip, y si no hay nada, 'desconocida'", () => {
    expect(ipDeEncabezados(encabezados({ "x-real-ip": "190.4.5.6" }))).toBe("190.4.5.6");
    expect(ipDeEncabezados(encabezados({}))).toBe(IP_DESCONOCIDA);
  });

  it("no acepta como IP algo que no lo parece", () => {
    expect(ipDeEncabezados(encabezados({ "x-forwarded-for": "<script>alert(1)</script>" }))).toBe(IP_DESCONOCIDA);
    expect(ipDeEncabezados(encabezados({ "x-forwarded-for": "a".repeat(200) }))).toBe(IP_DESCONOCIDA);
  });
});

describe("huellaIp", () => {
  it("es estable, depende del IP y de la sal, y no contiene el IP", () => {
    const a = huellaIp("190.1.2.3", "sal-1");
    expect(a).toBe(huellaIp("190.1.2.3", "sal-1"));
    expect(a).not.toBe(huellaIp("190.1.2.4", "sal-1"));
    expect(a).not.toBe(huellaIp("190.1.2.3", "sal-2"));
    expect(a).toMatch(/^[0-9a-f]{64}$/);
    expect(a).not.toContain("190");
  });

  it("sin sal no calcula nada", () => {
    expect(() => huellaIp("190.1.2.3", "")).toThrow();
  });
});

describe("IPv6: se cuenta por el prefijo /64", () => {
  it("la clave de un IPv4 es la dirección tal cual, así las huellas de siempre no cambian", () => {
    expect(claveDeIp("190.1.2.3")).toBe("190.1.2.3");
    expect(huellaIp("190.1.2.3", "sal")).toBe(huellaIp("190.1.2.3", "sal"));
  });

  it("abreviada, completa y con ceros de más dan el mismo prefijo", () => {
    const esperado = "2001:db8:85a3:42::/64";
    expect(claveDeIp("2001:db8:85a3:42::1")).toBe(esperado);
    expect(claveDeIp("2001:0db8:85a3:0042:0000:8a2e:0370:7334")).toBe(esperado);
    expect(claveDeIp("2001:DB8:85A3:42:1:2:3:4")).toBe(esperado);
    expect(claveDeIp("2001:db8:85a3:42:0:0:0:1%eth0")).toBe(esperado);
  });

  it("direcciones abreviadas con :: en distintos sitios se expanden bien", () => {
    expect(claveDeIp("::1")).toBe("0:0:0:0::/64");
    expect(claveDeIp("::")).toBe("0:0:0:0::/64");
    expect(claveDeIp("2001:db8::")).toBe("2001:db8:0:0::/64");
    expect(claveDeIp("2001:db8::8a2e:370:7334")).toBe("2001:db8:0:0::/64");
    expect(claveDeIp("1:2:3:4:5:6:7::")).toBe("1:2:3:4::/64");
  });

  it("dos direcciones del mismo /64 dan la misma huella, y de otro /64, otra", () => {
    const a = huellaIp("2001:db8:1:2:aaaa:bbbb:cccc:dddd", "sal");
    expect(a).toBe(huellaIp("2001:db8:1:2::1", "sal"));
    expect(a).toBe(huellaIp("2001:0db8:0001:0002:ffff:ffff:ffff:ffff", "sal"));
    expect(a).not.toBe(huellaIp("2001:db8:1:3::1", "sal"));
    expect(a).not.toBe(huellaIp("2001:db8:1:2::1", "otra-sal"));
    expect(a).not.toContain("2001");
  });

  it("un IPv4 mapeado cuenta como el IPv4 de verdad, en cualquiera de sus formas", () => {
    expect(claveDeIp("::ffff:190.1.2.3")).toBe("190.1.2.3");
    expect(claveDeIp("::FFFF:190.1.2.3")).toBe("190.1.2.3");
    expect(claveDeIp("::ffff:be01:0203")).toBe("190.1.2.3");
    expect(claveDeIp("0:0:0:0:0:ffff:190.1.2.3")).toBe("190.1.2.3");
    expect(huellaIp("::ffff:190.1.2.3", "sal")).toBe(huellaIp("190.1.2.3", "sal"));
  });

  it("lo que no es una IP válida no se toma", () => {
    for (const mala of ["", "abc", ":::", "1:2:3:4:5:6:7:8:9", "1:2:3:4:5:6:7", "12345::1", "gggg::1", "1::2::3", "::ffff:999.1.2.3", "300.1.2.3", "1.2.3", "::1.2.3.4.5"]) {
      expect(claveDeIp(mala), mala).toBeNull();
    }
    expect(ipDeEncabezados(encabezados({ "x-forwarded-for": "1:2:3:4:5:6:7:8:9" }))).toBe(IP_DESCONOCIDA);
    expect(ipDeEncabezados(encabezados({ "x-forwarded-for": "300.1.2.3" }))).toBe(IP_DESCONOCIDA);
    expect(ipDeEncabezados(encabezados({ "x-forwarded-for": "2001:db8::1, 10.0.0.1" }))).toBe("2001:db8::1");
  });
});
