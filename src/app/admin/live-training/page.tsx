import React from "react";
import AdminLiveCoursesList from "@/components/admin/live-training/AdminLiveCoursesList";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Live Training & Cohort Management | Admin Portal | Glarus Academy",
  description: "Manage live courses, workshop sessions, cohort cadences, and instructor allocations."
};

export default function AdminLiveTrainingPage() {
  return <AdminLiveCoursesList />;
}
