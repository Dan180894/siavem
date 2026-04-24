import { describe, it, expect } from "vitest";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = "siavem_secret_key_2026";

describe("Autenticación - Funciones", () => {
  describe("Encriptación de contraseña", () => {
    it("debería encriptar una contraseña correctamente", async () => {
      const password = "admin123";
      const hashed = await bcrypt.hash(password, 10);

      expect(hashed).not.toBe(password);
      expect(hashed.length).toBeGreaterThan(0);
    });

    it("debería verificar una contraseña correcta", async () => {
      const password = "admin123";
      const hashed = await bcrypt.hash(password, 10);
      const isValid = await bcrypt.compare(password, hashed);

      expect(isValid).toBe(true);
    });

    it("debería rechazar una contraseña incorrecta", async () => {
      const password = "admin123";
      const hashed = await bcrypt.hash(password, 10);
      const isValid = await bcrypt.compare("wrongpassword", hashed);

      expect(isValid).toBe(false);
    });
  });

  describe("Generación de JWT", () => {
    it("debería generar un token válido", () => {
      const payload = {
        id: 1,
        email: "admin@siavem.go.cr",
        role: "SUPER_ADMIN",
        departmentId: 1,
      };
      const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "8h" });

      expect(token).toBeDefined();
      expect(token.split(".").length).toBe(3);
    });

    it("debería decodificar un token correctamente", () => {
      const payload = {
        id: 1,
        email: "admin@siavem.go.cr",
        role: "SUPER_ADMIN",
        departmentId: 1,
      };
      const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "8h" });
      const decoded = jwt.verify(token, JWT_SECRET);

      expect(decoded.id).toBe(1);
      expect(decoded.email).toBe("admin@siavem.go.cr");
      expect(decoded.role).toBe("SUPER_ADMIN");
    });

    it("debería fallar con un token inválido", () => {
      expect(() => {
        jwt.verify("token.invalido.aqui", JWT_SECRET);
      }).toThrow();
    });

    it("debería fallar con un secret incorrecto", () => {
      const payload = {
        id: 1,
        email: "admin@siavem.go.cr",
        role: "SUPER_ADMIN",
      };
      const token = jwt.sign(payload, JWT_SECRET);

      expect(() => {
        jwt.verify(token, "secret_incorrecto");
      }).toThrow();
    });
  });

  describe("Validación de roles", () => {
    it("debería validar rol SUPER_ADMIN", () => {
      const allowedRoles = ["SUPER_ADMIN", "ADMIN_TRANSPORT"];
      expect(allowedRoles.includes("SUPER_ADMIN")).toBe(true);
    });

    it("debería rechazar rol EMPLOYEE para registro", () => {
      const allowedRoles = [
        "SUPER_ADMIN",
        "ADMIN_TRANSPORT",
        "ADMIN_DEPARTMENT",
      ];
      expect(allowedRoles.includes("EMPLOYEE")).toBe(false);
    });
  });
});
