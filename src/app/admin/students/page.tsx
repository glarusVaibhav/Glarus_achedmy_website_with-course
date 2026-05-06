"use client";

import { Users, RotateCcw, Activity, Pencil } from "lucide-react";

export default function StudentsPage() {
  const mockStudents = [
    { id: "s1", name: "Aarav Patel", email: "aarav.patel@gmail.com", avatar: "AP", enrolled: ["Python Bootcamp", "ML Engineering"], progress: 72, spent: 12400 },
    { id: "s2", name: "Priya Nair", email: "priya.nair@outlook.com", avatar: "PN", enrolled: ["React Masterclass", "UI/UX Design Pro"], progress: 45, spent: 18750 },
    { id: "s3", name: "Lucas Martin", email: "lucas.m@yahoo.com", avatar: "LM", enrolled: ["Advanced AI Engineering"], progress: 91, spent: 8990 },
    { id: "s4", name: "Meera Gupta", email: "meera.g@proton.me", avatar: "MG", enrolled: ["Cloud Computing"], progress: 33, spent: 14200 },
  ];

  return (
    <div className="space-y-8 pb-12 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-text tracking-tight">Student Management</h1>
          <p className="text-subtext mt-1 font-medium">Monitor engagement tracking, purchase history, and access rights.</p>
        </div>
        <div className="flex items-center gap-1.5 px-4 py-2 bg-sky-500/10 text-sky-500 border border-sky-500/20 rounded-full text-sm font-bold shadow-inner">
          <Users className="w-4 h-4" />
          {mockStudents.length} Active Students
        </div>
      </div>

      <div className="bg-card rounded-3xl border border-card/40 shadow-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className="border-b border-card/40 bg-background/50">
                <th className="py-5 px-8 text-xs font-black text-subtext uppercase tracking-widest w-[30%]">Student Profile</th>
                <th className="py-5 px-6 text-xs font-black text-subtext uppercase tracking-widest w-[25%]">Enrolled Courses</th>
                <th className="py-5 px-6 text-xs font-black text-subtext uppercase tracking-widest text-center">Avg Progress</th>
                <th className="py-5 px-6 text-xs font-black text-subtext uppercase tracking-widest text-right">Total Spent</th>
                <th className="py-5 px-6 text-xs font-black text-subtext uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-card/30">
              {mockStudents.map((stu) => (
                <tr key={stu.id} className="hover:bg-background/40 transition-colors group">
                  <td className="py-5 px-8 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-sky-500 to-indigo-600 flex items-center justify-center text-white font-bold shadow-md ring-2 ring-white/5">
                      {stu.avatar}
                    </div>
                    <div>
                      <h4 className="font-bold text-text text-sm leading-tight">{stu.name}</h4>
                      <span className="text-xs text-subtext mt-0.5">{stu.email}</span>
                    </div>
                  </td>
                  <td className="py-5 px-6">
                    <div className="flex flex-wrap gap-1.5">
                      {stu.enrolled.map((c) => (
                         <span key={c} className="px-2.5 py-1 rounded-full text-[10px] font-bold border bg-violet-500/10 text-violet-400 border-violet-500/20">{c}</span>
                      ))}
                    </div>
                  </td>
                  <td className="py-5 px-6 text-center">
                    <div className="flex items-center justify-center gap-2">
                       <div className="w-16 h-1.5 bg-background rounded-full overflow-hidden border border-card">
                          <div className={`h-full ${stu.progress > 70 ? 'bg-emerald-500' : stu.progress > 40 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${stu.progress}%` }} />
                       </div>
                       <span className="text-sm font-bold tabular-nums text-text">{stu.progress}%</span>
                    </div>
                  </td>
                  <td className="py-5 px-6 text-right">
                    <span className="text-sm font-bold text-text">₹{stu.spent.toLocaleString()}</span>
                  </td>
                  <td className="py-5 px-6">
                    <div className="flex items-center justify-end gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                        <button title="Course Analytics" className="p-2.5 rounded-xl bg-background border border-card/60 text-subtext hover:text-sky-500 hover:border-sky-500/30 hover:bg-sky-500/5 transition-all">
                          <Activity className="w-4 h-4" />
                        </button>
                        <button title="Force Refund" className="p-2.5 rounded-xl bg-background border border-card/60 text-subtext hover:text-red-500 hover:border-red-500/30 hover:bg-red-500/5 transition-all">
                          <RotateCcw className="w-4 h-4" />
                        </button>
                        <button title="Edit User" className="p-2.5 rounded-xl bg-background border border-card/60 text-subtext hover:text-primary hover:border-primary/30 hover:bg-primary/5 transition-all">
                          <Pencil className="w-4 h-4" />
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
