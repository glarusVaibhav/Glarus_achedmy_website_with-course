import { NextResponse } from "next/server";

export async function GET() {
  // TODO: Add Admin authentication check
  return NextResponse.json({ success: true, refunds: [] });
}

export async function POST(request: Request) {
  // Handle approve / reject actions from the admin
  return NextResponse.json({ success: true, message: "Refund processed successfully." });
}
