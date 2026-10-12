import fs from "fs";
import path from "path";
import os from "os";
import { execFile } from "child_process";
import { promisify } from "util";
import prisma from "@/lib/db";
import {
  getMinioClient,
  getCourseBucketName,
  ensureCourseBucketExists,
  withTimeout
} from "@/lib/storage/minioClient";
import ffmpegPath from "ffmpeg-static";
// @ts-ignore
import ffprobeStatic from "ffprobe-static";

const execFileAsync = promisify(execFile);

export interface VideoMetadata {
  durationSeconds: number;
  width: number;
  height: number;
  fps: number;
  bitrate: number;
  fileSizeBytes: number;
  videoCodec: string;
  audioCodec: string;
}

export interface HlsVariant {
  name: string;
  resolution: string;
  width: number;
  height: number;
  videoBitrate: string;
  maxrate: string;
  bufsize: string;
  audioBitrate: string;
  bandwidth: number;
}

/**
 * Resolve FFmpeg and FFprobe binary paths.
 */
export function getFfmpegBinary(): string {
  if (ffmpegPath && fs.existsSync(ffmpegPath)) {
    return ffmpegPath;
  }
  return "ffmpeg";
}

export function getFfprobeBinary(): string {
  if (ffprobeStatic?.path && fs.existsSync(ffprobeStatic.path)) {
    return ffprobeStatic.path;
  }
  return "ffprobe";
}

/**
 * Inspect video using FFprobe.
 */
export async function extractVideoMetadata(filePath: string): Promise<VideoMetadata> {
  const ffprobeBin = getFfprobeBinary();
  const args = [
    "-v", "error",
    "-show_entries", "format=duration,size,bit_rate:stream=width,height,r_frame_rate,codec_name,codec_type",
    "-of", "json",
    filePath
  ];

  try {
    const { stdout } = await execFileAsync(ffprobeBin, args);
    const data = JSON.parse(stdout);

    const videoStream = data.streams?.find((s: any) => s.codec_type === "video");
    const audioStream = data.streams?.find((s: any) => s.codec_type === "audio");

    if (!videoStream) {
      throw new Error("Invalid media file: No video stream found.");
    }

    let fps = 30;
    if (videoStream.r_frame_rate) {
      const parts = videoStream.r_frame_rate.split("/");
      if (parts.length === 2 && parseFloat(parts[1]) > 0) {
        fps = Math.round((parseFloat(parts[0]) / parseFloat(parts[1])) * 100) / 100;
      } else if (!isNaN(parseFloat(videoStream.r_frame_rate))) {
        fps = parseFloat(videoStream.r_frame_rate);
      }
    }

    const durationSeconds = Math.round(
      parseFloat(data.format?.duration || videoStream.duration || "0")
    );
    const width = parseInt(videoStream.width || "0", 10);
    const height = parseInt(videoStream.height || "0", 10);
    const fileSizeBytes = parseInt(data.format?.size || "0", 10) || fs.statSync(filePath).size;
    const bitrate = parseInt(data.format?.bit_rate || "0", 10);

    return {
      durationSeconds: Math.max(1, durationSeconds),
      width,
      height,
      fps: fps || 30,
      bitrate: bitrate || 0,
      fileSizeBytes,
      videoCodec: videoStream.codec_name || "h264",
      audioCodec: audioStream?.codec_name || "aac"
    };
  } catch (err: any) {
    console.error("[FFprobe Error]:", err);
    throw new Error(`FFprobe inspection failed: ${err?.message || err}`);
  }
}

/**
 * Generate video poster thumbnail (poster.jpg)
 */
export async function generateVideoThumbnail(
  inputPath: string,
  outputJpgPath: string,
  timestampSeconds: number = 2
): Promise<void> {
  const ffmpegBin = getFfmpegBinary();
  const safeTimestamp = Math.max(0, Math.min(timestampSeconds, 10));

  const args = [
    "-y",
    "-ss", String(safeTimestamp),
    "-i", inputPath,
    "-vframes", "1",
    "-q:v", "2",
    "-vf", "scale='min(1280,iw)':-2",
    outputJpgPath
  ];

  await execFileAsync(ffmpegBin, args);
}

/**
 * Determine eligible HLS resolution variants without upscaling.
 */
