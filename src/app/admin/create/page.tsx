import React from "react";
import AdminCourseCreator from "@/components/admin/AdminCourseCreator";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create Course | Admin Portal | Glarus Academy",
  description: "Architect, generate with AI copilot, and publish courses across Glarus Academy."
};

export default function AdminCreateCoursePage() {
  return <AdminCourseCreator />;
}
