"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function ApprovalsRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/admin/instructors?tab=approvals");
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] text-subtext space-y-3">
      <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
      <p className="text-sm font-semibold text-text">Redirecting to Instructor Approvals...</p>
    </div>
  );
}
