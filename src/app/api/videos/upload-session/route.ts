import { NextResponse } from "next/server";
import path from "path";
import prisma from "@/lib/db";
import { getSession } from "@/lib/auth";
import { isBunnyStreamEnabled } from "@/lib/video/config";
import { createBunnyVideo, generateTusUploadAuth } from "@/lib/video/bunnyStreamService";
import {
  getMinioClient,
  getCourseBucketName,
  ensureCourseBucketExists,
  withTimeout,
} from "@/lib/storage/minioClient";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session || (session.role !== "ADMIN" && session.role !== "INSTRUCTOR")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { title, filename, fileSize, courseId, lectureId } = body;

    if (!title && !filename) {
      return NextResponse.json(
        { error: "Title or filename is required" },
        { status: 400 }
      );
    }

    const videoTitle = title || filename || "Untitled Video";

    // ── PATH A: BUNNY STREAM DIRECT TUS UPLOAD ──
    if (isBunnyStreamEnabled()) {
      try {
        const bunnyVideo = await createBunnyVideo(videoTitle);
        const libraryId = String(bunnyVideo.libraryId || bunnyVideo.videoLibraryId || "");

        const videoAsset = await prisma.videoAsset.create({
          data: {
            courseId: courseId || null,
            lectureId: lectureId || null,
            originalFilename: filename || null,
            fileSizeBytes: fileSize ? BigInt(fileSize) : null,
            provider: "BUNNY_STREAM",
            providerVideoId: bunnyVideo.guid,
            providerLibraryId: libraryId,
            status: "UPLOADING",
            uploadedById: session.id,
          },
        });

        const tusAuth = generateTusUploadAuth(bunnyVideo.guid);

        return NextResponse.json({
          success: true,
          provider: "BUNNY_STREAM",
          videoAssetId: videoAsset.id,
          providerVideoId: bunnyVideo.guid,
          uploadEndpoint: tusAuth.uploadEndpoint,
          tusHeaders: tusAuth.tusHeaders,
        });
      } catch (bunnyErr: any) {
        console.warn("[Upload Session] Bunny Stream creation notice, falling back to MinIO:", bunnyErr?.message);
        // Fall through to MinIO fallback below if Bunny API is unreachable
      }
    }

    // ── PATH B: MINIO LEGACY PRESIGNED UPLOAD FALLBACK ──
    const sanitizedExt = filename ? path.extname(filename).toLowerCase() : ".mp4";
    const sanitizedBase = filename
      ? path.basename(filename, sanitizedExt).replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 40)
      : "video";

    const videoAsset = await prisma.videoAsset.create({
      data: {
        courseId: courseId || null,
        lectureId: lectureId || null,
        originalFilename: filename || null,
        fileSizeBytes: fileSize ? BigInt(fileSize) : null,
        provider: "MINIO_LEGACY",
        status: "UPLOADING",
        uploadedById: session.id,
      },
    });

    const objectKey = `video-assets/${videoAsset.id}/original/${sanitizedBase}${sanitizedExt}`;

    await prisma.videoAsset.update({
      where: { id: videoAsset.id },
      data: { originalKey: objectKey },
    });

    await ensureCourseBucketExists();
    const minioClient = getMinioClient();
    const bucket = getCourseBucketName();

    const uploadUrl = await withTimeout(
      minioClient.presignedPutObject(bucket, objectKey, 3600),
      4000
    );

    return NextResponse.json({
      success: true,
      provider: "MINIO_LEGACY",
      videoAssetId: videoAsset.id,
      uploadUrl,
      objectKey,
      bucket,
      storage: "minio",
    });
  } catch (err: any) {
    console.error("[Upload Session Route Error]:", err);
    return NextResponse.json(
      { error: err?.message || "Failed to create upload session" },
      { status: 500 }
    );
  }
}
