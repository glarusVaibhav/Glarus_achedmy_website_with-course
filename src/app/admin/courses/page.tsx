"use client";

import { useState } from "react";
import { Activity, PlayCircle, BarChart3, Clock, CheckCircle, Eye, BookOpen } from "lucide-react";
import CourseReviewModal from "@/components/admin/CourseReviewModal";

type Tab = "active" | "approvals";

export default function CoursesPage() {
  const [activeTab, setActiveTab] = useState<Tab>("active");
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);

  const mockCourses = [
    { id: "c1", title: "Advanced AI Agents", instructor: "Dr. Sarah Chen", price: 1499, enrolled: 1842, revenue: 485600, refundRate: 1.2, status: "Approved" },
    { id: "c2", title: "React Masterclass", instructor: "John Doe", price: 999, enrolled: 967, revenue: 215400, refundRate: 2.1, status: "Approved" }
  ];

  const pendingCourses = [
    { id: "p1", title: "Mastering Next.js 14", instructor: "Jordan Walke", category: "Web Dev", submittedAt: "1 day ago", status: "Pending" },
    { id: "p2", title: "Quantum Computing Basics", instructor: "Alice Smith", category: "Computer Science", submittedAt: "3 days ago", status: "Rejected" },
  ];

  return (
    <div className="space-y-8 pb-12 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-text tracking-tight flex items-center gap-3">
             <BookOpen className="w-8 h-8 text-primary" />
             Course Management
          </h1>
          <p className="text-subtext mt-1 font-medium">Deep visibility into course performance and validation pipeline.</p>
        </div>
        
        {/* Dual Tab Controller */}
        <div className="flex bg-card p-1.5 rounded-2xl border border-card shadow-inner w-full md:w-auto shrink-0">
          <button 
            onClick={() => setActiveTab("active")}
            className={`flex-1 md:w-48 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'active' ? 'bg-background text-text shadow-sm border border-card' : 'text-subtext hover:text-text hover:bg-background/40'}`}
          >
            Live Analytics
          </button>
          <button 
            onClick={() => setActiveTab("approvals")}
            className={`flex-1 md:w-48 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${activeTab === 'approvals' ? 'bg-background text-text shadow-sm border border-card' : 'text-subtext hover:text-text hover:bg-background/40'}`}
          >
            Approvals
            <span className={`px-2 py-0.5 rounded-full text-[10px] bg-background/50 border border-card shadow-inner ${activeTab === 'approvals' ? 'text-amber-500' : ''}`}>
              {pendingCourses.filter(c => c.status === 'Pending').length}
            </span>
          </button>
        </div>
      </div>

      <div className="bg-card rounded-3xl border border-card/40 shadow-2xl overflow-hidden">
        {activeTab === "active" && (
           <div className="overflow-x-auto animate-in fade-in slide-in-from-bottom-2">
             <table className="w-full text-left border-collapse min-w-[1000px]">
                <thead>
                  <tr className="border-b border-card/40 bg-background/50">
                    <th className="py-5 px-8 text-xs font-black text-subtext uppercase tracking-widest">Course Title & Instructor</th>
                    <th className="py-5 px-6 text-xs font-black text-subtext uppercase tracking-widest text-center">Price</th>
                    <th className="py-5 px-6 text-xs font-black text-subtext uppercase tracking-widest text-center">Enrolled</th>
                    <th className="py-5 px-6 text-xs font-black text-subtext uppercase tracking-widest text-right">Revenue</th>
                    <th className="py-5 px-6 text-xs font-black text-subtext uppercase tracking-widest text-center">Refund Rate</th>
                    <th className="py-5 px-6 text-xs font-black text-subtext uppercase tracking-widest text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-card/30">
                  {mockCourses.map((c) => (
                    <tr key={c.id} className="hover:bg-background/40 transition-colors group">
                      <td className="py-5 px-8 flex items-center justify-between">
                        <div>
                          <h4 className="font-bold text-text text-sm leading-tight">{c.title}</h4>
                          <span className="text-xs text-subtext mt-0.5">{c.instructor}</span>
                        </div>
                      </td>
                      <td className="py-5 px-6 text-center">
                        <span className="font-bold text-subtext">₹{c.price}</span>
                      </td>
                      <td className="py-5 px-6 text-center">
                        <span className="font-bold text-text">{c.enrolled}</span>
                      </td>
                      <td className="py-5 px-6 text-right">
                        <span className="text-sm font-bold text-emerald-500">₹{c.revenue.toLocaleString()}</span>
                      </td>
                      <td className="py-5 px-6 text-center">
                        <span className={`inline-block px-2.5 py-1 rounded border text-xs font-bold ${
                          c.refundRate > 3 ? 'bg-red-500/10 text-red-500 border-red-500/30' : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30'
                        }`}>
                          {c.refundRate}%
                        </span>
                      </td>
                      <td className="py-5 px-6">
                        <div className="flex items-center justify-end gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                            <button title="Sales Analytics Funnel" className="p-2.5 rounded-xl bg-background border border-card/60 text-subtext hover:text-sky-500 hover:border-sky-500/30 hover:bg-sky-500/5 transition-all">
                              <BarChart3 className="w-4 h-4" />
                            </button>
                            <button title="Active" disabled className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 opacity-50 cursor-not-allowed">
                                <CheckCircle className="w-4 h-4" />
                            </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
             </table>
           </div>
        )}

        {activeTab === "approvals" && (
           <div className="overflow-x-auto animate-in fade-in slide-in-from-bottom-2">
             <table className="w-full text-left border-collapse min-w-[1000px]">
                <thead>
                  <tr className="border-b border-card/40 bg-background/50">
                    <th className="py-5 px-8 text-xs font-black text-subtext uppercase tracking-widest">Course & Category</th>
                    <th className="py-5 px-6 text-xs font-black text-subtext uppercase tracking-widest">Instructor</th>
                    <th className="py-5 px-6 text-xs font-black text-subtext uppercase tracking-widest text-center">Status</th>
                    <th className="py-5 px-6 text-xs font-black text-subtext uppercase tracking-widest text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-card/30">
                  {pendingCourses.map(course => (
                    <tr key={course.id} className="hover:bg-background/40 transition-colors">
                      <td className="py-5 px-8">
                         <p className="font-bold text-text text-sm">{course.title}</p>
                         <p className="text-xs text-primary/70 mt-0.5 font-bold uppercase tracking-wider">{course.category}</p>
                         <p className="text-[10px] text-subtext/50 font-bold mt-1">Submitted: {course.submittedAt}</p>
                      </td>
                      <td className="py-5 px-6">
                         <p className="text-sm font-bold text-text">{course.instructor}</p>
                      </td>
                      <td className="py-5 px-6 text-center">
                         <span className={`px-2.5 py-1 rounded text-xs font-bold border uppercase tracking-wider ${
                           course.status === 'Pending' ? 'bg-amber-500/10 text-amber-500 border-amber-500/30' : 
                           course.status === 'Rejected' ? 'bg-red-500/10 text-red-500 border-red-500/30' :
                           'bg-emerald-500/10 text-emerald-500 border-emerald-500/30'
                         }`}>{course.status}</span>
                      </td>
                      <td className="py-5 px-6">
                         <div className="flex items-center justify-end gap-2">
                            <button onClick={() => setSelectedCourseId(course.id)} title="Deep Curriculum Preview" className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-primary/30 bg-primary/10 text-primary hover:bg-primary/20 hover:-translate-y-0.5 active:translate-y-0 transition-all font-bold text-[11px] uppercase tracking-wider shadow-sm">
                               <Eye className="w-4 h-4" /> Inspect Content
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

      {selectedCourseId && (
        <CourseReviewModal 
          courseId={selectedCourseId} 
          onClose={() => setSelectedCourseId(null)} 
        />
      )}
    </div>
  );
}
