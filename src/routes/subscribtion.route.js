import express from "express";

import {
  subscribtionForGeneral,
  subscribtionForBootcamp,
} from "../controllers/subscription.controller.js";

import { guard } from "../middleware/auth.middleware.js";
const router = express.Router();

router.use(guard);

router.post("/general", subscribtionForGeneral);
router.post("/bootcamp", subscribtionForBootcamp);

export default router;
