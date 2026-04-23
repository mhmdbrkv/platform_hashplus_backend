import express from "express";
const router = express.Router();

import {
  startUpload,
  completeUpload,
  abortUpload,
  removeUpload,
} from "../controllers/upload.controller.js";

import {
  startUploadSchema,
  completeUploadSchema,
  removeUploadSchema,
} from "../validators/upload.validator.js";

import validate from "../middleware/validate.middleware.js";

import { guard, allowedTo } from "../middleware/auth.middleware.js";

router.use(guard, allowedTo("admin", "instructor"));

router.post("/multipart/start", validate(startUploadSchema), startUpload);
router.post(
  "/multipart/complete",
  validate(completeUploadSchema),
  completeUpload,
);
router.delete("/multipart/abort", validate(removeUploadSchema), abortUpload);
router.delete("/multipart/delete", validate(removeUploadSchema), removeUpload);

export default router;
