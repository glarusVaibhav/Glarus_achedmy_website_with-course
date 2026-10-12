/**
 * YouTube Video Service — Glarus Academy
 * 
 * Provides secure YouTube URL parsing, ID validation, Privacy-Enhanced embed generation,
 * and oEmbed metadata retrieval without exposing API keys.
 */

export interface YouTubeMetadata {
  videoId: string;
  title: string;
  authorName: string;
  authorUrl: string;
  thumbnailUrl: string;
  embedUrl: string;
  provider: "YOUTUBE";
}

export interface YouTubeEmbedOptions {
  autoplay?: boolean;
  startTime?: number;
  origin?: string;
  enableJsApi?: boolean;
  controls?: boolean;
  rel?: boolean;
}

const YOUTUBE_ID_REGEX = /^[a-zA-Z0-9_-]{11}$/;

/**
 * Extracts and strictly validates an 11-character YouTube Video ID from any valid YouTube URL or raw ID.
 * Returns null if the URL is invalid, malicious, or contains an unsupported format.
 */
export function parseYouTubeVideoId(input?: string | null): string | null {
  if (!input || typeof input !== "string") {
    return null;
  }

  const trimmed = input.trim();

  // If already an 11-character ID
  if (YOUTUBE_ID_REGEX.test(trimmed)) {
    return trimmed;
  }

  try {
    // Basic sanitization: block dangerous protocols
    if (trimmed.startsWith("javascript:") || trimmed.startsWith("data:") || trimmed.startsWith("vbscript:")) {
      return null;
    }

    let url: URL;
    try {
      url = new URL(trimmed.startsWith("http") ? trimmed : `https://${trimmed}`);
    } catch {
      return null;
    }

    const hostname = url.hostname.toLowerCase().replace(/^www\./, "").replace(/^m\./, "");

    // Allowed YouTube hostnames
    const validHosts = [
      "youtube.com",
      "youtu.be",
      "youtube-nocookie.com",
      "music.youtube.com",
    ];

    if (!validHosts.includes(hostname)) {
      return null;
    }

    // Pattern 1: youtu.be/VIDEO_ID
    if (hostname === "youtu.be") {
      const candidate = url.pathname.slice(1).split("/")[0].split("?")[0];
      if (YOUTUBE_ID_REGEX.test(candidate)) {
        return candidate;
      }
    }

    // Pattern 2: youtube.com/watch?v=VIDEO_ID
    const vParam = url.searchParams.get("v");
    if (vParam && YOUTUBE_ID_REGEX.test(vParam)) {
      return vParam;
    }

    // Pattern 3: youtube.com/embed/VIDEO_ID or youtube-nocookie.com/embed/VIDEO_ID
    if (url.pathname.startsWith("/embed/")) {
      const candidate = url.pathname.replace("/embed/", "").split("/")[0].split("?")[0];
      if (YOUTUBE_ID_REGEX.test(candidate)) {
        return candidate;
      }
    }

    // Pattern 4: youtube.com/shorts/VIDEO_ID
    if (url.pathname.startsWith("/shorts/")) {
      const candidate = url.pathname.replace("/shorts/", "").split("/")[0].split("?")[0];
      if (YOUTUBE_ID_REGEX.test(candidate)) {
        return candidate;
      }
    }

    // Pattern 5: youtube.com/v/VIDEO_ID
    if (url.pathname.startsWith("/v/")) {
      const candidate = url.pathname.replace("/v/", "").split("/")[0].split("?")[0];
      if (YOUTUBE_ID_REGEX.test(candidate)) {
        return candidate;
      }
    }

    return null;
  } catch {
    return null;
  }
}

/**
 * Generates a Privacy-Enhanced embed URL with optional IFrame API parameters.
 */
export function getYouTubeEmbedUrl(
  videoId: string,
  options: YouTubeEmbedOptions = {}
): string {
  const cleanId = parseYouTubeVideoId(videoId);
  if (!cleanId) {
    throw new Error(`Invalid YouTube Video ID: "${videoId}"`);
  }

  const params = new URLSearchParams();
  if (options.enableJsApi !== false) {
    params.set("enablejsapi", "1");
  }
  if (options.autoplay) {
    params.set("autoplay", "1");
  }
  if (options.startTime && options.startTime > 0) {
    params.set("start", Math.floor(options.startTime).toString());
  }
  if (options.origin) {
    params.set("origin", options.origin);
  }
  params.set("rel", options.rel ? "1" : "0");
  params.set("modestbranding", "1");
  params.set("playsinline", "1");

  const query = params.toString();
  return `https://www.youtube-nocookie.com/embed/${cleanId}${query ? `?${query}` : ""}`;
}

/**
 * Returns the high-resolution YouTube thumbnail URL for a given video ID.
 */
export function getYouTubeThumbnailUrl(
  videoId: string,
  quality: "hq" | "maxres" | "default" = "hq"
): string {
  const cleanId = parseYouTubeVideoId(videoId);
  if (!cleanId) {
    return "/images/courses/course_banner_bg.jpg";
  }

  if (quality === "maxres") {
    return `https://img.youtube.com/vi/${cleanId}/maxresdefault.jpg`;
  }
  if (quality === "default") {
    return `https://img.youtube.com/vi/${cleanId}/default.jpg`;
  }
  return `https://img.youtube.com/vi/${cleanId}/hqdefault.jpg`;
}

/**
 * Fetches public oEmbed metadata from YouTube without requiring an API key.
 */
export async function fetchYouTubeOEmbed(urlOrId: string): Promise<YouTubeMetadata | null> {
  const videoId = parseYouTubeVideoId(urlOrId);
  if (!videoId) {
    return null;
  }

  try {
    const oembedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;
    const res = await fetch(oembedUrl, {
      headers: {
        "Accept": "application/json",
      },
      next: { revalidate: 86400 }, // Cache for 24 hours
    });

    if (!res.ok) {
      // Fallback metadata if oEmbed fails or video is unlisted
      return {
        videoId,
        title: `YouTube Video (${videoId})`,
        authorName: "YouTube Channel",
        authorUrl: `https://www.youtube.com/watch?v=${videoId}`,
        thumbnailUrl: getYouTubeThumbnailUrl(videoId, "hq"),
        embedUrl: getYouTubeEmbedUrl(videoId),
        provider: "YOUTUBE",
      };
    }

    const data = await res.json();

    return {
      videoId,
      title: data.title || `YouTube Video (${videoId})`,
      authorName: data.author_name || "YouTube Creator",
      authorUrl: data.author_url || `https://www.youtube.com/watch?v=${videoId}`,
      thumbnailUrl: data.thumbnail_url || getYouTubeThumbnailUrl(videoId, "hq"),
      embedUrl: getYouTubeEmbedUrl(videoId),
      provider: "YOUTUBE",
    };
  } catch (err) {
    console.warn("[YouTube oEmbed Notice]:", err);
    return {
      videoId,
      title: `YouTube Video (${videoId})`,
      authorName: "YouTube Channel",
      authorUrl: `https://www.youtube.com/watch?v=${videoId}`,
      thumbnailUrl: getYouTubeThumbnailUrl(videoId, "hq"),
      embedUrl: getYouTubeEmbedUrl(videoId),
      provider: "YOUTUBE",
    };
  }
}
