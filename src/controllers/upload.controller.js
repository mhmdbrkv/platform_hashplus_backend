import { ApiError } from "../utils/apiError.js";
import {
  startMultipartUpload,
  getMultipartPresignedUrls,
  completeMultipartUpload,
} from "../services/r2.service.js";
import { AbortMultipartUploadCommand } from "@aws-sdk/client-s3";

export const startUpload = async (req, res, next) => {
  try {
    const { fileName, fileType, userId, partsCount } = req.body;

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

  await s3Client.send(
    new AbortMultipartUploadCommand({
      Bucket: R2_BUCKET,
      Key: key,
      UploadId: uploadId,
    }),
  );

  // await db.videos.update(video.id, { status: "aborted" });
  res
    .status(200)
    .json({ status: "success", message: "uploading aborted successfuly" });
};
