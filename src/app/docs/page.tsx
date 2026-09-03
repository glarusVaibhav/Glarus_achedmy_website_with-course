"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  BookOpen, 
  Layers, 
  Database, 
  Sparkles, 
  ShieldCheck, 
  Cpu, 
  Terminal, 
  ArrowLeft, 
  Check, 
  Copy, 
  Search, 
  Code2, 
  Server, 
  Users, 
  Calendar, 
  Radio, 
  FileText,
  Activity
} from "lucide-react";

export default function DocumentationPage() {
  const [activeTab, setActiveTab] = useState<"ARCHITECTURE" | "DATABASE" | "AI" | "RBAC" | "APIS" | "SETUP">("ARCHITECTURE");
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2500);
  };

  return (
    <div className="min-h-screen bg-background text-text selection:bg-purple-500/30">
      {/* Top Banner Header */}
      <div className="border-b border-white/10 bg-card/60 backdrop-blur-xl sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-subtext hover:text-text transition-colors"
              title="Back to Home"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-black bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">
                  Glarus Academy Documentation
                </h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  v2.0 Architecture
                </span>
              </div>
              <p className="text-xs text-subtext">
                Technical Blueprint, Subsystems, Data Models & API Specifications
              </p>
            </div>
          </div>

          {/* Quick Nav Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar pb-1 md:pb-0">
            {[
              { key: "ARCHITECTURE", label: "Architecture", icon: Layers },
              { key: "DATABASE", label: "Database ERD", icon: Database },
              { key: "AI", label: "AI Copilots", icon: Sparkles },
              { key: "RBAC", label: "RBAC Matrix", icon: ShieldCheck },
              { key: "APIS", label: "API Reference", icon: Server },
              { key: "SETUP", label: "Quick Setup", icon: Terminal },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as any)}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                    isActive
                      ? "bg-purple-600 text-white shadow-lg shadow-purple-600/30 scale-105"
                      : "bg-card hover:bg-card-hover border border-white/5 text-subtext hover:text-text"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* ═══════════════════════════════════════════════════════════════
            TAB 1: ARCHITECTURE
            ═══════════════════════════════════════════════════════════════ */}
        {activeTab === "ARCHITECTURE" && (
          <div className="space-y-8 animate-in fade-in duration-200">
            <div className="p-6 rounded-2xl bg-card border border-white/10 space-y-4">
              <h2 className="text-base font-bold text-text flex items-center gap-2">
                <Layers className="w-5 h-5 text-purple-400" />
                High-Level System Architecture & Flow
              </h2>
              <p className="text-xs text-subtext leading-relaxed">
                Glarus Academy is engineered on a modern Next.js 16 full-stack decoupled architecture. The frontend leverages client-side WebAssembly Python execution (Pyodide) for interactive coding exercises, while live cohort orchestration is handled via Next.js Route Handlers and Prisma ORM backed by SQLite/PostgreSQL.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                <div className="p-4 rounded-xl bg-background/80 border border-white/5 space-y-2">
                  <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-xs">
                    01
                  </div>
                  <h3 className="text-xs font-bold text-text">Interactive Learning Engine</h3>
                  <p className="text-[11px] text-subtext leading-relaxed">
                    Zero-latency in-browser Python 3 execution via Pyodide WASM. Full-screen distraction-free player with slide stages, code evaluation, quizzes, and live AI tutor.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-background/80 border border-white/5 space-y-2">
                  <div className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold text-xs">
                    02
                  </div>
                  <h3 className="text-xs font-bold text-text">Live Cohort Bootcamps</h3>
                  <p className="text-[11px] text-subtext leading-relaxed">
                    Administrative scheduling engine with 5-step wizard, interactive session timeline builder, master calendar, and automated reschedule audit trails.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-background/80 border border-white/5 space-y-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs">
                    03
                  </div>
                  <h3 className="text-xs font-bold text-text">Groq LLM Copilots</h3>
                  <p className="text-[11px] text-subtext leading-relaxed">
                    Ultra-fast inference with <code className="text-purple-300">openai/gpt-oss-20b</code>. Crafts entire curriculums, session agendas, and multi-paragraph course overviews.
                  </p>
                </div>
              </div>
            </div>

            {/* Architecture Stack Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 rounded-2xl bg-card border border-white/10 space-y-4">
                <h3 className="text-sm font-bold text-text flex items-center gap-2">
                  <Code2 className="w-4 h-4 text-indigo-400" />
                  Frontend & Client Runtime
                </h3>
                <ul className="space-y-2.5 text-xs text-subtext">
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-400 mt-1.5 shrink-0" />
                    <span><strong>Next.js 16 (App Router)</strong> & React 19: Server/Client component boundary for optimal performance.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-400 mt-1.5 shrink-0" />
                    <span><strong>TailwindCSS v4</strong>: Custom design tokens, dark glassmorphism, glowing accents.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-400 mt-1.5 shrink-0" />
                    <span><strong>Pyodide WASM Engine</strong>: Client-side sandboxed Python evaluation without backend infrastructure cost.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-400 mt-1.5 shrink-0" />
                    <span><strong>Zustand</strong>: Reactive state stores for Cart, Wishlist, Course Progress, and Audio transcript states.</span>
                  </li>
                </ul>
              </div>

              <div className="p-6 rounded-2xl bg-card border border-white/10 space-y-4">
                <h3 className="text-sm font-bold text-text flex items-center gap-2">
                  <Server className="w-4 h-4 text-emerald-400" />
                  Backend, Database & Security
                </h3>
                <ul className="space-y-2.5 text-xs text-subtext">
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                    <span><strong>Prisma ORM</strong>: Fully typed database access with relational querying and migration management.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                    <span><strong>JWT Auth (jose)</strong>: Stateless signed cookies with bcryptjs password encryption.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                    <span><strong>Audit Logging</strong>: Immutable history of session reschedules, instructor reassignments, and administrative actions.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                    <span><strong>Granular RBAC</strong>: 10 individual permission toggles per instructor session assignment.</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════
            TAB 2: DATABASE ERD
            ═══════════════════════════════════════════════════════════════ */}
        {activeTab === "DATABASE" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="p-6 rounded-2xl bg-card border border-white/10 space-y-4">
              <h2 className="text-base font-bold text-text flex items-center gap-2">
                <Database className="w-5 h-5 text-indigo-400" />
                Prisma Database Entities & Relations
              </h2>
              <p className="text-xs text-subtext leading-relaxed">
                The database schema powers multi-role authentication, self-paced courses, live cohort sessions, instructor assignment permissions, and audit logs.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                {[
                  {
                    model: "User",
                    fields: "id, email, name, password, role (ADMIN|INSTRUCTOR|STUDENT), avatar",
                    desc: "Central identity entity for all platform actors."
                  },
                  {
                    model: "LiveCourse",
                    fields: "id, title, category, level, price, maxStudents, startDate, leadInstructorId, status",
                    desc: "Live cohort bootcamp container with scheduling parameters."
                  },
                  {
                    model: "LiveSession",
                    fields: "id, courseId, sessionNumber, title, date, startTime, endTime, duration, meetingUrl, status",
                    desc: "Individual interactive live session with JSON agendas and homework."
                  },
                  {
                    model: "InstructorAssignment",
                    fields: "id, sessionId, instructorId, canEdit, canEditAgenda, canReschedule, canManageAttendance",
                    desc: "Granular RBAC matrix governing instructor privileges per session."
                  },
                  {
                    model: "RescheduleHistory",
                    fields: "id, sessionId, previousDate, newDate, previousStartTime, newStartTime, reason, rescheduledBy",
                    desc: "Immutable change history tracking who rescheduled sessions and why."
                  },
                  {
                    model: "AuditLog",
                    fields: "id, action, resource, resourceId, details (JSON), actorId, createdAt",
                    desc: "Comprehensive platform-wide administrative activity trail."
                  }
                ].map((item) => (
                  <div key={item.model} className="p-4 rounded-xl bg-background/80 border border-white/5 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-purple-300 font-mono">{item.model}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20 font-mono">
                        Model
                      </span>
                    </div>
                    <p className="text-xs text-subtext">{item.desc}</p>
                    <div className="p-2 rounded-lg bg-card/60 border border-white/5 font-mono text-[10px] text-white/60">
                      {item.fields}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════
            TAB 3: AI COPILOTS
            ═══════════════════════════════════════════════════════════════ */}
        {activeTab === "AI" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="p-6 rounded-2xl bg-card border border-white/10 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-text flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-400" />
                  Groq-Powered AI Copilot Suite
                </h2>
                <span className="text-xs px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 font-bold">
                  Model: openai/gpt-oss-20b
                </span>
              </div>
              <p className="text-xs text-subtext leading-relaxed">
                Glarus Academy embeds AI assistants directly into authoring and learning workflows with a strict <strong>non-destructive preview guarantee</strong> (generated content is never automatically overwritten without explicit confirmation).
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                <div className="p-4 rounded-xl bg-background/80 border border-white/5 space-y-2">
                  <span className="text-xs font-bold text-purple-300">✨ AI Course Overview Copilot</span>
                  <p className="text-[11px] text-subtext leading-relaxed">
                    Generates comprehensive multi-paragraph overviews, target audience descriptions, measurable learning objectives, and prerequisites.
                  </p>
                  <span className="inline-block text-[10px] font-mono text-purple-400/80 bg-purple-500/10 px-2 py-0.5 rounded">
                    POST /api/ai/live-course/overview-assist
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-background/80 border border-white/5 space-y-2">
                  <span className="text-xs font-bold text-indigo-300">✨ 5-Step Live Course Architect</span>
                  <p className="text-[11px] text-subtext leading-relaxed">
                    Builds complete 5 to 10 session cohorts with minute-by-minute agendas, breakout activities, duration calculations, and homework deliverables.
                  </p>
                  <span className="inline-block text-[10px] font-mono text-indigo-400/80 bg-indigo-500/10 px-2 py-0.5 rounded">
                    POST /api/ai/live-course/generate
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-background/80 border border-white/5 space-y-2">
                  <span className="text-xs font-bold text-emerald-300">✨ Session Builder Assistant</span>
                  <p className="text-[11px] text-subtext leading-relaxed">
                    Assists instructors and admins in refining individual live workshops, breakout challenges, and real-time pair-programming exercises.
                  </p>
                  <span className="inline-block text-[10px] font-mono text-emerald-400/80 bg-emerald-500/10 px-2 py-0.5 rounded">
                    POST /api/ai/live-course/session-assist
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════
            TAB 4: RBAC MATRIX
            ═══════════════════════════════════════════════════════════════ */}
        {activeTab === "RBAC" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="p-6 rounded-2xl bg-card border border-white/10 space-y-4">
              <h2 className="text-base font-bold text-text flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                Role-Based Access Control (RBAC) Permissions Matrix
              </h2>
              <p className="text-xs text-subtext leading-relaxed">
                The platform enforces role-based security at both the Next.js middleware and route handler levels.
              </p>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-white/10 text-subtext">
                      <th className="pb-3 font-bold">Platform Capability</th>
                      <th className="pb-3 font-bold text-purple-300">Super Admin</th>
                      <th className="pb-3 font-bold text-indigo-300">Instructor</th>
                      <th className="pb-3 font-bold text-emerald-300">Student</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-subtext">
                    <tr>
                      <td className="py-2.5 font-medium text-text">Create & Publish Live Bootcamps</td>
                      <td className="py-2.5 text-emerald-400 font-bold">Full Access</td>
                      <td className="py-2.5 text-rose-400">Restricted</td>
                      <td className="py-2.5 text-rose-400">Restricted</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 font-medium text-text">Edit Session Timelines & Agendas</td>
                      <td className="py-2.5 text-emerald-400 font-bold">Full Access</td>
                      <td className="py-2.5 text-amber-400 font-semibold">If canEditAgenda = true</td>
                      <td className="py-2.5 text-rose-400">Restricted</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 font-medium text-text">Reschedule Live Sessions</td>
                      <td className="py-2.5 text-emerald-400 font-bold">Full Access</td>
                      <td className="py-2.5 text-amber-400 font-semibold">If canReschedule = true</td>
                      <td className="py-2.5 text-rose-400">Restricted</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 font-medium text-text">In-Browser Python Learning Engine</td>
                      <td className="py-2.5 text-emerald-400 font-bold">Full Access</td>
                      <td className="py-2.5 text-emerald-400 font-bold">Full Access</td>
                      <td className="py-2.5 text-emerald-400 font-bold">Full Access</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 font-medium text-text">Stream Past Recorded Sessions</td>
                      <td className="py-2.5 text-emerald-400 font-bold">Full Access</td>
                      <td className="py-2.5 text-emerald-400 font-bold">Assigned Cohorts</td>
                      <td className="py-2.5 text-emerald-400 font-bold">Enrolled Cohorts</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 font-medium text-text">System Audit Trails & Settings</td>
                      <td className="py-2.5 text-emerald-400 font-bold">Full Access</td>
                      <td className="py-2.5 text-rose-400">Restricted</td>
                      <td className="py-2.5 text-rose-400">Restricted</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════
            TAB 5: APIS
            ═══════════════════════════════════════════════════════════════ */}
        {activeTab === "APIS" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="p-6 rounded-2xl bg-card border border-white/10 space-y-4">
              <h2 className="text-base font-bold text-text flex items-center gap-2">
                <Server className="w-5 h-5 text-sky-400" />
                Complete API Endpoints Catalog
              </h2>

              <div className="space-y-3 pt-2">
                {[
                  { method: "POST", path: "/api/auth/login", desc: "Authenticate credentials and issue JWT cookie" },
                  { method: "GET", path: "/api/admin/live-training/courses", desc: "List all live courses and session counts" },
                  { method: "POST", path: "/api/admin/live-training/courses", desc: "Create new live course with scheduled sessions and instructor assignments" },
                  { method: "POST", path: "/api/admin/live-training/sessions/[id]/reschedule", desc: "Reschedule live session date/time and write to audit log" },
                  { method: "GET", path: "/api/admin/live-training/assignments", desc: "List instructor assignments with 10 RBAC permission flags" },
                  { method: "PUT", path: "/api/admin/live-training/assignments", desc: "Reassign instructor and update granular permissions" },
                  { method: "POST", path: "/api/ai/live-course/overview-assist", desc: "Groq AI generation for course overview, audience, and objectives" },
                  { method: "POST", path: "/api/ai/live-course/generate", desc: "5-step live course curriculum and session generator" },
                  { method: "GET", path: "/api/instructor/live-sessions", desc: "Instructor session feed with permission enforcement" },
                  { method: "GET", path: "/api/student/live-courses", desc: "Student enrolled live cohorts and upcoming session links" }
                ].map((api, idx) => (
                  <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-xl bg-background/80 border border-white/5">
                    <div className="flex items-center gap-2.5">
                      <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded font-mono ${
                        api.method === "GET" ? "bg-sky-500/20 text-sky-300 border border-sky-500/30" :
                        api.method === "POST" ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30" :
                        "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                      }`}>
                        {api.method}
                      </span>
                      <span className="font-mono text-xs text-text">{api.path}</span>
                    </div>
                    <span className="text-xs text-subtext">{api.desc}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════
            TAB 6: QUICK SETUP
            ═══════════════════════════════════════════════════════════════ */}
        {activeTab === "SETUP" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="p-6 rounded-2xl bg-card border border-white/10 space-y-4">
              <h2 className="text-base font-bold text-text flex items-center gap-2">
                <Terminal className="w-5 h-5 text-purple-400" />
                Local Setup & Execution Guide
              </h2>

              <div className="space-y-4">
                <div className="space-y-2">
                  <span className="text-xs font-bold text-text">1. Environment Variables (`frontend/.env`)</span>
                  <div className="relative p-4 rounded-xl bg-black/60 border border-white/10 font-mono text-xs text-purple-300">
                    <button
                      onClick={() => copyToClipboard(`DATABASE_URL="file:./dev.db"\nJWT_SECRET="glarus-academy-super-secret-key-for-jwt-2024"\nGROQ_API_KEY="your-groq-key"\nNEXT_PUBLIC_APP_URL="http://localhost:3000"`, "env")}
                      className="absolute right-3 top-3 p-1.5 rounded bg-white/10 text-white hover:bg-white/20 text-[10px] flex items-center gap-1"
                    >
                      {copiedText === "env" ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedText === "env" ? "Copied" : "Copy"}</span>
                    </button>
                    <pre className="overflow-x-auto">
{`DATABASE_URL="file:./dev.db"
JWT_SECRET="glarus-academy-super-secret-key-for-jwt-2024"
GROQ_API_KEY="gsk_..."
NEXT_PUBLIC_APP_URL="http://localhost:3000"`}
                    </pre>
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-xs font-bold text-text">2. Run Migrations & Start Server</span>
                  <div className="relative p-4 rounded-xl bg-black/60 border border-white/10 font-mono text-xs text-emerald-300">
                    <button
                      onClick={() => copyToClipboard(`cd frontend\nnpx prisma db push\nnpx tsx prisma/seed.ts\nnpm run dev`, "commands")}
                      className="absolute right-3 top-3 p-1.5 rounded bg-white/10 text-white hover:bg-white/20 text-[10px] flex items-center gap-1"
                    >
                      {copiedText === "commands" ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedText === "commands" ? "Copied" : "Copy"}</span>
                    </button>
                    <pre className="overflow-x-auto">
{`cd frontend
npx prisma db push
npx tsx prisma/seed.ts
npm run dev`}
                    </pre>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-background/80 border border-white/5 space-y-2">
                  <span className="text-xs font-bold text-text">3. Seed Credentials</span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div className="p-3 rounded-lg bg-card/60 border border-white/5">
                      <span className="font-bold text-purple-300 block">Super Admin</span>
                      <span className="text-subtext text-[11px] block">admin@gmail.com</span>
                      <span className="text-subtext text-[11px] block font-mono">Piyush@11</span>
                    </div>
                    <div className="p-3 rounded-lg bg-card/60 border border-white/5">
                      <span className="font-bold text-indigo-300 block">Instructor</span>
                      <span className="text-subtext text-[11px] block">instructor@glarus.com</span>
                      <span className="text-subtext text-[11px] block font-mono">password123</span>
                    </div>
                    <div className="p-3 rounded-lg bg-card/60 border border-white/5">
                      <span className="font-bold text-emerald-300 block">Student</span>
                      <span className="text-subtext text-[11px] block">student@glarus.com</span>
                      <span className="text-subtext text-[11px] block font-mono">password123</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
