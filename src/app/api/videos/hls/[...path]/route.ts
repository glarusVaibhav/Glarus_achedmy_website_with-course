import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/db";
import { getObjectStream, getObjectStats } from "@/lib/storage/minioClient";

export const dynamic = "force-dynamic";

export async function GET(
  req: Request,
  props: { params: Promise<{ path: string[] }> }
) {
  try {
    const params = await props.params;
    const pathSegments = params.path;

    if (!pathSegments || pathSegments.length === 0) {
      return NextResponse.json({ error: "Invalid path" }, { status: 400 });
    }

    // Reconstruct object key (e.g. video-assets/{id}/hls/master.m3u8)
    const objectKey = pathSegments.join("/");

    // Security Check: Path Traversal
    if (objectKey.includes("..") || objectKey.startsWith("/") || objectKey.startsWith("\\")) {
      return NextResponse.json({ error: "Invalid object key path" }, { status: 400 });
    }

    if (!objectKey.startsWith("video-assets/")) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Authentication
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized: active session required" }, { status: 401 });
    }

    // Extract videoAssetId: video-assets/{videoAssetId}/...
    const parts = objectKey.split("/");
    const videoAssetId = parts[1];

    if (videoAssetId && session.role === "STUDENT") {
      // Check authorization against course enrollment
      const videoAsset = await prisma.videoAsset.findUnique({
        where: { id: videoAssetId },
        include: {
          lecture: {
            include: {
              module: {
                include: {
                  course: true
                }
              }
            }
          }
        }
      });

      if (videoAsset) {
        const course = videoAsset.lecture?.module?.course;
        const courseId = course?.id || videoAsset.courseId;

        // If not a free preview, check enrollment
        if (courseId) {
          const isEnrolled = await prisma.enrollment.findUnique({
            where: {
              userId_courseId: {
                userId: session.id,
                courseId: courseId
              }
            }
          });

          if (!isEnrolled) {
            // Check if user has completed purchase
            const hasPurchase = await prisma.purchase.findFirst({
              where: {
                userId: session.id,
                courseId: courseId,
                paymentStatus: "COMPLETED"
              }
            });

            if (!hasPurchase) {
              return NextResponse.json(
                { error: "Course enrollment required to stream this lecture" },
                { status: 403 }
              );
            }
          }
        }
      }
    }

    // Stream from MinIO
    const stats = await getObjectStats(objectKey);
    const nodeStream = await getObjectStream(objectKey);

    let contentType = "application/octet-stream";
    if (objectKey.endsWith(".m3u8")) {
      contentType = "application/vnd.apple.mpegurl";
    } else if (objectKey.endsWith(".ts")) {
      contentType = "video/MP2T";
    } else if (objectKey.endsWith(".jpg") || objectKey.endsWith(".jpeg")) {
      contentType = "image/jpeg";
    }

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
    headers.set("Content-Length", String(stats.size));
    headers.set("Accept-Ranges", "bytes");

    // Cache segments aggressively (immutable chunks), playlists shorter
    if (objectKey.endsWith(".ts")) {
      headers.set("Cache-Control", "public, max-age=31536000, immutable");
    } else {
      headers.set("Cache-Control", "public, max-age=3600, stale-while-revalidate=600");
    }

    return new Response(webStream, {
      status: 200,
      headers
    });
  } catch (err: any) {
    console.error("[HLS Stream Error]:", err);
    return NextResponse.json({ error: "Stream unavailable or not found" }, { status: 404 });
  }
}
