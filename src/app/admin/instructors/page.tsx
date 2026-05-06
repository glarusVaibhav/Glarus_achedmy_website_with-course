"use client";

import { Eye, DollarSign, Ban, GraduationCap, Users } from "lucide-react";

export default function InstructorsPage() {
  const mockInstructors = [
    {
      id: "i1", name: "Dr. Sarah Chen", email: "sarah.chen@glarus.edu",
      avatar: "SC", coursesCreated: ["Advanced AI Engineering"], totalStudents: 1842,
      totalRevenue: 485600, rating: 4.9, status: "Active"
    },
    {
      id: "i2", name: "John Doe", email: "john.doe@glarus.edu",
      avatar: "JD", coursesCreated: ["React Masterclass"], totalStudents: 967,
      totalRevenue: 215400, rating: 4.7, status: "Active"
    },
    {
        id: "i3", name: "Bob Smith", email: "b.smith@glarus.edu",
        avatar: "BS", coursesCreated: ["Frontend Basics"], totalStudents: 23,
        totalRevenue: 1000, rating: 3.2, status: "Suspended"
    }
  ];

  return (
    <div className="space-y-8 pb-12 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-text tracking-tight">Instructor Management</h1>
          <p className="text-subtext mt-1 font-medium">Manage instructor profiles, revenue sharing, and access control.</p>
        </div>
        <div className="flex items-center gap-1.5 px-4 py-2 bg-primary/10 text-primary border border-primary/20 rounded-full text-sm font-bold shadow-inner">
          <GraduationCap className="w-4 h-4" />
          {mockInstructors.length} Total Instructors
        </div>
      </div>

      <div className="bg-card rounded-3xl border border-card/40 shadow-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className="border-b border-card/40 bg-background/50">
                <th className="py-5 px-8 text-xs font-black text-subtext uppercase tracking-widest w-[30%]">Instructor Profile</th>
                <th className="py-5 px-6 text-xs font-black text-subtext uppercase tracking-widest w-[20%]">Courses</th>
                <th className="py-5 px-6 text-xs font-black text-subtext uppercase tracking-widest text-center">Students</th>
                <th className="py-5 px-6 text-xs font-black text-subtext uppercase tracking-widest text-right">Revenue Generated</th>
                <th className="py-5 px-6 text-xs font-black text-subtext uppercase tracking-widest text-center">Status</th>
                <th className="py-5 px-6 text-xs font-black text-subtext uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-card/30">
              {mockInstructors.map((inst) => (
                <tr key={inst.id} className="hover:bg-background/40 transition-colors group">
                  <td className="py-5 px-8 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-md ring-2 ring-white/5">
                      {inst.avatar}
                    </div>
                    <div>
                      <h4 className="font-bold text-text text-sm leading-tight">{inst.name}</h4>
                      <span className="text-xs text-subtext mt-0.5">{inst.email}</span>
                    </div>
                  </td>
                  <td className="py-5 px-6">
                    <div className="flex flex-wrap gap-1.5">
                      {inst.coursesCreated.map((c) => (
                         <span key={c} className="px-2.5 py-1 rounded-full text-[10px] font-bold border bg-sky-500/10 text-sky-400 border-sky-500/20">{c}</span>
                      ))}
                    </div>
                  </td>
                  <td className="py-5 px-6 text-center">
                      <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-background rounded-lg border border-card/60">
                        <Users className="w-3.5 h-3.5 text-subtext" />
                        <span className="text-sm font-bold text-text">{inst.totalStudents}</span>
                      </div>
                  </td>
                  <td className="py-5 px-6 text-right">
                    <span className="text-sm font-bold text-emerald-500">₹{inst.totalRevenue.toLocaleString()}</span>
                  </td>
                  <td className="py-5 px-6 text-center">
                    <span className={`px-3 py-1 rounded-full text-[11px] font-bold tracking-wide uppercase ${
                      inst.status === 'Active' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'
                    }`}>
                      {inst.status}
                    </span>
                  </td>
                  <td className="py-5 px-6">
                    <div className="flex items-center justify-end gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                        <button title="View Full Profile" className="p-2.5 rounded-xl bg-background border border-card/60 text-subtext hover:text-primary hover:border-primary/30 hover:bg-primary/5 transition-all">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button title="Adjust Revenue Share %" className="p-2.5 rounded-xl bg-background border border-card/60 text-subtext hover:text-emerald-500 hover:border-emerald-500/30 hover:bg-emerald-500/5 transition-all">
                          <DollarSign className="w-4 h-4" />
                        </button>
                        <button title="Suspend Account" className="p-2.5 rounded-xl bg-background border border-card/60 text-subtext hover:text-red-500 hover:border-red-500/30 hover:bg-red-500/5 transition-all">
                          <Ban className="w-4 h-4" />
                        </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
