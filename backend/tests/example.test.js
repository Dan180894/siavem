import { describe, it, expect } from "vitest";

describe("Configuración de Vitest", () => {
  it("debería ejecutar un test básico correctamente", () => {
    expect(1 + 1).toBe(2);
  });

  it("debería verificar que un string contiene texto", () => {
    expect("SIAVEM API").toContain("SIAVEM");
  });
});
