import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getSession } from "@/lib/auth";
import { parseYouTubeVideoId, fetchYouTubeOEmbed, getYouTubeEmbedUrl, getYouTubeThumbnailUrl } from "@/lib/video/youtubeService";

export const dynamic = "force-dynamic";

/**
 * YouTube Video Attachment API
 * 
 * Attaches a validated YouTube video to a course lecture and persists a VideoAsset record with status READY.
 */
export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session || (session.role !== "ADMIN" && session.role !== "INSTRUCTOR")) {
      return NextResponse.json({ error: "Unauthorized: Admin or Instructor access required." }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const rawUrl = body.url || body.link || body.videoId;
    const { courseId, lectureId, title } = body;

    if (!rawUrl || typeof rawUrl !== "string") {
      return NextResponse.json(
        { error: "YouTube URL or Video ID is required." },
        { status: 400 }
      );
    }

    const videoId = parseYouTubeVideoId(rawUrl);

    if (!videoId) {
      return NextResponse.json(
        { error: "Invalid YouTube URL or Video ID." },
        { status: 400 }
      );
    }

    const metadata = await fetchYouTubeOEmbed(videoId);
    const videoTitle = title || metadata?.title || `YouTube Video (${videoId})`;
    const thumbnailUrl = metadata?.thumbnailUrl || getYouTubeThumbnailUrl(videoId, "hq");
    const embedUrl = getYouTubeEmbedUrl(videoId);

    // Create or update VideoAsset with provider = "YOUTUBE"
    let videoAsset;
    if (lectureId) {
      // Check if existing VideoAsset is attached to this lecture
      const existing = await prisma.videoAsset.findFirst({
        where: { lectureId },
      });

      if (existing) {
        videoAsset = await prisma.videoAsset.update({
          where: { id: existing.id },
          data: {
            provider: "YOUTUBE",
            providerVideoId: videoId,
            status: "READY",
            originalFilename: videoTitle,
            thumbnailKey: thumbnailUrl,
            uploadedById: session.id,
            courseId: courseId || existing.courseId,
            errorMessage: null,
          },
        });
      } else {
        videoAsset = await prisma.videoAsset.create({
          data: {
            lectureId,
            courseId: courseId || null,
            originalFilename: videoTitle,
            provider: "YOUTUBE",
            providerVideoId: videoId,
            status: "READY",
            thumbnailKey: thumbnailUrl,
            uploadedById: session.id,
          },
        });
      }

      // Update Lecture record with embed URL
      await prisma.lecture.update({
        where: { id: lectureId },
        data: {
          videoUrl: embedUrl,
        },
      }).catch((err) => {
        console.warn("[YouTube Attach Notice] Lecture update notice:", err?.message);
      });
    } else {
      videoAsset = await prisma.videoAsset.create({
        data: {
          courseId: courseId || null,
          originalFilename: videoTitle,
          provider: "YOUTUBE",
          providerVideoId: videoId,
          status: "READY",
          thumbnailKey: thumbnailUrl,
          uploadedById: session.id,
        },
      });
    }

    return NextResponse.json({
      success: true,
      provider: "YOUTUBE",
      videoAssetId: videoAsset.id,
      providerVideoId: videoId,
      embedUrl,
      thumbnailUrl,
      title: videoTitle,
      status: "READY",
    });
  } catch (err: any) {
    console.error("[YouTube Attach API Error]:", err);
    return NextResponse.json(
      { error: err?.message || "Failed to attach YouTube video." },
      { status: 500 }
    );
  }
}
