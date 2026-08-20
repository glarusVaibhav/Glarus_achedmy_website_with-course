"use client";

import { InstructorAssignmentsView } from "@/components/instructor/InstructorAssignmentsView";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function InstructorAssignmentsContent() {
  const searchParams = useSearchParams();
  const student = searchParams.get("student") || undefined;
  const email = searchParams.get("email") || undefined;
  const courseTitle = searchParams.get("courseTitle") || searchParams.get("course") || undefined;
  const assignmentTitle = searchParams.get("assignment") || undefined;

  const initialFilter = (student || email || courseTitle || assignmentTitle) ? {
    studentName: student,
    studentEmail: email,
    courseTitle: courseTitle,
    assignmentTitle: assignmentTitle,
  } : null;

  return (
    <div className="w-full min-h-screen bg-background text-text p-4 md:p-8 max-w-[1240px] mx-auto pb-32">
      <InstructorAssignmentsView initialFilter={initialFilter} />
    </div>
  );
}

export default function InstructorAssignmentsPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center text-slate-400 text-sm">Loading assignments...</div>}>
      <InstructorAssignmentsContent />
    </Suspense>
  );
}
