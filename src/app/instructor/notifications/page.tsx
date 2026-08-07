"use client";

import { InstructorNotificationsView } from "@/components/instructor/InstructorNotificationsView";

export default function InstructorNotificationsPage() {
  return (
    <div className="w-full min-h-screen bg-background text-text p-6 md:p-10 max-w-6xl mx-auto pb-32">
      <InstructorNotificationsView />
    </div>
  );
}
