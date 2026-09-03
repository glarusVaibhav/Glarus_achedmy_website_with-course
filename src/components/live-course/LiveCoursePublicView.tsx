"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Users,
  Award,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Video,
  FileText,
  Code2,
  Layers,
  HelpCircle,
  Radio,
  Laptop
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { useCartStore } from "@/store/cartStore";

interface SessionItem {
  id: string;
  sessionNumber: number;
  sessionCode: string;
  title: string;
  description: string;
  date: string;
  startTime: string;
  endTime: string;
  duration: string;
  agenda: string[];
  learningOutcomes: string[];
  resources?: { title: string; type: string }[];
  preparation?: string;
  project?: string | null;
}

interface BatchItem {
  id: string;
  name: string;
  startDate: string;
  schedule: string;
  time: string;
  duration: string;
  enrolled: number;
  total: number;
}

interface PublicCourseData {
  id: string;
  title: string;
  category: string;
  level: string;
  duration: string;
  price: number;
  originalPrice: number;
  description: string;
  shortDescription?: string;
  prerequisites?: string;
  objectives?: string;
  totalSessions: number;
  projectsCount: number;
  certificateIncluded: boolean;
  instructor: {
    name: string;
    role: string;
    expertise: string;
    avatar: string;
    bio: string;
  };
  learningOutcomes: string[];
  batches: BatchItem[];
  sessions: SessionItem[];
  includes: string[];
  faqs: { q: string; a: string }[];
}

interface LiveCoursePublicViewProps {
  course: PublicCourseData;
}

