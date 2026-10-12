/**
 * Bunny Stream Service — Glarus Academy
 * 
 * Central service layer for Bunny Stream API interactions.
 * Handles video creation, TUS upload authorization, signed playback URLs,
 * and webhook signature verification.
 */

import crypto from "crypto";
import { getVideoConfig } from "./config";

const BUNNY_API_BASE = "https://video.bunnycdn.com";

export interface BunnyVideoCreateResponse {
  guid: string;
  videoLibraryId?: number;
  libraryId?: number;
  title: string;
  dateUploaded?: string;
  status: number;
  thumbnailFileName?: string;
}

export interface BunnyTusUploadAuth {
  videoId: string;
  libraryId: string;
  uploadEndpoint: string;
  tusHeaders: {
    AuthorizationSignature: string;
    AuthorizationExpire: number;
    VideoId: string;
    LibraryId: string;
  };
}

export interface BunnyVideoInfo {
  guid: string;
  videoLibraryId?: number;
  libraryId?: number;
  title: string;
  status: number;
  length: number; // Duration in seconds
  width: number;
  height: number;
  storageSize: number;
  availableResolutions: string; // e.g. "360p,480p,720p,1080p"
  thumbnailFileName?: string;
  encodeProgress?: number;
}

export interface SignedPlaybackInfo {
  playbackUrl: string; // HLS Master Playlist URL
  mpdUrl: string;      // DASH Manifest URL
  thumbnailUrl: string;
  previewAnimationUrl: string;
  expiresAt: number;
}

/**
 * Creates a new video object in Bunny Stream.
 * This MUST be called before initiating a TUS upload.
 */
export async function createBunnyVideo(title: string): Promise<BunnyVideoCreateResponse> {
  const config = getVideoConfig();
  if (!config.bunnyApiKey || !config.bunnyLibraryId) {
    throw new Error("Bunny Stream credentials are not configured.");
  }

  const res = await fetch(`${BUNNY_API_BASE}/library/${config.bunnyLibraryId}/videos`, {
    method: "POST",
    headers: {
      "Accept": "application/json",
      "Content-Type": "application/json",
      "AccessKey": config.bunnyApiKey,
    },
    body: JSON.stringify({ title }),
  });

  if (!res.ok) {
    const errBody = await res.text();
    throw new Error(`Bunny Stream API error (${res.status}): ${errBody}`);
  }

  return res.json();
}

/**
 * Generates a TUS upload authorization for direct browser-to-Bunny uploads.
 * The browser uses these headers with tus-js-client.
 */
export function generateTusUploadAuth(videoId: string): BunnyTusUploadAuth {
  const config = getVideoConfig();
  if (!config.bunnyApiKey || !config.bunnyLibraryId) {
    throw new Error("Bunny Stream credentials are not configured.");
  }

  const expirationTime = Math.floor(Date.now() / 1000) + 86400; // 24 hours
  
  // Format: SHA256(LIBRARY_ID + API_KEY + EXPIRATION_TIME + VIDEO_ID)
  const signaturePayload = `${config.bunnyLibraryId}${config.bunnyApiKey}${expirationTime}${videoId}`;
  const signature = crypto
    .createHash("sha256")
    .update(signaturePayload)
    .digest("hex");

  return {
    videoId,
    libraryId: config.bunnyLibraryId,
    uploadEndpoint: "https://video.bunnycdn.com/tusupload",
    tusHeaders: {
      AuthorizationSignature: signature,
      AuthorizationExpire: expirationTime,
      VideoId: videoId,
      LibraryId: config.bunnyLibraryId,
    },
  };
}

/**
 * Fetches current video information from Bunny Stream API.
 */
export async function getBunnyVideoInfo(videoId: string): Promise<BunnyVideoInfo> {
  const config = getVideoConfig();
  if (!config.bunnyApiKey || !config.bunnyLibraryId) {
    throw new Error("Bunny Stream credentials are not configured.");
  }

  const res = await fetch(
    `${BUNNY_API_BASE}/library/${config.bunnyLibraryId}/videos/${videoId}`,
    {
      headers: {
        "Accept": "application/json",
        "AccessKey": config.bunnyApiKey,
      },
      cache: "no-store",
    }
  );

  if (!res.ok) {
    throw new Error(`Failed to fetch Bunny video info (${res.status})`);
  }

  return res.json();
}

/**
 * Generates a signed HLS and DASH playback URL with directory-level token authentication.
 * 
 * Directory signing ensures that all nested .m3u8 playlists and .ts chunks are authorized.
 * 
 * @param videoId - Bunny Stream Video GUID
 * @param expiresInSeconds - Token validity duration (default: 3 hours)
 */
