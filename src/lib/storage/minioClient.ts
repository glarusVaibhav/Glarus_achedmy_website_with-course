import * as Minio from "minio";
import path from "path";
import crypto from "crypto";

export interface MinioUploadResult {
  bucket: string;
  objectKey: string;
  url: string;
  fileName: string;
  size: number;
  mimeType: string;
  storage: "minio";
}

let minioClientInstance: Minio.Client | null = null;
let bucketInitialized = false;

/**
 * Returns the configured GlarusAcademy course materials bucket name.
 * Defaults to "glarusacademy-course-content".
 */
export function getCourseBucketName(): string {
  return process.env.MINIO_BUCKET || "glarusacademy-course-content";
}

/**
 * Parses MinIO configuration from environment variables.
 */
function getMinioConfig() {
  const rawEndpoint = process.env.MINIO_ENDPOINT || "192.168.1.8";
  const rawPort = process.env.MINIO_PORT ? parseInt(process.env.MINIO_PORT, 10) : undefined;
  const useSSL = process.env.MINIO_USE_SSL === "true" || process.env.MINIO_SECURE === "true";
  const accessKey = process.env.MINIO_ACCESS_KEY || "minioadmin";
  const secretKey = process.env.MINIO_SECRET_KEY || "minioadmin";
  const region = process.env.MINIO_REGION || "us-east-1";

  // If endpoint contains port (e.g. "192.168.1.8:9000"), split them
  let endPoint = rawEndpoint;
  let port = rawPort || (useSSL ? 443 : 9000);

  if (rawEndpoint.includes(":")) {
    const parts = rawEndpoint.split(":");
    endPoint = parts[0];
    const parsedPort = parseInt(parts[1], 10);
    if (!isNaN(parsedPort)) {
      port = parsedPort;
    }
  }

  // Strip protocol if included
  endPoint = endPoint.replace(/^https?:\/\//, "");

  return {
    endPoint,
    port,
    useSSL,
    accessKey,
    secretKey,
    region
  };
}

/**
 * Get or initialize the MinIO client singleton.
 */
export function getMinioClient(): Minio.Client {
  if (!minioClientInstance) {
    const config = getMinioConfig();
    minioClientInstance = new Minio.Client({
      endPoint: config.endPoint,
      port: config.port,
      useSSL: config.useSSL,
      accessKey: config.accessKey,
      secretKey: config.secretKey,
      region: config.region
    });
  }
  return minioClientInstance;
}

/**
 * Helper to wrap promises with a timeout to prevent hanging connections.
 */
export function withTimeout<T>(promise: Promise<T>, timeoutMs: number = 4000): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(`MinIO request timed out after ${timeoutMs}ms`)), timeoutMs)
    )
  ]);
}

/**
 * Verify and ensure the dedicated GlarusAcademy course materials bucket exists.
 * CRITICAL: This function NEVER touches, modifies, or deletes any other existing bucket.
 */
export async function ensureCourseBucketExists(): Promise<boolean> {
  if (bucketInitialized) return true;

  try {
    const client = getMinioClient();
    const bucket = getCourseBucketName();
    const exists = await withTimeout(client.bucketExists(bucket), 2500);

    if (!exists) {
      const config = getMinioConfig();
      await withTimeout(client.makeBucket(bucket, config.region), 2500);
      console.log(`[MinIO Storage] Created new dedicated bucket: "${bucket}"`);
    }

    bucketInitialized = true;
    return true;
  } catch (err: any) {
    console.warn(`[MinIO Storage] Notice checking/creating bucket: ${err?.message}`);
    throw err;
  }
}

/**
 * Generates a structured, collision-safe object key according to the hierarchy:
 * courses/{courseId}/{category}/{uuid}_{sanitized_filename}
 * or temporary/{uuid}_{sanitized_filename}
 */
