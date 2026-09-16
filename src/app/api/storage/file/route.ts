import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getObjectStream, getObjectStats } from "@/lib/storage/minioClient";
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

    // Security Check 2: Only permit GlarusAcademy course content prefixes
    if (!objectKey.startsWith("courses/") && !objectKey.startsWith("temporary/")) {
      return NextResponse.json({ error: "Access denied: unauthorized storage namespace" }, { status: 403 });
    }

    // Authentication Check: User must have an active session
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized: authentication required to access course media" }, { status: 401 });
    }

    // Fetch Object Stats & Stream from MinIO
    try {
      const stats = await getObjectStats(objectKey);
      const nodeStream = await getObjectStream(objectKey);

      // Determine Content Type
      let contentType = stats.metaData?.["content-type"] || "application/octet-stream";
      if (objectKey.endsWith(".mp4")) contentType = "video/mp4";
      else if (objectKey.endsWith(".webm")) contentType = "video/webm";
      else if (objectKey.endsWith(".png")) contentType = "image/png";
      else if (objectKey.endsWith(".jpg") || objectKey.endsWith(".jpeg")) contentType = "image/jpeg";
      else if (objectKey.endsWith(".webp")) contentType = "image/webp";
      else if (objectKey.endsWith(".pdf")) contentType = "application/pdf";
      else if (objectKey.endsWith(".zip")) contentType = "application/zip";

      // Convert Node.js Readable stream to Web ReadableStream
      const webStream = new ReadableStream({
        start(controller) {
          nodeStream.on("data", (chunk) => controller.enqueue(chunk));
          nodeStream.on("end", () => controller.close());
          nodeStream.on("error", (err) => controller.error(err));
        },
        cancel() {
          nodeStream.destroy();
        }
      });

      const originalFilename = stats.metaData?.["x-amz-meta-original-filename"]
        ? decodeURIComponent(stats.metaData["x-amz-meta-original-filename"])
        : objectKey.split("/").pop() || "file";

      // Set headers for caching, streaming, and previewing
      const headers = new Headers();
      headers.set("Content-Type", contentType);
      headers.set("Content-Length", String(stats.size));
      headers.set("Accept-Ranges", "bytes");
      headers.set("Cache-Control", "public, max-age=86400, stale-while-revalidate=3600");
      headers.set(
        "Content-Disposition",
        contentType.startsWith("video/") || contentType.startsWith("image/") || contentType === "application/pdf"
          ? `inline; filename="${encodeURIComponent(originalFilename)}"`
          : `attachment; filename="${encodeURIComponent(originalFilename)}"`
      );

      return new Response(webStream, {
        status: 200,
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
