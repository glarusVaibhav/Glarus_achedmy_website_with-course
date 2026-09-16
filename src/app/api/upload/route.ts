import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { getSession } from "@/lib/auth";
import {
  uploadCourseMaterial,
  generateObjectKey,
  getCourseBucketName
} from "@/lib/storage/minioClient";

export const dynamic = "force-dynamic";

const ALLOWED_TYPES: Record<string, { mimeTypes: string[]; extensions: string[]; maxSizeMB: number }> = {
  photo: {
    mimeTypes: ["image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml"],
    extensions: [".jpg", ".jpeg", ".png", ".webp", ".gif", ".svg"],
    maxSizeMB: 15,
  },
  image: {
    mimeTypes: ["image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml"],
    extensions: [".jpg", ".jpeg", ".png", ".webp", ".gif", ".svg"],
    maxSizeMB: 15,
  },
  resume: {
    mimeTypes: [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/plain",
    ],
    extensions: [".pdf", ".doc", ".docx", ".txt"],
    maxSizeMB: 25,
  },
  resource: {
    mimeTypes: [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-powerpoint",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      "application/zip",
      "application/x-zip-compressed",
      "text/plain",
      "text/markdown",
      "application/json",
      "image/jpeg",
      "image/png",
    ],
    extensions: [".pdf", ".doc", ".docx", ".ppt", ".pptx", ".zip", ".txt", ".md", ".json", ".jpg", ".png"],
    maxSizeMB: 100,
  },
  assignment: {
    mimeTypes: [
      "application/pdf",
      "application/zip",
      "application/x-zip-compressed",
      "application/x-tar",
      "application/gzip",
      "text/plain",
      "text/x-python",
      "text/markdown",
      "application/json",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/octet-stream",
    ],
    extensions: [".pdf", ".zip", ".tar", ".gz", ".py", ".ipynb", ".doc", ".docx", ".txt", ".md", ".json", ".csv"],
    maxSizeMB: 100,
  },
  document: {
    mimeTypes: [
      "application/pdf",
      "text/plain",
      "text/markdown",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ],
    extensions: [".pdf", ".txt", ".md", ".doc", ".docx"],
    maxSizeMB: 30,
  },
  article: {
    mimeTypes: ["text/plain", "text/markdown", "application/pdf"],
    extensions: [".txt", ".md", ".pdf"],
    maxSizeMB: 20,
  },
  video: {
    mimeTypes: ["video/mp4", "video/webm", "video/quicktime", "video/x-m4v", "video/mkv"],
    extensions: [".mp4", ".mov", ".webm", ".m4v", ".mkv"],
    maxSizeMB: 500,
  },
};

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const category = (formData.get("category") as string) || "general";
    const courseId = (formData.get("courseId") as string) || undefined;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const config = ALLOWED_TYPES[category];
    const originalName = file.name || "upload";
    const ext = path.extname(originalName).toLowerCase();

    // Check type validation if category config exists
    if (config) {
      const isExtValid = config.extensions.includes(ext);
      const isMimeValid = config.mimeTypes.includes(file.type);
      if (!isExtValid && !isMimeValid) {
        return NextResponse.json(
          {
            error: `Invalid file format for ${category}. Allowed types: ${config.extensions.join(", ")}`,
          },
          { status: 400 }
        );
      }

      // Check size validation
      const maxSizeBytes = config.maxSizeMB * 1024 * 1024;
      if (file.size > maxSizeBytes) {
        return NextResponse.json(
          {
            error: `File size exceeds the limit of ${config.maxSizeMB}MB for ${category}.`,
          },
          { status: 400 }
        );
      }
    }

    // Convert file to Buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // 1. PRIMARY STORAGE: Upload to MinIO Object Storage
    try {
      const objectKey = generateObjectKey(category, originalName, courseId);
      const minioResult = await uploadCourseMaterial(buffer, objectKey, file.type || "application/octet-stream", originalName);

      return NextResponse.json({
        success: true,
        url: minioResult.url,
        objectKey: minioResult.objectKey,
        bucket: minioResult.bucket,
        fileName: originalName,
        size: file.size,
        mimeType: file.type,
        storage: "minio"
      });
    } catch (minioErr: any) {
      console.warn("[Upload] MinIO storage error, engaging fallback:", minioErr?.message);

      // 2. FALLBACK STORAGE: Save locally to /public/uploads/ if MinIO is temporarily unreachable
      const uploadsDir = path.join(process.cwd(), "public", "uploads");
      await mkdir(uploadsDir, { recursive: true });

      const sanitizedBase = path
        .basename(originalName, ext)
        .replace(/[^a-zA-Z0-9_-]/g, "_")
        .slice(0, 40);
      const uniqueFileName = `${category}_${Date.now()}_${sanitizedBase}${ext}`;
      const filePath = path.join(uploadsDir, uniqueFileName);

      await writeFile(filePath, buffer);

      const publicUrl = `/uploads/${uniqueFileName}`;

      return NextResponse.json({
        success: true,
        url: publicUrl,
        objectKey: uniqueFileName,
        bucket: "local",
        fileName: originalName,
        size: file.size,
        mimeType: file.type,
        storage: "local"
      });
    }
  } catch (error: any) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: error?.message || "File upload failed" },
      { status: 500 }
    );
  }
}

