"use client";

import { InstructorTasksView } from "@/components/instructor/InstructorTasksView";
import { useRouter } from "next/navigation";

export default function InstructorTasksPage() {
  const router = useRouter();

  const handleNavigateTab = (tabName: string) => {
    if (tabName === "Live Sessions") {
      router.push("/instructor/live-sessions");
    } else if (tabName === "Students") {
      router.push("/instructor/students");
    } else {
      router.push("/instructor");
    }
  };

  return (
    <div className="w-full min-h-screen bg-background text-text py-4 sm:py-8 pb-32 font-sans">
      <InstructorTasksView onNavigateTab={handleNavigateTab} />
    </div>
  );
}
