import { ApiError } from "../utils/apiError.js";
import {
  AbortMultipartUploadCommand,
  CompleteMultipartUploadCommand,
  CreateMultipartUploadCommand,
  UploadPartCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

import { s3Client } from "../config/r2.js";
import { R2_BUCKET } from "../config/env.js";
import { v4 as uuid } from "uuid";

export const r2MultipartUpload = async (req, res, next) => {
  try {
    const { fileName, contentType, size, userId, contentId } = req.body;
    const PART_SIZE = 50 * 1024 * 1024; // 50 MB per chunk
    const partCount = Math.ceil(size / PART_SIZE);

    if (partCount > 10000) return next(new ApiError("File too large", 400));

    const key = `uploads/${userId}/${uuid()}/${fileName}`;

    // Step 1 — create the multipart upload session in R2
    const { UploadId } = await s3Client.send(
      new CreateMultipartUploadCommand({
        Bucket: R2_BUCKET,
        Key: key,
        ContentType: contentType,
        Metadata: { uploadedBy: userId },
      }),
    );

    // Step 2 — presign a PUT URL for every part
    const partUrls = await Promise.all(
      Array.from(
        { length: partCount },
        (_, i) =>
          getSignedUrl(
            s3Client,
            new UploadPartCommand({
              Bucket: R2_BUCKET,
              Key: key,
              UploadId,
              PartNumber: i + 1, // 1-indexed
            }),
            { expiresIn: 3600 },
          ), // 1 hour per part URL
      ),
    );

    res.status(200).json({
      status: "success",
      message: "Multipart upload started successfully",
      data: {
        uploadId: UploadId,
        key,
        contentId: contentId,
        partUrls,
        partSize: PART_SIZE,
      },
    });
  } catch (error) {
    console.log(error);
    next(new ApiError("حدث خطأ اثناء التحميل", 500));
  }
};

export const stitchR2MultipartUpload = async (req, res, next) => {
  try {
    const { videoId, parts } = req.body;
    // parts = [{ PartNumber: 1, ETag: '"abc123"' }, ...]

    const video = await db.videos.findOne({
      id: videoId,
      uploadedBy: req.user.id,
    });
    if (!video) return res.status(404).end();

    await r2.send(
      new CompleteMultipartUploadCommand({
        Bucket: process.env.R2_BUCKET_NAME,
        Key: video.key,
        UploadId: video.uploadId,
        MultipartUpload: {
          Parts: parts.sort((a, b) => a.PartNumber - b.PartNumber), // must be sorted
        },
      }),
    );

    // await db.videos.update(video.id, {});

    res.json({ status: "success", videoId: video.id });
  } catch (error) {
    console.log(error);
    next(new ApiError("حدث خطأ اثناء التحميل", 500));
  }
};

export const abortUpload = async (req, res, next) => {
  const { videoId } = req.body;
  const video = await db.videos.findOne({
    id: videoId,
    uploadedBy: req.user.id,
  });

  await r2.send(
    new AbortMultipartUploadCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: video.key,
      UploadId: video.uploadId,
    }),
  );

  // await db.videos.update(video.id, { status: "aborted" });
  res.json({ status: "success", message: "uploading aborted successfuly" });
};
