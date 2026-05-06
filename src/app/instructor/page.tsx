"use client";

import { useEffect, useState } from "react";
import {
  Users, FileText, CheckCircle, BarChart3, Plus, X, Loader2,
  Tv, Layers, ClipboardList, LineChart, Sparkles,
  Video, Code, HelpCircle, GripVertical, ChevronDown, ChevronRight,
  AlertTriangle, UserX, ArrowRight, BookOpen, Settings, PieChart,
  Activity, Bell, Edit3, RefreshCw, Check, Save, PlayCircle, Layout,
  CheckCircle2, IndianRupee, TrendingUp, Eye, Trash2, Clock
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

/* ═══════════════════════════════════════════════
   TYPE DEFINITIONS
   ═══════════════════════════════════════════════ */

interface AIModule {
  id: string;
  title: string;
  lessons: string[];
  status: "pending" | "accepted" | "editing" | "regenerating";
}

interface StudioLesson {
  id: string;
  title: string;
  type: "video" | "quiz" | "sandbox" | "text" | "empty";
}

interface StudioModule {
  id: string;
  title: string;
  isExpanded: boolean;
  lessons: StudioLesson[];
}

/* ═══════════════════════════════════════════════
   TOAST COMPONENT
   ═══════════════════════════════════════════════ */

function Toast({ message, type, onClose }: { message: string; type: "success" | "error"; onClose: () => void }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [message, onClose]);
  return (
    <div className={`fixed bottom-6 right-6 p-4 rounded-2xl shadow-2xl font-bold flex items-center gap-3 z-[100] animate-in slide-in-from-bottom-5 ${type === "success" ? "bg-emerald-500 text-white" : "bg-red-500 text-white"}`}>
      {type === "success" ? <CheckCircle className="w-5 h-5" /> : <X className="w-5 h-5" />}
      {message}
    </div>
  );
}

/* ═══════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════ */

