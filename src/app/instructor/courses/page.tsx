"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { InstructorSelfPacedCoursesView } from "@/components/instructor/InstructorSelfPacedCoursesView";

export default function InstructorCoursesPage() {
  const router = useRouter();
  const [courses, setCourses] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/instructor/courses")
      .then((res) => res.json())
      .then((data) => {
        if (data && data.myCourses) {
          setCourses(data.myCourses);
        }
      })
      .catch((err) => console.warn("Failed to fetch instructor courses:", err));
  }, []);

  return (
    <div className="w-full min-h-screen bg-[#070A0F] text-white px-4 sm:px-8 py-5 max-w-[1600px] mx-auto">
      <InstructorSelfPacedCoursesView
        dbCourses={courses}
        onCreateCourse={() => router.push("/instructor")}
        onOpenCourseBuilder={(courseId) => router.push(`/instructor?course=${courseId}`)}
      />
    </div>
  );
}
