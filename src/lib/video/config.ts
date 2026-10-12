/**
 * Video Streaming Configuration — Glarus Academy
 * 
 * Centralized, safe configuration module.
 * Provides fallback defaults so missing environment variables NEVER cause crashes.
 */

export interface VideoConfig {
  bunnyStreamEnabled: boolean;
  bunnyLibraryId: string;
  bunnyApiKey: string;
  bunnyCdnHostname: string;
  bunnyTokenKey: string;
  bunnyWebhookSigningKey: string;
  youtubeApiKey?: string;
  videoProvider: "BUNNY_STREAM" | "MINIO_LEGACY" | "YOUTUBE";
}

export function getVideoConfig(): VideoConfig {
  const isEnabledFlag = (process.env.BUNNY_STREAM_ENABLED || "").toLowerCase() === "true" ||
    (process.env.VIDEO_PROVIDER || "").toUpperCase() === "BUNNY_STREAM";

  const bunnyLibraryId = process.env.BUNNY_STREAM_LIBRARY_ID || "";
  const bunnyApiKey = process.env.BUNNY_STREAM_API_KEY || "";
  const bunnyCdnHostname = process.env.BUNNY_STREAM_CDN_HOSTNAME || "video.bunnycdn.com";
  const bunnyTokenKey = process.env.BUNNY_STREAM_TOKEN_KEY || process.env.BUNNY_STREAM_TOKEN_AUTH_KEY || "";
  const bunnyWebhookSigningKey = process.env.BUNNY_WEBHOOK_SIGNING_KEY || process.env.BUNNY_STREAM_WEBHOOK_SECRET || "";
  const youtubeApiKey = process.env.YOUTUBE_API_KEY || "";

  const bunnyStreamEnabled = isEnabledFlag && Boolean(bunnyLibraryId && bunnyApiKey);
  let videoProvider: "BUNNY_STREAM" | "MINIO_LEGACY" | "YOUTUBE" = "MINIO_LEGACY";
  if ((process.env.VIDEO_PROVIDER || "").toUpperCase() === "YOUTUBE") {
    videoProvider = "YOUTUBE";
  } else if (bunnyStreamEnabled) {
    videoProvider = "BUNNY_STREAM";
  }

  return {
    bunnyStreamEnabled,
    bunnyLibraryId,
    bunnyApiKey,
    bunnyCdnHostname,
    bunnyTokenKey,
    bunnyWebhookSigningKey,
    youtubeApiKey,
    videoProvider,
  };
}

export function isBunnyStreamEnabled(): boolean {
  return getVideoConfig().bunnyStreamEnabled;
}
