"use client";

import React, { useState, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  CheckSquare,
  Plus,
  Search,
  Filter,
  Eye,
  CheckCircle2,
  AlertTriangle,
  Clock,
  DollarSign,
  Calendar,
  Layers,
  ChevronRight,
  Sparkles,
  Check,
  X,
  RotateCcw,
  Radio,
  FileText,
  User,
  BookOpen,
  ArrowRight,
  UploadCloud,
  Send,
  MoreVertical,
  Loader2
} from "lucide-react";

export type AdminTaskStatus =
  | "ALL"
  | "ASSIGNED"
  | "IN_PROGRESS"
  | "SUBMITTED"
  | "UNDER_REVIEW"
  | "COMPLETED"
  | "REJECTED";

export type TaskType =
  | "Create Course"
  | "Create Assignment"
  | "Conduct Live Session"
  | "Create Learning Material"
  | "Update Course"
  | "Custom";

export type TaskPriority = "Urgent" | "High" | "Normal" | "Low";

interface TaskItem {
  id: string;
  title: string;
  type: TaskType;
  instructor: string;
  instructorEmail: string;
  course: string;
  deadline: string;
  compensation: number;
  paymentStatus: "Pending" | "Processing" | "Paid" | "Approved";
  priority: TaskPriority;
  status: "ASSIGNED" | "IN_PROGRESS" | "SUBMITTED" | "UNDER_REVIEW" | "COMPLETED" | "REJECTED";
  description: string;
  deliverables?: string[];
  submittedNote?: string;
  reviewNotes?: string;
  createdAt: string;
}

const INITIAL_ADMIN_TASKS: TaskItem[] = [
  {
    id: "TSK-1042",
    title: "AI Bootcamp: Multi-Agent System Architecture Review",
    type: "Conduct Live Session",
    instructor: "Alex Chen",
    instructorEmail: "alex.chen@glarus.edu",
    course: "Agentic AI & Autonomous Workflows",
    deadline: "20 Aug 2026",
    compensation: 5000,
    paymentStatus: "Pending",
    priority: "Urgent",
    status: "UNDER_REVIEW",
    description: "Conduct 90-min live capstone workshop on LangGraph multi-agent orchestration and evaluate student projects.",
    deliverables: ["Recorded Live Stream Video (1080p)", "GitHub Starter Repository with LangGraph", "Student Evaluation Rubric Sheet"],
    submittedNote: "Live session concluded with 84 students. Repository and recording links uploaded.",
    createdAt: "12 Aug 2026"
  },
  {
    id: "TSK-1043",
    title: "Develop Advanced RAG Pipeline Curriculum Modules",
    type: "Create Course",
    instructor: "Dr. Sarah Chen",
    instructorEmail: "sarah.chen@glarus.edu",
    course: "Advanced RAG Architecture",
    deadline: "28 Aug 2026",
    compensation: 15000,
    paymentStatus: "Pending",
    priority: "High",
    status: "IN_PROGRESS",
    description: "Author 6 comprehensive video lectures and 3 code labs covering Self-RAG, Hybrid Search, and Re-ranking.",
    deliverables: ["6 Video Lectures (.mp4)", "Course Slide Deck (.pdf)", "Code Labs (.ipynb)"],
    createdAt: "10 Aug 2026"
  },
  {
    id: "TSK-1044",
    title: "Build Python Interactive Code Lab Playground",
    type: "Create Learning Material",
    instructor: "Jessica Lin",
    instructorEmail: "jessica.lin@glarus.edu",
    course: "Python for Data Science",
    deadline: "18 Aug 2026",
    compensation: 8500,
    paymentStatus: "Processing",
    priority: "High",
    status: "SUBMITTED",
    description: "Create 12 automated unit test scenarios and interactive code challenges for Python Data Structures.",
    deliverables: ["12 Interactive Coding Problems (JSON)", "PyTest Test Runners", "Detailed Solution Explanations"],
    submittedNote: "All 12 challenge problems tested against Python 3.12 sandbox environment.",
    createdAt: "08 Aug 2026"
  },
  {
    id: "TSK-1045",
    title: "Update Next.js 14 Course to Next.js 15 Compatibility",
    type: "Update Course",
    instructor: "John Doe",
    instructorEmail: "john.doe@glarus.edu",
    course: "React Masterclass",
    deadline: "05 Sep 2026",
    compensation: 6000,
    paymentStatus: "Pending",
    priority: "Normal",
    status: "ASSIGNED",
    description: "Update deprecated fetch caching syntax and middleware conventions to match latest Next.js release guidelines.",
    deliverables: ["Updated Section 3 & 4 Videos", "Migrated Example Repo on GitHub"],
    createdAt: "14 Aug 2026"
  },
  {
    id: "TSK-1046",
    title: "Create React 19 Server Actions Capstone Project",
    type: "Create Assignment",
    instructor: "John Doe",
    instructorEmail: "john.doe@glarus.edu",
    course: "React Masterclass",
    deadline: "02 Aug 2026",
    compensation: 4500,
    paymentStatus: "Paid",
    priority: "Normal",
    status: "COMPLETED",
    description: "Develop full-stack e-commerce cart grading assignment utilizing React 19 form actions.",
    deliverables: ["Grading Assignment Spec", "Automated Evaluation Script"],
    createdAt: "25 Jul 2026"
  }
];

