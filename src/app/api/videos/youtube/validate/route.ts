import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import {
  parseYouTubeVideoId,
  fetchYouTubeOEmbed,
  getYouTubeEmbedUrl,
  getYouTubeThumbnailUrl,
} from "@/lib/video/youtubeService";

export const dynamic = "force-dynamic";

async function processValidation(rawUrl?: string | null) {
  if (!rawUrl || typeof rawUrl !== "string") {
    return {
      status: 400,
      data: { error: "YouTube URL or Video ID is required.", valid: false },
    };
  }

  const videoId = parseYouTubeVideoId(rawUrl);

  if (!videoId) {
    return {
      status: 400,
      data: {
        error:
          "Invalid YouTube URL or Video ID. Please provide a valid link (e.g. https://www.youtube.com/watch?v=... or https://youtu.be/...).",
        valid: false,
      },
    };
  }

  // Fetch oEmbed metadata
  const oembed = await fetchYouTubeOEmbed(videoId);
  const embedUrl = getYouTubeEmbedUrl(videoId);
  const thumbnailUrl = getYouTubeThumbnailUrl(videoId, "hq");

  const metadata = {
    videoId,
    title: oembed?.title || `YouTube Video (${videoId})`,
    authorName: oembed?.authorName || "YouTube Channel",
    authorUrl: oembed?.authorUrl || `https://www.youtube.com/watch?v=${videoId}`,
    thumbnailUrl: oembed?.thumbnailUrl || thumbnailUrl,
    embedUrl,
    provider: "YOUTUBE" as const,
  };

  return {
    status: 200,
    data: {
      success: true,
      valid: true,
      ...metadata,
      metadata,
    },
  };
}

export async function GET(req: Request) {
  try {
    const session = await getSession();
    if (!session || (session.role !== "ADMIN" && session.role !== "INSTRUCTOR")) {
      return NextResponse.json(
        { error: "Unauthorized: Admin or Instructor access required." },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const rawUrl = searchParams.get("url") || searchParams.get("link") || searchParams.get("videoId");

    const result = await processValidation(rawUrl);
    return NextResponse.json(result.data, { status: result.status });
  } catch (err: any) {
    console.error("[YouTube Validate GET Error]:", err);
    return NextResponse.json(
      { error: err?.message || "Failed to validate YouTube video.", valid: false },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session || (session.role !== "ADMIN" && session.role !== "INSTRUCTOR")) {
      return NextResponse.json(
        { error: "Unauthorized: Admin or Instructor access required." },
        { status: 401 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const rawUrl = body.url || body.link || body.videoId;

    const result = await processValidation(rawUrl);
    return NextResponse.json(result.data, { status: result.status });
  } catch (err: any) {
    console.error("[YouTube Validate POST Error]:", err);
    return NextResponse.json(
      { error: err?.message || "Failed to validate YouTube video.", valid: false },
      { status: 500 }
    );
  }
}
