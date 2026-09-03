import React from "react";
import ZoomLiveRoom from "@/components/live-classroom/ZoomLiveRoom";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Live Classroom | Zoom Video SDK | Glarus Academy",
  description: "Interactive live masterclass and collaborative video session powered by Zoom Video SDK.",
};

export default async function LiveClassroomPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ZoomLiveRoom sessionId={id} />;
}
