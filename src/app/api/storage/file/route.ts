import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/db";
import { getObjectStream, getPartialObjectStream, getObjectStats } from "@/lib/storage/minioClient";
import { Readable } from "stream";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const rawKey = searchParams.get("key") || searchParams.get("objectKey");

    if (!rawKey) {
      return NextResponse.json({ error: "Missing object key" }, { status: 400 });
    }

    const objectKey = decodeURIComponent(rawKey).trim();

    // Security Check 1: Prevent Directory Traversal
    if (objectKey.includes("..") || objectKey.startsWith("/") || objectKey.startsWith("\\")) {
      return NextResponse.json({ error: "Invalid object key path" }, { status: 400 });
    }

    // Security Check 2: Only permit GlarusAcademy course content namespaces
    const validPrefixes = ["courses/", "temporary/", "video-assets/", "resources/", "assignments/"];
    const hasValidPrefix = validPrefixes.some(prefix => objectKey.startsWith(prefix));
    if (!hasValidPrefix) {
      return NextResponse.json({ error: "Access denied: unauthorized storage namespace" }, { status: 403 });
    }

    // Authentication Check: User must have an active session
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized: authentication required to access course media" }, { status: 401 });
    }

    // ── IDOR SECURITY CHECK FOR PROTECTED VIDEO ASSETS ──
    const isVideoFile = objectKey.endsWith(".mp4") || objectKey.endsWith(".webm") ||
      objectKey.endsWith(".m4v") || objectKey.endsWith(".mov") || objectKey.endsWith(".mkv");

    if (session.role === "STUDENT" && isVideoFile) {
      // If objectKey is in video-assets/{videoAssetId}/...
      if (objectKey.startsWith("video-assets/")) {
        const parts = objectKey.split("/");
        const videoAssetId = parts[1];
        if (videoAssetId) {
          const videoAsset = await prisma.videoAsset.findUnique({
            where: { id: videoAssetId },
            include: { lecture: { include: { module: { include: { course: true } } } } },
          });

          const courseId = videoAsset?.lecture?.module?.courseId || videoAsset?.courseId;
          if (courseId) {
            const isEnrolled = await prisma.enrollment.findUnique({
              where: { userId_courseId: { userId: session.id, courseId } },
            });
            if (!isEnrolled) {
              const hasPurchase = await prisma.purchase.findFirst({
                where: { userId: session.id, courseId, paymentStatus: "COMPLETED" },
              });
              if (!hasPurchase) {
                return NextResponse.json(
                  { error: "Course enrollment required to stream this video file." },
                  { status: 403 }
                );
              }
            }
          }
        }
      } else if (objectKey.startsWith("courses/")) {
        const parts = objectKey.split("/");
        const courseId = parts[1];
        if (courseId) {
          const isEnrolled = await prisma.enrollment.findUnique({
            where: { userId_courseId: { userId: session.id, courseId } },
          });
          if (!isEnrolled) {
            const hasPurchase = await prisma.purchase.findFirst({
              where: { userId: session.id, courseId, paymentStatus: "COMPLETED" },
            });
            if (!hasPurchase) {
              return NextResponse.json(
                { error: "Course enrollment required to access course materials." },
                { status: 403 }
              );
            }
          }
        }
      }
    }

    // Fetch Object Stats & Handle Range Requests (HTTP 206)
    try {
      const stats = await getObjectStats(objectKey);
      const totalSize = Number(stats.size);

      // Determine Content Type
      let contentType = stats.metaData?.["content-type"] || "application/octet-stream";
      if (objectKey.endsWith(".mp4")) contentType = "video/mp4";
      else if (objectKey.endsWith(".webm")) contentType = "video/webm";
      else if (objectKey.endsWith(".m4v")) contentType = "video/x-m4v";
      else if (objectKey.endsWith(".mov")) contentType = "video/quicktime";
      else if (objectKey.endsWith(".mkv")) contentType = "video/x-matroska";
      else if (objectKey.endsWith(".m3u8")) contentType = "application/vnd.apple.mpegurl";
      else if (objectKey.endsWith(".ts")) contentType = "video/MP2T";
      else if (objectKey.endsWith(".png")) contentType = "image/png";
      else if (objectKey.endsWith(".jpg") || objectKey.endsWith(".jpeg")) contentType = "image/jpeg";
      else if (objectKey.endsWith(".webp")) contentType = "image/webp";
      else if (objectKey.endsWith(".pdf")) contentType = "application/pdf";
      else if (objectKey.endsWith(".zip")) contentType = "application/zip";

      const originalFilename = stats.metaData?.["x-amz-meta-original-filename"]
        ? decodeURIComponent(stats.metaData["x-amz-meta-original-filename"])
        : objectKey.split("/").pop() || "file";

      // Parse Range Header for seeking (HTTP 206)
      const rangeHeader = req.headers.get("range");
      let nodeStream: any;
      let statusCode = 200;
      let start = 0;
      let end = totalSize - 1;
      let contentLength = totalSize;

      if (rangeHeader && rangeHeader.startsWith("bytes=") && totalSize > 0) {
        const parts = rangeHeader.replace("bytes=", "").split("-");
        const requestedStart = parseInt(parts[0], 10);
        const requestedEnd = parts[1] ? parseInt(parts[1], 10) : end;

        if (!isNaN(requestedStart) && requestedStart < totalSize) {
          start = requestedStart;
          end = Math.min(requestedEnd, totalSize - 1);
          contentLength = end - start + 1;
          statusCode = 206;
          nodeStream = await getPartialObjectStream(objectKey, start, contentLength);
        } else {
          nodeStream = await getObjectStream(objectKey);
        }
      } else {
        nodeStream = await getObjectStream(objectKey);
      }

      // Convert Node.js Readable stream to Web ReadableStream
      const webStream = new ReadableStream({
        start(controller) {
          nodeStream.on("data", (chunk: any) => controller.enqueue(chunk));
          nodeStream.on("end", () => controller.close());
          nodeStream.on("error", (err: any) => controller.error(err));
        },
        cancel() {
          nodeStream.destroy?.();
        }
      });

      const headers = new Headers();
      headers.set("Content-Type", contentType);
      headers.set("Content-Length", String(contentLength));
      headers.set("Accept-Ranges", "bytes");
      headers.set("Cache-Control", "public, max-age=86400, stale-while-revalidate=3600");

      if (statusCode === 206) {
        headers.set("Content-Range", `bytes ${start}-${end}/${totalSize}`);
      }

      headers.set(
        "Content-Disposition",
        contentType.startsWith("video/") || contentType.startsWith("image/") || contentType === "application/pdf" || contentType.includes("mpegurl")
          ? `inline; filename="${encodeURIComponent(originalFilename)}"`
          : `attachment; filename="${encodeURIComponent(originalFilename)}"`
      );

      return new Response(webStream, {
        status: statusCode,
        headers
      });
    } catch (minioErr: any) {
      console.warn(`[MinIO File Access] Failed to stream ${objectKey}:`, minioErr?.message);
      return NextResponse.json(
        { error: "Object not found or storage temporarily unavailable" },
        { status: 404 }
      );
    }
  } catch (error: any) {
    console.error("[Storage Route Error]:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
