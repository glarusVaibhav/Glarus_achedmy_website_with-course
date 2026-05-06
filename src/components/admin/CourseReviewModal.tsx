"use client";

import { X, Check, Play, Edit3, BookOpen, Clock, AlertTriangle, Video, FileText } from "lucide-react";

export default function CourseReviewModal({ courseId, onClose }: { courseId: string, onClose: () => void }) {
  const mockCourse = {
    title: "Mastering Next.js 14",
    instructor: "Jordan Walke",
    price: 3499,
    category: "Web Development",
    duration: "14h 20m",
    level: "Intermediate",
    thumbnail: "bg-gradient-to-br from-neutral-800 to-neutral-900",
    description: "Learn Next.js App Router, Server Actions, and advanced streaming architectures in this complete bootcamp.",
    outcomes: ["Build full-stack React applications", "Master SSR and SSG", "Implement secure authentication pipelines"],
    curriculum: [
      { id: "cm1", title: "Section 1: Foundations", type: "section", items: [
        { title: "Introduction to App Router", type: "video", duration: "12m 40s" },
        { title: "Server vs Client Components", type: "video", duration: "18m 10s" },
        { title: "Project Assets", type: "pdf", size: "2.4 MB" }
      ]},
      { id: "cm2", title: "Section 2: Data Fetching", type: "section", items: [
        { title: "Server Actions Basics", type: "video", duration: "24m 00s" },
        { title: "Streaming & Suspense", type: "video", duration: "31m 15s" }
      ]}
    ]
  };

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-md flex justify-end animate-in fade-in w-full h-full">
       <div className="w-full max-w-3xl bg-card border-l border-card/60 h-full flex flex-col shadow-2xl relative animate-in slide-in-from-right-8 duration-300">
          <div className="p-6 border-b border-card/60 flex items-center justify-between bg-background/50 sticky top-0 z-20">
             <div>
                <h2 className="text-xl font-black text-text">Course Validation Center</h2>
                <div className="flex items-center gap-2 mt-1">
                   <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest bg-amber-500/10 text-amber-500 border border-amber-500/30">Pending Approval</span>
                   <span className="text-xs text-subtext font-semibold">Author: {mockCourse.instructor}</span>
                </div>
             </div>
             <button onClick={onClose} className="p-2.5 rounded-full bg-background hover:bg-card border border-card/60 text-subtext hover:text-text transition-colors">
               <X className="w-5 h-5" />
             </button>
          </div>

          <div className="flex-1 overflow-y-auto p-8 custom-scrollbar space-y-8">
             {/* Thumbnail & Basics */}
             <div className="flex flex-col md:flex-row gap-6">
                <div className={`w-full md:w-64 h-40 rounded-2xl ${mockCourse.thumbnail} flex items-center justify-center border border-card/60 shadow-inner relative group cursor-pointer overflow-hidden`}>
                   <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-all" />
                   <Play className="w-12 h-12 text-white/80 group-hover:text-white group-hover:scale-110 transition-all z-10" />
                   <div className="absolute bottom-3 left-3 z-10 text-[10px] font-bold text-white bg-black/60 px-2 py-1 rounded backdrop-blur-md">Preview Video</div>
                </div>
                <div className="flex-1 space-y-4">
                   <div className="flex justify-between items-start">
                     <div className="space-y-1 w-full">
                       <label className="text-[10px] font-bold text-subtext/70 uppercase tracking-widest">Course Title (Editable)</label>
                       <input type="text" defaultValue={mockCourse.title} className="w-full text-xl font-bold bg-background border border-card/60 rounded-lg px-3 py-2 text-text focus:outline-none focus:border-primary transition-all" />
                     </div>
                   </div>
                   <div className="flex gap-4">
                     <div className="space-y-1">
                       <label className="text-[10px] font-bold text-subtext/70 uppercase tracking-widest">Price (₹)</label>
                       <input type="number" defaultValue={mockCourse.price} className="w-24 text-sm font-bold bg-background border border-card/60 rounded-lg px-3 py-2 text-text focus:outline-none focus:border-primary transition-all" />
                     </div>
                     <div className="space-y-1 flex-1">
                       <label className="text-[10px] font-bold text-subtext/70 uppercase tracking-widest">Category</label>
                       <input type="text" defaultValue={mockCourse.category} className="w-full text-sm font-bold bg-background border border-card/60 rounded-lg px-3 py-2 text-text focus:outline-none focus:border-primary transition-all" />
                     </div>
                   </div>
                </div>
             </div>

             {/* AI Review Flagger */}
             <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-5 flex gap-4 items-start">
                <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <div>
                   <h4 className="text-sm font-bold text-amber-500 mb-1">AI Quality Flag</h4>
                   <p className="text-xs text-subtext leading-relaxed">The AI analyzer detected that <span className="font-bold text-text">Section 2</span> contains videos with low audio volume mapping. You may want to review this content before publishing or send it back for edits.</p>
                </div>
             </div>

             {/* Descriptions */}
             <div className="space-y-4">
                 <div>
                    <label className="text-[10px] font-bold text-subtext/70 uppercase tracking-widest block mb-2">Detailed Description</label>
                    <textarea defaultValue={mockCourse.description} className="w-full text-sm bg-background border border-card/60 rounded-xl p-4 text-text focus:outline-none focus:border-primary transition-all min-h-[100px] resize-none leading-relaxed" />
                 </div>
                 <div className="bg-background border border-card/60 rounded-2xl p-5">
                    <label className="text-[10px] font-bold text-subtext/70 uppercase tracking-widest block mb-4 flex items-center gap-2"><Check className="w-3.5 h-3.5" /> Learning Outcomes</label>
                    <ul className="space-y-3">
                      {mockCourse.outcomes.map((o, i) => (
                         <li key={i} className="flex gap-3 items-center">
                            <span className="w-5 h-5 rounded-full bg-card flex items-center justify-center text-[10px] font-bold text-subtext">{i+1}</span>
                            <input type="text" defaultValue={o} className="flex-1 text-sm bg-transparent border-b border-card/60 focus:border-primary focus:outline-none pb-1 transition-all" />
                         </li>
                      ))}
                    </ul>
                 </div>
             </div>

             {/* Curriculum Viewer */}
             <div>
                <div className="flex items-center justify-between mb-4">
                  <label className="text-xs font-bold text-subtext uppercase tracking-widest flex items-center gap-2"><BookOpen className="w-4 h-4" /> Curriculum Structure</label>
                  <div className="flex gap-4 text-[10px] font-bold text-subtext uppercase tracking-widest">
                     <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {mockCourse.duration}</span>
                     <span>{mockCourse.level}</span>
                  </div>
                </div>

                <div className="space-y-4">
                  {mockCourse.curriculum.map(section => (
                     <div key={section.id} className="bg-background border border-card/60 rounded-2xl overflow-hidden">
                        <div className="bg-card/40 px-5 py-3 border-b border-card/60 font-bold text-sm text-text flex justify-between items-center">
                           {section.title}
                           <button className="text-subtext hover:text-primary transition-colors"><Edit3 className="w-3.5 h-3.5" /></button>
                        </div>
                        <div className="divide-y divide-card/40">
                           {section.items.map((item, i) => (
                              <div key={i} className="px-5 py-3 flex items-center justify-between hover:bg-card/20 transition-colors">
                                 <div className="flex items-center gap-3">
                                    {item.type === 'video' ? <Video className="w-4 h-4 text-primary" /> : <FileText className="w-4 h-4 text-rose-500" />}
                                    <span className="text-sm font-medium text-text">{item.title}</span>
                                 </div>
                                 <div className="flex items-center gap-4">
                                     <span className="text-xs font-bold text-subtext bg-card px-2 py-1 rounded">{item.duration || item.size}</span>
                                 </div>
                              </div>
                           ))}
                        </div>
                     </div>
                  ))}
                </div>
             </div>
          </div>

          {/* Action Bar */}
          <div className="p-6 bg-card border-t border-card/60 flex items-center gap-3 mt-auto">
             <button onClick={onClose} className="flex-1 py-3.5 rounded-xl bg-background border border-card/60 text-sm font-bold text-subtext hover:text-text transition-colors">
                Close Without Saving
             </button>
             <button className="flex-1 py-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm font-bold hover:bg-red-500 hover:text-white transition-colors flex items-center justify-center gap-2">
                <X className="w-4 h-4" /> Reject & Send Feedback
             </button>
             <button className="flex-[2] py-3.5 rounded-xl bg-emerald-500 text-white text-sm font-bold hover:bg-emerald-600 shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2">
                <Check className="w-4 h-4" /> Approve & Publish
             </button>
          </div>
       </div>
    </div>
  )
}
