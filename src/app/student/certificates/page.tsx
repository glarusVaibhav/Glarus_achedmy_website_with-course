"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { StudentPortalLayout } from "@/components/student/StudentPortalLayout";
import { Award, GraduationCap, Download, Share2, Trophy, ExternalLink, BookOpen, ArrowRight } from "lucide-react";

interface CertificateItem {
  id: string;
  courseTitle: string;
  instructor: string;
  issueDate: string;
  credentialId: string;
  verificationUrl?: string;
}

export default function StudentCertificatesPage() {
  const [certificates, setCertificates] = useState<CertificateItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCertificates() {
      try {
        setLoading(true);
        const res = await fetch("/api/student/certificates");
        if (res.ok) {
          const data = await res.json();
          setCertificates(Array.isArray(data.certificates) ? data.certificates : []);
        } else {
          setCertificates([]);
        }
      } catch (err) {
        console.error("Failed to load certificates:", err);
        setCertificates([]);
      } finally {
        setLoading(false);
      }
    }
    loadCertificates();
  }, []);

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

        {loading ? (
          <div className="py-24 flex flex-col items-center justify-center text-center space-y-3">
            <div className="w-10 h-10 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin" />
            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">
              Loading verified credentials...
            </p>
          </div>
        ) : certificates.length === 0 ? (
          <div className="py-20 px-6 border border-dashed border-white/[0.08] rounded-3xl bg-[#0c111e]/50 flex flex-col items-center justify-center text-center space-y-4 max-w-xl mx-auto">
            <div className="w-16 h-16 rounded-2xl bg-purple-500/10 border border-purple-500/25 flex items-center justify-center text-purple-400 shadow-inner">
              <Award className="w-8 h-8 opacity-80" />
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-bold text-white">No certificates earned yet</h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Complete 100% of your course lectures and pass your project assessments to unlock verified, verifiable certificates.
              </p>
            </div>

            <Link
              href="/courses"
              className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition-all shadow-md shadow-purple-900/30 flex items-center gap-2"
            >
              <span>Explore Courses</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        ) : (
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
        )}
      </div>
    </StudentPortalLayout>
  );
}
