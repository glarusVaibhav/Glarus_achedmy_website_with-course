"use client";

import React from "react";
import Link from "next/link";
import { StudentPortalLayout } from "@/components/student/StudentPortalLayout";
import { TrendingUp, Clock, Flame, Award, BookOpen, PlaySquare, CheckCircle2 } from "lucide-react";

export default function StudentProgressPage() {
  return (
    <StudentPortalLayout>
      <div className="w-full min-h-screen py-8 px-4 sm:px-8 max-w-[1600px] mx-auto space-y-8">
        <div className="flex items-center gap-3 border-b border-border/50 pb-5">
          <div className="p-2.5 rounded-xl bg-primary/15 text-primary border border-primary/30">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-text tracking-tight">
              Learning <span className="text-primary">Progress</span> & Analytics
            </h1>
            <p className="text-xs sm:text-sm text-subtext mt-0.5">
              Track your lecture completions, live class attendance, and study hours.
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-card/60 border border-border/70 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-subtext uppercase">Total Hours Learned</span>
              <span className="text-[11px] text-emerald-400 font-semibold">+6.2 hrs this week</span>
            </div>
            <div className="text-3xl font-black text-text">48.5 hrs</div>
            <div className="text-xs text-subtext font-medium pt-1 flex items-center gap-2 border-t border-border/40">
              <span className="text-amber-400 font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                28.5 hrs Self-Paced
              </span>
              <span className="text-subtext/40">•</span>
              <span className="text-orange-400 font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-orange-400" />
                20.0 hrs Live
              </span>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-card/60 border border-border/70 space-y-1">
            <span className="text-xs font-bold text-subtext uppercase">Active Streak</span>
            <div className="text-3xl font-black text-orange-400 flex items-center gap-2">
              <span>5 Days</span>
              <Flame className="w-6 h-6" />
            </div>
            <p className="text-[11px] text-subtext">Personal best: 14 days</p>
          </div>

          <div className="p-5 rounded-2xl bg-card/60 border border-border/70 space-y-1">
            <span className="text-xs font-bold text-subtext uppercase">Live Class Attendance</span>
            <div className="text-3xl font-black text-purple-400">92%</div>
            <p className="text-[11px] text-purple-300 font-semibold">11 of 12 live classes attended</p>
          </div>

          <div className="p-5 rounded-2xl bg-card/60 border border-border/70 space-y-1">
            <span className="text-xs font-bold text-subtext uppercase">Recorded Sessions Watched</span>
            <div className="text-3xl font-black text-emerald-400">9 / 12</div>
            <Link href="/student/recorded-sessions" className="text-[11px] text-purple-400 font-bold hover:underline">
              View Remaining →
            </Link>
          </div>
        </div>

        {/* Detailed Program Progress */}
        <div className="p-6 rounded-3xl bg-card/60 border border-border/70 space-y-5">
          <h3 className="text-lg font-bold text-text">Active Course Completion Status</h3>

          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-background/50 border border-border/50 space-y-2">
              <div className="flex items-center justify-between text-sm font-bold">
                <span className="text-text">Advanced Generative AI Masterclass</span>
                <span className="text-purple-400">78% Complete</span>
              </div>
              <div className="w-full h-2 bg-card rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-purple-600 to-indigo-500 rounded-full" style={{ width: "78%" }} />
              </div>
              <div className="flex items-center justify-between text-xs text-subtext pt-1">
                <span>18 / 24 lectures completed</span>
                <Link href="/student/recorded-sessions" className="text-purple-300 font-semibold hover:underline">
                  Watch Live Recordings
                </Link>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-background/50 border border-border/50 space-y-2">
              <div className="flex items-center justify-between text-sm font-bold">
                <span className="text-text">Generative AI Application Engineering</span>
                <span className="text-emerald-400">100% Complete</span>
              </div>
              <div className="w-full h-2 bg-card rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: "100%" }} />
              </div>
              <div className="flex items-center justify-between text-xs text-subtext pt-1">
                <span>24 / 24 lectures completed</span>
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Certificate Unlocked
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </StudentPortalLayout>
  );
}
