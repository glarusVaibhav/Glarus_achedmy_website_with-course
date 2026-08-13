"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import Image from "next/image";
import { 
  ArrowRight, 
  Star, 
  Clock, 
  Brain, 
  Calendar, 
  Video, 
  GraduationCap, 
  Users, 
  Sparkles, 
  Bookmark, 
  Filter, 
  Check, 
  MessageSquare, 
  Code2, 
  Tv, 
  Radio, 
  Award,
  ChevronRight,
  ShoppingBag,
  Eye
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/store/cartStore";
import { Course as CartCourse } from "@/components/CourseCard";

export interface Course {
  id: string;
  title: string;
  category: string;
  difficulty: string;
  duration: string;
  gradient: string;
  linkUrl: string;
  image?: string;
  mode: "self-paced" | "live";
  price?: number;
  originalPrice?: number;
  schedule?: string;
  startDate?: string;
  mentor?: string;
  badge?: string;
  cta?: string;
}

export interface LiveCourseDetail {
  id: string;
  title: string;
  category: string;
  description: string;
  image: string;
  level: string;
  statusBadge: string;
  badgeType: "UPCOMING";
  linkUrl: string;
  tags: string[];
  instructor: {
    name: string;
    role: string;
    company: string;
    rating: number;
    reviews: string;
    avatar: string;
  };
  schedule: {
    dateFormatted: string;
    timeFormatted: string;
    duration: string;
    daysPattern: string;
  };
  seats: {
    enrolled: number;
    total: number;
  };
  ctaText: string;
  classType: "Live Class" | "Full Bootcamp" | "Workshop";
  timeframeDays: number;
}

const SELF_PACED_COURSES: Course[] = [
  { id: "1", title: "Advanced LLM Architecture", category: "AI Engineering", difficulty: "Advanced", duration: "18h VOD", gradient: "from-purple-600/20 to-blue-600/20", linkUrl: "/course/ai-1", image: "/images/courses/llm-architecture.png", mode: "self-paced", price: 15999, originalPrice: 24999 },
  { id: "2", title: "Generative AI Application Engineering", category: "Web Development", difficulty: "Intermediate", duration: "24h VOD", gradient: "from-sky-500/20 to-indigo-500/20", linkUrl: "/course/Generative_AI_Application_Engineer", image: "/images/courses/generative-ai.png", mode: "self-paced", price: 15999, originalPrice: 24999 },
  { id: "3", title: "RAG & Vector Databases", category: "Data Science", difficulty: "Advanced", duration: "12h VOD", gradient: "from-emerald-500/20 to-teal-500/20", linkUrl: "/course/ai-3", image: "/images/courses/rag-vector-db.png", mode: "self-paced", price: 19999, originalPrice: 29999 },
  { id: "4", title: "Machine Learning Math Foundations", category: "AI Engineering", difficulty: "Beginner", duration: "32h VOD", gradient: "from-orange-500/20 to-rose-500/20", linkUrl: "/course/ai-2", image: "/images/courses/ml-math.png", mode: "self-paced", price: 8999, originalPrice: 14999 },
  { id: "5", title: "Smart Contract Security Testing", category: "Web3", difficulty: "Expert", duration: "15h VOD", gradient: "from-violet-500/20 to-fuchsia-500/20", linkUrl: "/course/ai-4", image: "/images/courses/smart-contracts.png", mode: "self-paced", price: 12999, originalPrice: 19999 }
];

const ENRICHED_LIVE_COURSES: LiveCourseDetail[] = [
  {
    id: "live-1",
    title: "Building Autonomous Agents with LangGraph",
    category: "Agentic AI",
    description: "Build production-ready AI agents using LangGraph, memory, tools and multi-agent workflows.",
    image: "/images/courses/generative-ai.png",
    level: "Level: Intermediate",
    statusBadge: "UPCOMING",
    badgeType: "UPCOMING",
    linkUrl: "/course/Generative_AI_Application_Engineer",
    tags: ["Live Class", "Limited Seats", "5 Projects"],
    classType: "Live Class",
    timeframeDays: 30,
    instructor: {
      name: "Alex Chen",
      role: "FAANG Staff Engineer",
      company: "Google DeepMind",
      rating: 4.9,
      reviews: "1.2k+ reviews",
      avatar: "/images/courses/generative-ai.png"
    },
    schedule: {
      dateFormatted: "Tue, 20 Aug 2026",
      timeFormatted: "08:00 PM – 10:30 PM IST",
      duration: "2.5 Hours",
      daysPattern: "Mon • Wed • Fri"
    },
    seats: {
      enrolled: 32,
      total: 50
    },
    ctaText: "Reserve Seat →"
  },
  {
    id: "live-2",
    title: "LLMOps Pipeline: From Training to Production",
    category: "LLMOps",
    description: "Master MLOps for LLMs: data pipelines, evaluation, deployment, monitoring and scaling.",
    image: "/images/courses/llm-architecture.png",
    level: "Level: Advanced",
    statusBadge: "UPCOMING",
    badgeType: "UPCOMING",
    linkUrl: "/courses",
    tags: ["Live Class", "Includes Projects", "Live Mentorship"],
    classType: "Live Class",
    timeframeDays: 30,
    instructor: {
      name: "Elena Rostova",
      role: "ML Engineer at Meta",
      company: "Meta AI",
      rating: 4.8,
      reviews: "965 reviews",
      avatar: "/images/courses/llm-architecture.png"
    },
    schedule: {
      dateFormatted: "Mon, 01 Sep 2026",
      timeFormatted: "07:30 PM – 09:30 PM IST",
      duration: "2 Hours",
      daysPattern: "Mon • Wed • Fri"
    },
    seats: {
      enrolled: 28,
      total: 50
    },
    ctaText: "Reserve Seat →"
  },
  {
    id: "live-3",
    title: "Scalable Cloud Architecture for AI Applications",
    category: "Cloud",
    description: "Design and deploy scalable, secure and cost-optimized AI applications on AWS & Kubernetes.",
    image: "/images/courses/rag-vector-db.png",
    level: "Level: Intermediate",
    statusBadge: "UPCOMING",
    badgeType: "UPCOMING",
    linkUrl: "/courses",
    tags: ["Live Class", "Hands-on Labs", "Cloud Infra"],
    classType: "Workshop",
    timeframeDays: 60,
    instructor: {
      name: "Arjun Mehta",
      role: "Ex-AWS Principal Architect",
      company: "Ex-AWS Principal",
      rating: 4.9,
      reviews: "1.5k+ reviews",
      avatar: "/images/courses/rag-vector-db.png"
    },
    schedule: {
      dateFormatted: "Wed, 10 Sep 2026",
      timeFormatted: "08:00 PM – 10:00 PM IST",
      duration: "2 Hours",
      daysPattern: "Tue-Thu Evenings"
    },
    seats: {
      enrolled: 45,
      total: 60
    },
    ctaText: "Reserve Seat →"
  },
  {
    id: "live-4",
    title: "AI Engineering Master Career Bootcamp - Q4 2026",
    category: "Career Bootcamp",
    description: "16-week intensive program with live classes, projects, mock interviews and career mentorship.",
    image: "/images/courses/ml-math.png",
    level: "Level: All Levels",
    statusBadge: "UPCOMING",
    badgeType: "UPCOMING",
    linkUrl: "/courses",
    tags: ["Full Bootcamp", "Career Support", "Mock Interviews"],
    classType: "Full Bootcamp",
    timeframeDays: 60,
    instructor: {
      name: "Priya Sharma",
      role: "Senior ML Engineer",
      company: "Anthropic",
      rating: 4.8,
      reviews: "743 reviews",
      avatar: "/images/courses/ml-math.png"
    },
    schedule: {
      dateFormatted: "Sat, 28 Sep 2026",
      timeFormatted: "11:00 AM – 01:00 PM IST",
      duration: "2 Hours",
      daysPattern: "Full-Time Intensive"
    },
    seats: {
      enrolled: 18,
      total: 30
    },
    ctaText: "View Details →"
  }
];

const SELF_PACED_CATEGORIES = ["All", "AI Engineering", "Web Development", "Data Science", "Web3"];
const LIVE_CATEGORIES = ["All", "AI Engineering", "LLMOps", "Agentic AI", "Cloud", "Career Bootcamp"];

export default function InteractiveCourses() {
  const containerRef = useRef<HTMLDivElement>(null);
  const carouselRef = useRef<HTMLDivElement>(null);
  const [dragWidth, setDragWidth] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const router = useRouter();
  const { addItem } = useCartStore();

  const handleBuyNow = (e: React.MouseEvent, course: Course) => {
    e.preventDefault();
    e.stopPropagation();
    const cartCourse: CartCourse = {
      id: course.id,
      title: course.title,
      description: course.title,
      instructor: "Glarus Academy",
      price: course.price || 15999,
      level: course.difficulty,
      rating: 4.9,
      duration: course.duration,
      image: course.image || "/images/courses/generative-ai.png"
    };
    addItem(cartCourse);
    router.push("/checkout");
  };

  // Mode state: "self-paced" | "live"
  const [activeMode, setActiveMode] = useState<"self-paced" | "live">("self-paced");

  // Category filters
  const [selfPacedCategory, setSelfPacedCategory] = useState("All");
  const [liveCategory, setLiveCategory] = useState("All");

  // Live sidebar filters
  const [selectedTimeframe, setSelectedTimeframe] = useState<number | null>(null); // null = all, 7, 30, 60
  const [selectedClassType, setSelectedClassType] = useState<string | null>(null);
  const [selectedInstructor, setSelectedInstructor] = useState<string | null>(null);
  const [savedBooked, setSavedBooked] = useState<Record<string, boolean>>({});

  const currentCategory = activeMode === "self-paced" ? selfPacedCategory : liveCategory;
  const currentCategoryList = activeMode === "self-paced" ? SELF_PACED_CATEGORIES : LIVE_CATEGORIES;

  // Filter live courses dynamically
  const filteredLive = ENRICHED_LIVE_COURSES.filter((course) => {
    if (liveCategory !== "All" && course.category !== liveCategory) return false;
    if (selectedTimeframe !== null && course.timeframeDays > selectedTimeframe) return false;
    if (selectedClassType !== null && course.classType !== selectedClassType) return false;
    if (selectedInstructor !== null && course.instructor.name !== selectedInstructor) return false;
    return true;
  });

  const filteredSelfPaced = selfPacedCategory === "All"
    ? SELF_PACED_COURSES
    : SELF_PACED_COURSES.filter(c => c.category === selfPacedCategory);

  const handleCategoryChange = (cat: string) => {
    if (activeMode === "self-paced") {
      setSelfPacedCategory(cat);
    } else {
      setLiveCategory(cat);
    }
  };

  const toggleBookmark = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setSavedBooked((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Recalculate drag constraints for self-paced carousel
  useEffect(() => {
    const updateDragWidth = () => {
      if (carouselRef.current && containerRef.current) {
        const scrollWidth = carouselRef.current.scrollWidth;
        const containerWidth = containerRef.current.offsetWidth;
        const paddingLeft = parseFloat(window.getComputedStyle(containerRef.current).paddingLeft) || 24;
        const visibleWidth = containerWidth - paddingLeft;
        const maxDrag = Math.max(0, scrollWidth - visibleWidth + 48);
        setDragWidth(maxDrag);
      }
    };

    updateDragWidth();
    window.addEventListener("resize", updateDragWidth);
    return () => window.removeEventListener("resize", updateDragWidth);
  }, [filteredSelfPaced, activeMode, currentCategory]);

  const handleCardClick = (e: React.MouseEvent, linkUrl: string) => {
    if (isDragging) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    router.push(linkUrl);
  };

  return (
    <section className="w-full py-8 md:py-12 bg-background overflow-hidden relative z-10 selection:bg-purple-500/30 text-text">
      <div className="max-w-[1650px] mx-auto px-6 sm:px-10 mb-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="flex flex-col md:flex-row md:items-end justify-between gap-8"
        >
          <div className="max-w-4xl">
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-text tracking-tight mb-4 whitespace-nowrap">
              Masterclass <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">Curriculums</span>
            </h2>
            <p className="text-xl text-subtext font-medium leading-relaxed">
              Join expert-led live classes or learn at your own pace. Guaranteed to elevate your engineering status.
            </p>
          </div>

          <Link
            href={activeMode === "self-paced" ? "/courses?type=self-paced" : "/courses?type=live"}
            className="flex items-center gap-2 text-purple-400 font-bold hover:text-purple-300 transition-colors w-fit border border-purple-500/30 px-6 py-3 rounded-full hover:bg-purple-500/10 shadow-sm"
          >
            {activeMode === "self-paced" ? "View All Self-Paced Courses" : "View All Live Classes"}{" "}
            <ArrowRight className="w-5 h-5" />
          </Link>
        </motion.div>

        {/* Segmented Control Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-1.5 rounded-2xl md:rounded-full bg-card/80 border border-card/60 backdrop-blur-md"
        >
          <div className="flex items-center gap-1.5 w-full sm:w-auto">
            <button
              onClick={() => setActiveMode("self-paced")}
              className={`relative flex-1 sm:flex-initial flex items-center justify-center gap-2.5 px-6 py-3 rounded-xl md:rounded-full text-sm font-bold transition-all select-none ${
                activeMode === "self-paced"
                  ? "bg-text text-background shadow-lg shadow-text/20 scale-[1.02]"
                  : "text-subtext hover:text-text hover:bg-card/60"
              }`}
            >
              <Video className="w-4 h-4" />
              <span>Self-Paced Courses</span>
              <span className={`ml-1 px-2 py-0.5 text-xs rounded-full font-black ${
                activeMode === "self-paced"
                  ? "bg-background/20 text-background"
                  : "bg-card border border-card/60 text-subtext"
              }`}>
                {SELF_PACED_COURSES.length}
              </span>
            </button>

            <button
              onClick={() => setActiveMode("live")}
              className={`relative flex-1 sm:flex-initial flex items-center justify-center gap-2.5 px-6 py-3 rounded-xl md:rounded-full text-sm font-bold transition-all select-none ${
                activeMode === "live"
                  ? "bg-gradient-to-r from-primary to-accent text-white shadow-lg shadow-primary/25 scale-[1.02]"
                  : "text-subtext hover:text-text hover:bg-card/60"
              }`}
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <GraduationCap className="w-4 h-4" />
              <span>Live Training</span>
              <span className={`ml-1 px-2 py-0.5 text-xs rounded-full font-black ${
                activeMode === "live"
                  ? "bg-white/20 text-white"
                  : "bg-card border border-card/60 text-subtext"
              }`}>
                {ENRICHED_LIVE_COURSES.length}
              </span>
            </button>
          </div>
        </motion.div>

        {/* Dynamic Category Filters */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-5 flex flex-wrap gap-2.5 sm:gap-3"
        >
          {currentCategoryList.map(tab => (
            <button
              key={tab}
              onClick={() => handleCategoryChange(tab)}
              className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all select-none ${
                currentCategory === tab
                  ? "bg-text text-background shadow-lg shadow-text/20 scale-105"
                  : "bg-card border border-card/40 text-subtext hover:text-text hover:bg-card/80"
              }`}
            >
              {tab}
            </button>
          ))}
        </motion.div>
      </div>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* MODE 1: SELF-PACED COURSES + LIVE TRAINING PROMO CARD          */}
      {/* ───────────────────────────────────────────────────────────── */}
      {activeMode === "self-paced" && (
        <div className="max-w-[1650px] mx-auto px-6 sm:px-10 pb-4">
          <div className="flex flex-col xl:flex-row gap-8 items-start">
            {/* LEFT COLUMN: Self-Paced Courses Grid */}
            <div className="flex-1 min-w-0 w-full">
              <AnimatePresence mode="wait">
                <motion.div
                  key={`self-paced-${currentCategory}`}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.25, ease: "easeInOut" }}
                  className="grid grid-cols-1 sm:grid-cols-2 2xl:grid-cols-3 gap-6"
                >
                  {filteredSelfPaced.map((course, idx) => (
                    <motion.div
                      key={course.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.4, delay: idx * 0.05 }}
                      whileHover={{ y: -6 }}
                      onClick={(e) => handleCardClick(e, course.linkUrl)}
                      className="w-full bg-card rounded-3xl border border-card/60 overflow-hidden shadow-xl flex flex-col group relative select-none cursor-pointer hover:border-purple-500/40 transition-all duration-300"
                    >
                      <div
                        draggable={false}
                        className="h-48 sm:h-52 w-full relative overflow-hidden flex items-center justify-center border-b border-card/60 select-none bg-background"
                      >
                        {course.image ? (
                          <Image
                            src={course.image}
                            alt={course.title}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          />
                        ) : (
                          <div className={`w-full h-full bg-gradient-to-br ${course.gradient} flex items-center justify-center p-6`}>
                            <Brain className="w-16 h-16 text-text/20 group-hover:scale-110 group-hover:text-text/50 transition-all duration-500 pointer-events-none" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />
                        <div className="absolute top-4 left-4 flex gap-2 pointer-events-none z-10">
                          <span className="px-3 py-1 bg-background/70 backdrop-blur-md rounded-full text-[10px] font-black text-text uppercase tracking-widest border border-white/10 shadow-lg">
                            {course.difficulty}
                          </span>
                        </div>
                      </div>

                      <div className="p-6 md:p-7 flex flex-col flex-1 relative bg-gradient-to-b from-card to-background select-none">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-xs font-bold text-primary uppercase tracking-widest">{course.category}</span>
                          <div className="flex items-center gap-1 text-xs font-bold text-subtext">
                            <Star className="w-3.5 h-3.5 text-amber-500 fill-current" /> 4.9
                          </div>
                        </div>

                        <h3 className="text-lg md:text-xl font-black text-text mb-4 leading-tight group-hover:text-primary transition-colors line-clamp-2">
                          {course.title}
                        </h3>

                        <div className="flex items-center justify-between text-sm font-semibold text-subtext mt-auto mb-4">
                          <span className="flex items-center gap-1.5">
                            <Clock className="w-4 h-4 text-primary" /> {course.duration}
                          </span>
                        </div>

                        {/* Price & Access Row */}
                        <div className="pt-3 border-t border-card/60 flex items-center justify-between mb-3.5">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-purple-500/15 text-purple-300 border border-purple-500/30">
                            Full Access
                          </span>
                          <div className="flex items-baseline gap-1.5 shrink-0">
                            {course.originalPrice && (
                              <span className="text-[11px] text-subtext line-through">
                                ₹{course.originalPrice.toLocaleString()}
                              </span>
                            )}
                            <span className="text-sm font-black text-emerald-400">
                              ₹{(course.price || 15999).toLocaleString()}
                            </span>
                          </div>
                        </div>

                        {/* Action Buttons: View Details & Buy Now */}
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={(e) => handleCardClick(e, course.linkUrl)}
                            className="py-2.5 px-2 rounded-xl bg-card hover:bg-card/80 border border-card/80 text-text font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs active:scale-[0.97]"
                          >
                            <Eye className="w-3.5 h-3.5 text-primary" />
                            <span>View Details</span>
                          </button>

                          <button
                            type="button"
                            onClick={(e) => handleBuyNow(e, course)}
                            className="py-2.5 px-2 rounded-xl bg-gradient-to-r from-purple-600 via-purple-500 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-xs flex items-center justify-center gap-1.5 shadow-md shadow-purple-600/30 hover:shadow-purple-600/50 transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.97]"
                          >
                            <ShoppingBag className="w-3.5 h-3.5" />
                            <span>Buy Now</span>
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              </AnimatePresence>

              {filteredSelfPaced.length === 0 && (
                <div className="py-16 text-center text-subtext">
                  <Video className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p className="font-extrabold text-base text-text">No courses in this category</p>
                  <p className="text-xs mt-1">Try selecting a different category filter above.</p>
                </div>
              )}
            </div>

            {/* RIGHT COLUMN: Live Training Promotional Card (Vibrant Purple Spotlight) */}
            <div className="w-full xl:w-[360px] 2xl:w-[380px] shrink-0 xl:sticky xl:top-24">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.15 }}
                onClick={() => router.push("/courses?type=live")}
                className="group relative rounded-3xl p-6 sm:p-7 md:p-8 bg-gradient-to-b from-[#1c1033] via-[#140b26] to-[#0e071c] backdrop-blur-xl border border-purple-500/40 hover:border-purple-400/80 shadow-2xl shadow-purple-950/50 hover:shadow-purple-900/40 transition-all duration-300 flex flex-col justify-between cursor-pointer select-none overflow-hidden hover:-translate-y-1"
              >
                {/* Top Glowing Highlight Streak */}
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-purple-400 to-transparent opacity-80 group-hover:opacity-100 transition-opacity" />

                {/* Vibrant Purple Ambient Glows */}
                <div className="absolute -top-16 -right-16 w-60 h-60 bg-purple-600/30 rounded-full blur-3xl pointer-events-none group-hover:bg-purple-600/45 transition-all duration-500" />
                <div className="absolute -bottom-16 -left-16 w-60 h-60 bg-indigo-600/25 rounded-full blur-3xl pointer-events-none group-hover:bg-indigo-600/35 transition-all duration-500" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-purple-500/15 rounded-full blur-2xl pointer-events-none" />

                <div className="relative z-10">
                  {/* Live Badges */}
                  <div className="flex items-center justify-between mb-5">
                    <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-sm shadow-rose-950/30">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-500 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                      </span>
                      LIVE TRAINING
                    </span>
                    <span className="text-[11px] font-bold text-purple-200 bg-purple-500/25 px-2.5 py-1 rounded-full border border-purple-400/40 shadow-xs">
                      Live Classes
                    </span>
                  </div>

                  {/* Strong Heading */}
                  <h3 className="text-2xl sm:text-[26px] font-black text-white tracking-tight mb-3 leading-tight group-hover:text-purple-300 transition-colors">
                    Learn Live. Build Together.
                  </h3>

                  {/* Short Supporting Text */}
                  <p className="text-sm text-slate-300 leading-relaxed mb-6 font-medium">
                    Join instructor-led live classes, interact with experts, ask questions in real time, and build practical projects.
                  </p>

                  {/* 3 Concise Benefits */}
                  <div className="space-y-3 mb-6 pb-6 border-b border-purple-500/20">
                    {[
                      "Live Instructor Sessions",
                      "Real-Time Q&A",
                      "Hands-On Projects"
                    ].map((benefit, i) => (
                      <div key={i} className="flex items-center gap-2.5 text-xs sm:text-sm font-semibold text-slate-200">
                        <div className="w-5 h-5 rounded-full bg-purple-500/25 border border-purple-400/50 flex items-center justify-center text-purple-300 shrink-0 shadow-xs">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                        <span>{benefit}</span>
                      </div>
                    ))}
                  </div>

                  {/* Upcoming Class Information */}
                  <div className="p-4 rounded-2xl bg-purple-950/50 border border-purple-500/35 mb-6 flex items-center justify-between gap-3 group-hover:border-purple-400/60 transition-colors shadow-inner shadow-purple-950/40">
                    <div>
                      <span className="text-[10px] font-black text-purple-300/80 uppercase tracking-widest block">Next Class</span>
                      <span className="text-xs sm:text-sm font-extrabold text-white flex items-center gap-1.5 mt-0.5">
                        <Calendar className="w-3.5 h-3.5 text-purple-400 shrink-0" /> Aug 18 · AI Engineering
                      </span>
                    </div>
                    <span className="text-[10px] font-black text-amber-300 bg-amber-500/20 px-2.5 py-1 rounded-full border border-amber-500/40 whitespace-nowrap">
                      Filling Fast
                    </span>
                  </div>
                </div>

                {/* Primary CTA */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push("/courses?type=live");
                  }}
                  className="w-full py-3.5 px-5 rounded-2xl bg-gradient-to-r from-purple-600 via-purple-500 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-purple-600/35 hover:shadow-purple-500/50 transition-all group-hover:scale-[1.02] relative z-10"
                >
                  <span>Explore Live Training</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </motion.div>
            </div>
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* MODE 2: PREMIUM LIVE TRAINING SECTION (IMAGE 2 REDESIGN)      */}
      {/* ───────────────────────────────────────────────────────────── */}
      {activeMode === "live" && (
        <div className="max-w-[1650px] mx-auto px-6 sm:px-10 mt-2">
          {/* Section Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-card/60">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400 shadow-md">
                <Radio className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <h3 className="text-2xl font-black text-text flex items-center gap-2">
                  Live Classes
                </h3>
                <p className="text-xs font-semibold text-subtext mt-0.5">
                  Join expert-led live sessions, interact in real-time, and build in-demand skills.
                </p>
              </div>
            </div>

            {/* Upcoming vs Past Pill Toggle */}
            <div className="flex items-center gap-1.5 p-1 bg-card/90 rounded-full border border-card/80 self-start sm:self-auto">
              <button className="px-4 py-1.5 rounded-full text-xs font-bold bg-purple-600 text-white shadow-md shadow-purple-600/20">
                Upcoming
              </button>
              <button className="px-4 py-1.5 rounded-full text-xs font-bold text-subtext hover:text-text transition-colors">
                Past Classes
              </button>
            </div>
          </div>

          {/* Main 2-Column Grid (Left Filters + Right Cohort Cards) */}
          <div className="flex flex-col lg:flex-row gap-8 items-start">
            {/* LEFT FILTER SIDEBAR */}
            <div className="w-full lg:w-64 bg-card/80 backdrop-blur-xl border border-card/80 rounded-3xl p-5 shadow-xl shrink-0">
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-card/60">
                <span className="text-xs font-black text-text uppercase tracking-wider flex items-center gap-1.5">
                  <Filter className="w-3.5 h-3.5 text-purple-400" /> Filters
                </span>
                {(selectedTimeframe !== null || selectedClassType !== null || selectedInstructor !== null) && (
                  <button
                    onClick={() => {
                      setSelectedTimeframe(null);
                      setSelectedClassType(null);
                      setSelectedInstructor(null);
                    }}
                    className="text-[11px] font-bold text-purple-400 hover:underline"
                  >
                    Clear All
                  </button>
                )}
              </div>

              {/* Filter 1: Timeframe */}
              <div className="mb-6">
                <h4 className="text-xs font-bold text-subtext uppercase tracking-wider mb-2.5">Timeframe</h4>
                <div className="space-y-2">
                  {[
                    { label: "Next 7 Days", days: 7, count: 2 },
                    { label: "Next 30 Days", days: 30, count: 4 },
                    { label: "Next 60 Days", days: 60, count: 6 }
                  ].map((tf) => (
                    <label
                      key={tf.days}
                      className="flex items-center justify-between text-xs font-semibold text-text cursor-pointer hover:text-purple-400 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={selectedTimeframe === tf.days}
                          onChange={() => setSelectedTimeframe(selectedTimeframe === tf.days ? null : tf.days)}
                          className="w-4 h-4 rounded border-card bg-background text-purple-600 focus:ring-purple-500 accent-purple-600"
                        />
                        <span>{tf.label}</span>
                      </div>
                      <span className="text-[10px] font-bold text-subtext bg-background px-2 py-0.5 rounded-full border border-card">
                        {tf.count}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Filter 2: Class Type */}
              <div className="mb-6">
                <h4 className="text-xs font-bold text-subtext uppercase tracking-wider mb-2.5">Class Type</h4>
                <div className="space-y-2">
                  {[
                    { label: "Live Class", type: "Live Class", count: 3 },
                    { label: "Full Bootcamp", type: "Full Bootcamp", count: 1 },
                    { label: "Workshop", type: "Workshop", count: 2 }
                  ].map((ct) => (
                    <label
                      key={ct.type}
                      className="flex items-center justify-between text-xs font-semibold text-text cursor-pointer hover:text-purple-400 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={selectedClassType === ct.type}
                          onChange={() => setSelectedClassType(selectedClassType === ct.type ? null : ct.type)}
                          className="w-4 h-4 rounded border-card bg-background text-purple-600 focus:ring-purple-500 accent-purple-600"
                        />
                        <span>{ct.label}</span>
                      </div>
                      <span className="text-[10px] font-bold text-subtext bg-background px-2 py-0.5 rounded-full border border-card">
                        {ct.count}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Request Batch CTA */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-950/40 via-card to-background border border-purple-500/30 text-center">
                <h5 className="text-xs font-bold text-text mb-1">Can't find the right batch?</h5>
                <p className="text-[11px] text-subtext mb-3">Request a batch for your preferred timezone or schedule.</p>
                <button
                  onClick={() => router.push("/signup")}
                  className="w-full py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold text-xs shadow-md shadow-purple-600/20 transition-all"
                >
                  Request Batch
                </button>
              </div>
            </div>

            {/* RIGHT MAIN CARDS CONTAINER */}
            <div className="flex-1 w-full space-y-5">
              {filteredLive.length === 0 ? (
                <div className="w-full py-16 px-8 rounded-3xl border border-card/60 bg-card/40 backdrop-blur-md flex flex-col items-center justify-center text-center">
                  <Calendar className="w-10 h-10 text-purple-400 mb-3" />
                  <h4 className="text-xl font-black text-text mb-1">No matching live batches</h4>
                  <p className="text-xs text-subtext">Try clearing your active filters to see all available classes.</p>
                </div>
              ) : (
                filteredLive.map((item) => {
                  const percent = Math.round((item.seats.enrolled / item.seats.total) * 100);
                  const isBooked = savedBooked[item.id];

                  return (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 15 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4 }}
                      whileHover={{ y: -4 }}
                      onClick={(e) => handleCardClick(e, item.linkUrl)}
                      className="bg-card/90 backdrop-blur-xl border border-card/80 hover:border-purple-500/40 rounded-3xl p-5 md:p-6 shadow-xl transition-all group relative cursor-pointer overflow-hidden flex flex-col md:flex-row gap-6 items-stretch"
                    >
                      {/* Left: Course Image Thumbnail */}
                      <div className="w-full md:w-64 h-48 md:h-auto rounded-2xl overflow-hidden relative shrink-0 border border-card/80 bg-background min-h-[160px]">
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

                          <h3 className="text-xl md:text-2xl font-black text-text mb-2 group-hover:text-purple-400 transition-colors leading-snug">
                            {item.title}
                          </h3>

                          <p className="text-xs md:text-sm font-medium text-subtext leading-relaxed line-clamp-2 mb-4">
                            {item.description}
                          </p>
                        </div>

                        {/* Metadata Chips */}
                        <div className="flex flex-wrap items-center gap-2 mt-auto">
                          <span className="px-3 py-1 rounded-md bg-purple-500/10 text-purple-300 border border-purple-500/20 text-xs font-bold">
                            {item.level}
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
                      <div className="w-full md:w-64 border-t md:border-t-0 md:border-l border-card/80 pt-4 md:pt-0 md:pl-6 flex flex-col justify-between shrink-0">
                        {/* Schedule details */}
                        <div className="space-y-2 mb-4">
                          <div className="flex items-start gap-2.5 text-xs font-bold text-text">
                            <Calendar className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                            <div>
                              <div>{item.schedule.dateFormatted}</div>
                              <div className="text-subtext text-[11px] font-normal mt-0.5">{item.schedule.daysPattern}</div>
                            </div>
                          </div>

                          <div className="flex items-start gap-2.5 text-xs font-bold text-text">
                            <Clock className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                            <div>
                              <div>{item.schedule.timeFormatted}</div>
                              <div className="text-subtext text-[11px] font-normal mt-0.5">Duration: {item.schedule.duration}</div>
                            </div>
                          </div>
                        </div>

                        {/* Seats progress */}
                        <div className="mb-4">
                          <div className="flex justify-between text-xs font-bold text-subtext mb-1.5">
                            <span className="flex items-center gap-1.5 text-text">
                              <Users className="w-3.5 h-3.5 text-purple-400" />
                              <span>{item.seats.enrolled} / {item.seats.total} Enrolled</span>
                            </span>
                            <span className="text-purple-400 font-black">{percent}%</span>
                          </div>

                          <div className="w-full h-2 bg-background rounded-full overflow-hidden border border-card">
                            <div
                              className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full transition-all duration-700"
                              style={{ width: `${percent}%` }}
                            />
                          </div>
                        </div>

                        {/* CTA & Bookmark Buttons */}
                        <div className="flex items-center gap-2 mt-auto">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              router.push(item.linkUrl);
                            }}
                            className="flex-1 py-3 px-4 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-extrabold text-xs shadow-lg shadow-purple-600/25 flex items-center justify-center gap-1.5 transition-all group-hover:scale-105"
                          >
                            <span>{item.ctaText}</span>
                          </button>

                          <button
                            onClick={(e) => toggleBookmark(e, item.id)}
                            className={`p-3 rounded-xl border transition-all ${
                              isBooked
                                ? "bg-purple-600/20 text-purple-400 border-purple-500/40"
                                : "bg-card border-card/80 text-subtext hover:text-text hover:bg-card/90"
                            }`}
                            title="Bookmark class"
                          >
                            <Bookmark className={`w-4 h-4 ${isBooked ? "fill-purple-400" : ""}`} />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>
          </div>

          {/* Bottom Live Training Highlights Bar */}
          <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-5 rounded-3xl bg-card/60 border border-card/80 backdrop-blur-md">
            <div className="flex items-center gap-3 p-2">
              <div className="w-10 h-10 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 shrink-0">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div>
                <h5 className="text-xs font-black text-text">Live Interaction</h5>
                <p className="text-[11px] text-subtext font-medium">Ask questions & get real-time answers</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-2">
              <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
                <Code2 className="w-5 h-5" />
              </div>
              <div>
                <h5 className="text-xs font-black text-text">Hands-on Learning</h5>
                <p className="text-[11px] text-subtext font-medium">Code, build & solve problems live</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-2">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h5 className="text-xs font-black text-text">Expert Mentorship</h5>
                <p className="text-[11px] text-subtext font-medium">Learn from industry practitioners</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-2">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
                <Tv className="w-5 h-5" />
              </div>
              <div>
                <h5 className="text-xs font-black text-text">Recordings & Notes</h5>
                <p className="text-[11px] text-subtext font-medium">Access session recordings anytime</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
