"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  Video,
  Search,
  Filter,
  Calendar,
  Clock,
  UserCheck,
  Edit3,
  ExternalLink,
  Plus,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Radio,
  Trash2,
  X
} from "lucide-react";

export default function AdminLiveSessionsList() {
  const [sessions, setSessions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Reschedule Modal
  const [rescheduleModalOpen, setRescheduleModalOpen] = useState(false);
  const [selectedSessionForReschedule, setSelectedSessionForReschedule] = useState<any>(null);
  const [rescheduleForm, setRescheduleForm] = useState({
    newDate: "",
    newStartTime: "07:00 PM",
    newEndTime: "09:00 PM",
    reason: ""
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const fetchSessions = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/live-training/sessions");
      if (res.ok) {
        const data = await res.json();
        setSessions(data.sessions || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const filteredSessions = useMemo(() => {
    return sessions.filter((sess) => {
      const q = searchTerm.toLowerCase();
      const matchesSearch =
        !searchTerm ||
        sess.title.toLowerCase().includes(q) ||
        sess.courseTitle.toLowerCase().includes(q) ||
        (sess.assignedInstructor?.name && sess.assignedInstructor.name.toLowerCase().includes(q));

      const matchesStatus = statusFilter === "ALL" || sess.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [sessions, searchTerm, statusFilter]);

  const handleRescheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSessionForReschedule || !rescheduleForm.newDate || !rescheduleForm.reason) return;

    setIsProcessing(true);
    try {
      const res = await fetch(`/api/admin/live-training/sessions/${selectedSessionForReschedule.id}/reschedule`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(rescheduleForm)
      });

      if (res.ok) {
        setRescheduleModalOpen(false);
        setSelectedSessionForReschedule(null);
        setSuccessMessage("Session rescheduled successfully!");
        fetchSessions();
        setTimeout(() => setSuccessMessage(""), 3000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteSession = async (sessionId: string) => {
    if (!confirm("Are you sure you want to delete this session?")) return;
    try {
      const res = await fetch(`/api/admin/live-training/sessions/${sessionId}`, {
        method: "DELETE"
      });
      if (res.ok) {
        fetchSessions();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 pb-24">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-300 border border-purple-500/30">
              Live Workshops Directory
            </span>
            <span className="text-xs text-subtext">•</span>
            <span className="text-xs text-subtext">{sessions.length} Total Sessions</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-text tracking-tight mt-1">
            All Live Training Sessions
          </h1>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/admin/live-training/calendar"
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-card hover:bg-card-hover border border-white/10 text-subtext hover:text-text text-xs font-bold transition-all"
          >
            <Calendar className="w-3.5 h-3.5 text-purple-400" />
            <span>Master Calendar</span>
          </Link>
          <Link
            href="/admin/live-training/create"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-lg shadow-purple-600/20 transition-all hover:scale-105"
          >
            <Plus className="w-4 h-4" />
            <span>Create Cohort</span>
          </Link>
        </div>
      </div>

      {successMessage && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-3 text-emerald-300 text-xs animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-card border border-white/10 space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex flex-wrap gap-1.5 p-1 rounded-xl bg-background/60 border border-white/5">
            {[
              { id: "ALL", label: "All Sessions" },
              { id: "SCHEDULED", label: "Scheduled" },
              { id: "LIVE", label: "Live Now" },
              { id: "COMPLETED", label: "Completed" },
              { id: "RESCHEDULED", label: "Rescheduled" },
              { id: "DRAFT", label: "Drafts" }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  statusFilter === tab.id
                    ? "bg-purple-600/25 text-purple-300 border border-purple-500/30 shadow-sm"
                    : "text-subtext hover:text-text hover:bg-white/5"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="relative flex-1 sm:max-w-xs">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-subtext" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search session or course..."
              className="w-full h-9 pl-9 pr-3 rounded-xl bg-background border border-white/10 text-text text-xs focus:outline-none focus:border-purple-500/50"
            />
          </div>
        </div>
      </div>

      {/* Sessions Table */}
      {isLoading ? (
        <div className="p-16 rounded-2xl bg-card border border-white/10 text-center space-y-3">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto text-purple-400" />
          <p className="text-xs text-subtext font-semibold">Loading sessions...</p>
        </div>
      ) : filteredSessions.length === 0 ? (
        <div className="p-16 rounded-2xl bg-card border border-dashed border-white/15 text-center space-y-3">
          <Video className="w-8 h-8 text-subtext mx-auto" />
          <h3 className="text-sm font-bold text-text">No live sessions found</h3>
        </div>
      ) : (
        <div className="p-6 rounded-2xl bg-card border border-white/10 space-y-4">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-white/10 text-subtext text-[11px] font-bold uppercase tracking-wider">
                  <th className="py-3 px-3">#</th>
                  <th className="py-3 px-3">Session Title</th>
                  <th className="py-3 px-3">Course</th>
                  <th className="py-3 px-3">Date & Time</th>
                  <th className="py-3 px-3">Instructor</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3">Agenda</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredSessions.map((sess) => (
                  <tr key={sess.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="py-4 px-3 font-bold text-purple-400">S{sess.sessionNumber}</td>
                    <td className="py-4 px-3 font-bold text-text max-w-xs">
                      <p className="truncate">{sess.title}</p>
                      <p className="text-[10px] text-subtext font-normal truncate mt-0.5">{sess.description}</p>
                    </td>
                    <td className="py-4 px-3 text-subtext max-w-[200px]">
                      <Link
                        href={`/admin/live-training/courses/${sess.courseId}`}
                        className="font-semibold text-text hover:text-purple-300 truncate block"
                      >
                        {sess.courseTitle}
                      </Link>
                      <span className="text-[10px] text-subtext/70">{sess.courseCategory}</span>
                    </td>
                    <td className="py-4 px-3 text-subtext whitespace-nowrap">
                      <p className="font-semibold text-text">
                        {sess.date ? new Date(sess.date).toLocaleDateString([], { month: "short", day: "numeric" }) : "Unscheduled"}
                      </p>
                      <p className="text-[10px]">{sess.startTime} – {sess.endTime}</p>
                    </td>
                    <td className="py-4 px-3 whitespace-nowrap">
                      <p className="font-bold text-text">{sess.assignedInstructor?.name || "Unassigned"}</p>
                      <span className="text-[10px] text-emerald-400 font-semibold">
                        {sess.permissions?.canEdit ? "Can Edit" : "View Only"}
                      </span>
                    </td>
                    <td className="py-4 px-3 whitespace-nowrap">
                      <span
                        className={`text-[9px] font-black uppercase px-2 py-0.5 rounded border ${
                          sess.status === "COMPLETED"
                            ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/20"
                            : sess.status === "LIVE"
                            ? "bg-red-500/20 text-red-300 border-red-500/30 animate-pulse"
                            : sess.status === "RESCHEDULED"
                            ? "bg-amber-500/20 text-amber-300 border-amber-500/30"
                            : "bg-purple-500/15 text-purple-300 border-purple-500/20"
                        }`}
                      >
                        {sess.status}
                      </span>
                    </td>
                    <td className="py-4 px-3 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded bg-white/5 text-subtext border border-white/10 text-[10px]">
                        {sess.agendaCount} steps
                      </span>
                    </td>
                    <td className="py-4 px-3 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => {
                            setSelectedSessionForReschedule(sess);
                            setRescheduleForm({
                              newDate: sess.date ? new Date(sess.date).toISOString().split("T")[0] : "",
                              newStartTime: sess.startTime || "07:00 PM",
                              newEndTime: sess.endTime || "09:00 PM",
                              reason: ""
                            });
                            setRescheduleModalOpen(true);
                          }}
                          className="px-2.5 py-1.5 rounded-lg bg-card hover:bg-card-hover border border-white/10 text-xs font-bold text-amber-300 transition-colors"
                        >
                          Reschedule
                        </button>
                        <Link
                          href={`/admin/live-training/courses/${sess.courseId}/sessions/${sess.id}`}
                          className="px-2.5 py-1.5 rounded-lg bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 text-xs font-bold transition-all"
                        >
                          Builder
                        </Link>
                        <button
                          onClick={() => handleDeleteSession(sess.id)}
                          className="p-1.5 text-subtext hover:text-red-400 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Reschedule Modal */}
      {rescheduleModalOpen && selectedSessionForReschedule && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-md flex items-center justify-center p-4">
          <form
            onSubmit={handleRescheduleSubmit}
            className="w-full max-w-lg rounded-2xl bg-card border border-white/10 shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in-95"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-text flex items-center gap-2">
                <Calendar className="w-4 h-4 text-amber-400" />
                Reschedule Session {selectedSessionForReschedule.sessionNumber}
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
                <label className="font-bold text-text">Reason for Rescheduling *</label>
                <textarea
                  rows={2}
                  required
                  value={rescheduleForm.reason}
                  onChange={(e) => setRescheduleForm({ ...rescheduleForm, reason: e.target.value })}
                  placeholder="Reason for audit logs..."
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
                disabled={isProcessing}
                className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-black text-xs font-bold shadow-md shadow-amber-500/30"
              >
                {isProcessing ? "Updating..." : "Confirm Reschedule"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
