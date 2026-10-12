import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getSession } from "@/lib/auth";
import { enqueueVideoProcessing } from "@/lib/video/videoQueue";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session || (session.role !== "ADMIN" && session.role !== "INSTRUCTOR")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { videoAssetId, lectureId, courseId } = body;

    if (!videoAssetId) {
      return NextResponse.json({ error: "videoAssetId is required" }, { status: 400 });
    }

    const asset = await prisma.videoAsset.findUnique({
      where: { id: videoAssetId }
    });

    if (!asset) {
      return NextResponse.json({ error: "VideoAsset not found" }, { status: 404 });
    }

    // Update status to UPLOADED and attach lectureId/courseId if supplied
    await prisma.videoAsset.update({
      where: { id: videoAssetId },
      data: {
        status: "UPLOADED",
        lectureId: lectureId || asset.lectureId,
        courseId: courseId || asset.courseId
      }
    });

    // Enqueue background processing (FFprobe, Thumbnail, Multi-resolution HLS)
    enqueueVideoProcessing(videoAssetId);

    return NextResponse.json({
      success: true,
      videoAssetId,
      status: "PROCESSING",
      message: "Video uploaded successfully. Background transcoding initiated."
    });
  } catch (err: any) {
    console.error("[Process Video API Error]:", err);
    return NextResponse.json(
      { error: err?.message || "Failed to trigger video processing" },
      { status: 500 }
    );
  }
}
