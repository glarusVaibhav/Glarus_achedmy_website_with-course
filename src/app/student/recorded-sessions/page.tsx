"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Video,
  Play,
  PlaySquare,
  Search,
  Filter,
  Clock,
  CheckCircle2,
  ListChecks,
  Users,
  Calendar,
  Sparkles,
  ArrowRight,
  RotateCcw,
  SlidersHorizontal,
  ChevronDown,
  X,
  BookOpen,
  Eye,
  FileText,
  Flame,
  Tv,
  AlertTriangle,
  Lock,
  Info,
  ShieldAlert,
  CalendarDays,
  Timer
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { RecordingItem } from "@/app/api/student/recordings/route";
import { calculateRecordingAvailability, RecordingAvailability } from "@/lib/recordingAvailability";
import { StudentPortalLayout } from "@/components/student/StudentPortalLayout";

type FilterTab = "ALL" | "UNWATCHED" | "WATCHED" | "EXPIRING_SOON" | "EXPIRED";
type SortOption = "RECENT" | "EXPIRING_SOONEST" | "MOST_WATCHED" | "DURATION" | "TITLE";

export default function RecordedSessionsPage() {
  const router = useRouter();

  // State
  const [recordings, setRecordings] = useState<RecordingItem[]>([]);
  const [stats, setStats] = useState({
    totalRecordings: 14,
    unwatchedCount: 3,
    inProgressCount: 4,
    watchedCount: 7,
    expiringSoonCount: 2,
    expiredCount: 2,
    totalWatchTime: "21h 48m",
  });
  const [availableFilters, setAvailableFilters] = useState<{
    courses: string[];
    instructors: string[];
    modules: string[];
  }>({
    courses: [],
    instructors: [],
    modules: [],
  });

  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<FilterTab>("ALL");
  const [selectedCourse, setSelectedCourse] = useState<string>("ALL");
  const [selectedInstructor, setSelectedInstructor] = useState<string>("ALL");
  const [selectedModule, setSelectedModule] = useState<string>("ALL");
  const [sortBy, setSortBy] = useState<SortOption>("RECENT");
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);

  // Agenda Modal State
  const [previewAgendaRecording, setPreviewAgendaRecording] = useState<RecordingItem | null>(null);

  // Fetch recordings
  const fetchRecordings = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchQuery) params.set("search", searchQuery);
      if (selectedCourse !== "ALL") params.set("courseId", selectedCourse);
      if (selectedInstructor !== "ALL") params.set("instructor", selectedInstructor);
      if (selectedModule !== "ALL") params.set("module", selectedModule);
      if (activeTab === "UNWATCHED") params.set("watchStatus", "UNWATCHED");
      if (activeTab === "WATCHED") params.set("watchStatus", "WATCHED");
      if (activeTab === "EXPIRING_SOON") params.set("watchStatus", "EXPIRING_SOON");
      if (activeTab === "EXPIRED") params.set("watchStatus", "EXPIRED");
      params.set("sortBy", sortBy);

      const res = await fetch(`/api/student/recordings?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setRecordings(data.recordings || []);
        if (data.stats) setStats(data.stats);
        if (data.filters) setAvailableFilters(data.filters);
      }
    } catch (err) {
      console.error("Failed to load recordings:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecordings();
  }, [searchQuery, activeTab, selectedCourse, selectedInstructor, selectedModule, sortBy]);

  // Active filter count
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (selectedCourse !== "ALL") count++;
    if (selectedInstructor !== "ALL") count++;
    if (selectedModule !== "ALL") count++;
    return count;
  }, [selectedCourse, selectedInstructor, selectedModule]);

  const handleResetFilters = () => {
    setSearchQuery("");
    setActiveTab("ALL");
    setSelectedCourse("ALL");
    setSelectedInstructor("ALL");
    setSelectedModule("ALL");
    setSortBy("RECENT");
  };

  return (
    <StudentPortalLayout>
      <div className="w-full min-h-screen py-8 px-4 sm:px-8 max-w-[1600px] mx-auto space-y-7 text-slate-100">

        {/* ───────── 1. Sophisticated Page Header ───────── */}
        <section className="space-y-5">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
            {/* Left: Icon, Title, Subtitle */}
            <div className="flex items-start sm:items-center gap-4">
              <div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-violet-500 text-white flex items-center justify-center shadow-lg shadow-purple-900/30 shrink-0 border border-purple-400/30">
                <PlaySquare className="w-6 h-6 drop-shadow-md" />
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2">
                    <span>Recorded</span>
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-indigo-300 to-purple-200">
                      Sessions
                    </span>
                  </h1>

                  <span className="px-3 py-0.5 rounded-full bg-purple-500/15 text-purple-300 border border-purple-500/30 text-xs font-bold flex items-center gap-1.5 shadow-xs">
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
                    {stats.totalRecordings} Total Recorded Classes
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl leading-relaxed">
                  Rewatch completed live classes, revise masterclass agendas, and continue learning before the 30-day access window expires.
                </p>
              </div>
            </div>

            {/* Right: Search, Filter Popover, and Sort */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Search Bar */}
              <div className="relative min-w-[240px] sm:min-w-[280px]">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search recordings, topics, instructors..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9.5 pr-8 py-2 bg-[#0e1424]/80 border border-white/[0.08] rounded-xl text-xs sm:text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-500/60 focus:ring-2 focus:ring-purple-500/20 transition-all"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Filter Popover Toggle */}
              <div className="relative">
                <button
                  onClick={() => setIsFilterDropdownOpen(!isFilterDropdownOpen)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-2 cursor-pointer ${
                    activeFilterCount > 0
                      ? "bg-purple-500/20 border-purple-500/50 text-purple-300 shadow-sm"
                      : "bg-[#0e1424]/80 border-white/[0.08] text-slate-400 hover:text-white hover:bg-white/[0.05]"
                  }`}
                >
                  <Filter className="w-3.5 h-3.5" />
                  <span>Filters</span>
                  {activeFilterCount > 0 && (
                    <span className="w-4 h-4 rounded-full bg-purple-500 text-white text-[10px] flex items-center justify-center font-bold">
                      {activeFilterCount}
                    </span>
                  )}
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isFilterDropdownOpen ? "rotate-180" : ""}`} />
                </button>

                {/* Filter Popover Menu */}
                <AnimatePresence>
                  {isFilterDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.96 }}
                      className="absolute right-0 top-full mt-2 w-72 sm:w-80 bg-[#0c111e] border border-white/[0.12] rounded-2xl p-4 shadow-2xl z-40 space-y-3.5 backdrop-blur-xl"
                    >
                      <div className="flex items-center justify-between border-b border-white/[0.06] pb-2.5">
                        <span className="text-xs font-extrabold uppercase tracking-wider text-white flex items-center gap-1.5">
                          <SlidersHorizontal className="w-3.5 h-3.5 text-purple-400" /> Filter Recordings
                        </span>
                        {activeFilterCount > 0 && (
                          <button
                            onClick={handleResetFilters}
                            className="text-[11px] text-purple-400 hover:underline font-semibold cursor-pointer"
                          >
                            Reset All
                          </button>
                        )}
                      </div>

                      {/* Course Filter */}
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-slate-400 uppercase">Course</label>
                        <select
                          value={selectedCourse}
                          onChange={(e) => setSelectedCourse(e.target.value)}
                          className="w-full p-2 bg-[#080d18] border border-white/[0.08] rounded-xl text-xs text-white focus:outline-none focus:border-purple-500/50 cursor-pointer"
                        >
                          <option value="ALL">All Enrolled Courses</option>
                          {availableFilters.courses.map((c) => (
                            <option key={c} value={c}>
                              {c}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Instructor Filter */}
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-slate-400 uppercase">Instructor</label>
                        <select
                          value={selectedInstructor}
                          onChange={(e) => setSelectedInstructor(e.target.value)}
                          className="w-full p-2 bg-[#080d18] border border-white/[0.08] rounded-xl text-xs text-white focus:outline-none focus:border-purple-500/50 cursor-pointer"
                        >
                          <option value="ALL">All Instructors</option>
                          {availableFilters.instructors.map((ins) => (
                            <option key={ins} value={ins}>
                              {ins}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Module Filter */}
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-slate-400 uppercase">Curriculum Module</label>
                        <select
                          value={selectedModule}
                          onChange={(e) => setSelectedModule(e.target.value)}
                          className="w-full p-2 bg-[#080d18] border border-white/[0.08] rounded-xl text-xs text-white focus:outline-none focus:border-purple-500/50 cursor-pointer"
                        >
                          <option value="ALL">All Modules</option>
                          {availableFilters.modules.map((m) => (
                            <option key={m} value={m}>
                              {m}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="pt-2 border-t border-white/[0.06] flex justify-end">
                        <button
                          onClick={() => setIsFilterDropdownOpen(false)}
                          className="w-full py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
                        >
                          Apply Filters
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Sort By Dropdown */}
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="px-3 py-2 bg-[#0e1424]/80 border border-white/[0.08] rounded-xl text-xs font-semibold text-white focus:outline-none focus:border-purple-500/50 cursor-pointer appearance-none pr-8"
                >
                  <option value="RECENT" className="bg-[#0c111e]">Recently Completed</option>
                  <option value="EXPIRING_SOONEST" className="bg-[#0c111e]">⚡ Expiration: Soonest First</option>
                  <option value="MOST_WATCHED" className="bg-[#0c111e]">Most Watched</option>
                  <option value="DURATION" className="bg-[#0c111e]">Longest Duration</option>
                  <option value="TITLE" className="bg-[#0c111e]">Title (A - Z)</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* ───────── 2. Compact Statistics Cards ───────── */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 max-w-4xl">
            <div className="p-3.5 rounded-2xl bg-[#0c111e]/90 border border-white/[0.07] flex items-center justify-between shadow-sm">
              <div className="space-y-0.5">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Total Library
                </span>
                <div className="text-xl font-black text-white font-mono">{stats.totalRecordings}</div>
              </div>
              <div className="p-2 rounded-xl bg-purple-500/15 text-purple-400 border border-purple-500/25">
                <Tv className="w-4 h-4" />
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#0c111e]/90 border border-white/[0.07] flex items-center justify-between shadow-sm">
              <div className="space-y-0.5">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Expiring Soon
                </span>
                <div className="text-xl font-black text-amber-400 font-mono flex items-center gap-1.5">
                  {stats.expiringSoonCount > 0 && <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />}
                  {stats.expiringSoonCount}
                </div>
              </div>
              <div className="p-2 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/25">
                <AlertTriangle className="w-4 h-4" />
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#0c111e]/90 border border-white/[0.07] flex items-center justify-between shadow-sm">
              <div className="space-y-0.5">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Watched
                </span>
                <div className="text-xl font-black text-emerald-400 font-mono">{stats.watchedCount}</div>
              </div>
              <div className="p-2 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/25">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#0c111e]/90 border border-white/[0.07] flex items-center justify-between shadow-sm">
              <div className="space-y-0.5">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Watch Time
                </span>
                <div className="text-xl font-black text-purple-300 font-mono">{stats.totalWatchTime}</div>
              </div>
              <div className="p-2 rounded-xl bg-indigo-500/15 text-indigo-400 border border-indigo-500/25">
                <Clock className="w-4 h-4" />
              </div>
            </div>
          </div>
        </section>

        {/* ───────── 3. Filter Tabs (Pills) ───────── */}
        <section className="flex flex-wrap items-center justify-between gap-4 border-b border-white/[0.07] pb-4">
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-1">
            {[
              { id: "ALL" as FilterTab, label: "All Sessions", count: stats.totalRecordings },
              { id: "EXPIRING_SOON" as FilterTab, label: "Expiring Soon", count: stats.expiringSoonCount, highlight: "amber" },
              { id: "UNWATCHED" as FilterTab, label: "Unwatched", count: stats.unwatchedCount },
              { id: "WATCHED" as FilterTab, label: "Watched", count: stats.watchedCount },
              { id: "EXPIRED" as FilterTab, label: "Expired", count: stats.expiredCount, highlight: "rose" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
                  activeTab === tab.id
                    ? tab.highlight === "amber"
                      ? "bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/25 border border-amber-400"
                      : tab.highlight === "rose"
                      ? "bg-rose-600 text-white font-black shadow-md shadow-rose-600/25 border border-rose-400"
                      : "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-900/30 border border-purple-400/30"
                    : "bg-[#0e1424]/80 border border-white/[0.08] text-slate-400 hover:text-white hover:bg-white/[0.05]"
                }`}
              >
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${
                      activeTab === tab.id
                        ? tab.highlight === "amber"
                          ? "bg-black/20 text-slate-950"
                          : "bg-white/25 text-white"
                        : "bg-black/40 text-slate-400"
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Quick Active Filter Badges */}
          {(selectedCourse !== "ALL" || selectedInstructor !== "ALL" || selectedModule !== "ALL" || searchQuery) && (
            <div className="flex items-center gap-2 flex-wrap text-xs">
              <span className="text-slate-400 font-semibold text-[11px]">Filtered by:</span>
              {selectedCourse !== "ALL" && (
                <span className="px-2.5 py-1 rounded-lg bg-purple-500/15 text-purple-300 border border-purple-500/25 font-medium flex items-center gap-1.5 text-[11px]">
                  Course: {selectedCourse}
                  <button onClick={() => setSelectedCourse("ALL")} className="hover:text-white cursor-pointer">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {selectedInstructor !== "ALL" && (
                <span className="px-2.5 py-1 rounded-lg bg-purple-500/15 text-purple-300 border border-purple-500/25 font-medium flex items-center gap-1.5 text-[11px]">
                  Instructor: {selectedInstructor}
                  <button onClick={() => setSelectedInstructor("ALL")} className="hover:text-white cursor-pointer">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {searchQuery && (
                <span className="px-2.5 py-1 rounded-lg bg-purple-500/15 text-purple-300 border border-purple-500/25 font-medium flex items-center gap-1.5 text-[11px]">
                  Search: "{searchQuery}"
                  <button onClick={() => setSearchQuery("")} className="hover:text-white cursor-pointer">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              <button
                onClick={handleResetFilters}
                className="text-[11px] font-bold text-purple-400 hover:underline cursor-pointer ml-1"
              >
                Clear all
              </button>
            </div>
          )}
        </section>

        {/* ───────── 4. GLOBAL 30-DAY RECORDING AVAILABILITY NOTICE BANNER ───────── */}
        <section className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-purple-950/30 via-[#0e1424] to-indigo-950/20 border border-purple-500/30 shadow-lg relative overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3.5 relative z-10">
            <div className="p-2.5 rounded-xl bg-purple-500/15 text-purple-300 border border-purple-500/30 shrink-0">
              <CalendarDays className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="text-xs sm:text-sm font-black text-white">
                  Recording Availability Policy
                </h4>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-300 border border-purple-500/30 uppercase tracking-wider">
                  30-Day Window
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5 leading-relaxed max-w-3xl">
                All recorded live sessions remain available for exactly <strong>30 days after the original live class date</strong>. After this period, recording access is automatically retired.
              </p>
            </div>
          </div>

          <div className="shrink-0 flex items-center gap-3 self-end sm:self-center border-t sm:border-t-0 sm:border-l border-white/[0.08] pt-2 sm:pt-0 sm:pl-4 text-right">
            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Access Window</div>
              <div className="text-xs font-black text-purple-300">AVAILABLE FOR 30 DAYS</div>
              <div className="text-[10px] text-slate-500">after live class</div>
            </div>
          </div>
        </section>

        {/* ───────── 5. Recording Cards Grid ───────── */}
        <section>
          {loading ? (
            <div className="py-24 flex flex-col items-center justify-center text-center space-y-3">
              <div className="w-10 h-10 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin" />
              <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">
                Loading recording catalog...
              </p>
            </div>
          ) : recordings.length === 0 ? (
            <div className="py-20 px-6 border border-dashed border-white/[0.08] rounded-3xl bg-[#0c111e]/50 flex flex-col items-center justify-center text-center space-y-4 max-w-xl mx-auto">
              <div className="w-16 h-16 rounded-2xl bg-purple-500/10 border border-purple-500/25 flex items-center justify-center text-purple-400 shadow-inner">
                <PlaySquare className="w-8 h-8 opacity-80" />
              </div>

              <div className="space-y-1">
                <h3 className="text-lg font-bold text-white">No recorded sessions found</h3>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                  {searchQuery || activeFilterCount > 0 || activeTab !== "ALL"
                    ? "No recordings matched your active filters or tab selection. Try clearing filters to view all sessions."
                    : "Once your completed live classes are uploaded, you'll find their full recordings, agendas, and study resources here."}
                </p>
              </div>

              {(searchQuery || activeFilterCount > 0 || activeTab !== "ALL") && (
                <button
                  onClick={handleResetFilters}
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition-all shadow-md shadow-purple-900/30 cursor-pointer"
                >
                  Reset All Filters
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recordings.map((recording, idx) => {
                const status = recording.watchProgress.status;
                const percent = recording.watchProgress.percent;
                const isCompleted = status === "WATCHED" || percent === 100;
                const inProgress = status === "IN_PROGRESS";
                
                // Calculate dynamic 30-day availability
                const availability = calculateRecordingAvailability(recording.completedAt);
                const { isExpired, isExpiringSoon, warningLevel } = availability;

                return (
                  <motion.div
                    key={recording.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25, delay: idx * 0.03 }}
                    className={`bg-[#0c111e]/90 hover:bg-[#0f1526] border rounded-2xl overflow-hidden shadow-xl transition-all duration-300 flex flex-col justify-between group relative ${
                      isExpired
                        ? "border-white/[0.06] opacity-80"
                        : isExpiringSoon
                        ? "border-amber-500/40 hover:border-amber-500/70 shadow-amber-500/5"
                        : "border-white/[0.08] hover:border-purple-500/40 hover:shadow-purple-900/10"
                    }`}
                  >
                    {/* Top Thumbnail Section */}
                    <div className="relative h-48 sm:h-52 w-full overflow-hidden bg-black/60">
                      {/* Image Thumbnail */}
                      <img
                        src={recording.thumbnail}
                        alt={recording.sessionTitle}
                        className={`w-full h-full object-cover transition-all duration-500 ${
                          isExpired
                            ? "grayscale contrast-75 brightness-75"
                            : "group-hover:scale-105 group-hover:brightness-110"
                        }`}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "/images/courses/generative-ai.png";
                        }}
                      />

                      {/* Scrim Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0c111e] via-[#0c111e]/40 to-transparent" />

                      {/* Top Badges */}
                      <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10">
                        {/* Status Badges */}
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {isExpired ? (
                            <span className="px-2.5 py-0.5 rounded-full bg-rose-950/90 backdrop-blur-md text-rose-300 text-[10px] font-extrabold tracking-wider uppercase border border-rose-500/40 shadow-sm flex items-center gap-1">
                              <Lock className="w-3 h-3" />
                              EXPIRED
                            </span>
                          ) : (
                            <span className="px-2.5 py-0.5 rounded-full bg-purple-600/90 backdrop-blur-md text-white text-[10px] font-extrabold tracking-wider uppercase border border-purple-400/40 shadow-sm flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-purple-300" />
                              RECORDED
                            </span>
                          )}

                          {!isExpired && isCompleted && (
                            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/90 backdrop-blur-md text-white text-[10px] font-extrabold tracking-wider uppercase border border-emerald-300/40 shadow-sm flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" />
                              WATCHED
                            </span>
                          )}

                          {!isExpired && inProgress && (
                            <span className="px-2.5 py-0.5 rounded-full bg-amber-500/90 backdrop-blur-md text-slate-950 text-[10px] font-black tracking-wider uppercase border border-amber-300/40 shadow-sm">
                              {percent}% IN PROGRESS
                            </span>
                          )}
                        </div>

                        {/* Session Code Pill */}
                        <span className="px-2.5 py-0.5 rounded-full bg-black/75 backdrop-blur-md text-purple-200 text-[10px] font-bold border border-purple-500/30">
                          {recording.sessionNumber}
                        </span>
                      </div>

                      {/* Center Play / Lock Button */}
                      {!isExpired ? (
                        <Link
                          href={`/student/recorded-sessions/${recording.id}`}
                          className="absolute inset-0 z-20 flex items-center justify-center cursor-pointer"
                          title="Watch Recording"
                        >
                          <div className="w-13 h-13 rounded-full bg-black/50 backdrop-blur-md border border-white/30 text-white flex items-center justify-center shadow-2xl group-hover:scale-115 group-hover:bg-purple-600 group-hover:border-purple-300 transition-all duration-300">
                            <Play className="w-6 h-6 fill-white ml-0.5" />
                          </div>
                        </Link>
                      ) : (
                        <div
                          className="absolute inset-0 z-20 flex items-center justify-center cursor-not-allowed"
                          title="Recording expired (30-day access period ended)"
                        >
                          <div className="px-3.5 py-1.5 rounded-2xl bg-black/80 backdrop-blur-md border border-white/15 text-slate-400 flex items-center gap-2 text-xs font-bold shadow-2xl">
                            <Lock className="w-4 h-4 text-rose-400" />
                            <span>Access Expired</span>
                          </div>
                        </div>
                      )}

                      {/* Bottom Duration Badge */}
                      <div className="absolute bottom-3 right-3 z-10 flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-black/80 backdrop-blur-md text-white text-[11px] font-bold border border-white/15">
                        <Clock className="w-3 h-3 text-purple-300" />
                        <span>{recording.duration}</span>
                      </div>

                      {/* Watched Progress Bar */}
                      <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-black/60 z-20">
                        <div
                          className={`h-full transition-all duration-700 ${
                            isExpired
                              ? "bg-slate-600"
                              : isCompleted
                              ? "bg-emerald-400"
                              : inProgress
                              ? "bg-gradient-to-r from-purple-500 to-indigo-400"
                              : "bg-transparent"
                          }`}
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>

                    {/* Card Body Details */}
                    <div className="p-5 flex flex-col flex-1 justify-between gap-4">
                      <div className="space-y-2">
                        {/* Course Name */}
                        <div className="text-[11px] font-extrabold text-purple-400 uppercase tracking-wider line-clamp-1">
                          {recording.courseName}
                        </div>

                        {/* Session Title */}
                        <h3 className="font-extrabold text-base text-white leading-snug line-clamp-2 group-hover:text-purple-300 transition-colors">
                          {!isExpired ? (
                            <Link href={`/student/recorded-sessions/${recording.id}`}>
                              {recording.sessionTitle}
                            </Link>
                          ) : (
                            <span>{recording.sessionTitle}</span>
                          )}
                        </h3>

                        {/* Metadata: Instructor, Original Live Class Date */}
                        <div className="text-xs text-slate-400 flex flex-wrap items-center gap-x-3 gap-y-1 pt-1">
                          <span className="flex items-center gap-1.5">
                            <Users className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                            <span>Instructor: <strong className="text-slate-200 font-semibold">{recording.instructor}</strong></span>
                          </span>
                          <span className="text-white/20">•</span>
                          <span className="flex items-center gap-1 text-slate-400 font-medium">
                            <Calendar className="w-3.5 h-3.5 text-orange-400 shrink-0" />
                            <span>Class: {availability.formattedClassDate}</span>
                          </span>
                        </div>

                        {/* Topics Chips */}
                        <div className="flex flex-wrap items-center gap-1.5 pt-1.5">
                          {recording.topics.slice(0, 3).map((topic, tIdx) => (
                            <span
                              key={tIdx}
                              className="px-2 py-0.5 rounded-md bg-white/[0.04] border border-white/[0.06] text-slate-400 text-[10px] font-semibold"
                            >
                              #{topic}
                            </span>
                          ))}
                          {recording.topics.length > 3 && (
                            <span className="text-[10px] font-bold text-slate-500">
                              +{recording.topics.length - 3} more
                            </span>
                          )}
                        </div>

                        {/* Progress Resumption Note (if active) */}
                        {!isExpired && inProgress && recording.watchProgress.lastWatchedFormatted && (
                          <div className="pt-1.5 text-[11px] font-bold text-purple-300 flex items-center gap-1.5">
                            <RotateCcw className="w-3 h-3 text-purple-400" />
                            <span>Resume from {recording.watchProgress.lastWatchedFormatted} ({percent}% watched)</span>
                          </div>
                        )}
                      </div>

                      {/* ───────── 6. AVAILABILITY & EXPIRATION ROW (Directly Above Actions) ───────── */}
                      <div className="space-y-3">
                        <div
                          className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 text-xs transition-colors ${
                            isExpired
                              ? "bg-rose-950/20 border-rose-500/30 text-rose-300"
                              : warningLevel === "urgent"
                              ? "bg-amber-500/15 border-amber-500/40 text-amber-300 animate-pulse font-semibold"
                              : warningLevel === "amber"
                              ? "bg-amber-500/10 border-amber-500/30 text-amber-300 font-medium"
                              : "bg-white/[0.03] border-white/[0.07] text-slate-300"
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            {isExpired ? (
                              <Lock className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                            ) : isExpiringSoon ? (
                              <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                            ) : (
                              <CalendarDays className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                            )}
                            <div className="truncate">
                              <span className="font-bold block truncate">
                                {isExpired
                                  ? `Recording expired on ${availability.formattedExpiresAt}`
                                  : isExpiringSoon
                                  ? availability.statusMessage
                                  : `Available until ${availability.formattedExpiresAt}`}
                              </span>
                              <span className="text-[10px] text-slate-400 block">
                                {isExpired
                                  ? "30-day post-class window passed"
                                  : `${availability.daysRemaining} days remaining · 30 days from class`}
                              </span>
                            </div>
                          </div>

                          <span
                            className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase shrink-0 ${
                              isExpired
                                ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                                : isExpiringSoon
                                ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                                : "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                            }`}
                          >
                            {availability.badgeLabel}
                          </span>
                        </div>

                        {/* Card Actions Footer */}
                        <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between gap-2.5">
                          {/* Primary CTA Button */}
                          {!isExpired ? (
                            <Link
                              href={`/student/recorded-sessions/${recording.id}`}
                              className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-extrabold text-xs flex items-center justify-center gap-2 transition-all active:scale-95 shadow-md shadow-purple-900/30 cursor-pointer"
                            >
                              <Play className="w-3.5 h-3.5 fill-white" />
                              <span>{inProgress ? "Resume Recording" : isCompleted ? "Rewatch Session" : "Watch Recording"}</span>
                            </Link>
                          ) : (
                            <button
                              disabled
                              className="flex-1 py-2.5 px-4 rounded-xl bg-white/[0.03] border border-white/[0.08] text-slate-500 font-bold text-xs flex items-center justify-center gap-2 cursor-not-allowed"
                              title="Recording is expired and no longer playable."
                            >
                              <Lock className="w-3.5 h-3.5 text-slate-500" />
                              <span>Recording Expired</span>
                            </button>
                          )}

                          {/* Secondary Action: Class Agenda Preview */}
                          <button
                            onClick={() => setPreviewAgendaRecording(recording)}
                            className="py-2.5 px-3.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] hover:border-purple-500/40 text-slate-300 hover:text-white font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer shrink-0"
                            title="View step-by-step class agenda & topics"
                          >
                            <ListChecks className="w-3.5 h-3.5 text-purple-400" />
                            <span className="hidden sm:inline">Agenda</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </section>

      </div>

      {/* ───────── 7. Class Agenda Modal (With Expiration Details) ───────── */}
      <AnimatePresence>
        {previewAgendaRecording && (() => {
          const avail = calculateRecordingAvailability(previewAgendaRecording.completedAt);
          return (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
              onClick={() => setPreviewAgendaRecording(null)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-[#0e1322] border border-white/[0.12] w-full max-w-2xl rounded-3xl p-6 sm:p-7 shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Ambient Background Glow */}
                <div className="absolute -right-10 -top-10 w-48 h-48 bg-purple-500/15 rounded-full blur-3xl pointer-events-none" />

                {/* Modal Header */}
                <div className="flex items-start justify-between gap-4 pb-4 border-b border-white/[0.08] relative z-10">
                  <div className="space-y-1.5 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full bg-purple-500/15 text-purple-300 border border-purple-500/30 text-[11px] font-extrabold uppercase">
                        🎥 {previewAgendaRecording.sessionNumber}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full bg-white/[0.04] text-slate-300 text-[11px] font-medium border border-white/[0.08]">
                        ⏱️ {previewAgendaRecording.duration}
                      </span>

                      {/* Expiration Pill in Modal */}
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[11px] font-extrabold flex items-center gap-1 ${
                          avail.isExpired
                            ? "bg-rose-500/15 text-rose-400 border border-rose-500/30"
                            : avail.isExpiringSoon
                            ? "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                            : "bg-purple-500/15 text-purple-300 border border-purple-500/30"
                        }`}
                      >
                        {avail.isExpired ? <Lock className="w-3 h-3" /> : <Timer className="w-3 h-3" />}
                        {avail.statusMessage}
                      </span>
                    </div>

                    <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-snug">
                      {previewAgendaRecording.sessionTitle}
                    </h3>
                    <p className="text-xs text-slate-400">
                      Course: <strong className="text-purple-300 font-semibold">{previewAgendaRecording.courseName}</strong> • Instructor: {previewAgendaRecording.instructor} • Live Class Date: {avail.formattedClassDate}
                    </p>
                  </div>

                  <button
                    onClick={() => setPreviewAgendaRecording(null)}
                    className="p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-400 hover:text-white transition-colors shrink-0 cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Modal Body: Agenda Steps */}
                <div className="overflow-y-auto py-5 space-y-4 flex-1 pr-1 scrollbar-thin">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                      <ListChecks className="w-4 h-4 text-purple-400" />
                      <span>Recorded Class Agenda & Timestamp Roadmap</span>
                    </h4>
                    <span className="text-[11px] font-semibold text-purple-400">
                      {previewAgendaRecording.agenda.length} Segments
                    </span>
                  </div>

                  <div className="space-y-2 bg-black/30 border border-white/[0.06] rounded-2xl p-3.5 sm:p-4">
                    {previewAgendaRecording.agenda.map((item, index) => (
                      <div
                        key={item.id}
                        className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.02] hover:bg-purple-950/20 hover:border-purple-500/40 border border-white/[0.05] transition-all group"
                      >
                        <span className="w-7 h-7 rounded-lg bg-purple-500/10 text-purple-300 border border-purple-500/20 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                          {index + 1}
                        </span>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs sm:text-sm font-semibold text-slate-200 group-hover:text-purple-300 transition-colors">
                              {item.title}
                            </span>
                            <span className="text-[11px] font-bold text-purple-400 shrink-0 font-mono bg-purple-500/10 px-2 py-0.5 rounded-md border border-purple-500/20">
                              {item.timestampFormatted}
                            </span>
                          </div>
                          {item.description && (
                            <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{item.description}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Key Takeaways */}
                  {previewAgendaRecording.takeaways && previewAgendaRecording.takeaways.length > 0 && (
                    <div className="space-y-2 pt-2">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-amber-400" />
                        <span>Key Concepts & Code Built</span>
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {previewAgendaRecording.takeaways.map((takeaway, idx) => (
                          <div key={idx} className="flex items-start gap-2 p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.06] text-xs text-slate-300">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                            <span>{takeaway}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Modal Footer */}
                <div className="pt-4 border-t border-white/[0.08] flex items-center justify-between gap-3 relative z-10">
                  <button
                    onClick={() => setPreviewAgendaRecording(null)}
                    className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 hover:text-white transition-colors cursor-pointer"
                  >
                    Close
                  </button>

                  {!avail.isExpired ? (
                    <Link
                      href={`/student/recorded-sessions/${previewAgendaRecording.id}`}
                      className="px-6 py-2.5 rounded-xl text-xs font-extrabold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-lg shadow-purple-900/30 flex items-center gap-2 transition-all active:scale-95 cursor-pointer"
                    >
                      <Play className="w-3.5 h-3.5 fill-white" />
                      <span>Watch Full Session Video</span>
                    </Link>
                  ) : (
                    <div className="px-4 py-2 rounded-xl bg-rose-950/30 border border-rose-500/30 text-rose-400 text-xs font-bold flex items-center gap-2">
                      <Lock className="w-3.5 h-3.5" />
                      <span>Recording Expired (30-Day Window Closed)</span>
                    </div>
                  )}
                </div>
              </motion.div>
            </div>
          );
        })()}
      </AnimatePresence>
    </StudentPortalLayout>
  );
}
