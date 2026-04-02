import express from "express";

import {
  startUpload,
  completeUpload,
  abortUpload,
  removeUpload,
} from "../controllers/upload.controller.js";

import { guard, allowedTo } from "../middleware/auth.middleware.js";
const router = express.Router();

router.use(guard, allowedTo("admin", "instructor"));

router.post("/multipart/start", startUpload);
router.post("/multipart/complete", completeUpload);
router.delete("/multipart/abort", abortUpload);
router.delete("/multipart/delete", removeUpload);

export default router;