export default function AdminTasksPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center justify-center min-h-[50vh] text-subtext space-y-3">
          <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
          <p className="text-sm font-semibold text-text">Loading Task Management...</p>
        </div>
      }
    >
      <AdminTasksContent />
    </Suspense>
  );
}

function AdminTasksContent() {
  const searchParams = useSearchParams();
  const initialTab = (searchParams.get("tab") as AdminTaskStatus) || "ALL";

  const [activeTab, setActiveTab] = useState<AdminTaskStatus>(initialTab);
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [priorityFilter, setPriorityFilter] = useState("ALL");
  const [tasks, setTasks] = useState<TaskItem[]>(INITIAL_ADMIN_TASKS);
  const [selectedTask, setSelectedTask] = useState<TaskItem | null>(null);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);

  // New task modal state
  const [newTitle, setNewTitle] = useState("");
  const [newType, setNewType] = useState<TaskType>("Create Learning Material");
  const [newInstructor, setNewInstructor] = useState("Alex Chen");
  const [newCourse, setNewCourse] = useState("Agentic AI & Autonomous Workflows");
  const [newDeadline, setNewDeadline] = useState("30 Aug 2026");
  const [newCompensation, setNewCompensation] = useState("5000");
  const [newPriority, setNewPriority] = useState<TaskPriority>("High");
  const [newDescription, setNewDescription] = useState("");

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newTask: TaskItem = {
      id: `TSK-${Math.floor(1000 + Math.random() * 9000)}`,
      title: newTitle,
      type: newType,
      instructor: newInstructor,
      instructorEmail: `${newInstructor.toLowerCase().replace(" ", ".")}@glarus.edu`,
      course: newCourse,
      deadline: newDeadline,
      compensation: parseFloat(newCompensation) || 0,
      paymentStatus: "Pending",
      priority: newPriority,
      status: "ASSIGNED",
      description: newDescription,
      deliverables: ["Primary Deliverable File/Repo", "Documentation Summary"],
      createdAt: "Today"
    };

    setTasks([newTask, ...tasks]);
    setIsAssignModalOpen(false);
    setNewTitle("");
    setNewDescription("");
  };

  const handleUpdateTaskStatus = (
    taskId: string,
    newStatus: "ASSIGNED" | "IN_PROGRESS" | "SUBMITTED" | "UNDER_REVIEW" | "COMPLETED" | "REJECTED",
    payment?: "Pending" | "Processing" | "Paid" | "Approved"
  ) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          return {
            ...t,
            status: newStatus,
            paymentStatus: payment || t.paymentStatus
          };
        }
        return t;
      })
    );
    if (selectedTask?.id === taskId) {
      setSelectedTask((prev) =>
        prev
          ? {
              ...prev,
              status: newStatus,
              paymentStatus: payment || prev.paymentStatus
            }
          : null
      );
    }
  };

  // Filter tasks
  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      // Tab matching
      if (activeTab !== "ALL" && t.status !== activeTab) return false;

      // Query matching
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchId = t.id.toLowerCase().includes(q);
        const matchTitle = t.title.toLowerCase().includes(q);
        const matchInst = t.instructor.toLowerCase().includes(q);
        const matchCourse = t.course.toLowerCase().includes(q);
        if (!matchId && !matchTitle && !matchInst && !matchCourse) return false;
      }

      // Type filter
      if (typeFilter !== "ALL" && t.type !== typeFilter) return false;

      // Priority filter
      if (priorityFilter !== "ALL" && t.priority !== priorityFilter) return false;

      return true;
    });
  }, [tasks, activeTab, searchQuery, typeFilter, priorityFilter]);

  const underReviewCount = tasks.filter((t) => t.status === "UNDER_REVIEW").length;
  const submittedCount = tasks.filter((t) => t.status === "SUBMITTED").length;

  return (
    <div className="space-y-6 pb-12">
      {/* Top Action Bar */}
      <div className="flex items-center justify-end">
        <button
          onClick={() => setIsAssignModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs sm:text-sm transition-all shadow-lg hover:shadow-purple-600/20 flex items-center gap-2 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>+ Assign New Task</span>
        </button>
      </div>

      {/* Visual Lifecycle Stepper Pipeline */}
      <div className="bg-card border border-white/10 rounded-2xl p-4 sm:p-5 shadow-xl space-y-3">
        <p className="text-[11px] font-bold text-purple-400 uppercase tracking-wider">
          Task Execution & Governance Pipeline
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 text-center text-xs">
          {[
            { step: "1. Created", label: "Spec Drafted" },
            { step: "2. Assigned", label: "Sent to Faculty" },
            { step: "3. In Progress", label: "Work Active" },
            { step: "4. Submitted", label: "Uploads Ready" },
            { step: "5. Admin Review", label: "QA & Audit" },
            { step: "6. Approved", label: "Quality Verified" },
            { step: "7. Completed", label: "Payout Cleared" }
          ].map((item, idx) => (
            <div
              key={item.step}
              className="p-2.5 rounded-xl bg-background/50 border border-white/5 flex flex-col justify-center items-center group hover:border-purple-500/30 transition-colors"
            >
              <span className="text-[10px] font-bold text-subtext group-hover:text-purple-300 transition-colors">
                {item.step}
              </span>
              <span className="text-xs font-bold text-text mt-0.5">{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Tab Filter Bar */}
      <div className="flex bg-card p-1 rounded-xl border border-white/10 shadow-inner overflow-x-auto custom-scrollbar">
        <button
          onClick={() => setActiveTab("ALL")}
          className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all shrink-0 ${
            activeTab === "ALL"
              ? "bg-purple-600 text-white shadow-sm"
              : "text-subtext hover:text-text hover:bg-white/5"
          }`}
        >
          All Tasks ({tasks.length})
        </button>

        <button
          onClick={() => setActiveTab("ASSIGNED")}
          className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all shrink-0 ${
            activeTab === "ASSIGNED"
              ? "bg-purple-600 text-white shadow-sm"
              : "text-subtext hover:text-text hover:bg-white/5"
          }`}
        >
          Assigned
        </button>

        <button
          onClick={() => setActiveTab("IN_PROGRESS")}
          className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all shrink-0 ${
            activeTab === "IN_PROGRESS"
              ? "bg-purple-600 text-white shadow-sm"
              : "text-subtext hover:text-text hover:bg-white/5"
          }`}
        >
          In Progress
        </button>

        <button
          onClick={() => setActiveTab("SUBMITTED")}
          className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
            activeTab === "SUBMITTED"
              ? "bg-purple-600 text-white shadow-sm"
              : "text-subtext hover:text-text hover:bg-white/5"
          }`}
        >
          <span>Submitted</span>
          {submittedCount > 0 && (
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-500 text-black font-black">
              {submittedCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab("UNDER_REVIEW")}
          className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
            activeTab === "UNDER_REVIEW"
              ? "bg-purple-600 text-white shadow-sm"
              : "text-subtext hover:text-text hover:bg-white/5"
          }`}
        >
          <span>Under Review</span>
          {underReviewCount > 0 && (
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-red-500 text-white font-black">
              {underReviewCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab("COMPLETED")}
          className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all shrink-0 ${
            activeTab === "COMPLETED"
              ? "bg-purple-600 text-white shadow-sm"
              : "text-subtext hover:text-text hover:bg-white/5"
          }`}
        >
          Completed
        </button>

        <button
          onClick={() => setActiveTab("REJECTED")}
          className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all shrink-0 ${
            activeTab === "REJECTED"
              ? "bg-purple-600 text-white shadow-sm"
              : "text-subtext hover:text-text hover:bg-white/5"
          }`}
        >
          Rejected
        </button>
      </div>

      {/* Search & Filters */}
      <div className="bg-card border border-white/10 rounded-2xl p-4 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-subtext absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by task title, ID, instructor, course..."
            className="w-full bg-background border border-white/10 pl-9 pr-4 py-2 rounded-xl text-xs sm:text-sm text-text placeholder:text-subtext/60 focus:outline-none focus:border-purple-500/50"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-subtext hover:text-text"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto justify-end">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="bg-background border border-white/10 text-xs font-semibold text-text px-3 py-2 rounded-xl focus:outline-none focus:border-purple-500/50"
          >
            <option value="ALL">All Task Types</option>
            <option value="Create Course">Create Course</option>
            <option value="Create Assignment">Create Assignment</option>
            <option value="Conduct Live Session">Conduct Live Session</option>
            <option value="Create Learning Material">Create Learning Material</option>
            <option value="Update Course">Update Course</option>
            <option value="Custom">Custom</option>
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="bg-background border border-white/10 text-xs font-semibold text-text px-3 py-2 rounded-xl focus:outline-none focus:border-purple-500/50"
          >
            <option value="ALL">All Priorities</option>
            <option value="Urgent">Urgent</option>
            <option value="High">High</option>
            <option value="Normal">Normal</option>
            <option value="Low">Low</option>
          </select>

          <span className="text-xs font-semibold text-subtext px-2 py-1 bg-background/50 rounded-lg border border-white/5">
            {filteredTasks.length} tasks
          </span>
        </div>
      </div>

      {/* Task Table */}
      <div className="bg-card border border-white/10 rounded-2xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse min-w-[1050px]">
            <thead>
              <tr className="border-b border-white/10 bg-background/50 text-[10px] font-black text-subtext uppercase tracking-wider">
                <th className="py-4 px-6 w-[28%]">Task & Title</th>
                <th className="py-4 px-4 w-[16%]">Instructor</th>
                <th className="py-4 px-4 w-[16%]">Course</th>
                <th className="py-4 px-4 text-center">Type</th>
                <th className="py-4 px-4 text-center">Deadline</th>
                <th className="py-4 px-4 text-right">Compensation</th>
                <th className="py-4 px-4 text-center">Status</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-xs font-medium">
              {filteredTasks.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-subtext space-y-2">
                    <CheckSquare className="w-10 h-10 mx-auto opacity-30 text-purple-400" />
                    <p className="text-sm font-bold text-text">No tasks found</p>
                    <p className="text-xs">Try clearing search parameters or assign a new task.</p>
                  </td>
                </tr>
              ) : (
                filteredTasks.map((task) => (
                  <tr
                    key={task.id}
                    className="hover:bg-white/5 transition-colors group cursor-pointer"
                    onClick={() => setSelectedTask(task)}
                  >
                    {/* Task Title & Code */}
                    <td className="py-4 px-6">
                      <div className="flex items-start gap-2.5">
                        <span className="font-mono text-[11px] font-bold text-purple-400 mt-0.5">
                          {task.id}
                        </span>
                        <div className="min-w-0">
                          <h4 className="font-bold text-text text-sm group-hover:text-purple-300 transition-colors truncate max-w-[260px]">
                            {task.title}
                          </h4>
                          <span
                            className={`inline-block mt-0.5 px-2 py-0.2 rounded text-[10px] font-bold border ${
                              task.priority === "Urgent"
                                ? "bg-red-500/10 text-red-400 border-red-500/20"
                                : task.priority === "High"
                                ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                                : "bg-purple-500/10 text-purple-400 border-purple-500/20"
                            }`}
                          >
                            {task.priority} Priority
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Instructor */}
                    <td className="py-4 px-4">
                      <p className="font-bold text-text truncate">{task.instructor}</p>
                      <span className="text-[10px] text-subtext truncate">{task.instructorEmail}</span>
                    </td>

                    {/* Course */}
                    <td className="py-4 px-4">
                      <p className="text-text font-semibold truncate max-w-[150px]">{task.course}</p>
                    </td>

                    {/* Type */}
                    <td className="py-4 px-4 text-center">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-card border border-white/10 text-purple-300">
                        {task.type}
                      </span>
                    </td>

                    {/* Deadline */}
                    <td className="py-4 px-4 text-center font-mono text-subtext text-[11px]">
                      {task.deadline}
                    </td>

                    {/* Compensation */}
                    <td className="py-4 px-4 text-right font-bold text-emerald-400">
                      ₹{task.compensation.toLocaleString()}
                      <span className="text-[10px] text-subtext block font-normal">{task.paymentStatus}</span>
                    </td>

                    {/* Status */}
                    <td className="py-4 px-4 text-center">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-black border uppercase tracking-wider ${
                          task.status === "COMPLETED"
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                            : task.status === "UNDER_REVIEW"
                            ? "bg-red-500/10 text-red-400 border-red-500/30"
                            : task.status === "SUBMITTED"
                            ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                            : task.status === "IN_PROGRESS"
                            ? "bg-purple-500/10 text-purple-400 border-purple-500/30"
                            : "bg-card text-subtext border-white/10"
                        }`}
                      >
                        {task.status.replace("_", " ")}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-6 text-right" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => setSelectedTask(task)}
                        className="px-2.5 py-1.5 rounded-lg bg-card hover:bg-purple-600 hover:text-white border border-white/10 text-xs font-bold text-subtext hover:text-white transition-all flex items-center gap-1 ml-auto"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Review</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── ASSIGN NEW TASK MODAL ── */}
      {isAssignModalOpen && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
          <div className="w-full max-w-xl bg-card border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-5 border-b border-white/10 flex items-center justify-between bg-background/50">
              <div className="flex items-center gap-2">
                <CheckSquare className="w-5 h-5 text-purple-400" />
                <h3 className="font-bold text-base text-text">Commission / Assign New Task</h3>
              </div>
              <button
                onClick={() => setIsAssignModalOpen(false)}
                className="p-1 rounded-lg text-subtext hover:text-text hover:bg-white/5"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="p-5 overflow-y-auto custom-scrollbar space-y-4 text-xs">
              <div>
                <label className="text-[11px] font-bold text-subtext uppercase tracking-wider block mb-1">
                  Task Title *
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Build Interactive Python Code Lab Playground"
                  className="w-full bg-background border border-white/10 rounded-xl px-3 py-2 text-sm text-text focus:outline-none focus:border-purple-500/50"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-subtext uppercase tracking-wider block mb-1">
                    Task Type
                  </label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as TaskType)}
                    className="w-full bg-background border border-white/10 rounded-xl px-3 py-2 text-xs font-semibold text-text focus:outline-none focus:border-purple-500/50"
                  >
                    <option value="Create Course">Create Course</option>
                    <option value="Create Assignment">Create Assignment</option>
                    <option value="Conduct Live Session">Conduct Live Session</option>
                    <option value="Create Learning Material">Create Learning Material</option>
                    <option value="Update Course">Update Course</option>
                    <option value="Custom">Custom Task</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-subtext uppercase tracking-wider block mb-1">
                    Assignee Instructor
                  </label>
                  <select
                    value={newInstructor}
                    onChange={(e) => setNewInstructor(e.target.value)}
                    className="w-full bg-background border border-white/10 rounded-xl px-3 py-2 text-xs font-semibold text-text focus:outline-none focus:border-purple-500/50"
                  >
                    <option value="Dr. Sarah Chen">Dr. Sarah Chen</option>
                    <option value="Alex Chen">Alex Chen</option>
                    <option value="John Doe">John Doe</option>
                    <option value="Jessica Lin">Jessica Lin</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-subtext uppercase tracking-wider block mb-1">
                    Deadline
                  </label>
                  <input
                    type="text"
                    value={newDeadline}
                    onChange={(e) => setNewDeadline(e.target.value)}
                    placeholder="e.g. 30 Aug 2026"
                    className="w-full bg-background border border-white/10 rounded-xl px-3 py-2 text-xs text-text focus:outline-none focus:border-purple-500/50"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-subtext uppercase tracking-wider block mb-1">
                    Compensation (₹)
                  </label>
                  <input
                    type="number"
                    value={newCompensation}
                    onChange={(e) => setNewCompensation(e.target.value)}
                    placeholder="5000"
                    className="w-full bg-background border border-white/10 rounded-xl px-3 py-2 text-xs text-text focus:outline-none focus:border-purple-500/50"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-subtext uppercase tracking-wider block mb-1">
                    Priority
                  </label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as TaskPriority)}
                    className="w-full bg-background border border-white/10 rounded-xl px-3 py-2 text-xs font-semibold text-text focus:outline-none focus:border-purple-500/50"
                  >
                    <option value="Urgent">Urgent</option>
                    <option value="High">High</option>
                    <option value="Normal">Normal</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-subtext uppercase tracking-wider block mb-1">
                  Context Course
                </label>
                <input
                  type="text"
                  value={newCourse}
                  onChange={(e) => setNewCourse(e.target.value)}
                  placeholder="e.g. Agentic AI & Autonomous Workflows"
                  className="w-full bg-background border border-white/10 rounded-xl px-3 py-2 text-xs text-text focus:outline-none focus:border-purple-500/50"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-subtext uppercase tracking-wider block mb-1">
                  Detailed Instructions & Deliverables Spec
                </label>
                <textarea
                  rows={4}
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Outline expected deliverables, rubric criteria, and repository requirements..."
                  className="w-full bg-background border border-white/10 rounded-xl p-3 text-xs text-text placeholder:text-subtext/60 focus:outline-none focus:border-purple-500/50 resize-none"
                />
              </div>

              <div className="pt-2 border-t border-white/10 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAssignModalOpen(false)}
                  className="py-2 px-4 rounded-xl bg-card hover:bg-white/5 border border-white/10 text-subtext font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="py-2 px-4 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition-colors shadow-md flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Assign Task</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── TASK REVIEW & GOVERNANCE SIDE DRAWER ── */}
      {selectedTask && (
        <TaskReviewDrawer
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          onUpdateStatus={handleUpdateTaskStatus}
        />
      )}
    </div>
  );
}

