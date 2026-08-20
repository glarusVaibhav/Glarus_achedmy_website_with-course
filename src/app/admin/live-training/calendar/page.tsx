import React from "react";
import AdminLiveCalendarView from "@/components/admin/live-training/AdminLiveCalendarView";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Live Training Master Calendar | Admin Portal | Glarus Academy",
  description: "Schedule, monitor, and reschedule live workshop cohorts and sessions across the academy."
};

export default function LiveCalendarPage() {
  return <AdminLiveCalendarView />;
}
