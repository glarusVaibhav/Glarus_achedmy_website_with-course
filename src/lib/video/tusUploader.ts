/**
 * Browser TUS Resumable Upload Helper — Glarus Academy
 * 
 * Powered by tus-js-client for direct chunked, resumable uploads
 * to Bunny Stream or any compliant TUS server.
 */

import * as tus from "tus-js-client";

export interface TusUploadOptions {
  endpoint: string;
  headers: Record<string, string>;
  metadata?: Record<string, string>;
  chunkSize?: number;
  onProgress?: (percent: number, bytesUploaded: number, bytesTotal: number) => void;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export interface TusUploadController {
  start: () => void;
  pause: () => void;
  abort: () => void;
}

function getOptimalChunkSize(fileSize: number): number {
  if (fileSize > 500 * 1024 * 1024) {
    return 20 * 1024 * 1024; // 20 MB for files > 500MB
  }
  if (fileSize > 50 * 1024 * 1024) {
    return 10 * 1024 * 1024; // 10 MB for files 50MB-500MB
  }
  return 5 * 1024 * 1024; // 5 MB for smaller files
}

/**
 * Initiates a resilient direct-to-cloud TUS upload from the browser.
 */
export function createTusUpload(
  file: File,
  options: TusUploadOptions
): TusUploadController {
  const upload = new tus.Upload(file, {
    endpoint: options.endpoint,
    retryDelays: [0, 1000, 3000, 5000, 10000, 20000],
    chunkSize: options.chunkSize || getOptimalChunkSize(file.size),
    headers: options.headers,
    metadata: {
      filename: file.name,
      filetype: file.type || "video/mp4",
      ...options.metadata,
    },
    onError: (error) => {
      console.error("[TUS Upload Error]:", error);
      options.onError?.(error);
    },
    onProgress: (bytesUploaded, bytesTotal) => {
      const percentage = bytesTotal > 0 ? Math.round((bytesUploaded / bytesTotal) * 100) : 0;
      options.onProgress?.(percentage, bytesUploaded, bytesTotal);
    },
    onSuccess: () => {
      console.log(`[TUS Upload] Successfully uploaded ${file.name}`);
      options.onSuccess?.();
    },
  });

  return {
    start: () => upload.start(),
    pause: () => upload.abort(),
    abort: () => upload.abort(),
  };
}
