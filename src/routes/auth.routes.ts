import { Router } from "express";
const router = Router();
import { authController } from "../controllers";
router.post("/login", authController.login);

export default router;