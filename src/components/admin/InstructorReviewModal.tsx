"use client";

import { X, Check, FileText, BrainCircuit, ShieldAlert, Award, Star, History, Mail } from "lucide-react";

export default function InstructorReviewModal({ instructorId, onClose }: { instructorId: string, onClose: () => void }) {
  // Mock parsed response from AI backend
  const mockData = {
    name: "David Kim",
    email: "david.k@example.com",
    experienceYears: 5,
    bio: "Senior AI researcher. Previously at DeepMind. Exploring the boundaries of LLM agentic architecture.",
    skills: ["Python", "PyTorch", "Next.js", "Agentic Systems", "Cloud Vectors"],
    certifications: ["AWS Machine Learning Specialty", "Google Professional Cloud Architect"],
    proposedCourses: ["Advanced Python & Agent Architecture", "Intro to Vector Databases"],
    aiInsightScore: 94,
    aiInsightSummary: "Highly credible. Strong background in target technology. Minor flag: no previous teaching certifications found, but technical pedigree eliminates risk."
  };

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-md flex justify-end animate-in fade-in w-full h-full">
       <div className="w-full max-w-2xl bg-card border-l border-card/60 h-full p-8 overflow-y-auto custom-scrollbar shadow-2xl relative animate-in slide-in-from-right-8 duration-300">
          <button onClick={onClose} className="absolute top-6 right-6 p-2 rounded-full bg-background hover:bg-card border border-card/60 text-subtext hover:text-text transition-colors">
            <X className="w-5 h-5" />
          </button>

          <div className="mb-8">
            <h2 className="text-2xl font-black text-text tracking-tight">Instructor Onboarding</h2>
            <p className="text-sm text-subtext mt-1">Review AI-parsed credentials and approve platform access.</p>
          </div>

          <div className="bg-gradient-to-br from-primary/10 to-transparent border border-primary/20 rounded-3xl p-6 mb-8 relative overflow-hidden">
             <div className="flex items-center gap-4 mb-4 relative z-10">
                <div className="w-12 h-12 bg-primary/20 text-primary rounded-2xl flex items-center justify-center border border-primary/30 shadow-inner">
                   <BrainCircuit className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-primary">AI Credibility Insight</h3>
                  <p className="text-xs text-subtext font-semibold uppercase tracking-widest">Resume Parser Engine v2.1</p>
                </div>
             </div>
             <p className="text-sm font-medium text-text leading-relaxed relative z-10 italic">
               "{mockData.aiInsightSummary}"
             </p>
             <div className="mt-5 flex items-center justify-between border-t border-primary/20 pt-4 relative z-10">
                <span className="text-xs font-bold text-subtext uppercase tracking-widest">Confidence Score</span>
                <div className="flex items-center gap-2">
                   <div className="w-32 h-2 bg-background rounded-full overflow-hidden border border-card">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${mockData.aiInsightScore}%` }} />
                   </div>
                   <span className="text-sm font-black text-emerald-500">{mockData.aiInsightScore}%</span>
                </div>
             </div>
             {/* Background decoration */}
             <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
          </div>

          <div className="space-y-6">
             {/* Identity */}
             <section className="bg-background border border-card/40 rounded-2xl p-6 shadow-sm">
                <h4 className="text-sm font-bold text-subtext uppercase tracking-widest mb-4">Identity & Payload</h4>
                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] text-subtext/70 font-bold uppercase tracking-widest">Submitted Name</label>
                    <input type="text" defaultValue={mockData.name} className="w-full mt-1 bg-card border border-card/60 rounded-xl px-4 py-2.5 text-sm font-semibold text-text focus:outline-none focus:border-primary transition-colors" />
                  </div>
                  <div>
                    <label className="text-[10px] text-subtext/70 font-bold uppercase tracking-widest">Contact Email</label>
                    <div className="flex items-center mt-1 bg-card border border-card/60 rounded-xl px-4 py-2.5">
                       <Mail className="w-4 h-4 text-subtext mr-3 shrink-0" />
                       <span className="text-sm font-semibold text-text">{mockData.email}</span>
                    </div>
                  </div>
                  <div>
                     <label className="text-[10px] text-subtext/70 font-bold uppercase tracking-widest">Parsed Bio</label>
                     <textarea defaultValue={mockData.bio} className="w-full mt-1 bg-card border border-card/60 rounded-xl px-4 py-3 text-sm text-text focus:outline-none focus:border-primary transition-colors min-h-[100px] resize-none" />
                  </div>
                </div>
             </section>

             {/* Experience & Skills */}
             <section className="grid grid-cols-2 gap-4">
               <div className="bg-background border border-card/40 rounded-2xl p-5 shadow-sm">
                  <div className="flex items-center gap-2 mb-3">
                     <History className="w-4 h-4 text-primary" />
                     <h4 className="text-xs font-bold text-text uppercase tracking-widest">Experience</h4>
                  </div>
                  <p className="text-3xl font-black text-text">{mockData.experienceYears} <span className="text-sm font-bold text-subtext">Years</span></p>
               </div>
               <div className="bg-background border border-card/40 rounded-2xl p-5 shadow-sm">
                  <div className="flex items-center gap-2 mb-3">
                     <FileText className="w-4 h-4 text-primary" />
                     <h4 className="text-xs font-bold text-text uppercase tracking-widest">Orig. Resume</h4>
                  </div>
                  <button className="px-3 py-1.5 bg-primary/10 text-primary hover:bg-primary/20 text-xs font-bold rounded-lg transition-colors border border-primary/20">
                    View PDF
                  </button>
               </div>
             </section>

             {/* Tag arrays */}
             <section className="bg-background border border-card/40 rounded-2xl p-6 shadow-sm space-y-5">
                <div>
                   <h4 className="text-xs font-bold text-subtext uppercase tracking-widest mb-3 flex items-center gap-2"><Star className="w-3.5 h-3.5" /> Technical Skills</h4>
                   <div className="flex flex-wrap gap-2">
                     {mockData.skills.map(s => (
                        <span key={s} className="px-3 py-1 bg-card border border-card/60 rounded-lg text-xs font-semibold text-text">{s}</span>
                     ))}
                   </div>
                </div>
                <div className="pt-4 border-t border-card/40">
                   <h4 className="text-xs font-bold text-subtext uppercase tracking-widest mb-3 flex items-center gap-2"><Award className="w-3.5 h-3.5" /> Certifications</h4>
                   <ul className="space-y-2">
                     {mockData.certifications.map(c => (
                        <li key={c} className="text-sm font-medium text-text bg-card px-3 py-2 border border-card/60 rounded-lg">{c}</li>
                     ))}
                   </ul>
                </div>
             </section>
          </div>

          <div className="sticky bottom-0 mt-8 pt-6 pb-2 bg-gradient-to-t from-card via-card to-transparent border-t border-card/40 flex items-center gap-3">
             <button onClick={onClose} className="flex-1 py-3.5 rounded-xl bg-background border border-card/60 text-sm font-bold text-subtext hover:text-text transition-colors">
                Cancel
             </button>
             <button className="flex-1 py-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm font-bold hover:bg-red-500 hover:text-white transition-colors flex items-center justify-center gap-2">
                <X className="w-4 h-4" /> Reject
             </button>
             <button className="flex-[2] py-3.5 rounded-xl bg-emerald-500 text-white text-sm font-bold hover:bg-emerald-600 shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2">
                <Check className="w-4 h-4" /> Approve & Invite
             </button>
          </div>
       </div>
    </div>
  )
}
