"use client";

import React, { useEffect, useState, use } from "react";
import { useParams, useRouter } from "next/navigation";
import LiveCoursePublicView from "@/components/live-course/LiveCoursePublicView";
import LiveCourseEnrolledView from "@/components/live-course/LiveCourseEnrolledView";
import LiveCourseSkeleton from "@/components/live-course/LiveCourseSkeleton";
import Link from "next/link";
import { ArrowLeft, AlertTriangle } from "lucide-react";

export default function DynamicLiveCoursePage({
  params,
}: {
  params: Promise<{ liveCourseId: string }>;
}) {
  const router = useRouter();
  const resolvedParams = use(params);
  const liveCourseId = resolvedParams.liveCourseId;

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCourseDetails() {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(`/api/student/live-courses/${encodeURIComponent(liveCourseId)}`);
        const json = await res.json();

        if (!res.ok || !json.success) {
          throw new Error(json.error?.message || "Failed to load live course details.");
        }

        setData(json);
      } catch (err: any) {
        console.error("Error loading live course details:", err);
        setError(err.message || "Failed to fetch live course details.");
      } finally {
        setLoading(false);
      }
    }

    if (liveCourseId) {
      fetchCourseDetails();
    }
  }, [liveCourseId]);

  if (loading) {
    return <LiveCourseSkeleton />;
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
        <div className="p-8 max-w-md w-full rounded-3xl bg-card border border-border space-y-4 shadow-xl">
          <div className="w-12 h-12 rounded-2xl bg-red-500/10 text-red-500 flex items-center justify-center mx-auto">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-black text-foreground">Course Unavailable</h2>
          <p className="text-xs text-muted-foreground font-medium">
            {error || "The live course you requested could not be found or is no longer scheduled."}
          </p>
          <div className="pt-2 flex flex-col gap-2">
            <button
              onClick={() => window.location.reload()}
              className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs transition-all cursor-pointer"
            >
              Retry Loading
            </button>
            <Link
              href="/courses?type=live"
              className="w-full py-2.5 rounded-xl bg-muted hover:bg-muted/80 text-foreground font-bold text-xs transition-all flex items-center justify-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Live Classes
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Dual-State Rendering: Enrolled vs Public
  if (data.isEnrolled) {
    return (
      <LiveCourseEnrolledView
        course={data.course}
        studentStats={data.studentStats}
        enrollment={data.enrollment}
        nextSession={data.nextSession}
        batch={data.batch}
      />
    );
  }

  return <LiveCoursePublicView course={data.course} />;
}
