import { describe, expect, it } from "vitest";
import { sitioSinIndexar } from "./noindex";

describe("sitioSinIndexar", () => {
  it("se activa solo con el valor 1", () => {
    expect(sitioSinIndexar("1")).toBe(true);
  });

  it("sin variable o con otro valor, el sitio es indexable", () => {
    expect(sitioSinIndexar(undefined)).toBe(false);
    expect(sitioSinIndexar("")).toBe(false);
    expect(sitioSinIndexar("0")).toBe(false);
    expect(sitioSinIndexar("true")).toBe(false);
  });
});
