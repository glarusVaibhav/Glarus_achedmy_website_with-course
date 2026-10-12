import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { canAccessVideoAsset } from "@/lib/video/entitlement";
import { generateSignedPlaybackUrl } from "@/lib/video/bunnyStreamService";
import { syncBunnyAsset } from "@/lib/video/bunnySync";

export const dynamic = "force-dynamic";

/**
 * Playback Token API — Glarus Academy
 * 
 * Verifies student/instructor entitlement against PostgreSQL database
 * and generates a time-limited signed HLS/DASH streaming URL for Bunny Stream
 * or authenticated MinIO stream for legacy videos.
 */
export async function GET(
  req: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { error: "Authentication required to stream course video." },
        { status: 401 }
      );
    }

    const { id } = await props.params;

    if (!id) {
      return NextResponse.json({ error: "Video ID is required" }, { status: 400 });
    }

    // Run central server-side entitlement check (anti-IDOR)
    const entitlement = await canAccessVideoAsset(session.id, session.role || "STUDENT", id);

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

    // PATH A: BUNNY STREAM VIDEO
    if (videoAsset.provider === "BUNNY_STREAM" && videoAsset.providerVideoId) {
      // Auto-sync pending Bunny video status so playback is immediately available once finished
      if (videoAsset.status !== "READY" && videoAsset.status !== "FAILED") {
        const syncResult = await syncBunnyAsset(videoAsset);
        videoAsset = syncResult.asset;
      }

      const signed = generateSignedPlaybackUrl(videoAsset.providerVideoId, 10800); // 3-hour expiry

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

    // PATH B: MINIO LEGACY VIDEO
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

    // Direct MP4 fallback if HLS is still processing or raw file exists
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
    console.error("[Playback Token API Error]:", err);
    return NextResponse.json(
      { error: "Failed to generate video playback token" },
      { status: 500 }
    );
  }
}