export function generateSignedPlaybackUrl(
  videoId: string,
  expiresInSeconds: number = 10800 // 3 hours
): SignedPlaybackInfo {
  const config = getVideoConfig();
  const cdnHostname = config.bunnyCdnHostname || "video.bunnycdn.com";
  const tokenKey = config.bunnyTokenKey;
  const expires = Math.floor(Date.now() / 1000) + expiresInSeconds;

  // If token auth key is NOT configured, return unsigned URLs
  if (!tokenKey) {
    return {
      playbackUrl: `https://${cdnHostname}/${videoId}/playlist.m3u8`,
      mpdUrl: `https://${cdnHostname}/${videoId}/playlist.mpd`,
      thumbnailUrl: `https://${cdnHostname}/${videoId}/thumbnail.jpg`,
      previewAnimationUrl: `https://${cdnHostname}/${videoId}/preview.webp`,
      expiresAt: expires,
    };
  }

  // Directory-level token signing for HLS playlist & segments.
  // Bunny hashes: key + signature_path + expires + sorted extra params ("token_path=...").
  const tokenPath = `/${videoId}/`;
  const hashableBase = `${tokenKey}${tokenPath}${expires}token_path=${tokenPath}`;
  const token = crypto
    .createHash("sha256")
    .update(hashableBase)
    .digest("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");

  // Path-embedded token: HLS players resolve relative variant/segment URIs against
  // the playlist URL, so a path prefix is inherited while a query string is dropped.
  const tokenPrefix = `https://${cdnHostname}/bcdn_token=${token}&expires=${expires}&token_path=${encodeURIComponent(tokenPath)}`;

  return {
    playbackUrl: `${tokenPrefix}/${videoId}/playlist.m3u8`,
    mpdUrl: `${tokenPrefix}/${videoId}/playlist.mpd`,
    thumbnailUrl: `${tokenPrefix}/${videoId}/thumbnail.jpg`,
    previewAnimationUrl: `${tokenPrefix}/${videoId}/preview.webp`,
    expiresAt: expires,
  };
}

/**
 * Verifies the Bunny Stream webhook signature using constant-time comparison.
 */
export function verifyWebhookSignature(
  body: string,
  signatureHeader?: string | null
): boolean {
  const config = getVideoConfig();
  const secretKey = config.bunnyWebhookSigningKey;

  // If no webhook secret is configured, reject in production
  if (!secretKey || !signatureHeader) {
    return false;
  }

  try {
    const expectedSignature = crypto
      .createHmac("sha256", secretKey)
      .update(body)
      .digest("hex");

    const expectedBuffer = Buffer.from(expectedSignature, "utf-8");
    const providedBuffer = Buffer.from(signatureHeader, "utf-8");

    if (expectedBuffer.length !== providedBuffer.length) {
      return false;
    }

    return crypto.timingSafeEqual(expectedBuffer, providedBuffer);
  } catch (err) {
    console.error("[Bunny Webhook Signature Error]:", err);
    return false;
  }
}

/**
 * Maps the `status` field returned by the Bunny Stream REST API (GET video):
 * 0 = Created, 1 = Uploaded, 2 = Processing, 3 = Transcoding, 4 = Finished,
 * 5 = Error, 6 = UploadFailed, 7 = JitSegmenting, 8 = JitPlaylistsCreated
 *
 * NOTE: This enum differs from the webhook enum below.
 */
export function mapBunnyApiStatusToVideoStatus(apiStatus: number): "UPLOADING" | "PROCESSING" | "READY" | "FAILED" {
  switch (apiStatus) {
    case 0:
      return "UPLOADING";
    case 1:
    case 2:
    case 3:
    case 7:
      return "PROCESSING";
    case 4:
    case 8:
      return "READY";
    case 5:
    case 6:
      return "FAILED";
    default:
      return "PROCESSING";
  }
}

/**
 * Bunny Stream WEBHOOK Status Code mappings according to official documentation:
 * 0 = Queued
 * 1 = Processing
 * 2 = Encoding
 * 3 = Finished
 * 4 = Resolution finished (playable)
 * 5 = Failed
 * 6 = PresignedUploadStarted
 * 7 = PresignedUploadFinished
 * 8 = PresignedUploadFailed
 */
export function mapBunnyStatusToVideoStatus(bunnyStatus: number): "UPLOADING" | "PROCESSING" | "READY" | "FAILED" {
  switch (bunnyStatus) {
    case 0:
    case 6:
      return "UPLOADING";
    case 1:
    case 2:
    case 7:
      return "PROCESSING";
    case 3:
    case 4:
      return "READY";
    case 5:
    case 8:
      return "FAILED";
    default:
      return "PROCESSING";
  }
}
