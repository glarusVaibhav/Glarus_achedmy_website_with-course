"use client";

import { useState } from "react";
import {
  ClipboardList,
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Copy,
  BarChart2,
  Trash2,
  X,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
  Code,
  Upload,
  Link2,
  HelpCircle,
  Folder,
  Calendar,
  Layers,
  Award,
  Users,
  ChevronRight,
  ChevronLeft,
  Check,
  Send,
  FileDown,
  Sparkles,
  ArrowUpDown,
  BookOpen
} from "lucide-react";

export interface AssignmentItem {
  id: string;
  title: string;
  course: string;
  module: string;
  dueDate: string;
  submissionsCount: number;
  totalStudents: number;
  pendingReviewCount: number;
  averageScore: number;
  status: "Draft" | "Published" | "Closed" | "Archived";
  type: "File Upload" | "Text Answer" | "Coding Assignment" | "Project Submission" | "MCQ Quiz" | "External Link";
  totalMarks: number;
}

export interface StudentSubmission {
  id: string;
  studentName: string;
  studentEmail: string;
  submissionTime: string;
  score: number | null;
  status: "Submitted" | "Pending Review" | "Graded" | "Late";
  submittedText?: string;
  submittedFileName?: string;
  rubricScores?: Record<string, number>;
  feedback?: string;
}

const INITIAL_ASSIGNMENTS: AssignmentItem[] = [
  {
    id: "asg-1",
    title: "Assignment 2: Multi-Agent Orchestration with LangGraph",
    course: "Mastering Agentic AI & Autonomous Workflows",
    module: "Module 3: Complex Multi-Agent Frameworks",
    dueDate: "2026-08-15 23:59",
    submissionsCount: 38,
    totalStudents: 45,
    pendingReviewCount: 4,
    averageScore: 84.5,
    status: "Published",
    type: "Coding Assignment",
    totalMarks: 100,
  },
  {
    id: "asg-2",
    title: "Assignment 1: ReAct Agent Loop Implementation",
    course: "Mastering Agentic AI & Autonomous Workflows",
    module: "Module 2: Reasoning Loops",
    dueDate: "2026-08-01 23:59",
    submissionsCount: 44,
    totalStudents: 45,
    pendingReviewCount: 0,
    averageScore: 88.2,
    status: "Published",
    type: "Coding Assignment",
    totalMarks: 100,
  },
  {
    id: "asg-3",
    title: "Full-Stack E-Commerce API Architecture",
    course: "Full-Stack Web Development Bootcamp",
    module: "Module 4: Next.js Server Actions & Prisma",
    dueDate: "2026-08-20 23:59",
    submissionsCount: 12,
    totalStudents: 50,
    pendingReviewCount: 8,
    averageScore: 79.0,
    status: "Published",
    type: "Project Submission",
    totalMarks: 100,
  },
  {
    id: "asg-4",
    title: "Draft: Advanced Vector DB Indexing & RAG Optimization",
    course: "Mastering Agentic AI & Autonomous Workflows",
    module: "Module 5: RAG & Memory",
    dueDate: "2026-08-28 23:59",
    submissionsCount: 0,
    totalStudents: 45,
    pendingReviewCount: 0,
    averageScore: 0,
    status: "Draft",
    type: "File Upload",
    totalMarks: 50,
  },
  {
    id: "asg-5",
    title: "Draft: Microservices Event Driven Quiz",
    course: "Full-Stack Web Development Bootcamp",
    module: "Module 6: Cloud Native Systems",
    dueDate: "2026-09-05 23:59",
    submissionsCount: 0,
    totalStudents: 50,
    pendingReviewCount: 0,
    averageScore: 0,
    status: "Draft",
    type: "MCQ Quiz",
    totalMarks: 30,
  },
];

const INITIAL_SUBMISSIONS: StudentSubmission[] = [
  {
    id: "sub-1",
    studentName: "Rahul Sharma",
    studentEmail: "rahul.sharma@example.com",
    submissionTime: "2026-08-06 09:30",
    score: null,
    status: "Pending Review",
    submittedText: "Implemented multi-agent delegation using LangChain and FastAPI backend. Implemented tool use and persistent state.",
    submittedFileName: "langgraph_agent_rahul.zip",
  },
  {
    id: "sub-2",
    studentName: "Priya Patel",
    studentEmail: "priya.patel@example.com",
    submissionTime: "2026-08-05 18:45",
    score: 95,
    status: "Graded",
    submittedText: "All multi-agent routing tests passed with 100% coverage. Attached Python repository.",
    submittedFileName: "agent_orchestration_priya.zip",
    feedback: "Outstanding implementation of memory loops and error recovery!",
  },
  {
    id: "sub-3",
    studentName: "Aman Verma",
    studentEmail: "aman.v@example.com",
    submissionTime: "2026-08-06 10:15",
    score: null,
    status: "Pending Review",
    submittedText: "Built 3 autonomous agents with tool calling and custom JSON parsers.",
    submittedFileName: "agent_submission_aman.py",
  },
  {
    id: "sub-4",
    studentName: "Sneha Gupta",
    studentEmail: "sneha.g@example.com",
    submissionTime: "2026-08-04 14:20",
    score: 88,
    status: "Graded",
    submittedText: "Completed LangGraph multi-agent assignment with SQLite state checkpointing.",
    submittedFileName: "sneha_langgraph.zip",
    feedback: "Great structure. Try adding fallback retries for API rate limits.",
  },
];

