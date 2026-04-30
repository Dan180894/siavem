import { Router } from "express";
import {
  createMaintenance,
  getMaintenances,
  getMaintenanceById,
  registerReturn,
} from "../controllers/maintenanceController.js";
import { authenticate, authorize } from "../middleware/auth.js";

const router = Router();

router.use(authenticate);

router.post(
  "/",
  authorize("SUPER_ADMIN", "ADMIN_TRANSPORT"),
  createMaintenance,
);
router.get("/", getMaintenances);
router.get("/:id", getMaintenanceById);
router.patch(
  "/:id/return",
  authorize("SUPER_ADMIN", "ADMIN_TRANSPORT"),
  registerReturn,
);

export default router;