export default function InstructorDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("Dashboard");
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  /* ── Shared State ── */
  const [courses, setCourses] = useState<any[]>([]);
  const [stats, setStats] = useState({ totalCourses: 0, approvedCourses: 0, pendingCourses: 0, totalStudents: 0, totalRevenue: 0 });
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  /* ── Create Course Modal ── */
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [formData, setFormData] = useState({ title: "", description: "", price: "" });

  /* ── AI Wizard State ── */
  const [wizardStep, setWizardStep] = useState(2);
  const [aiTopic, setAiTopic] = useState("");
  const [isGeneratingAll, setIsGeneratingAll] = useState(false);
  const [aiModules, setAiModules] = useState<AIModule[]>([]);
  const [editBuffer, setEditBuffer] = useState<{ title: string; lessons: string }>({ title: "", lessons: "" });

  /* ── Course Builder State ── */
  const [builderModules, setBuilderModules] = useState<StudioModule[]>([]);

  /* ── Approve AI Syllabus → Populate Course Builder ── */
  const approveSyllabusAndContinue = () => {
    if (aiModules.length === 0) {
      setToast({ message: "Generate a syllabus first before approving.", type: "error" });
      return;
    }

    // Convert AI modules → Course Builder studio modules
    const converted: StudioModule[] = aiModules.map((m, mIdx) => ({
      id: `builder-${Date.now()}-${mIdx}`,
      title: m.title,
      isExpanded: mIdx === 0, // expand only the first module by default
      lessons: m.lessons.map((lessonTitle, lIdx) => ({
        id: `builder-l-${Date.now()}-${mIdx}-${lIdx}`,
        title: lessonTitle,
        type: "empty" as const
      }))
    }));

    setBuilderModules(converted);
    setActiveTab("Course Builder");
    setToast({ message: `Syllabus approved! ${converted.length} modules loaded into Course Builder.`, type: "success" });
  };

  /* ── Content Modal State ── */
  const [contentModal, setContentModal] = useState<"video" | "sandbox" | "quiz" | null>(null);
  const [activeModuleId, setActiveModuleId] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState("");
  const [videoTitle, setVideoTitle] = useState("");
  const [sandboxLang, setSandboxLang] = useState("python");
  const [sandboxTitle, setSandboxTitle] = useState("");
  const [submitLoading, setSubmitLoading] = useState(false);

  /* ── Quiz State ── */
  interface QuizQ { question: string; options: string[]; correctIndex: number; explanation: string; }
  const [quizTopic, setQuizTopic] = useState("");
  const [quizQuestions, setQuizQuestions] = useState<QuizQ[]>([]);
  const [quizGenerating, setQuizGenerating] = useState(false);
  const [quizPreview, setQuizPreview] = useState(false);
  const [quizCurrentQ, setQuizCurrentQ] = useState(0);
  const [quizSelected, setQuizSelected] = useState<number | null>(null);
  const [quizAnswered, setQuizAnswered] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const [quizApproved, setQuizApproved] = useState(false);

  const addVideoLesson = () => {
    if (!activeModuleId || !videoTitle.trim()) return;
    setBuilderModules(prev => prev.map(m => m.id === activeModuleId ? { ...m, lessons: [...m.lessons, { id: `vid-${Date.now()}`, title: videoTitle, type: "video" as const }] } : m));
    setVideoUrl(""); setVideoTitle(""); setContentModal(null);
    setToast({ message: "Video lesson added!", type: "success" });
  };

  const addSandboxLesson = () => {
    if (!activeModuleId || !sandboxTitle.trim()) return;
    setBuilderModules(prev => prev.map(m => m.id === activeModuleId ? { ...m, lessons: [...m.lessons, { id: `sb-${Date.now()}`, title: sandboxTitle, type: "sandbox" as const }] } : m));
    setSandboxTitle(""); setSandboxLang("python"); setContentModal(null);
    setToast({ message: "Code sandbox added!", type: "success" });
  };

  const generateQuiz = async () => {
    if (!quizTopic.trim()) return;
    setQuizGenerating(true);
    try {
      const res = await fetch("/api/ai/quiz", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ topic: quizTopic, numQuestions: 5 }) });
      if (res.ok) { const data = await res.json(); if (data.questions) { setQuizQuestions(data.questions); setQuizPreview(false); setQuizApproved(false); setToast({ message: `${data.questions.length} quiz questions generated!`, type: "success" }); } }
      else { setToast({ message: "Failed to generate quiz", type: "error" }); }
    } catch { setToast({ message: "Quiz generation error", type: "error" }); }
    finally { setQuizGenerating(false); }
  };

  const approveAndAddQuiz = () => {
    if (!activeModuleId || quizQuestions.length === 0) return;
    setBuilderModules(prev => prev.map(m => m.id === activeModuleId ? { ...m, lessons: [...m.lessons, { id: `quiz-${Date.now()}`, title: `Quiz: ${quizTopic} (${quizQuestions.length} Qs)`, type: "quiz" as const }] } : m));
    setQuizQuestions([]); setQuizTopic(""); setQuizPreview(false); setQuizApproved(false); setContentModal(null);
    setToast({ message: "Interactive quiz added to module!", type: "success" });
  };

  const startQuizPreview = () => { setQuizPreview(true); setQuizCurrentQ(0); setQuizSelected(null); setQuizAnswered(false); setQuizScore(0); };

  const handleQuizAnswer = (idx: number) => {
    if (quizAnswered) return;
    setQuizSelected(idx); setQuizAnswered(true);
    if (idx === quizQuestions[quizCurrentQ].correctIndex) setQuizScore(prev => prev + 1);
  };

  const nextQuizQ = () => {
    if (quizCurrentQ < quizQuestions.length - 1) { setQuizCurrentQ(prev => prev + 1); setQuizSelected(null); setQuizAnswered(false); }
    else { setQuizPreview(false); setQuizApproved(true); }
  };

  const handleSubmitCourse = async () => {
    if (builderModules.length === 0) { setToast({ message: "Add at least one module before submitting.", type: "error" }); return; }
    setSubmitLoading(true);
    try {
      const desc = builderModules.map(m => `${m.title}: ${m.lessons.map(l => l.title).join(", ")}`).join(" | ");
      const res = await fetch("/api/courses", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ title: aiTopic || `Course - ${new Date().toLocaleDateString()}`, description: desc, price: "4999" }) });
      if (res.ok) { setToast({ message: "Course submitted for admin review! It will appear on the landing page once approved.", type: "success" }); fetchAll(); setActiveTab("My Courses"); }
      else { setToast({ message: "Failed to submit course", type: "error" }); }
    } catch { setToast({ message: "Network error", type: "error" }); }
    finally { setSubmitLoading(false); }
  };

  /* ═══════════════════════════════════════════════
     DATA FETCHING
     ═══════════════════════════════════════════════ */

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [coursesRes, statsRes, studentsRes] = await Promise.all([
        fetch("/api/instructor/courses"),
        fetch("/api/instructor/stats"),
        fetch("/api/instructor/students")
      ]);

      if (coursesRes.status === 401 || coursesRes.status === 403) {
        router.push("/login");
        return;
      }

      const [coursesData, statsData, studentsData] = await Promise.all([
        coursesRes.json(),
        statsRes.json(),
        studentsRes.json()
      ]);

      if (coursesData.myCourses) setCourses(coursesData.myCourses);
      if (statsData.totalCourses !== undefined) setStats(statsData);
      if (studentsData.students) setStudents(studentsData.students);
    } catch {
      /* silent */
    } finally {
      setLoading(false);
    }
  };

  /* ═══════════════════════════════════════════════
     COURSE CREATION
     ═══════════════════════════════════════════════ */

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateLoading(true);
    try {
      const res = await fetch("/api/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (res.ok && data.course) {
        setCourses([data.course, ...courses]);
        setIsModalOpen(false);
        setFormData({ title: "", description: "", price: "" });
        setToast({ message: "Course created & submitted for approval!", type: "success" });
        fetchAll();
      } else {
        setToast({ message: "Failed to create course", type: "error" });
      }
    } catch {
      setToast({ message: "Network error", type: "error" });
    } finally {
      setCreateLoading(false);
    }
  };

  /* ═══════════════════════════════════════════════
     AI SYLLABUS GENERATION
     ═══════════════════════════════════════════════ */

  const generateSyllabus = async () => {
    if (!aiTopic) return;
    setIsGeneratingAll(true);
    try {
      const res = await fetch("/api/ai/syllabus", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: aiTopic })
      });
      if (res.ok) {
        const data = await res.json();
        if (data?.modules) {
          setAiModules(data.modules.map((m: any, i: number) => ({
            id: `gen-${Date.now()}-${i}`,
            title: m.title,
            lessons: m.lessons || [],
            status: "pending"
          })));
          setToast({ message: "AI syllabus generated successfully!", type: "success" });
        }
      } else {
        setToast({ message: "AI generation failed. Check your GROQ API key.", type: "error" });
      }
    } catch {
      setToast({ message: "Failed to connect to AI service", type: "error" });
    } finally {
      setIsGeneratingAll(false);
    }
  };

  const regenerateModule = async (id: string, moduleTitle: string) => {
    setAiModules(prev => prev.map(m => m.id === id ? { ...m, status: "regenerating" } : m));
    try {
      const res = await fetch("/api/ai/syllabus", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: `A single detailed module about: ${moduleTitle}` })
      });
      if (res.ok) {
        const data = await res.json();
        if (data?.modules?.[0]) {
          const rep = data.modules[0];
          setAiModules(prev => prev.map(m => m.id === id ? { ...m, title: rep.title, lessons: rep.lessons || [], status: "pending" } : m));
          return;
        }
      }
      setAiModules(prev => prev.map(m => m.id === id ? { ...m, status: "pending" } : m));
    } catch {
      setAiModules(prev => prev.map(m => m.id === id ? { ...m, status: "pending" } : m));
    }
  };

  const startEditing = (mod: AIModule) => {
    setEditBuffer({ title: mod.title, lessons: mod.lessons.join("\n") });
    setAiModules(prev => prev.map(m => m.id === mod.id ? { ...m, status: "editing" } : m));
  };

  const saveEditing = (id: string) => {
    const newLessons = editBuffer.lessons.split("\n").filter(l => l.trim() !== "");
    setAiModules(prev => prev.map(m => m.id === id ? { ...m, title: editBuffer.title, lessons: newLessons, status: "accepted" } : m));
  };

  /* ═══════════════════════════════════════════════
     SIDEBAR NAV CONFIG
     ═══════════════════════════════════════════════ */

  const sidebarItems = [
    { id: "Dashboard", icon: Activity, badge: null },
    { id: "My Courses", icon: FileText, badge: courses.length },
    { id: "AI Wizard", icon: Sparkles, badge: null },
    { id: "Course Builder", icon: Layers, badge: null },
    { id: "Students", icon: Users, badge: students.length },
    { id: "Analytics", icon: LineChart, badge: null },
  ];

  const wizardSteps = [
    { num: 1, title: "Basic Info", icon: FileText },
    { num: 2, title: "AI Syllabus Generation", icon: Sparkles },
    { num: 3, title: "Content & Media", icon: Video },
    { num: 4, title: "Final Review", icon: CheckCircle2 }
  ];

  /* ═══════════════════════════════════════════════
     RENDER
     ═══════════════════════════════════════════════ */

  return (
    <div className="w-full min-h-screen flex bg-background text-text font-sans">

      {/* ═══════ LEFT SIDEBAR ═══════ */}
      <aside className="w-72 border-r border-card bg-card/5 h-screen sticky top-0 hidden md:flex flex-col pt-8 pb-6 shrink-0">
        <div className="px-6 mb-10">
          <h2 className="text-2xl font-black">
            <span className="text-primary">Instructor</span> Studio
          </h2>
          <p className="text-xs text-subtext font-bold tracking-widest uppercase mt-1">Teaching Dashboard</p>
        </div>

        <nav className="flex-1 space-y-1.5 px-4 overflow-y-auto">
          {sidebarItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-bold text-sm group
                  ${isActive
                    ? "bg-primary text-white shadow-lg shadow-primary/25"
                    : "text-subtext hover:bg-card hover:text-text"
                  }`}
              >
                <item.icon className={`w-5 h-5 ${isActive ? "text-white" : "opacity-60 group-hover:opacity-100"}`} />
                <span className="flex-1 text-left">{item.id}</span>
                {item.badge !== null && item.badge > 0 && (
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${isActive ? "bg-white/20 text-white" : "bg-primary/10 text-primary"}`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="px-4 space-y-2 mt-auto">
          <button className="w-full flex items-center gap-3 px-4 py-3 text-subtext hover:bg-card rounded-xl font-bold text-sm transition-all">
            <Settings className="w-5 h-5 opacity-60" /> Settings
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-white px-4 py-3.5 rounded-xl font-bold shadow-lg shadow-primary/25 transition-all text-sm"
          >
            <Plus className="w-5 h-5" /> Create New Course
          </button>
        </div>
      </aside>

      {/* ═══════ MAIN CONTENT AREA ═══════ */}
      <main className="flex-1 h-screen overflow-y-auto">
        <div className="p-6 md:p-10 max-w-6xl mx-auto pb-32">

          {/* ─── Page Header ─── */}
          <header className="flex items-center justify-between mb-10">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight">
                {activeTab === "AI Wizard" ? "AI Course Creator" : activeTab}
              </h1>
              <p className="text-sm text-subtext mt-1 font-medium">
                {activeTab === "Dashboard" && "Overview of your teaching activity"}
                {activeTab === "My Courses" && "Manage and monitor all your courses"}
                {activeTab === "AI Wizard" && "Generate a complete syllabus with AI in seconds"}
                {activeTab === "Course Builder" && "Design, build, and organize your curriculum"}
                {activeTab === "Students" && "Track student enrollments across your courses"}
                {activeTab === "Analytics" && "Deep insights into your teaching performance"}
              </p>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="md:hidden flex items-center gap-2 bg-primary text-white px-5 py-3 rounded-xl font-bold shadow-lg shadow-primary/25 text-sm"
            >
              <Plus className="w-4 h-4" /> New
            </button>
          </header>

          {/* ══════════════════════════════════════
             TAB: DASHBOARD (Overview)
             ══════════════════════════════════════ */}
          {activeTab === "Dashboard" && (
            <div className="space-y-10 animate-in fade-in duration-300">
              {/* Stats Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { label: "Total Students", value: stats.totalStudents, icon: Users, color: "text-accent", bg: "bg-accent/10" },
                  { label: "Created Courses", value: stats.totalCourses, icon: FileText, color: "text-primary", bg: "bg-primary/10" },
                  { label: "Approved", value: stats.approvedCourses, icon: CheckCircle, color: "text-emerald-500", bg: "bg-emerald-500/10" },
                  { label: "Total Revenue", value: `₹${stats.totalRevenue.toLocaleString()}`, icon: IndianRupee, color: "text-amber-500", bg: "bg-amber-500/10" },
                ].map((stat, i) => (
                  <div key={i} className="bg-card border border-card rounded-2xl p-6 shadow-lg flex flex-col justify-between h-32 relative overflow-hidden group hover:-translate-y-1 transition-transform">
                    <div className={`absolute -right-4 -top-4 w-24 h-24 rounded-full ${stat.bg} blur-2xl pointer-events-none`} />
                    <div className="flex items-center justify-between relative z-10">
                      <span className="text-subtext font-bold text-xs uppercase tracking-widest">{stat.label}</span>
                      <div className={`p-2 rounded-lg ${stat.bg}`}><stat.icon className={`w-5 h-5 ${stat.color}`} /></div>
                    </div>
                    <span className="text-3xl font-black text-text relative z-10">{stat.value}</span>
                  </div>
                ))}
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button onClick={() => setActiveTab("AI Wizard")} className="p-6 bg-gradient-to-br from-purple-500/10 to-purple-500/5 border border-purple-500/20 rounded-2xl text-left hover:border-purple-500/40 transition-colors group">
                  <Sparkles className="w-8 h-8 text-purple-500 mb-3 group-hover:scale-110 transition-transform" />
                  <h3 className="font-bold text-text mb-1">AI Course Wizard</h3>
                  <p className="text-xs text-subtext">Generate a full syllabus with AI in one click</p>
                </button>
                <button onClick={() => setActiveTab("Course Builder")} className="p-6 bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-2xl text-left hover:border-primary/40 transition-colors group">
                  <Layers className="w-8 h-8 text-primary mb-3 group-hover:scale-110 transition-transform" />
                  <h3 className="font-bold text-text mb-1">Course Builder</h3>
                  <p className="text-xs text-subtext">Drag-and-drop module editor with media tools</p>
                </button>
                <button onClick={() => setActiveTab("Students")} className="p-6 bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border border-emerald-500/20 rounded-2xl text-left hover:border-emerald-500/40 transition-colors group">
                  <Users className="w-8 h-8 text-emerald-500 mb-3 group-hover:scale-110 transition-transform" />
                  <h3 className="font-bold text-text mb-1">My Students</h3>
                  <p className="text-xs text-subtext">View enrollments and engagement data</p>
                </button>
              </div>

              {/* Recent Courses */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-text">Recent Courses</h2>
                  <button onClick={() => setActiveTab("My Courses")} className="text-sm font-bold text-primary flex items-center gap-1 hover:underline">View All <ArrowRight className="w-4 h-4" /></button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {courses.slice(0, 3).map((course) => (
                    <div key={course.id} className="bg-card border border-card rounded-2xl p-5 flex flex-col gap-3 group hover:-translate-y-1 transition-transform shadow-sm hover:shadow-lg">
                      <div className="h-28 rounded-xl bg-gradient-to-br from-primary/20 to-accent/10 flex items-center justify-center">
                        <BookOpen className="w-10 h-10 text-primary/30" />
                      </div>
                      <h3 className="font-bold text-text line-clamp-1">{course.title}</h3>
                      <div className="flex items-center justify-between mt-auto">
                        <span className={`px-2.5 py-1 text-[10px] font-black uppercase rounded-full border ${course.status === "APPROVED" ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : course.status === "PENDING" ? "bg-amber-500/10 text-amber-500 border-amber-500/20" : "bg-red-500/10 text-red-500 border-red-500/20"}`}>{course.status}</span>
                        <span className="font-bold text-text">₹{course.price?.toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                  {courses.length === 0 && (
                    <div className="col-span-full py-16 text-center text-subtext">
                      <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-20" />
                      <p className="font-bold text-lg text-text">No courses yet</p>
                      <p className="text-sm">Click "Create New Course" to get started.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════
             TAB: MY COURSES
             ══════════════════════════════════════ */}
          {activeTab === "My Courses" && (
            <div className="animate-in fade-in duration-300">
              <div className="bg-card border border-card rounded-2xl overflow-hidden min-h-[400px] relative shadow-sm">
                {loading ? (
                  <div className="absolute inset-0 flex items-center justify-center"><Activity className="w-8 h-8 text-primary animate-spin" /></div>
                ) : courses.length === 0 ? (
                  <div className="absolute inset-0 flex items-center justify-center flex-col gap-3 text-subtext">
                    <BookOpen className="w-12 h-12 opacity-20" />
                    <p className="font-bold text-lg text-text">No courses yet</p>
                    <button onClick={() => setIsModalOpen(true)} className="px-6 py-2.5 bg-primary text-white rounded-xl font-bold text-sm flex items-center gap-2"><Plus className="w-4 h-4" />Create Course</button>
                  </div>
                ) : (
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-background border-b border-card">
                        <th className="p-4 text-xs font-black text-subtext uppercase tracking-widest">Course</th>
                        <th className="p-4 text-xs font-black text-subtext uppercase tracking-widest">Price</th>
                        <th className="p-4 text-xs font-black text-subtext uppercase tracking-widest">Status</th>
                        <th className="p-4 text-xs font-black text-subtext uppercase tracking-widest">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {courses.map((course) => (
                        <tr key={course.id} className="border-b border-card hover:bg-background/50 transition-colors group">
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-primary/10 rounded-lg shrink-0 flex items-center justify-center text-primary font-black text-sm">{course.title?.[0]}</div>
                              <div>
                                <span className="font-bold text-text line-clamp-1">{course.title}</span>
                                <span className="text-xs text-subtext block truncate max-w-[200px]">{course.description}</span>
                              </div>
                            </div>
                          </td>
                          <td className="p-4 font-bold text-text">₹{course.price?.toLocaleString()}</td>
                          <td className="p-4">
                            <span className={`px-3 py-1 border rounded-full text-xs font-black uppercase ${course.status === "APPROVED" ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : course.status === "PENDING" ? "bg-amber-500/10 text-amber-500 border-amber-500/20" : "bg-red-500/10 text-red-500 border-red-500/20"}`}>{course.status}</span>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <Link href={`/course/${course.id}`} className="p-2 text-subtext hover:text-primary hover:bg-primary/10 rounded-lg transition-colors" title="Preview"><Eye className="w-4 h-4" /></Link>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════
             TAB: AI WIZARD
             ══════════════════════════════════════ */}
          {activeTab === "AI Wizard" && (
            <div className="flex gap-8 animate-in fade-in duration-300">
              {/* Left Stepper */}
              <div className="w-64 shrink-0 hidden lg:block">
                <div className="sticky top-10 space-y-10 relative">
                  <div className="absolute left-5 top-6 bottom-6 w-0.5 bg-card" />
                  {wizardSteps.map((step) => {
                    const isActive = wizardStep === step.num;
                    const isCompleted = step.num < wizardStep;
                    return (
                      <button key={step.num} onClick={() => setWizardStep(step.num)} className={`flex items-start gap-4 transition-all duration-300 w-full text-left ${isActive ? "opacity-100" : isCompleted ? "opacity-60" : "opacity-40"}`}>
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 border-2 bg-background z-10 shadow-sm ${isActive ? "border-purple-500 text-purple-500 scale-110 shadow-purple-500/20" : isCompleted ? "border-emerald-500 text-emerald-500" : "border-card text-subtext"}`}>
                          {isCompleted ? <Check className="w-5 h-5" /> : <step.icon className={`w-4 h-4 ${isActive ? "animate-pulse" : ""}`} />}
                        </div>
                        <div className="pt-2">
                          <p className={`text-[10px] font-black tracking-widest uppercase mb-0.5 ${isActive ? "text-purple-500" : "text-subtext"}`}>Step {step.num}</p>
                          <h3 className={`font-bold text-sm ${isActive ? "text-text" : "text-subtext"}`}>{step.title}</h3>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Right Content */}
              <div className="flex-1 space-y-8 min-w-0">
                {/* AI Copilot Bar */}
                <div className="bg-card/40 border-2 border-purple-500/30 rounded-2xl p-2 pl-5 flex items-center gap-3 focus-within:border-purple-500 focus-within:shadow-[0_0_30px_-5px_rgba(168,85,247,0.3)] transition-all group">
                  <Sparkles className="w-5 h-5 text-purple-500 shrink-0 group-focus-within:animate-pulse" />
                  <input
                    value={aiTopic}
                    onChange={e => setAiTopic(e.target.value)}
                    placeholder="Describe your course topic... e.g. Building AI Agents with Python"
                    className="w-full bg-transparent outline-none text-text font-medium placeholder:text-subtext/50"
                    onKeyDown={e => e.key === "Enter" && generateSyllabus()}
                  />
                  <button
                    onClick={generateSyllabus}
                    disabled={isGeneratingAll || !aiTopic}
                    className="bg-purple-600 hover:bg-purple-500 disabled:bg-purple-600/40 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-purple-500/20 flex items-center gap-2 whitespace-nowrap shrink-0 text-sm"
                  >
                    {isGeneratingAll ? <Loader2 className="w-4 h-4 animate-spin" /> : "Generate Outline"}
                  </button>
                </div>

                {/* Module Cards */}
                {aiModules.length === 0 ? (
                  <div className="py-20 text-center border-2 border-dashed border-card rounded-2xl">
                    <Sparkles className="w-12 h-12 text-purple-500/20 mx-auto mb-4" />
                    <h3 className="font-bold text-lg text-text mb-1">No syllabus generated yet</h3>
                    <p className="text-sm text-subtext max-w-md mx-auto">Enter a course topic above and click "Generate Outline" to let AI create a complete module breakdown for you.</p>
                  </div>
                ) : (
                  <div className="space-y-5">
                    {aiModules.map((module) => (
                      <div key={module.id} className={`rounded-2xl border-2 transition-all p-5 relative overflow-hidden bg-background shadow-sm ${module.status === "accepted" ? "border-emerald-500/30 bg-emerald-500/5" : module.status === "editing" ? "border-primary ring-4 ring-primary/10" : module.status === "regenerating" ? "border-purple-500/50 opacity-70" : "border-card hover:border-purple-500/30"}`}>

                        {module.status === "regenerating" && (
                          <div className="absolute inset-0 bg-background/50 backdrop-blur-sm flex items-center justify-center z-20">
                            <div className="flex flex-col items-center text-purple-500"><RefreshCw className="w-7 h-7 animate-spin mb-2" /><span className="font-bold text-sm">Regenerating...</span></div>
                          </div>
                        )}

                        {module.status === "editing" ? (
                          <div className="animate-in fade-in duration-200">
                            <div className="mb-3 flex items-center gap-2">
                              <Edit3 className="w-4 h-4 text-primary" />
                              <span className="text-xs font-black uppercase text-primary tracking-widest">Edit Mode</span>
                            </div>
                            <input value={editBuffer.title} onChange={e => setEditBuffer({ ...editBuffer, title: e.target.value })} className="w-full text-lg font-bold bg-card border border-card rounded-xl px-4 py-2.5 mb-3 text-text outline-none focus:border-primary" />
                            <textarea value={editBuffer.lessons} onChange={e => setEditBuffer({ ...editBuffer, lessons: e.target.value })} rows={4} className="w-full bg-card border border-card rounded-xl px-4 py-2.5 text-text text-sm outline-none font-mono focus:border-primary leading-relaxed mb-3" placeholder="One lesson per line..." />
                            <div className="flex justify-end gap-2 pt-2 border-t border-card">
                              <button onClick={() => setAiModules(prev => prev.map(m => m.id === module.id ? { ...m, status: "pending" } : m))} className="px-5 py-2 rounded-xl text-sm font-bold text-subtext hover:bg-card">Cancel</button>
                              <button onClick={() => saveEditing(module.id)} className="px-5 py-2 rounded-xl text-sm font-bold bg-primary text-white hover:bg-primary/90 flex items-center gap-2 shadow-lg shadow-primary/20"><Save className="w-4 h-4" /> Save</button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex flex-col md:flex-row gap-5">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                {module.status === "accepted" ? <CheckCircle2 className="w-5 h-5 text-emerald-500" /> : <Layout className="w-5 h-5 text-purple-500/70" />}
                                <h3 className="text-lg font-bold text-text">{module.title}</h3>
                              </div>
                              <div className="pl-7 space-y-1.5">
                                {module.lessons.map((lesson, idx) => (
                                  <div key={idx} className="flex items-start gap-2 group/l">
                                    <PlayCircle className="w-3.5 h-3.5 text-subtext/40 mt-0.5 group-hover/l:text-purple-500 transition-colors" />
                                    <span className="text-sm font-medium text-text/85">{lesson}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                            <div className="md:w-28 flex flex-col gap-2 shrink-0 border-t md:border-t-0 md:border-l border-card pt-3 md:pt-0 md:pl-5 justify-center">
                              <button onClick={() => setAiModules(prev => prev.map(m => m.id === module.id ? { ...m, status: "accepted" } : m))} className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all border ${module.status === "accepted" ? "bg-emerald-500 text-white border-emerald-500 shadow-md" : "bg-background hover:bg-emerald-500/10 text-subtext hover:text-emerald-500 border-card hover:border-emerald-500/30"}`}><Check className="w-3.5 h-3.5" /> Accept</button>
                              <button onClick={() => startEditing(module)} className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-background border border-card hover:bg-primary/10 text-subtext hover:text-primary hover:border-primary/30 transition-all"><Edit3 className="w-3.5 h-3.5" /> Edit</button>
                              <button onClick={() => regenerateModule(module.id, module.title)} className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-background border border-card hover:bg-amber-500/10 text-subtext hover:text-amber-500 hover:border-amber-500/30 transition-all"><RefreshCw className="w-3.5 h-3.5" /> Re-roll</button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}

                    {/* Approve & Continue */}
                    <div className="flex justify-end pt-4">
                      <button
                        onClick={approveSyllabusAndContinue}
                        className="bg-text hover:opacity-90 text-background px-8 py-4 rounded-2xl font-black text-base shadow-2xl transition-transform active:scale-95 flex items-center gap-3"
                      >
                        Approve Syllabus & Continue <ChevronRight className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════
             TAB: COURSE BUILDER
             ══════════════════════════════════════ */}
          {activeTab === "Course Builder" && (
            <div className="space-y-6 animate-in fade-in duration-300">
              {/* AI Quick Generate */}
              <div className="bg-gradient-to-r from-purple-500/10 via-primary/5 to-transparent border border-purple-500/20 rounded-2xl p-5 relative overflow-hidden group">
                <div className="flex items-center gap-3">
                  <Sparkles className="w-5 h-5 text-purple-500" />
                  <span className="font-bold text-text">Need a head start?</span>
                  <button onClick={() => setActiveTab("AI Wizard")} className="text-sm font-bold text-purple-500 hover:underline flex items-center gap-1">Open AI Wizard <ArrowRight className="w-3.5 h-3.5" /></button>
                </div>
              </div>

              {/* Modules */}
              <div className="space-y-4">
                {builderModules.map((module) => (
                  <div key={module.id} className="bg-card/40 border border-card rounded-2xl overflow-hidden shadow-sm">
                    <div className="px-5 py-4 flex items-center gap-4 cursor-pointer hover:bg-card/80 transition-colors" onClick={() => setBuilderModules(prev => prev.map(m => m.id === module.id ? { ...m, isExpanded: !m.isExpanded } : m))}>
                      <GripVertical className="w-5 h-5 text-subtext/40 cursor-grab" />
                      <div className="flex-1">
                        <h4 className="font-extrabold text-text">{module.title}</h4>
                        <span className="text-[10px] font-bold text-subtext uppercase tracking-widest">{module.lessons.length} Contents</span>
                      </div>
                      {module.isExpanded ? <ChevronDown className="w-5 h-5 text-subtext" /> : <ChevronRight className="w-5 h-5 text-subtext" />}
                    </div>

                    {module.isExpanded && (
                      <div className="px-5 pb-5 pt-2 space-y-2.5 bg-card/20 border-t border-card/30">
                        {module.lessons.map((lesson) => (
                          <div key={lesson.id} className="group flex items-center justify-between p-3 rounded-xl border border-transparent hover:border-card bg-background/50 text-sm hover:bg-card/40 transition-all">
                            <div className="flex items-center gap-3">
                              <GripVertical className="w-4 h-4 text-subtext/20 cursor-grab" />
                              <div className={`p-1.5 rounded-lg ${lesson.type === "video" ? "bg-blue-500/10 text-blue-500" : lesson.type === "quiz" ? "bg-amber-500/10 text-amber-500" : lesson.type === "sandbox" ? "bg-emerald-500/10 text-emerald-500" : "bg-card text-subtext"}`}>
                                {lesson.type === "video" ? <Video className="w-4 h-4" /> : lesson.type === "quiz" ? <HelpCircle className="w-4 h-4" /> : lesson.type === "sandbox" ? <Code className="w-4 h-4" /> : <BookOpen className="w-4 h-4" />}
                              </div>
                              <span className="font-semibold text-text">{lesson.title}</span>
                            </div>
                            <button className="opacity-0 group-hover:opacity-100 text-xs font-bold text-subtext hover:text-text px-3 py-1 rounded-lg hover:bg-card transition-all">Edit</button>
                          </div>
                        ))}
                        <div className="mt-3 pt-3 border-t border-dashed border-card">
                          <p className="text-[10px] font-black uppercase text-subtext tracking-widest mb-2 ml-1">Add Content</p>
                          <div className="flex flex-wrap gap-2">
                            <button onClick={() => { setActiveModuleId(module.id); setContentModal("video"); }} className="flex items-center gap-2 px-3 py-2 bg-background border border-card hover:border-blue-500/40 hover:bg-blue-500/5 text-text rounded-xl text-xs font-bold transition-all flex-1 min-w-[130px] justify-center shadow-sm"><div className="p-1 rounded-md bg-blue-500/10 text-blue-500"><Video className="w-3.5 h-3.5" /></div> Upload Video</button>
                            <button onClick={() => { setActiveModuleId(module.id); setContentModal("sandbox"); }} className="flex items-center gap-2 px-3 py-2 bg-background border border-card hover:border-emerald-500/40 hover:bg-emerald-500/5 text-text rounded-xl text-xs font-bold transition-all flex-1 min-w-[130px] justify-center shadow-sm"><div className="p-1 rounded-md bg-emerald-500/10 text-emerald-500"><Code className="w-3.5 h-3.5" /></div> Code Sandbox</button>
                            <button onClick={() => { setActiveModuleId(module.id); setQuizTopic(""); setQuizQuestions([]); setQuizApproved(false); setQuizPreview(false); setContentModal("quiz"); }} className="flex items-center gap-2 px-3 py-2 bg-background border border-card hover:border-amber-500/40 hover:bg-amber-500/5 text-text rounded-xl text-xs font-bold transition-all flex-1 min-w-[130px] justify-center shadow-sm"><div className="p-1 rounded-md bg-amber-500/10 text-amber-500"><HelpCircle className="w-3.5 h-3.5" /></div> Interactive Quiz</button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                <button onClick={() => { const id = `mod-${Date.now()}`; setBuilderModules(prev => [...prev, { id, title: `Module ${prev.length + 1}: New Module`, isExpanded: true, lessons: [] }]); }} className="w-full flex items-center justify-center gap-2 p-5 rounded-2xl border-2 border-dashed border-card hover:border-primary/50 hover:bg-primary/5 text-subtext hover:text-primary transition-colors font-bold group">
                  <Plus className="w-5 h-5 group-hover:scale-125 transition-transform" /> Add New Module
                </button>
              </div>

              {/* Submit Course for Admin Review */}
              {builderModules.length > 0 && (
                <div className="flex justify-end pt-6 border-t border-card">
                  <button onClick={handleSubmitCourse} disabled={submitLoading} className="bg-emerald-500 hover:bg-emerald-400 text-white px-8 py-4 rounded-2xl font-black text-base shadow-2xl shadow-emerald-500/20 transition-all active:scale-95 flex items-center gap-3 disabled:opacity-60">
                    {submitLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle className="w-5 h-5" />}
                    Submit Course for Admin Review
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ══════════════════════════════════════
             TAB: STUDENTS
             ══════════════════════════════════════ */}
          {activeTab === "Students" && (
            <div className="animate-in fade-in duration-300">
              <div className="bg-card border border-card rounded-2xl overflow-hidden min-h-[400px] relative shadow-sm">
                {loading ? (
                  <div className="absolute inset-0 flex items-center justify-center"><Activity className="w-8 h-8 text-primary animate-spin" /></div>
                ) : students.length === 0 ? (
                  <div className="absolute inset-0 flex items-center justify-center flex-col gap-3 text-subtext">
                    <Users className="w-12 h-12 opacity-20" />
                    <p className="font-bold text-lg text-text">No students enrolled yet</p>
                    <p className="text-sm">Students will appear here once they enroll in your courses.</p>
                  </div>
                ) : (
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-background border-b border-card">
                        <th className="p-4 text-xs font-black text-subtext uppercase tracking-widest">Student</th>
                        <th className="p-4 text-xs font-black text-subtext uppercase tracking-widest">Course</th>
                        <th className="p-4 text-xs font-black text-subtext uppercase tracking-widest">Progress</th>
                      </tr>
                    </thead>
                    <tbody>
                      {students.map((s: any, i: number) => (
                        <tr key={i} className="border-b border-card hover:bg-background/50 transition-colors">
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 bg-accent/10 rounded-full flex items-center justify-center text-accent font-black text-sm">{s.user?.name?.[0] || "?"}</div>
                              <div>
                                <span className="font-bold text-text">{s.user?.name || "N/A"}</span>
                                <span className="text-xs text-subtext block">{s.user?.email}</span>
                              </div>
                            </div>
                          </td>
                          <td className="p-4 text-text font-medium text-sm">{s.course?.title || "N/A"}</td>
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <div className="w-24 h-2 bg-card rounded-full overflow-hidden">
                                <div className={`h-full rounded-full ${(s.progress || 0) === 100 ? "bg-emerald-500" : "bg-primary"}`} style={{ width: `${s.progress || 0}%` }} />
                              </div>
                              <span className="text-xs font-bold text-text">{s.progress || 0}%</span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════
             TAB: ANALYTICS
             ══════════════════════════════════════ */}
          {activeTab === "Analytics" && (
            <div className="space-y-8 animate-in fade-in duration-300">
              {/* Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-card border border-card rounded-2xl p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-bold text-sm text-text">Video Retention Heatmap</span>
                    <PieChart className="w-4 h-4 text-subtext/50" />
                  </div>
                  <div className="flex justify-between items-end mb-3">
                    <div>
                      <p className="text-[10px] font-bold text-subtext uppercase tracking-widest mb-1">Avg. Drop-off</p>
                      <p className="font-black text-2xl text-text">14:20</p>
                    </div>
                  </div>
                  <div className="w-full h-14 flex items-end gap-[2px]">
                    {[...Array(25)].map((_, i) => {
                      const hv = i < 5 ? 100 : i < 12 ? 100 - (i - 5) * 4 : 72 - (i - 12) * 5;
                      const h = Math.max(12, Math.floor(hv));
                      const c = h > 75 ? "bg-emerald-500" : h > 45 ? "bg-amber-500" : "bg-red-500";
                      return <div key={i} className={`w-full rounded-t-sm opacity-80 ${c}`} style={{ height: `${h}%` }} />;
                    })}
                  </div>
                  <div className="flex justify-between text-[9px] font-bold text-subtext mt-1"><span>0:00</span><span>Mid</span><span>End</span></div>
                </div>

                <div className="bg-card border border-card rounded-2xl p-6 shadow-sm col-span-1 md:col-span-2">
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-bold text-sm text-text flex items-center gap-2">Student Risk Alerts <span className="bg-red-500/10 text-red-500 px-2 py-0.5 rounded-full text-[10px] font-black">2 NEW</span></span>
                    <Bell className="w-4 h-4 text-red-500/50" />
                  </div>
                  <div className="space-y-3">
                    <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-4 flex gap-3 relative overflow-hidden">
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-500 rounded-l-2xl" />
                      <div className="bg-red-500/20 p-2 rounded-xl shrink-0 h-fit"><UserX className="w-5 h-5 text-red-500" /></div>
                      <div>
                        <h5 className="font-bold text-sm text-text">Arjun K.</h5>
                        <p className="text-xs text-subtext mt-0.5">Missed 3 consecutive quizzes. Last active 5 days ago.</p>
                        <button className="text-xs font-bold text-red-500 mt-2 hover:underline flex items-center gap-1">Send Reminder <ArrowRight className="w-3 h-3" /></button>
                      </div>
                    </div>
                    <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-4 flex gap-3 relative overflow-hidden">
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-500 rounded-l-2xl" />
                      <div className="bg-amber-500/20 p-2 rounded-xl shrink-0 h-fit"><AlertTriangle className="w-5 h-5 text-amber-500" /></div>
                      <div>
                        <h5 className="font-bold text-sm text-text">Priya Patel</h5>
                        <p className="text-xs text-subtext mt-0.5">Low assessment score (34%). Needs intervention.</p>
                        <button className="text-xs font-bold text-amber-500 mt-2 hover:underline flex items-center gap-1">View Assessment <ArrowRight className="w-3 h-3" /></button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </main>

      {/* ═══════ CREATE COURSE MODAL ═══════ */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setIsModalOpen(false)}>
          <div className="bg-card border border-card w-full max-w-md p-8 rounded-3xl shadow-2xl relative animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
            <button onClick={() => setIsModalOpen(false)} className="absolute top-6 right-6 text-subtext hover:text-text transition-colors"><X className="w-6 h-6" /></button>
            <h2 className="text-2xl font-bold text-text mb-6 flex items-center gap-2"><Plus className="w-6 h-6 text-primary" /> Create New Course</h2>
            <form onSubmit={handleCreate} className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-text mb-2">Course Title</label>
                <input required value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} className="w-full bg-background border border-card rounded-xl px-4 py-3 text-text focus:ring-2 focus:ring-primary outline-none" placeholder="e.g. Advanced AI Prompting" />
              </div>
              <div>
                <label className="block text-sm font-bold text-text mb-2">Description</label>
                <textarea required value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} className="w-full bg-background border border-card rounded-xl px-4 py-3 text-text focus:ring-2 focus:ring-primary outline-none" placeholder="Enter course description" rows={3} />
              </div>
              <div>
                <label className="block text-sm font-bold text-text mb-2">Price (₹)</label>
                <input required type="number" min="0" value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} className="w-full bg-background border border-card rounded-xl px-4 py-3 text-text focus:ring-2 focus:ring-primary outline-none" placeholder="e.g. 4999" />
              </div>
              <button disabled={createLoading} className="w-full py-4 mt-2 bg-primary hover:bg-primary/90 text-white rounded-xl font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/20">
                {createLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Submit for Approval"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ═══════ VIDEO UPLOAD MODAL ═══════ */}
      {contentModal === "video" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in" onClick={() => setContentModal(null)}>
          <div className="bg-card border border-card w-full max-w-md p-8 rounded-3xl shadow-2xl animate-in zoom-in-95" onClick={e => e.stopPropagation()}>
            <button onClick={() => setContentModal(null)} className="absolute top-6 right-6 text-subtext hover:text-text"><X className="w-6 h-6" /></button>
            <h2 className="text-xl font-bold text-text mb-6 flex items-center gap-2"><Video className="w-5 h-5 text-blue-500" /> Add Video Lesson</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-text mb-2">Lesson Title</label>
                <input value={videoTitle} onChange={e => setVideoTitle(e.target.value)} className="w-full bg-background border border-card rounded-xl px-4 py-3 text-text outline-none focus:ring-2 focus:ring-blue-500" placeholder="e.g. Introduction to Neural Networks" />
              </div>
              <div>
                <label className="block text-sm font-bold text-text mb-2">Video URL</label>
                <input value={videoUrl} onChange={e => setVideoUrl(e.target.value)} className="w-full bg-background border border-card rounded-xl px-4 py-3 text-text outline-none focus:ring-2 focus:ring-blue-500" placeholder="https://youtube.com/watch?v=..." />
              </div>
              <button onClick={addVideoLesson} disabled={!videoTitle.trim()} className="w-full py-3 bg-blue-500 hover:bg-blue-400 disabled:bg-blue-500/40 text-white rounded-xl font-bold">Add Video</button>
            </div>
          </div>
        </div>
      )}

      {/* ═══════ CODE SANDBOX MODAL ═══════ */}
      {contentModal === "sandbox" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in" onClick={() => setContentModal(null)}>
          <div className="bg-card border border-card w-full max-w-md p-8 rounded-3xl shadow-2xl animate-in zoom-in-95" onClick={e => e.stopPropagation()}>
            <h2 className="text-xl font-bold text-text mb-6 flex items-center gap-2"><Code className="w-5 h-5 text-emerald-500" /> Add Code Sandbox</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-text mb-2">Sandbox Title</label>
                <input value={sandboxTitle} onChange={e => setSandboxTitle(e.target.value)} className="w-full bg-background border border-card rounded-xl px-4 py-3 text-text outline-none focus:ring-2 focus:ring-emerald-500" placeholder="e.g. Build a REST API" />
              </div>
              <div>
                <label className="block text-sm font-bold text-text mb-2">Language</label>
                <select value={sandboxLang} onChange={e => setSandboxLang(e.target.value)} className="w-full bg-background border border-card rounded-xl px-4 py-3 text-text outline-none">
                  <option value="python">Python</option>
                  <option value="javascript">JavaScript</option>
                  <option value="typescript">TypeScript</option>
                  <option value="java">Java</option>
                  <option value="rust">Rust</option>
                </select>
              </div>
              <button onClick={addSandboxLesson} disabled={!sandboxTitle.trim()} className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 disabled:bg-emerald-500/40 text-white rounded-xl font-bold">Add Sandbox</button>
            </div>
          </div>
        </div>
      )}

      {/* ═══════ AI INTERACTIVE QUIZ MODAL ═══════ */}
      {contentModal === "quiz" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in overflow-y-auto py-8" onClick={() => setContentModal(null)}>
          <div className="bg-card border border-card w-full max-w-2xl p-8 rounded-3xl shadow-2xl animate-in zoom-in-95 my-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-text flex items-center gap-2"><Sparkles className="w-5 h-5 text-amber-500" /> AI Interactive Quiz</h2>
              <button onClick={() => setContentModal(null)} className="p-2 text-subtext hover:text-text rounded-lg hover:bg-card"><X className="w-5 h-5" /></button>
            </div>

            {!quizPreview ? (
              <div className="space-y-6">
                {/* Generator */}
                <div className="flex gap-3">
                  <input value={quizTopic} onChange={e => setQuizTopic(e.target.value)} placeholder="Quiz topic... e.g. Python Data Structures" className="flex-1 bg-background border border-card rounded-xl px-4 py-3 text-text outline-none focus:ring-2 focus:ring-amber-500" onKeyDown={e => e.key === "Enter" && generateQuiz()} />
                  <button onClick={generateQuiz} disabled={quizGenerating || !quizTopic.trim()} className="bg-amber-500 hover:bg-amber-400 disabled:bg-amber-500/40 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 shrink-0">
                    {quizGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />} Generate
                  </button>
                </div>

                {/* Questions List */}
                {quizQuestions.length > 0 && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-bold text-text">{quizQuestions.length} Questions Generated</p>
                      <button onClick={startQuizPreview} className="text-sm font-bold text-amber-500 hover:underline flex items-center gap-1"><PlayCircle className="w-4 h-4" /> Preview as Game</button>
                    </div>
                    {quizQuestions.map((q, i) => (
                      <div key={i} className="p-4 bg-background border border-card rounded-2xl">
                        <p className="font-bold text-text text-sm mb-2"><span className="text-amber-500">Q{i+1}.</span> {q.question}</p>
                        <div className="grid grid-cols-2 gap-2">
                          {q.options.map((opt, oi) => (
                            <div key={oi} className={`text-xs p-2 rounded-lg border ${oi === q.correctIndex ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 font-bold" : "bg-card border-card text-subtext"}`}>
                              {String.fromCharCode(65 + oi)}. {opt}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}

                    {/* Instructor Approve */}
                    <div className="flex gap-3 pt-4 border-t border-card">
                      <button onClick={generateQuiz} disabled={quizGenerating} className="flex-1 py-3 bg-background border border-card hover:bg-amber-500/10 text-text rounded-xl font-bold text-sm flex items-center justify-center gap-2"><RefreshCw className="w-4 h-4" /> Regenerate</button>
                      <button onClick={approveAndAddQuiz} className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-400 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2"><CheckCircle className="w-4 h-4" /> Approve & Add Quiz</button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* ═══ GAME-LIKE QUIZ PREVIEW ═══ */
              <div className="space-y-6">
                {/* Progress */}
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-2 bg-card rounded-full overflow-hidden">
                    <div className="h-full bg-amber-500 rounded-full transition-all duration-500" style={{ width: `${((quizCurrentQ + 1) / quizQuestions.length) * 100}%` }} />
                  </div>
                  <span className="text-xs font-black text-subtext">{quizCurrentQ + 1}/{quizQuestions.length}</span>
                  <span className="text-xs font-black text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-full">Score: {quizScore}</span>
                </div>

                {/* Question Card */}
                <div className="bg-gradient-to-br from-amber-500/5 to-transparent border border-amber-500/20 rounded-2xl p-6">
                  <p className="text-lg font-bold text-text mb-6">{quizQuestions[quizCurrentQ]?.question}</p>
                  <div className="space-y-3">
                    {quizQuestions[quizCurrentQ]?.options.map((opt, oi) => {
                      const isCorrect = oi === quizQuestions[quizCurrentQ].correctIndex;
                      const isSelected = quizSelected === oi;
                      let btnClass = "bg-background border-card text-text hover:border-amber-500/40 hover:bg-amber-500/5";
                      if (quizAnswered) {
                        if (isCorrect) btnClass = "bg-emerald-500/10 border-emerald-500 text-emerald-600 ring-2 ring-emerald-500/20";
                        else if (isSelected) btnClass = "bg-red-500/10 border-red-500 text-red-500 ring-2 ring-red-500/20";
                        else btnClass = "bg-card border-card text-subtext opacity-50";
                      }
                      return (
                        <button key={oi} onClick={() => handleQuizAnswer(oi)} disabled={quizAnswered} className={`w-full text-left p-4 rounded-xl border-2 font-semibold text-sm transition-all flex items-center gap-3 ${btnClass}`}>
                          <span className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black shrink-0 ${quizAnswered && isCorrect ? "bg-emerald-500 text-white" : quizAnswered && isSelected ? "bg-red-500 text-white" : "bg-card text-subtext"}`}>{String.fromCharCode(65 + oi)}</span>
                          {opt}
                          {quizAnswered && isCorrect && <CheckCircle className="w-5 h-5 text-emerald-500 ml-auto" />}
                          {quizAnswered && isSelected && !isCorrect && <X className="w-5 h-5 text-red-500 ml-auto" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Explanation + Next */}
                {quizAnswered && (
                  <div className="animate-in fade-in slide-in-from-bottom-3 duration-300">
                    <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 mb-4">
                      <p className="text-xs font-bold text-primary mb-1">Explanation</p>
                      <p className="text-sm text-text">{quizQuestions[quizCurrentQ]?.explanation}</p>
                    </div>
                    <button onClick={nextQuizQ} className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-white rounded-xl font-bold flex items-center justify-center gap-2">
                      {quizCurrentQ < quizQuestions.length - 1 ? <>Next Question <ChevronRight className="w-4 h-4" /></> : <>Finish Preview <CheckCircle className="w-4 h-4" /></>}
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Post-game approval */}
            {quizApproved && !quizPreview && quizQuestions.length > 0 && (
              <div className="mt-6 p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl animate-in fade-in">
                <div className="flex items-center gap-3 mb-3">
                  <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                  <div>
                    <p className="font-bold text-text">Preview Complete! Score: {quizScore}/{quizQuestions.length}</p>
                    <p className="text-xs text-subtext">As an instructor, you can now approve this quiz or regenerate it.</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button onClick={startQuizPreview} className="flex-1 py-2.5 bg-background border border-card text-text rounded-xl font-bold text-sm">Replay</button>
                  <button onClick={approveAndAddQuiz} className="flex-1 py-2.5 bg-emerald-500 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2"><CheckCircle className="w-4 h-4" /> Approve & Add</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <style dangerouslySetInnerHTML={{ __html: `
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />
    </div>
  );
}
