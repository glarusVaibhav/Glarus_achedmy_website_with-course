import React, { Suspense } from "react";
import AdminCourseCreator from "@/components/admin/AdminCourseCreator";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create Course | Admin Portal | Glarus Academy",
  description: "Architect, generate with AI copilot, and publish courses across Glarus Academy."
};

export default function AdminCreateCoursePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background flex items-center justify-center text-subtext text-xs">Loading course studio...</div>}>
      <AdminCourseCreator />
    </Suspense>
  );
}
