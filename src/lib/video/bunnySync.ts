/**
 * Bunny Stream status sync — Glarus Academy
 *
 * Pulls the live encoding state from the Bunny REST API and persists it to the
 * VideoAsset row. Used by the status + playback endpoints so assets self-heal
 * even when the Bunny webhook cannot reach the server (e.g. localhost).
 */

import prisma from "@/lib/db";
import { getBunnyVideoInfo, mapBunnyApiStatusToVideoStatus } from "./bunnyStreamService";

export interface BunnySyncResult<T> {
  asset: T;
  encodeProgress: number;
}

type SyncableAsset = {
  id: string;
  provider: string | null;
  providerVideoId: string | null;
  status: string;
  lectureId?: string | null;
  durationSeconds?: number | null;
  width?: number | null;
  height?: number | null;
  fileSizeBytes?: bigint | null;
};

/**
 * Syncs a Bunny-backed asset that is not yet terminal (READY/FAILED).
 * Returns the original asset untouched for non-Bunny or terminal assets,
 * or if the Bunny API is temporarily unreachable.
 */
export async function syncBunnyAsset<T extends SyncableAsset>(
  asset: T,
  include?: Record<string, any>
): Promise<BunnySyncResult<T>> {
  const isPending = asset.status === "UPLOADING" || asset.status === "PROCESSING";
  if (asset.provider !== "BUNNY_STREAM" || !asset.providerVideoId || !isPending) {
    return { asset, encodeProgress: asset.status === "READY" ? 100 : 0 };
  }

  try {
    const info = await getBunnyVideoInfo(asset.providerVideoId);
    const encodeProgress = info.encodeProgress || 0;
    const mapped = mapBunnyApiStatusToVideoStatus(info.status);

    if (mapped === asset.status) {
      return { asset, encodeProgress };
    }

    const data: Record<string, any> = { status: mapped };

    if (mapped === "READY") {
      if (info.length) data.durationSeconds = Math.round(info.length);
      if (info.width) data.width = info.width;
      if (info.height) data.height = info.height;
      if (info.storageSize) data.fileSizeBytes = BigInt(info.storageSize);
      if (info.availableResolutions) {
        data.resolutions = info.availableResolutions
          .split(",")
          .map((r: string) => r.trim())
          .filter(Boolean);
      }
    } else if (mapped === "FAILED") {
      data.errorMessage = `Bunny Stream processing failed (API status ${info.status})`;
    }

    const updated = await prisma.videoAsset.update({
      where: { id: asset.id },
      data,
      ...(include ? { include } : {}),
    });

    // Keep the lecture's displayed duration in sync once encoding completes
    if (mapped === "READY" && asset.lectureId && info.length) {
      const minutes = Math.floor(info.length / 60);
      const seconds = Math.round(info.length % 60);
      await prisma.lecture
        .update({
          where: { id: asset.lectureId },
          data: { duration: `${minutes}m ${String(seconds).padStart(2, "0")}s` },
        })
        .catch(() => {});
    }

    return { asset: updated as unknown as T, encodeProgress };
  } catch {
    // Bunny API slow/unreachable — serve the current DB state
    return { asset, encodeProgress: 0 };
  }
}
