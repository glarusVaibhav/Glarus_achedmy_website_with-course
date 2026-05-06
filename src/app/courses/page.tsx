"use client";

import { useEffect, useState } from "react";
import { CourseCard } from "@/components/CourseCard";
import { CATEGORIES } from "@/lib/data";

export default function CoursesPage() {
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/courses")
      .then(res => res.json())
      .then(data => {
        if (data.courses) {
           // Map database course data to the UI format 
           const mappedCourses = data.courses.map((c: any) => ({
             ...c,
             instructor: c.instructor?.name || "Expert Instructor",
             level: "Intermediate", // Fallback mock 
             rating: 4.8, // Fallback mock
             duration: "12 Weeks", // Fallback mock
             image: "/placeholder-course.jpg" // Handled by next/image if real image doesn't exist, wait, need a safe string
           }));
           setCourses(mappedCourses);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="w-full py-20 min-h-screen">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-5xl font-bold text-text mb-4">Explore Our <span className="text-primary">Courses</span></h1>
            <p className="text-lg text-subtext">Comprehensive, project-based curriculums to upgrade your career.</p>
          </div>
          <div className="flex items-center gap-2">
            <select className="bg-background border border-card text-text text-sm rounded-lg focus:ring-primary focus:border-primary block w-full p-2.5 outline-none">
              <option value="all">All Categories</option>
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
           <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>
        ) : courses.length === 0 ? (
           <div className="text-center py-20 bg-card border border-card rounded-2xl text-subtext">
             No approved courses found. Check back later!
           </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {courses.map(course => (
               <CourseCard key={course.id} course={course} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
