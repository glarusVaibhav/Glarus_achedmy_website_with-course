import React from "react";
import AdminLiveCourseDetail from "@/components/admin/live-training/AdminLiveCourseDetail";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Live Course Detail & Timeline | Admin Portal | Glarus Academy",
  description: "Manage live course cohort sessions, timelines, agendas, and instructor allocations."
};

export default function LiveCourseDetailPage() {
  return <AdminLiveCourseDetail />;
}
