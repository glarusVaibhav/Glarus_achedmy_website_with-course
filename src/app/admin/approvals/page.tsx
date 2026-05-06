"use client";

import { useState } from "react";
import { ShieldCheck, Eye } from "lucide-react";
import InstructorReviewModal from "@/components/admin/InstructorReviewModal";

export default function ApprovalsPage() {
  const [selectedInstructorId, setSelectedInstructorId] = useState<string | null>(null);

  // Mock Data
  const mockInstructors = [
    { id: "i1", name: "David Kim", email: "david.k@example.com", submittedAt: "10 mins ago", experience: "5 Years", proposed: "Advanced Python", status: "Pending", resumeUrl: "/resume.pdf" },
    { id: "i2", name: "Samantha Lee", email: "sam.lee@example.com", submittedAt: "2 hrs ago", experience: "8 Years", proposed: "Cloud Architecture", status: "Approved", resumeUrl: "/resume2.pdf" },
  ];

  return (
    <div className="space-y-8 pb-12 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-text tracking-tight flex items-center gap-3">
             <ShieldCheck className="w-8 h-8 text-primary" />
             Instructor Onboarding
          </h1>
          <p className="text-subtext mt-1 font-medium">Review AI-parsed resumes and validate instructor applications.</p>
        </div>
      </div>

      <div className="bg-card rounded-3xl border border-card/40 shadow-2xl overflow-hidden">
           <div className="overflow-x-auto animate-in fade-in slide-in-from-bottom-2">
             <table className="w-full text-left border-collapse min-w-[1000px]">
                <thead>
                  <tr className="border-b border-card/40 bg-background/50">
                    <th className="py-5 px-8 text-xs font-black text-subtext uppercase tracking-widest">Instructor</th>
                    <th className="py-5 px-6 text-xs font-black text-subtext uppercase tracking-widest">Experience / Content</th>
                    <th className="py-5 px-6 text-xs font-black text-subtext uppercase tracking-widest text-center">Status</th>
                    <th className="py-5 px-6 text-xs font-black text-subtext uppercase tracking-widest text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-card/30">
                  {mockInstructors.map(inst => (
                    <tr key={inst.id} className="hover:bg-background/40 transition-colors">
                      <td className="py-5 px-8">
                         <p className="font-bold text-text text-sm">{inst.name}</p>
                         <p className="text-xs text-subtext mt-0.5">{inst.email}</p>
                         <p className="text-[10px] text-subtext/50 font-bold mt-1">Submitted: {inst.submittedAt}</p>
                      </td>
                      <td className="py-5 px-6 space-y-1">
                         <p className="text-xs font-bold text-text"><span className="text-subtext mr-1">Exp:</span> {inst.experience}</p>
                         <p className="text-xs font-bold text-text"><span className="text-subtext mr-1">Proposes:</span> {inst.proposed}</p>
                         <span className="inline-block mt-1 px-2 py-0.5 text-[10px] bg-sky-500/10 text-sky-500 border border-sky-500/20 rounded-md font-bold uppercase tracking-wider">Resume Attached</span>
                      </td>
                      <td className="py-5 px-6 text-center">
                         <span className={`px-2.5 py-1 rounded text-xs font-bold border ${inst.status === 'Pending' ? 'bg-amber-500/10 text-amber-500 border-amber-500/30' : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30'}`}>{inst.status}</span>
                      </td>
                      <td className="py-5 px-6">
                         <div className="flex items-center justify-end gap-2">
                            <button onClick={() => setSelectedInstructorId(inst.id)} title="View Detail Profile" className="flex flex-col items-center justify-center py-2 px-4 rounded-xl border border-primary/30 bg-primary/10 text-primary hover:bg-primary/20 hover:-translate-y-0.5 active:translate-y-0 transition-all font-bold text-[11px] uppercase tracking-wider">
                               <Eye className="w-5 h-5 mb-1" />
                               AI Insights
                            </button>
                         </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
             </table>
           </div>
      </div>

      {selectedInstructorId && (
        <InstructorReviewModal 
          instructorId={selectedInstructorId} 
          onClose={() => setSelectedInstructorId(null)} 
        />
      )}
    </div>
  );
}
