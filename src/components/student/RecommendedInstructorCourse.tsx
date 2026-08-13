"use client";

import React, { useState } from "react";
import {
  Sparkles,
  Users,
  Video,
  Calendar,
  Clock,
  ArrowRight,
  CheckCircle2,
  Tv,
  Layers,
  Terminal,
  Code2,
  ShieldCheck,
  Zap,
  BookOpen,
  Award,
  ChevronRight,
  ExternalLink,
  Laptop
} from "lucide-react";
import Link from "next/link";

export interface LiveCourseData {
  id: string;
  title: string;
  instructor: string;
  batchName: string;
  nextClass?: {
    id: string;
    title: string;
    date: string;
    meetingLink: string;
  } | null;
  totalClasses?: number;
}

export interface LiveClassItemData {
  id: string;
  title: string;
  date: string;
  meetingLink: string;
  status: "ONGOING" | "UPCOMING";
  courseTitle: string;
  instructor: string;
  batchName: string;
}

interface RecommendedInstructorCourseProps {
  liveCourses?: LiveCourseData[];
  liveClasses?: LiveClassItemData[];
}

export function RecommendedInstructorCourse({
  liveCourses = [],
  liveClasses = [],
}: RecommendedInstructorCourseProps) {
  // If user has an enrolled instructor-led course, prioritize that data; otherwise use the flagship course
  const activeEnrolledCourse = liveCourses.length > 0 ? liveCourses[0] : null;
  const ongoingClass = liveClasses.find((c) => c.status === "ONGOING") || liveClasses[0] || null;

  const [activeTab, setActiveTab] = useState<"overview" | "curriculum" | "projects">("overview");

  // Master course recommendation configuration
  const course = {
    id: activeEnrolledCourse ? activeEnrolledCourse.id : "live-agentic-ai",
    title: activeEnrolledCourse
      ? activeEnrolledCourse.title
      : "Building Autonomous Agents with LangGraph & Multi-Agent Swarms",
    subtitle: "High-Impact Live Masterclass Personally Delivered & Mentored",
    description:
      "Work directly with me in live, interactive code-along masterclasses. We'll design production-ready multi-agent swarms, implement stateful graph memory, integrate custom tool-calling frameworks, and build deployment-ready AI applications together.",
    instructorName: activeEnrolledCourse ? activeEnrolledCourse.instructor : "Alex Chen",
    instructorRole: "Staff AI Engineer & Lead Instructor",
    instructorTag: "Personally Delivered",
    level: "Intermediate → Advanced",
    duration: "6 Weeks • 30+ Live Hours",
    format: "100% Live Interactive",
    batchName: activeEnrolledCourse
      ? activeEnrolledCourse.batchName
      : "Weekend AI Class #4",
    startDate: "Aug 20, 2026",
    schedulePattern: "Tue • Thu • Sat (08:00 PM – 10:30 PM IST)",
    seatsRemaining: 18,
    totalSeats: 50,
    modulesCount: 6,
    projectsCount: 5,
    modules: [
      { num: "01", title: "Stateful Agent Architectures & LangGraph Core" },
      { num: "02", title: "Human-in-the-loop, Memory & Checkpointing" },
      { num: "03", title: "Multi-Agent Swarm Coordination & Routing" },
      { num: "04", title: "Custom Tool Calling & Sandbox Execution" },
      { num: "05", title: "Production Monitoring, Evals & Benchmarking" },
      { num: "06", title: "Deployment to Kubernetes & Cloud Infrastructure" },
    ],
    projects: [
      "Autonomous Full-Stack Software Engineer Swarm",
      "Enterprise RAG Agent with Stateful Memory",
      "Self-Correcting SQL & Data Analysis Bot",
      "Multi-Modal Document Processing Pipeline",
      "Production Agentic Workflow with CI/CD Evals",
    ],
    skills: ["LangGraph", "LangChain", "Python 3.12", "FastAPI", "Docker", "Vector DBs", "OpenAI & Claude API"],
  };

  const nextLiveSession = activeEnrolledCourse?.nextClass || (ongoingClass ? {
    id: ongoingClass.id,
    title: ongoingClass.title,
    date: ongoingClass.date,
    meetingLink: ongoingClass.meetingLink
  } : {
    id: "scheduled-next",
    title: "StateGraph Architecture & Agent Loops (Live Workshop)",
    date: new Date(Date.now() + 4 * 3600 * 1000).toISOString(),
    meetingLink: "https://zoom.us/j/sample-live-agent-masterclass"
  });

  const isEnrolled = !!activeEnrolledCourse;

  return (
    <section className="relative w-full my-8">
      {/* Top Section Header with Distinctive Label */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-gradient-to-br from-purple-500/20 via-purple-500/10 to-transparent border border-purple-500/30 text-purple-400 shadow-lg shadow-purple-500/10">
            <Sparkles className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-black tracking-widest uppercase text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-indigo-300 to-cyan-400">
                ⭐ INSTRUCTOR SPOTLIGHT
              </span>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping mr-1" />
                Live Training
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-text tracking-tight mt-0.5">
              Instructor-Led <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-400">Masterclass</span>
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/courses?type=live"
            className="text-xs font-bold text-subtext hover:text-purple-400 transition-colors flex items-center gap-1.5 bg-card/60 hover:bg-card border border-card px-4 py-2 rounded-xl"
          >
            <span>Explore All Live Batches</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* IMMERSIVE HERO SPOTLIGHT CONTAINER                            */}
      {/* ───────────────────────────────────────────────────────────── */}
      <div className="relative rounded-[2rem] bg-gradient-to-b from-card via-card/90 to-background border border-purple-500/25 hover:border-purple-500/40 shadow-2xl shadow-purple-950/20 overflow-hidden transition-all duration-300 group">
        {/* Ambient Glows */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-purple-600/15 rounded-full blur-[100px] pointer-events-none group-hover:bg-purple-600/25 transition-all duration-700" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none group-hover:bg-cyan-500/20 transition-all duration-700" />

        {/* Top Accent Ribbon */}
        <div className="h-1.5 w-full bg-gradient-to-r from-purple-500 via-indigo-500 to-cyan-400" />

        <div className="p-6 sm:p-8 lg:p-10 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
            
            {/* ──────────── LEFT COLUMN (7 Cols - Rich Context) ──────────── */}
            <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
              
              {/* Badges & Course Metadata Bar */}
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="px-3.5 py-1 rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-400 text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-xs">
                  <Zap className="w-3.5 h-3.5 fill-current" />
                  Recommended Pathway
                </span>
                <span className="px-3 py-1 rounded-full bg-card border border-card/80 text-subtext text-xs font-bold flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-primary" />
                  {course.duration}
                </span>
                <span className="px-3 py-1 rounded-full bg-card border border-card/80 text-subtext text-xs font-bold flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-emerald-400" />
                  {course.level}
                </span>
              </div>

              {/* Course Title & Description */}
              <div>
                <h3 className="text-2xl sm:text-3xl lg:text-4xl font-black text-text tracking-tight leading-tight mb-3 group-hover:text-primary transition-colors">
                  {course.title}
                </h3>
                <p className="text-sm sm:text-base text-subtext font-medium leading-relaxed">
                  {course.description}
                </p>
              </div>

              {/* Instructor Personal Signature Bar */}
              <div className="p-4 rounded-2xl bg-background/60 border border-purple-500/20 backdrop-blur-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-600 p-0.5 shadow-md flex items-center justify-center text-white font-black text-lg">
                    AC
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-text text-sm sm:text-base">
                        {course.instructorName}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-purple-500/20 text-purple-300 border border-purple-500/30 uppercase tracking-wider">
                        Personal Mentor
                      </span>
                    </div>
                    <p className="text-xs text-subtext font-medium mt-0.5">
                      {course.instructorRole} • Live Interactive Lead
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-xl">
                  <ShieldCheck className="w-4 h-4 shrink-0" />
                  <span>1-on-1 Code Reviews</span>
                </div>
              </div>

              {/* Interactive Tabs (Overview / Curriculum / Projects) */}
              <div>
                <div className="flex items-center gap-2 border-b border-card/80 pb-2 mb-4">
                  <button
                    onClick={() => setActiveTab("overview")}
                    className={`text-xs font-extrabold px-3 py-1.5 rounded-lg transition-all ${
                      activeTab === "overview"
                        ? "bg-purple-600 text-white shadow-md shadow-purple-600/20"
                        : "text-subtext hover:text-text"
                    }`}
                  >
                    Key Pillars
                  </button>
                  <button
                    onClick={() => setActiveTab("curriculum")}
                    className={`text-xs font-extrabold px-3 py-1.5 rounded-lg transition-all ${
                      activeTab === "curriculum"
                        ? "bg-purple-600 text-white shadow-md shadow-purple-600/20"
                        : "text-subtext hover:text-text"
                    }`}
                  >
                    Curriculum ({course.modulesCount} Modules)
                  </button>
                  <button
                    onClick={() => setActiveTab("projects")}
                    className={`text-xs font-extrabold px-3 py-1.5 rounded-lg transition-all ${
                      activeTab === "projects"
                        ? "bg-purple-600 text-white shadow-md shadow-purple-600/20"
                        : "text-subtext hover:text-text"
                    }`}
                  >
                    Production Capstones ({course.projectsCount})
                  </button>
                </div>

                {/* Tab Content 1: Overview Pillars */}
                {activeTab === "overview" && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="p-3.5 rounded-xl bg-card/60 border border-card">
                      <div className="text-purple-400 font-bold text-xs flex items-center gap-1.5 mb-1">
                        <Terminal className="w-3.5 h-3.5" /> Live Coding
                      </div>
                      <p className="text-xs text-subtext">Real-time pair programming and swarm debugging rooms.</p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-card/60 border border-card">
                      <div className="text-cyan-400 font-bold text-xs flex items-center gap-1.5 mb-1">
                        <Code2 className="w-3.5 h-3.5" /> Production PRs
                      </div>
                      <p className="text-xs text-subtext">Direct PR reviews on your GitHub code from the instructor.</p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-card/60 border border-card">
                      <div className="text-emerald-400 font-bold text-xs flex items-center gap-1.5 mb-1">
                        <Award className="w-3.5 h-3.5" /> Portfolio Shipped
                      </div>
                      <p className="text-xs text-subtext">Ship 5 autonomous AI projects ready for FAANG interviews.</p>
                    </div>
                  </div>
                )}

                {/* Tab Content 2: Curriculum Highlights */}
                {activeTab === "curriculum" && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {course.modules.slice(0, 4).map((mod) => (
                      <div key={mod.num} className="p-2.5 rounded-xl bg-card/60 border border-card text-xs flex items-center gap-2.5">
                        <span className="font-mono font-black text-purple-400">{mod.num}</span>
                        <span className="font-semibold text-text truncate">{mod.title}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Tab Content 3: Projects */}
                {activeTab === "projects" && (
                  <div className="space-y-2">
                    {course.projects.slice(0, 3).map((proj, idx) => (
                      <div key={idx} className="p-2.5 rounded-xl bg-card/60 border border-card text-xs flex items-center gap-2 text-text font-semibold">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span className="truncate">{proj}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Skills Tags Footer */}
              <div className="flex flex-wrap items-center gap-1.5 pt-2">
                <span className="text-[11px] font-bold text-subtext mr-1">Core Tech:</span>
                {course.skills.map((skill) => (
                  <span
                    key={skill}
                    className="px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-background border border-card text-subtext"
                  >
                    {skill}
                  </span>
                ))}
              </div>

            </div>

            {/* ──────────── RIGHT COLUMN (5 Cols - Live Cockpit & Action) ──────────── */}
            <div className="lg:col-span-5 flex flex-col justify-between space-y-5 h-full">
              
              {/* Studio Code Simulator & Live Visual Card */}
              <div className="rounded-2xl bg-[#09061a] border border-purple-500/30 overflow-hidden shadow-xl relative">
                {/* Terminal Header */}
                <div className="h-9 bg-black/40 border-b border-white/10 px-3.5 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                  </div>
                  <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
                    <Terminal className="w-3 h-3 text-purple-400" /> langgraph_agent_stream.py
                  </span>
                  <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                    LIVE
                  </span>
                </div>

                {/* Code Body Mockup */}
                <div className="p-4 font-mono text-[11px] sm:text-xs text-slate-300 space-y-1 bg-gradient-to-b from-[#0b081e] to-[#070514]">
                  <div><span className="text-purple-400">from</span> langgraph.graph <span className="text-purple-400">import</span> StateGraph</div>
                  <div><span className="text-purple-400">from</span> core.agents <span className="text-purple-400">import</span> SwarmLeader</div>
                  <div className="text-slate-500 py-0.5"># Live Interactive Architecture Stream</div>
                  <div><span className="text-blue-400">builder</span> = StateGraph(MultiAgentState)</div>
                  <div><span className="text-blue-400">builder</span>.add_node(<span className="text-emerald-300">"supervisor"</span>, lead_agent)</div>
                  <div><span className="text-blue-400">builder</span>.compile(checkpointer=MemorySaver())</div>
                  
                  <div className="mt-3 pt-2.5 border-t border-white/5 flex items-center justify-between text-[10px] text-slate-400">
                    <span className="text-emerald-400 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                      Session Ready
                    </span>
                    <span>1080p 60fps HD Sandbox</span>
                  </div>
                </div>
              </div>

              {/* Schedule & Batch Status Box */}
              <div className="p-5 rounded-2xl bg-card/80 border border-card backdrop-blur-md space-y-4">
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-subtext">
                    <Calendar className="w-4 h-4 text-purple-400" />
                    <span>Current Class Batch</span>
                  </div>
                  <span className="font-extrabold text-xs text-text bg-purple-500/10 px-2.5 py-1 rounded-lg border border-purple-500/20">
                    {course.batchName}
                  </span>
                </div>

                {nextLiveSession ? (
                  <div className="p-3 rounded-xl bg-background/80 border border-purple-500/20">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-[11px] font-bold text-subtext uppercase tracking-wider flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-purple-400" /> Next Upcoming Session
                      </span>
                      <span className="text-[10px] font-extrabold text-emerald-400 bg-emerald-500/15 px-2 py-0.5 rounded-full">
                        Confirmed
                      </span>
                    </div>
                    <h4 className="font-bold text-text text-sm truncate">{nextLiveSession.title}</h4>
                    <p className="text-xs text-purple-400 font-semibold mt-0.5">
                      {new Date(nextLiveSession.date).toLocaleString([], {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                ) : (
                  <div className="p-3 rounded-xl bg-background/80 border border-card text-center text-xs text-subtext">
                    Next schedule announcement coming soon.
                  </div>
                )}

                {/* Seat filling progress */}
                <div>
                  <div className="flex justify-between text-xs font-bold mb-1.5">
                    <span className="text-subtext">Seat Availability</span>
                    <span className="text-purple-400 font-extrabold">
                      {course.seatsRemaining} seats left of {course.totalSeats}
                    </span>
                  </div>
                  <div className="w-full h-2 bg-background rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-purple-500 to-cyan-400 rounded-full"
                      style={{
                        width: `${Math.round(((course.totalSeats - course.seatsRemaining) / course.totalSeats) * 100)}%`,
                      }}
                    />
                  </div>
                </div>

                {/* CTA Action Buttons */}
                <div className="pt-2 flex flex-col sm:flex-row gap-3">
                  {nextLiveSession?.meetingLink ? (
                    <a
                      href={nextLiveSession.meetingLink}
                      target="_blank"
                      rel="noreferrer"
                      className="flex-1 py-3.5 px-4 bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white rounded-xl font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-purple-600/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
                    >
                      <Video className="w-4 h-4" />
                      <span>{isEnrolled ? "Enter Live Classroom" : "Join Next Session"}</span>
                    </a>
                  ) : null}

                  <Link
                    href="/courses?type=live"
                    className="py-3.5 px-4 rounded-xl border border-purple-500/30 bg-card hover:bg-card/80 text-text font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all text-center"
                  >
                    <span>{isEnrolled ? "Full Class Schedule" : "View Syllabus"}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

              </div>

            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