function TaskReviewDrawer({
  task,
  onClose,
  onUpdateStatus
}: {
  task: TaskItem;
  onClose: () => void;
  onUpdateStatus: (
    taskId: string,
    newStatus: "ASSIGNED" | "IN_PROGRESS" | "SUBMITTED" | "UNDER_REVIEW" | "COMPLETED" | "REJECTED",
    payment?: "Pending" | "Processing" | "Paid" | "Approved"
  ) => void;
}) {
  const [reviewNote, setReviewNote] = useState("");

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-md flex justify-end animate-in fade-in">
      <div className="w-full max-w-2xl bg-card border-l border-white/10 h-full flex flex-col shadow-2xl relative animate-in slide-in-from-right-8 duration-200">
        {/* Header */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between bg-background/50 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-600/20 text-purple-400 flex items-center justify-center font-mono font-bold text-xs border border-purple-500/30">
              {task.id}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-text truncate max-w-[320px]">{task.title}</h2>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-black border uppercase tracking-wider ${
                    task.status === "COMPLETED"
                      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                      : task.status === "UNDER_REVIEW"
                      ? "bg-red-500/10 text-red-400 border-red-500/30"
                      : "bg-amber-500/10 text-amber-400 border-amber-500/30"
                  }`}
                >
                  {task.status.replace("_", " ")}
                </span>
              </div>
              <p className="text-xs text-subtext mt-0.5">
                Instructor: {task.instructor} • {task.type} • Due: {task.deadline}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-background hover:bg-card border border-white/10 text-subtext hover:text-text transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar text-xs">
          {/* Key Metrics */}
          <div className="grid grid-cols-3 gap-3 p-3.5 rounded-xl bg-background/50 border border-white/5 text-center">
            <div>
              <p className="text-[10px] text-subtext uppercase">Compensation</p>
              <p className="text-sm font-bold text-emerald-400 mt-0.5">₹{task.compensation.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-[10px] text-subtext uppercase">Payment Status</p>
              <p className="text-sm font-bold text-purple-300 mt-0.5">{task.paymentStatus}</p>
            </div>
            <div>
              <p className="text-[10px] text-subtext uppercase">Priority</p>
              <p className="text-sm font-bold text-amber-400 mt-0.5">{task.priority}</p>
            </div>
          </div>

          {/* Description & Scope */}
          <div className="p-4 rounded-xl bg-background/40 border border-white/10 space-y-2">
            <h3 className="text-xs font-bold text-purple-400 uppercase tracking-wider flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5" />
              <span>Task Specification & Description</span>
            </h3>
            <p className="text-xs text-text leading-relaxed bg-card p-3 rounded-lg border border-white/5">
              {task.description}
            </p>
          </div>

          {/* Submitted Deliverables */}
          <div className="p-4 rounded-xl bg-background/40 border border-white/10 space-y-2.5">
            <h3 className="text-xs font-bold text-purple-400 uppercase tracking-wider flex items-center gap-1.5">
              <UploadCloud className="w-3.5 h-3.5" />
              <span>Instructor Submitted Deliverables</span>
            </h3>

            {task.submittedNote && (
              <p className="text-[11px] text-subtext italic bg-card p-2.5 rounded-lg border border-white/5">
                &ldquo;{task.submittedNote}&rdquo;
              </p>
            )}

            <div className="space-y-1.5">
              {(task.deliverables || ["Final Deliverables Archive"]).map((d, i) => (
                <div key={i} className="p-2.5 rounded-lg bg-card border border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span className="font-semibold text-text">{d}</span>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/20">
                    Uploaded
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Admin Review Notes */}
          <div className="p-4 rounded-xl bg-background/40 border border-white/10 space-y-2">
            <label className="text-[11px] font-bold text-subtext uppercase tracking-wider block">
              Admin QA Feedback / Revision Notes
            </label>
            <textarea
              value={reviewNote}
              onChange={(e) => setReviewNote(e.target.value)}
              placeholder="Provide comments, required revisions or acceptance acknowledgment..."
              className="w-full bg-card border border-white/10 rounded-xl p-3 text-xs text-text placeholder:text-subtext/60 focus:outline-none focus:border-purple-500/50 resize-none h-20"
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-white/10 bg-background/60 flex items-center justify-between gap-2 shrink-0">
          <button
            onClick={() => onUpdateStatus(task.id, "COMPLETED", "Paid")}
            className="py-2 px-3 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-xs font-bold transition-all flex items-center gap-1.5"
          >
            <DollarSign className="w-3.5 h-3.5" />
            <span>Mark Payout Settled</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onUpdateStatus(task.id, "IN_PROGRESS")}
              className="py-2 px-3 rounded-xl bg-card hover:bg-white/5 border border-white/10 text-amber-400 text-xs font-bold transition-all flex items-center gap-1"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Request Revision</span>
            </button>

            <button
              onClick={() => onUpdateStatus(task.id, "REJECTED")}
              className="py-2 px-3 rounded-xl bg-red-500/15 hover:bg-red-500/25 border border-red-500/30 text-red-300 text-xs font-bold transition-all flex items-center gap-1"
            >
              <X className="w-3.5 h-3.5" />
              <span>Reject</span>
            </button>

            <button
              onClick={() => onUpdateStatus(task.id, "COMPLETED", "Approved")}
              className="py-2 px-4 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all shadow-md flex items-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Approve Task</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
