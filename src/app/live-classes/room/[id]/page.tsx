import React from "react";
import { Metadata } from "next";
import LiveRoomClient from "./LiveRoomClient";

export const metadata: Metadata = {
  title: "Live Classroom | Zoom Video SDK | Glarus Academy",
  description: "Live interactive video session powered by Zoom Video SDK UI Toolkit.",
};

export default async function LiveClassroomPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <LiveRoomClient sessionId={id} />;
}
