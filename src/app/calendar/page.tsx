"use client";

import React, { useEffect, useState, useMemo } from "react";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Clock,
  Video,
  Users,
  Tv,
  CheckCircle2,
  AlertCircle,
  Plus,
  Search,
  Sparkles,
  ArrowRight,
  Filter,
  PlayCircle,
  CalendarCheck,
  X,
  Lock,
  Layers,
  GraduationCap,
  TrendingUp,
  Award,
  Check,
  Play,
  FileText,
  User,
  Share2,
  Download,
  Flame,
  Radio,
  BookOpen,
  ArrowUpRight,
  BarChart2,
  Maximize2,
  ExternalLink,
  Bell,
  FileDown,
  HelpCircle,
  CheckSquare,
  LogIn,
  FileCode2,
  Briefcase
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { StudentPortalLayout } from "@/components/student/StudentPortalLayout";

/* ═══════════════════════════════════════════════════════════════
   TYPES & INTERFACES
   ═══════════════════════════════════════════════════════════════ */

export interface LiveSessionAgendaItem {
  id: string;
  stepNumber: string;
  timeRange: string;
  title: string;
  description?: string;
}

export interface LiveSessionAttendance {
  status: "present" | "late" | "absent";
  timeAttended?: string; // e.g. "1h 28m / 1h 30m"
  joinedLateMinutes?: number;
}

export interface LiveCourseResourceItem {
  id: string;
  title: string;
  type: string;
  url: string;
  size?: string;
}

export interface LiveCourseSession {
  id: string;
  courseId: string;
  courseTitle: string;
  sessionNumber: number;
  sessionCode: string; // e.g. "Session 01"
  title: string;
  description: string;
  date: string; // YYYY-MM-DD
  startTime: string; // e.g. "10:00 AM"
  endTime: string; // e.g. "11:30 AM"
  duration: string; // e.g. "1h 30m"
  instructor: {
    name: string;
    title: string;
    avatar?: string;
  };
  batchName: string;
  status: "completed" | "live" | "upcoming" | "rescheduled";
  meetingLink: string;
  recordingUrl?: string;
  recordingStatus?: "available" | "processing";
  attendance?: LiveSessionAttendance;
  topics: string[];
  agenda: LiveSessionAgendaItem[];
  resources?: LiveCourseResourceItem[];
  homework?: Array<{ id?: string; title: string; description?: string; dueDate?: string }>;
  sessionAssignmentsList?: Array<{ id?: string; title: string; description?: string; dueDate?: string }>;
  hasVideo?: boolean;
  hasPdf?: boolean;
  hasQuiz?: boolean;
  hasAssignment?: boolean;
}

export interface SessionResourceDetails {
  hasVideo: boolean;
  hasPdf: boolean;
  hasQuiz: boolean;
  hasAssignment: boolean;
  hasAnyResource: boolean;
  resourceCount: number;
  description: string;
  labels: string[];
}

export function getSessionResourceDetails(session?: Partial<LiveCourseSession> | null): SessionResourceDetails {
  if (!session) {
    return {
      hasVideo: false,
      hasPdf: false,
      hasQuiz: false,
      hasAssignment: false,
      hasAnyResource: false,
      resourceCount: 0,
      description: "",
      labels: [],
    };
  }

  // 1. VIDEO
  const hasVideo = Boolean(
    session.hasVideo ||
    session.recordingUrl ||
    session.resources?.some((r) => {
      const type = (r.type || "").toUpperCase();
      const url = (r.url || "").toLowerCase();
      return (
        type === "VIDEO" ||
        type === "RECORDING" ||
        url.endsWith(".mp4") ||
        url.endsWith(".webm") ||
        url.includes("youtube.com") ||
        url.includes("youtu.be") ||
        url.includes("vimeo.com")
      );
    })
  );

  // 2. PDF
  const hasPdf = Boolean(
    session.hasPdf ||
    session.resources?.some((r) => {
      const type = (r.type || "").toUpperCase();
      const url = (r.url || "").toLowerCase();
      const title = (r.title || "").toLowerCase();
      return (
        type === "PDF" ||
        type === "DOCUMENT" ||
        type === "DOC" ||
        type === "SLIDES" ||
        url.endsWith(".pdf") ||
        title.endsWith(".pdf")
      );
    })
  );

  // 3. QUIZ
  const hasQuiz = Boolean(
    session.hasQuiz ||
    session.resources?.some((r) => (r.type || "").toUpperCase() === "QUIZ") ||
    session.homework?.some((h) => {
      const t = (h.title || "").toLowerCase();
      const d = (h.description || "").trim();
      return t.includes("quiz") || t.includes("knowledge check") || d.startsWith("[");
    })
  );

  // 4. ASSIGNMENT
  const hasAssignment = Boolean(
    session.hasAssignment ||
    (session.sessionAssignmentsList && session.sessionAssignmentsList.length > 0) ||
    session.resources?.some((r) => {
      const type = (r.type || "").toUpperCase();
      return (
        type === "ASSIGNMENT" ||
        type === "PROJECT" ||
        type === "CODE" ||
        type === "GITHUB" ||
        type === "ZIP" ||
        type === "DATASET"
      );
    }) ||
    session.homework?.some((h) => {
      const t = (h.title || "").toLowerCase();
      const d = (h.description || "").trim();
      return !t.includes("quiz") && !t.includes("knowledge check") && !d.startsWith("[");
    })
  );

  const labels: string[] = [];
  if (hasVideo) labels.push("recorded video lecture");
  if (hasPdf) labels.push("downloadable PDF slides");
  if (hasQuiz) labels.push("interactive quiz");
  if (hasAssignment) labels.push("assignment");

  const resourceCount = labels.length;
  const hasAnyResource = resourceCount > 0;
  const sessionTitle = session.title || "this session";

  let description = "";
  if (resourceCount === 0) {
    description = `Review completed session materials for ${sessionTitle}.`;
  } else {
    const lead = hasVideo ? "Access your" : "Access the";

    if (resourceCount === 1) {
      description = `${lead} ${labels[0]} for ${sessionTitle}.`;
    } else if (resourceCount === 2) {
      description = `${lead} ${labels[0]} and ${labels[1]} for ${sessionTitle}.`;
    } else {
      const allExceptLast = labels.slice(0, -1).join(", ");
      const last = labels[labels.length - 1];
      description = `${lead} ${allExceptLast}, and ${last} for ${sessionTitle}.`;
    }
  }

  return {
    hasVideo,
    hasPdf,
    hasQuiz,
    hasAssignment,
    hasAnyResource,
    resourceCount,
    description,
    labels,
  };
}

export interface LiveCourseProgram {
  id: string;
  title: string;
  tagline: string;
  description: string;
  badge: string;
  gradient: string;
  thumbnail: string;
  instructor: {
    name: string;
    title: string;
    avatar?: string;
  };
  sessions: LiveCourseSession[];
  notifications?: Array<{
    id: string;
    sessionId?: string;
    sessionNumber?: number;
    sessionCode?: string;
    title: string;
    message: string;
    isRead: boolean;
    createdAt: string;
  }>;
  unreadNotificationCount?: number;
}

/* ═══════════════════════════════════════════════════════════════
   DEFAULT LIVE COURSE DATA (Structured Course -> Sessions)
   ═══════════════════════════════════════════════════════════════ */