export function generateObjectKey(
  category: "videos" | "images" | "pdfs" | "resources" | "mcqs" | "sandboxes" | "temporary" | string,
  originalFilename: string,
  courseId?: string
): string {
  const ext = path.extname(originalFilename).toLowerCase();
  const baseName = path
    .basename(originalFilename, ext)
    .replace(/[^a-zA-Z0-9_-]/g, "_")
    .slice(0, 40);
  const uuid = crypto.randomUUID();
  const safeFilename = `${uuid}_${baseName}${ext}`;

  // Map category aliases to standard folder names
  const folderMap: Record<string, string> = {
    video: "videos",
    videos: "videos",
    image: "images",
    images: "images",
    photo: "images",
    pdf: "pdfs",
    pdfs: "pdfs",
    document: "pdfs",
    resume: "pdfs",
    resource: "resources",
    resources: "resources",
    assignment: "assignments",
    assignments: "assignments",
    mcq: "mcqs",
    mcqs: "mcqs",
    quiz: "mcqs",
    sandbox: "sandboxes",
    sandboxes: "sandboxes",
    code: "sandboxes",
    article: "pdfs",
    temporary: "temporary",
    temp: "temporary"
  };

  const targetFolder = folderMap[category.toLowerCase()] || "resources";

  if (courseId && courseId.trim() && courseId !== "general" && courseId !== "undefined") {
    const safeCourseId = courseId.replace(/[^a-zA-Z0-9_-]/g, "_");
    return `courses/${safeCourseId}/${targetFolder}/${safeFilename}`;
  }

  return `${targetFolder}/${safeFilename}`;
}

/**
 * Upload a file buffer or stream into the dedicated GlarusAcademy MinIO bucket.
 */
export async function uploadCourseMaterial(
  data: Buffer,
  objectKey: string,
  contentType: string,
  originalFilename: string
): Promise<MinioUploadResult> {
  const client = getMinioClient();
  const bucket = getCourseBucketName();

  await ensureCourseBucketExists();

  const metaData = {
    "Content-Type": contentType,
    "x-amz-meta-original-filename": encodeURIComponent(originalFilename),
    "x-amz-meta-uploaded-at": new Date().toISOString()
  };

  await withTimeout(client.putObject(bucket, objectKey, data, data.length, metaData), 8000);

  // Construct secure file URL via GlarusAcademy storage proxy API
  const proxyUrl = `/api/storage/file?key=${encodeURIComponent(objectKey)}`;

  return {
    bucket,
    objectKey,
    url: proxyUrl,
    fileName: originalFilename,
    size: data.length,
    mimeType: contentType,
    storage: "minio"
  };
}

/**
 * Generate a secure presigned download URL for an object in the GlarusAcademy bucket.
 */
export async function getPresignedDownloadUrl(objectKey: string, expirySeconds: number = 3600): Promise<string> {
  const client = getMinioClient();
  const bucket = getCourseBucketName();
  return await withTimeout(client.presignedGetObject(bucket, objectKey, expirySeconds), 4000);
}

/**
 * Generate a secure presigned upload URL for direct browser uploads.
 */
export async function getPresignedUploadUrl(objectKey: string, expirySeconds: number = 3600): Promise<string> {
  const client = getMinioClient();
  const bucket = getCourseBucketName();
  await ensureCourseBucketExists();
  return await withTimeout(client.presignedPutObject(bucket, objectKey, expirySeconds), 4000);
}

/**
 * Safely delete an object ONLY from the dedicated GlarusAcademy course bucket.
 * GUARANTEE: Never deletes objects from any other bucket.
 */
export async function deleteCourseMaterial(objectKey: string): Promise<boolean> {
  try {
    const client = getMinioClient();
    const bucket = getCourseBucketName();
    await withTimeout(client.removeObject(bucket, objectKey), 4000);
    return true;
  } catch (err: any) {
    console.warn(`[MinIO Storage] Error deleting object ${objectKey}:`, err?.message);
    return false;
  }
}

/**
 * Get an object stream for secure authenticated streaming to clients.
 */
export async function getObjectStream(objectKey: string) {
  const client = getMinioClient();
  const bucket = getCourseBucketName();
  return await withTimeout(client.getObject(bucket, objectKey), 5000);
}

/**
 * Get object metadata stats.
 */
export async function getObjectStats(objectKey: string) {
  const client = getMinioClient();
  const bucket = getCourseBucketName();
  return await withTimeout(client.statObject(bucket, objectKey), 4000);
}

