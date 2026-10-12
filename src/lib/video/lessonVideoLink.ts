/**
 * Lesson ↔ VideoAsset link helpers — Glarus Academy
 *
 * Lessons reference uploaded videos either via an explicit `videoAssetId`
 * or (legacy) via an internal URL like `/api/videos/{id}/status`.
 */

const INTERNAL_VIDEO_URL = /^\/api\/videos\/([a-z0-9]+)\/(status|playback-token)\/?$/i;

/** Returns the VideoAsset id referenced by a lesson payload, if any. */
export function extractVideoAssetId(lesson: any): string | null {
  if (!lesson || typeof lesson !== "object") return null;
  if (typeof lesson.videoAssetId === "string" && lesson.videoAssetId) {
    return lesson.videoAssetId;
  }
  if (typeof lesson.videoUrl === "string") {
    const match = lesson.videoUrl.trim().match(INTERNAL_VIDEO_URL);
    if (match) return match[1];
  }
  return null;
}

/** True when a videoUrl is an internal API pointer (not a playable media URL). */
export function isInternalVideoUrl(url?: string | null): boolean {
  return !!url && INTERNAL_VIDEO_URL.test(url.trim());
}
