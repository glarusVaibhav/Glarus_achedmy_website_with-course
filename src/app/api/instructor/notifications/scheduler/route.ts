import { NextResponse } from "next/server";
import { notificationService } from "@/lib/notifications/notificationService";

export async function POST(request: Request) {
  try {
    const result = await notificationService.runLiveSessionReminders();
    return NextResponse.json({
      success: true,
      message: `Checked ${result.checked} sessions, generated ${result.generated} reminder notifications.`,
      result,
    });
  } catch (err: any) {
    console.error("POST /api/instructor/notifications/scheduler error:", err);
    return NextResponse.json(
      { error: "Failed to run reminder scheduler", details: err?.message },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  return POST(request);
}
