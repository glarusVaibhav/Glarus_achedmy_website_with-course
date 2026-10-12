"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  BookOpen, 
  Radio, 
  Sparkles, 
  X, 
  ArrowRight, 
  CheckCircle2, 
  Video, 
  Calendar, 
  Users, 
  Code2, 
  Layers, 
  Zap 
} from "lucide-react";

interface CreateCourseTypeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectType?: (type: "SELF_PACED" | "LIVE_CLASS") => void;
  baseRole?: "admin" | "instructor";
}

export function CreateCourseTypeModal({
  isOpen,
  onClose,
  onSelectType,
  baseRole = "admin"
}: CreateCourseTypeModalProps) {
  const router = useRouter();

  if (!isOpen) return null;

  const handleSelect = (type: "SELF_PACED" | "LIVE_CLASS") => {
    if (onSelectType) {
      onSelectType(type);
      return;
    }

    if (type === "SELF_PACED") {
      if (baseRole === "admin") {
        router.push("/admin/create?format=self-paced");
      } else {
        router.push("/instructor/create?format=self-paced");
      }
    } else {
      if (baseRole === "admin") {
        router.push("/admin/live-training/create");
      } else {
        router.push("/instructor/live-classes/create");
      }
    }
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/80 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="relative w-full max-w-3xl overflow-hidden rounded-3xl bg-card border border-border/80 dark:border-white/[0.1] shadow-2xl z-10 flex flex-col max-h-[90vh]"
        >
          {/* Top Ambient Glow */}
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-purple-500 via-sky-500 to-emerald-500" />
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-28 bg-purple-600/20 blur-3xl pointer-events-none" />

          {/* Modal Header */}
          <div className="p-6 sm:p-8 pb-4 flex items-start justify-between gap-4 border-b border-border/50 relative z-10">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold mb-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Course Creation Studio</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-foreground tracking-tight">
                Select Course Delivery Format
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Choose how you want to deliver this course before configuring curriculum and content.
              </p>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors shrink-0"
              title="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Modal Body: 2 Prominent Cards */}
          <div className="p-6 sm:p-8 overflow-y-auto space-y-6 relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              
              {/* ── CARD 1: SELF-PACED VIDEO COURSE ── */}
              <div
                onClick={() => handleSelect("SELF_PACED")}
                className="group relative p-6 rounded-2xl bg-card/60 hover:bg-card border-2 border-border/80 hover:border-purple-500/60 transition-all duration-300 flex flex-col justify-between cursor-pointer hover:shadow-xl hover:shadow-purple-500/10 hover:-translate-y-1"
              >
                <div className="space-y-4">
                  {/* Top Badge & Icon */}
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-1 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 text-[10px] font-black uppercase tracking-wider">
                      On-Demand Video
                    </span>
                    <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center border border-purple-500/20 group-hover:scale-110 group-hover:bg-purple-500 group-hover:text-white transition-all shadow-sm">
                      <BookOpen className="w-5 h-5" />
                    </div>
                  </div>

                  {/* Title & Description */}
                  <div>
                    <h3 className="text-lg font-black text-foreground group-hover:text-purple-400 transition-colors">
                      Self-Paced Course
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                      Build an on-demand curriculum with pre-recorded video lectures, interactive Python sandboxes, quizzes, and resources.
                    </p>
                  </div>

                  {/* Key Highlights */}
                  <ul className="space-y-2 pt-1 border-t border-border/40 text-[11px] text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                      <span>AI Copilot Syllabus & Module Generator</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                      <span>Video Lectures with Cloud Video Player</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                      <span>Hands-on Live Code Sandbox Labs</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                      <span>Technical Blueprint PDFs & Quizzes</span>
                    </li>
                  </ul>
                </div>

                {/* Card Action Button */}
                <div className="pt-6">
                  <div className="w-full py-2.5 px-4 rounded-xl bg-purple-600 group-hover:bg-purple-500 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md shadow-purple-600/20 transition-all">
                    <span>Create Self-Paced Course</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              </div>

              {/* ── CARD 2: LIVE BOOTCAMP / COHORT ── */}
              <div
                onClick={() => handleSelect("LIVE_CLASS")}
                className="group relative p-6 rounded-2xl bg-card/60 hover:bg-card border-2 border-border/80 hover:border-emerald-500/60 transition-all duration-300 flex flex-col justify-between cursor-pointer hover:shadow-xl hover:shadow-emerald-500/10 hover:-translate-y-1"
              >
                <div className="space-y-4">
                  {/* Top Badge & Icon */}
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      Live Cohort
                    </span>
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center border border-emerald-500/20 group-hover:scale-110 group-hover:bg-emerald-500 group-hover:text-white transition-all shadow-sm">
                      <Radio className="w-5 h-5" />
                    </div>
                  </div>

                  {/* Title & Description */}
                  <div>
                    <h3 className="text-lg font-black text-foreground group-hover:text-emerald-400 transition-colors">
                      Live Bootcamp
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                      Launch interactive cohort-based programs with scheduled Zoom sessions, batch rosters, attendance tracking, and assignments.
                    </p>
                  </div>

                  {/* Key Highlights */}
                  <ul className="space-y-2 pt-1 border-t border-border/40 text-[11px] text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span>Live Zoom & WebRTC Classrooms</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span>Cohort Schedules & Multi-Batch Rosters</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span>Automated Attendance & Recording Progress</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span>Live Mentored Homework & Defenses</span>
                    </li>
                  </ul>
                </div>

                {/* Card Action Button */}
                <div className="pt-6">
                  <div className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 group-hover:bg-emerald-500 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 transition-all">
                    <span>Create Live Bootcamp</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* Modal Footer */}
          <div className="p-4 sm:px-8 bg-muted/30 border-t border-border/50 flex items-center justify-between text-xs text-muted-foreground relative z-10">
            <div className="flex items-center gap-2">
              <Zap className="w-3.5 h-3.5 text-primary" />
              <span>You can configure all curriculum modules, pricing, and media in the next step.</span>
            </div>
            <button
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg hover:bg-muted font-semibold transition-colors cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
