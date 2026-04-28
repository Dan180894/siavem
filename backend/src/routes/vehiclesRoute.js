import { Router } from "express";
import {
  createVehicle,
  getVehicles,
  getVehicleById,
  updateVehicle,
  deleteVehicle,
} from "../controllers/vehicleController.js";
import { authenticate, authorize } from "../middleware/auth.js";

const router = Router();

// Todas las rutas requieren autenticación
router.use(authenticate);

// CRUD de vehículos
router.post(
  "/",
  authorize("SUPER_ADMIN", "ADMIN_TRANSPORT", "ADMIN_DEPARTMENT"),
  createVehicle,
);
router.get("/", getVehicles);
router.get("/:id", getVehicleById);
router.put(
  "/:id",
  authorize("SUPER_ADMIN", "ADMIN_TRANSPORT", "ADMIN_DEPARTMENT"),
  updateVehicle,
);
router.delete(
  "/:id",
  authorize("SUPER_ADMIN", "ADMIN_TRANSPORT"),
  deleteVehicle,
);

export default router;
