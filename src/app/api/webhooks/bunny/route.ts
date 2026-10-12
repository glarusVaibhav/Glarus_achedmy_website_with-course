import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import {
  verifyWebhookSignature,
  mapBunnyStatusToVideoStatus,
  getBunnyVideoInfo,
} from "@/lib/video/bunnyStreamService";

export const dynamic = "force-dynamic";

/**
 * Bunny Stream Webhook Receiver
 * 
 * Receives encoding completion and status events from Bunny Stream
 * and updates VideoAsset in PostgreSQL idempotently.
 */
export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const signatureHeader =
      req.headers.get("webhook-signature") ||
      req.headers.get("x-bunnystream-signature") ||
      req.headers.get("x-bunny-signature") ||
      "";

    const webhookSecret = process.env.BUNNY_WEBHOOK_SIGNING_KEY || process.env.BUNNY_STREAM_WEBHOOK_SECRET;

    // Verify webhook signature if a secret key is set
    if (webhookSecret && webhookSecret.length > 0) {
      const isValid = verifyWebhookSignature(rawBody, signatureHeader);
      if (!isValid) {
        console.warn("[Bunny Webhook] Invalid signature rejected");
        return NextResponse.json(
          { error: "Invalid webhook signature" },
          { status: 403 }
        );
      }
    }

    let payload: any;
    try {
      payload = JSON.parse(rawBody);
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const { VideoGuid, VideoLibraryId, Status } = payload;

    if (!VideoGuid) {
      return NextResponse.json(
        { error: "Missing VideoGuid in webhook payload" },
        { status: 400 }
      );
    }

    console.log(`[Bunny Webhook] Received event: VideoGuid=${VideoGuid}, Status=${Status}`);

    // Look up VideoAsset by providerVideoId
    const videoAsset = await prisma.videoAsset.findUnique({
      where: { providerVideoId: VideoGuid },
    });

    if (!videoAsset) {
      console.warn(`[Bunny Webhook] No VideoAsset matched for VideoGuid: ${VideoGuid}`);
      // Return 200 so Bunny does not endlessly retry unknown video events
      return NextResponse.json({ received: true, matched: false });
    }

    const newStatus = mapBunnyStatusToVideoStatus(Number(Status));

    const updateData: Record<string, any> = {
      status: newStatus,
    };

    if (newStatus === "READY") {
      try {
        const videoInfo = await getBunnyVideoInfo(VideoGuid);

        if (videoInfo.length) {
          updateData.durationSeconds = Math.round(videoInfo.length);
        }
        if (videoInfo.width) updateData.width = videoInfo.width;
        if (videoInfo.height) updateData.height = videoInfo.height;
        if (videoInfo.storageSize) {
          updateData.fileSizeBytes = BigInt(videoInfo.storageSize);
        }

        if (videoInfo.availableResolutions) {
          updateData.resolutions = videoInfo.availableResolutions
            .split(",")
            .filter(Boolean)
            .map((r: string) => r.trim());
        }

        // If linked to a Lecture, update the formatted duration string
        if (videoAsset.lectureId && videoInfo.length) {
          const minutes = Math.floor(videoInfo.length / 60);
          const seconds = Math.round(videoInfo.length % 60);
          const durationStr = `${minutes}m ${String(seconds).padStart(2, "0")}s`;

          await prisma.lecture.update({
            where: { id: videoAsset.lectureId },
            data: { duration: durationStr },
          }).catch((err) => {
            console.warn(`[Bunny Webhook] Notice updating lecture duration:`, err?.message);
          });
        }
      } catch (infoErr) {
        console.warn("[Bunny Webhook] Notice fetching detailed video info:", infoErr);
      }
    } else if (newStatus === "FAILED") {
      updateData.errorMessage = `Bunny Stream encoding failed (Status: ${Status})`;
    }

    // Idempotent database update
    await prisma.videoAsset.update({
      where: { id: videoAsset.id },
      data: updateData,
    });

    console.log(`[Bunny Webhook] ✅ Updated VideoAsset ${videoAsset.id} → ${newStatus}`);

    return NextResponse.json({
      received: true,
      matched: true,
      videoAssetId: videoAsset.id,
      status: newStatus,
    });
  } catch (err: any) {
    console.error("[Bunny Webhook Error]:", err);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}
