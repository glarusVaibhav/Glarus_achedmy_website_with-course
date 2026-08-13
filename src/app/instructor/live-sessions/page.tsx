"use client";

import { InstructorLiveSessionsView } from "@/components/instructor/InstructorLiveSessionsView";

export default function InstructorLiveSessionsPage() {
  return (
    <div className="w-full min-h-screen bg-background text-text py-4 sm:py-8 pb-32">
      <InstructorLiveSessionsView />
    </div>
  );
}
