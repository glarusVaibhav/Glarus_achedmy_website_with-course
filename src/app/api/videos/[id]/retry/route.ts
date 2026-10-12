import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getSession } from "@/lib/auth";
import { retryVideoProcessing } from "@/lib/video/videoQueue";

export const dynamic = "force-dynamic";

export async function POST(
  req: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session || (session.role !== "ADMIN" && session.role !== "INSTRUCTOR")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await props.params;

    const asset = await prisma.videoAsset.findUnique({
      where: { id }
    });

    if (!asset) {
      return NextResponse.json({ error: "VideoAsset not found" }, { status: 404 });
    }

    if (!asset.originalKey) {
      return NextResponse.json(
        { error: "Original video file is missing or was not uploaded." },
        { status: 400 }
      );
    }

    // Reset status to PROCESSING
    await prisma.videoAsset.update({
      where: { id },
      data: {
        status: "PROCESSING",
        errorMessage: null
      }
    });

    // Enqueue retry
    retryVideoProcessing(id);

    return NextResponse.json({
      success: true,
      message: "Video transcoding retry initiated.",
      status: "PROCESSING"
    });
  } catch (err: any) {
    console.error("[Video Retry API Error]:", err);
    return NextResponse.json(
      { error: err?.message || "Failed to retry video processing" },
      { status: 500 }
    );
  }
}
