"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  Video,
  Radio,
  UserCheck,
  Edit3,
  ExternalLink,
  Plus,
  RefreshCw,
  X,
  Check,
  AlertTriangle
} from "lucide-react";

export default function AdminLiveCalendarView() {
  const [sessions, setSessions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarView, setCalendarView] = useState<"MONTH" | "WEEK" | "DAY">("MONTH");
  const [selectedSessionModal, setSelectedSessionModal] = useState<any>(null);

  // Reschedule Modal
  const [rescheduleModalOpen, setRescheduleModalOpen] = useState(false);
  const [rescheduleForm, setRescheduleForm] = useState({
    newDate: "",
    newStartTime: "07:00 PM",
    newEndTime: "09:00 PM",
    reason: ""
  });
  const [isRescheduling, setIsRescheduling] = useState(false);
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

  // Calendar Date Navigation
  const handlePrev = () => {
    const d = new Date(currentDate);
    if (calendarView === "MONTH") {
      d.setMonth(d.getMonth() - 1);
    } else if (calendarView === "WEEK") {
      d.setDate(d.getDate() - 7);
    } else {
      d.setDate(d.getDate() - 1);
    }
    setCurrentDate(d);
  };

  const handleNext = () => {
    const d = new Date(currentDate);
    if (calendarView === "MONTH") {
      d.setMonth(d.getMonth() + 1);
    } else if (calendarView === "WEEK") {
      d.setDate(d.getDate() + 7);
    } else {
      d.setDate(d.getDate() + 1);
    }
    setCurrentDate(d);
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  // Month Grid Calculation
  const monthData = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDayIndex = new Date(year, month, 1).getDay(); // Sunday=0
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    const days = [];

    // Previous month filler days
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const dayNum = daysInPrevMonth - i;
      const dateObj = new Date(year, month - 1, dayNum);
      days.push({
        date: dateObj,
        dayNum,
        isCurrentMonth: false,
        dateKey: dateObj.toISOString().split("T")[0]
      });
    }

    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      const dateObj = new Date(year, month, i);
      days.push({
        date: dateObj,
        dayNum: i,
        isCurrentMonth: true,
        dateKey: dateObj.toISOString().split("T")[0]
      });
    }

    // Next month filler days (grid total 35 or 42)
    const remaining = (7 - (days.length % 7)) % 7;
    for (let i = 1; i <= remaining; i++) {
      const dateObj = new Date(year, month + 1, i);
      days.push({
        date: dateObj,
        dayNum: i,
        isCurrentMonth: false,
        dateKey: dateObj.toISOString().split("T")[0]
      });
    }

    return days;
  }, [currentDate]);

  // Map sessions to dates
  const sessionsByDate = useMemo(() => {
    const map: Record<string, any[]> = {};
    sessions.forEach((sess) => {
      if (sess.date) {
        const key = new Date(sess.date).toISOString().split("T")[0];
        if (!map[key]) map[key] = [];
        map[key].push(sess);
      }
    });
    return map;
  }, [sessions]);

  // Handle Reschedule
  const handleRescheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSessionModal || !rescheduleForm.newDate || !rescheduleForm.reason) return;

    setIsRescheduling(true);
    try {
      const res = await fetch(`/api/admin/live-training/sessions/${selectedSessionModal.id}/reschedule`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(rescheduleForm)
      });

      if (res.ok) {
        setRescheduleModalOpen(false);
        setSelectedSessionModal(null);
        setSuccessMessage("Session rescheduled and history recorded!");
        fetchSessions();
        setTimeout(() => setSuccessMessage(""), 3000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsRescheduling(false);
    }
  };

  const monthName = currentDate.toLocaleString("default", { month: "long" });
  const yearNum = currentDate.getFullYear();

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 pb-24">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-300 border border-purple-500/30">
              Live Schedule Telemetry
            </span>
            <span className="text-xs text-subtext">•</span>
            <span className="text-xs text-subtext">Live Workshops Calendar</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-text tracking-tight mt-1">
            Master Live Training Calendar
          </h1>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/admin/live-training"
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-card hover:bg-card-hover border border-white/10 text-subtext hover:text-text text-xs font-bold transition-all"
          >
            <Radio className="w-3.5 h-3.5 text-purple-400" />
            <span>Live Courses</span>
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
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Calendar Controls */}
      <div className="p-4 rounded-2xl bg-card border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <button
              onClick={handlePrev}
              className="p-2 rounded-xl bg-background hover:bg-card border border-white/10 text-subtext hover:text-text transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleNext}
              className="p-2 rounded-xl bg-background hover:bg-card border border-white/10 text-subtext hover:text-text transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <h2 className="text-base sm:text-lg font-black text-text">
            {monthName} {yearNum}
          </h2>

          <button
            onClick={handleToday}
            className="px-3 py-1.5 rounded-xl bg-background hover:bg-card border border-white/10 text-xs font-bold text-subtext hover:text-text transition-colors"
          >
            Today
          </button>
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-background/60 border border-white/5 text-xs font-bold">
          {(["MONTH", "WEEK", "DAY"] as const).map((view) => (
            <button
              key={view}
              onClick={() => setCalendarView(view)}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                calendarView === view
                  ? "bg-purple-600/25 text-purple-300 border border-purple-500/30 shadow-sm"
                  : "text-subtext hover:text-text hover:bg-white/5"
              }`}
            >
              {view.charAt(0) + view.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Month View Grid */}
      {calendarView === "MONTH" && (
        <div className="rounded-2xl bg-card border border-white/10 overflow-hidden shadow-sm">
          {/* Day Names Header */}
          <div className="grid grid-cols-7 border-b border-white/10 bg-background/40 text-center py-2.5 text-[11px] font-black uppercase tracking-wider text-subtext">
            <span>Sun</span>
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
          </div>

          {/* Days Cells */}
          <div className="grid grid-cols-7 divide-x divide-y divide-white/5">
            {monthData.map((cell, idx) => {
              const daySessions = sessionsByDate[cell.dateKey] || [];
              const isToday =
                new Date().toISOString().split("T")[0] === cell.dateKey;

              return (
                <div
                  key={idx}
                  className={`min-h-[110px] p-2 flex flex-col justify-between transition-colors ${
                    cell.isCurrentMonth ? "bg-card/40" : "bg-background/20 opacity-40"
                  } ${isToday ? "ring-1 ring-inset ring-purple-500/40 bg-purple-950/10" : ""}`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-bold ${
                        isToday
                          ? "w-6 h-6 rounded-full bg-purple-600 text-white flex items-center justify-center"
                          : cell.isCurrentMonth
                          ? "text-text"
                          : "text-subtext"
                      }`}
                    >
                      {cell.dayNum}
                    </span>
                    {daySessions.length > 0 && (
                      <span className="text-[10px] font-black text-purple-400">
                        {daySessions.length} {daySessions.length === 1 ? "sess" : "sess"}
                      </span>
                    )}
                  </div>

                  {/* Sessions Chips */}
                  <div className="space-y-1 my-1 overflow-y-auto max-h-20 custom-scrollbar">
                    {daySessions.map((sess) => (
                      <button
                        key={sess.id}
                        type="button"
                        onClick={() => setSelectedSessionModal(sess)}
                        className={`w-full text-left p-1.5 rounded-lg border transition-all truncate text-[10px] font-bold ${
                          sess.status === "LIVE"
                            ? "bg-red-500/20 text-red-300 border-red-500/30 animate-pulse"
                            : sess.status === "COMPLETED"
                            ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/20"
                            : "bg-purple-600/20 text-purple-300 border-purple-500/30 hover:scale-[1.02]"
                        }`}
                      >
                        <p className="truncate">S{sess.sessionNumber}: {sess.title}</p>
                        <p className="text-[9px] text-subtext/80 truncate">{sess.startTime}</p>
                      </button>
                    ))}
                  </div>

                  <div />
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Week / Day View Fallback List */}
      {calendarView !== "MONTH" && (
        <div className="p-6 rounded-2xl bg-card border border-white/10 space-y-4">
          <h3 className="text-sm font-bold text-text">
            Upcoming Sessions for Selected Cadence
          </h3>
          <div className="space-y-3">
            {sessions.map((sess) => (
              <div
                key={sess.id}
                onClick={() => setSelectedSessionModal(sess)}
                className="p-4 rounded-xl bg-background/60 border border-white/5 hover:border-purple-500/30 transition-all flex items-center justify-between gap-3 cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 font-bold text-xs">
                    S{sess.sessionNumber}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-text">{sess.title}</h4>
                    <p className="text-[11px] text-subtext">{sess.courseTitle}</p>
                  </div>
                </div>
                <div className="text-right text-xs">
                  <p className="font-semibold text-purple-300">{sess.date ? new Date(sess.date).toLocaleDateString() : "TBA"}</p>
                  <p className="text-[10px] text-subtext">{sess.startTime} - {sess.endTime}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════
          SESSION DETAIL MODAL / DRAWER
          ═══════════════════════════════════════════════════════════════ */}
      {selectedSessionModal && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-2xl bg-card border border-white/10 shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  Session {selectedSessionModal.sessionNumber}
                </span>
                <span className="text-xs text-subtext font-semibold truncate max-w-xs">
                  {selectedSessionModal.courseTitle}
                </span>
              </div>
              <button onClick={() => setSelectedSessionModal(null)} className="text-subtext hover:text-text">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <h3 className="text-base font-bold text-text">{selectedSessionModal.title}</h3>
              <p className="text-xs text-subtext mt-1">{selectedSessionModal.description}</p>
            </div>

            <div className="p-3.5 rounded-xl bg-background/60 border border-white/5 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-subtext">Date & Time:</span>
                <span className="font-bold text-text">
                  {selectedSessionModal.date ? new Date(selectedSessionModal.date).toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" }) : "TBA"}{" "}
                  ({selectedSessionModal.startTime} - {selectedSessionModal.endTime})
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-subtext">Duration:</span>
                <span className="font-bold text-text">{selectedSessionModal.duration}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-subtext">Assigned Instructor:</span>
                <span className="font-bold text-purple-300">
                  {selectedSessionModal.assignedInstructor?.name || "Unassigned"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-subtext">Meeting Link:</span>
                <a
                  href={selectedSessionModal.meetingUrl || "#"}
                  target="_blank"
                  rel="noreferrer"
                  className="font-bold text-purple-400 hover:underline truncate max-w-[200px]"
                >
                  {selectedSessionModal.meetingUrl || "Not yet configured"}
                </a>
              </div>
            </div>

            {/* Agenda Preview */}
            {selectedSessionModal.agenda?.length > 0 && (
              <div className="space-y-1.5 max-h-36 overflow-y-auto custom-scrollbar">
                <p className="text-[11px] font-bold uppercase tracking-wider text-subtext">Agenda Timeline</p>
                {selectedSessionModal.agenda.map((ag: any, i: number) => (
                  <div key={i} className="flex justify-between p-2 rounded-lg bg-card/60 border border-white/5 text-[11px]">
                    <span className="font-bold text-text truncate">{ag.title}</span>
                    <span className="text-purple-300 font-semibold shrink-0">{ag.duration}</span>
                  </div>
                ))}
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/10">
              <button
                type="button"
                onClick={() => {
                  setRescheduleForm({
                    newDate: selectedSessionModal.date ? new Date(selectedSessionModal.date).toISOString().split("T")[0] : "",
                    newStartTime: selectedSessionModal.startTime || "07:00 PM",
                    newEndTime: selectedSessionModal.endTime || "09:00 PM",
                    reason: ""
                  });
                  setRescheduleModalOpen(true);
                }}
                className="px-3.5 py-2 rounded-xl bg-card hover:bg-card-hover border border-white/10 text-xs font-bold text-amber-300 transition-colors"
              >
                Reschedule
              </button>

              <Link
                href={`/admin/live-training/courses/${selectedSessionModal.courseId}/sessions/${selectedSessionModal.id}`}
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-md shadow-purple-600/30"
              >
                Open Session Builder
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════
          RESCHEDULE MODAL
          ═══════════════════════════════════════════════════════════════ */}
      {rescheduleModalOpen && selectedSessionModal && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-md flex items-center justify-center p-4">
          <form
            onSubmit={handleRescheduleSubmit}
            className="w-full max-w-lg rounded-2xl bg-card border border-white/10 shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in-95"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-text flex items-center gap-2">
                <CalendarIcon className="w-4 h-4 text-amber-400" />
                Reschedule Live Session
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
                  <label className="font-bold text-text">New Start Time</label>
                  <input
                    type="text"
                    value={rescheduleForm.newStartTime}
                    onChange={(e) => setRescheduleForm({ ...rescheduleForm, newStartTime: e.target.value })}
                    className="w-full h-9 px-3 rounded-xl bg-background border border-white/10 text-text focus:outline-none focus:border-purple-500/50"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-text">New End Time</label>
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
                  placeholder="Mandatory reason for audit logs..."
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
                disabled={isRescheduling}
                className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-black text-xs font-bold shadow-md shadow-amber-500/30"
              >
                {isRescheduling ? "Rescheduling..." : "Confirm Reschedule"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
