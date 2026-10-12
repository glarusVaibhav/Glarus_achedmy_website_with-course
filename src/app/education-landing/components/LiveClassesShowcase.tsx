"use client";

import React, { useState } from "react";
import Link from "next/link";
import { LIVE_CLASSES_DATA, LiveClassSession } from "../data/liveClassesData";
import { 
  Radio, 
  Calendar, 
  Clock, 
  Users, 
  CheckCircle2, 
  ArrowRight, 
  Sparkles, 
  Play, 
  Video, 
  Award,
  X
} from "lucide-react";

export function LiveClassesShowcase() {
  const [selectedLiveClass, setSelectedLiveClass] = useState<LiveClassSession | null>(null);

  return (
    <section id="live-classes" className="py-20 bg-slate-50/60 border-b border-slate-200/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-14 gap-6">
          <div className="max-w-2xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-100 text-rose-900 text-xs font-bold uppercase tracking-wider">
              <Radio className="w-3.5 h-3.5 text-rose-600 animate-pulse" />
              <span>Interactive Live Cohorts</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Learn Together. Grow Together.
            </h2>
            <p className="text-base text-slate-600 leading-relaxed">
              Join live interactive masterclasses, clear doubts in real time with top educators, participate in polls, and build confidence with peers.
            </p>
          </div>

          <Link
            href="/live-classes"
            className="inline-flex items-center gap-2 text-sm font-bold text-blue-600 hover:text-blue-700 bg-white px-5 py-2.5 rounded-xl border border-slate-200/90 shadow-2xs hover:shadow-sm transition-all"
          >
            <span>View Full Live Schedule</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Live Classes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {LIVE_CLASSES_DATA.map((session) => (
            <div
              key={session.id}
              className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-7 shadow-sm hover:shadow-lg hover:border-slate-300 transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                {/* Top Status & Category Row */}
                <div className="flex items-center justify-between gap-3 mb-4">
                  <span className="text-[11px] font-extrabold text-slate-700 bg-slate-100 px-3 py-1 rounded-lg">
                    {session.category}
                  </span>
                  <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${session.badgeColor} flex items-center gap-1.5`}>
                    <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                    {session.badge}
                  </span>
                </div>

                {/* Session Title */}
                <h3 className="text-xl font-bold text-slate-900 tracking-tight mb-3">
                  {session.title}
                </h3>

                {/* Date, Time & Duration Chips */}
                <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-600 mb-5 p-3 rounded-2xl bg-slate-50 border border-slate-100">
                  <div className="flex items-center gap-1.5 text-slate-800">
                    <Calendar className="w-4 h-4 text-blue-600" />
                    <span>{session.date}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-slate-400" />
                    <span>{session.duration}</span>
                  </div>
                  <div className="flex items-center gap-1.5 ml-auto text-emerald-700">
                    <Users className="w-4 h-4 text-emerald-600" />
                    <span>{session.enrolledStudents} / {session.maxSeats} Booked</span>
                  </div>
                </div>

                {/* Key Takeaways */}
                <div className="space-y-2 mb-6">
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    What You Will Master in this Live Session
                  </div>
                  {session.keyTakeaways.map((point, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs font-medium text-slate-700">
                      <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                      <span>{point}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Card Footer: Instructor Bio & Action Button */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <img
                    src={session.instructor.avatar}
                    alt={session.instructor.name}
                    className="w-10 h-10 rounded-full object-cover border border-slate-200"
                  />
                  <div>
                    <div className="text-xs font-bold text-slate-900">{session.instructor.name}</div>
                    <div className="text-[11px] text-slate-500">{session.instructor.role}</div>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedLiveClass(session)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-xs font-bold rounded-xl shadow-md shadow-blue-600/20 transition-all cursor-pointer"
                >
                  <Video className="w-3.5 h-3.5" />
                  <span>{session.isFree ? "Join Free" : "Reserve Seat"}</span>
                </button>
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* Live Class Reservation Modal Preview */}
      {selectedLiveClass && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-100 p-6 space-y-6">
            <div className="flex items-start justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="text-xs font-bold text-rose-600 bg-rose-50 px-2.5 py-0.5 rounded-full">
                  Live Interactive Session
                </span>
                <h3 className="text-lg font-bold text-slate-900 mt-1">{selectedLiveClass.title}</h3>
              </div>
              <button
                onClick={() => setSelectedLiveClass(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 bg-slate-100 rounded-full"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-700">
              <div className="p-3 bg-blue-50 rounded-xl border border-blue-100 flex items-center justify-between">
                <span className="font-semibold text-blue-900">Scheduled Time:</span>
                <span className="font-extrabold text-blue-900">{selectedLiveClass.date}</span>
              </div>
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100 flex items-center justify-between">
                <span className="font-semibold text-emerald-900">Seat Status:</span>
                <span className="font-extrabold text-emerald-900">{selectedLiveClass.maxSeats - selectedLiveClass.enrolledStudents} Seats Remaining</span>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setSelectedLiveClass(null)}
                className="w-1/2 py-2.5 text-xs font-bold text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200"
              >
                Cancel
              </button>
              <Link
                href="/signup"
                onClick={() => setSelectedLiveClass(null)}
                className="w-1/2 py-2.5 text-xs font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-700 shadow-md text-center"
              >
                Confirm Booking
              </Link>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
