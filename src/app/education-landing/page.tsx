"use client";

import React from "react";
import { EducationNavbar } from "./components/EducationNavbar";
import { EducationHero } from "./components/EducationHero";
import { LearningStages } from "./components/LearningStages";
import { ExploreCourses } from "./components/ExploreCourses";
import { SchoolLearningShowcase } from "./components/SchoolLearningShowcase";
import { LiveClassesShowcase } from "./components/LiveClassesShowcase";
import { LearningPathsShowcase } from "./components/LearningPathsShowcase";
import { WhyGlarusAcademy } from "./components/WhyGlarusAcademy";
import { StudentDashboardPreview } from "./components/StudentDashboardPreview";
import { FinalCTA } from "./components/FinalCTA";
import { EducationFooter } from "./components/EducationFooter";

export default function EducationLandingPage() {
  return (
    <main className="w-full flex flex-col min-h-screen bg-[#fafaf9] text-slate-900 scroll-smooth">
      {/* Section 1: Premium Light Navigation */}
      <EducationNavbar />

      {/* Section 2: Hero Section */}
      <EducationHero />

      {/* Section 3: Learning for Every Stage (School, Skills, AI, Career) */}
      <LearningStages />

      {/* Section 4: Explore Courses with Category Filters & Search */}
      <ExploreCourses />

      {/* Section 5: School Learning Showcase (Class 5 to 12) */}
      <SchoolLearningShowcase />

      {/* Section 6: Live Classes & Masterclasses */}
      <LiveClassesShowcase />

      {/* Section 7: Curated Learning Paths & Visual Roadmaps */}
      <LearningPathsShowcase />

      {/* Section 8: Why GlarusAcademy Benefits */}
      <WhyGlarusAcademy />

      {/* Section 9: Student Experience / Dashboard Preview */}
      <StudentDashboardPreview />

      {/* Section 10: Final Call to Action */}
      <FinalCTA />

      {/* Section 11: Premium Multi-Column Light Footer */}
      <EducationFooter />
    </main>
  );
}
