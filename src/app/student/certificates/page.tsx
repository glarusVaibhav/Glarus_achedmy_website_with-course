"use client";

import React from "react";
import Link from "next/link";
import { StudentPortalLayout } from "@/components/student/StudentPortalLayout";
import { Award, GraduationCap, Download, Share2, CheckCircle2, Trophy, ExternalLink } from "lucide-react";

export default function StudentCertificatesPage() {
  const certificates = [
    {
      id: "cert-1",
      courseTitle: "Generative AI Application Engineering",
      instructor: "Alex Chen",
      issueDate: "Aug 10, 2026",
      credentialId: "GA-GENAI-883491",
      verificationUrl: "https://glarus.academy/verify/GA-GENAI-883491"
    }
  ];

  return (
    <StudentPortalLayout>
      <div className="w-full min-h-screen py-8 px-4 sm:px-8 max-w-[1600px] mx-auto space-y-8">
        <div className="flex items-center gap-3 border-b border-border/50 pb-5">
          <div className="p-2.5 rounded-xl bg-purple-500/15 text-purple-400 border border-purple-500/30">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-text tracking-tight">
              Earned <span className="text-purple-400">Certificates</span> & Credentials
            </h1>
            <p className="text-xs sm:text-sm text-subtext mt-0.5">
              Verified cryptographic certifications earned upon completing Glarus Academy programs.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {certificates.map((cert) => (
            <div
              key={cert.id}
              className="border border-border/80 rounded-3xl p-6 bg-card/60 flex flex-col justify-between gap-5 group hover:border-purple-500/40 transition-all shadow-md relative overflow-hidden"
            >
              <div className="absolute -right-10 -top-10 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />

              {/* Certificate Preview Card */}
              <div className="w-full h-44 bg-gradient-to-br from-purple-950/40 via-card to-indigo-950/30 rounded-2xl border border-purple-500/30 flex flex-col items-center justify-center p-4 text-center relative overflow-hidden group-hover:scale-[1.02] transition-transform">
                <GraduationCap className="w-12 h-12 text-purple-400 mb-2" />
                <div className="text-[10px] font-black text-purple-300 uppercase tracking-[0.2em]">
                  Certificate of Completion
                </div>
                <div className="text-sm font-bold text-white mt-1 line-clamp-1 italic px-2">
                  {cert.courseTitle}
                </div>
                <div className="text-[10px] font-mono text-purple-300/80 mt-1">ID: {cert.credentialId}</div>
              </div>

              <div className="space-y-1">
                <h3 className="font-extrabold text-base text-text">{cert.courseTitle}</h3>
                <div className="text-xs text-subtext flex items-center justify-between">
                  <span>Instructor: {cert.instructor}</span>
                  <span>Issued: {cert.issueDate}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-border/50">
                <button className="flex-1 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-md shadow-purple-900/30">
                  <Download className="w-3.5 h-3.5" />
                  <span>Download PDF</span>
                </button>
                <button className="p-2.5 bg-card hover:bg-white/[0.08] border border-border/80 rounded-xl text-subtext hover:text-text transition-colors cursor-pointer">
                  <Share2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </StudentPortalLayout>
  );
}
