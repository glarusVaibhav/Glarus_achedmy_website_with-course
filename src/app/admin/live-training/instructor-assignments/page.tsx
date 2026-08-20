import React from "react";
import AdminInstructorAssignmentsView from "@/components/admin/live-training/AdminInstructorAssignmentsView";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Instructor Assignments & Permissions | Admin Portal | Glarus Academy",
  description: "Manage live course and session instructor allocations, editing rights, and granular RBAC."
};

export default function InstructorAssignmentsPage() {
  return <AdminInstructorAssignmentsView />;
}
