import {
  CreateMultipartUploadCommand,
  UploadPartCommand,
  CompleteMultipartUploadCommand,
  AbortMultipartUploadCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { s3Client } from "../config/r2.js";
import { R2_BUCKET } from "../config/env.js";
import { v4 as uuid } from "uuid";

// Start Multipart Upload
export const startMultipartUpload = async (fileName, fileType, userId) => {
  const key = `uploads/${userId}/${uuid()}/${fileName}`;

  const command = new CreateMultipartUploadCommand({
    Bucket: "courses-videos",
    Key: key,
    ContentType: fileType,
  });

  const response = await s3Client.send(command);

  return {
    uploadId: response.UploadId,
    key: command.input.Key,
  };
};

// Generate Pre-Signed URLs (for each part)
export const getMultipartPresignedUrls = async (key, uploadId, partsCount) => {
  const urls = [];

  for (let partNumber = 1; partNumber <= partsCount; partNumber++) {
    const command = new UploadPartCommand({
      Bucket: R2_BUCKET,
      Key: key,
      UploadId: uploadId,
      PartNumber: partNumber,
    });

    const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 });

    urls.push({
      partNumber,
      url,
    });
  }

  return urls;
};

// Complete Multipart Upload
export const completeMultipartUpload = async (key, uploadId, parts) => {
  const command = new CompleteMultipartUploadCommand({
    Bucket: R2_BUCKET,
    Key: key,
    UploadId: uploadId,
    MultipartUpload: {
      Parts: parts.sort((a, b) => a.PartNumber - b.PartNumber), // [{ ETag, PartNumber }]
    },
  });

  return await s3Client.send(command);
};

// Abort Multipart Uploads
export const abortUpload = async (req, res, next) => {
  const { videoId } = req.body;
  const video = await db.videos.findOne({
    id: videoId,
    uploadedBy: req.user.id,
  });

  await s3Client.send(
    new AbortMultipartUploadCommand({
      Bucket: R2_BUCKET,
      Key: video.key,
      UploadId: video.uploadId,
    }),
  );

  // await db.videos.update(video.id, { status: "aborted" });
  res.json({ status: "success", message: "uploading aborted successfuly" });
};

// Cleanup job — runs every 24h
export async function abortStaleMultipartUploads() {
  const stale = await db.videos.findAll({
    status: "pending",
    createdAt: { $lt: new Date(Date.now() - 48 * 60 * 60 * 1000) }, // older than 48h
  });

  for (const video of stale) {
    if (!video.uploadId) continue;
    await r2.send(
      new AbortMultipartUploadCommand({
        Bucket: R2_BUCKET,
        Key: video.key,
        UploadId: video.uploadId,
      }),
    );
    await db.videos.update(video.id, { status: "expired" });
  }
}