export function getEligibleHlsVariants(sourceHeight: number, sourceWidth: number): HlsVariant[] {
  const allVariants: HlsVariant[] = [
    {
      name: "1080p",
      resolution: "1920x1080",
      width: 1920,
      height: 1080,
      videoBitrate: "4500k",
      maxrate: "4800k",
      bufsize: "9000k",
      audioBitrate: "128k",
      bandwidth: 4800000
    },
    {
      name: "720p",
      resolution: "1280x720",
      width: 1280,
      height: 720,
      videoBitrate: "2200k",
      maxrate: "2400k",
      bufsize: "4500k",
      audioBitrate: "128k",
      bandwidth: 2400000
    },
    {
      name: "360p",
      resolution: "640x360",
      width: 640,
      height: 360,
      videoBitrate: "800k",
      maxrate: "900k",
      bufsize: "1800k",
      audioBitrate: "96k",
      bandwidth: 900000
    }
  ];

  // Filter out resolutions strictly higher than source height
  const eligible = allVariants.filter(v => v.height <= Math.max(sourceHeight, 360));
  if (eligible.length === 0) {
    // Return at least 360p
    return [allVariants[allVariants.length - 1]];
  }
  return eligible;
}

/**
 * Transcode single video into HLS variant stream.
 */
export async function transcodeVariant(
  inputPath: string,
  variantDir: string,
  variant: HlsVariant
): Promise<void> {
  const ffmpegBin = getFfmpegBinary();
  const playlistPath = path.join(variantDir, "playlist.m3u8");
  const segmentPattern = path.join(variantDir, "segment_%03d.ts");

  const args = [
    "-y",
    "-i", inputPath,
    "-vf", `scale=w=${variant.width}:h=${variant.height}:force_original_aspect_ratio=decrease,pad=${variant.width}:${variant.height}:(ow-iw)/2:(oh-ih)/2`,
    "-c:v", "libx264",
    "-preset", "fast",
    "-profile:v", "main",
    "-crf", "22",
    "-b:v", variant.videoBitrate,
    "-maxrate", variant.maxrate,
    "-bufsize", variant.bufsize,
    "-pix_fmt", "yuv420p",
    "-c:a", "aac",
    "-b:a", variant.audioBitrate,
    "-ar", "44100",
    "-ac", "2",
    "-hls_time", "6",
    "-hls_list_size", "0",
    "-hls_segment_filename", segmentPattern,
    "-f", "hls",
    playlistPath
  ];

  await execFileAsync(ffmpegBin, args);
}

/**
 * Write master HLS playlist (master.m3u8).
 */
export function generateMasterPlaylist(variants: HlsVariant[]): string {
  let master = "#EXTM3U\n#EXT-X-VERSION:3\n\n";

  for (const v of variants) {
    master += `#EXT-X-STREAM-INF:BANDWIDTH=${v.bandwidth},RESOLUTION=${v.resolution},NAME="${v.name}"\n`;
    master += `${v.name}/playlist.m3u8\n\n`;
  }

  return master;
}

/**
 * Format duration in seconds to "12m 34s"
 */