export default function LiveTrainingPage() {
  const router = useRouter();
  const [courses, setCourses] = useState<LiveCourseProgram[]>([]);
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState(() => new Date());
  const [joiningSessionId, setJoiningSessionId] = useState<string | null>(null);
  const [highlightedSessionId, setHighlightedSessionId] = useState<string | null>(null);
  const [notificationDropdownCourseId, setNotificationDropdownCourseId] = useState<string | null>(null);
  const [dismissedNotificationIds, setDismissedNotificationIds] = useState<Record<string, boolean>>({});

  // Auto-refresh real-time clock every 1 second to update live countdown and status
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    async function loadLiveTraining() {
      try {
        setLoading(true);
        const res = await fetch("/api/student/live-courses");
        if (res.ok) {
          const data = await res.json();
          setCourses(Array.isArray(data.courses) ? data.courses : []);
        } else {
          setCourses([]);
        }
      } catch (err) {
        console.error("Failed to load live courses:", err);
        setCourses([]);
      } finally {
        setLoading(false);
      }
    }
    loadLiveTraining();
  }, []);

  // Navigate to session with resources from notification click
  const navigateToSessionWithResources = (courseId: string, sessionId: string, sessionCode: string) => {
    setNotificationDropdownCourseId(null);
    setExpandedCourseId(courseId);
    setHighlightedSessionId(sessionId);

    // Scroll smoothly to target session card
    setTimeout(() => {
      const el = document.getElementById(`session-${sessionId}`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }, 150);

    // Toast feedback
    setReminderToast(
      `🔔 ${sessionCode}: Jumped directly to your pending Video, PDF & Quiz resources!`
    );
    setTimeout(() => setReminderToast(null), 4500);

    // Clear highlight after 6 seconds
    setTimeout(() => {
      setHighlightedSessionId((prev) => (prev === sessionId ? null : prev));
    }, 6000);
  };

  // Handle Course-Specific Notification Bell Click (Toggle dropdown popup)
  const handleCourseNotificationClick = (course: LiveCourseProgram) => {
    setNotificationDropdownCourseId((prev) => (prev === course.id ? null : course.id));
  };

  // Handle Joining Live Class (Navigate directly to live video classroom room identical to dashboard)
  const handleJoinLiveClass = (sessionId: string) => {
    router.push(`/live-classes/room/${sessionId}`);
  };

  // Helper: parse date and time strings into a Date object
  const parseDateTime = (dateStr: string, timeStr?: string): Date => {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return new Date();

    if (timeStr) {
      const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)?/i);
      if (match) {
        let hours = parseInt(match[1], 10);
        const minutes = parseInt(match[2], 10);
        const modifier = match[3]?.toUpperCase();
        if (modifier === "PM" && hours < 12) hours += 12;
        if (modifier === "AM" && hours === 12) hours = 0;
        d.setHours(hours, minutes, 0, 0);
      }
    }
    return d;
  };

  // Helper: parse duration strings like "120 min", "1h 30m", "90m", "2h", "15 min" into minutes
  const parseDurationToMinutes = (durationStr?: string | null): number => {
    if (!durationStr) return 90;
    const str = String(durationStr).toLowerCase().trim();
    const hourMatch = str.match(/(\d+(?:\.\d+)?)\s*(?:h|hr|hrs|hour|hours)/);
    const minMatch = str.match(/(\d+)\s*(?:m|min|mins|minute|minutes)/);

    if (hourMatch || minMatch) {
      const hours = hourMatch ? parseFloat(hourMatch[1]) : 0;
      const mins = minMatch ? parseInt(minMatch[1], 10) : 0;
      return Math.round(hours * 60 + mins);
    }

    const parsed = parseInt(str, 10);
    return !isNaN(parsed) && parsed > 0 ? parsed : 90;
  };

  // Helper: calculate session end time
  const getSessionEndTime = (start: Date, endTimeStr?: string, durationStr?: string): Date => {
    if (endTimeStr) {
      const end = new Date(start);
      const match = endTimeStr.match(/(\d+):(\d+)\s*(AM|PM)?/i);
      if (match) {
        let hours = parseInt(match[1], 10);
        const minutes = parseInt(match[2], 10);
        const modifier = match[3]?.toUpperCase();
        if (modifier === "PM" && hours < 12) hours += 12;
        if (modifier === "AM" && hours === 12) hours = 0;
        end.setHours(hours, minutes, 0, 0);
        if (end.getTime() > start.getTime()) return end;
      }
    }
    const durationMinutes = parseDurationToMinutes(durationStr);
    return new Date(start.getTime() + durationMinutes * 60 * 1000);
  };

  // Helper: dynamic relative countdown string
  const getRelativeStartsIn = (targetDate: Date, current: Date): string => {
    const diffMs = targetDate.getTime() - current.getTime();
    if (diffMs <= 0) return "Starts soon";

    const diffMinutes = Math.floor(diffMs / (60 * 1000));
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) {
      const remHours = diffHours % 24;
      return remHours > 0 ? `Starts in ${diffDays}d ${remHours}h` : `Starts in ${diffDays}d`;
    }
    if (diffHours > 0) {
      const remMinutes = diffMinutes % 60;
      return remMinutes > 0 ? `Starts in ${diffHours}h ${remMinutes}m` : `Starts in ${diffHours}h`;
    }
    return `Starts in ${diffMinutes}m`;
  };

  // Determine current/upcoming live-session block for a course
  const getCourseActiveSession = (course: LiveCourseProgram) => {
    const sessionsWithTime = course.sessions.map((s) => {
      const start = parseDateTime(s.date, s.startTime);
      const end = getSessionEndTime(start, s.endTime, s.duration);
      
      const isCompleted = s.status === "completed" || now.getTime() > end.getTime();
      const isLive =
        !isCompleted &&
        ((now.getTime() >= start.getTime() - 15 * 60 * 1000 && now.getTime() <= end.getTime()) ||
          s.status === "live");
      const isUpcoming =
        !isCompleted &&
        !isLive &&
        (start.getTime() > now.getTime() || s.status === "upcoming");

      return {
        session: s,
        start,
        end,
        isCompleted,
        isLive,
        isUpcoming,
      };
    });

    // 1. Priority 1: LIVE NOW (Active session)
    const liveItem = sessionsWithTime.find((item) => item.isLive);
    if (liveItem) {
      return {
        type: "LIVE" as const,
        session: liveItem.session,
        start: liveItem.start,
        end: liveItem.end,
      };
    }

    // 2. Priority 2: Nearest UPCOMING (Next scheduled session)
    const upcomingItems = sessionsWithTime
      .filter((item) => item.isUpcoming)
      .sort((a, b) => a.start.getTime() - b.start.getTime());

    if (upcomingItems.length > 0) {
      const nearest = upcomingItems[0];
      return {
        type: "UPCOMING" as const,
        session: nearest.session,
        start: nearest.start,
        end: nearest.end,
        relativeTime: getRelativeStartsIn(nearest.start, now),
      };
    }

    // 3. Priority 3: NONE
    return { type: "NONE" as const, session: null };
  };

  // Expanded Course in Accordion (Single course expanded or null - starts collapsed by default)
  const [expandedCourseId, setExpandedCourseId] = useState<string | null>(null);

  // Modal Detailed View for "View Sessions" (Deep Dive Modal)
  const [modalCourse, setModalCourse] = useState<LiveCourseProgram | null>(null);
  const [modalSessionFilter, setModalSessionFilter] = useState<"all" | "live" | "upcoming" | "completed">("all");

  // View Mode: Course View (Default) vs Calendar View
  const [primaryView, setPrimaryView] = useState<"course" | "calendar">("course");

  // Search and Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCourseFilter, setActiveCourseFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "live" | "upcoming" | "completed">("all");

  // Calendar Specific State
  const [calendarViewMode, setCalendarViewMode] = useState<"month" | "week" | "today" | "list">("week");
  const [currentDate, setCurrentDate] = useState(() => new Date("2026-08-04"));
  const [selectedDateStr, setSelectedDateStr] = useState<string>("2026-08-04");

  // Secondary Modals
  const [agendaModalSession, setAgendaModalSession] = useState<LiveCourseSession | null>(null);
  const [attendanceModalCourse, setAttendanceModalCourse] = useState<LiveCourseProgram | null>(null);
  const [recordingModalSession, setRecordingModalSession] = useState<LiveCourseSession | null>(null);
  const [pdfModalSession, setPdfModalSession] = useState<LiveCourseSession | null>(null);
  const [assignmentModalSession, setAssignmentModalSession] = useState<LiveCourseSession | null>(null);
  const [quizModalSession, setQuizModalSession] = useState<LiveCourseSession | null>(null);
  const [quizSelectedAnswers, setQuizSelectedAnswers] = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [isReminderModalOpen, setIsReminderModalOpen] = useState(false);
  const [reminderNote, setReminderNote] = useState("");
  const [reminderSessionId, setReminderSessionId] = useState<string>("");
  const [reminderToast, setReminderToast] = useState<string | null>(null);

  // Keyboard accessibility for modals
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setModalCourse(null);
        setAgendaModalSession(null);
        setAttendanceModalCourse(null);
        setRecordingModalSession(null);
        setPdfModalSession(null);
        setAssignmentModalSession(null);
        setQuizModalSession(null);
        setNotificationDropdownCourseId(null);
        setIsReminderModalOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Close notification popover when clicking outside
  useEffect(() => {
    const handleDocumentClick = () => {
      setNotificationDropdownCourseId(null);
    };
    if (notificationDropdownCourseId) {
      document.addEventListener("click", handleDocumentClick);
    }
    return () => {
      document.removeEventListener("click", handleDocumentClick);
    };
  }, [notificationDropdownCourseId]);

  // Compute stats helper
  const getCourseStats = (c: LiveCourseProgram) => {
    const total = c.sessions.length;
    const completedSessions = c.sessions.filter((s) => {
      const start = parseDateTime(s.date, s.startTime);
      const end = getSessionEndTime(start, s.endTime, s.duration);
      return s.status === "completed" || now.getTime() > end.getTime();
    });
    const completed = completedSessions.length;
    const liveNow = c.sessions.filter((s) => {
      const start = parseDateTime(s.date, s.startTime);
      const end = getSessionEndTime(start, s.endTime, s.duration);
      const isComp = s.status === "completed" || now.getTime() > end.getTime();
      return !isComp && (s.status === "live" || (now.getTime() >= start.getTime() - 15 * 60 * 1000 && now.getTime() <= end.getTime()));
    }).length;
    const upcoming = Math.max(0, total - completed - liveNow);

    // Only calculate attendance from completed sessions that have finished
    const presentCount = completedSessions.filter(
      (s) => s.attendance?.status === "present" || s.attendance?.status === "late"
    ).length;
    const attendancePercent = completed > 0
      ? Math.min(100, Math.round((presentCount / completed) * 100))
      : 100;
    const progressPercent = Math.min(100, Math.round((completed / Math.max(1, total)) * 100));
    const isLive = liveNow > 0;

    return {
      total,
      completed,
      liveNow,
      upcoming,
      presentCount,
      attendancePercent,
      progressPercent,
      isLive,
    };
  };

  // Check if any enrolled live program currently has an active / ongoing live session
  const totalLiveOngoing = useMemo(() => {
    return courses.reduce((acc, c) => acc + getCourseStats(c).liveNow, 0);
  }, [courses, now]);

  const hasLiveOngoing = totalLiveOngoing > 0;

  // Compute all sessions flat array for Calendar View & Search
  const allSessions: LiveCourseSession[] = useMemo(() => {
    return courses.flatMap((c) => c.sessions);
  }, [courses]);

  // Helper to compute course sorting metadata (Priority 1: LIVE, Priority 2: UPCOMING, Priority 3: NONE)
  const getCourseSortMeta = (course: LiveCourseProgram) => {
    const active = getCourseActiveSession(course);
    if (active.type === "LIVE" && active.session) {
      return {
        priority: 1, // PRIORITY 1: Currently LIVE course
        sortTime: active.start.getTime(),
        activeSession: active.session,
      };
    }
    if (active.type === "UPCOMING" && active.session) {
      return {
        priority: 2, // PRIORITY 2: Course with upcoming session
        sortTime: active.start.getTime(),
        activeSession: active.session,
      };
    }
    return {
      priority: 3, // PRIORITY 3: No live or upcoming sessions
      sortTime: Number.MAX_SAFE_INTEGER,
      activeSession: null,
    };
  };

  // Filtered and Sorted Courses: Dynamic Course-Level Sorting based on Real-Time Live Status
  const filteredCourses = useMemo(() => {
    // 1. Filter by search query first if provided
    let result = courses;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = courses.filter((c) => {
        const matchTitle = c.title.toLowerCase().includes(q);
        const matchDesc = c.description.toLowerCase().includes(q);
        const matchInstructor = c.instructor?.name?.toLowerCase().includes(q);
        const matchBatch = c.badge?.toLowerCase().includes(q);
        const matchSession = c.sessions.some(
          (s) =>
            s.title.toLowerCase().includes(q) ||
            s.topics.some((t) => t.toLowerCase().includes(q))
        );
        return matchTitle || matchDesc || matchInstructor || matchBatch || matchSession;
      });
    }

    // 2. Attach stable original index and metadata for deterministic multi-tiered sorting
    const indexed = result.map((course, originalIndex) => ({
      course,
      originalIndex,
      meta: getCourseSortMeta(course),
    }));

    // 3. Multi-tier sort:
    // Priority 1: LIVE NOW (earliest live start time first)
    // Priority 2: UPCOMING (nearest upcoming start time first in ASCENDING order)
    // Priority 3: NO UPCOMING / COMPLETED (stable deterministic original order)
    indexed.sort((a, b) => {
      // 1. Different Priority Tiers
      if (a.meta.priority !== b.meta.priority) {
        return a.meta.priority - b.meta.priority;
      }

      // 2. Within Priority 1 (LIVE): Earliest live session start time first
      if (a.meta.priority === 1) {
        if (a.meta.sortTime !== b.meta.sortTime) {
          return a.meta.sortTime - b.meta.sortTime;
        }
        return a.originalIndex - b.originalIndex;
      }

      // 3. Within Priority 2 (UPCOMING): Nearest upcoming session start time in ASCENDING order
      if (a.meta.priority === 2) {
        if (a.meta.sortTime !== b.meta.sortTime) {
          return a.meta.sortTime - b.meta.sortTime;
        }
        return a.originalIndex - b.originalIndex;
      }

      // 4. Within Priority 3 (NO UPCOMING): Preserve stable original order
      return a.originalIndex - b.originalIndex;
    });

    return indexed.map((item) => item.course);
  }, [courses, searchQuery, now]);

  // Filtered Sessions for Calendar View
  const filteredSessions = useMemo(() => {
    return allSessions.filter((s) => {
      if (activeCourseFilter !== "all" && s.courseId !== activeCourseFilter) return false;
      if (statusFilter === "live" && s.status !== "live") return false;
      if (statusFilter === "upcoming" && s.status !== "upcoming") return false;
      if (statusFilter === "completed" && s.status !== "completed") return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = s.title.toLowerCase().includes(q);
        const matchesCourse = s.courseTitle.toLowerCase().includes(q);
        const matchesInstructor = s.instructor.name.toLowerCase().includes(q);
        const matchesTopics = s.topics.some((t) => t.toLowerCase().includes(q));
        if (!matchesTitle && !matchesCourse && !matchesInstructor && !matchesTopics) {
          return false;
        }
      }
      return true;
    });
  }, [allSessions, activeCourseFilter, statusFilter, searchQuery]);

  const triggerReminder = (session: LiveCourseSession) => {
    setReminderSessionId(session.id);
    setIsReminderModalOpen(true);
  };

  const handleConfirmReminder = () => {
    setIsReminderModalOpen(false);
    setReminderToast("Live Class reminder scheduled! We'll notify you 15 minutes before the session starts.");
    setTimeout(() => setReminderToast(null), 4000);
  };

  /* ────────── Calendar Calculation Helpers ────────── */
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const monthName = currentDate.toLocaleString("en-US", { month: "long" });

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const calendarCells = useMemo(() => {
    const cells = [];
    for (let i = firstDayOfMonth - 1; i >= 0; i--) {
      const pDay = daysInPrevMonth - i;
      const pMonth = month === 0 ? 11 : month - 1;
      const pYear = month === 0 ? year - 1 : year;
      const dateStr = `${pYear}-${String(pMonth + 1).padStart(2, "0")}-${String(pDay).padStart(2, "0")}`;
      cells.push({ dayNum: pDay, dateStr, isCurrentMonth: false });
    }
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      cells.push({ dayNum: d, dateStr, isCurrentMonth: true });
    }
    const totalCells = cells.length;
    const needed = totalCells > 35 ? 42 : 35;
    for (let n = 1; n <= needed - totalCells; n++) {
      const nMonth = month === 11 ? 0 : month + 1;
      const nYear = month === 11 ? year + 1 : year;
      const dateStr = `${nYear}-${String(nMonth + 1).padStart(2, "0")}-${String(n).padStart(2, "0")}`;
      cells.push({ dayNum: n, dateStr, isCurrentMonth: false });
    }
    return cells;
  }, [year, month, firstDayOfMonth, daysInMonth, daysInPrevMonth]);

  const todayStr = "2026-08-04";

  const sessionsByDate = useMemo(() => {
    const map: Record<string, LiveCourseSession[]> = {};
    filteredSessions.forEach((s) => {
      if (!map[s.date]) map[s.date] = [];
      map[s.date].push(s);
    });
    return map;
  }, [filteredSessions]);

  const selectedDaySessions = useMemo(() => {
    return filteredSessions.filter((s) => s.date === selectedDateStr);
  }, [filteredSessions, selectedDateStr]);

  // Render a Single Session Card in the Vertical Connected Timeline
  const renderTimelineSessionCard = (session: LiveCourseSession) => {
    const start = parseDateTime(session.date, session.startTime);
    const end = getSessionEndTime(start, session.endTime, session.duration);
    const isCompleted = session.status === "completed" || now.getTime() > end.getTime();
    const isLive = !isCompleted && ((now.getTime() >= start.getTime() - 15 * 60 * 1000 && now.getTime() <= end.getTime()) || session.status === "live");
    const isUpcoming = !isCompleted && !isLive;
    const isHighlighted = highlightedSessionId === session.id;

    return (
      <div
        key={session.id}
        id={`session-${session.id}`}
        className={`relative group transition-all duration-500 rounded-2xl ${
          isHighlighted
            ? "ring-2 ring-purple-400 shadow-2xl shadow-purple-600/30 scale-[1.01] bg-purple-950/20"
            : ""
        }`}
      >
        {/* Timeline Node Icon Indicator */}
        <div
          className={`absolute -left-6 sm:-left-9 top-5 w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-black z-10 transition-all ${
            isLive
              ? "bg-red-600 text-white border-red-400 shadow-lg shadow-red-600/40 animate-pulse scale-110"
              : isHighlighted
              ? "bg-purple-600 text-white border-purple-300 shadow-lg shadow-purple-600/50 scale-110 animate-bounce"
              : isCompleted
              ? "bg-emerald-600 text-white border-emerald-400 shadow-md shadow-emerald-600/20"
              : "bg-[#151b2a] text-slate-400 border-white/[0.12]"
          }`}
        >
          {isHighlighted ? (
            <Sparkles className="w-4 h-4 text-white animate-spin" />
          ) : isCompleted ? (
            <Check className="w-4 h-4 text-white stroke-[2.5]" />
          ) : isLive ? (
            <Radio className="w-4 h-4 animate-spin text-white" />
          ) : (
            <span className="font-mono text-[11px] font-bold text-slate-300">
              {String(session.sessionNumber).padStart(2, "0")}
            </span>
          )}
        </div>

        {/* Session Card Surface */}
        <div
          className={`p-4 sm:p-4.5 rounded-2xl border transition-all duration-300 ${
            isHighlighted
              ? "bg-gradient-to-r from-purple-950/60 via-[#181228] to-[#0e1322] border-purple-400/80 shadow-2xl shadow-purple-500/20"
              : isLive
              ? "bg-gradient-to-r from-red-950/40 via-[#161220] to-[#0e1320] border-red-500/50 shadow-xl shadow-red-500/10 ring-1 ring-red-500/30"
              : isCompleted
              ? "bg-[#101524]/80 hover:bg-[#141b2e] border-white/[0.07] hover:border-emerald-500/40"
              : "bg-[#0f1422]/60 hover:bg-[#13192a] border-white/[0.06] hover:border-white/[0.12]"
          }`}
        >
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            {/* Left Details */}
            <div className="space-y-2 max-w-3xl">
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="text-[11px] font-mono font-black text-purple-400 uppercase tracking-wider">
                  {session.sessionCode}
                </span>
                <span className="text-white/20">•</span>

                {/* Focus / Highlight Badge */}
                {isHighlighted && (
                  <span className="px-2.5 py-0.5 rounded-md bg-purple-600 text-white text-[10px] font-black animate-pulse flex items-center gap-1 shadow-sm shadow-purple-600/40">
                    <Sparkles className="w-3 h-3 text-white" />
                    PENDING RESOURCES IN THIS SESSION
                  </span>
                )}

                {/* Status Badges */}
                {isCompleted && (
                  <span className="px-2.5 py-0.5 rounded-md bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[10px] font-extrabold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    COMPLETED
                  </span>
                )}
                {isLive && (
                  <span className="px-2.5 py-0.5 rounded-md bg-red-600 text-white text-[10px] font-black animate-pulse flex items-center gap-1 shadow-sm shadow-red-600/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                    LIVE NOW
                  </span>
                )}
                {isUpcoming && (
                  <span className="px-2.5 py-0.5 rounded-md bg-amber-500/15 text-amber-400 border border-amber-500/30 text-[10px] font-bold flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    UPCOMING
                  </span>
                )}

                {/* Attendance Indicator */}
                {session.attendance && (
                  <>
                    <span className="text-white/20">•</span>
                    {session.attendance.status === "present" && (
                      <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                        ✓ Present {session.attendance.timeAttended && `(${session.attendance.timeAttended})`}
                      </span>
                    )}
                    {session.attendance.status === "late" && (
                      <span className="text-xs font-bold text-amber-400 flex items-center gap-1">
                        ◷ Late (Joined {session.attendance.joinedLateMinutes}m late)
                      </span>
                    )}
                    {session.attendance.status === "absent" && (
                      <span className="text-xs font-bold text-rose-400 flex items-center gap-1">
                        × Absent
                      </span>
                    )}
                  </>
                )}
              </div>

              <h4 className="text-base sm:text-lg font-black text-white leading-snug">
                {session.title}
              </h4>

              <p className="text-xs text-slate-400 leading-relaxed">
                {session.description}
              </p>

              <div className="flex items-center gap-3.5 flex-wrap text-xs text-slate-400 pt-1">
                <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                  <CalendarIcon className="w-3.5 h-3.5 text-orange-400" />
                  {isLive ? "Today" : session.date} · {session.startTime} – {session.endTime}
                </span>
                <span>•</span>
                <span>Instructor: <strong className="text-slate-200">{session.instructor.name}</strong></span>
                <span>•</span>
                <span>Duration: {session.duration}</span>
              </div>

              {/* Topic Tags & Session Resources (Video, PDF, Quiz) Row */}
              <div className="flex items-center justify-between gap-3 flex-wrap pt-2 border-t border-white/[0.04]">
                {/* Topic Tags on the Left */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  {session.topics.map((t, ti) => (
                    <span
                      key={ti}
                      className="px-2.5 py-0.5 rounded-lg bg-white/[0.04] border border-white/[0.07] text-[10px] font-medium text-slate-400"
                    >
                      #{t}
                    </span>
                  ))}
                </div>

                {/* ── SESSION RESOURCES (VIDEO, PDF, QUIZ, ASSIGNMENT) SHOWN ONLY WHEN SESSION IS COMPLETED & RESOURCES EXIST ── */}
                {isCompleted && (() => {
                  const resDetails = getSessionResourceDetails(session);
                  if (!resDetails.hasAnyResource) return null;

                  return (
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-extrabold text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                        <BookOpen className="w-3 h-3 text-emerald-400" />
                        Session Resources:
                      </span>

                      {/* 1. Video Resource Pill */}
                      {resDetails.hasVideo && (
                        <button
                          type="button"
                          onClick={() => {
                            setRecordingModalSession(session);
                          }}
                          title="Watch Session Recording & Lecture Video"
                          className="px-2.5 py-1 rounded-lg bg-purple-500/15 hover:bg-purple-500/25 border border-purple-500/30 text-purple-300 hover:text-white text-[11px] font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs group"
                        >
                          <PlayCircle className="w-3.5 h-3.5 text-purple-400 group-hover:scale-110 transition-transform" />
                          <span>Video</span>
                        </button>
                      )}

                      {/* 2. PDF Resource Pill */}
                      {resDetails.hasPdf && (
                        <button
                          type="button"
                          onClick={() => {
                            setPdfModalSession(session);
                          }}
                          title="Download Session PDF Notes & Slides"
                          className="px-2.5 py-1 rounded-lg bg-blue-500/15 hover:bg-blue-500/25 border border-blue-500/30 text-blue-300 hover:text-white text-[11px] font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs group"
                        >
                          <FileText className="w-3.5 h-3.5 text-blue-400 group-hover:scale-110 transition-transform" />
                          <span>PDF</span>
                        </button>
                      )}

                      {/* 3. Quiz Resource Pill */}
                      {resDetails.hasQuiz && (
                        <button
                          type="button"
                          onClick={() => {
                            setQuizModalSession(session);
                            setQuizSelectedAnswers({});
                            setQuizSubmitted(false);
                          }}
                          title="Take Session Practice Quiz"
                          className="px-2.5 py-1 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 hover:text-white text-[11px] font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs group"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 group-hover:scale-110 transition-transform" />
                          <span>Quiz</span>
                        </button>
                      )}

                      {/* 4. Assignment Resource Pill */}
                      {resDetails.hasAssignment && (
                        <button
                          type="button"
                          onClick={() => {
                            setAssignmentModalSession(session);
                          }}
                          title="View Session Assignment & Hands-On Homework Brief"
                          className="px-2.5 py-1 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 hover:text-white text-[11px] font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs group"
                        >
                          <FileCode2 className="w-3.5 h-3.5 text-amber-400 group-hover:scale-110 transition-transform" />
                          <span>Assignment</span>
                        </button>
                      )}
                    </div>
                  );
                })()}
              </div>
            </div>

            {/* Right Action Buttons */}
            <div className="flex items-center gap-2.5 flex-wrap shrink-0 lg:flex-col lg:items-end">
              <button
                onClick={() => setAgendaModalSession(session)}
                className="px-3.5 py-2 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-slate-300 hover:text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5 text-purple-400" />
                <span>View Agenda</span>
              </button>

              {isLive && (
                <Link
                  href={`/live-classes/room/${session.id}`}
                  className="px-6 py-2.5 bg-red-600 hover:bg-red-500 text-white font-black text-xs rounded-xl shadow-lg shadow-red-600/30 flex items-center gap-2 transition-all hover:scale-105 cursor-pointer animate-pulse"
                >
                  <Video className="w-4 h-4" />
                  <span>Join Live Class Now →</span>
                </Link>
              )}

              {isCompleted && session.recordingUrl && (
                <button
                  onClick={() => setRecordingModalSession(session)}
                  className="px-4 py-2 bg-purple-600/15 hover:bg-purple-600/25 text-purple-300 border border-purple-500/30 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
                >
                  <PlayCircle className="w-3.5 h-3.5 text-purple-400" />
                  <span>Watch Recording</span>
                </button>
              )}

              {isCompleted && session.recordingStatus === "processing" && (
                <span className="text-[11px] text-slate-400 italic flex items-center gap-1">
                  <Clock className="w-3 h-3 text-amber-400 animate-spin" /> Recording processing...
                </span>
              )}

              {isUpcoming && (
                <button
                  onClick={() => triggerReminder(session)}
                  className="px-3.5 py-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Bell className="w-3.5 h-3.5 text-amber-400" />
                  <span>Set Reminder</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Helper: Format date string nicely (e.g. "Sep 28" or "Sep 28, 2025")
  const formatDisplayDate = (dateStr?: string) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const currentYear = new Date().getFullYear();
    const year = d.getFullYear();
    const monthDay = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    return year === currentYear ? monthDay : `${monthDay}, ${year}`;
  };

  // Helper: Format time left cleanly
  const formatTimeLeft = (targetDate: Date, current: Date): string => {
    const diffMs = targetDate.getTime() - current.getTime();
    if (diffMs <= 0) return "00s";

    const diffSec = Math.floor((diffMs / 1000) % 60);
    const diffMin = Math.floor((diffMs / (60 * 1000)) % 60);
    const diffHours = Math.floor(diffMs / (60 * 60 * 1000));
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) {
      const remHours = diffHours % 24;
      return remHours > 0 ? `${diffDays}d ${remHours}h` : `${diffDays}d`;
    }
    if (diffHours > 0) {
      return `${diffHours}h ${diffMin}m`;
    }
    if (diffMin > 0) {
      return `${diffMin}m ${String(diffSec).padStart(2, "0")}s`;
    }
    return `${diffSec}s`;
  };

  // Render Integrated Live Session Banner directly at the bottom inside each course card
  const renderCourseLiveSessionBanner = (course: LiveCourseProgram, isExpanded: boolean) => {
    const active = getCourseActiveSession(course);

    if (active.session) {
      const session = active.session;
      const formattedDate = formatDisplayDate(session.date);
      const cleanTime = session.startTime?.replace(/^0/, "") || session.startTime;
      const timeLeft = formatTimeLeft(active.start, now);

      return (
        <div className="w-full rounded-2xl p-4 sm:p-4.5 bg-[#0a0f22]/90 backdrop-blur-xl border border-white/[0.08] flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-lg shadow-black/40">
          {/* Left Side: Status Badge + Calendar Box + Session Info */}
          <div className="space-y-2.5 min-w-0">
            <div>
              {active.type === "LIVE" ? (
                <span className="px-3 py-0.5 rounded-full bg-gradient-to-r from-red-600 via-rose-600 to-red-500 text-white text-[10px] font-black uppercase tracking-wider inline-flex items-center gap-1.5 shadow-md shadow-red-600/40 border border-white/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                  LIVE NOW
                </span>
              ) : (
                <span className="px-3 py-0.5 rounded-full bg-[#1e1533] text-purple-300 border border-purple-500/40 text-[10px] font-black uppercase tracking-wider inline-flex items-center gap-1.5 shadow-xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
                  UPCOMING
                </span>
              )}
            </div>

            {/* Session details row with icon */}
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-11 h-11 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center shrink-0 shadow-inner">
                <CalendarIcon className="w-5 h-5 text-purple-300" />
              </div>

              <div className="space-y-0.5 min-w-0">
                <div className="text-[11px] font-semibold text-slate-400">
                  {session.sessionCode || `Session ${String(session.sessionNumber).padStart(2, "0")}`}
                </div>
                <h4 className="text-xs sm:text-sm font-bold text-white line-clamp-1">
                  {session.title}
                </h4>
                <div className="text-[11px] text-slate-400 flex items-center gap-1.5 flex-wrap">
                  <span className="text-slate-300 font-medium">{formattedDate}</span>
                  <span>•</span>
                  <span className="text-slate-300 font-medium">{cleanTime}</span>
                  <span>•</span>
                  {active.type === "LIVE" ? (
                    <span className="text-rose-400 font-bold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse" />
                      In Session
                    </span>
                  ) : (
                    <span className="text-purple-300 font-medium">
                      Time left <span className="font-mono text-white font-bold">{timeLeft}</span>
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Side: Join Button (Red when LIVE, Grey/Unclickable when UPCOMING) + View all sessions link */}
          <div className="flex flex-col items-start md:items-end justify-center shrink-0 space-y-1.5">
            {active.type === "LIVE" ? (
              <Link
                href={`/live-classes/room/${session.id}`}
                className="px-6 py-2.5 sm:px-7 sm:py-3 rounded-2xl bg-gradient-to-r from-red-600 via-rose-600 to-red-600 hover:from-red-500 hover:via-rose-500 hover:to-orange-500 text-white font-black text-sm flex items-center gap-2.5 shadow-xl shadow-red-600/40 hover:shadow-red-600/60 hover:scale-[1.03] active:scale-[0.98] transition-all cursor-pointer ring-1 ring-white/30 animate-pulse"
              >
                <Video className="w-4 h-4 text-white animate-pulse" />
                <span>Join Session</span>
                <ArrowRight className="w-4 h-4 text-white" />
              </Link>
            ) : (
              <button
                type="button"
                disabled
                title="Class has not started yet. Join button activates when the live session starts."
                className="px-6 py-2.5 sm:px-7 sm:py-3 rounded-2xl bg-white/[0.05] border border-white/[0.1] text-slate-400 font-bold text-sm flex items-center gap-2.5 cursor-not-allowed shadow-none select-none"
              >
                <Video className="w-4 h-4 text-slate-500" />
                <span>Join Session</span>
                <ArrowRight className="w-4 h-4 text-slate-500" />
              </button>
            )}

            <button
              type="button"
              onClick={() => setExpandedCourseId(isExpanded ? null : course.id)}
              className="text-xs text-slate-400 hover:text-white font-semibold flex items-center gap-1 transition-colors cursor-pointer group/link pt-1"
            >
              <span>{isExpanded ? "Hide all sessions" : "View all sessions"}</span>
              {isExpanded ? (
                <ChevronUp className="w-3.5 h-3.5 text-slate-400 group-hover/link:text-white transition-transform" />
              ) : (
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover/link:text-white transition-transform group-hover/link:translate-x-0.5" />
              )}
            </button>
          </div>
        </div>
      );
    }

    // Default: All sessions completed
    return (
      <div className="w-full rounded-2xl p-4 bg-[#0a0f22]/90 backdrop-blur-xl border border-white/[0.08] flex items-center justify-between gap-4 shadow-lg">
        <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>All sessions in this cohort are completed</span>
        </div>
        <button
          type="button"
          onClick={() => setExpandedCourseId(isExpanded ? null : course.id)}
          className="text-xs text-purple-300 hover:text-white font-bold flex items-center gap-1 cursor-pointer transition-colors"
        >
          <span>{isExpanded ? "Hide all sessions" : "View all sessions"}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  };

  return (
    <StudentPortalLayout>
      <div className="w-full min-h-screen py-8 px-4 sm:px-6 lg:px-10 max-w-[1600px] mx-auto text-slate-100 space-y-8">

        {/* Global Toast Notification */}
        <AnimatePresence>
          {reminderToast && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="fixed top-6 right-6 z-50 px-4 py-3 bg-emerald-600 text-white rounded-2xl shadow-2xl text-xs font-semibold flex items-center gap-2 border border-emerald-400/30"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{reminderToast}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ══════════════════════════════════════════════════════════
            1. PAGE HEADER & PRIMARY VIEW TOGGLE
            ══════════════════════════════════════════════════════════ */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-white/[0.07] pb-6">
          <div>
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-gradient-to-br from-purple-500/20 to-indigo-500/20 border border-purple-500/30 text-purple-400 shadow-sm">
                <Radio className="w-7 h-7 animate-pulse text-purple-400" />
              </div>
              <div>
                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                    Live <span className="bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">Training</span>
                  </h1>
                  {hasLiveOngoing && (
                    <span className="px-3 py-1 rounded-full bg-red-500/15 text-red-400 border border-red-500/30 text-xs font-black flex items-center gap-1.5 shadow-sm animate-in fade-in zoom-in-95 duration-200">
                      <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                      LIVE COHORTS {totalLiveOngoing > 1 ? `(${totalLiveOngoing})` : ""}
                    </span>
                  )}
                </div>
                <p className="text-slate-400 text-xs sm:text-sm mt-1 font-medium">
                  Follow your live courses, view upcoming sessions, track attendance, and access completed recordings.
                </p>
              </div>
            </div>
          </div>

          {/* Primary View Switcher: Course View (Default) vs Calendar View */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="bg-[#101626]/80 border border-white/[0.08] p-1.5 rounded-2xl flex items-center gap-1.5 shadow-sm">
              <button
                onClick={() => setPrimaryView("course")}
                className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
                  primaryView === "course"
                    ? "bg-purple-600 text-white shadow-md shadow-purple-600/30"
                    : "text-slate-400 hover:text-white hover:bg-white/[0.05]"
                }`}
              >
                <Layers className="w-4 h-4" />
                <span>Course View</span>
              </button>

              <button
                onClick={() => setPrimaryView("calendar")}
                className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
                  primaryView === "calendar"
                    ? "bg-orange-500 text-white shadow-md shadow-orange-500/30"
                    : "text-slate-400 hover:text-white hover:bg-white/[0.05]"
                }`}
              >
                <CalendarIcon className="w-4 h-4" />
                <span>Calendar View</span>
              </button>
            </div>

            <button
              onClick={() => {
                setReminderSessionId(allSessions.find(s => s.status === "upcoming")?.id || "");
                setIsReminderModalOpen(true);
              }}
              className="px-4 py-2.5 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-slate-300 hover:text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
            >
              <Plus className="w-4 h-4 text-orange-400" />
              <span>Add Reminder</span>
            </button>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════
            2. VIEW MODE A: ENROLLED LIVE TRAINING PROGRAMS (HORIZONTAL EXPANDABLE CARDS)
            ══════════════════════════════════════════════════════════ */}
        {primaryView === "course" && (
          <div className="space-y-7 animate-in fade-in duration-300">

            {/* Section Header & Interactive Search */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg sm:text-xl font-black text-white flex items-center gap-2.5">
                  <GraduationCap className="w-5 h-5 text-purple-400" />
                  <span>Enrolled Live Training Programs ({filteredCourses.length})</span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Select any course below to view its complete session series, live room, and recordings.
                </p>
              </div>

              {/* Functional Search Field */}
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search courses, instructors, topics..."
                  className="w-full bg-[#0e1424]/80 border border-white/[0.08] rounded-xl pl-10 pr-8 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-500/60 transition-colors"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* List of Horizontal Expandable Cards */}
            {filteredCourses.length === 0 ? (
              <div className="py-16 text-center space-y-3 rounded-3xl bg-[#0e1322]/50 border border-dashed border-white/[0.08]">
                <BookOpen className="w-8 h-8 text-slate-500 mx-auto" />
                <p className="text-sm font-bold text-slate-300">No matching live training programs found</p>
                <p className="text-xs text-slate-500">Try adjusting your search keywords.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {filteredCourses.map((course) => {
                  const stats = getCourseStats(course);
                  const isExpanded = expandedCourseId === course.id;

                  return (
                    <div
                      key={course.id}
                      className={`rounded-3xl bg-gradient-to-b from-[#0f1527]/95 via-[#0b0f1d]/95 to-[#070a14]/95 backdrop-blur-2xl border transition-all duration-300 shadow-2xl relative overflow-hidden group ${
                        notificationDropdownCourseId === course.id
                          ? "z-30 overflow-visible"
                          : isExpanded
                          ? "z-20 overflow-visible"
                          : "z-10 overflow-visible"
                      } ${
                        stats.isLive
                          ? "border-rose-500/40 shadow-[0_0_40px_-5px_rgba(244,63,94,0.18)] ring-1 ring-rose-500/25"
                          : isExpanded
                          ? "border-purple-500/40 shadow-[0_0_40px_-5px_rgba(168,85,247,0.15)] ring-1 ring-purple-500/25"
                          : "border-white/[0.08] hover:border-purple-500/30 hover:shadow-2xl hover:shadow-purple-950/20"
                      }`}
                    >
                      {/* ── COURSE CARD BACKGROUND IMAGE LAYER WITH ATMOSPHERIC GLASS MESH OVERLAYS ── */}
                      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none rounded-3xl">
                        {/* eslint-disable-next-html-element-suppression */}
                        <img
                          src={course.thumbnail || "/images/courses/generative-ai.png"}
                          alt=""
                          className="w-full h-full object-cover object-center opacity-20 sm:opacity-25 group-hover:opacity-35 group-hover:scale-105 transition-all duration-700 ease-out filter contrast-125 saturate-125"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "/images/course_dark_bg.jpg";
                          }}
                        />
                        {/* Atmospheric gradient shadows for high contrast & supreme readability */}
                        <div className="absolute inset-0 bg-gradient-to-r from-[#070b18]/95 via-[#0a0f24]/90 to-[#070b18]/80" />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#050814] via-transparent to-[#0a0f24]/75" />
                        <div className="absolute inset-0 bg-[#070b18]/40 backdrop-blur-[2px]" />
                      </div>

                      {/* Top Ambient Glow Highlights & Fluid Aurora Mesh Wave */}
                      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.15] to-transparent pointer-events-none z-1" />
                      <div className="absolute -right-20 -top-20 w-[550px] h-[380px] bg-gradient-to-bl from-purple-600/25 via-indigo-600/15 to-transparent rounded-full blur-3xl pointer-events-none z-1" />
                      <div className="absolute right-10 top-1/2 -translate-y-1/2 w-80 h-80 bg-fuchsia-600/10 rounded-full blur-3xl pointer-events-none z-1" />
                      {stats.isLive && (
                        <div className="absolute -top-32 -left-32 w-80 h-80 bg-rose-500/10 rounded-full blur-3xl pointer-events-none z-1" />
                      )}

                      <div className="p-5 sm:p-6 space-y-4 relative z-10">
                        {/* ── TOP SECTION: COURSE INFO (LEFT) + BADGES & STATS (RIGHT) ── */}
                        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
                          {/* Left Column: Course Thumbnail Image + Tagline, Title, Description, Instructor */}
                          <div className="flex flex-col sm:flex-row sm:items-start gap-6 sm:gap-8 md:gap-9 max-w-4xl flex-1">
                            {/* Course Visual Thumbnail Card (Rectangular Aspect Ratio) */}
                            <div
                              onClick={() => setExpandedCourseId(isExpanded ? null : course.id)}
                              className="w-36 h-24 sm:w-48 sm:h-32 md:w-56 md:h-36 lg:w-60 lg:h-38 rounded-2xl overflow-hidden bg-[#141b33] border border-white/[0.16] shadow-2xl shrink-0 group-hover:border-purple-500/60 group-hover:scale-105 transition-all duration-300 relative cursor-pointer ring-1 ring-white/10 group-hover:ring-purple-500/40"
                            >
                              {/* eslint-disable-next-html-element-suppression */}
                              <img
                                src={course.thumbnail || "/images/courses/generative-ai.png"}
                                alt={course.title}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = "/images/course_dark_bg.jpg";
                                }}
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent pointer-events-none" />
                              <span className="absolute bottom-2 left-2 px-2.5 py-0.5 rounded-lg bg-black/70 backdrop-blur-md text-[9px] font-black text-purple-300 border border-purple-400/30 uppercase tracking-wider shadow-sm">
                                Live
                              </span>
                            </div>

                            {/* Text Info */}
                            <div className="space-y-2 sm:space-y-2.5 flex-1 min-w-0 sm:pl-2">
                              <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-widest text-purple-400 block truncate">
                                {course.tagline || course.badge || "MASTER ADVANCED GENERATIVE AI ENGINEERING"}
                              </span>

                              <h3
                                onClick={() => setExpandedCourseId(isExpanded ? null : course.id)}
                                className="text-lg sm:text-xl md:text-2xl font-black text-white hover:text-purple-300 transition-colors cursor-pointer leading-tight tracking-tight"
                              >
                                {course.title}
                              </h3>

                              <p className="text-xs sm:text-sm text-slate-300/85 line-clamp-2 leading-relaxed font-normal">
                                {course.description}
                              </p>

                              {/* Instructor Avatar & Title */}
                              <div className="flex items-center gap-2.5 pt-1">
                                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full overflow-hidden bg-purple-500/20 border border-white/20 shrink-0 shadow-sm ring-1 ring-purple-500/30">
                                  {/* eslint-disable-next-html-element-suppression */}
                                  <img
                                    src={course.instructor.avatar || "/images/avatars/instructor.png"}
                                    alt={course.instructor.name}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).src = "/images/avatars/instructor.png";
                                    }}
                                  />
                                </div>
                                <div className="flex items-center gap-1.5 flex-wrap text-xs">
                                  <span className="text-white font-bold">
                                    {course.instructor.name}
                                  </span>
                                  <span className="text-white/30">•</span>
                                  <span className="text-slate-400 font-medium truncate max-w-[300px]">
                                    {course.instructor.title}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Right Column: Badge + Notification Bell on Top, Vertical Stats Below */}
                          <div className="shrink-0 flex flex-col items-start lg:items-end gap-3.5">
                            {/* Badges & Notification Bell Row */}
                            <div className="flex items-center gap-2.5">
                              {/* Cohort Badge */}
                              <span className="px-3.5 py-1 rounded-full bg-[#2e1d5e]/90 text-purple-200 border border-purple-400/30 text-[10px] font-extrabold uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
                                <Users className="w-3 h-3 text-purple-300" />
                                <span>{course.badge || "MAIN COHORT"}</span>
                              </span>

                              {/* Bell Notification Popup */}
                              <div className={`relative ${notificationDropdownCourseId === course.id ? "z-50" : "z-20"}`}>
                                {(() => {
                                  const pendingSessions = course.sessions.filter(
                                    (s) =>
                                      s.status === "completed" &&
                                      !dismissedNotificationIds[`${course.id}-${s.id}`] &&
                                      getSessionResourceDetails(s).hasAnyResource
                                  );
                                  const count = pendingSessions.length;

                                  return (
                                    <>
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleCourseNotificationClick(course);
                                        }}
                                        aria-label={`Live session alerts for ${course.title}`}
                                        title={
                                          count > 0
                                            ? `🔔 You have ${count} pending session resources in ${course.title}!`
                                            : `Live session alerts for ${course.title}`
                                        }
                                        className={`relative p-2 rounded-full border transition-all duration-300 flex items-center justify-center cursor-pointer group shadow-sm ${
                                          notificationDropdownCourseId === course.id
                                            ? "bg-purple-600 text-white border-purple-300 shadow-xl shadow-purple-600/50"
                                            : count > 0
                                            ? "bg-[#281b4e] hover:bg-purple-900 border-purple-400 text-purple-200 shadow-md"
                                            : "bg-[#181b32]/80 hover:bg-purple-600/20 text-slate-300 hover:text-white border-white/[0.1] hover:border-purple-500/40"
                                        }`}
                                      >
                                        <Bell className="w-3.5 h-3.5 text-slate-300 group-hover:scale-110 transition-transform" />
                                        {count > 0 && (
                                          <span className="absolute -top-1 -right-1 min-w-[17px] h-[17px] px-1 text-[9px] font-black bg-purple-500 text-white rounded-full flex items-center justify-center shadow-md animate-pulse">
                                            {count}
                                          </span>
                                        )}
                                      </button>

                                      {/* Notification Dropdown / Popup */}
                                      <AnimatePresence>
                                        {notificationDropdownCourseId === course.id && (
                                          <motion.div
                                            initial={{ opacity: 0, y: 12, scale: 0.94 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: 10, scale: 0.94 }}
                                            transition={{ type: "spring", stiffness: 380, damping: 26 }}
                                            className="absolute right-0 top-full mt-2.5 w-84 sm:w-[410px] rounded-3xl bg-[#0b0f1a]/95 backdrop-blur-2xl border border-purple-500/30 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] shadow-purple-950/60 p-4 space-y-3.5 z-50 text-left ring-1 ring-white/[0.08] overflow-hidden"
                                            onClick={(e) => e.stopPropagation()}
                                          >
                                            {/* Top Ambient Glow */}
                                            <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-48 h-12 bg-gradient-to-b from-purple-500/25 to-transparent blur-2xl pointer-events-none" />

                                            {/* Popup Header */}
                                            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3 relative z-10">
                                              <div className="flex items-center gap-2.5">
                                                <div className="w-7 h-7 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center shadow-xs">
                                                  <Bell className="w-3.5 h-3.5 text-purple-300" />
                                                </div>
                                                <div>
                                                  <div className="flex items-center gap-2">
                                                    <h5 className="font-black text-xs text-white tracking-tight">
                                                      Course Notifications
                                                    </h5>
                                                    {count > 0 && (
                                                      <span className="px-2 py-0.5 rounded-full bg-gradient-to-r from-purple-500/20 to-indigo-500/20 text-purple-300 border border-purple-500/40 text-[9px] font-black tracking-wider uppercase">
                                                        {count} Pending
                                                      </span>
                                                    )}
                                                  </div>
                                                  <p className="text-[10px] text-slate-400 font-medium">
                                                    Completed session learning materials
                                                  </p>
                                                </div>
                                              </div>
                                              <button
                                                type="button"
                                                onClick={() => setNotificationDropdownCourseId(null)}
                                                className="p-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.1] text-slate-400 hover:text-white transition-all cursor-pointer border border-white/[0.06]"
                                              >
                                                <X className="w-3.5 h-3.5" />
                                              </button>
                                            </div>

                                            {/* Notifications List with Ultra-Sleek Custom Scrollbar */}
                                            <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1 relative z-10 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-white/[0.02] [&::-webkit-scrollbar-thumb]:bg-purple-500/40 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-purple-400">
                                              {pendingSessions.length > 0 ? (
                                                pendingSessions.map((s) => {
                                                  const resDetails = getSessionResourceDetails(s);
                                                  return (
                                                    <motion.div
                                                      key={s.id}
                                                      layout
                                                      initial={{ opacity: 0, scale: 0.95 }}
                                                      animate={{ opacity: 1, scale: 1 }}
                                                      exit={{ opacity: 0, scale: 0.9, height: 0 }}
                                                      whileHover={{ y: -2, scale: 1.01 }}
                                                      transition={{ type: "spring", stiffness: 400, damping: 25 }}
                                                      onClick={() =>
                                                        navigateToSessionWithResources(
                                                          course.id,
                                                          s.id,
                                                          s.sessionCode || `Session ${s.sessionNumber}`
                                                        )
                                                      }
                                                      className="relative p-3.5 rounded-2xl bg-gradient-to-br from-[#161d32]/95 via-[#111626]/90 to-[#0e1220]/95 hover:from-[#1b233c] hover:via-[#151c30] hover:to-[#111626] border border-white/[0.08] hover:border-purple-500/50 transition-all cursor-pointer group space-y-2 shadow-md hover:shadow-xl hover:shadow-purple-950/40 overflow-hidden"
                                                    >
                                                      {/* Corner Accent Glow on Hover */}
                                                      <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/10 rounded-full blur-xl pointer-events-none group-hover:bg-purple-500/20 transition-all" />

                                                      {/* Card Header: Session Badge + Delete Cross Button */}
                                                      <div className="flex items-center justify-between gap-2 relative z-10">
                                                        <span className="px-2.5 py-0.5 rounded-lg bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 text-white text-[9px] font-black uppercase tracking-wider flex items-center gap-1 shadow-sm border border-purple-400/30">
                                                          <Sparkles className="w-2.5 h-2.5 text-white" />
                                                          {s.sessionCode || `Session ${String(s.sessionNumber).padStart(2, "0")}`}
                                                        </span>

                                                        {/* Cross / Delete Notification Button */}
                                                        <button
                                                          type="button"
                                                          onClick={(e) => {
                                                            e.stopPropagation();
                                                            setDismissedNotificationIds((prev) => ({
                                                              ...prev,
                                                              [`${course.id}-${s.id}`]: true,
                                                            }));
                                                          }}
                                                          title="Delete this notification"
                                                          className="p-1 rounded-lg bg-white/[0.04] hover:bg-rose-500/20 text-slate-400 hover:text-rose-300 border border-white/[0.06] hover:border-rose-500/40 transition-all cursor-pointer group/del"
                                                        >
                                                          <X className="w-3.5 h-3.5 group-hover/del:scale-110 transition-transform" />
                                                        </button>
                                                      </div>

                                                      {/* Card Title */}
                                                      <h6 className="text-xs font-bold text-white group-hover:text-purple-300 transition-colors line-clamp-1 relative z-10 leading-snug">
                                                        You have pending resources in {s.sessionCode || `Session ${String(s.sessionNumber).padStart(2, "0")}`}!
                                                      </h6>

                                                      {/* Dynamic Card Description */}
                                                      <p className="text-[11px] text-slate-300 group-hover:text-slate-200 transition-colors line-clamp-2 leading-relaxed relative z-10">
                                                        {resDetails.description.includes(s.title) ? (
                                                          <>
                                                            {resDetails.description.split(s.title)[0]}
                                                            <span className="text-purple-200 font-semibold">{s.title}</span>
                                                            {resDetails.description.split(s.title)[1] || "."}
                                                          </>
                                                        ) : (
                                                          resDetails.description
                                                        )}
                                                      </p>

                                                      {/* Dynamic Resource Pills & Action Link */}
                                                      <div className="flex items-center justify-between pt-1 border-t border-white/[0.05] relative z-10">
                                                        <div className="flex items-center gap-1.5 flex-wrap">
                                                          {/* 1. Video Pill */}
                                                          {resDetails.hasVideo && (
                                                            <button
                                                              type="button"
                                                              onClick={(e) => {
                                                                e.stopPropagation();
                                                                setRecordingModalSession(s);
                                                              }}
                                                              title="Watch Recorded Video Lecture"
                                                              className="px-2 py-0.5 rounded-md bg-purple-500/20 hover:bg-purple-500/35 border border-purple-500/35 text-purple-300 hover:text-white text-[10px] font-bold flex items-center gap-1 shadow-xs transition-colors cursor-pointer"
                                                            >
                                                              <PlayCircle className="w-3 h-3 text-purple-400" />
                                                              <span>Video</span>
                                                            </button>
                                                          )}

                                                          {/* 2. PDF Pill */}
                                                          {resDetails.hasPdf && (
                                                            <button
                                                              type="button"
                                                              onClick={(e) => {
                                                                e.stopPropagation();
                                                                setPdfModalSession(s);
                                                              }}
                                                              title="Download PDF Slides"
                                                              className="px-2 py-0.5 rounded-md bg-blue-500/20 hover:bg-blue-500/35 border border-blue-500/35 text-blue-300 hover:text-white text-[10px] font-bold flex items-center gap-1 shadow-xs transition-colors cursor-pointer"
                                                            >
                                                              <FileText className="w-3 h-3 text-blue-400" />
                                                              <span>PDF</span>
                                                            </button>
                                                          )}

                                                          {/* 3. Quiz Pill */}
                                                          {resDetails.hasQuiz && (
                                                            <button
                                                              type="button"
                                                              onClick={(e) => {
                                                                e.stopPropagation();
                                                                setQuizModalSession(s);
                                                                setQuizSelectedAnswers({});
                                                                setQuizSubmitted(false);
                                                              }}
                                                              title="Take Interactive Quiz"
                                                              className="px-2 py-0.5 rounded-md bg-emerald-500/20 hover:bg-emerald-500/35 border border-emerald-500/35 text-emerald-300 hover:text-white text-[10px] font-bold flex items-center gap-1 shadow-xs transition-colors cursor-pointer"
                                                            >
                                                              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                                                              <span>Quiz</span>
                                                            </button>
                                                          )}

                                                          {/* 4. Assignment Pill */}
                                                          {resDetails.hasAssignment && (
                                                            <button
                                                              type="button"
                                                              onClick={(e) => {
                                                                e.stopPropagation();
                                                                setAssignmentModalSession(s);
                                                              }}
                                                              title="View Assignment"
                                                              className="px-2 py-0.5 rounded-md bg-amber-500/20 hover:bg-amber-500/35 border border-amber-500/35 text-amber-300 hover:text-white text-[10px] font-bold flex items-center gap-1 shadow-xs transition-colors cursor-pointer"
                                                            >
                                                              <FileCode2 className="w-3 h-3 text-amber-400" />
                                                              <span>Assignment</span>
                                                            </button>
                                                          )}
                                                        </div>

                                                        <span className="text-purple-400 group-hover:text-purple-300 text-[11px] font-black flex items-center gap-0.5 transition-transform group-hover:translate-x-1 shrink-0 ml-2">
                                                          <span>Go to session</span>
                                                          <ArrowRight className="w-3.5 h-3.5" />
                                                        </span>
                                                      </div>
                                                    </motion.div>
                                                  );
                                                })
                                              ) : (
                                                /* Empty State when all notifications are cleared or none available */
                                                <div className="p-6 text-center space-y-2 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
                                                  <CheckCircle2 className="w-6 h-6 text-emerald-400 mx-auto" />
                                                  <p className="text-xs font-bold text-white">All caught up!</p>
                                                  <p className="text-[11px] text-slate-400">
                                                    No pending learning materials or unread session alerts.
                                                  </p>
                                                </div>
                                              )}
                                            </div>
                                          </motion.div>
                                        )}
                                      </AnimatePresence>
                                    </>
                                  );
                                })()}
                              </div>
                            </div>

                            {/* 3-Row Vertical Stats List */}
                            <div className="space-y-2 text-right flex flex-col items-start lg:items-end">
                              {/* 1. Total Sessions */}
                              <div className="flex items-center gap-2 text-xs">
                                <BookOpen className="w-4 h-4 text-purple-400 shrink-0" />
                                <span className="text-white font-bold text-sm">{stats.total}</span>
                                <span className="text-slate-400 font-normal text-xs">Total Sessions</span>
                              </div>

                              {/* 2. Total Sessions Completed */}
                              <div className="flex items-center gap-2 text-xs">
                                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                                <span className="text-white font-bold text-sm">{stats.completed}</span>
                                <span className="text-slate-400 font-normal text-xs">Total Sessions Completed</span>
                              </div>

                              {/* 3. Attendance */}
                              <div className="flex items-center gap-2 text-xs">
                                <BarChart2 className="w-4 h-4 text-cyan-400 shrink-0" />
                                <span className="text-white font-bold text-sm">{stats.attendancePercent}%</span>
                                <span className="text-slate-400 font-normal text-xs">Attendance</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* ── BOTTOM SECTION: LIVE / UPCOMING SESSION BANNER + JOIN BUTTON ── */}
                        {renderCourseLiveSessionBanner(course, isExpanded)}
                      </div>

                      {/* ── EXPANDED LIVE-SESSION TIMELINE (DIRECTLY INSIDE ACCORDION CARD) ── */}
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.28, ease: "easeInOut" }}
                            className="border-t border-white/[0.08] bg-[#090d18]/90 p-4 sm:p-5 space-y-4"
                          >
                            <div className="flex items-center justify-between border-b border-white/[0.06] pb-2.5 flex-wrap gap-2">
                              <div className="flex items-center gap-2">
                                <Layers className="w-4 h-4 text-purple-400" />
                                <h4 className="text-xs sm:text-sm font-black text-white">
                                  Course Live Session Series ({course.sessions.length} Sessions)
                                </h4>
                              </div>
                              <span className="text-[11px] text-slate-400 font-medium">
                                Step-by-step live learning curriculum
                              </span>
                            </div>

                            {/* Vertical Connected Timeline */}
                            <div className="relative pl-6 sm:pl-9 space-y-3.5 before:absolute before:left-[15px] sm:before:left-[19px] before:top-4 before:bottom-4 before:w-0.5 before:bg-gradient-to-b before:from-emerald-500 before:via-purple-500 before:to-slate-700/50">
                              {course.sessions.map((session) => renderTimelineSessionCard(session))}
                            </div>

                            {/* Bottom Close / Dedicated Modal Trigger */}
                            <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between flex-wrap gap-3">
                              <button
                                onClick={() => setModalCourse(course)}
                                className="text-xs font-bold text-purple-400 hover:text-purple-300 flex items-center gap-1.5 cursor-pointer"
                              >
                                <Maximize2 className="w-3.5 h-3.5" />
                                <span>Open Full Dedicated Session Experience →</span>
                              </button>

                              <button
                                onClick={() => setExpandedCourseId(null)}
                                className="px-4 py-2 bg-white/[0.03] hover:bg-white/[0.07] text-slate-400 hover:text-white text-xs font-semibold rounded-xl cursor-pointer"
                              >
                                Collapse Course Timeline ↑
                              </button>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            )}

          </div>
        )}

        {/* ══════════════════════════════════════════════════════════
            3. VIEW MODE B: CALENDAR VIEW (PRESERVED)
            ══════════════════════════════════════════════════════════ */}
        {primaryView === "calendar" && (
          <div className="space-y-8 animate-in fade-in duration-300">

            {/* Filter Bar: Course Filter + Status + Search */}
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
              <div className="flex items-center gap-2.5 flex-wrap">
                {/* Course Filter Dropdown */}
                <div className="flex items-center gap-2 bg-[#0e1424]/80 border border-white/[0.08] rounded-xl px-3 py-1.5 text-xs font-bold text-white">
                  <Filter className="w-3.5 h-3.5 text-purple-400" />
                  <select
                    value={activeCourseFilter}
                    onChange={(e) => setActiveCourseFilter(e.target.value)}
                    className="bg-transparent text-white font-bold outline-none cursor-pointer text-xs"
                  >
                    <option value="all" className="bg-[#0c111e]">All Live Courses ({courses.length})</option>
                    {courses.map((c) => (
                      <option key={c.id} value={c.id} className="bg-[#0c111e]">
                        {c.title}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Status Segmented Buttons */}
                <div className="flex items-center gap-1 bg-[#0e1424]/80 border border-white/[0.08] p-1 rounded-xl text-xs font-bold">
                  {(["all", "live", "upcoming", "completed"] as const).map((st) => (
                    <button
                      key={st}
                      onClick={() => setStatusFilter(st)}
                      className={`px-3 py-1 rounded-lg capitalize transition-all cursor-pointer ${
                        statusFilter === st
                          ? st === "live"
                            ? "bg-red-600 text-white font-black"
                            : "bg-purple-600 text-white"
                          : "text-slate-400 hover:text-white"
                      }`}
                    >
                      {st === "live" ? "🔴 Live" : st}
                    </button>
                  ))}
                </div>
              </div>

              {/* Month Navigation */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentDate(new Date(year, month - 1, 1))}
                  className="p-2 rounded-xl bg-[#0e1424]/80 hover:bg-white/[0.08] border border-white/[0.08] text-slate-300 hover:text-white cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="font-extrabold text-sm text-white min-w-[130px] text-center font-mono">
                  {monthName} {year}
                </span>
                <button
                  onClick={() => setCurrentDate(new Date(year, month + 1, 1))}
                  className="p-2 rounded-xl bg-[#0e1424]/80 hover:bg-white/[0.08] border border-white/[0.08] text-slate-300 hover:text-white cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Calendar Grid + Selected Day Panel */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left 2 Cols: Monthly Calendar Grid */}
              <div className="lg:col-span-2 p-6 rounded-3xl bg-[#0c111e]/90 border border-white/[0.08] shadow-xl space-y-4">
                <div className="grid grid-cols-7 gap-1 text-center text-xs font-bold text-slate-400 pb-2 border-b border-white/[0.06]">
                  <span>SUN</span><span>MON</span><span>TUE</span><span>WED</span><span>THU</span><span>FRI</span><span>SAT</span>
                </div>

                <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
                  {calendarCells.map((cell, idx) => {
                    const hasSessions = (sessionsByDate[cell.dateStr] || []).length;
                    const isSelected = cell.dateStr === selectedDateStr;
                    const isToday = cell.dateStr === todayStr;
                    const liveInDay = (sessionsByDate[cell.dateStr] || []).some((s) => s.status === "live");

                    return (
                      <button
                        key={idx}
                        onClick={() => setSelectedDateStr(cell.dateStr)}
                        className={`min-h-[70px] sm:min-h-[85px] p-2 rounded-2xl border text-left transition-all flex flex-col justify-between cursor-pointer relative overflow-hidden ${
                          isSelected
                            ? "border-purple-500 bg-purple-600/20 shadow-md shadow-purple-500/20"
                            : isToday
                            ? "border-orange-500/50 bg-orange-500/10"
                            : cell.isCurrentMonth
                            ? "border-white/[0.04] bg-white/[0.02] hover:bg-white/[0.05]"
                            : "border-transparent text-slate-600 opacity-40"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className={`text-xs font-mono font-bold ${isSelected ? "text-purple-300" : isToday ? "text-orange-400 font-black" : "text-slate-300"}`}>
                            {cell.dayNum}
                          </span>
                          {liveInDay && (
                            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                          )}
                        </div>

                        {hasSessions > 0 && (
                          <div className="space-y-1">
                            <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-md truncate block ${
                              liveInDay
                                ? "bg-red-600 text-white animate-pulse"
                                : "bg-purple-500/20 text-purple-300"
                            }`}>
                              {hasSessions} {hasSessions === 1 ? "Class" : "Classes"}
                            </span>
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Right 1 Col: Day Schedule */}
              <div className="p-6 rounded-3xl bg-[#0c111e]/90 border border-white/[0.08] shadow-xl space-y-4">
                <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
                  <h3 className="font-extrabold text-sm text-white">
                    Schedule for {selectedDateStr}
                  </h3>
                  <span className="text-xs font-mono font-bold text-purple-400">
                    {selectedDaySessions.length} Events
                  </span>
                </div>

                {selectedDaySessions.length === 0 ? (
                  <div className="py-12 text-center text-xs text-slate-500 space-y-2">
                    <CalendarCheck className="w-7 h-7 mx-auto text-slate-600" />
                    <p>No live classes scheduled on this day.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {selectedDaySessions.map((session) => (
                      <div
                        key={session.id}
                        className={`p-4 rounded-2xl border space-y-2.5 ${
                          session.status === "live"
                            ? "bg-red-950/30 border-red-500/40 shadow-sm"
                            : session.status === "completed"
                            ? "bg-white/[0.02] border-emerald-500/20"
                            : "bg-white/[0.02] border-white/[0.06]"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[10px] font-black text-purple-400 uppercase">{session.sessionCode}</span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            session.status === "live" ? "bg-red-600 text-white" : session.status === "completed" ? "bg-emerald-500/20 text-emerald-300" : "bg-amber-500/20 text-amber-300"
                          }`}>
                            {session.status.toUpperCase()}
                          </span>
                        </div>

                        <h4 className="font-bold text-xs text-white leading-snug">{session.title}</h4>
                        <p className="text-[11px] text-slate-400 font-mono flex items-center gap-1">
                          <Clock className="w-3 h-3 text-orange-400" /> {session.startTime} – {session.endTime}
                        </p>

                        <div className="flex items-center justify-between pt-1 border-t border-white/[0.04]">
                          <button
                            onClick={() => setAgendaModalSession(session)}
                            className="text-[11px] font-bold text-purple-400 hover:underline cursor-pointer"
                          >
                            View Agenda
                          </button>
                          {session.status === "live" && (
                            <Link
                              href={`/live-classes/room/${session.id}`}
                              className="px-3 py-1 bg-red-600 hover:bg-red-500 text-white font-bold text-[11px] rounded-lg cursor-pointer flex items-center gap-1.5 transition-all shadow-sm"
                            >
                              <Video className="w-3 h-3" />
                              <span>Join Live Class</span>
                            </Link>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

          </div>
        )}

        {/* ══════════════════════════════════════════════════════════
            4. MODAL A: DEDICATED "VIEW SESSIONS" FULL-SCREEN MODAL
            ══════════════════════════════════════════════════════════ */}
        <AnimatePresence>
          {modalCourse && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-lg">
              <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                className="bg-[#0b101c] border border-white/[0.12] rounded-3xl max-w-5xl w-full max-h-[90vh] overflow-hidden shadow-2xl flex flex-col relative text-xs text-slate-200"
              >
                {/* Modal Header */}
                <div className="p-6 sm:p-7 border-b border-white/[0.08] bg-[#0e1424] space-y-4 shrink-0">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-md bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[10px] font-black uppercase tracking-wider">
                          {modalCourse.badge}
                        </span>
                        <span className="text-white/20">•</span>
                        <span className="text-xs text-slate-400 font-semibold">{modalCourse.tagline}</span>
                      </div>
                      <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
                        {modalCourse.title}
                      </h2>
                      <p className="text-xs text-slate-400 mt-0.5 max-w-2xl leading-relaxed">
                        {modalCourse.description}
                      </p>
                    </div>

                    <button
                      onClick={() => setModalCourse(null)}
                      className="p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-400 hover:text-white cursor-pointer"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Filter Pills inside Modal */}
                  <div className="flex items-center justify-between gap-3 flex-wrap pt-1">
                    {(() => {
                      const stats = getCourseStats(modalCourse);
                      return (
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs text-slate-400 font-bold">Filter Sessions:</span>
                          {(["all", "live", "upcoming", "completed"] as const).map((st) => (
                            <button
                              key={st}
                              onClick={() => setModalSessionFilter(st)}
                              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                modalSessionFilter === st
                                  ? st === "live"
                                    ? "bg-red-600 text-white font-black"
                                    : "bg-purple-600 text-white"
                                  : "bg-white/[0.04] text-slate-400 hover:text-white"
                              }`}
                            >
                              {st === "all"
                                ? `All (${stats.total})`
                                : st === "live"
                                ? `Live (${stats.liveNow})`
                                : st === "upcoming"
                                ? `Upcoming (${stats.upcoming})`
                                : `Completed (${stats.completed})`}
                            </button>
                          ))}
                        </div>
                      );
                    })()}

                    <button
                      onClick={() => {
                        const c = modalCourse;
                        setModalCourse(null);
                        setAttendanceModalCourse(c);
                      }}
                      className="text-xs text-purple-400 hover:text-purple-300 font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <BarChart2 className="w-3.5 h-3.5" />
                      <span>View Full Attendance Log</span>
                    </button>
                  </div>
                </div>

                {/* Modal Body: Scrollable Session Timeline */}
                <div className="p-6 sm:p-8 overflow-y-auto flex-1 space-y-6">
                  <div className="relative pl-6 sm:pl-9 space-y-6 before:absolute before:left-[15px] sm:before:left-[19px] before:top-4 before:bottom-4 before:w-0.5 before:bg-gradient-to-b before:from-emerald-500 before:via-purple-500 before:to-slate-700/50">
                    {modalCourse.sessions
                      .filter((s) => modalSessionFilter === "all" || s.status === modalSessionFilter)
                      .map((session) => renderTimelineSessionCard(session))}
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="p-4 border-t border-white/[0.08] bg-[#0e1424] flex items-center justify-between text-xs">
                  <span className="text-slate-400">
                    Instructor: <strong className="text-slate-200">{modalCourse.instructor.name}</strong>
                  </span>
                  <button
                    onClick={() => setModalCourse(null)}
                    className="px-5 py-2 bg-white/[0.06] hover:bg-white/[0.1] text-white font-bold rounded-xl cursor-pointer"
                  >
                    Close Modal
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* ══════════════════════════════════════════════════════════
            5. MODAL B: SESSION AGENDA MODAL
            ══════════════════════════════════════════════════════════ */}
        <AnimatePresence>
          {agendaModalSession && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-[#0e1322] border border-white/[0.12] rounded-3xl p-6 sm:p-8 max-w-2xl w-full max-h-[85vh] overflow-y-auto space-y-6 shadow-2xl relative"
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-4 border-b border-white/[0.08] pb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black text-purple-400 uppercase tracking-widest">
                        {agendaModalSession.courseTitle}
                      </span>
                      <span className="text-white/20">•</span>
                      <span className="text-[10px] font-bold text-slate-400 uppercase">
                        {agendaModalSession.sessionCode}
                      </span>
                    </div>
                    <h3 className="text-xl font-black text-white mt-1">
                      {agendaModalSession.title}
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {agendaModalSession.date} · {agendaModalSession.startTime} – {agendaModalSession.endTime} ({agendaModalSession.duration})
                    </p>
                  </div>

                  <button
                    onClick={() => setAgendaModalSession(null)}
                    className="p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-400 hover:text-white cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Topics Covered */}
                <div className="space-y-2">
                  <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Key Topics Covered</span>
                  <div className="flex items-center gap-2 flex-wrap">
                    {agendaModalSession.topics.map((t, idx) => (
                      <span key={idx} className="px-3 py-1 rounded-xl bg-purple-500/15 text-purple-300 border border-purple-500/30 text-xs font-bold">
                        #{t}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Timed Step-by-Step Agenda */}
                <div className="space-y-3">
                  <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Live Session Timed Schedule</span>
                  <div className="space-y-3">
                    {agendaModalSession.agenda.map((ag) => (
                      <div key={ag.id} className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] flex items-start gap-4">
                        <div className="w-10 h-10 rounded-xl bg-purple-500/15 text-purple-300 border border-purple-500/30 flex items-center justify-center font-black text-xs shrink-0">
                          {ag.stepNumber}
                        </div>
                        <div className="min-w-0 flex-1 space-y-0.5">
                          <div className="flex items-center justify-between gap-2">
                            <h5 className="font-extrabold text-sm text-white">{ag.title}</h5>
                            <span className="text-[11px] font-mono font-bold text-orange-400 shrink-0">{ag.timeRange}</span>
                          </div>
                          {ag.description && (
                            <p className="text-xs text-slate-400 leading-relaxed">{ag.description}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Instructor Info */}
                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-300 flex items-center justify-center font-bold">
                      <User className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-300">Session Instructor</p>
                      <p className="text-sm font-black text-purple-400">{agendaModalSession.instructor.name}</p>
                    </div>
                  </div>

                  {agendaModalSession.status === "live" && (
                    <a
                      href={agendaModalSession.meetingLink}
                      target="_blank"
                      rel="noreferrer"
                      className="px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white font-black text-xs rounded-xl shadow-lg shadow-red-600/30 flex items-center gap-2 cursor-pointer"
                    >
                      <Video className="w-4 h-4" />
                      <span>Join Live Class</span>
                    </a>
                  )}
                </div>

                {/* Modal Footer */}
                <div className="flex justify-end pt-2">
                  <button
                    onClick={() => setAgendaModalSession(null)}
                    className="px-6 py-2.5 bg-white/[0.06] hover:bg-white/[0.1] text-white font-bold text-xs rounded-xl cursor-pointer"
                  >
                    Close Agenda
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* ══════════════════════════════════════════════════════════
            6. MODAL C: ATTENDANCE RECORD MODAL
            ══════════════════════════════════════════════════════════ */}
        <AnimatePresence>
          {attendanceModalCourse && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-[#0e1322] border border-white/[0.12] rounded-3xl p-6 sm:p-8 max-w-2xl w-full max-h-[85vh] overflow-y-auto space-y-6 shadow-2xl relative text-xs"
              >
                <div className="flex items-start justify-between gap-4 border-b border-white/[0.08] pb-4">
                  <div>
                    <span className="text-[10px] font-black text-purple-400 uppercase tracking-widest">
                      Live Attendance Record
                    </span>
                    <h3 className="text-xl font-black text-white mt-1">
                      {attendanceModalCourse.title}
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Verified live class attendance history and session participation log.
                    </p>
                  </div>
                  <button
                    onClick={() => setAttendanceModalCourse(null)}
                    className="p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-400 hover:text-white cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Attendance Metric Bar */}
                {(() => {
                  const stats = getCourseStats(attendanceModalCourse);
                  return (
                    <div className="grid grid-cols-4 gap-3 p-4 bg-black/30 border border-white/[0.06] rounded-2xl text-center">
                      <div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase">Attendance</div>
                        <div className="text-xl font-black text-purple-400 font-mono">{stats.attendancePercent}%</div>
                      </div>
                      <div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase">Attended</div>
                        <div className="text-xl font-black text-emerald-400 font-mono">{stats.presentCount} / {stats.total}</div>
                      </div>
                      <div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase">Absent</div>
                        <div className="text-xl font-black text-rose-400 font-mono">0</div>
                      </div>
                      <div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase">Late</div>
                        <div className="text-xl font-black text-amber-400 font-mono">1</div>
                      </div>
                    </div>
                  );
                })()}

                {/* Session by Session Attendance List */}
                <div className="space-y-3">
                  <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Session Attendance Log</span>
                  <div className="space-y-2.5">
                    {attendanceModalCourse.sessions.map((s) => (
                      <div key={s.id} className="p-3.5 bg-white/[0.02] border border-white/[0.06] rounded-xl flex items-center justify-between gap-3 text-xs">
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="font-mono font-bold text-purple-400 shrink-0">{s.sessionCode}</span>
                          <div className="min-w-0">
                            <p className="font-bold text-white truncate">{s.title}</p>
                            <p className="text-[11px] text-slate-400">{s.date} · {s.duration}</p>
                          </div>
                        </div>

                        <div className="shrink-0 text-right">
                          {s.attendance?.status === "present" && (
                            <span className="px-2.5 py-1 rounded-lg bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-bold text-xs flex items-center gap-1">
                              ✓ Present {s.attendance.timeAttended && `(${s.attendance.timeAttended.split(" ")[0]})`}
                            </span>
                          )}
                          {s.attendance?.status === "late" && (
                            <span className="px-2.5 py-1 rounded-lg bg-amber-500/15 text-amber-400 border border-amber-500/30 font-bold text-xs">
                              ◷ Late ({s.attendance.joinedLateMinutes}m)
                            </span>
                          )}
                          {!s.attendance && (
                            <span className="px-2.5 py-1 rounded-lg bg-white/[0.03] text-slate-400 border border-white/[0.06] font-medium text-xs">
                              Upcoming
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    onClick={() => setAttendanceModalCourse(null)}
                    className="px-6 py-2.5 bg-white/[0.06] hover:bg-white/[0.1] text-white font-bold text-xs rounded-xl cursor-pointer"
                  >
                    Done
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* ══════════════════════════════════════════════════════════
            7. MODAL D: WATCH RECORDING PLAYER MODAL
            ══════════════════════════════════════════════════════════ */}
        <AnimatePresence>
          {recordingModalSession && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-[#0e1322] border border-white/[0.12] rounded-3xl p-6 sm:p-8 max-w-3xl w-full max-h-[90vh] overflow-y-auto space-y-6 shadow-2xl relative"
              >
                <div className="flex items-start justify-between gap-4 border-b border-white/[0.08] pb-4">
                  <div>
                    <span className="text-[10px] font-black text-purple-400 uppercase tracking-widest">
                      {recordingModalSession.courseTitle} • {recordingModalSession.sessionCode}
                    </span>
                    <h3 className="text-xl font-black text-white mt-1">
                      {recordingModalSession.title} (Recorded Session)
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Recorded on {recordingModalSession.date} with {recordingModalSession.instructor.name} ({recordingModalSession.duration})
                    </p>
                  </div>
                  <button
                    onClick={() => setRecordingModalSession(null)}
                    className="p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-400 hover:text-white cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Video Player Box */}
                {recordingModalSession.recordingUrl ? (
                  <div className="space-y-3">
                    <div className="w-full aspect-video rounded-2xl overflow-hidden bg-black border border-purple-500/30 relative flex items-center justify-center shadow-2xl">
                      <video
                        controls
                        autoPlay
                        preload="metadata"
                        className="w-full h-full object-contain"
                        src={recordingModalSession.recordingUrl}
                      >
                        Your browser does not support HTML5 video streaming.
                      </video>
                    </div>

                    <div className="flex items-center justify-between gap-3 flex-wrap p-3 rounded-xl bg-purple-950/30 border border-purple-500/20">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-md bg-purple-600 text-white text-[10px] font-bold">1080p HD</span>
                        <span className="text-xs text-purple-200 font-semibold">Masterclass Video Recording</span>
                      </div>
                      <a
                        href={recordingModalSession.recordingUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        download
                        className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all shadow-md shadow-purple-600/30 cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download Video</span>
                      </a>
                    </div>
                  </div>
                ) : (
                  <div className="w-full aspect-video rounded-2xl overflow-hidden bg-black/90 border border-white/[0.08] relative flex items-center justify-center shadow-inner group">
                    <div className="text-center space-y-3 p-6 max-w-md">
                      <div className="w-16 h-16 rounded-full bg-purple-600/30 border border-purple-500/40 text-purple-300 flex items-center justify-center mx-auto shadow-lg shadow-purple-600/20">
                        <Play className="w-7 h-7 fill-purple-400 ml-1" />
                      </div>
                      <p className="text-sm font-bold text-white">Video Recording Sync</p>
                      <p className="text-xs text-slate-400">
                        The video recording uploaded for this session is being synchronized. You will be able to play and download it directly from here.
                      </p>
                    </div>
                  </div>
                )}

                {/* Agenda / Chapters */}
                <div className="space-y-2">
                  <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Lecture Chapters & Timestamps</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {recordingModalSession.agenda && recordingModalSession.agenda.length > 0 ? (
                      recordingModalSession.agenda.map((ag) => (
                        <div
                          key={ag.id}
                          className="p-3 bg-white/[0.02] border border-white/[0.06] rounded-xl flex items-center justify-between text-xs cursor-pointer hover:border-purple-500/40 transition-colors"
                        >
                          <span className="font-bold text-slate-200 truncate">{ag.title}</span>
                          <span className="font-mono text-[11px] text-purple-400 font-bold shrink-0">{ag.timeRange.split("–")[0]}</span>
                        </div>
                      ))
                    ) : (
                      <div className="p-3 bg-white/[0.02] border border-white/[0.06] rounded-xl text-xs text-slate-400">
                        Full session recording available in 1080p
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-white/[0.08]">
                  <Link
                    href="/student/recorded-sessions"
                    className="text-xs font-bold text-purple-400 hover:underline flex items-center gap-1"
                  >
                    <span>View all recorded sessions in library →</span>
                  </Link>
                  <button
                    onClick={() => setRecordingModalSession(null)}
                    className="px-6 py-2.5 bg-white/[0.06] hover:bg-white/[0.1] text-white font-bold text-xs rounded-xl cursor-pointer"
                  >
                    Close Player
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* ══════════════════════════════════════════════════════════
            8. MODAL E: ADD REMINDER MODAL
            ══════════════════════════════════════════════════════════ */}
        <AnimatePresence>
          {isReminderModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-[#0e1322] border border-white/[0.12] rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-5 shadow-2xl relative text-xs"
              >
                <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-orange-500/15 text-orange-400">
                      <Bell className="w-4 h-4" />
                    </div>
                    <h3 className="font-extrabold text-base text-white">Set Live Class Reminder</h3>
                  </div>
                  <button
                    onClick={() => setIsReminderModalOpen(false)}
                    className="p-1.5 rounded-lg bg-white/[0.04] text-slate-400 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Select Course / Session</label>
                    <select
                      value={reminderSessionId}
                      onChange={(e) => setReminderSessionId(e.target.value)}
                      className="w-full bg-[#090d18] border border-white/[0.08] rounded-xl p-3 text-xs text-white outline-none focus:border-orange-500"
                    >
                      {allSessions.filter(s => s.status === "upcoming").map(s => (
                        <option key={s.id} value={s.id} className="bg-[#090d18]">
                          {s.courseTitle}: {s.title} ({s.date})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Reminder Notes (Optional)</label>
                    <input
                      type="text"
                      value={reminderNote}
                      onChange={(e) => setReminderNote(e.target.value)}
                      placeholder="e.g. Prepare question about LangGraph state"
                      className="w-full bg-[#090d18] border border-white/[0.08] rounded-xl p-3 text-xs text-white outline-none focus:border-orange-500"
                    />
                  </div>

                  <div className="p-3 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-300 text-[11px] leading-relaxed">
                    🔔 You will receive an automated browser notification and calendar alert 15 minutes before the class begins.
                  </div>

                  <button
                    onClick={handleConfirmReminder}
                    className="w-full py-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-orange-500/25 transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Bell className="w-3.5 h-3.5" />
                    <span>Confirm Live Class Reminder</span>
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* ══════════════════════════════════════════════════════════
            9. MODAL F: PDF & SESSION RESOURCES MODAL
            ══════════════════════════════════════════════════════════ */}
        <AnimatePresence>
          {pdfModalSession && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-[#0e1322] border border-white/[0.12] rounded-3xl p-6 sm:p-8 max-w-2xl w-full max-h-[85vh] overflow-y-auto space-y-6 shadow-2xl relative"
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-4 border-b border-white/[0.08] pb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">
                        {pdfModalSession.courseTitle}
                      </span>
                      <span className="text-white/20">•</span>
                      <span className="text-[10px] font-bold text-slate-400 uppercase">
                        {pdfModalSession.sessionCode}
                      </span>
                    </div>
                    <h3 className="text-xl font-black text-white mt-1">
                      {pdfModalSession.title} — Session Resources
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Download and view the lecture slides, PDF notes, and supplementary materials uploaded for this session.
                    </p>
                  </div>

                  <button
                    onClick={() => setPdfModalSession(null)}
                    className="p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-400 hover:text-white cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* PDF Files & Resources List */}
                <div className="space-y-3">
                  {pdfModalSession.resources && pdfModalSession.resources.length > 0 ? (
                    pdfModalSession.resources.map((res, ridx) => {
                      const isPdf = res.type?.toUpperCase() === "PDF" || res.url?.toLowerCase().endsWith(".pdf") || res.title?.toLowerCase().endsWith(".pdf");
                      const isDoc = res.type?.toUpperCase() === "DOC" || res.url?.toLowerCase().endsWith(".doc") || res.url?.toLowerCase().endsWith(".docx");
                      const isVideo = res.type?.toUpperCase() === "VIDEO" || res.url?.toLowerCase().endsWith(".mp4");

                      return (
                        <div
                          key={res.id || ridx}
                          className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.07] hover:border-blue-500/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
                        >
                          <div className="flex items-start gap-3.5 min-w-0">
                            <div className="p-3 rounded-xl bg-blue-500/15 text-blue-400 border border-blue-500/30 shrink-0 group-hover:scale-105 transition-transform">
                              {isVideo ? <PlayCircle className="w-5 h-5 text-purple-400" /> : <FileText className="w-5 h-5" />}
                            </div>
                            <div className="space-y-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h5 className="font-extrabold text-sm text-white truncate max-w-xs sm:max-w-md">{res.title}</h5>
                                <span className="px-2 py-0.5 rounded-md bg-blue-500/15 text-blue-300 border border-blue-500/30 text-[9px] font-bold">
                                  {res.type || (isPdf ? "PDF Document" : isVideo ? "Video Resource" : "Resource File")}
                                </span>
                              </div>
                              <p className="text-xs text-slate-400">
                                Uploaded instructor masterclass material for {pdfModalSession.sessionCode}.
                              </p>
                              <span className="text-[10px] font-mono text-slate-500 block">
                                Verified Cohort Material {res.size ? `• ${res.size}` : ""}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <a
                              href={res.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-md shadow-blue-600/30 cursor-pointer"
                            >
                              <FileDown className="w-3.5 h-3.5" />
                              <span>Open / Download</span>
                            </a>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    /* Default Supplementary Materials if no custom uploaded files */
                    [
                      {
                        name: `${pdfModalSession.title} — Official Slide Deck.pdf`,
                        desc: "Complete masterclass presentation slides with architecture diagrams and workflows.",
                        size: "4.8 MB",
                        badge: "Official Deck",
                      },
                      {
                        name: `${pdfModalSession.sessionCode} — Instructor Notes & Reference.pdf`,
                        desc: "Key takeaways, production gotchas, and step-by-step code implementation guide.",
                        size: "2.3 MB",
                        badge: "Notes & Cheatsheet",
                      },
                      {
                        name: "Prompt Engineering & Token Budgeting Blueprint.pdf",
                        desc: "Quick-reference template formulas for structured prompt engineering.",
                        size: "1.1 MB",
                        badge: "Blueprint",
                      },
                    ].map((pdf, pidx) => (
                      <div
                        key={pidx}
                        className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.07] hover:border-blue-500/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
                      >
                        <div className="flex items-start gap-3.5">
                          <div className="p-3 rounded-xl bg-blue-500/15 text-blue-400 border border-blue-500/30 shrink-0 group-hover:scale-105 transition-transform">
                            <FileText className="w-5 h-5" />
                          </div>
                          <div className="space-y-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h5 className="font-extrabold text-sm text-white">{pdf.name}</h5>
                              <span className="px-2 py-0.5 rounded-md bg-blue-500/15 text-blue-300 border border-blue-500/30 text-[9px] font-bold">
                                {pdf.badge}
                              </span>
                            </div>
                            <p className="text-xs text-slate-400">{pdf.desc}</p>
                            <span className="text-[10px] font-mono text-slate-500 block">PDF Document • {pdf.size}</span>
                          </div>
                        </div>

                        <button
                          onClick={() => {
                            setReminderToast(`📥 Downloading: ${pdf.name}`);
                            setTimeout(() => setReminderToast(null), 3000);
                          }}
                          className="px-4 py-2 bg-blue-600/20 hover:bg-blue-600 text-blue-300 hover:text-white border border-blue-500/40 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all shrink-0 cursor-pointer shadow-xs"
                        >
                          <FileDown className="w-3.5 h-3.5" />
                          <span>Download</span>
                        </button>
                      </div>
                    ))
                  )}
                </div>

                {/* Modal Footer */}
                <div className="flex justify-end pt-2 border-t border-white/[0.08]">
                  <button
                    onClick={() => setPdfModalSession(null)}
                    className="px-6 py-2.5 bg-white/[0.06] hover:bg-white/[0.1] text-white font-bold text-xs rounded-xl cursor-pointer"
                  >
                    Close PDF Resources
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* ══════════════════════════════════════════════════════════
            10. MODAL G: PRACTICE QUIZ MODAL
            ══════════════════════════════════════════════════════════ */}
        <AnimatePresence>
          {quizModalSession && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-[#0e1322] border border-white/[0.12] rounded-3xl p-6 sm:p-8 max-w-2xl w-full max-h-[85vh] overflow-y-auto space-y-6 shadow-2xl relative"
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-4 border-b border-white/[0.08] pb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">
                        {quizModalSession.courseTitle}
                      </span>
                      <span className="text-white/20">•</span>
                      <span className="text-[10px] font-bold text-slate-400 uppercase">
                        {quizModalSession.sessionCode}
                      </span>
                    </div>
                    <h3 className="text-xl font-black text-white mt-1">
                      {quizModalSession.title} — Practice Quiz
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Test your understanding of the concepts covered in this live masterclass session.
                    </p>
                  </div>

                  <button
                    onClick={() => setQuizModalSession(null)}
                    className="p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-400 hover:text-white cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Quick Stats Bar */}
                <div className="grid grid-cols-3 gap-2 p-3 bg-white/[0.02] border border-white/[0.06] rounded-2xl text-center text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold">Questions</span>
                    <p className="font-extrabold text-white text-sm">3 Questions</p>
                  </div>
                  <div className="border-l border-white/[0.06]">
                    <span className="text-[10px] text-slate-400 uppercase font-bold">Total Points</span>
                    <p className="font-extrabold text-emerald-400 text-sm">100 Pts</p>
                  </div>
                  <div className="border-l border-white/[0.06]">
                    <span className="text-[10px] text-slate-400 uppercase font-bold">Passing Score</span>
                    <p className="font-extrabold text-purple-400 text-sm">80%</p>
                  </div>
                </div>

                {/* Interactive Questions */}
                <div className="space-y-4">
                  {[
                    {
                      id: 1,
                      question: "In prompt engineering, what is the primary benefit of Few-Shot prompting compared to Zero-Shot prompting?",
                      options: [
                        "It reduces the token count sent to the LLM.",
                        "It gives explicit demonstration examples guiding the format and reasoning process.",
                        "It bypasses API rate limits automatically.",
                        "It encrypts the conversation history.",
                      ],
                      correct: 1,
                    },
                    {
                      id: 2,
                      question: "What is the key purpose of token budgeting when building production AI conversational agents?",
                      options: [
                        "To prevent context window overflow and manage API cost predictability.",
                        "To convert text directly into vector embeddings.",
                        "To eliminate the need for system prompts.",
                        "To change the model temperature dynamically.",
                      ],
                      correct: 0,
                    },
                    {
                      id: 3,
                      question: "Which component in an Agentic system is responsible for deciding whether to execute a tool or return a final answer?",
                      options: [
                        "The Vector Database index",
                        "The ReAct / LLM Reasoning loop",
                        "The HTTP Reverse Proxy",
                        "The CSS Style Module",
                      ],
                      correct: 1,
                    },
                  ].map((q, qidx) => (
                    <div key={q.id} className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-3">
                      <div className="flex items-start gap-2.5">
                        <span className="px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-300 text-[10px] font-mono font-bold shrink-0">
                          Q{qidx + 1}
                        </span>
                        <h5 className="font-bold text-sm text-white leading-snug">{q.question}</h5>
                      </div>

                      {/* Options */}
                      <div className="space-y-2 pt-1">
                        {q.options.map((opt, optIdx) => {
                          const isSelected = quizSelectedAnswers[q.id] === optIdx;
                          const isCorrect = q.correct === optIdx;
                          const showCorrectness = quizSubmitted;

                          return (
                            <button
                              key={optIdx}
                              type="button"
                              onClick={() => {
                                if (!quizSubmitted) {
                                  setQuizSelectedAnswers((prev) => ({ ...prev, [q.id]: optIdx }));
                                }
                              }}
                              className={`w-full p-3 rounded-xl border text-left text-xs transition-all flex items-center justify-between gap-3 cursor-pointer ${
                                showCorrectness
                                  ? isCorrect
                                    ? "bg-emerald-500/20 border-emerald-500 text-emerald-200"
                                    : isSelected
                                    ? "bg-rose-500/20 border-rose-500 text-rose-200"
                                    : "bg-white/[0.02] border-white/[0.05] text-slate-400"
                                  : isSelected
                                  ? "bg-purple-600/20 border-purple-500 text-white font-bold"
                                  : "bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.04] text-slate-300"
                              }`}
                            >
                              <div className="flex items-center gap-2.5">
                                <span className={`w-5 h-5 rounded-full border flex items-center justify-center text-[10px] font-bold ${
                                  isSelected ? "border-purple-400 bg-purple-500 text-white" : "border-white/20 text-slate-400"
                                }`}>
                                  {String.fromCharCode(65 + optIdx)}
                                </span>
                                <span>{opt}</span>
                              </div>

                              {showCorrectness && isCorrect && (
                                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Score & Submit */}
                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-between flex-wrap gap-4">
                  {quizSubmitted ? (
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                      <span className="text-xs font-bold text-emerald-300">
                        Quiz Completed! Score: {Object.keys(quizSelectedAnswers).filter((k) => {
                          const qid = Number(k);
                          const correct = qid === 1 ? 1 : qid === 2 ? 0 : 1;
                          return quizSelectedAnswers[qid] === correct;
                        }).length} / 3 Correct (100% Passed)
                      </span>
                    </div>
                  ) : (
                    <span className="text-xs text-slate-400">
                      Answer all questions and submit to check your score.
                    </span>
                  )}

                  <div className="flex items-center gap-2">
                    {!quizSubmitted ? (
                      <button
                        onClick={() => {
                          setQuizSubmitted(true);
                          setReminderToast("🎉 Quiz submitted! Great score!");
                          setTimeout(() => setReminderToast(null), 3500);
                        }}
                        disabled={Object.keys(quizSelectedAnswers).length < 3}
                        className={`px-5 py-2.5 rounded-xl font-bold text-xs shadow-lg transition-all cursor-pointer ${
                          Object.keys(quizSelectedAnswers).length === 3
                            ? "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-emerald-600/30"
                            : "bg-white/[0.05] text-slate-500 cursor-not-allowed"
                        }`}
                      >
                        Submit Quiz
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          setQuizSelectedAnswers({});
                          setQuizSubmitted(false);
                        }}
                        className="px-4 py-2 bg-white/[0.06] hover:bg-white/[0.1] text-white text-xs font-bold rounded-xl cursor-pointer"
                      >
                        Retake Quiz
                      </button>
                    )}

                    <button
                      onClick={() => setQuizModalSession(null)}
                      className="px-5 py-2.5 bg-white/[0.06] hover:bg-white/[0.1] text-slate-300 hover:text-white font-bold text-xs rounded-xl cursor-pointer"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* ══════════════════════════════════════════════════════════
            11. MODAL G: SESSION ASSIGNMENT & HANDS-ON LAB MODAL
            ══════════════════════════════════════════════════════════ */}
        <AnimatePresence>
          {assignmentModalSession && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-[#0e1322] border border-white/[0.12] rounded-3xl p-6 sm:p-8 max-w-2xl w-full max-h-[85vh] overflow-y-auto space-y-6 shadow-2xl relative"
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-4 border-b border-white/[0.08] pb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black text-amber-400 uppercase tracking-widest">
                        {assignmentModalSession.courseTitle}
                      </span>
                      <span className="text-white/20">•</span>
                      <span className="text-[10px] font-bold text-slate-400 uppercase">
                        {assignmentModalSession.sessionCode} Hands-On Lab
                      </span>
                    </div>
                    <h3 className="text-xl font-black text-white mt-1">
                      {assignmentModalSession.title} — Practical Assignment
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Implement the concepts and architecture patterns covered in this live session.
                    </p>
                  </div>

                  <button
                    onClick={() => setAssignmentModalSession(null)}
                    className="p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-400 hover:text-white cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Assignment Details Card */}
                <div className="space-y-4 text-xs">
                  <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/25 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-amber-300 text-xs flex items-center gap-2">
                        <FileCode2 className="w-4 h-4 text-amber-400" />
                        Assignment Brief: Production Implementation
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-black text-[10px]">
                        100 Points / Grade Weight 15%
                      </span>
                    </div>
                    <p className="text-slate-300 leading-relaxed text-[11px]">
                      Build a working end-to-end prototype based on <strong>{assignmentModalSession.title}</strong>. Write clean modular code, add error handling guards, and submit your GitHub repo URL or archive file.
                    </p>
                  </div>

                  {/* Requirements List */}
                  <div className="space-y-2 p-4 rounded-2xl bg-white/[0.02] border border-white/[0.07]">
                    <h5 className="font-extrabold text-white text-xs">Deliverables & Requirements:</h5>
                    <ul className="space-y-1.5 text-slate-400 text-[11px]">
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>Core execution workflow adhering to session blueprint contracts.</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>Unit test coverage or verification logs demonstrating success.</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>README with architecture explanation and local run steps.</span>
                      </li>
                    </ul>
                  </div>

                  {/* Instructor Feedback Notice */}
                  <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] text-slate-400 text-[11px]">
                    👨‍🏫 Instructor <strong>{assignmentModalSession.instructor.name}</strong> will review your code and provide feedback within 48 hours of submission.
                  </div>
                </div>

                {/* Footer Buttons */}
                <div className="flex items-center justify-between gap-3 pt-2 border-t border-white/[0.08]">
                  <button
                    onClick={() => setAssignmentModalSession(null)}
                    className="px-4 py-2 bg-white/[0.06] hover:bg-white/[0.1] text-slate-300 hover:text-white font-bold text-xs rounded-xl cursor-pointer"
                  >
                    Close
                  </button>

                  <Link
                    href={`/student/assignments?course=${encodeURIComponent(assignmentModalSession.courseTitle)}`}
                    className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-amber-500/25 flex items-center gap-2 transition-all cursor-pointer"
                  >
                    <Briefcase className="w-3.5 h-3.5" />
                    <span>Open in Assignments Portal</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </div>
    </StudentPortalLayout>
  );
}
