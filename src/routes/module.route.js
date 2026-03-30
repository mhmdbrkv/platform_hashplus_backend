import express from "express";

import {
  startUpload,
  completeUpload,
  abortUpload,
} from "../controllers/module.controller.js";

import { guard } from "../middleware/auth.middleware.js";
const router = express.Router();

router.use(guard);

router.route("/multipart/start").post(startUpload);
router.route("/multipart/complete").post(completeUpload);
router.route("/multipart/abort").post(abortUpload);

export default router;
