"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { StudentPortalLayout } from "@/components/student/StudentPortalLayout";
import { TrendingUp, Clock, Flame, Award, BookOpen, PlaySquare, CheckCircle2, Activity } from "lucide-react";

interface SelfPacedCourse {
  id: string;
  title: string;
  instructor: string;
  progress: number;
  totalLectures: number;
  completedLectures: number;
  lastWatchedLecture: string | null;
  status: string;
}

export default function StudentProgressPage() {
  const [stats, setStats] = useState({
    total: 0,
    selfPacedCount: 0,
    liveCoursesCount: 0,
    inProgress: 0,
    completed: 0,
    streak: 0,
    bestStreak: 0,
    totalHours: 0,
    selfPacedHours: 0,
    liveHours: 0,
    weeklyHoursAdded: 0,
    totalXP: 0
  });
  const [courses, setCourses] = useState<SelfPacedCourse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [dashRes, spRes] = await Promise.all([
          fetch("/api/student/dashboard"),
          fetch("/api/student/self-paced")
        ]);

        const [dashData, spData] = await Promise.all([
          dashRes.json(),
          spRes.json()
        ]);

        const rawStats = dashData.stats || {};
        const spList: SelfPacedCourse[] = spData.courses || [];

        setStats({
          total: rawStats.total ?? spList.length,
          selfPacedCount: rawStats.selfPacedCount ?? spList.length,
          liveCoursesCount: rawStats.liveCoursesCount ?? 0,
          inProgress: rawStats.inProgress ?? 0,
          completed: rawStats.completed ?? 0,
          streak: rawStats.streak ?? 0,
          bestStreak: rawStats.bestStreak ?? 0,
          totalHours: rawStats.totalHours ?? 0,
          selfPacedHours: rawStats.selfPacedHours ?? 0,
          liveHours: rawStats.liveHours ?? 0,
          weeklyHoursAdded: rawStats.weeklyHoursAdded ?? 0,
          totalXP: rawStats.totalXP ?? 0,
        });

        setCourses(spList);
      } catch (err) {
        console.error("Failed to load student progress:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <StudentPortalLayout>
        <div className="w-full min-h-[60vh] flex flex-col items-center justify-center">
          <Activity className="w-8 h-8 text-primary animate-spin mb-3" />
          <p className="text-subtext font-bold text-sm">Loading your learning progress...</p>
        </div>
      </StudentPortalLayout>
    );
  }

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
              <span className="text-[11px] text-emerald-400 font-semibold">
                {stats.weeklyHoursAdded > 0 ? `+${stats.weeklyHoursAdded.toFixed(1)} hrs this week` : '0.0 hrs this week'}
              </span>
            </div>
            <div className="text-3xl font-black text-text">{stats.totalHours.toFixed(1)} hrs</div>
            <div className="text-xs text-subtext font-medium pt-1 flex items-center gap-2 border-t border-border/40">
              <span className="text-amber-400 font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                {stats.selfPacedHours.toFixed(1)} hrs Self-Paced
              </span>
              <span className="text-subtext/40">•</span>
              <span className="text-orange-400 font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-orange-400" />
                {stats.liveHours.toFixed(1)} hrs Live
              </span>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-card/60 border border-border/70 space-y-1">
            <span className="text-xs font-bold text-subtext uppercase">Active Streak</span>
            <div className="text-3xl font-black text-orange-400 flex items-center gap-2">
              <span>{stats.streak} {stats.streak === 1 ? 'Day' : 'Days'}</span>
              <Flame className="w-6 h-6" />
            </div>
            <p className="text-[11px] text-subtext">Personal best: {stats.bestStreak} {stats.bestStreak === 1 ? 'day' : 'days'}</p>
          </div>

          <div className="p-5 rounded-2xl bg-card/60 border border-border/70 space-y-1">
            <span className="text-xs font-bold text-subtext uppercase">Enrolled Programs</span>
            <div className="text-3xl font-black text-purple-400">{stats.total}</div>
            <p className="text-[11px] text-purple-300 font-semibold">{stats.inProgress} in progress · {stats.completed} completed</p>
          </div>

          <div className="p-5 rounded-2xl bg-card/60 border border-border/70 space-y-1">
            <span className="text-xs font-bold text-subtext uppercase">Total Earned XP</span>
            <div className="text-3xl font-black text-emerald-400">{stats.totalXP} XP</div>
            <Link href="/student/courses" className="text-[11px] text-purple-400 font-bold hover:underline">
              Go to My Courses →
            </Link>
          </div>
        </div>

        {/* Detailed Program Progress */}
        <div className="p-6 rounded-3xl bg-card/60 border border-border/70 space-y-5">
          <h3 className="text-lg font-bold text-text">Active Course Completion Status</h3>

          {courses.length === 0 ? (
            <div className="py-10 text-center text-subtext">
              <BookOpen className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p className="font-bold text-text">No courses enrolled yet</p>
              <Link href="/courses" className="text-primary text-xs font-bold hover:underline mt-1 inline-block">
                Browse course catalog →
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {courses.map((c) => {
                const isComplete = c.progress >= 100 || c.status === "COMPLETED";
                return (
                  <div key={c.id} className="p-4 rounded-2xl bg-background/50 border border-border/50 space-y-2">
                    <div className="flex items-center justify-between text-sm font-bold">
                      <span className="text-text">{c.title}</span>
                      <span className={isComplete ? "text-emerald-400" : "text-purple-400"}>
                        {c.progress}% Complete
                      </span>
                    </div>
                    <div className="w-full h-2 bg-card rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          isComplete ? "bg-emerald-500" : "bg-gradient-to-r from-purple-600 to-indigo-500"
                        }`}
                        style={{ width: `${Math.min(100, Math.max(0, c.progress))}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-xs text-subtext pt-1">
                      <span>{c.completedLectures} / {c.totalLectures} lectures completed</span>
                      {isComplete ? (
                        <span className="text-emerald-400 font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Certificate Unlocked
                        </span>
                      ) : (
                        <Link href="/student/courses" className="text-purple-300 font-semibold hover:underline">
                          Resume Learning →
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </StudentPortalLayout>
  );
}
