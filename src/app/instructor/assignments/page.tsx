"use client";

import { InstructorAssignmentsView } from "@/components/instructor/InstructorAssignmentsView";

export default function InstructorAssignmentsPage() {
  return (
    <div className="w-full min-h-screen bg-background text-text p-6 md:p-10 max-w-6xl mx-auto pb-32">
      <InstructorAssignmentsView />
    </div>
  );
}
