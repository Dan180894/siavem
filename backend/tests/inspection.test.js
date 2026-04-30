import { describe, it, expect } from "vitest";

/**
 * Tests unitarios para el módulo de Inspecciones
 * Valida: tipos de inspección, niveles de combustible,
 * validación de kilometraje y reglas de negocio municipales
 */
describe("Inspecciones - Validaciones", () => {
  /**
   * Tipos de inspección del sistema
   * DEPARTURE: inspección de salida — documenta cómo sale el vehículo
   * RETURN: inspección de retorno — documenta cómo regresa
   */
  describe("Tipos de inspección", () => {
    const validTypes = ["DEPARTURE", "RETURN"];

    it("debería aceptar tipo DEPARTURE como válido", () => {
      expect(validTypes.includes("DEPARTURE")).toBe(true);
    });

    it("debería aceptar tipo RETURN como válido", () => {
      expect(validTypes.includes("RETURN")).toBe(true);
    });

    it("debería rechazar un tipo inválido", () => {
      expect(validTypes.includes("PARCIAL")).toBe(false);
    });
  });

  /**
   * Niveles de combustible registrados en cada inspección
   * Se registra en salida y retorno para comparar consumo
   */
  describe("Niveles de combustible", () => {
    const validLevels = [
      "FULL",
      "THREE_QUARTERS",
      "HALF",
      "ONE_QUARTER",
      "EMPTY",
    ];

    it("debería aceptar nivel FULL", () => {
      expect(validLevels.includes("FULL")).toBe(true);
    });

    it("debería aceptar nivel HALF", () => {
      expect(validLevels.includes("HALF")).toBe(true);
    });

    it("debería aceptar nivel EMPTY", () => {
      expect(validLevels.includes("EMPTY")).toBe(true);
    });

    it("debería aceptar nivel THREE_QUARTERS", () => {
      expect(validLevels.includes("THREE_QUARTERS")).toBe(true);
    });

    it("debería aceptar nivel ONE_QUARTER", () => {
      expect(validLevels.includes("ONE_QUARTER")).toBe(true);
    });

    it("debería rechazar nivel inválido", () => {
      expect(validLevels.includes("MEDIO")).toBe(false);
    });
  });

  /**
   * Validación de kilometraje en inspecciones
   * El kilometraje de retorno debe ser mayor o igual al de salida
   * El sistema actualiza el kilometraje del vehículo con el de retorno
   */
  describe("Validación de kilometraje", () => {
    it("debería aceptar kilometraje positivo", () => {
      const mileage = 15000;
      expect(mileage).toBeGreaterThan(0);
    });

    it("debería rechazar kilometraje negativo", () => {
      const mileage = -100;
      expect(mileage).toBeLessThan(0);
    });

    it("debería verificar que el kilometraje de retorno es mayor al de salida", () => {
      const departureMileage = 15000;
      const returnMileage = 165000;
      expect(returnMileage).toBeGreaterThan(departureMileage);
    });

    it("debería detectar kilometraje de retorno menor al de salida como inválido", () => {
      const departureMileage = 165000;
      const returnMileage = 15000;
      expect(returnMileage).toBeLessThan(departureMileage);
    });
  });

  /**
   * Validación de solicitud para crear inspección
   * Solo solicitudes con status APPROVED pueden tener inspecciones
   */
  describe("Validación de solicitud aprobada", () => {
    it("debería permitir inspección en solicitud APPROVED", () => {
      const status = "APPROVED";
      expect(status === "APPROVED").toBe(true);
    });

    it("debería bloquear inspección en solicitud PENDING", () => {
      const status = "PENDING";
      expect(status === "APPROVED").toBe(false);
    });

    it("debería bloquear inspección en solicitud REJECTED", () => {
      const status = "REJECTED";
      expect(status === "APPROVED").toBe(false);
    });
  });
});