export function InstructorAssignmentsView() {
  const [assignments, setAssignments] = useState<AssignmentItem[]>(INITIAL_ASSIGNMENTS);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCourseFilter, setSelectedCourseFilter] = useState("All");
  const [selectedStatusFilter, setSelectedStatusFilter] = useState("All");
  const [sortBy, setSortBy] = useState("newest");

  /* Modal States */
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [selectedAssignmentDetails, setSelectedAssignmentDetails] = useState<AssignmentItem | null>(null);
  const [selectedSubmissionToReview, setSelectedSubmissionToReview] = useState<StudentSubmission | null>(null);
  const [reviewScore, setReviewScore] = useState<number>(85);
  const [reviewFeedback, setReviewFeedback] = useState("");

  /* Wizard State */
  const [wizardStep, setWizardStep] = useState(1);
  const [wizardData, setWizardData] = useState({
    title: "",
    description: "",
    course: "Mastering Agentic AI & Autonomous Workflows",
    module: "Module 3: Complex Multi-Agent Frameworks",
    difficulty: "Medium",
    totalMarks: 100,
    passingMarks: 40,
    estimatedDuration: 120,
    type: "Coding Assignment" as AssignmentItem["type"],
    dueDate: "2026-08-25T23:59",
    allowLate: true,
    latePenalty: 10,
    maxAttempts: 3,
    allowResubmission: true,
    assignmentScope: "Individual",
    evaluationMode: "Manual Review",
    resources: [
      { name: "Starter_Code_Template.zip", type: "zip" },
      { name: "Assignment_Guidelines.pdf", type: "pdf" }
    ],
    rubric: [
      { id: "r1", title: "Code Quality & Clean Architecture", marks: 25, weight: 25, description: "Clean code structure, modular design, and proper naming conventions." },
      { id: "r2", title: "Documentation & Comments", marks: 15, weight: 15, description: "Detailed README documentation and inline code comments." },
      { id: "r3", title: "Logic & Execution Correctness", marks: 40, weight: 40, description: "All test cases pass successfully without runtime errors." },
      { id: "r4", title: "Creativity & Advanced Features", marks: 20, weight: 20, description: "Bonus features, error handling, or performance optimizations." }
    ]
  });

  /* Calculate Stats */
  const totalAssignments = assignments.length;
  const publishedCount = assignments.filter(a => a.status === "Published").length;
  const draftCount = assignments.filter(a => a.status === "Draft").length;
  const pendingReviewCount = assignments.reduce((sum, a) => sum + a.pendingReviewCount, 0);
  const closedCount = assignments.filter(a => a.status === "Closed").length;
  const avgScoreAll = assignments.filter(a => a.averageScore > 0);
  const overallAvgScore = avgScoreAll.length > 0
    ? (avgScoreAll.reduce((sum, a) => sum + a.averageScore, 0) / avgScoreAll.length).toFixed(1)
    : "0.0";

  /* Filtered Assignments */
  const filteredAssignments = assignments.filter((a) => {
    const matchesSearch = a.title.toLowerCase().includes(searchQuery.toLowerCase()) || a.course.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCourse = selectedCourseFilter === "All" || a.course === selectedCourseFilter;
    const matchesStatus = selectedStatusFilter === "All" || a.status === selectedStatusFilter;
    return matchesSearch && matchesCourse && matchesStatus;
  });

  const handleCreateAssignment = (status: "Draft" | "Published") => {
    if (!wizardData.title.trim()) return;
    const newAsg: AssignmentItem = {
      id: `asg-${Date.now()}`,
      title: wizardData.title.trim(),
      course: wizardData.course,
      module: wizardData.module,
      dueDate: wizardData.dueDate.replace("T", " "),
      submissionsCount: 0,
      totalStudents: 45,
      pendingReviewCount: 0,
      averageScore: 0,
      status: status,
      type: wizardData.type,
      totalMarks: Number(wizardData.totalMarks) || 100
    };

    setAssignments([newAsg, ...assignments]);
    setIsWizardOpen(false);
    setWizardStep(1);
    setWizardData({
      title: "",
      description: "",
      course: "Mastering Agentic AI & Autonomous Workflows",
      module: "Module 3: Complex Multi-Agent Frameworks",
      difficulty: "Medium",
      totalMarks: 100,
      passingMarks: 40,
      estimatedDuration: 120,
      type: "Coding Assignment",
      dueDate: "2026-08-25T23:59",
      allowLate: true,
      latePenalty: 10,
      maxAttempts: 3,
      allowResubmission: true,
      assignmentScope: "Individual",
      evaluationMode: "Manual Review",
      resources: [],
      rubric: [
        { id: "r1", title: "Code Quality", marks: 25, weight: 25, description: "Clean code structure" },
        { id: "r2", title: "Documentation", marks: 15, weight: 15, description: "Detailed README" },
        { id: "r3", title: "Logic & Accuracy", marks: 40, weight: 40, description: "Passes all tests" },
        { id: "r4", title: "Creativity", marks: 20, weight: 20, description: "Extra features" }
      ]
    });
  };

  const deleteAssignment = (id: string) => {
    setAssignments(prev => prev.filter(a => a.id !== id));
  };

  const toggleStatus = (id: string) => {
    setAssignments(prev => prev.map(a => {
      if (a.id === id) {
        const nextStatus = a.status === "Published" ? "Closed" : "Published";
        return { ...a, status: nextStatus };
      }
      return a;
    }));
  };

  /* Helper: Format Due Date */
  const formatDueDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr.replace(" ", "T"));
      if (isNaN(d.getTime())) return { date: dateStr, time: "", badge: null };
      
      const now = new Date();
      const isPast = d.getTime() < now.getTime();
      const diffDays = Math.ceil((d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      
      const dateFormatted = d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
      const timeFormatted = d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
      
      let badge = null;
      if (isPast) {
        badge = { label: "Ended", color: "text-subtext bg-card border-card" };
      } else if (diffDays <= 1) {
        badge = { label: "Due Today", color: "text-rose-400 bg-rose-500/10 border-rose-500/30" };
      } else if (diffDays <= 3) {
        badge = { label: `Due in ${diffDays}d`, color: "text-rose-400 bg-rose-500/10 border-rose-500/20" };
      } else if (diffDays <= 7) {
        badge = { label: `In ${diffDays}d`, color: "text-amber-400 bg-amber-500/10 border-amber-500/20" };
      } else {
        badge = { label: `In ${diffDays}d`, color: "text-subtext bg-card/60 border-card" };
      }
      
      return { date: dateFormatted, time: timeFormatted, badge };
    } catch {
      return { date: dateStr, time: "", badge: null };
    }
  };

  /* Helper: Type Icon & Colors */
  const getTypeMeta = (type: AssignmentItem["type"]) => {
    switch (type) {
      case "Coding Assignment":
        return { icon: Code, color: "text-indigo-400", bg: "bg-indigo-500/10", border: "border-indigo-500/20", label: "Coding" };
      case "MCQ Quiz":
        return { icon: HelpCircle, color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20", label: "Quiz" };
      case "Project Submission":
        return { icon: Layers, color: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/20", label: "Project" };
      case "File Upload":
        return { icon: Upload, color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20", label: "File" };
      default:
        return { icon: FileText, color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20", label: "Text" };
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* ─── TOP ACTION BAR ─── */}
      <div className="flex items-center justify-between gap-4 pb-3 border-b border-card/60">
        <div className="flex items-center gap-2.5">
          <span className="text-xs font-black px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
            {totalAssignments} Total Assignments
          </span>
          {pendingReviewCount > 0 && (
            <span className="text-xs font-black px-3 py-1 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20 animate-pulse">
              ● {pendingReviewCount} Pending Review
            </span>
          )}
        </div>

        <button
          onClick={() => { setWizardStep(1); setIsWizardOpen(true); }}
          className="bg-gradient-to-r from-primary to-accent hover:opacity-90 text-white font-extrabold px-5 py-2.5 rounded-2xl shadow-lg shadow-primary/25 flex items-center justify-center gap-2 text-xs sm:text-sm transition-all shrink-0 hover:scale-[1.02] active:scale-[0.98]"
        >
          <Plus className="w-4 h-4" /> Create Assignment
        </button>
      </div>

      {/* ─── STATISTICS CARDS ─── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { label: "Total", sub: "All Courses", value: totalAssignments, icon: ClipboardList, color: "text-primary", bg: "bg-primary/10", border: "border-primary/20" },
          { label: "Published", sub: "Live for students", value: publishedCount, icon: CheckCircle2, color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
          { label: "Drafts", sub: "Unpublished", value: draftCount, icon: Clock, color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20" },
          { label: "To Review", sub: "Pending grading", value: pendingReviewCount, icon: AlertCircle, color: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/20", highlight: pendingReviewCount > 0 },
          { label: "Closed", sub: "Completed", value: closedCount, icon: Folder, color: "text-subtext", bg: "bg-card", border: "border-card" },
          { label: "Avg Score", sub: "Across graded", value: `${overallAvgScore}%`, icon: Award, color: "text-rose-400", bg: "bg-rose-500/10", border: "border-rose-500/20" },
        ].map((stat, i) => (
          <div
            key={i}
            className={`bg-card/40 backdrop-blur-xl border ${stat.border} rounded-2xl p-3.5 shadow-sm flex flex-col justify-between h-28 relative overflow-hidden transition-all hover:bg-card/60 hover:-translate-y-0.5`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold text-subtext uppercase tracking-wider">{stat.label}</span>
              <div className={`p-1.5 rounded-lg ${stat.bg} ${stat.color}`}>
                <stat.icon className="w-3.5 h-3.5" />
              </div>
            </div>
            <div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-black text-text tracking-tight">{stat.value}</span>
                {stat.highlight && (
                  <span className="inline-block w-2 h-2 rounded-full bg-purple-400 animate-ping" />
                )}
              </div>
              <span className="text-[10px] text-subtext font-medium block truncate">{stat.sub}</span>
            </div>
          </div>
        ))}
      </div>

      {/* ─── FILTER & SEARCH TOOLBAR ─── */}
      <div className="bg-card/40 backdrop-blur-xl border border-card/80 rounded-2xl p-3.5 flex flex-col lg:flex-row items-center gap-3 justify-between shadow-sm">
        {/* Search Bar */}
        <div className="relative w-full lg:w-72">
          <Search className="w-4 h-4 text-subtext absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search assignments or courses..."
            className="w-full bg-background border border-card rounded-xl pl-9 pr-8 py-2 text-xs text-text placeholder:text-subtext/60 font-medium focus:outline-none focus:border-primary transition-colors"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-subtext hover:text-text">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Status Tab Pills */}
        <div className="flex items-center gap-1.5 w-full lg:w-auto overflow-x-auto pb-1 lg:pb-0 bg-background/60 p-1 rounded-xl border border-card">
          {[
            { id: "All", label: "All", count: totalAssignments },
            { id: "Published", label: "Published", count: publishedCount },
            { id: "Draft", label: "Drafts", count: draftCount },
            { id: "Closed", label: "Closed", count: closedCount },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedStatusFilter(tab.id)}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                selectedStatusFilter === tab.id
                  ? "bg-primary text-white shadow-sm"
                  : "text-subtext hover:text-text hover:bg-card/50"
              }`}
            >
              <span>{tab.label}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-md ${
                selectedStatusFilter === tab.id ? "bg-white/20 text-white font-extrabold" : "bg-card text-subtext"
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Course Dropdown Selector */}
        <div className="flex items-center gap-2 w-full lg:w-auto justify-end">
          <div className="flex items-center gap-1.5 shrink-0 text-subtext">
            <Filter className="w-3.5 h-3.5" />
            <span className="text-[11px] font-bold">Course:</span>
          </div>

          <select
            value={selectedCourseFilter}
            onChange={(e) => setSelectedCourseFilter(e.target.value)}
            className="bg-background border border-card rounded-xl px-3 py-1.5 text-xs font-bold text-text focus:outline-none focus:border-primary max-w-[200px] truncate"
          >
            <option value="All">All Courses ({totalAssignments})</option>
            <option value="Mastering Agentic AI & Autonomous Workflows">Agentic AI Masterclass</option>
            <option value="Full-Stack Web Development Bootcamp">Full-Stack Web Dev</option>
          </select>
        </div>
      </div>

      {/* ─── ASSIGNMENTS DATA TABLE ─── */}
      <div className="bg-card/30 backdrop-blur-xl border border-card/80 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-card/60 border-b border-card text-[10px] font-black text-subtext uppercase tracking-wider">
                <th className="py-3.5 px-4 min-w-[280px]">Assignment Details</th>
                <th className="py-3.5 px-4 min-w-[200px]">Course & Module</th>
                <th className="py-3.5 px-4 min-w-[140px]">Due Date</th>
                <th className="py-3.5 px-4 min-w-[130px]">Submissions</th>
                <th className="py-3.5 px-4 min-w-[120px]">Pending Review</th>
                <th className="py-3.5 px-4 min-w-[90px]">Avg Score</th>
                <th className="py-3.5 px-4 min-w-[100px]">Status</th>
                <th className="py-3.5 px-4 min-w-[120px] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-card/40 text-xs">
              {filteredAssignments.map((assignment) => {
                const typeMeta = getTypeMeta(assignment.type);
                const dueMeta = formatDueDate(assignment.dueDate);
                const submissionPercent = assignment.totalStudents > 0
                  ? Math.round((assignment.submissionsCount / assignment.totalStudents) * 100)
                  : 0;

                return (
                  <tr key={assignment.id} className="hover:bg-card/40 transition-colors group">
                    {/* ASSIGNMENT TITLE & TYPE */}
                    <td className="py-4 px-4 font-bold text-text">
                      <div className="flex items-start gap-3">
                        <div className={`p-2.5 rounded-xl ${typeMeta.bg} ${typeMeta.color} border ${typeMeta.border} shrink-0 mt-0.5`}>
                          <typeMeta.icon className="w-4 h-4" />
                        </div>
                        <div className="space-y-1 min-w-0">
                          <span
                            onClick={() => setSelectedAssignmentDetails(assignment)}
                            className="font-extrabold text-sm text-text group-hover:text-primary transition-colors cursor-pointer block line-clamp-2"
                            title={assignment.title}
                          >
                            {assignment.title}
                          </span>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md ${typeMeta.bg} ${typeMeta.color} border ${typeMeta.border}`}>
                              {typeMeta.label}
                            </span>
                            <span className="text-[10px] font-bold text-subtext px-1.5 py-0.5 rounded-md bg-card border border-card">
                              {assignment.totalMarks} Marks
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* COURSE & MODULE */}
                    <td className="py-4 px-4">
                      <div className="space-y-0.5">
                        <span className="font-bold text-xs text-text flex items-center gap-1.5 line-clamp-1" title={assignment.course}>
                          <BookOpen className="w-3 h-3 text-primary shrink-0" />
                          {assignment.course}
                        </span>
                        <span className="text-[11px] text-subtext block truncate max-w-[200px]" title={assignment.module}>
                          {assignment.module}
                        </span>
                      </div>
                    </td>

                    {/* DUE DATE */}
                    <td className="py-4 px-4 font-medium whitespace-nowrap">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-text">
                          <Calendar className="w-3.5 h-3.5 text-primary" />
                          <span>{dueMeta.date}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] text-subtext">{dueMeta.time}</span>
                          {dueMeta.badge && (
                            <span className={`text-[9px] font-black px-1.5 py-0.2 rounded-md border ${dueMeta.badge.color}`}>
                              {dueMeta.badge.label}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* SUBMISSIONS WITH PROGRESS BAR */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-black text-text">{assignment.submissionsCount} <span className="text-subtext font-medium text-[11px]">/ {assignment.totalStudents}</span></span>
                          <span className="text-[10px] font-bold text-subtext">{submissionPercent}%</span>
                        </div>
                        <div className="w-24 h-1.5 bg-card rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
                              submissionPercent > 75 ? "bg-emerald-500" : submissionPercent > 40 ? "bg-primary" : "bg-amber-500"
                            }`}
                            style={{ width: `${submissionPercent}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    {/* PENDING REVIEW */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      {assignment.pendingReviewCount > 0 ? (
                        <button
                          onClick={() => setSelectedAssignmentDetails(assignment)}
                          className="px-2.5 py-1 rounded-xl text-[10px] font-extrabold bg-purple-500/15 text-purple-400 border border-purple-500/30 hover:bg-purple-500/25 transition-all flex items-center gap-1.5 shadow-sm"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-ping" />
                          <span>{assignment.pendingReviewCount} to Review</span>
                        </button>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400/80">
                          <Check className="w-3 h-3 text-emerald-400" /> All Graded
                        </span>
                      )}
                    </td>

                    {/* AVERAGE SCORE */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      {assignment.averageScore > 0 ? (
                        <div className="flex items-center gap-1">
                          <span className={`text-xs font-black ${
                            assignment.averageScore >= 80 ? "text-emerald-400" : assignment.averageScore >= 60 ? "text-amber-400" : "text-rose-400"
                          }`}>
                            {assignment.averageScore}%
                          </span>
                        </div>
                      ) : (
                        <span className="text-subtext font-bold text-xs">—</span>
                      )}
                    </td>

                    {/* STATUS PILL */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                          assignment.status === "Published"
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                            : assignment.status === "Draft"
                            ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                            : "bg-card text-subtext border-card"
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          assignment.status === "Published" ? "bg-emerald-400" : assignment.status === "Draft" ? "bg-amber-400" : "bg-subtext"
                        }`} />
                        {assignment.status}
                      </span>
                    </td>

                    {/* ACTIONS */}
                    <td className="py-4 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setSelectedAssignmentDetails(assignment)}
                          className="p-1.5 text-subtext hover:text-primary hover:bg-primary/10 rounded-lg transition-all"
                          title="View Submissions & Stats"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => toggleStatus(assignment.id)}
                          className={`p-1.5 rounded-lg transition-all ${
                            assignment.status === "Published"
                              ? "text-subtext hover:text-amber-400 hover:bg-amber-500/10"
                              : "text-subtext hover:text-emerald-400 hover:bg-emerald-500/10"
                          }`}
                          title={assignment.status === "Published" ? "Close Assignment" : "Publish Assignment"}
                        >
                          <CheckCircle2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteAssignment(assignment.id)}
                          className="p-1.5 text-subtext hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all"
                          title="Delete Assignment"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredAssignments.length === 0 && (
                <tr>
                  <td colSpan={8} className="p-12 text-center text-subtext">
                    <ClipboardList className="w-12 h-12 mx-auto mb-3 opacity-20" />
                    <p className="font-bold text-base text-text">No assignments found</p>
                    <p className="text-xs mt-1">Try adjusting your search query or status filter.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        {filteredAssignments.length > 0 && (
          <div className="px-4 py-3 bg-card/40 border-t border-card flex items-center justify-between text-xs text-subtext font-medium">
            <span>
              Showing <strong className="text-text">{filteredAssignments.length}</strong> of <strong className="text-text">{totalAssignments}</strong> assignments
            </span>
            <span className="text-[11px]">
              Tip: Click any assignment title or eye icon to grade student submissions
            </span>
          </div>
        )}
      </div>

      {/* ══════════════════════════════════════════════════════════════
         CREATE ASSIGNMENT MULTI-STEP WIZARD MODAL
         ══════════════════════════════════════════════════════════════ */}
      {isWizardOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="bg-background border border-card rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="p-6 bg-card/40 border-b border-card flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-primary">Create Assignment Wizard</span>
                <h2 className="text-2xl font-extrabold text-text">Step {wizardStep} of 6: {
                  wizardStep === 1 ? "Basic Information" :
                  wizardStep === 2 ? "Assignment Type" :
                  wizardStep === 3 ? "Submission Rules" :
                  wizardStep === 4 ? "Resources & Files" :
                  wizardStep === 5 ? "Grading Rubric" : "Review & Publish"
                }</h2>
              </div>
              <button onClick={() => setIsWizardOpen(false)} className="p-2 text-subtext hover:text-text rounded-xl bg-card">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Stepper Progress Bar */}
            <div className="px-6 py-3 bg-card/20 border-b border-card flex items-center justify-between text-xs font-bold text-subtext">
              {[
                { num: 1, title: "Basic Info" },
                { num: 2, title: "Type" },
                { num: 3, title: "Rules" },
                { num: 4, title: "Resources" },
                { num: 5, title: "Rubric" },
                { num: 6, title: "Publish" },
              ].map((s) => (
                <button
                  key={s.num}
                  onClick={() => setWizardStep(s.num)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all ${
                    wizardStep === s.num
                      ? "bg-primary text-white font-extrabold shadow-md shadow-primary/20"
                      : wizardStep > s.num
                      ? "text-emerald-400 bg-emerald-500/10 font-bold"
                      : "text-subtext hover:bg-card"
                  }`}
                >
                  <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] border border-current">
                    {wizardStep > s.num ? <Check className="w-3 h-3" /> : s.num}
                  </span>
                  <span className="hidden md:inline">{s.title}</span>
                </button>
              ))}
            </div>

            {/* Wizard Step Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* STEP 1: BASIC INFO */}
              {wizardStep === 1 && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-text mb-1.5">Assignment Title *</label>
                    <input
                      type="text"
                      value={wizardData.title}
                      onChange={(e) => setWizardData({ ...wizardData, title: e.target.value })}
                      placeholder="e.g. Assignment 3: Building a Multi-Agent LangChain System"
                      className="w-full bg-card border border-card rounded-xl px-4 py-3 text-sm text-text font-medium focus:outline-none focus:border-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-text mb-1.5">Description & Instructions</label>
                    <textarea
                      rows={4}
                      value={wizardData.description}
                      onChange={(e) => setWizardData({ ...wizardData, description: e.target.value })}
                      placeholder="Describe the assignment objective, requirements, and evaluation criteria..."
                      className="w-full bg-card border border-card rounded-xl px-4 py-3 text-xs text-text font-medium focus:outline-none focus:border-primary"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-text mb-1.5">Select Course</label>
                      <select
                        value={wizardData.course}
                        onChange={(e) => setWizardData({ ...wizardData, course: e.target.value })}
                        className="w-full bg-card border border-card rounded-xl px-4 py-3 text-xs text-text font-bold focus:outline-none focus:border-primary"
                      >
                        <option value="Mastering Agentic AI & Autonomous Workflows">Mastering Agentic AI & Autonomous Workflows</option>
                        <option value="Full-Stack Web Development Bootcamp">Full-Stack Web Development Bootcamp</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-text mb-1.5">Select Module</label>
                      <select
                        value={wizardData.module}
                        onChange={(e) => setWizardData({ ...wizardData, module: e.target.value })}
                        className="w-full bg-card border border-card rounded-xl px-4 py-3 text-xs text-text font-bold focus:outline-none focus:border-primary"
                      >
                        <option value="Module 3: Complex Multi-Agent Frameworks">Module 3: Complex Multi-Agent Frameworks</option>
                        <option value="Module 4: Next.js Server Actions & Prisma">Module 4: Next.js Server Actions & Prisma</option>
                        <option value="Module 5: RAG & Memory">Module 5: RAG & Memory</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-text mb-1.5">Total Marks</label>
                      <input
                        type="number"
                        value={wizardData.totalMarks}
                        onChange={(e) => setWizardData({ ...wizardData, totalMarks: Number(e.target.value) })}
                        className="w-full bg-card border border-card rounded-xl px-3 py-2.5 text-xs text-text font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-text mb-1.5">Passing Marks</label>
                      <input
                        type="number"
                        value={wizardData.passingMarks}
                        onChange={(e) => setWizardData({ ...wizardData, passingMarks: Number(e.target.value) })}
                        className="w-full bg-card border border-card rounded-xl px-3 py-2.5 text-xs text-text font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-text mb-1.5">Difficulty</label>
                      <select
                        value={wizardData.difficulty}
                        onChange={(e) => setWizardData({ ...wizardData, difficulty: e.target.value })}
                        className="w-full bg-card border border-card rounded-xl px-3 py-2.5 text-xs text-text font-bold"
                      >
                        <option value="Easy">Easy</option>
                        <option value="Medium">Medium</option>
                        <option value="Hard">Hard</option>
                        <option value="Advanced">Advanced</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-text mb-1.5">Est. Duration (Mins)</label>
                      <input
                        type="number"
                        value={wizardData.estimatedDuration}
                        onChange={(e) => setWizardData({ ...wizardData, estimatedDuration: Number(e.target.value) })}
                        className="w-full bg-card border border-card rounded-xl px-3 py-2.5 text-xs text-text font-bold"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2: ASSIGNMENT TYPE */}
              {wizardStep === 2 && (
                <div className="space-y-4">
                  <p className="text-xs font-semibold text-subtext">Choose how students will submit their work for this assignment.</p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                      { type: "Coding Assignment", title: "Coding Assignment", desc: "Code submission with automated sandbox or manual code review", icon: Code },
                      { type: "File Upload", title: "File Upload", desc: "Upload PDF, zip files, documents, or screenshots", icon: Upload },
                      { type: "Project Submission", title: "Project Submission", desc: "Full repository GitHub link & live URL demo", icon: Layers },
                      { type: "Text Answer", title: "Text Answer", desc: "Formatted rich text responses and essays", icon: FileText },
                      { type: "MCQ Quiz", title: "MCQ Quiz", desc: "Multiple choice question set with auto-grading", icon: HelpCircle },
                      { type: "External Link", title: "External Link", desc: "Figma, Notion, Loom, or external portfolio URL", icon: Link2 },
                    ].map((item) => {
                      const IconComp = item.icon;
                      const isSelected = wizardData.type === item.type;
                      return (
                        <div
                          key={item.type}
                          onClick={() => setWizardData({ ...wizardData, type: item.type as AssignmentItem["type"] })}
                          className={`p-5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                            isSelected
                              ? "border-primary bg-primary/10 shadow-lg shadow-primary/10"
                              : "border-card bg-card/40 hover:border-card/80"
                          }`}
                        >
                          <div>
                            <IconComp className={`w-6 h-6 mb-3 ${isSelected ? "text-primary" : "text-subtext"}`} />
                            <h4 className="font-extrabold text-sm text-text mb-1">{item.title}</h4>
                            <p className="text-xs text-subtext font-medium">{item.desc}</p>
                          </div>
                          {isSelected && (
                            <span className="mt-4 text-[10px] font-black text-primary uppercase tracking-wider flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Selected
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* STEP 3: SUBMISSION RULES */}
              {wizardStep === 3 && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-text mb-1.5">Due Date & Time *</label>
                      <input
                        type="datetime-local"
                        value={wizardData.dueDate}
                        onChange={(e) => setWizardData({ ...wizardData, dueDate: e.target.value })}
                        className="w-full bg-card border border-card rounded-xl px-4 py-3 text-xs text-text font-bold"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-text mb-1.5">Maximum Attempts</label>
                      <input
                        type="number"
                        value={wizardData.maxAttempts}
                        onChange={(e) => setWizardData({ ...wizardData, maxAttempts: Number(e.target.value) })}
                        className="w-full bg-card border border-card rounded-xl px-4 py-3 text-xs text-text font-bold"
                      />
                    </div>
                  </div>

                  <div className="bg-card/40 border border-card rounded-2xl p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-extrabold text-sm text-text">Allow Late Submissions</h4>
                        <p className="text-xs text-subtext">Students can submit past due date with automatic mark penalty.</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={wizardData.allowLate}
                        onChange={(e) => setWizardData({ ...wizardData, allowLate: e.target.checked })}
                        className="w-5 h-5 accent-primary rounded cursor-pointer"
                      />
                    </div>

                    {wizardData.allowLate && (
                      <div className="pt-2 border-t border-card flex items-center gap-3">
                        <span className="text-xs font-bold text-text">Late Penalty (%):</span>
                        <input
                          type="number"
                          value={wizardData.latePenalty}
                          onChange={(e) => setWizardData({ ...wizardData, latePenalty: Number(e.target.value) })}
                          className="w-24 bg-card border border-card rounded-lg px-3 py-1.5 text-xs font-bold"
                        />
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-card/40 border border-card rounded-2xl">
                      <h4 className="font-extrabold text-xs text-text mb-2">Assignment Scope</h4>
                      <div className="flex gap-4 text-xs font-bold">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="scope"
                            checked={wizardData.assignmentScope === "Individual"}
                            onChange={() => setWizardData({ ...wizardData, assignmentScope: "Individual" })}
                            className="accent-primary"
                          />
                          Individual
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="scope"
                            checked={wizardData.assignmentScope === "Group"}
                            onChange={() => setWizardData({ ...wizardData, assignmentScope: "Group" })}
                            className="accent-primary"
                          />
                          Group Assignment
                        </label>
                      </div>
                    </div>

                    <div className="p-4 bg-card/40 border border-card rounded-2xl">
                      <h4 className="font-extrabold text-xs text-text mb-2">Grading Method</h4>
                      <div className="flex gap-4 text-xs font-bold">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="eval"
                            checked={wizardData.evaluationMode === "Manual Review"}
                            onChange={() => setWizardData({ ...wizardData, evaluationMode: "Manual Review" })}
                            className="accent-primary"
                          />
                          Instructor Manual Review
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="eval"
                            checked={wizardData.evaluationMode === "Auto Grade"}
                            onChange={() => setWizardData({ ...wizardData, evaluationMode: "Auto Grade" })}
                            className="accent-primary"
                          />
                          Auto Grade
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 4: RESOURCES */}
              {wizardStep === 4 && (
                <div className="space-y-4">
                  <p className="text-xs font-semibold text-subtext">Upload reference materials, starter files, or datasets for students.</p>
                  
                  <div className="border-2 border-dashed border-card hover:border-primary/50 rounded-2xl p-8 text-center bg-card/20 transition-all cursor-pointer">
                    <Upload className="w-8 h-8 text-primary mx-auto mb-2" />
                    <p className="font-extrabold text-sm text-text">Drag & drop starter files or PDF guidelines here</p>
                    <p className="text-xs text-subtext mt-1">Supports PDF, ZIP, PNG, JSON up to 50MB</p>
                  </div>

                  <div className="space-y-2 pt-2">
                    <h4 className="font-extrabold text-xs text-text uppercase tracking-wider">Attached Resources ({wizardData.resources.length})</h4>
                    {wizardData.resources.map((res, idx) => (
                      <div key={idx} className="p-3 bg-card border border-card rounded-xl flex items-center justify-between text-xs font-bold">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-primary" />
                          <span>{res.name}</span>
                        </div>
                        <span className="text-[10px] text-emerald-400 font-extrabold uppercase bg-emerald-500/10 px-2 py-0.5 rounded">Ready</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* STEP 5: GRADING RUBRIC */}
              {wizardStep === 5 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-extrabold text-sm text-text">Grading Rubric Criteria</h4>
                      <p className="text-xs text-subtext">Define weightages and evaluation criteria for fair scoring.</p>
                    </div>
                    <button
                      onClick={() => {
                        const newId = `r-${Date.now()}`;
                        setWizardData({
                          ...wizardData,
                          rubric: [...wizardData.rubric, { id: newId, title: "New Criterion", marks: 10, weight: 10, description: "Criterion details" }]
                        });
                      }}
                      className="px-3 py-1.5 bg-primary/10 text-primary border border-primary/20 rounded-xl text-xs font-extrabold flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Criterion
                    </button>
                  </div>

                  <div className="space-y-3">
                    {wizardData.rubric.map((item, idx) => (
                      <div key={item.id} className="p-4 bg-card border border-card rounded-2xl space-y-3">
                        <div className="flex items-center gap-3">
                          <input
                            type="text"
                            value={item.title}
                            onChange={(e) => {
                              const updated = [...wizardData.rubric];
                              updated[idx].title = e.target.value;
                              setWizardData({ ...wizardData, rubric: updated });
                            }}
                            className="flex-1 bg-background border border-card rounded-xl px-3 py-2 text-xs font-extrabold text-text"
                          />
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-subtext">Marks:</span>
                            <input
                              type="number"
                              value={item.marks}
                              onChange={(e) => {
                                const updated = [...wizardData.rubric];
                                updated[idx].marks = Number(e.target.value);
                                setWizardData({ ...wizardData, rubric: updated });
                              }}
                              className="w-16 bg-background border border-card rounded-xl px-2 py-1.5 text-xs font-bold text-text text-center"
                            />
                          </div>
                        </div>
                        <input
                          type="text"
                          value={item.description}
                          onChange={(e) => {
                            const updated = [...wizardData.rubric];
                            updated[idx].description = e.target.value;
                            setWizardData({ ...wizardData, rubric: updated });
                          }}
                          className="w-full bg-background/50 border border-card rounded-xl px-3 py-2 text-xs text-subtext"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* STEP 6: PUBLISH & REVIEW */}
              {wizardStep === 6 && (
                <div className="space-y-6">
                  <div className="p-6 bg-card/40 border border-card rounded-2xl space-y-4">
                    <h3 className="text-lg font-extrabold text-text flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-primary" />
                      Assignment Summary
                    </h3>

                    <div className="grid grid-cols-2 gap-4 text-xs font-semibold">
                      <div><span className="text-subtext block">Title:</span> <span className="font-extrabold text-text">{wizardData.title || "Untitled Assignment"}</span></div>
                      <div><span className="text-subtext block">Course:</span> <span className="font-extrabold text-text">{wizardData.course}</span></div>
                      <div><span className="text-subtext block">Type:</span> <span className="font-extrabold text-primary">{wizardData.type}</span></div>
                      <div><span className="text-subtext block">Total Marks:</span> <span className="font-extrabold text-text">{wizardData.totalMarks} Marks</span></div>
                      <div><span className="text-subtext block">Due Date:</span> <span className="font-extrabold text-purple-400">{wizardData.dueDate.replace("T", " ")}</span></div>
                      <div><span className="text-subtext block">Evaluation Mode:</span> <span className="font-extrabold text-emerald-400">{wizardData.evaluationMode}</span></div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-4 border-t border-card">
                    <button
                      onClick={() => handleCreateAssignment("Draft")}
                      className="w-full sm:w-auto px-6 py-3 bg-card hover:bg-card/80 text-text rounded-xl font-bold text-xs"
                    >
                      Save Draft
                    </button>
                    <button
                      onClick={() => handleCreateAssignment("Published")}
                      className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-primary to-accent hover:opacity-90 text-white rounded-xl font-extrabold text-xs shadow-lg shadow-primary/25"
                    >
                      Publish Now
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer Navigation */}
            <div className="p-4 bg-card/40 border-t border-card flex items-center justify-between">
              <button
                disabled={wizardStep === 1}
                onClick={() => setWizardStep(prev => prev - 1)}
                className="px-4 py-2 rounded-xl bg-card hover:bg-card/80 disabled:opacity-30 text-xs font-bold flex items-center gap-1"
              >
                <ChevronLeft className="w-4 h-4" /> Back
              </button>

              {wizardStep < 6 && (
                <button
                  onClick={() => setWizardStep(prev => prev + 1)}
                  className="px-6 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-white text-xs font-extrabold flex items-center gap-1 shadow-md shadow-primary/20"
                >
                  Next Step <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════
         ASSIGNMENT DETAILS / SUBMISSIONS OVERVIEW MODAL
         ══════════════════════════════════════════════════════════════ */}
      {selectedAssignmentDetails && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="bg-background border border-card rounded-3xl w-full max-w-5xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="p-6 bg-card/40 border-b border-card flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-primary">Assignment Overview</span>
                <h2 className="text-2xl font-extrabold text-text">{selectedAssignmentDetails.title}</h2>
                <p className="text-xs text-subtext font-medium">{selectedAssignmentDetails.course} • {selectedAssignmentDetails.module}</p>
              </div>
              <button onClick={() => setSelectedAssignmentDetails(null)} className="p-2 text-subtext hover:text-text rounded-xl bg-card">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Overview Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-6 gap-3">
                {[
                  { label: "Total Students", value: selectedAssignmentDetails.totalStudents || 45, color: "text-text", bg: "bg-card" },
                  { label: "Submitted", value: selectedAssignmentDetails.submissionsCount, color: "text-emerald-400", bg: "bg-emerald-500/10" },
                  { label: "Pending", value: selectedAssignmentDetails.pendingReviewCount, color: "text-purple-400", bg: "bg-purple-500/10" },
                  { label: "Avg Score", value: selectedAssignmentDetails.averageScore > 0 ? `${selectedAssignmentDetails.averageScore}%` : "—", color: "text-primary", bg: "bg-primary/10" },
                  { label: "Highest", value: "98%", color: "text-blue-400", bg: "bg-blue-500/10" },
                  { label: "Lowest", value: "62%", color: "text-amber-400", bg: "bg-amber-500/10" },
                ].map((st, idx) => (
                  <div key={idx} className="p-3 bg-card/60 border border-card rounded-2xl text-center space-y-1">
                    <span className="text-[10px] font-extrabold text-subtext uppercase tracking-wider block">{st.label}</span>
                    <p className={`text-xl font-black ${st.color}`}>{st.value}</p>
                  </div>
                ))}
              </div>

              {/* Submissions Table */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-extrabold text-sm text-text flex items-center gap-2">
                    <Users className="w-4 h-4 text-primary" />
                    Student Submissions ({INITIAL_SUBMISSIONS.length})
                  </h3>
                  <span className="text-xs text-subtext">Click Review & Grade to evaluate</span>
                </div>

                <div className="bg-card/40 border border-card rounded-2xl overflow-hidden shadow-md">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-card/80 border-b border-card text-[10px] font-black text-subtext uppercase tracking-wider">
                        <th className="py-3 px-4">Student</th>
                        <th className="py-3 px-4">Submission Time</th>
                        <th className="py-3 px-4">Score</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4 text-right">Review Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-card/60">
                      {INITIAL_SUBMISSIONS.map((sub) => (
                        <tr key={sub.id} className="hover:bg-card/30 transition-colors">
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-2.5">
                              <div className="w-7 h-7 rounded-full bg-primary/20 text-primary font-black text-xs flex items-center justify-center shrink-0 border border-primary/30">
                                {sub.studentName.charAt(0)}
                              </div>
                              <div>
                                <span className="font-bold text-text block">{sub.studentName}</span>
                                <span className="text-[10px] text-subtext">{sub.studentEmail}</span>
                              </div>
                            </div>
                          </td>
                          <td className="py-3.5 px-4 text-subtext font-medium whitespace-nowrap">
                            <span className="flex items-center gap-1.5">
                              <Clock className="w-3.5 h-3.5 text-subtext" />
                              {sub.submissionTime}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 font-black text-text whitespace-nowrap">
                            {sub.score !== null ? (
                              <span className="text-emerald-400 font-extrabold text-xs px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20">
                                {sub.score} / 100
                              </span>
                            ) : (
                              <span className="text-subtext font-medium">—</span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                              sub.status === "Graded"
                                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                            }`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${sub.status === "Graded" ? "bg-emerald-400" : "bg-amber-400"}`} />
                              {sub.status}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right whitespace-nowrap">
                            <button
                              onClick={() => { setSelectedSubmissionToReview(sub); setReviewScore(sub.score || 85); setReviewFeedback(sub.feedback || ""); }}
                              className="px-3.5 py-1.5 bg-primary hover:bg-primary/90 text-white rounded-xl font-extrabold text-xs shadow-sm transition-all hover:scale-[1.02]"
                            >
                              Review & Grade
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── STUDENT SUBMISSION REVIEW MODAL ─── */}
      {selectedSubmissionToReview && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
          <div className="bg-background border border-card rounded-3xl w-full max-w-2xl p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-card pb-4">
              <div>
                <span className="text-[10px] font-black text-primary uppercase tracking-widest">Review Submission</span>
                <h3 className="text-xl font-extrabold text-text">{selectedSubmissionToReview.studentName}</h3>
                <p className="text-xs text-subtext">{selectedSubmissionToReview.studentEmail}</p>
              </div>
              <button onClick={() => setSelectedSubmissionToReview(null)} className="p-2 text-subtext hover:text-text rounded-xl bg-card">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 bg-card border border-card rounded-2xl space-y-2">
              <span className="text-[10px] font-bold text-subtext uppercase">Submitted Response & Files</span>
              <p className="text-xs text-text font-medium">{selectedSubmissionToReview.submittedText}</p>
              {selectedSubmissionToReview.submittedFileName && (
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-background border border-card rounded-xl text-xs font-bold text-primary mt-2">
                  <FileDown className="w-3.5 h-3.5" />
                  <span>{selectedSubmissionToReview.submittedFileName}</span>
                </div>
              )}
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-text mb-1">Score (Out of 100)</label>
                <input
                  type="number"
                  max={100}
                  min={0}
                  value={reviewScore}
                  onChange={(e) => setReviewScore(Number(e.target.value))}
                  className="w-full bg-card border border-card rounded-xl px-4 py-2.5 text-sm font-extrabold text-text"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-text mb-1">Feedback Comments for Student</label>
                <textarea
                  rows={3}
                  value={reviewFeedback}
                  onChange={(e) => setReviewFeedback(e.target.value)}
                  placeholder="Provide constructive feedback..."
                  className="w-full bg-card border border-card rounded-xl px-4 py-2.5 text-xs text-text font-medium"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-card">
              <button onClick={() => setSelectedSubmissionToReview(null)} className="px-4 py-2 bg-card text-subtext rounded-xl font-bold text-xs">
                Cancel
              </button>
              <button
                onClick={() => setSelectedSubmissionToReview(null)}
                className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-extrabold text-xs shadow-md shadow-emerald-500/20"
              >
                Save Grade & Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
