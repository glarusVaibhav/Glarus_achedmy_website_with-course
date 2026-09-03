"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { CourseCard } from "@/components/CourseCard";
import { CATEGORIES } from "@/lib/data";
import Image from "next/image";
import { 
  Video, 
  Radio, 
  Calendar, 
  ArrowRight, 
  CheckCircle2, 
  Filter, 
  Clock, 
  Users, 
  Bookmark, 
  Star 
} from "lucide-react";
import Link from "next/link";

const LIVE_CATEGORIES = ["All", "AI Engineering", "LLMOps", "Agentic AI", "Cloud", "Career Bootcamp"];

const ENRICHED_LIVE_COURSES = [
  {
    id: "live-agentic-ai",
    title: "Building Autonomous Agents with LangGraph",
    description: "Build production-ready AI agents using LangGraph, memory, tools, and multi-agent workflows.",
    category: "Agentic AI",
    classType: "Live Class",
    level: "Intermediate",
    timeframeDays: 30,
    tags: ["Live Class", "Limited Seats", "5 Projects"],
    image: "/images/courses/generative-ai.png",
    linkUrl: "/student/live-courses/live-agentic-ai",
    statusBadge: "Next Batch Starting Soon",
    schedule: {
      dateFormatted: "Tue, 20 Aug 2026",
      daysPattern: "Mon • Wed • Fri",
      time: "08:00 PM – 10:30 PM IST",
      duration: "2.5 Hours"
    },
    seats: {
      enrolled: 32,
      total: 50
    }
  },
  {
    id: "live-llmops",
    title: "LLMOps Pipeline: From Training to Production",
    description: "Master MLOps for LLMs: data pipelines, evaluation, deployment, monitoring and scaling.",
    category: "LLMOps",
    classType: "Live Class",
    level: "Advanced",
    timeframeDays: 60,
    tags: ["Live Class", "Includes Projects", "Live Mentorship"],
    image: "/images/courses/llm-architecture.png",
    linkUrl: "/student/live-courses/live-llmops",
    statusBadge: "Filling Fast",
    schedule: {
      dateFormatted: "Mon, 01 Sep 2026",
      daysPattern: "Mon • Wed • Fri",
      time: "07:30 PM – 09:30 PM IST",
      duration: "2 Hours"
    },
    seats: {
      enrolled: 28,
      total: 50
    }
  },
  {
    id: "live-cloud-ai",
    title: "Scalable Cloud Architecture for AI Applications",
    description: "Design and deploy scalable, secure and cost-optimized AI applications on AWS & Kubernetes.",
    category: "Cloud",
    classType: "Workshop",
    level: "Intermediate",
    timeframeDays: 60,
    tags: ["Live Class", "Hands-on Labs", "Cloud Infra"],
    image: "/images/courses/rag-vector-db.png",
    linkUrl: "/student/live-courses/live-cloud-ai",
    statusBadge: "Seats Open",
    schedule: {
      dateFormatted: "Wed, 10 Sep 2026",
      daysPattern: "Tue-Thu Evenings",
      time: "08:00 PM – 10:00 PM IST",
      duration: "2 Hours"
    },
    seats: {
      enrolled: 45,
      total: 60
    }
  }
];

function CoursesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialType = searchParams.get("type") === "live" ? "live" : "self-paced";
  const [activeTab, setActiveTab] = useState<"self-paced" | "live">(initialType);
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Category filters
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [liveCategory, setLiveCategory] = useState("All");

  // Live sidebar filters
  const [selectedTimeframe, setSelectedTimeframe] = useState<number | null>(null);
  const [selectedClassType, setSelectedClassType] = useState<string | null>(null);
  const [savedBooked, setSavedBooked] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const typeParam = searchParams.get("type");
    if (typeParam === "live" || typeParam === "self-paced") {
      setActiveTab(typeParam);
    }
  }, [searchParams]);

  useEffect(() => {
    fetch("/api/courses")
      .then(res => res.json())
      .then(data => {
        if (data.courses) {
          const mappedCourses = data.courses.map((c: any) => {
            const titleLower = (c.title || "").toLowerCase();
            let image = c.image;
            if (!image || image === "/placeholder-course.jpg") {
              if (titleLower.includes("python fundamentals") || titleLower.includes("python")) {
                image = "/images/courses/python-fundamentals.png";
              } else if (titleLower.includes("machine learning") || titleLower.includes("ml")) {
                image = "/images/courses/ml-math.png";
              } else if (titleLower.includes("ai engineering") || titleLower.includes("advanced ai") || titleLower.includes("llm")) {
                image = "/images/courses/llm-architecture.png";
              } else if (titleLower.includes("rag") || titleLower.includes("vector")) {
                image = "/images/courses/rag-vector-db.png";
              } else if (titleLower.includes("generative")) {
                image = "/images/courses/generative-ai.png";
              } else {
                image = "/images/courses/smart-contracts.png";
              }
            }
            return {
              ...c,
              instructor: c.instructor?.name || "Expert Instructor",
              level: c.level || "Intermediate",
              rating: c.rating || 4.8,
              duration: c.duration || "12 Weeks",
              image
            };
          });
          setCourses(mappedCourses);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const [liveCoursesList, setLiveCoursesList] = useState<any[]>(ENRICHED_LIVE_COURSES);

  useEffect(() => {
    fetch("/api/live-courses")
      .then((res) => res.json())
      .then((data) => {
        if (data?.courses && Array.isArray(data.courses) && data.courses.length > 0) {
          const dbLive = data.courses.map((c: any) => {
            const nextSession = c.sessions?.[0];
            const dateStr = nextSession?.date
              ? new Date(nextSession.date).toLocaleDateString("en-US", {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                  year: "numeric"
                })
              : "Upcoming Cohort";

            const timeStr = nextSession?.startTime
              ? `${nextSession.startTime} – ${nextSession.endTime || "09:00 PM"} IST`
              : "07:00 PM – 09:00 PM IST";

            return {
              id: c.id,
              title: c.title,
              category: c.category || "Generative AI",
              description:
                c.shortDescription ||
                c.description ||
                "Live hands-on training with industry mentors and practical capstone projects.",
              image: c.thumbnail || "/images/courses/generative-ai.png",
              level: c.level || "Intermediate",
              statusBadge: "Next Batch Starting Soon",
              linkUrl: `/student/live-courses/${c.id}`,
              tags: ["Live Cohort", `${c.totalSessions || 6} Sessions`, "Mentor-Led"],
              classType: "Live Class",
              timeframeDays: 30,
              schedule: {
                dateFormatted: dateStr,
                time: timeStr,
                duration: c.duration || "2 Hours",
                daysPattern: "Live Interactive Track"
              },
              seats: {
                enrolled: c.enrolledCount || 0,
                total: c.maxStudents || 50
              }
            };
          });

          const dbIds = new Set(dbLive.map((c: any) => c.id));
          const remainingStatic = ENRICHED_LIVE_COURSES.filter((c) => !dbIds.has(c.id));
          setLiveCoursesList([...dbLive, ...remainingStatic]);
        }
      })
      .catch((err) => {
        console.error("Failed to load live courses for /courses page:", err);
      });
  }, []);

  const filteredSelfPaced = selectedCategory === "all"
    ? courses
    : courses.filter(c => c.category?.toLowerCase() === selectedCategory.toLowerCase());

  const filteredLive = liveCoursesList.filter((course) => {
    if (liveCategory !== "All" && course.category !== liveCategory) return false;
    if (selectedTimeframe !== null && course.timeframeDays > selectedTimeframe) return false;
    if (selectedClassType !== null && course.classType !== selectedClassType) return false;
    return true;
  });

  const toggleBookmark = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setSavedBooked((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="w-full py-16 min-h-screen bg-background text-text">
      <div className="max-w-[1650px] mx-auto px-6 sm:px-10">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-6">
          <div className="max-w-2xl">
            <span className="px-3.5 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-black uppercase tracking-widest inline-block mb-3">
              Explore Catalog
            </span>
            <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-4">
              {activeTab === "self-paced" ? (
                <>Self-Paced <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-400">Course Directory</span></>
              ) : (
                <>Live Training <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-emerald-400">Class Batches</span></>
              )}
            </h1>
            <p className="text-lg text-slate-300 font-medium">
              {activeTab === "self-paced" 
                ? "HD video curriculums, 24/7 AI tutor assistance, and browser code sandboxes you can access anytime."
                : "Join expert-led live sessions, interact in real-time, and build in-demand skills."
              }
            </p>
          </div>

          {/* Directory Filter Dropdown for Self-Paced */}
          {activeTab === "self-paced" && (
            <div className="flex items-center gap-2">
              <select 
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-[#0c0922] border border-purple-500/30 text-white text-sm rounded-xl focus:ring-purple-500 block w-full p-3 outline-none font-bold"
              >
                <option value="all">All Categories</option>
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Directory Type Mode Switcher */}
        <div className="flex items-center gap-3 p-1.5 rounded-2xl bg-[#0c0922]/90 border border-purple-500/20 max-w-md mb-8">
          <button
            onClick={() => setActiveTab("self-paced")}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-5 rounded-xl text-sm font-bold transition-all ${
              activeTab === "self-paced"
                ? "bg-purple-600 text-white shadow-lg shadow-purple-600/30"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Video className="w-4 h-4" />
            <span>Self-Paced Courses</span>
          </button>

          <button
            onClick={() => setActiveTab("live")}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-5 rounded-xl text-sm font-bold transition-all ${
              activeTab === "live"
                ? "bg-purple-600 text-white shadow-lg shadow-purple-600/30"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Radio className="w-4 h-4" />
            <span>Live Classes</span>
          </button>
        </div>

        {/* MODE 1: SELF-PACED DIRECTORY */}
        {activeTab === "self-paced" && (
          loading ? (
            <div className="flex justify-center py-20">
              <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : filteredSelfPaced.length === 0 ? (
            <div className="text-center py-20 bg-[#0c0922]/80 border border-purple-500/20 rounded-3xl text-slate-300">
              No self-paced courses found in this category.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredSelfPaced.map(course => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          )
        )}

        {/* MODE 2: FULL RICH LIVE CLASSES DIRECTORY (IMAGE 2 LAYOUT) */}
        {activeTab === "live" && (
          <div className="space-y-6">
            {/* Live Category Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
              {LIVE_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setLiveCategory(cat)}
                  className={`px-5 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                    liveCategory === cat
                      ? "bg-purple-600 text-white shadow-md shadow-purple-600/20"
                      : "bg-[#0c0922]/80 text-slate-300 border border-purple-500/20 hover:border-purple-500/40"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Sub-Header Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-4 border-b border-purple-500/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400 shadow-md">
                  <Radio className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-white flex items-center gap-2">
                    Live Classes
                  </h3>
                  <p className="text-xs font-semibold text-slate-400 mt-0.5">
                    Join expert-led live sessions, interact in real-time, and build in-demand skills.
                  </p>
                </div>
              </div>

              {/* Status Pill Toggle */}
              <div className="flex items-center gap-1.5 p-1 bg-[#0c0922]/90 rounded-full border border-purple-500/20">
                <button className="px-4 py-1.5 rounded-full text-xs font-bold bg-purple-600 text-white shadow-md shadow-purple-600/20">
                  Upcoming
                </button>
                <button className="px-4 py-1.5 rounded-full text-xs font-bold text-slate-400 hover:text-white transition-colors">
                  Past Classes
                </button>
              </div>
            </div>

            {/* Main 2-Column Grid (Left Filters + Right Cards) */}
            <div className="flex flex-col lg:flex-row gap-8 items-start">
              {/* LEFT FILTER SIDEBAR */}
              <div className="w-full lg:w-64 bg-[#0c0922]/90 backdrop-blur-xl border border-purple-500/20 rounded-3xl p-5 shadow-xl shrink-0">
                <div className="flex items-center justify-between pb-3 mb-4 border-b border-purple-500/20">
                  <span className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                    <Filter className="w-3.5 h-3.5 text-purple-400" /> Filters
                  </span>
                  {(selectedTimeframe !== null || selectedClassType !== null) && (
                    <button
                      onClick={() => {
                        setSelectedTimeframe(null);
                        setSelectedClassType(null);
                      }}
                      className="text-[11px] font-bold text-purple-400 hover:underline"
                    >
                      Clear All
                    </button>
                  )}
                </div>

                {/* Timeframe Filter */}
                <div className="mb-6">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5">Timeframe</h4>
                  <div className="space-y-2">
                    {[
                      { label: "Next 7 Days", days: 7, count: 2 },
                      { label: "Next 30 Days", days: 30, count: 4 },
                      { label: "Next 60 Days", days: 60, count: 6 }
                    ].map((tf) => (
                      <label
                        key={tf.days}
                        className="flex items-center justify-between text-xs font-semibold text-slate-300 cursor-pointer hover:text-purple-400 transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={selectedTimeframe === tf.days}
                            onChange={() => setSelectedTimeframe(selectedTimeframe === tf.days ? null : tf.days)}
                            className="w-4 h-4 rounded border-purple-500/30 bg-[#0B0F19] text-purple-600 focus:ring-purple-500 accent-purple-600"
                          />
                          <span>{tf.label}</span>
                        </div>
                        <span className="text-[10px] font-bold text-slate-400 bg-[#0B0F19] px-2 py-0.5 rounded-full border border-purple-500/20">
                          {tf.count}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Class Type Filter */}
                <div className="mb-6">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5">Class Type</h4>
                  <div className="space-y-2">
                    {[
                      { label: "Live Class", type: "Live Class", count: 3 },
                      { label: "Full Bootcamp", type: "Full Bootcamp", count: 1 },
                      { label: "Workshop", type: "Workshop", count: 2 }
                    ].map((ct) => (
                      <label
                        key={ct.type}
                        className="flex items-center justify-between text-xs font-semibold text-slate-300 cursor-pointer hover:text-purple-400 transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={selectedClassType === ct.type}
                            onChange={() => setSelectedClassType(selectedClassType === ct.type ? null : ct.type)}
                            className="w-4 h-4 rounded border-purple-500/30 bg-[#0B0F19] text-purple-600 focus:ring-purple-500 accent-purple-600"
                          />
                          <span>{ct.label}</span>
                        </div>
                        <span className="text-[10px] font-bold text-slate-400 bg-[#0B0F19] px-2 py-0.5 rounded-full border border-purple-500/20">
                          {ct.count}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Request Batch CTA */}
                <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-950/40 via-[#0c0922] to-[#0B0F19] border border-purple-500/30 text-center">
                  <h5 className="text-xs font-bold text-white mb-1">Can&apos;t find the right batch?</h5>
                  <p className="text-[11px] text-slate-400 mb-3">Request a batch for your preferred timezone or schedule.</p>
                  <button
                    onClick={() => router.push("/signup")}
                    className="w-full py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold text-xs shadow-md shadow-purple-600/20 transition-all"
                  >
                    Request Batch
                  </button>
                </div>
              </div>

              {/* RIGHT MAIN CLASS CARDS */}
              <div className="flex-1 w-full space-y-5">
                {filteredLive.length === 0 ? (
                  <div className="w-full py-16 px-8 rounded-3xl border border-purple-500/20 bg-[#0c0922]/80 backdrop-blur-md flex flex-col items-center justify-center text-center">
                    <Calendar className="w-10 h-10 text-purple-400 mb-3" />
                    <h4 className="text-xl font-black text-white mb-1">No matching live batches</h4>
                    <p className="text-xs text-slate-400">Try clearing your active filters to see all available classes.</p>
                  </div>
                ) : (
                  filteredLive.map((item) => {
                    const percent = Math.round((item.seats.enrolled / item.seats.total) * 100);
                    const isBooked = savedBooked[item.id];

                    return (
                      <div
                        key={item.id}
                        onClick={() => router.push(item.linkUrl)}
                        className="bg-[#0c0922]/90 backdrop-blur-xl border border-purple-500/20 hover:border-purple-500/50 rounded-3xl p-5 md:p-6 shadow-xl transition-all group relative cursor-pointer overflow-hidden flex flex-col md:flex-row gap-6 items-stretch"
                      >
                        {/* Left: Thumbnail Image */}
                        <div className="w-full md:w-64 h-48 md:h-auto rounded-2xl overflow-hidden relative shrink-0 border border-purple-500/20 bg-[#0B0F19] min-h-[160px]">
                          <Image
                            src={item.image}
                            alt={item.title}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                        </div>

                        {/* Middle: Course Info & Tags */}
                        <div className="flex-1 flex flex-col justify-between">
                          <div>
                            <div className="flex items-center justify-between gap-2 mb-2">
                              <span className="text-xs font-black text-purple-400 uppercase tracking-widest">
                                {item.category}
                              </span>
                            </div>

                            <h3 className="text-xl md:text-2xl font-black text-white mb-2 group-hover:text-purple-300 transition-colors leading-snug">
                              {item.title}
                            </h3>

                            <p className="text-xs md:text-sm font-medium text-slate-300/80 leading-relaxed line-clamp-2 mb-4">
                              {item.description}
                            </p>
                          </div>

                          {/* Metadata Chips */}
                          <div className="flex flex-wrap items-center gap-2 mt-auto">
                            <span className="px-3 py-1 rounded-md bg-purple-500/10 text-purple-300 border border-purple-500/20 text-xs font-bold">
                              Level: {item.level}
                            </span>
                            {item.tags.map((tag, tIdx) => (
                              <span
                                key={tIdx}
                                className={`px-3 py-1 rounded-md text-xs font-bold border ${
                                  tIdx % 2 === 0
                                    ? "bg-indigo-500/10 text-indigo-300 border-indigo-500/20"
                                    : "bg-emerald-500/10 text-emerald-300 border-emerald-500/20"
                                }`}
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Right: Schedule, Seats & CTA */}
                        <div className="w-full md:w-64 border-t md:border-t-0 md:border-l border-purple-500/20 pt-4 md:pt-0 md:pl-6 flex flex-col justify-between shrink-0">
                          <div className="space-y-2 mb-4">
                            <div className="flex items-start gap-2.5 text-xs font-bold text-white">
                              <Calendar className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                              <div>
                                <div>{item.schedule.dateFormatted}</div>
                                <div className="text-slate-400 text-[11px] font-normal mt-0.5">{item.schedule.daysPattern}</div>
                              </div>
                            </div>

                            <div className="flex items-center gap-2.5 text-xs font-semibold text-slate-300">
                              <Clock className="w-4 h-4 text-purple-400 shrink-0" />
                              <span>{item.schedule.time}</span>
                            </div>

                            <div className="text-[11px] text-slate-400 pl-6">
                              Duration: {item.schedule.duration}
                            </div>
                          </div>

                          {/* Enrolled Seats Progress */}
                          <div className="space-y-1.5 mb-5">
                            <div className="flex items-center justify-between text-xs font-bold">
                              <span className="flex items-center gap-1 text-slate-300">
                                <Users className="w-3.5 h-3.5 text-purple-400" />
                                {item.seats.enrolled} / {item.seats.total} Enrolled
                              </span>
                              <span className="text-purple-400 font-black">{percent}%</span>
                            </div>
                            <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full transition-all duration-500"
                                style={{ width: `${percent}%` }}
                              />
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex items-center gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                router.push("/signup");
                              }}
                              className="flex-1 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl font-bold text-xs shadow-lg shadow-purple-600/20 transition-all flex items-center justify-center gap-1.5"
                            >
                              Reserve Seat <ArrowRight className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={(e) => toggleBookmark(e, item.id)}
                              className={`p-2.5 rounded-xl border transition-all ${
                                isBooked
                                  ? "bg-purple-600 text-white border-purple-500"
                                  : "bg-white/5 border-white/10 text-slate-400 hover:text-white"
                              }`}
                            >
                              <Bookmark className="w-4 h-4 fill-current" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default function CoursesPage() {
  return (
    <Suspense fallback={
      <div className="w-full py-20 min-h-screen bg-[#0B0F19] text-white flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <CoursesContent />
    </Suspense>
  );
}