export function formatDurationString(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}m ${s < 10 ? "0" : ""}${s}s`;
}

/**
 * Full End-to-End Processing Job for a VideoAsset
 */
export async function processVideoAsset(videoAssetId: string): Promise<void> {
  const minioClient = getMinioClient();
  const bucket = getCourseBucketName();
  await ensureCourseBucketExists();

  const asset = await prisma.videoAsset.findUnique({
    where: { id: videoAssetId },
    include: { lecture: true }
  });

  if (!asset) {
    throw new Error(`VideoAsset ${videoAssetId} not found in database.`);
  }

  if (!asset.originalKey) {
    throw new Error(`VideoAsset ${videoAssetId} does not have an originalKey.`);
  }

  // Update status to PROCESSING
  await prisma.videoAsset.update({
    where: { id: videoAssetId },
    data: { status: "PROCESSING", errorMessage: null }
  });

  const tempWorkDir = path.join(os.tmpdir(), `glarus_video_${videoAssetId}_${Date.now()}`);
  const tempInputPath = path.join(tempWorkDir, "input_source.mp4");
  const tempThumbnailPath = path.join(tempWorkDir, "poster.jpg");
  const tempHlsDir = path.join(tempWorkDir, "hls");

  try {
    // 1. Create temporary directory structure
    await fs.promises.mkdir(tempWorkDir, { recursive: true });
    await fs.promises.mkdir(tempHlsDir, { recursive: true });

    // 2. Download original video stream from MinIO to temp file
    console.log(`[Video Processor] Downloading ${asset.originalKey} from MinIO bucket "${bucket}"...`);
    await minioClient.fGetObject(bucket, asset.originalKey, tempInputPath);

    // 3. Extract Metadata via FFprobe
    console.log(`[Video Processor] Running FFprobe on ${tempInputPath}...`);
    const metadata = await extractVideoMetadata(tempInputPath);
    console.log(`[Video Processor] Extracted Metadata: ${metadata.width}x${metadata.height}, ${metadata.durationSeconds}s, ${metadata.fps}fps`);

    // 4. Generate Poster Thumbnail
    const posterTimestamp = Math.min(2, Math.floor(metadata.durationSeconds * 0.1));
    console.log(`[Video Processor] Generating poster thumbnail at ${posterTimestamp}s...`);
    await generateVideoThumbnail(tempInputPath, tempThumbnailPath, posterTimestamp);

    // 5. Determine Eligible Resolutions and Transcode to HLS
    const variants = getEligibleHlsVariants(metadata.height, metadata.width);
    console.log(`[Video Processor] Transcoding to HLS variants:`, variants.map(v => v.name).join(", "));

    for (const variant of variants) {
      const variantDir = path.join(tempHlsDir, variant.name);
      await fs.promises.mkdir(variantDir, { recursive: true });
      console.log(`[Video Processor] Transcoding variant ${variant.name} (${variant.resolution})...`);
      await transcodeVariant(tempInputPath, variantDir, variant);
    }

    // 6. Generate Master Playlist
    const masterPlaylistContent = generateMasterPlaylist(variants);
    const masterPlaylistPath = path.join(tempHlsDir, "master.m3u8");
    await fs.promises.writeFile(masterPlaylistPath, masterPlaylistContent, "utf-8");

    // 7. Upload Processed Files to MinIO (under video-assets/{videoAssetId}/...)
    const thumbnailObjectKey = `video-assets/${videoAssetId}/thumbnails/poster.jpg`;
    const masterPlaylistObjectKey = `video-assets/${videoAssetId}/hls/master.m3u8`;

    // Upload Thumbnail
    console.log(`[Video Processor] Uploading poster thumbnail to ${thumbnailObjectKey}...`);
    await minioClient.fPutObject(bucket, thumbnailObjectKey, tempThumbnailPath, {
      "Content-Type": "image/jpeg",
      "x-amz-meta-video-asset-id": videoAssetId
    });

    // Upload Master Playlist
    console.log(`[Video Processor] Uploading master playlist to ${masterPlaylistObjectKey}...`);
    await minioClient.fPutObject(bucket, masterPlaylistObjectKey, masterPlaylistPath, {
      "Content-Type": "application/vnd.apple.mpegurl",
      "x-amz-meta-video-asset-id": videoAssetId
    });

    // Upload Variant Playlists & Segments
    for (const variant of variants) {
      const variantDir = path.join(tempHlsDir, variant.name);
      const files = await fs.promises.readdir(variantDir);

      for (const file of files) {
        const filePath = path.join(variantDir, file);
        const objectKey = `video-assets/${videoAssetId}/hls/${variant.name}/${file}`;
        const contentType = file.endsWith(".m3u8") ? "application/vnd.apple.mpegurl" : "video/MP2T";

        await minioClient.fPutObject(bucket, objectKey, filePath, {
          "Content-Type": contentType,
          "x-amz-meta-video-asset-id": videoAssetId
        });
      }
    }

    // 8. Update VideoAsset Status to READY in Database
    const resolutionNames = variants.map(v => v.name);
    await prisma.videoAsset.update({
      where: { id: videoAssetId },
      data: {
        status: "READY",
        masterPlaylistKey: masterPlaylistObjectKey,
        thumbnailKey: thumbnailObjectKey,
        durationSeconds: metadata.durationSeconds,
        width: metadata.width,
        height: metadata.height,
        fps: metadata.fps,
        bitrate: BigInt(metadata.bitrate),
        fileSizeBytes: BigInt(metadata.fileSizeBytes),
        videoCodec: metadata.videoCodec,
        audioCodec: metadata.audioCodec,
        resolutions: resolutionNames,
        errorMessage: null
      }
    });

    // 9. If linked to a Lecture, update duration and ensure fallback videoUrl is valid
    if (asset.lectureId) {
      const durationStr = formatDurationString(metadata.durationSeconds);
      const fallbackUrl = `/api/storage/file?key=${encodeURIComponent(asset.originalKey)}`;

      await prisma.lecture.update({
        where: { id: asset.lectureId },
        data: {
          duration: durationStr,
          videoUrl: asset.lecture?.videoUrl || fallbackUrl
        }
      });
    }

    console.log(`[Video Processor] ✅ VideoAsset ${videoAssetId} processed successfully into HLS!`);
  } catch (err: any) {
    console.error(`[Video Processor] ❌ Processing failed for VideoAsset ${videoAssetId}:`, err);

    // Record FAILED status, keep original intact!
    await prisma.videoAsset.update({
      where: { id: videoAssetId },
      data: {
        status: "FAILED",
        errorMessage: err?.message || "Video processing failed"
      }
    }).catch(() => {});

    throw err;
  } finally {
    // 10. Clean up temporary files safely
    try {
      if (fs.existsSync(tempWorkDir)) {
        await fs.promises.rm(tempWorkDir, { recursive: true, force: true });
      }
    } catch (cleanupErr) {
      console.warn(`[Video Processor] Notice cleaning temp files:`, cleanupErr);
    }
  }
}
