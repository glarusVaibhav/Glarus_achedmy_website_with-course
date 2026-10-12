import { NextResponse } from "next/server";
import path from "path";
import crypto from "crypto";
import prisma from "@/lib/db";
import { getSession } from "@/lib/auth";
import {
  getMinioClient,
  getCourseBucketName,
  ensureCourseBucketExists,
  withTimeout
} from "@/lib/storage/minioClient";

export const dynamic = "force-dynamic";

const ALLOWED_EXTENSIONS = [".mp4", ".mov", ".webm", ".m4v", ".mkv"];
const ALLOWED_MIME_TYPES = [
  "video/mp4",
  "video/webm",
  "video/quicktime",
  "video/x-m4v",
  "video/x-matroska",
  "video/mkv",
  "application/octet-stream"
];
const MAX_FILE_SIZE_BYTES = Math.floor(2.5 * 1024 * 1024 * 1024); // 2.5 GB (2560 MB)

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session || (session.role !== "ADMIN" && session.role !== "INSTRUCTOR")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const rawFilename = body.filename || body.fileName;
    const rawContentType = body.contentType || body.mimeType;
    const rawSize = body.size || body.fileSize;
    const { courseId, lectureId } = body;

    if (!rawFilename) {
      return NextResponse.json({ error: "Filename is required" }, { status: 400 });
    }

    const filename = String(rawFilename);
    const contentType = rawContentType ? String(rawContentType) : undefined;
    const size = typeof rawSize === "number" ? rawSize : undefined;

    const ext = path.extname(filename).toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      return NextResponse.json(
        { error: `Unsupported file extension "${ext}". Allowed extensions: ${ALLOWED_EXTENSIONS.join(", ")}` },
        { status: 400 }
      );
    }

    if (contentType && !ALLOWED_MIME_TYPES.includes(contentType)) {
      return NextResponse.json(
        { error: `Invalid MIME type "${contentType}".` },
        { status: 400 }
      );
    }

    if (size && size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json(
        { error: `File size exceeds 2.5 GB limit (${(size / (1024 * 1024 * 1024)).toFixed(2)} GB provided).` },
        { status: 400 }
      );
    }

    const sanitizedBase = path
      .basename(filename, ext)
      .replace(/[^a-zA-Z0-9_-]/g, "_")
      .slice(0, 40);

    // Create VideoAsset in database in UPLOADING state
    const videoAsset = await prisma.videoAsset.create({
      data: {
        courseId: courseId || null,
        lectureId: lectureId || null,
        originalFilename: filename,
        status: "UPLOADING"
      }
    });

    const objectKey = `video-assets/${videoAsset.id}/original/${sanitizedBase}${ext}`;

    // Update with originalKey
    await prisma.videoAsset.update({
      where: { id: videoAsset.id },
      data: { originalKey: objectKey }
    });

    // Ensure MinIO bucket exists
    await ensureCourseBucketExists();
    const minioClient = getMinioClient();
    const bucket = getCourseBucketName();

    // Generate Presigned Upload URL (valid for 1 hour)
    const uploadUrl = await withTimeout(
      minioClient.presignedPutObject(bucket, objectKey, 3600),
      4000
    );

    return NextResponse.json({
      success: true,
      videoAssetId: videoAsset.id,
      uploadUrl,
      objectKey,
      bucket,
      storage: "minio"
    });
  } catch (err: any) {
    console.error("[Presigned Upload URL Error]:", err);
    return NextResponse.json(
      { error: err?.message || "Failed to generate upload URL" },
      { status: 500 }
    );
  }
}
