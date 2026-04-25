import { Router } from "express";
import {
  createEmployee,
  getEmployees,
  getEmployeeById,
  updateEmployee,
  deleteEmployee,
} from "../controllers/employeeController.js";
import { authenticate, authorize } from "../middleware/auth.js";

const router = Router();

// Todas las rutas requieren autenticación
router.use(authenticate);

// CRUD de empleados
router.post(
  "/",
  authorize("SUPER_ADMIN", "ADMIN_TRANSPORT", "ADMIN_DEPARTMENT"),
  createEmployee,
);
router.get("/", getEmployees);
router.get("/:id", getEmployeeById);
router.put(
  "/:id",
  authorize("SUPER_ADMIN", "ADMIN_TRANSPORT", "ADMIN_DEPARTMENT"),
  updateEmployee,
);
router.delete(
  "/:id",
  authorize("SUPER_ADMIN", "ADMIN_TRANSPORT"),
  deleteEmployee,
);

export default router;
