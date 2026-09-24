import { Router } from "express";
import { authController } from "../../controllers/auth.controller.js";
import { authenticate } from "../../middleware/auth.js";
import { authLimiter } from "../../middleware/rateLimiter.js";
import { validateBody } from "../../middleware/validator.js";
import {
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from "../../validators/auth.validator.js";

const router = Router();

// 1. Login with strict rate limiting and body validation
router.post(
  "/login",
  authLimiter,
  validateBody(loginSchema),
  authController.login
);

// 2. Token refresh & rotation
router.post(
  "/refresh",
  authController.refresh
);

// 3. Logout
router.post(
  "/logout",
  authController.logout
);

// 4. Authenticated current user profile
router.get(
  "/me",
  authenticate,
  authController.getMe
);

// 5. Password recovery request
router.post(
  "/forgot-password",
  authLimiter,
  validateBody(forgotPasswordSchema),
  authController.forgotPassword
);

// 6. Password reset execution
router.post(
  "/reset-password",
  authLimiter,
  validateBody(resetPasswordSchema),
  authController.resetPassword
);

export default router;
