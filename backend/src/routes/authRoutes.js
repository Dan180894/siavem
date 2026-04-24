import { Router } from "express";
import { register, login } from "../controllers/authController.js";
import { authenticate, authorize } from "../middleware/auth.js";

const router = Router();

router.post(
  "/register",
  authenticate,
  authorize("SUPER_ADMIN", "ADMIN_TRANSPORT", "ADMIN_DEPARTMENT"),
  register,
);
router.post("/login", login);

export default router;

