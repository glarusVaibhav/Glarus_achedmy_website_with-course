"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useRef, useState, useEffect, useMemo } from "react";
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
import { formatDate, formatTime } from "@/lib/dateTime";

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

export interface LiveCourseRegistrationWindow {
  isOpen: boolean;
  isUpcoming: boolean;
  isClosed: boolean;
  label: string;
  countdownText: string;
  fullWindowFormatted: string;
  badgeColor: string;
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
  registrationStartDate?: string | null;
  registrationEndDate?: string | null;
  registrationWindow?: LiveCourseRegistrationWindow;
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

export function formatRegistrationWindow(
  regStart?: string | null,
  regEnd?: string | null,
  courseStart?: string | null
): LiveCourseRegistrationWindow {
  if (!regStart && !regEnd) {
    return {
      isOpen: true,
      isUpcoming: false,
      isClosed: false,
      label: "Registration Open",
      countdownText: "Seats filling fast",
      fullWindowFormatted: "Open for Enrollment",
      badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/30"
    };
  }

  const now = new Date();
  const startDate = regStart ? new Date(regStart) : null;
  const endDate = regEnd ? new Date(regEnd) : (courseStart ? new Date(courseStart) : null);

  const startFormatted = startDate && !isNaN(startDate.getTime())
    ? `${formatDate(startDate)} ${formatTime(startDate.toISOString())}`
    : "Immediate";
  const endFormatted = endDate && !isNaN(endDate.getTime())
    ? `${formatDate(endDate)} ${formatTime(endDate.toISOString())}`
    : "Until Cohort Starts";

  const fullWindow = `${startFormatted} – ${endFormatted}`;

  // If registration starts in the future
  if (startDate && !isNaN(startDate.getTime()) && now < startDate) {
    const diffMs = startDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    return {
      isOpen: false,
      isUpcoming: true,
      isClosed: false,
      label: `Opens in ${diffDays}d`,
      countdownText: `Starts ${formatDate(startDate)} at ${formatTime(startDate.toISOString())}`,
      fullWindowFormatted: fullWindow,
      badgeColor: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/15 dark:text-amber-300 dark:border-amber-500/30"
    };
  }

  // If registration ended in the past
  if (endDate && !isNaN(endDate.getTime()) && now > endDate) {
    return {
      isOpen: false,
      isUpcoming: false,
      isClosed: true,
      label: "Registration Closed",
      countdownText: `Closed on ${formatDate(endDate)}`,
      fullWindowFormatted: fullWindow,
      badgeColor: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/15 dark:text-rose-400 dark:border-rose-500/30"
    };
  }

  // Currently open / active
  let countdownText = "Enrollment Active";
  if (endDate && !isNaN(endDate.getTime())) {
    const diffMs = endDate.getTime() - now.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    if (diffHours <= 24 && diffHours > 0) {
      countdownText = `Closes in ${diffHours} hour${diffHours > 1 ? "s" : ""}!`;
    } else if (diffDays <= 7) {
      countdownText = `Closes in ${diffDays} day${diffDays > 1 ? "s" : ""} (${formatDate(endDate)})`;
    } else {
      countdownText = `Deadline: ${formatDate(endDate)}`;
    }
  }

  return {
    isOpen: true,
    isUpcoming: false,
    isClosed: false,
    label: "Registration Open",
    countdownText,
    fullWindowFormatted: fullWindow,
    badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/30"
  };
}

const SELF_PACED_COURSES: Course[] = [
  { 
    id: "cmtl2cz4i0001vyik7ryv5ouy", 
    title: "Full-Stack AI & Next.js 16 Masterclass: Building Production SaaS", 
    category: "AI Engineering", 
    difficulty: "All Levels", 
    duration: "30h Self-Paced", 
    gradient: "from-purple-600/20 to-indigo-600/20", 
    linkUrl: "/course/cmtl2cz4i0001vyik7ryv5ouy", 
    image: "/images/courses/generative-ai.png", 
    mode: "self-paced", 
    price: 14999, 
    originalPrice: 22999 
  },
  { id: "1", title: "Advanced LLM Architecture", category: "AI Engineering", difficulty: "Advanced", duration: "18h Self-Paced", gradient: "from-purple-600/20 to-blue-600/20", linkUrl: "/course/ai-1", image: "/images/courses/llm-architecture.png", mode: "self-paced", price: 15999, originalPrice: 24999 },
  { id: "2", title: "Generative AI Application Engineering", category: "Web Development", difficulty: "Intermediate", duration: "24h Self-Paced", gradient: "from-sky-500/20 to-indigo-500/20", linkUrl: "/course/Generative_AI_Application_Engineer", image: "/images/courses/generative-ai.png", mode: "self-paced", price: 15999, originalPrice: 24999 },
  { id: "3", title: "RAG & Vector Databases", category: "Data Science", difficulty: "Advanced", duration: "12h Self-Paced", gradient: "from-emerald-500/20 to-teal-500/20", linkUrl: "/course/ai-3", image: "/images/courses/rag-vector-db.png", mode: "self-paced", price: 19999, originalPrice: 29999 },
  { id: "4", title: "Machine Learning Math Foundations", category: "AI Engineering", difficulty: "Beginner", duration: "32h Self-Paced", gradient: "from-orange-500/20 to-rose-500/20", linkUrl: "/course/ai-2", image: "/images/courses/ml-math.png", mode: "self-paced", price: 8999, originalPrice: 14999 },
  { id: "5", title: "Smart Contract Security Testing", category: "Web3", difficulty: "Expert", duration: "15h Self-Paced", gradient: "from-violet-500/20 to-fuchsia-500/20", linkUrl: "/course/ai-4", image: "/images/courses/smart-contracts.png", mode: "self-paced", price: 12999, originalPrice: 19999 }
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
    linkUrl: "/student/live-courses/live-agentic-ai",
    tags: ["Live Class", "Limited Seats", "5 Projects"],
    classType: "Live Class",
    timeframeDays: 5,
    registrationStartDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    registrationEndDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    registrationWindow: formatRegistrationWindow(
      new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString()
    ),
    instructor: {
      name: "Alex Chen",
      role: "FAANG Staff Engineer",
      company: "Google DeepMind",
      rating: 4.9,
      reviews: "1.2k+ reviews",
      avatar: "/images/courses/generative-ai.png"
    },
    schedule: {
      dateFormatted: "Tomorrow, 08:00 PM IST",
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
    linkUrl: "/student/live-courses/live-llmops",
    tags: ["Live Class", "Includes Projects", "Live Mentorship"],
    classType: "Live Class",
    timeframeDays: 14,
    registrationStartDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    registrationEndDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
    registrationWindow: formatRegistrationWindow(
      new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString()
    ),
    instructor: {
      name: "Elena Rostova",
      role: "ML Engineer at Meta",
      company: "Meta AI",
      rating: 4.8,
      reviews: "965 reviews",
      avatar: "/images/courses/llm-architecture.png"
    },
    schedule: {
      dateFormatted: "In 2 Weeks • Mon, 01 Sep",
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
    title: "Hands-On LLM Fine-Tuning & Quantization Workshop",
    category: "AI Engineering",
    description: "Deep dive into LoRA, QLoRA, and vLLM inference optimization in a live hands-on masterclass lab.",
    image: "/images/courses/python-fundamentals.png",
    level: "Level: Intermediate",
    statusBadge: "UPCOMING",
    badgeType: "UPCOMING",
    linkUrl: "/student/live-courses/live-finetune",
    tags: ["Workshop", "Live Lab", "Hands-On"],
    classType: "Workshop",
    timeframeDays: 6,
    instructor: {
      name: "David Kumar",
      role: "AI Research Lead",
      company: "Glarus AI",
      rating: 4.95,
      reviews: "880 reviews",
      avatar: "/images/courses/python-fundamentals.png"
    },
    schedule: {
      dateFormatted: "This Weekend • Sat, 06:00 PM",
      timeFormatted: "06:00 PM – 10:00 PM IST",
      duration: "4 Hours",
      daysPattern: "1-Day Weekend Intensive"
    },
    seats: {
      enrolled: 38,
      total: 40
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
    timeframeDays: 25,
    instructor: {
      name: "Priya Sharma",
      role: "Senior ML Engineer",
      company: "Anthropic",
      rating: 4.8,
      reviews: "743 reviews",
      avatar: "/images/courses/ml-math.png"
    },
    schedule: {
      dateFormatted: "Starts in 3 Weeks • Sat, 28 Sep",
      timeFormatted: "11:00 AM – 01:00 PM IST",
      duration: "2 Hours",
      daysPattern: "Full-Time Intensive"
    },
    seats: {
      enrolled: 18,
      total: 30
    },
    ctaText: "View Details →"
  },
  {
    id: "live-5",
    title: "Scalable Cloud Architecture & Vector DB Workshop",
    category: "Cloud",
    description: "Design and deploy scalable, secure and cost-optimized AI applications on AWS & Kubernetes.",
    image: "/images/courses/rag-vector-db.png",
    level: "Level: Intermediate",
    statusBadge: "UPCOMING",
    badgeType: "UPCOMING",
    linkUrl: "/student/live-courses/live-cloud-ai",
    tags: ["Workshop", "Hands-on Labs", "Cloud Infra"],
    classType: "Workshop",
    timeframeDays: 18,
    instructor: {
      name: "Arjun Mehta",
      role: "Ex-AWS Principal Architect",
      company: "Ex-AWS Principal",
      rating: 4.9,
      reviews: "1.5k+ reviews",
      avatar: "/images/courses/rag-vector-db.png"
    },
    schedule: {
      dateFormatted: "Sat, 22 Aug • Live Lab",
      timeFormatted: "08:00 PM – 10:00 PM IST",
      duration: "2 Hours",
      daysPattern: "Weekend Masterclass"
    },
    seats: {
      enrolled: 45,
      total: 60
    },
    ctaText: "Reserve Seat →"
  },
  {
    id: "live-6",
    title: "Full-Stack Generative AI & Multi-Modal Systems",
    category: "AI Engineering",
    description: "Master multimodal LLMs, audio/vision embeddings, and streaming full-stack AI user experiences.",
    image: "/images/courses/smart-contracts.png",
    level: "Level: Advanced",
    statusBadge: "UPCOMING",
    badgeType: "UPCOMING",
    linkUrl: "/student/live-courses/live-multimodal",
    tags: ["Live Class", "Full-Stack", "Cohort 3"],
    classType: "Live Class",
    timeframeDays: 45,
    instructor: {
      name: "Sophia Zhang",
      role: "Staff AI Engineer",
      company: "OpenAI",
      rating: 4.9,
      reviews: "1.1k+ reviews",
      avatar: "/images/courses/smart-contracts.png"
    },
    schedule: {
      dateFormatted: "Starts Next Month • Cohort 3",
      timeFormatted: "07:00 PM – 09:00 PM IST",
      duration: "2 Hours",
      daysPattern: "Tue & Thu Evenings"
    },
    seats: {
      enrolled: 22,
      total: 45
    },
    ctaText: "Reserve Seat →"
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
  const [selectedClassTypes, setSelectedClassTypes] = useState<string[]>([]);
  const [selectedInstructor, setSelectedInstructor] = useState<string | null>(null);
  const [savedBooked, setSavedBooked] = useState<Record<string, boolean>>({});

  const toggleClassType = (type: string) => {
    setSelectedClassTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  // Dynamic self-paced courses from API / DB
  const [selfPacedCourses, setSelfPacedCourses] = useState<Course[]>(SELF_PACED_COURSES);

  useEffect(() => {
    fetch("/api/courses")
      .then((res) => res.json())
      .then((data) => {
        if (data?.courses && Array.isArray(data.courses)) {
          if (data.courses.length === 0) {
            setSelfPacedCourses([]);
            return;
          }
          const dbCourses: Course[] = data.courses.map((c: any) => {
            const titleLower = (c.title || "").toLowerCase();
            let image = c.image;
            if (!image || image === "/placeholder-course.jpg") {
              if (titleLower.includes("full-stack") || titleLower.includes("next.js") || titleLower.includes("saas")) {
                image = "/images/courses/generative-ai.png";
              } else if (titleLower.includes("python fundamentals") || titleLower.includes("python")) {
                image = "/images/courses/python-fundamentals.png";
              } else if (titleLower.includes("machine learning") || titleLower.includes("ml")) {
                image = "/images/courses/ml-math.png";
              } else if (titleLower.includes("ai engineering") || titleLower.includes("advanced ai") || titleLower.includes("llm")) {
                image = "/images/courses/llm-architecture.png";
              } else if (titleLower.includes("rag") || titleLower.includes("vector")) {
                image = "/images/courses/rag-vector-db.png";
              } else {
                image = "/images/courses/smart-contracts.png";
              }
            }
            return {
              id: c.id,
              title: c.title,
              category: c.category || "AI Engineering",
              difficulty: c.level || "All Levels",
              duration: c.duration || "30h Self-Paced",
              gradient: "from-purple-600/20 to-indigo-600/20",
              linkUrl: `/course/${c.id}`,
              image,
              mode: "self-paced",
              price: c.price || 14999,
              originalPrice: c.originalPrice || Math.round((c.price || 14999) * 1.5)
            };
          });

          setSelfPacedCourses(dbCourses);
        }
      })
      .catch((err) => {
        console.error("Failed to load courses for landing page:", err);
      });
  }, []);

  // Dynamic live courses from API / DB
  const [liveCoursesList, setLiveCoursesList] = useState<LiveCourseDetail[]>(ENRICHED_LIVE_COURSES);

  useEffect(() => {
    fetch("/api/live-courses")
      .then((res) => res.json())
      .then((data) => {
        if (data?.courses && Array.isArray(data.courses) && data.courses.length > 0) {
          const dbLive: LiveCourseDetail[] = data.courses.map((c: any) => {
            const nextSession = c.sessions?.[0];
            const dateStr = nextSession?.date
              ? formatDate(nextSession.date)
              : "Upcoming Cohort";

            const timeStr = nextSession?.startTime
              ? `${formatTime(nextSession.startTime)} – ${formatTime(nextSession.endTime || "09:00 PM")}`
              : "07:00 PM – 09:00 PM";

            let calculatedDays = 30;
            if (nextSession?.date) {
              const diffMs = new Date(nextSession.date).getTime() - Date.now();
              calculatedDays = Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
            }

            const titleLower = (c.title || "").toLowerCase();
            let inferredClassType: "Live Class" | "Full Bootcamp" | "Workshop" = "Live Class";
            if (titleLower.includes("bootcamp") || (c.totalSessions && c.totalSessions >= 10)) {
              inferredClassType = "Full Bootcamp";
            } else if (titleLower.includes("workshop") || (c.totalSessions && c.totalSessions <= 3)) {
              inferredClassType = "Workshop";
            }

            const regWindow = formatRegistrationWindow(
              c.registrationStartDate,
              c.registrationEndDate,
              c.startDate
            );

            return {
              id: c.id,
              title: c.title,
              category: c.category || "AI Engineering",
              description:
                c.shortDescription ||
                c.description ||
                "Live hands-on training with industry mentors and practical capstone projects.",
              image: c.thumbnail || "/images/courses/generative-ai.png",
              level: `Level: ${c.level || "Intermediate"}`,
              statusBadge: regWindow.isOpen ? "ENROLLING NOW" : (regWindow.isUpcoming ? "OPENS SOON" : "CLOSED"),
              badgeType: "UPCOMING" as const,
              linkUrl: `/student/live-courses/${c.id}`,
              tags: ["Live Cohort", `${c.totalSessions || 6} Sessions`, "Mentor-Led"],
              classType: inferredClassType,
              timeframeDays: calculatedDays,
              registrationStartDate: c.registrationStartDate || null,
              registrationEndDate: c.registrationEndDate || null,
              registrationWindow: regWindow,
              instructor: {
                name: c.leadInstructor?.name || "Lead AI Architect",
                role: "Lead Cohort Instructor",
                company: "Glarus Academy",
                rating: 4.9,
                reviews: "500+ students",
                avatar:
                  c.leadInstructor?.avatar ||
                  c.leadInstructor?.image ||
                  "/images/courses/generative-ai.png"
              },
              schedule: {
                dateFormatted: dateStr,
                timeFormatted: timeStr,
                duration: c.duration || "2 Hours",
                daysPattern: "Live Interactive Track"
              },
              seats: {
                enrolled: c.enrolledCount || 0,
                total: c.maxStudents || 50
              },
              ctaText: "Enroll in Cohort →"
            };
          });

          // Prepend DB live courses to the static ones
          const dbIds = new Set(dbLive.map((c) => c.id));
          const remainingStatic = ENRICHED_LIVE_COURSES.filter((c) => !dbIds.has(c.id));
          setLiveCoursesList([...dbLive, ...remainingStatic]);
        }
      })
      .catch((err) => {
        console.error("Failed to load live courses for landing page:", err);
      });
  }, []);

  const dynamicLiveCategories = useMemo(() => {
    const cats = new Set(liveCoursesList.map((c) => c.category).filter(Boolean));
    return ["All", ...Array.from(cats)];
  }, [liveCoursesList]);

  const currentCategory = activeMode === "self-paced" ? selfPacedCategory : liveCategory;
  const currentCategoryList = activeMode === "self-paced" ? SELF_PACED_CATEGORIES : dynamicLiveCategories;

  // Real-time filter counts computed from inventory
  const filterCounts = useMemo(() => {
    const baseList = liveCategory === "All"
      ? liveCoursesList
      : liveCoursesList.filter((c) => c.category === liveCategory);

    return {
      next7: baseList.filter((c) => (c.timeframeDays ?? 30) <= 7).length,
      next30: baseList.filter((c) => (c.timeframeDays ?? 30) <= 30).length,
      next60: baseList.filter((c) => (c.timeframeDays ?? 30) <= 60).length,
      liveClass: baseList.filter((c) => c.classType === "Live Class").length,
      bootcamp: baseList.filter((c) => c.classType === "Full Bootcamp").length,
      workshop: baseList.filter((c) => c.classType === "Workshop").length,
    };
  }, [liveCoursesList, liveCategory]);

  // Filter live courses dynamically
  const filteredLive = useMemo(() => {
    return liveCoursesList.filter((course) => {
      if (liveCategory !== "All" && course.category !== liveCategory) return false;
      if (selectedTimeframe !== null && (course.timeframeDays ?? 30) > selectedTimeframe) return false;
      if (selectedClassTypes.length > 0 && !selectedClassTypes.includes(course.classType)) return false;
      if (selectedInstructor !== null && course.instructor?.name !== selectedInstructor) return false;
      return true;
    });
  }, [liveCoursesList, liveCategory, selectedTimeframe, selectedClassTypes, selectedInstructor]);

  const filteredSelfPaced = selfPacedCategory === "All"
    ? selfPacedCourses
    : selfPacedCourses.filter(c => c.category === selfPacedCategory);

  const displayedSelfPaced = filteredSelfPaced.slice(0, 6);

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
            className="flex items-center gap-2 text-purple-700 dark:text-purple-400 font-bold hover:text-purple-800 dark:hover:text-purple-300 transition-colors w-fit border border-purple-300 dark:border-purple-500/30 px-6 py-3 rounded-full hover:bg-purple-50 dark:hover:bg-purple-500/10 shadow-sm"
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
          className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-1.5 rounded-2xl md:rounded-full bg-card/80 border border-border backdrop-blur-md"
        >
          <div className="flex items-center gap-1.5 w-full sm:w-auto">
            <button
              onClick={() => setActiveMode("self-paced")}
              className={`relative flex-1 sm:flex-initial flex items-center justify-center gap-2.5 px-6 py-3 rounded-xl md:rounded-full text-sm font-bold transition-all select-none ${
                activeMode === "self-paced"
                  ? "bg-text text-background shadow-lg shadow-text/20 scale-[1.02]"
                  : "text-subtext hover:text-text hover:bg-card-hover"
              }`}
            >
              <Video className="w-4 h-4" />
              <span>Self-Paced Courses</span>
              <span className={`ml-1 px-2 py-0.5 text-xs rounded-full font-black ${
                activeMode === "self-paced"
                  ? "bg-background/20 text-background"
                  : "bg-muted border border-border text-subtext"
              }`}>
                {selfPacedCourses.length}
              </span>
            </button>

            <button
              onClick={() => setActiveMode("live")}
              className={`relative flex-1 sm:flex-initial flex items-center justify-center gap-2.5 px-6 py-3 rounded-xl md:rounded-full text-sm font-bold transition-all select-none ${
                activeMode === "live"
                  ? "bg-gradient-to-r from-primary to-accent text-white shadow-lg shadow-primary/25 scale-[1.02]"
                  : "text-subtext hover:text-text hover:bg-card-hover"
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
                  : "bg-muted border border-border text-subtext"
              }`}>
                {liveCoursesList.length}
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
                  : "bg-card border border-border text-subtext hover:text-text hover:bg-card-hover"
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
                  {displayedSelfPaced.map((course, idx) => (
                    <motion.div
                      key={course.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.4, delay: idx * 0.05 }}
                      whileHover={{ y: -6 }}
                      onClick={(e) => handleCardClick(e, course.linkUrl)}
                      className="w-full bg-card rounded-3xl border border-border overflow-hidden shadow-sm dark:shadow-xl flex flex-col group relative select-none cursor-pointer hover:border-purple-400 dark:hover:border-purple-500/40 transition-all duration-300"
                    >
                      <div
                        draggable={false}
                        className="h-48 sm:h-52 w-full relative overflow-hidden flex items-center justify-center border-b border-border select-none bg-background"
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
                          <span className="px-3 py-1 bg-white/80 dark:bg-background/70 backdrop-blur-md rounded-full text-[10px] font-black text-text uppercase tracking-widest border border-border/80 dark:border-white/10 shadow-lg">
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
                        <div className="pt-3 border-t border-border flex items-center justify-between mb-3.5">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-500/15 dark:text-purple-300 dark:border-purple-500/30">
                            Full Access
                          </span>
                          <div className="flex items-baseline gap-1.5 shrink-0">
                            {course.originalPrice && (
                              <span className="text-[11px] text-subtext line-through">
                                ₹{course.originalPrice.toLocaleString()}
                              </span>
                            )}
                            <span className="text-sm font-black text-emerald-700 dark:text-emerald-400">
                              ₹{(course.price || 15999).toLocaleString()}
                            </span>
                          </div>
                        </div>

                        {/* Action Buttons: View Details & Buy Now */}
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={(e) => handleCardClick(e, course.linkUrl)}
                            className="py-2.5 px-2 rounded-xl bg-card hover:bg-zinc-100 dark:hover:bg-card/80 border border-border text-text font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs active:scale-[0.97]"
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

              {/* View All Self-Paced Courses CTA Bar */}
              {filteredSelfPaced.length > 6 && (
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.15 }}
                  className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 p-5 sm:p-6 rounded-3xl bg-card/70 border border-purple-200 dark:border-purple-500/25 backdrop-blur-md shadow-xl"
                >
                  <div className="flex items-center gap-3.5 text-center sm:text-left">
                    <div className="w-11 h-11 rounded-2xl bg-purple-50 dark:bg-purple-500/15 border border-purple-200 dark:border-purple-500/30 flex items-center justify-center text-purple-700 dark:text-purple-400 shrink-0 shadow-sm">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm sm:text-base font-black text-text">
                        Showing 6 of {filteredSelfPaced.length} Self-Paced Courses
                      </p>
                      <p className="text-xs text-subtext mt-0.5">
                        Browse all curriculums, compare topics, and start learning right away.
                      </p>
                    </div>
                  </div>

                  <Link
                    href="/courses?type=self-paced"
                    className="group px-6 py-3 rounded-full bg-gradient-to-r from-purple-600 via-purple-500 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-purple-600/30 hover:shadow-purple-600/50 hover:scale-105 active:scale-95 transition-all cursor-pointer whitespace-nowrap"
                  >
                    <span>View All {filteredSelfPaced.length} Courses</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </motion.div>
              )}

              {filteredSelfPaced.length === 0 && (
                <div className="py-16 text-center text-subtext">
                  <Video className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p className="font-extrabold text-base text-text">No courses in this category</p>
                  <p className="text-xs mt-1">Try selecting a different category filter above.</p>
                </div>
              )}
            </div>

            {/* RIGHT COLUMN: Live Training Promotional Card (Featured Live Showcase Spotlight) */}
            <div className="w-full xl:w-[360px] 2xl:w-[380px] shrink-0 xl:sticky xl:top-24">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.15 }}
                onClick={() => router.push("/courses?type=live")}
                className="group relative rounded-3xl bg-gradient-to-b from-[#230e12] via-[#16080b] to-[#0d0406] backdrop-blur-xl border-2 border-amber-500/40 hover:border-amber-400 shadow-2xl shadow-orange-950/50 hover:shadow-orange-900/60 transition-all duration-300 flex flex-col justify-between cursor-pointer select-none overflow-hidden hover:-translate-y-1.5"
              >
                {/* Top Glowing Laser Streak */}
                <div className="absolute top-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-transparent via-amber-400 to-transparent opacity-90 group-hover:opacity-100 transition-opacity" />

                {/* Warm Sunset Ambient Glows */}
                <div className="absolute -top-16 -right-16 w-64 h-64 bg-orange-600/25 rounded-full blur-3xl pointer-events-none group-hover:bg-orange-600/35 transition-all duration-500" />
                <div className="absolute -bottom-16 -left-16 w-64 h-64 bg-rose-600/25 rounded-full blur-3xl pointer-events-none group-hover:bg-rose-600/35 transition-all duration-500" />

                {/* Visual Header: Live Broadcast Stage */}
                <div className="relative h-36 w-full overflow-hidden bg-slate-950">
                  <img
                    src="/images/courses/generative-ai.png"
                    alt="Live Bootcamp"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-60"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#230e12] via-[#230e12]/60 to-black/40" />

                  {/* Top Live Broadcast Badges */}
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-red-600 text-white shadow-lg shadow-red-950/60 border border-red-400/40">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                      </span>
                      LIVE BROADCAST
                    </span>

                    {/* Equalizer soundwave animation */}
                    <div className="flex items-end gap-0.5 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/15">
                      <span className="w-1 h-3 bg-amber-400 rounded-full animate-pulse" />
                      <span className="w-1 h-4 bg-orange-400 rounded-full animate-pulse delay-75" />
                      <span className="w-1 h-2 bg-rose-400 rounded-full animate-pulse delay-150" />
                      <span className="w-1 h-4 bg-amber-300 rounded-full animate-pulse delay-100" />
                    </div>
                  </div>

                  {/* Bottom Cohort Proof */}
                  <div className="absolute bottom-2 left-3 z-10 flex items-center gap-2">
                    <div className="flex -space-x-1.5 overflow-hidden">
                      <div className="w-5 h-5 rounded-full bg-amber-500 border border-[#230e12] flex items-center justify-center text-[9px] font-black text-black">A</div>
                      <div className="w-5 h-5 rounded-full bg-orange-500 border border-[#230e12] flex items-center justify-center text-[9px] font-black text-black">E</div>
                      <div className="w-5 h-5 rounded-full bg-rose-500 border border-[#230e12] flex items-center justify-center text-[9px] font-black text-white">M</div>
                    </div>
                    <span className="text-[11px] font-bold text-amber-200 drop-shadow-md">
                      180+ Cohort Students
                    </span>
                  </div>
                </div>

                {/* Card Content Body */}
                <div className="p-5 sm:p-6 flex flex-col justify-between flex-1 relative z-10">
                  <div>
                    {/* Strong Heading */}
                    <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight mb-2 leading-tight group-hover:text-amber-300 transition-colors">
                      Learn Live. Build Together.
                    </h3>

                    {/* Supporting Text */}
                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-5 font-medium">
                      Join instructor-led live classes, interact with experts, ask questions in real time, and build production AI systems.
                    </p>

                    {/* 3 Concise Benefits */}
                    <div className="space-y-2.5 mb-5 pb-5 border-b border-amber-500/20">
                      {[
                        "Interactive Instructor Sessions",
                        "Real-Time Live Debugging & Q&A",
                        "Hands-On Capstone Deployments"
                      ].map((benefit, i) => (
                        <div key={i} className="flex items-center gap-2.5 text-xs sm:text-sm font-semibold text-slate-200">
                          <div className="w-5 h-5 rounded-full bg-amber-500/20 border border-amber-400/50 flex items-center justify-center text-amber-300 shrink-0 shadow-xs">
                            <Check className="w-3 h-3 stroke-[3]" />
                          </div>
                          <span>{benefit}</span>
                        </div>
                      ))}
                    </div>

                    {/* Next Class Schedule Bar */}
                    <div className="p-3.5 rounded-2xl bg-[#2e1217]/80 border border-amber-500/30 mb-5 flex items-center justify-between gap-3 group-hover:border-amber-400/60 transition-colors shadow-inner">
                      <div>
                        <span className="text-[10px] font-black text-amber-300/80 uppercase tracking-widest block">Next Live Session</span>
                        <span className="text-xs sm:text-sm font-extrabold text-white flex items-center gap-1.5 mt-0.5">
                          <Calendar className="w-3.5 h-3.5 text-amber-400 shrink-0" /> Aug 18 · AI Engineering
                        </span>
                      </div>
                      <span className="text-[10px] font-black text-amber-300 bg-amber-500/25 px-2.5 py-1 rounded-full border border-amber-400/40 whitespace-nowrap shadow-xs">
                        Filling Fast
                      </span>
                    </div>
                  </div>

                  {/* Primary Flame CTA Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push("/courses?type=live");
                    }}
                    className="w-full py-3 px-5 rounded-2xl bg-gradient-to-r from-amber-400 via-orange-500 to-rose-600 hover:from-amber-300 hover:to-rose-500 text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-xl shadow-orange-600/40 hover:shadow-orange-500/60 transition-all group-hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                  >
                    <span>Explore Live Training</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
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
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-500/15 border border-purple-200 dark:border-purple-500/30 flex items-center justify-center text-purple-700 dark:text-purple-400 shadow-sm">
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
            <div className="flex items-center gap-1.5 p-1 bg-card/90 rounded-full border border-border self-start sm:self-auto">
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
            <div className="w-full lg:w-64 bg-card/80 backdrop-blur-xl border border-border rounded-3xl p-5 shadow-sm dark:shadow-xl shrink-0">
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-border">
                <span className="text-xs font-black text-text uppercase tracking-wider flex items-center gap-1.5">
                  <Filter className="w-3.5 h-3.5 text-purple-700 dark:text-purple-400" /> Filters
                </span>
                {(selectedTimeframe !== null || selectedClassTypes.length > 0 || selectedInstructor !== null || liveCategory !== "All") && (
                  <button
                    onClick={() => {
                      setSelectedTimeframe(null);
                      setSelectedClassTypes([]);
                      setSelectedInstructor(null);
                      setLiveCategory("All");
                    }}
                    className="text-[11px] font-bold text-purple-700 dark:text-purple-400 hover:underline cursor-pointer"
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
                    { label: "Next 7 Days", days: 7, count: filterCounts.next7 },
                    { label: "Next 30 Days", days: 30, count: filterCounts.next30 },
                    { label: "Next 60 Days", days: 60, count: filterCounts.next60 }
                  ].map((tf) => (
                    <label
                      key={tf.days}
                      className="flex items-center justify-between text-xs font-semibold text-text cursor-pointer hover:text-purple-700 dark:hover:text-purple-400 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={selectedTimeframe === tf.days}
                          onChange={() => setSelectedTimeframe(selectedTimeframe === tf.days ? null : tf.days)}
                          className="w-4 h-4 rounded border-border bg-background text-purple-600 focus:ring-purple-500 accent-purple-600 cursor-pointer"
                        />
                        <span>{tf.label}</span>
                      </div>
                      <span className="text-[10px] font-bold text-subtext bg-background px-2 py-0.5 rounded-full border border-border">
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
                    { label: "Live Class", type: "Live Class", count: filterCounts.liveClass },
                    { label: "Full Bootcamp", type: "Full Bootcamp", count: filterCounts.bootcamp },
                    { label: "Workshop", type: "Workshop", count: filterCounts.workshop }
                  ].map((ct) => {
                    const isChecked = selectedClassTypes.includes(ct.type);
                    return (
                      <label
                        key={ct.type}
                        className="flex items-center justify-between text-xs font-semibold text-text cursor-pointer hover:text-purple-700 dark:hover:text-purple-400 transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => toggleClassType(ct.type)}
                            className="w-4 h-4 rounded border-border bg-background text-purple-600 focus:ring-purple-500 accent-purple-600 cursor-pointer"
                          />
                          <span>{ct.label}</span>
                        </div>
                        <span className="text-[10px] font-bold text-subtext bg-background px-2 py-0.5 rounded-full border border-border">
                          {ct.count}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Request Batch CTA */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-50 via-card to-background dark:from-purple-950/40 border border-purple-200 dark:border-purple-500/30 text-center">
                <h5 className="text-xs font-bold text-text mb-1">Can't find the right batch?</h5>
                <p className="text-[11px] text-subtext mb-3">Request a batch for your preferred timezone or schedule.</p>
                <button
                  onClick={() => router.push("/signup")}
                  className="w-full py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold text-xs shadow-md shadow-purple-600/20 transition-all cursor-pointer"
                >
                  Request Batch
                </button>
              </div>
            </div>

            {/* RIGHT MAIN CARDS CONTAINER */}
            <div className="flex-1 w-full space-y-5">
              {filteredLive.length === 0 ? (
                <div className="w-full py-16 px-8 rounded-3xl border border-border bg-card/40 backdrop-blur-md flex flex-col items-center justify-center text-center">
                  <Calendar className="w-10 h-10 text-purple-700 dark:text-purple-400 mb-3" />
                  <h4 className="text-xl font-black text-text mb-1">No matching live batches</h4>
                  <p className="text-xs text-subtext mb-4">Try clearing your active filters to see all available classes.</p>
                  <button
                    onClick={() => {
                      setSelectedTimeframe(null);
                      setSelectedClassTypes([]);
                      setSelectedInstructor(null);
                      setLiveCategory("All");
                    }}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-purple-600/20 cursor-pointer"
                  >
                    Reset All Filters
                  </button>
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
                      className="bg-card/90 backdrop-blur-xl border border-border hover:border-purple-400 dark:hover:border-purple-500/40 rounded-3xl p-5 md:p-6 shadow-sm dark:shadow-xl transition-all group relative cursor-pointer overflow-hidden flex flex-col md:flex-row gap-6 items-stretch"
                    >
                      {/* Left: Course Image Thumbnail */}
                      <div className="w-full md:w-64 h-48 md:h-auto rounded-2xl overflow-hidden relative shrink-0 border border-border bg-background min-h-[160px]">
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
                          <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                            <span className="text-xs font-black text-purple-700 dark:text-purple-400 uppercase tracking-widest">
                              {item.category}
                            </span>
                            {item.registrationWindow && (
                              <span className={`px-2.5 py-0.5 rounded-full border text-[11px] font-black uppercase tracking-wider flex items-center gap-1.5 shadow-xs ${item.registrationWindow.badgeColor}`}>
                                <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                                {item.registrationWindow.label}
                              </span>
                            )}
                          </div>

                          <h3 className="text-xl md:text-2xl font-black text-text mb-2 group-hover:text-primary transition-colors leading-snug">
                            {item.title}
                          </h3>

                          <p className="text-xs md:text-sm font-medium text-subtext leading-relaxed line-clamp-2 mb-3">
                            {item.description}
                          </p>

                          {/* Live Registration Window Bar */}
                          {item.registrationWindow && (
                            <div className="p-2.5 rounded-2xl bg-purple-50/70 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-500/20 mb-3.5 flex flex-wrap items-center justify-between gap-2 text-xs">
                              <div className="flex items-center gap-2">
                                <Clock className="w-3.5 h-3.5 text-purple-700 dark:text-purple-400 shrink-0" />
                                <span className="text-subtext font-semibold">Registration:</span>
                                <span className="font-bold text-text">{item.registrationWindow.fullWindowFormatted}</span>
                              </div>
                              <span className="text-[10px] font-black uppercase tracking-wider text-purple-700 dark:text-purple-300 bg-purple-100/70 dark:bg-purple-500/15 px-2 py-0.5 rounded-md border border-purple-200 dark:border-purple-500/25">
                                {item.registrationWindow.countdownText}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Metadata Chips */}
                        <div className="flex flex-wrap items-center gap-2 mt-auto">
                          <span className="px-3 py-1 rounded-md bg-purple-50 text-purple-700 border border-purple-200 dark:bg-purple-500/10 dark:text-purple-300 dark:border-purple-500/20 text-xs font-bold">
                            {item.level}
                          </span>
                          {item.tags.map((tag, tIdx) => (
                            <span
                              key={tIdx}
                              className={`px-3 py-1 rounded-md text-xs font-bold border ${
                                tIdx % 2 === 0
                                  ? "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-500/10 dark:text-indigo-300 dark:border-indigo-500/20"
                                  : "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/20"
                              }`}
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Right: Schedule, Seats & CTA */}
                      <div className="w-full md:w-64 border-t md:border-t-0 md:border-l border-border pt-4 md:pt-0 md:pl-6 flex flex-col justify-between shrink-0">
                        {/* Schedule details */}
                        <div className="space-y-2 mb-4">
                          <div className="flex items-start gap-2.5 text-xs font-bold text-text">
                            <Calendar className="w-4 h-4 text-purple-700 dark:text-purple-400 shrink-0 mt-0.5" />
                            <div>
                              <div>{item.schedule.dateFormatted}</div>
                              <div className="text-subtext text-[11px] font-normal mt-0.5">{item.schedule.daysPattern}</div>
                            </div>
                          </div>

                          <div className="flex items-start gap-2.5 text-xs font-bold text-text">
                            <Clock className="w-4 h-4 text-purple-700 dark:text-purple-400 shrink-0 mt-0.5" />
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
                              <Users className="w-3.5 h-3.5 text-purple-700 dark:text-purple-400" />
                              <span>{item.seats.enrolled} / {item.seats.total} Enrolled</span>
                            </span>
                            <span className="text-purple-700 dark:text-purple-400 font-black">{percent}%</span>
                          </div>

                          <div className="w-full h-2 bg-background rounded-full overflow-hidden border border-border">
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
                                ? "bg-purple-50 text-purple-700 border-purple-300 dark:bg-purple-600/20 dark:text-purple-400 dark:border-purple-500/40"
                                : "bg-card border-border text-subtext hover:text-text hover:bg-card-hover"
                            }`}
                            title="Bookmark class"
                          >
                            <Bookmark className={`w-4 h-4 ${isBooked ? "fill-purple-700 dark:fill-purple-400 text-purple-700 dark:text-purple-400" : ""}`} />
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
          <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-5 rounded-3xl bg-card/60 border border-border backdrop-blur-md">
            <div className="flex items-center gap-3 p-2">
              <div className="w-10 h-10 rounded-2xl bg-purple-50 dark:bg-purple-500/10 border border-purple-200 dark:border-purple-500/20 flex items-center justify-center text-purple-700 dark:text-purple-400 shrink-0">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div>
                <h5 className="text-xs font-black text-text">Live Interaction</h5>
                <p className="text-[11px] text-subtext font-medium">Ask questions & get real-time answers</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-2">
              <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 flex items-center justify-center text-indigo-700 dark:text-indigo-400 shrink-0">
                <Code2 className="w-5 h-5" />
              </div>
              <div>
                <h5 className="text-xs font-black text-text">Hands-on Learning</h5>
                <p className="text-[11px] text-subtext font-medium">Code, build & solve problems live</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-2">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 flex items-center justify-center text-emerald-700 dark:text-emerald-400 shrink-0">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h5 className="text-xs font-black text-text">Expert Mentorship</h5>
                <p className="text-[11px] text-subtext font-medium">Learn from industry practitioners</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-2">
              <div className="w-10 h-10 rounded-2xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 flex items-center justify-center text-amber-700 dark:text-amber-400 shrink-0">
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
