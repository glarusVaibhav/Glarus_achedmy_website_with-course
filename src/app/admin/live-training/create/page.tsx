import React from "react";
import AdminLiveCourseCreator from "@/components/admin/live-training/AdminLiveCourseCreator";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create Live Course | Admin Portal | Glarus Academy",
  description: "Create and architect live scheduled courses, AI session agendas, and assign instructors."
};

export default function CreateLiveCoursePage() {
  return <AdminLiveCourseCreator />;
}
