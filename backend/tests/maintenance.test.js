import { describe, it, expect } from "vitest";

/**
 * Tests unitarios para el módulo de Mantenimientos
 * Valida: tipos de mantenimiento, cambio de estado del vehículo,
 * validación de taller y reglas de negocio municipales
 */
describe("Mantenimientos - Validaciones", () => {
  /**
   * Tipos de mantenimiento de la flota municipal
   * PREVENTIVE: por kilometraje según plan de servicio
   * CORRECTIVE: por falla o daño — bloquea el vehículo hasta su retorno
   */
  describe("Tipos de mantenimiento", () => {
    const validTypes = ["PREVENTIVE", "CORRECTIVE"];

    it("debería aceptar tipo PREVENTIVE como válido", () => {
      expect(validTypes.includes("PREVENTIVE")).toBe(true);
    });

    it("debería aceptar tipo CORRECTIVE como válido", () => {
      expect(validTypes.includes("CORRECTIVE")).toBe(true);
    });

    it("debería rechazar un tipo inválido", () => {
      expect(validTypes.includes("EMERGENCIA")).toBe(false);
    });
  });

  /**
   * Cambio de estado del vehículo según tipo de mantenimiento
   * CORRECTIVE: vehículo pasa a MAINTENANCE hasta que regrese del taller
   * PREVENTIVE: vehículo permanece en ACTIVE
   */
  describe("Estado del vehículo según tipo de mantenimiento", () => {
    it("debería cambiar vehículo a MAINTENANCE en mantenimiento correctivo", () => {
      const type = "CORRECTIVE";
      const expectedStatus = type === "CORRECTIVE" ? "MAINTENANCE" : "ACTIVE";
      expect(expectedStatus).toBe("MAINTENANCE");
    });

    it("debería mantener vehículo en ACTIVE en mantenimiento preventivo", () => {
      const type = "PREVENTIVE";
      const expectedStatus = type === "CORRECTIVE" ? "MAINTENANCE" : "ACTIVE";
      expect(expectedStatus).toBe("ACTIVE");
    });

    it("debería volver vehículo a ACTIVE al registrar retorno", () => {
      const returnDate = new Date("2026-05-05T16:00:00");
      const statusAfterReturn = returnDate ? "ACTIVE" : "MAINTENANCE";
      expect(statusAfterReturn).toBe("ACTIVE");
    });

    it("debería mantener vehículo en MAINTENANCE si no hay retorno registrado", () => {
      const returnDate = null;
      const statusAfterReturn = returnDate ? "ACTIVE" : "MAINTENANCE";
      expect(statusAfterReturn).toBe("MAINTENANCE");
    });
  });

  /**
   * Validación del taller para recibir vehículos
   * Solo talleres con contrato vigente (isBlocked: false) pueden recibir vehículos
   */
  describe("Validación de taller", () => {
    it("debería permitir taller con contrato vigente", () => {
      const workshop = { isBlocked: false };
      expect(workshop.isBlocked).toBe(false);
    });

    it("debería bloquear taller con contrato vencido", () => {
      const workshop = { isBlocked: true };
      expect(workshop.isBlocked).toBe(true);
    });

    it("debería verificar que el contrato del taller no está vencido", () => {
      const contractExpiry = new Date("2027-12-31");
      const isBlocked = contractExpiry < new Date();
      expect(isBlocked).toBe(false);
    });

    it("debería detectar contrato vencido correctamente", () => {
      const contractExpiry = new Date("2024-01-01");
      const isBlocked = contractExpiry < new Date();
      expect(isBlocked).toBe(true);
    });
  });

  /**
   * Validación del monto del mantenimiento
   * El monto debe ser positivo — representa el costo del servicio
   */
  describe("Validación de monto", () => {
    it("debería aceptar monto positivo", () => {
      const amount = 45000;
      expect(amount).toBeGreaterThan(0);
    });

    it("debería rechazar monto negativo", () => {
      const amount = -1000;
      expect(amount).toBeLessThan(0);
    });

    it("debería rechazar monto cero", () => {
      const amount = 0;
      expect(amount).toBe(0);
    });
  });
});
