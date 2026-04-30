import { Router } from "express";
import {
  createInspection,
  getInspections,
  getInspectionById,
} from "../controllers/inspectionController.js";
import { authenticate, authorize } from "../middleware/auth.js";

const router = Router();

router.use(authenticate);

router.post(
  "/",
  authorize("SUPER_ADMIN", "ADMIN_TRANSPORT", "ADMIN_DEPARTMENT"),
  createInspection,
);
router.get("/", getInspections);
router.get("/:id", getInspectionById);

export default router;
