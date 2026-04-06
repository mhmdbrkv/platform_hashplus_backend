import express from "express";

import { cancelSubscription } from "../controllers/subscription.controller.js";

import { guard, allowedTo } from "../middleware/auth.middleware.js";

const router = express.Router();

router.use(guard, allowedTo("user"));

router.patch("/cancel", cancelSubscription);

export default router;
