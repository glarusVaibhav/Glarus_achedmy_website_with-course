import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getSession } from "@/lib/auth";
import { canAccessVideoAsset } from "@/lib/video/entitlement";
import { generateSignedPlaybackUrl } from "@/lib/video/bunnyStreamService";
import { syncBunnyAsset } from "@/lib/video/bunnySync";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { error: "Authentication required to stream course video." },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    let videoAssetId = searchParams.get("id") || searchParams.get("videoAssetId");
    const lectureId = searchParams.get("lectureId");

    // If lectureId provided, resolve videoAssetId from lecture
    if (!videoAssetId && lectureId) {
      const lecture = await prisma.lecture.findUnique({
        where: { id: lectureId },
        include: { videoAsset: true },
      });
      if (lecture?.videoAsset) {
        videoAssetId = lecture.videoAsset.id;
      }
    }

    if (!videoAssetId) {
      return NextResponse.json(
        { error: "Missing video ID or lecture ID" },
        { status: 400 }
      );
    }

    const entitlement = await canAccessVideoAsset(session.id, session.role || "STUDENT", videoAssetId);

    if (!entitlement.allowed) {
      return NextResponse.json(
        { error: entitlement.reason || "Access denied to this video." },
        { status: entitlement.statusCode || 403 }
      );
    }

    let videoAsset = entitlement.videoAsset;

    // PATH Y: YOUTUBE VIDEO
    if (videoAsset.provider === "YOUTUBE" && videoAsset.providerVideoId) {
      const embedUrl = `https://www.youtube-nocookie.com/embed/${videoAsset.providerVideoId}?enablejsapi=1&rel=0&modestbranding=1&playsinline=1`;
      const thumbnailUrl = videoAsset.thumbnailKey || `https://img.youtube.com/vi/${videoAsset.providerVideoId}/hqdefault.jpg`;

      return NextResponse.json({
        success: true,
        provider: "YOUTUBE",
        videoAssetId: videoAsset.id,
        providerVideoId: videoAsset.providerVideoId,
        playbackUrl: embedUrl,
        embedUrl,
        thumbnailUrl,
        durationSeconds: videoAsset.durationSeconds,
        status: videoAsset.status || "READY",
      });
    }

    if (videoAsset.provider === "BUNNY_STREAM" && videoAsset.providerVideoId) {
      if (videoAsset.status !== "READY" && videoAsset.status !== "FAILED") {
        const syncResult = await syncBunnyAsset(videoAsset);
        videoAsset = syncResult.asset;
      }

      const signed = generateSignedPlaybackUrl(videoAsset.providerVideoId, 10800);

      return NextResponse.json({
        success: true,
        provider: "BUNNY_STREAM",
        videoAssetId: videoAsset.id,
        providerVideoId: videoAsset.providerVideoId,
        playbackUrl: signed.playbackUrl,
        mpdUrl: signed.mpdUrl,
        thumbnailUrl: signed.thumbnailUrl,
        previewAnimationUrl: signed.previewAnimationUrl,
        durationSeconds: videoAsset.durationSeconds,
        width: videoAsset.width,
        height: videoAsset.height,
        resolutions: videoAsset.resolutions,
        status: videoAsset.status,
        expiresAt: signed.expiresAt,
      });
    }

    if (videoAsset.masterPlaylistKey) {
      return NextResponse.json({
        success: true,
        provider: "MINIO_LEGACY",
        videoAssetId: videoAsset.id,
        playbackUrl: `/api/videos/hls/${videoAsset.masterPlaylistKey}`,
        thumbnailUrl: videoAsset.thumbnailKey
          ? `/api/storage/file?key=${encodeURIComponent(videoAsset.thumbnailKey)}`
          : null,
        durationSeconds: videoAsset.durationSeconds,
        width: videoAsset.width,
        height: videoAsset.height,
        resolutions: videoAsset.resolutions,
        status: videoAsset.status,
      });
    }

    const fallbackUrl = videoAsset.originalKey
      ? `/api/storage/file?key=${encodeURIComponent(videoAsset.originalKey)}`
      : videoAsset.lecture?.videoUrl;

    return NextResponse.json({
      success: true,
      provider: videoAsset.provider || "MINIO_LEGACY",
      videoAssetId: videoAsset.id,
      playbackUrl: fallbackUrl,
      thumbnailUrl: videoAsset.thumbnailKey
        ? `/api/storage/file?key=${encodeURIComponent(videoAsset.thumbnailKey)}`
        : null,
      durationSeconds: videoAsset.durationSeconds,
      status: videoAsset.status,
    });
  } catch (err: any) {
    console.error("[Playback Token Query API Error]:", err);
    return NextResponse.json(
      { error: "Failed to generate video playback token" },
      { status: 500 }
    );
  }
}
