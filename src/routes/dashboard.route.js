import express from "express";
const router = express.Router();

// import {} from "../controllers/dashboard.controller.js";
import { guard, allowedTo } from "../middleware/auth.middleware.js";

router.use(guard);

export default router;
