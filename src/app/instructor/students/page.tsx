"use client";

import { InstructorStudentsView } from "@/components/instructor/InstructorStudentsView";
import { useRouter } from "next/navigation";

export default function InstructorStudentsPage() {
  const router = useRouter();

  return (
    <div className="w-full min-h-screen bg-background text-text p-6 md:p-10 max-w-6xl mx-auto pb-32">
      <InstructorStudentsView
        onNavigateToAssignments={() => router.push("/instructor/assignments")}
        onNavigateToLiveSessions={() => router.push("/instructor/live-sessions")}
      />
    </div>
  );
}
