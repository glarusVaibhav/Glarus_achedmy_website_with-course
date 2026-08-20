"use client";

import { InstructorStudentsView } from "@/components/instructor/InstructorStudentsView";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";

function InstructorStudentsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const courseParam = searchParams.get("course") || undefined;
  const courseTitleParam = searchParams.get("courseTitle") || undefined;
  const classParam = searchParams.get("class") || searchParams.get("className") || undefined;
  const classIdParam = searchParams.get("classId") || undefined;
  const batchParam = searchParams.get("batch") || undefined;

  const returnTabParam = searchParams.get("returnTab") || undefined;

  const initialFilter = (courseParam || courseTitleParam || classParam || classIdParam || returnTabParam) ? {
    courseId: courseParam,
    courseTitle: courseTitleParam,
    classId: classIdParam,
    className: classParam,
    batch: batchParam,
    returnTab: returnTabParam,
  } : null;

  return (
    <div className="w-full min-h-screen bg-background text-text p-6 md:p-10 max-w-6xl mx-auto pb-32">
      <InstructorStudentsView
        onNavigateToAssignments={() => router.push("/instructor/assignments")}
        onNavigateToLiveSessions={() => router.push("/instructor/live-sessions")}
        onBack={() => router.back()}
        initialFilter={initialFilter}
      />
    </div>
  );
}

export default function InstructorStudentsPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center text-slate-400 text-sm">Loading student hub...</div>}>
      <InstructorStudentsContent />
    </Suspense>
  );
}
