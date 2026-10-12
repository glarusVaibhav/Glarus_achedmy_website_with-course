import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getSession } from "@/lib/auth";
import { generateSignedPlaybackUrl, getBunnyVideoInfo, mapBunnyStatusToVideoStatus } from "@/lib/video/bunnyStreamService";

export const dynamic = "force-dynamic";

export async function GET(
  req: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await props.params;

    const initialAsset = await prisma.videoAsset.findUnique({
      where: { id },
      include: {
        lecture: {
          select: {
            id: true,
            title: true,
            duration: true,
          },
        },
      },
    });

    if (!initialAsset) {
      return NextResponse.json({ error: "VideoAsset not found" }, { status: 404 });
    }

    let asset = initialAsset;
    let encodeProgress = 0;

    // If Bunny Stream asset is being uploaded or processed, poll Bunny API for live status
    if (asset.provider === "BUNNY_STREAM" && asset.providerVideoId && (asset.status === "PROCESSING" || asset.status === "UPLOADING")) {
      try {
        const bunnyInfo = await getBunnyVideoInfo(asset.providerVideoId);
        encodeProgress = bunnyInfo.encodeProgress || 0;
        const mapped = mapBunnyStatusToVideoStatus(bunnyInfo.status);

        if (mapped === "PROCESSING" && asset.status === "UPLOADING") {
          asset = await prisma.videoAsset.update({
            where: { id: asset.id },
            data: { status: "PROCESSING" },
            include: {
              lecture: {
                select: { id: true, title: true, duration: true },
              },
            },
          });
        } else if (mapped === "READY") {
          const resolutionsArray = bunnyInfo.availableResolutions
            ? bunnyInfo.availableResolutions.split(",").filter(Boolean).map((r: string) => r.trim())
            : (asset.resolutions as any);

          asset = await prisma.videoAsset.update({
            where: { id: asset.id },
            data: {
              status: "READY",
              durationSeconds: bunnyInfo.length ? Math.round(bunnyInfo.length) : asset.durationSeconds,
              width: bunnyInfo.width || asset.width,
              height: bunnyInfo.height || asset.height,
              fileSizeBytes: bunnyInfo.storageSize ? BigInt(bunnyInfo.storageSize) : asset.fileSizeBytes,
              resolutions: resolutionsArray,
            },
            include: {
              lecture: {
                select: { id: true, title: true, duration: true },
              },
            },
          });
        } else if (mapped === "FAILED") {
          asset = await prisma.videoAsset.update({
            where: { id: asset.id },
            data: {
              status: "FAILED",
              errorMessage: "Bunny Stream transcoding failed",
            },
            include: {
              lecture: {
                select: { id: true, title: true, duration: true },
              },
            },
          });
        }
      } catch {
        // Continue with current DB asset if Bunny API is temporarily slow
      }
    }

    let hlsStreamUrl: string | null = null;
    let thumbnailUrl: string | null = null;

    if (asset.provider === "BUNNY_STREAM" && asset.providerVideoId) {
      const signed = generateSignedPlaybackUrl(asset.providerVideoId, 10800);
      hlsStreamUrl = signed.playbackUrl;
      thumbnailUrl = signed.thumbnailUrl;
    } else {
      hlsStreamUrl = asset.masterPlaylistKey ? `/api/videos/hls/${asset.masterPlaylistKey}` : null;
      thumbnailUrl = asset.thumbnailKey ? `/api/storage/file?key=${encodeURIComponent(asset.thumbnailKey)}` : null;
    }

    return NextResponse.json({
      success: true,
      asset: {
        id: asset.id,
        provider: asset.provider || "MINIO_LEGACY",
        providerVideoId: asset.providerVideoId,
        status: asset.status,
        encodeProgress,
        originalFilename: asset.originalFilename,
        originalKey: asset.originalKey,
        masterPlaylistKey: asset.masterPlaylistKey,
        thumbnailKey: asset.thumbnailKey,
        durationSeconds: asset.durationSeconds,
        width: asset.width,
        height: asset.height,
        fps: asset.fps,
        bitrate: asset.bitrate ? asset.bitrate.toString() : null,
        fileSizeBytes: asset.fileSizeBytes ? asset.fileSizeBytes.toString() : null,
        videoCodec: asset.videoCodec,
        audioCodec: asset.audioCodec,
        resolutions: asset.resolutions,
        errorMessage: asset.errorMessage,
        hlsStreamUrl,
        thumbnailUrl,
        lecture: asset.lecture,
      },
    });
  } catch (err: any) {
    console.error("[Video Status API Error]:", err);
    return NextResponse.json({ error: "Failed to fetch video status" }, { status: 500 });
  }
}

