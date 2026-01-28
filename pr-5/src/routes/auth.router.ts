import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();
const authController = new AuthController();

// POST /api/auth/register register new user
router.post("/register", authController.register);

// POST /api/auth/login login user
router.post("/login", authController.login);

// GET /api/auth/me get current user info (protected)
router.get("/me", authMiddleware, authController.me);

export default router;
