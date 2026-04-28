import { Router } from "express";
import {
  createWorkshop,
  getWorkshops,
  getWorkshopById,
  updateWorkshop,
  deleteWorkshop,
} from "../controllers/workshopController.js";
import { authenticate, authorize } from "../middleware/auth.js";

const router = Router();

// Todas las rutas requieren autenticación
router.use(authenticate);

// CRUD de talleres
router.post(
  "/",
  authorize("SUPER_ADMIN", "ADMIN_TRANSPORT", "ADMIN_DEPARTMENT"),
  createWorkshop,
);
router.get("/", getWorkshops);
router.get("/:id", getWorkshopById);
router.put(
  "/:id",
  authorize("SUPER_ADMIN", "ADMIN_TRANSPORT", "ADMIN_DEPARTMENT"),
  updateWorkshop,
);
router.delete(
  "/:id",
  authorize("SUPER_ADMIN", "ADMIN_TRANSPORT"),
  deleteWorkshop,
);

export default router;
