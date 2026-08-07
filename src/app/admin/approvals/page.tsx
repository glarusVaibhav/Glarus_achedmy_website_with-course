"use client";

import { useState, useEffect } from "react";
import { ShieldCheck, Eye, Loader2, Inbox } from "lucide-react";
import InstructorReviewModal from "@/components/admin/InstructorReviewModal";

interface InstructorApproval {
  id: string;
  userId: string;
  experience: string | null;
  skills: string | null;
  bio: string | null;
  resumeUrl: string | null;
  version?: number;
  feedback?: string | null;
  status: "PENDING" | "APPROVED" | "REJECTED" | "CHANGES_REQUESTED";
  reviewedAt: string | null;
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    createdAt: string;
  };
}

export default function ApprovalsPage() {
  const [approvals, setApprovals] = useState<InstructorApproval[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApproval, setSelectedApproval] = useState<InstructorApproval | null>(null);

  useEffect(() => {
    fetchApprovals();
  }, []);

  const fetchApprovals = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/approvals/instructor");
      if (res.ok) {
        const data = await res.json();
        setApprovals(data.approvals || []);
      }
    } catch {
      /* silent */
    } finally {
      setLoading(false);
    }
  };

  const handleDecision = async (
    instructorId: string,
    decision: "APPROVED" | "REJECTED" | "CHANGES_REQUESTED",
    feedback?: string
  ) => {
    try {
      const res = await fetch("/api/admin/approvals/instructor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ instructorId, decision, feedback }),
      });
      if (res.ok) {
        await fetchApprovals();
        setSelectedApproval(null);
      }
    } catch {
      /* silent */
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-amber-500/10 text-amber-500 border-amber-500/30";
      case "CHANGES_REQUESTED":
        return "bg-amber-500/20 text-amber-400 border-amber-500/40";
      case "APPROVED":
        return "bg-emerald-500/10 text-emerald-500 border-emerald-500/30";
      case "REJECTED":
        return "bg-red-500/10 text-red-500 border-red-500/30";
      default:
        return "bg-card text-subtext border-card";
    }
  };

  return (
    <div className="space-y-8 pb-12 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-text tracking-tight flex items-center gap-3">
             <ShieldCheck className="w-8 h-8 text-primary" />
             Instructor Onboarding
          </h1>
          <p className="text-subtext mt-1 font-medium">Review instructor verification applications and manage approvals.</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary border border-primary/20 rounded-full text-sm font-bold">
          {approvals.filter(a => a.status === "PENDING").length} Pending Review
        </div>
      </div>

      <div className="bg-card rounded-3xl border border-card/40 shadow-2xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
        ) : approvals.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-subtext">
            <Inbox className="w-12 h-12 mb-4 opacity-30" />
            <p className="font-bold text-lg text-text">No applications yet</p>
            <p className="text-sm">Instructor verification applications will appear here.</p>
          </div>
        ) : (
          <div className="overflow-x-auto animate-in fade-in slide-in-from-bottom-2">
            <table className="w-full text-left border-collapse min-w-[1000px]">
              <thead>
                <tr className="border-b border-card/40 bg-background/50">
                  <th className="py-5 px-8 text-xs font-black text-subtext uppercase tracking-widest">Instructor</th>
                  <th className="py-5 px-6 text-xs font-black text-subtext uppercase tracking-widest">Experience / Version</th>
                  <th className="py-5 px-6 text-xs font-black text-subtext uppercase tracking-widest text-center">Status</th>
                  <th className="py-5 px-6 text-xs font-black text-subtext uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-card/30">
                {approvals.map(approval => (
                  <tr key={approval.id} className="hover:bg-background/40 transition-colors">
                    <td className="py-5 px-8">
                       <p className="font-bold text-text text-sm">{approval.user.name}</p>
                       <p className="text-xs text-subtext mt-0.5">{approval.user.email}</p>
                       <p className="text-[10px] text-subtext/50 font-bold mt-1">
                         Submitted: {new Date(approval.createdAt).toLocaleDateString()}
                       </p>
                    </td>
                    <td className="py-5 px-6 space-y-1">
                       <p className="text-xs font-bold text-text">
                         <span className="text-subtext mr-1">Exp:</span> {approval.experience || "—"}
                       </p>
                       <p className="text-xs font-bold text-text">
                         <span className="text-subtext mr-1">Version:</span> <span className="text-purple-400 font-mono">v{approval.version || 1}</span>
                       </p>
                       {approval.resumeUrl && (
                         <span className="inline-block mt-1 px-2 py-0.5 text-[10px] bg-sky-500/10 text-sky-500 border border-sky-500/20 rounded-md font-bold uppercase tracking-wider">
                           Resume Attached
                         </span>
                       )}
                    </td>
                    <td className="py-5 px-6 text-center">
                       <span className={`px-2.5 py-1 rounded text-xs font-bold border ${getStatusBadge(approval.status)}`}>
                         {approval.status.replace("_", " ")}
                       </span>
                    </td>
                    <td className="py-5 px-6">
                       <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setSelectedApproval(approval)}
                            title="Review Application"
                            className="flex flex-col items-center justify-center py-2 px-4 rounded-xl border border-primary/30 bg-primary/10 text-primary hover:bg-primary/20 hover:-translate-y-0.5 active:translate-y-0 transition-all font-bold text-[11px] uppercase tracking-wider"
                          >
                             <Eye className="w-5 h-5 mb-1" />
                             Review
                          </button>
                       </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selectedApproval && (
        <InstructorReviewModal
          approval={selectedApproval}
          onClose={() => setSelectedApproval(null)}
          onDecision={handleDecision}
        />
      )}
    </div>
  );
}
