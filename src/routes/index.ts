import { Router } from "express";
import homeRouter from "./home.route";
const router = Router();
router.use("", homeRouter);

export { router };
