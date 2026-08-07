import { create } from "zustand";
import { persist } from "zustand/middleware";

interface EnrollmentState {
  enrolledCourseIds: string[];
  enrollCourse: (courseId: string) => void;
  isEnrolled: (courseId: string) => boolean;
}

export const useEnrollmentStore = create<EnrollmentState>()(
  persist(
    (set, get) => ({
      // Generative AI Application Engineering ("2" and "Generative_AI_Application_Engineer") is enrolled by default for the current user
      enrolledCourseIds: ["2", "Generative_AI_Application_Engineer"],
      
      enrollCourse: (courseId: string) => {
        const current = get().enrolledCourseIds;
        if (!current.includes(courseId)) {
          set({ enrolledCourseIds: [...current, courseId] });
        }
      },

      isEnrolled: (courseId: string) => {
        const current = get().enrolledCourseIds;
        // Normalize IDs so "2" and "Generative_AI_Application_Engineer" match flexibly
        if (courseId === "2" || courseId === "Generative_AI_Application_Engineer") {
          return current.includes("2") || current.includes("Generative_AI_Application_Engineer");
        }
        return current.includes(courseId);
      },
    }),
    {
      name: "glarus-enrollments",
    }
  )
);
