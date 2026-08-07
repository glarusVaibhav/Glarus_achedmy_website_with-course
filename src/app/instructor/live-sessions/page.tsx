"use client";

import { InstructorLiveSessionsView } from "@/components/instructor/InstructorLiveSessionsView";

export default function InstructorLiveSessionsPage() {
  return (
    <div className="w-full min-h-screen bg-background text-text p-6 md:p-10 max-w-6xl mx-auto pb-32">
      <InstructorLiveSessionsView />
    </div>
  );
}
