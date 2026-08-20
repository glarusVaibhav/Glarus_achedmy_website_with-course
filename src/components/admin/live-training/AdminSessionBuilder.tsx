"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Clock,
  Calendar,
  Sparkles,
  Save,
  Plus,
  Trash2,
  Copy,
  MoveUp,
  MoveDown,
  CheckCircle2,
  AlertTriangle,
  Video,
  FileText,
  BookOpen,
  Award,
  Code,
  Layers,
  Check,
  X,
  RefreshCw,
  HelpCircle,
  Radio,
  ExternalLink,
  MessageSquare,
  ShieldCheck,
  UserCheck
} from "lucide-react";

export default function AdminSessionBuilder() {
  const params = useParams();
  const router = useRouter();
  const courseId = params?.id as string;
  const sessionId = params?.sessionId as string;

  const [sessionData, setSessionData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeContentTab, setActiveContentTab] = useState<"AGENDA" | "TOPICS" | "OUTCOMES" | "ACTIVITIES" | "HOMEWORK" | "RESOURCES" | "HISTORY">("AGENDA");

  // AI Assistant State
  const [aiAssistantOpen, setAiAssistantOpen] = useState(false);
  const [aiAction, setAiAction] = useState<string>("GENERATE_AGENDA");
  const [aiCustomPrompt, setAiCustomPrompt] = useState("");
  const [isAILoading, setIsAILoading] = useState(false);
  const [aiSuggestionPreview, setAiSuggestionPreview] = useState<any>(null);

  // Reschedule Modal
  const [rescheduleModalOpen, setRescheduleModalOpen] = useState(false);
  const [rescheduleForm, setRescheduleForm] = useState({
    newDate: "",
    newStartTime: "",
    newEndTime: "",
    reason: ""
  });

  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const fetchSession = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/admin/live-training/sessions/${sessionId}`);
      if (res.ok) {
        const data = await res.json();
        setSessionData(data.session);
        if (data.session.date) {
          setRescheduleForm({
            newDate: new Date(data.session.date).toISOString().split("T")[0],
            newStartTime: data.session.startTime || "07:00 PM",
            newEndTime: data.session.endTime || "09:00 PM",
            reason: ""
          });
        }
      } else {
        setErrorMessage("Session not found");
      }
    } catch (err) {
      console.error(err);
      setErrorMessage("Failed to load session");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (sessionId) {
      fetchSession();
    }
  }, [sessionId]);

  // Handle Save Session Changes
  const handleSaveSession = async () => {
    setIsSaving(true);
    setErrorMessage("");
    try {
      const res = await fetch(`/api/admin/live-training/sessions/${sessionId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sessionData)
      });

      if (res.ok) {
        const updated = await res.json();
        setSessionData(updated.session);
        setSuccessMessage("Session saved successfully!");
        setTimeout(() => setSuccessMessage(""), 3000);
      } else {
        const err = await res.json();
        setErrorMessage(err.error || "Failed to save session");
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to save session");
    } finally {
      setIsSaving(false);
    }
  };

  // Agenda Item Actions
  const handleAddAgendaItem = () => {
    const newAgenda = [
      ...(sessionData.agenda || []),
      {
        title: "New Timeline Step",
        description: "Hands-on pair programming or lecture topic",
        startTime: "07:00 PM",
        endTime: "07:20 PM",
        duration: "20 min",
        order: (sessionData.agenda?.length || 0) + 1
      }
    ];
    setSessionData({ ...sessionData, agenda: newAgenda });
  };

  const handleUpdateAgendaItem = (index: number, field: string, value: string) => {
    const updated = [...sessionData.agenda];
    updated[index] = { ...updated[index], [field]: value };
    setSessionData({ ...sessionData, agenda: updated });
  };

  const handleDeleteAgendaItem = (index: number) => {
    const updated = sessionData.agenda.filter((_: any, i: number) => i !== index);
    setSessionData({ ...sessionData, agenda: updated });
  };

  const handleDuplicateAgendaItem = (index: number) => {
    const item = sessionData.agenda[index];
    const copy = { ...item, title: `${item.title} (Copy)`, order: sessionData.agenda.length + 1 };
    const updated = [...sessionData.agenda];
    updated.splice(index + 1, 0, copy);
    setSessionData({ ...sessionData, agenda: updated });
  };

  const handleMoveAgenda = (index: number, direction: "UP" | "DOWN") => {
    const newIdx = direction === "UP" ? index - 1 : index + 1;
    if (newIdx < 0 || newIdx >= sessionData.agenda.length) return;
    const updated = [...sessionData.agenda];
    const temp = updated[index];
    updated[index] = updated[newIdx];
    updated[newIdx] = temp;
    setSessionData({ ...sessionData, agenda: updated });
  };

  // Topics Actions
  const handleAddTopic = () => {
    setSessionData({
      ...sessionData,
      topics: [...(sessionData.topics || []), { title: "New Core Topic", description: "", order: (sessionData.topics?.length || 0) + 1 }]
    });
  };
  const handleUpdateTopic = (index: number, field: string, val: string) => {
    const updated = [...sessionData.topics];
    updated[index] = { ...updated[index], [field]: val };
    setSessionData({ ...sessionData, topics: updated });
  };
  const handleDeleteTopic = (index: number) => {
    setSessionData({ ...sessionData, topics: sessionData.topics.filter((_: any, i: number) => i !== index) });
  };

  // Learning Outcomes Actions
  const handleAddOutcome = () => {
    setSessionData({
      ...sessionData,
      learningOutcomes: [...(sessionData.learningOutcomes || []), { title: "Measurable Learning Outcome", order: (sessionData.learningOutcomes?.length || 0) + 1 }]
    });
  };
  const handleUpdateOutcome = (index: number, val: string) => {
    const updated = [...sessionData.learningOutcomes];
    updated[index] = { ...updated[index], title: val };
    setSessionData({ ...sessionData, learningOutcomes: updated });
  };
  const handleDeleteOutcome = (index: number) => {
    setSessionData({ ...sessionData, learningOutcomes: sessionData.learningOutcomes.filter((_: any, i: number) => i !== index) });
  };

  // Activities Actions
  const handleAddActivity = () => {
    setSessionData({
      ...sessionData,
      activities: [
        ...(sessionData.activities || []),
        { title: "Live Coding Challenge", instructions: "Step-by-step instructions for breakout rooms", duration: "25 min", order: (sessionData.activities?.length || 0) + 1 }
      ]
    });
  };
  const handleUpdateActivity = (index: number, field: string, val: string) => {
    const updated = [...sessionData.activities];
    updated[index] = { ...updated[index], [field]: val };
    setSessionData({ ...sessionData, activities: updated });
  };
  const handleDeleteActivity = (index: number) => {
    setSessionData({ ...sessionData, activities: sessionData.activities.filter((_: any, i: number) => i !== index) });
  };

  // Resources Actions
  const handleAddResource = () => {
    setSessionData({
      ...sessionData,
      resources: [...(sessionData.resources || []), { title: "Research Paper / Starter Code", type: "URL", url: "https://" }]
    });
  };
  const handleUpdateResource = (index: number, field: string, val: string) => {
    const updated = [...sessionData.resources];
    updated[index] = { ...updated[index], [field]: val };
    setSessionData({ ...sessionData, resources: updated });
  };
  const handleDeleteResource = (index: number) => {
    setSessionData({ ...sessionData, resources: sessionData.resources.filter((_: any, i: number) => i !== index) });
  };

  // AI Assistant Trigger
  const handleCallAIAssistant = async () => {
    setIsAILoading(true);
    setAiSuggestionPreview(null);
    try {
      const res = await fetch("/api/ai/live-course/session-assist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: aiAction,
          courseTitle: sessionData.liveCourse?.title,
          sessionTitle: sessionData.title,
          sessionDescription: sessionData.description,
          duration: sessionData.duration,
          currentData: {
            agenda: sessionData.agenda,
            topics: sessionData.topics,
            learningOutcomes: sessionData.learningOutcomes
          },
          customInstructions: aiCustomPrompt
        })
      });

      if (res.ok) {
        const data = await res.json();
        setAiSuggestionPreview(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsAILoading(false);
    }
  };

  // Apply AI Suggestion
  const handleApplyAISuggestion = () => {
    if (!aiSuggestionPreview) return;

    if (aiSuggestionPreview.agenda) {
      setSessionData({ ...sessionData, agenda: aiSuggestionPreview.agenda });
    } else if (aiSuggestionPreview.learningOutcomes) {
      const formatted = aiSuggestionPreview.learningOutcomes.map((lo: string, i: number) => ({
        title: lo,
        order: i + 1
      }));
      setSessionData({ ...sessionData, learningOutcomes: formatted });
    } else if (aiSuggestionPreview.activities) {
      setSessionData({ ...sessionData, activities: aiSuggestionPreview.activities });
    } else if (aiSuggestionPreview.homework) {
      setSessionData({
        ...sessionData,
        homework: [aiSuggestionPreview.homework]
      });
    }

    setAiSuggestionPreview(null);
    setAiAssistantOpen(false);
    setSuccessMessage("AI suggestions applied to draft session!");
    setTimeout(() => setSuccessMessage(""), 3000);
  };

  // Reschedule Session Submit
  const handleRescheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rescheduleForm.newDate || !rescheduleForm.reason.trim()) return;

    try {
      const res = await fetch(`/api/admin/live-training/sessions/${sessionId}/reschedule`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(rescheduleForm)
      });

      if (res.ok) {
        setRescheduleModalOpen(false);
        setSuccessMessage("Session rescheduled and change history logged!");
        fetchSession();
        setTimeout(() => setSuccessMessage(""), 3000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (isLoading) {
    return (
      <div className="w-full max-w-7xl mx-auto p-16 rounded-2xl bg-card border border-white/10 text-center space-y-3">
        <RefreshCw className="w-6 h-6 animate-spin mx-auto text-purple-400" />
        <p className="text-xs text-subtext font-semibold">Loading Session Builder...</p>
      </div>
    );
  }

  if (!sessionData) {
    return (
      <div className="w-full max-w-7xl mx-auto p-12 text-center rounded-2xl bg-card border border-white/10 space-y-4">
        <h3 className="text-base font-bold text-text">Session Not Found</h3>
        <Link
          href={`/admin/live-training/courses/${courseId}`}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 text-white text-xs font-bold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Live Course</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 pb-28">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div className="flex items-center gap-3">
          <Link
            href={`/admin/live-training/courses/${courseId}`}
            className="p-2 rounded-xl bg-card hover:bg-card-hover border border-white/10 text-subtext hover:text-text transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-300 border border-purple-500/30">
                Session {sessionData.sessionNumber} Builder
              </span>
              <span className="text-xs text-subtext">•</span>
              <span className="text-xs text-subtext truncate max-w-xs">{sessionData.liveCourse?.title}</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-text tracking-tight mt-0.5 truncate">
              {sessionData.title}
            </h1>
          </div>
        </div>

        {/* Top Control Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setRescheduleModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-card hover:bg-card-hover border border-white/10 text-subtext hover:text-amber-300 text-xs font-bold transition-all"
          >
            <Calendar className="w-3.5 h-3.5 text-amber-400" />
            <span>Reschedule</span>
          </button>

          <button
            onClick={() => setAiAssistantOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 text-xs font-bold shadow-sm transition-all"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Assistant</span>
          </button>

          <button
            onClick={handleSaveSession}
            disabled={isSaving}
            className="flex items-center gap-2 px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-lg shadow-purple-600/30 transition-all hover:scale-105 disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                <span>Save Session</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Status Alerts */}
      {successMessage && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-3 text-emerald-300 text-xs animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center gap-3 text-red-300 text-xs animate-in fade-in">
          <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Session Core Info Panel */}
      <div className="p-6 rounded-2xl bg-card border border-white/10 space-y-4">
        <h2 className="text-sm font-bold text-text flex items-center gap-2">
          <Clock className="w-4 h-4 text-purple-400" />
          Session Metadata & Schedule
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div className="sm:col-span-2 space-y-1">
            <label className="font-bold text-text">Session Title</label>
            <input
              type="text"
              value={sessionData.title}
              onChange={(e) => setSessionData({ ...sessionData, title: e.target.value })}
              className="w-full h-10 px-3.5 rounded-xl bg-background border border-white/10 text-text text-xs focus:outline-none focus:border-purple-500/50"
            />
          </div>

          <div className="space-y-1">
            <label className="font-bold text-text">Status</label>
            <select
              value={sessionData.status}
              onChange={(e) => setSessionData({ ...sessionData, status: e.target.value })}
              className="w-full h-10 px-3 rounded-xl bg-background border border-white/10 text-text text-xs focus:outline-none focus:border-purple-500/50"
            >
              <option value="DRAFT">DRAFT</option>
              <option value="SCHEDULED">SCHEDULED</option>
              <option value="LIVE">LIVE NOW</option>
              <option value="COMPLETED">COMPLETED</option>
              <option value="RESCHEDULED">RESCHEDULED</option>
              <option value="CANCELLED">CANCELLED</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="font-bold text-text">Duration</label>
            <input
              type="text"
              value={sessionData.duration}
              onChange={(e) => setSessionData({ ...sessionData, duration: e.target.value })}
              className="w-full h-10 px-3 rounded-xl bg-background border border-white/10 text-text text-xs focus:outline-none focus:border-purple-500/50"
            />
          </div>

          <div className="sm:col-span-2 space-y-1">
            <label className="font-bold text-text">Detailed Scope & Summary</label>
            <textarea
              rows={2}
              value={sessionData.description || ""}
              onChange={(e) => setSessionData({ ...sessionData, description: e.target.value })}
              placeholder="What will learners build and master during this live session..."
              className="w-full p-2.5 rounded-xl bg-background border border-white/10 text-text text-xs focus:outline-none focus:border-purple-500/50"
            />
          </div>

          <div className="sm:col-span-2 space-y-1">
            <label className="font-bold text-text">Live Meeting URL</label>
            <input
              type="url"
              value={sessionData.meetingUrl || ""}
              onChange={(e) => setSessionData({ ...sessionData, meetingUrl: e.target.value })}
              placeholder="https://zoom.us/j/session-room"
              className="w-full h-10 px-3.5 rounded-xl bg-background border border-white/10 text-text text-xs focus:outline-none focus:border-purple-500/50"
            />
          </div>
        </div>
      </div>

      {/* Content Tabs Navigation */}
      <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-card border border-white/10 flex-wrap">
        {[
          { id: "AGENDA", label: `Session Agenda (${sessionData.agenda?.length || 0})`, icon: Clock },
          { id: "TOPICS", label: `Topics (${sessionData.topics?.length || 0})`, icon: BookOpen },
          { id: "OUTCOMES", label: `Learning Outcomes (${sessionData.learningOutcomes?.length || 0})`, icon: Award },
          { id: "ACTIVITIES", label: `Hands-on Activities (${sessionData.activities?.length || 0})`, icon: Code },
          { id: "HOMEWORK", label: "Take-Home Assignment", icon: FileText },
          { id: "RESOURCES", label: `Resources (${sessionData.resources?.length || 0})`, icon: Layers },
          { id: "HISTORY", label: `Change History (${sessionData.changeHistory?.length || 0})`, icon: ShieldCheck }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeContentTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveContentTab(tab.id as any)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                isActive
                  ? "bg-purple-600/25 border border-purple-500/40 text-purple-300 shadow-sm"
                  : "text-subtext hover:text-text hover:bg-white/5"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          CONTENT TAB 1: INTERACTIVE AGENDA TIMELINE
          ═══════════════════════════════════════════════════════════════ */}
      {activeContentTab === "AGENDA" && (
        <div className="p-6 rounded-2xl bg-card border border-white/10 space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-text flex items-center gap-2">
                <Clock className="w-4 h-4 text-purple-400" />
                Live Session Agenda Timeline
              </h3>
              <p className="text-xs text-subtext">
                Step-by-step minute breakdown for instructor presentation and hands-on pair coding.
              </p>
            </div>
            <button
              onClick={handleAddAgendaItem}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 text-xs font-bold"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Step</span>
            </button>
          </div>

          <div className="space-y-3">
            {sessionData.agenda?.map((ag: any, i: number) => (
              <div
                key={i}
                className="p-4 rounded-xl bg-background/60 border border-white/5 space-y-2.5 group hover:border-purple-500/30 transition-all"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5 flex-1 min-w-0">
                    <span className="w-7 h-7 rounded-lg bg-purple-500/20 text-purple-300 font-black text-xs flex items-center justify-center shrink-0">
                      {i + 1}
                    </span>
                    <input
                      type="text"
                      value={ag.title}
                      onChange={(e) => handleUpdateAgendaItem(i, "title", e.target.value)}
                      placeholder="Step Title (e.g. Scaled Dot-Product Math Breakdown)"
                      className="flex-1 h-9 px-3 rounded-lg bg-card border border-white/10 text-xs font-bold text-text focus:outline-none focus:border-purple-500/50"
                    />
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <input
                      type="text"
                      value={ag.duration}
                      onChange={(e) => handleUpdateAgendaItem(i, "duration", e.target.value)}
                      placeholder="20 min"
                      className="w-20 h-9 px-2 text-center rounded-lg bg-card border border-white/10 text-xs font-bold text-purple-300 focus:outline-none focus:border-purple-500/50"
                    />
                    <button
                      onClick={() => handleMoveAgenda(i, "UP")}
                      disabled={i === 0}
                      className="p-1.5 rounded-lg bg-card hover:bg-card-hover border border-white/10 text-subtext disabled:opacity-30"
                      title="Move Up"
                    >
                      <MoveUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleMoveAgenda(i, "DOWN")}
                      disabled={i === sessionData.agenda.length - 1}
                      className="p-1.5 rounded-lg bg-card hover:bg-card-hover border border-white/10 text-subtext disabled:opacity-30"
                      title="Move Down"
                    >
                      <MoveDown className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDuplicateAgendaItem(i)}
                      className="p-1.5 rounded-lg bg-card hover:bg-card-hover border border-white/10 text-subtext hover:text-text"
                      title="Duplicate Step"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteAgendaItem(i)}
                      className="p-1.5 rounded-lg bg-card hover:bg-card-hover border border-white/10 text-subtext hover:text-red-400"
                      title="Delete Step"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <input
                  type="text"
                  value={ag.description}
                  onChange={(e) => handleUpdateAgendaItem(i, "description", e.target.value)}
                  placeholder="Detailed instructions, code files to open, or active student checkpoints..."
                  className="w-full h-8 px-3 rounded-lg bg-card/60 border border-white/5 text-[11px] text-subtext focus:outline-none focus:border-purple-500/50"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════
          CONTENT TAB 2: TOPICS
          ═══════════════════════════════════════════════════════════════ */}
      {activeContentTab === "TOPICS" && (
        <div className="p-6 rounded-2xl bg-card border border-white/10 space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-text">Session Topics & Technical Pillars</h3>
            <button
              onClick={handleAddTopic}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-purple-600/20 text-purple-300 border border-purple-500/30 text-xs font-bold"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Topic</span>
            </button>
          </div>

          <div className="space-y-2.5">
            {sessionData.topics?.map((tp: any, i: number) => (
              <div key={i} className="p-3.5 rounded-xl bg-background/60 border border-white/5 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <input
                    type="text"
                    value={tp.title}
                    onChange={(e) => handleUpdateTopic(i, "title", e.target.value)}
                    placeholder="Topic Title"
                    className="flex-1 h-8 px-2.5 rounded-lg bg-card border border-white/10 text-xs font-bold text-text focus:outline-none focus:border-purple-500/50"
                  />
                  <button
                    onClick={() => handleDeleteTopic(i)}
                    className="p-1.5 text-subtext hover:text-red-400"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <input
                  type="text"
                  value={tp.description}
                  onChange={(e) => handleUpdateTopic(i, "description", e.target.value)}
                  placeholder="Topic summary and key takeaways..."
                  className="w-full h-7 px-2.5 rounded-lg bg-card/60 border border-white/5 text-[11px] text-subtext focus:outline-none focus:border-purple-500/50"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════
          CONTENT TAB 3: LEARNING OUTCOMES
          ═══════════════════════════════════════════════════════════════ */}
      {activeContentTab === "OUTCOMES" && (
        <div className="p-6 rounded-2xl bg-card border border-white/10 space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-text">Measurable Learning Outcomes</h3>
            <button
              onClick={handleAddOutcome}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-purple-600/20 text-purple-300 border border-purple-500/30 text-xs font-bold"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Outcome</span>
            </button>
          </div>

          <div className="space-y-2">
            {sessionData.learningOutcomes?.map((lo: any, i: number) => (
              <div key={i} className="flex items-center gap-2 p-2.5 rounded-xl bg-background/60 border border-white/5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <input
                  type="text"
                  value={lo.title}
                  onChange={(e) => handleUpdateOutcome(i, e.target.value)}
                  placeholder="Outcome description..."
                  className="flex-1 h-8 px-2 rounded-lg bg-card border border-white/10 text-xs text-text focus:outline-none focus:border-purple-500/50"
                />
                <button onClick={() => handleDeleteOutcome(i)} className="p-1 text-subtext hover:text-red-400">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════
          CONTENT TAB 4: ACTIVITIES
          ═══════════════════════════════════════════════════════════════ */}
      {activeContentTab === "ACTIVITIES" && (
        <div className="p-6 rounded-2xl bg-card border border-white/10 space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-text">Hands-on Workshop Exercises</h3>
            <button
              onClick={handleAddActivity}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-purple-600/20 text-purple-300 border border-purple-500/30 text-xs font-bold"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Activity</span>
            </button>
          </div>

          <div className="space-y-3">
            {sessionData.activities?.map((ac: any, i: number) => (
              <div key={i} className="p-4 rounded-xl bg-background/60 border border-white/5 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <input
                    type="text"
                    value={ac.title}
                    onChange={(e) => handleUpdateActivity(i, "title", e.target.value)}
                    placeholder="Activity Title"
                    className="flex-1 h-8 px-2.5 rounded-lg bg-card border border-white/10 text-xs font-bold text-text focus:outline-none focus:border-purple-500/50"
                  />
                  <input
                    type="text"
                    value={ac.duration}
                    onChange={(e) => handleUpdateActivity(i, "duration", e.target.value)}
                    placeholder="30 min"
                    className="w-20 h-8 px-2 text-center rounded-lg bg-card border border-white/10 text-xs font-bold text-purple-300 focus:outline-none focus:border-purple-500/50"
                  />
                  <button onClick={() => handleDeleteActivity(i)} className="p-1.5 text-subtext hover:text-red-400">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <textarea
                  rows={2}
                  value={ac.instructions}
                  onChange={(e) => handleUpdateActivity(i, "instructions", e.target.value)}
                  placeholder="Step by step student instructions..."
                  className="w-full p-2.5 rounded-lg bg-card/60 border border-white/5 text-[11px] text-subtext focus:outline-none focus:border-purple-500/50"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════
          CONTENT TAB 5: HOMEWORK ASSIGNMENT
          ═══════════════════════════════════════════════════════════════ */}
      {activeContentTab === "HOMEWORK" && (
        <div className="p-6 rounded-2xl bg-card border border-white/10 space-y-4 animate-in fade-in duration-200">
          <h3 className="text-sm font-bold text-text flex items-center gap-2">
            <FileText className="w-4 h-4 text-purple-400" />
            Session Take-Home Coding Challenge
          </h3>

          <div className="space-y-3 text-xs">
            <div className="space-y-1">
              <label className="font-bold text-text">Assignment Title</label>
              <input
                type="text"
                value={sessionData.homework?.[0]?.title || ""}
                onChange={(e) => {
                  const currentHw = sessionData.homework?.[0] || {};
                  setSessionData({
                    ...sessionData,
                    homework: [{ ...currentHw, title: e.target.value }]
                  });
                }}
                placeholder="e.g. Implement Rotary Position Embedding & Benchmark Throughput"
                className="w-full h-10 px-3.5 rounded-xl bg-background border border-white/10 text-text focus:outline-none focus:border-purple-500/50"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-text">Deliverable Details & Submission Criteria</label>
              <textarea
                rows={4}
                value={sessionData.homework?.[0]?.description || ""}
                onChange={(e) => {
                  const currentHw = sessionData.homework?.[0] || {};
                  setSessionData({
                    ...sessionData,
                    homework: [{ ...currentHw, description: e.target.value }]
                  });
                }}
                placeholder="Explain the required repository structure, unit test benchmarks, and rubric..."
                className="w-full p-3 rounded-xl bg-background border border-white/10 text-text focus:outline-none focus:border-purple-500/50 leading-relaxed"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-text">Due Date / Window</label>
              <input
                type="text"
                value={sessionData.homework?.[0]?.dueDate || ""}
                onChange={(e) => {
                  const currentHw = sessionData.homework?.[0] || {};
                  setSessionData({
                    ...sessionData,
                    homework: [{ ...currentHw, dueDate: e.target.value }]
                  });
                }}
                placeholder="e.g. 4 days after live session"
                className="w-full h-9 px-3.5 rounded-xl bg-background border border-white/10 text-text focus:outline-none focus:border-purple-500/50"
              />
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════
          CONTENT TAB 6: RESOURCES
          ═══════════════════════════════════════════════════════════════ */}
      {activeContentTab === "RESOURCES" && (
        <div className="p-6 rounded-2xl bg-card border border-white/10 space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-text">Attached Resources & GitHub Repos</h3>
            <button
              onClick={handleAddResource}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-purple-600/20 text-purple-300 border border-purple-500/30 text-xs font-bold"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Resource</span>
            </button>
          </div>

          <div className="space-y-2.5">
            {sessionData.resources?.map((res: any, i: number) => (
              <div key={i} className="p-3 rounded-xl bg-background/60 border border-white/5 flex items-center gap-2">
                <select
                  value={res.type}
                  onChange={(e) => handleUpdateResource(i, "type", e.target.value)}
                  className="h-8 px-2.5 rounded-lg bg-card border border-white/10 text-xs font-bold text-purple-300 focus:outline-none"
                >
                  <option value="GITHUB">GITHUB</option>
                  <option value="PDF">PDF</option>
                  <option value="URL">URL</option>
                  <option value="DOCUMENT">DOCUMENT</option>
                  <option value="VIDEO">VIDEO</option>
                </select>
                <input
                  type="text"
                  value={res.title}
                  onChange={(e) => handleUpdateResource(i, "title", e.target.value)}
                  placeholder="Resource Title"
                  className="flex-1 h-8 px-2.5 rounded-lg bg-card border border-white/10 text-xs text-text focus:outline-none"
                />
                <input
                  type="text"
                  value={res.url}
                  onChange={(e) => handleUpdateResource(i, "url", e.target.value)}
                  placeholder="URL link"
                  className="flex-1 h-8 px-2.5 rounded-lg bg-card border border-white/10 text-xs text-purple-300 focus:outline-none"
                />
                <button onClick={() => handleDeleteResource(i)} className="p-1.5 text-subtext hover:text-red-400">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════
          CONTENT TAB 7: CHANGE HISTORY & AUDIT LOG
          ═══════════════════════════════════════════════════════════════ */}
      {activeContentTab === "HISTORY" && (
        <div className="p-6 rounded-2xl bg-card border border-white/10 space-y-4 animate-in fade-in duration-200">
          <h3 className="text-sm font-bold text-text flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            Session Modification & Rescheduling History
          </h3>

          <div className="space-y-3">
            {sessionData.changeHistory?.map((hist: any) => (
              <div key={hist.id} className="p-3.5 rounded-xl bg-background/60 border border-white/5 space-y-1 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-purple-300 uppercase text-[10px] tracking-wider">
                    {hist.changeType}
                  </span>
                  <span className="text-[10px] text-subtext">
                    {new Date(hist.createdAt).toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
                <p className="font-semibold text-text">Changed by: {hist.changedBy}</p>
                {hist.reason && <p className="text-subtext italic">Reason: {hist.reason}</p>}
                {hist.previousValue && hist.newValue && (
                  <div className="p-2 rounded-lg bg-card/60 border border-white/5 text-[11px] space-y-0.5 mt-1 font-mono">
                    <p className="text-red-300/80">From: {hist.previousValue}</p>
                    <p className="text-emerald-300/80">To: {hist.newValue}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════
          AI ASSISTANT SIDE PANEL / MODAL
          ═══════════════════════════════════════════════════════════════ */}
      {aiAssistantOpen && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-2xl rounded-2xl bg-card border border-purple-500/30 shadow-2xl p-6 space-y-5 animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto custom-scrollbar">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-300">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-text">Session AI Copilot</h3>
                  <p className="text-xs text-subtext">Interactive Groq copilot for session enhancement</p>
                </div>
              </div>
              <button onClick={() => setAiAssistantOpen(false)} className="text-subtext hover:text-text">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* AI Action Selector */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-text">Select AI Copilot Task</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {[
                  { id: "GENERATE_AGENDA", label: "Generate Agenda" },
                  { id: "IMPROVE_AGENDA", label: "Improve Agenda" },
                  { id: "GENERATE_LEARNING_OBJECTIVES", label: "Learning Outcomes" },
                  { id: "GENERATE_ACTIVITIES", label: "Pair Coding Activities" },
                  { id: "GENERATE_HOMEWORK", label: "Generate Homework" },
                  { id: "GENERATE_DISCUSSION_QUESTIONS", label: "Discussion Questions" }
                ].map((act) => (
                  <button
                    key={act.id}
                    type="button"
                    onClick={() => setAiAction(act.id)}
                    className={`p-2.5 rounded-xl border text-xs font-bold transition-all text-left truncate ${
                      aiAction === act.id
                        ? "bg-purple-600/25 border-purple-500/50 text-purple-300 shadow-sm"
                        : "bg-background/60 border-white/5 text-subtext hover:text-text"
                    }`}
                  >
                    {act.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-text">Custom Guidance (Optional)</label>
              <input
                type="text"
                value={aiCustomPrompt}
                onChange={(e) => setAiCustomPrompt(e.target.value)}
                placeholder="e.g. Add 20 minutes for live PyTorch tensor debugging and focus on high latency..."
                className="w-full h-9 px-3 rounded-xl bg-background border border-white/10 text-xs text-text focus:outline-none focus:border-purple-500/50"
              />
            </div>

            <button
              onClick={handleCallAIAssistant}
              disabled={isAILoading}
              className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isAILoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Generating Suggestion...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Generate Preview</span>
                </>
              )}
            </button>

            {/* AI Preview Output Container */}
            {aiSuggestionPreview && (
              <div className="p-4 rounded-xl bg-background/80 border border-purple-500/30 space-y-3 animate-in fade-in">
                <div className="flex items-center justify-between border-b border-white/10 pb-2">
                  <span className="text-[11px] font-bold text-purple-300 uppercase tracking-wider">
                    AI Suggested Preview (Non-Destructive)
                  </span>
                  <span className="text-[10px] text-emerald-400 font-semibold">Review before applying</span>
                </div>

                <div className="max-h-60 overflow-y-auto custom-scrollbar text-xs text-text space-y-2">
                  {aiSuggestionPreview.agenda && (
                    <div className="space-y-1.5">
                      {aiSuggestionPreview.agenda.map((ag: any, i: number) => (
                        <div key={i} className="p-2 rounded-lg bg-card/60 border border-white/5 flex justify-between gap-2">
                          <div>
                            <p className="font-bold text-text">{ag.title}</p>
                            <p className="text-[10px] text-subtext">{ag.description}</p>
                          </div>
                          <span className="text-purple-300 font-bold shrink-0">{ag.duration}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {aiSuggestionPreview.learningOutcomes && (
                    <ul className="space-y-1">
                      {aiSuggestionPreview.learningOutcomes.map((lo: string, i: number) => (
                        <li key={i} className="flex items-center gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          <span>{lo}</span>
                        </li>
                      ))}
                    </ul>
                  )}

                  {aiSuggestionPreview.homework && (
                    <div className="p-2.5 rounded-lg bg-card/60 border border-white/5 space-y-1">
                      <p className="font-bold text-purple-300">{aiSuggestionPreview.homework.title}</p>
                      <p className="text-subtext">{aiSuggestionPreview.homework.description}</p>
                    </div>
                  )}
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => setAiSuggestionPreview(null)}
                    className="px-3 py-1.5 rounded-xl bg-card hover:bg-card-hover border border-white/10 text-subtext hover:text-text text-xs font-bold"
                  >
                    Reject
                  </button>
                  <button
                    type="button"
                    onClick={handleApplyAISuggestion}
                    className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/20"
                  >
                    Apply to Session
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════
          RESCHEDULE MODAL
          ═══════════════════════════════════════════════════════════════ */}
      {rescheduleModalOpen && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-md flex items-center justify-center p-4">
          <form
            onSubmit={handleRescheduleSubmit}
            className="w-full max-w-lg rounded-2xl bg-card border border-white/10 shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in-95"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-text flex items-center gap-2">
                <Calendar className="w-4 h-4 text-amber-400" />
                Reschedule Session {sessionData.sessionNumber}
              </h3>
              <button
                type="button"
                onClick={() => setRescheduleModalOpen(false)}
                className="text-subtext hover:text-text"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-text">New Date *</label>
                <input
                  type="date"
                  required
                  value={rescheduleForm.newDate}
                  onChange={(e) => setRescheduleForm({ ...rescheduleForm, newDate: e.target.value })}
                  className="w-full h-9 px-3 rounded-xl bg-background border border-white/10 text-text focus:outline-none focus:border-purple-500/50"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-text">Start Time</label>
                  <input
                    type="text"
                    value={rescheduleForm.newStartTime}
                    onChange={(e) => setRescheduleForm({ ...rescheduleForm, newStartTime: e.target.value })}
                    className="w-full h-9 px-3 rounded-xl bg-background border border-white/10 text-text focus:outline-none focus:border-purple-500/50"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-text">End Time</label>
                  <input
                    type="text"
                    value={rescheduleForm.newEndTime}
                    onChange={(e) => setRescheduleForm({ ...rescheduleForm, newEndTime: e.target.value })}
                    className="w-full h-9 px-3 rounded-xl bg-background border border-white/10 text-text focus:outline-none focus:border-purple-500/50"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-text">Reason for Rescheduling * (Audit & Notification)</label>
                <textarea
                  rows={2}
                  required
                  value={rescheduleForm.reason}
                  onChange={(e) => setRescheduleForm({ ...rescheduleForm, reason: e.target.value })}
                  placeholder="Reason for schedule adjustment..."
                  className="w-full p-2.5 rounded-xl bg-background border border-white/10 text-text focus:outline-none focus:border-purple-500/50"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setRescheduleModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-card hover:bg-card-hover border border-white/10 text-subtext hover:text-text text-xs font-bold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-black text-xs font-bold shadow-md shadow-amber-500/30"
              >
                Confirm Reschedule
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
