import { ApiError } from "../utils/apiError.js";
import {
  startMultipartUpload,
  getMultipartPresignedUrls,
  completeMultipartUpload,
  abortMultipartUpload,
  deleteUpload,
} from "../services/r2.service.js";

// Start Multipart Upload, Generate Pre-Signed URLs
export const startUpload = async (req, res, next) => {
  try {
    const { fileName, fileType, userId } = req.body;

    const partsCount = Number(req.body.partsCount);

    if (!fileName || !fileType || !userId || !partsCount) {
      return next(
        new ApiError(
          "fileName, fileType, userId and partsCount fields are required!",
          400,
        ),
      );
    }

    const { uploadId, key } = await startMultipartUpload(
      fileName,
      fileType,
      userId,
    );

    if (!uploadId || !key) {
      return next(
        new ApiError(
          "Error starting multipart upload. uploadId or key is missing.",
          400,
        ),
      );
    }

    const urls = await getMultipartPresignedUrls(key, uploadId, partsCount);

    res.status(200).json({
      status: "success",
      message: "Pre-Signed URLs Generated Successfuly!",
      data: urls,
    });
  } catch (error) {
    console.error(error);
    next(new ApiError("Error uploading content.", 400));
  }
};

// Complete Multipart Upload
export const completeUpload = async (req, res, next) => {
  try {
    const { key, uploadId, parts } = req.body;

    const data = await completeMultipartUpload(key, uploadId, parts);

    res.status(200).json({
      status: "success",
      message: "Upload Completed Successfuly!",
      data,
    });
  } catch (error) {
    console.error(error);
    next(new ApiError("Error uploading content.", 400));
  }
};

// Abort Multipart Uploads
export const abortUpload = async (req, res, next) => {
  const { key, uploadId } = req.body;

  const data = await abortMultipartUpload(key, uploadId);

  if (!data) {
    return next(new ApiError("Error aborting upload.", 400));
  }

  // await db.videos.update(video.id, { status: "aborted" });

  res.status(200).json({
    status: "success",
    message: "Upload Aborted Successfuly!",
  });
};

// Delete Upload
export const removeUpload = async (req, res, next) => {
  try {
    const { key } = req.body;

    const data = await deleteUpload(key);

    if (!data) {
      return next(new ApiError("Error deleting upload.", 400));
    }

    res.status(200).json({
      status: "success",
      message: "Upload Removed Successfuly!",
    });
  } catch (error) {
    console.error(error);
    next(new ApiError("Error removing upload.", 400));
  }
};
