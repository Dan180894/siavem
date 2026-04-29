import { Router } from "express";
import {
  createTripRequest,
  getTripRequests,
  getTripRequestById,
  updateTripRequest,
  approveTripRequest,
  rejectTripRequest,
} from "../controllers/tripRequestController.js";
import { authenticate, authorize } from "../middleware/auth.js";

const router = Router();

router.use(authenticate);

router.post(
  "/",
  authorize("SUPER_ADMIN", "ADMIN_DEPARTMENT"),
  createTripRequest,
);
router.get("/", getTripRequests);
router.get("/:id", getTripRequestById);
router.put(
  "/:id",
  authorize("SUPER_ADMIN", "ADMIN_DEPARTMENT"),
  updateTripRequest,
);
router.patch(
  "/:id/approve",
  authorize("SUPER_ADMIN", "ADMIN_TRANSPORT"),
  approveTripRequest,
);
router.patch(
  "/:id/reject",
  authorize("SUPER_ADMIN", "ADMIN_TRANSPORT"),
  rejectTripRequest,
);

export default router;