export default function LiveCoursePublicView({ course }: LiveCoursePublicViewProps) {
  const router = useRouter();

  // Batch selection
  const [selectedBatchId, setSelectedBatchId] = useState<string>(
    course.batches?.[0]?.id || "batch-01"
  );

  const selectedBatch = course.batches?.find((b) => b.id === selectedBatchId) || course.batches?.[0];

  // Accordion Expand/Collapse state
  const [expandedSessions, setExpandedSessions] = useState<Record<number, boolean>>({ 1: true });
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const isAllExpanded = course.sessions.length > 0 && course.sessions.every((s) => expandedSessions[s.sessionNumber]);

  const handleToggleExpandAll = () => {
    if (isAllExpanded) {
      setExpandedSessions({});
    } else {
      const all: Record<number, boolean> = {};
      course.sessions.forEach((s) => {
        all[s.sessionNumber] = true;
      });
      setExpandedSessions(all);
    }
  };

  const toggleSession = (num: number) => {
    setExpandedSessions((prev) => ({
      ...prev,
      [num]: !prev[num],
    }));
  };

  const handleEnrollClick = () => {
    // Add item to cart store
    useCartStore.getState().addItem({
      id: course.id,
      title: course.title,
      instructor: course.instructor?.name || "Lead Cohort Instructor",
      rating: 4.9,
      reviews: 120,
      price: course.price,
      category: course.category,
      image: "/images/courses/generative-ai.png",
      duration: course.duration,
      isLive: true,
    } as any);

    // Navigate to checkout with live course ID and selected batch
    const checkoutUrl = `/checkout?type=live&courseId=${encodeURIComponent(course.id)}&batchId=${encodeURIComponent(selectedBatchId)}`;
    router.push(checkoutUrl);
  };

  const discountPercent = course.originalPrice > course.price
    ? Math.round(((course.originalPrice - course.price) / course.originalPrice) * 100)
    : 25;

  const seatsPercent = selectedBatch
    ? Math.min(100, Math.round((selectedBatch.enrolled / selectedBatch.total) * 100))
    : 65;

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
        
        {/* ───────── 1. Back to Live Classes ───────── */}
        <div>
          <Link
            href="/courses?type=live"
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1 text-primary" />
            <span>Back to Live Classes</span>
          </Link>
        </div>

        {/* ───────── 2. Course Hero (Two-Column Desktop) ───────── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* Left Hero Content */}
          <div className="lg:col-span-7 space-y-6">
            <div className="flex flex-wrap items-center gap-3">
              <span className="px-3 py-1 rounded-md bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 text-xs font-bold uppercase tracking-wider">
                {course.category}
              </span>
              <span className="px-3 py-1 rounded-md bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20 text-xs font-black flex items-center gap-1.5 uppercase tracking-wider">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                LIVE COHORT
              </span>
              <span className="px-3 py-1 rounded-md bg-slate-500/10 text-slate-700 dark:text-slate-300 border border-slate-500/20 text-xs font-bold">
                {course.level}
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-[1.15] text-foreground">
              {course.title}
            </h1>

            <p className="text-sm sm:text-base text-muted-foreground font-normal leading-relaxed max-w-2xl">
              {course.description}
            </p>

            {/* Metadata Pills */}
            <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-muted-foreground pt-2">
              <div className="flex items-center gap-2 font-medium">
                <Radio className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <span><strong className="text-foreground">{course.sessions.length}</strong> Live Sessions</span>
              </div>
              <span className="text-slate-400 dark:text-slate-600">•</span>
              <div className="flex items-center gap-2 font-medium">
                <Clock className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span>{course.duration}</span>
              </div>
              <span className="text-slate-400 dark:text-slate-600">•</span>
              <div className="flex items-center gap-2 font-medium">
                <Code2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span><strong className="text-foreground">{course.projectsCount}</strong> Capstone Projects</span>
              </div>
              <span className="text-slate-400 dark:text-slate-600">•</span>
              <div className="flex items-center gap-2 font-medium">
                <Award className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span>Certificate Included</span>
              </div>
            </div>
          </div>

          {/* Right Purchase / Access Card */}
          <div className="lg:col-span-5 w-full">
            <div className="rounded-3xl bg-card border border-border/80 shadow-2xl p-6 sm:p-8 space-y-6 relative overflow-hidden backdrop-blur-xl">
              {/* Subtle top accent gradient */}
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-500" />

              <div className="flex items-center justify-between gap-4">
                <span className="px-3 py-1 rounded-full bg-purple-500/15 text-purple-600 dark:text-purple-300 border border-purple-500/30 text-[11px] font-black uppercase tracking-wider">
                  LIMITED TIME OFFER
                </span>
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                  {discountPercent}% OFF
                </span>
              </div>

              {/* Price Row */}
              <div className="flex items-baseline gap-3">
                <span className="text-3xl sm:text-4xl font-black text-foreground">
                  ₹{course.price.toLocaleString("en-IN")}
                </span>
                {course.originalPrice > course.price && (
                  <span className="text-base sm:text-lg line-through text-muted-foreground font-semibold">
                    ₹{course.originalPrice.toLocaleString("en-IN")}
                  </span>
                )}
              </div>

              {/* Next Batch Highlights */}
              {selectedBatch && (
                <div className="p-4 rounded-2xl bg-muted/60 border border-border/80 space-y-3 text-xs">
                  <div className="flex items-center justify-between font-bold">
                    <span className="text-muted-foreground uppercase tracking-wider text-[11px]">NEXT COHORT BATCH</span>
                    <span className="text-purple-600 dark:text-purple-400 font-black">{selectedBatch.name}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-foreground font-medium pt-1">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                      <span>Starts {selectedBatch.startDate}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                      <span>{selectedBatch.time}</span>
                    </div>
                  </div>
                  
                  {/* Seats progress */}
                  <div className="space-y-1 pt-1">
                    <div className="flex items-center justify-between text-[11px] font-bold">
                      <span className="text-muted-foreground">{selectedBatch.enrolled} / {selectedBatch.total} Seats Filled</span>
                      <span className="text-purple-600 dark:text-purple-400">{seatsPercent}%</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-white/10 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full transition-all duration-500"
                        style={{ width: `${seatsPercent}%` }}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Primary CTA */}
              <button
                onClick={handleEnrollClick}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-black text-sm sm:text-base tracking-wide shadow-xl shadow-purple-900/25 transition-all flex items-center justify-center gap-2 group cursor-pointer"
              >
                <span>ENROLL NOW</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </button>

              <div className="flex items-center justify-center gap-4 text-[11px] text-muted-foreground font-semibold pt-1">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> Secure Payment
                </span>
                <span>•</span>
                <span>Instant Access</span>
                <span>•</span>
                <span>GST Tax Invoice</span>
              </div>
            </div>
          </div>
        </div>

        {/* ───────── 3. Course Stats Row ───────── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 py-4">
          <div className="p-5 rounded-2xl bg-card border border-border/70 text-center space-y-1">
            <div className="text-2xl sm:text-3xl font-black text-foreground">{course.sessions.length}</div>
            <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Live Sessions</div>
          </div>
          <div className="p-5 rounded-2xl bg-card border border-border/70 text-center space-y-1">
            <div className="text-2xl sm:text-3xl font-black text-foreground">{course.duration}</div>
            <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Instructor-Led</div>
          </div>
          <div className="p-5 rounded-2xl bg-card border border-border/70 text-center space-y-1">
            <div className="text-2xl sm:text-3xl font-black text-foreground">{course.projectsCount}</div>
            <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Capstone Projects</div>
          </div>
          <div className="p-5 rounded-2xl bg-card border border-border/70 text-center space-y-1">
            <div className="text-2xl sm:text-3xl font-black text-purple-600 dark:text-purple-400">Included</div>
            <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Verified Certificate</div>
          </div>
        </div>

        {/* ───────── 4. What You'll Learn ───────── */}
        <div className="space-y-6 pt-4">
          <div className="space-y-1">
            <h2 className="text-xs font-black text-purple-600 dark:text-purple-400 uppercase tracking-widest">
              Core Competencies
            </h2>
            <h3 className="text-2xl sm:text-3xl font-black text-foreground">
              What You&apos;ll Learn & Build
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {course.learningOutcomes.map((outcome, idx) => (
              <div
                key={idx}
                className="p-5 rounded-2xl bg-card border border-border/70 hover:border-purple-500/40 transition-all flex items-start gap-3.5"
              >
                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                <p className="text-xs sm:text-sm font-medium text-foreground leading-relaxed">
                  {outcome}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* ───────── 5. Complete Live Session Curriculum (The Flagship Section) ───────── */}
        <div className="space-y-6 pt-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-border/80 pb-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-purple-500" />
                <h2 className="text-xs font-black text-purple-600 dark:text-purple-400 uppercase tracking-widest">
                  Live Masterclass Curriculum
                </h2>
              </div>
              <h3 className="text-2xl sm:text-3xl font-black text-foreground">
                {course.sessions.length} Live Sessions · Complete Agenda
              </h3>
            </div>

            {/* Expand / Collapse All Controls */}
            <div className="flex items-center gap-3">
              <button
                onClick={handleToggleExpandAll}
                className="px-4 py-2 rounded-xl bg-card hover:bg-muted border border-border text-xs font-bold text-foreground transition-all cursor-pointer shadow-xs"
              >
                {isAllExpanded ? "Collapse All Sessions" : "Expand All Sessions"}
              </button>
            </div>
          </div>

          {/* Vertical Timeline Accordion */}
          <div className="relative pl-6 sm:pl-8 space-y-4 before:absolute before:left-3 sm:before:left-4 before:top-4 before:bottom-4 before:w-0.5 before:bg-gradient-to-b before:from-purple-500 before:via-indigo-500 before:to-slate-300 dark:before:to-slate-800">
            {course.sessions.map((sess) => {
              const isExpanded = !!expandedSessions[sess.sessionNumber];

              return (
                <div
                  key={sess.id || sess.sessionNumber}
                  className="relative rounded-2xl bg-card border border-border/80 hover:border-purple-500/40 transition-all overflow-hidden shadow-xs"
                >
                  {/* Timeline dot */}
                  <div className="absolute -left-6 sm:-left-8 top-6 w-3 h-3 rounded-full bg-purple-600 ring-4 ring-background transform -translate-x-1/2" />

                  {/* Header / Clickable summary */}
                  <button
                    onClick={() => toggleSession(sess.sessionNumber)}
                    className="w-full p-5 sm:p-6 text-left flex items-start sm:items-center justify-between gap-4 cursor-pointer"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 flex-1">
                      {/* Session Number Badge */}
                      <span className="text-xl sm:text-2xl font-black text-purple-600 dark:text-purple-400 shrink-0 font-mono">
                        {String(sess.sessionNumber).padStart(2, "0")}
                      </span>

                      <div className="space-y-1 flex-1">
                        <h4 className="text-base sm:text-lg font-bold text-foreground group-hover:text-purple-400 transition-colors">
                          {sess.title}
                        </h4>
                        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground font-medium">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-purple-500" />
                            {sess.duration}
                          </span>
                          <span>•</span>
                          <span>{sess.startTime} – {sess.endTime}</span>
                          {sess.project && (
                            <>
                              <span>•</span>
                              <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                                <Code2 className="w-3 h-3" /> Includes {sess.project}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="p-2 rounded-lg bg-muted text-muted-foreground shrink-0 mt-1 sm:mt-0">
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                  </button>

                  {/* Expanded Detailed Breakdown */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="border-t border-border/70 p-5 sm:p-6 bg-muted/30 space-y-5 text-xs sm:text-sm"
                      >
                        {sess.description && (
                          <p className="text-muted-foreground leading-relaxed font-normal">
                            {sess.description}
                          </p>
                        )}

                        {/* Agenda Topics */}
                        {sess.agenda && sess.agenda.length > 0 && (
                          <div className="space-y-2">
                            <h5 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                              <Layers className="w-3.5 h-3.5 text-purple-500" /> Session Agenda
                            </h5>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {sess.agenda.map((ag, agIdx) => (
                                <div
                                  key={agIdx}
                                  className="p-2.5 rounded-xl bg-card border border-border/70 flex items-center gap-2 text-foreground font-medium"
                                >
                                  <span className="w-5 h-5 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 text-[10px] font-black flex items-center justify-center shrink-0">
                                    {agIdx + 1}
                                  </span>
                                  <span className="truncate">{ag}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Learning Outcomes */}
                        {sess.learningOutcomes && sess.learningOutcomes.length > 0 && (
                          <div className="space-y-2">
                            <h5 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Key Takeaways
                            </h5>
                            <ul className="space-y-1.5">
                              {sess.learningOutcomes.map((lo, loIdx) => (
                                <li key={loIdx} className="flex items-start gap-2 text-muted-foreground font-medium">
                                  <span className="text-purple-500 font-bold">•</span>
                                  <span>{lo}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Preparation & Resources */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                          {sess.preparation && (
                            <div className="p-3 rounded-xl bg-card border border-border/70 space-y-1">
                              <span className="text-[11px] font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider block">
                                Preparation
                              </span>
                              <p className="text-xs text-muted-foreground font-medium">{sess.preparation}</p>
                            </div>
                          )}

                          {sess.resources && sess.resources.length > 0 && (
                            <div className="p-3 rounded-xl bg-card border border-border/70 space-y-1">
                              <span className="text-[11px] font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider block">
                                Resources Included
                              </span>
                              <div className="flex flex-wrap gap-2 pt-1">
                                {sess.resources.map((res, rIdx) => (
                                  <span
                                    key={rIdx}
                                    className="px-2.5 py-1 rounded-md bg-muted text-foreground text-[11px] font-semibold border border-border"
                                  >
                                    {res.title}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>

        {/* ───────── 6. Upcoming Batches Selection ───────── */}
        <div className="space-y-6 pt-6">
          <div className="space-y-1">
            <h2 className="text-xs font-black text-purple-600 dark:text-purple-400 uppercase tracking-widest">
              Cohort Timelines
            </h2>
            <h3 className="text-2xl sm:text-3xl font-black text-foreground">
              Select Your Preferred Batch
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {course.batches.map((batch) => {
              const isSelected = batch.id === selectedBatchId;
              const percent = Math.min(100, Math.round((batch.enrolled / batch.total) * 100));

              return (
                <div
                  key={batch.id}
                  onClick={() => setSelectedBatchId(batch.id)}
                  className={`p-6 rounded-3xl border transition-all cursor-pointer space-y-4 relative ${
                    isSelected
                      ? "bg-card border-purple-500 shadow-xl shadow-purple-900/10 ring-2 ring-purple-500/20"
                      : "bg-card/60 border-border hover:border-purple-500/40"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-black text-foreground">{batch.name}</span>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold border ${
                        isSelected
                          ? "bg-purple-500 text-white border-purple-500"
                          : "bg-muted text-muted-foreground border-border"
                      }`}
                    >
                      {isSelected ? "Selected Batch" : "Select Batch"}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs text-muted-foreground font-medium">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-purple-500 shrink-0" />
                      <span>Starts <strong>{batch.startDate}</strong></span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-purple-500 shrink-0" />
                      <span>{batch.schedule}</span>
                    </div>
                  </div>

                  <div className="text-xs text-foreground font-semibold flex items-center gap-2">
                    <Radio className="w-3.5 h-3.5 text-indigo-500" />
                    <span>Time: {batch.time}</span>
                  </div>

                  {/* Seats progress */}
                  <div className="space-y-1.5 pt-2">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-muted-foreground">{batch.enrolled} / {batch.total} Seats Reserved</span>
                      <span className="text-purple-600 dark:text-purple-400">{percent}% Filled</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full transition-all"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ───────── 7. Live Learning Journey (Marketing Roadmap) ───────── */}
        <div className="p-8 rounded-3xl bg-card border border-border/80 space-y-6">
          <div className="text-center max-w-2xl mx-auto space-y-1">
            <h2 className="text-xs font-black text-purple-600 dark:text-purple-400 uppercase tracking-widest">
              The Pedagogical Framework
            </h2>
            <h3 className="text-2xl sm:text-3xl font-black text-foreground">
              Live Cohort Learning Journey
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 pt-4">
            {[
              { num: "01", step: "Learn", desc: "Live instructor-led concept masterclasses" },
              { num: "02", step: "Practice", desc: "Hands-on coding labs & notebook exercises" },
              { num: "03", step: "Build", desc: "Production-grade capstone AI applications" },
              { num: "04", step: "Submit", desc: "Automated test suites & mentor code review" },
              { num: "05", step: "Get Certified", desc: "Cryptographically verifiable credential" },
            ].map((st, sIdx) => (
              <div
                key={sIdx}
                className="p-4 rounded-2xl bg-muted/40 border border-border/60 text-center space-y-2 relative"
              >
                <span className="text-lg font-black text-purple-600 dark:text-purple-400 font-mono">{st.num}</span>
                <h4 className="text-sm font-black text-foreground">{st.step}</h4>
                <p className="text-[11px] text-muted-foreground leading-snug font-medium">{st.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ───────── 8. Instructor Card ───────── */}
        {course.instructor && (
          <div className="space-y-4 pt-4">
            <h3 className="text-2xl font-black text-foreground">Meet Your Cohort Lead</h3>
            <div className="p-6 sm:p-8 rounded-3xl bg-card border border-border/80 flex flex-col sm:flex-row items-start sm:items-center gap-6">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white font-black text-2xl flex items-center justify-center shrink-0 shadow-lg shadow-purple-900/20">
                {course.instructor.name.charAt(0)}
              </div>
              <div className="space-y-2 flex-1">
                <div className="flex flex-wrap items-center gap-3">
                  <h4 className="text-xl font-black text-foreground">{course.instructor.name}</h4>
                  <span className="px-3 py-0.5 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 text-xs font-bold border border-purple-500/20">
                    {course.instructor.role}
                  </span>
                </div>
                <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400">{course.instructor.expertise}</p>
                <p className="text-xs sm:text-sm text-muted-foreground font-medium leading-relaxed max-w-3xl">
                  {course.instructor.bio}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ───────── 9. What's Included ───────── */}
        <div className="space-y-6 pt-4">
          <h3 className="text-2xl font-black text-foreground">What&apos;s Included in Your Enrollment</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {course.includes.map((inc, iIdx) => (
              <div
                key={iIdx}
                className="p-4 rounded-2xl bg-card border border-border/70 flex items-center gap-3"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span className="text-xs sm:text-sm font-semibold text-foreground">{inc}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ───────── 10. FAQ Accordion ───────── */}
        {course.faqs && course.faqs.length > 0 && (
          <div className="space-y-6 pt-6">
            <div className="space-y-1">
              <h2 className="text-xs font-black text-purple-600 dark:text-purple-400 uppercase tracking-widest">
                Frequently Asked Questions
              </h2>
              <h3 className="text-2xl font-black text-foreground">Common Inquiries</h3>
            </div>

            <div className="space-y-3">
              {course.faqs.map((faq, fIdx) => {
                const isOpen = openFaq === fIdx;

                return (
                  <div
                    key={fIdx}
                    className="rounded-2xl bg-card border border-border/80 overflow-hidden"
                  >
                    <button
                      onClick={() => setOpenFaq(isOpen ? null : fIdx)}
                      className="w-full p-5 text-left flex items-center justify-between gap-4 font-bold text-sm sm:text-base text-foreground cursor-pointer"
                    >
                      <span>{faq.q}</span>
                      <ChevronDown
                        className={`w-4 h-4 text-muted-foreground transition-transform ${
                          isOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                    {isOpen && (
                      <div className="px-5 pb-5 text-xs sm:text-sm text-muted-foreground font-medium leading-relaxed border-t border-border/50 pt-3">
                        {faq.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ───────── 11. Final Enrollment CTA Banner ───────── */}
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-purple-900/30 via-indigo-950/20 to-card border border-purple-500/30 text-center space-y-6">
          <div className="max-w-2xl mx-auto space-y-2">
            <span className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-600 dark:text-purple-300 text-xs font-black uppercase tracking-wider">
              JOIN THE NEXT COHORT
            </span>
            <h3 className="text-2xl sm:text-4xl font-black text-foreground tracking-tight">
              Ready to Master {course.title}?
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground font-medium">
              Enroll today in Batch {selectedBatch?.name || "#04"} to lock in early seat pricing and instant access to pre-course materials.
            </p>
          </div>

          <button
            onClick={handleEnrollClick}
            className="px-8 py-4 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-sm sm:text-base shadow-xl shadow-purple-900/30 transition-all inline-flex items-center gap-2 cursor-pointer"
          >
            <span>ENROLL IN LIVE COHORT NOW</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
}
