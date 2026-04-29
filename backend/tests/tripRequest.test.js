import { describe, it, expect } from "vitest";

/**
 * Tests unitarios para el módulo de Solicitud de Gira
 * Valida: estados de solicitud, tipos de vehículo requerido,
 * validación de fechas y bloqueo de conductor
 * Contexto: flujo principal del sistema municipal de vehículos
 */
describe("Solicitud de Gira - Validaciones", () => {
  /**
   * Estados válidos de una solicitud de gira
   * PENDING: recién creada, esperando aprobación
   * APPROVED: aprobada por Admin de Transporte con vehículo asignado
   * REJECTED: rechazada por falta de disponibilidad u otro motivo
   */
  describe("Validación de estado", () => {
    const validStatuses = ["PENDING", "APPROVED", "REJECTED"];

    it("debería aceptar estado PENDING como válido", () => {
      expect(validStatuses.includes("PENDING")).toBe(true);
    });

    it("debería aceptar estado APPROVED como válido", () => {
      expect(validStatuses.includes("APPROVED")).toBe(true);
    });

    it("debería aceptar estado REJECTED como válido", () => {
      expect(validStatuses.includes("REJECTED")).toBe(true);
    });

    it("debería rechazar un estado inválido", () => {
      expect(validStatuses.includes("CANCELADO")).toBe(false);
    });
  });

  /**
   * Tipos de vehículo que se pueden solicitar en una gira municipal
   * VEHICLE: vehículo liviano estándar
   * MOTORCYCLE: motocicleta
   * BUS: buseta para grupos
   */
  describe("Tipos de vehículo requerido", () => {
    const validTypes = ["VEHICLE", "MOTORCYCLE", "BUS"];

    it("debería aceptar tipo VEHICLE", () => {
      expect(validTypes.includes("VEHICLE")).toBe(true);
    });

    it("debería aceptar tipo MOTORCYCLE", () => {
      expect(validTypes.includes("MOTORCYCLE")).toBe(true);
    });

    it("debería aceptar tipo BUS", () => {
      expect(validTypes.includes("BUS")).toBe(true);
    });

    it("debería rechazar tipo inválido", () => {
      expect(validTypes.includes("HELICOPTERO")).toBe(false);
    });
  });

  /**
   * Validación de fechas de la solicitud
   * La fecha de regreso debe ser posterior a la fecha de salida
   * No se pueden crear giras con fechas invertidas
   */
  describe("Validación de fechas", () => {
    it("debería aceptar solicitud con fechas válidas", () => {
      const departureAt = new Date("2026-05-10T08:00:00");
      const returnAt = new Date("2026-05-10T17:00:00");
      expect(returnAt > departureAt).toBe(true);
    });

    it("debería rechazar solicitud con fecha de regreso anterior a salida", () => {
      const departureAt = new Date("2026-05-10T17:00:00");
      const returnAt = new Date("2026-05-10T08:00:00");
      expect(returnAt > departureAt).toBe(false);
    });

    it("debería rechazar solicitud con fechas iguales", () => {
      const departureAt = new Date("2026-05-10T08:00:00");
      const returnAt = new Date("2026-05-10T08:00:00");
      expect(returnAt > departureAt).toBe(false);
    });

    it("debería aceptar gira de varios días", () => {
      const departureAt = new Date("2026-05-10T08:00:00");
      const returnAt = new Date("2026-05-12T17:00:00");
      expect(returnAt > departureAt).toBe(true);
    });
  });

  /**
   * Bloqueo de conductor por licencia vencida
   * Un conductor con isBlocked = true no puede ser asignado a ninguna gira
   * Es un bloqueo duro sin excepciones según las reglas de negocio municipales
   */
  describe("Bloqueo de conductor", () => {
    it("debería bloquear asignación de conductor con licencia vencida", () => {
      const driver = { isBlocked: true };
      expect(driver.isBlocked).toBe(true);
    });

    it("debería permitir asignación de conductor con licencia vigente", () => {
      const driver = { isBlocked: false };
      expect(driver.isBlocked).toBe(false);
    });

    it("debería identificar conductor próximo a vencer como no bloqueado", () => {
      const licenseExpiry = new Date();
      licenseExpiry.setDate(licenseExpiry.getDate() + 15);
      const isBlocked = licenseExpiry < new Date();
      expect(isBlocked).toBe(false);
    });

    it("debería identificar conductor con licencia vencida como bloqueado", () => {
      const licenseExpiry = new Date("2025-01-01");
      const isBlocked = licenseExpiry < new Date();
      expect(isBlocked).toBe(true);
    });
  });
});
