"use client";

import { RotateCcw, Check, X, Search, Filter } from "lucide-react";

export default function RefundsPage() {
  const mockRefunds = [
    { id: "r1", student: "Aarav Patel", email: "aarav.p@gmail.com", course: "Python Bootcamp", amount: 12400, status: "Pending", reason: "Found a better course", date: "2026-04-06" },
    { id: "r2", student: "Priya Nair", email: "priya.n@outlook.com", course: "React Masterclass", amount: 999, status: "Pending", reason: "Accidental purchase", date: "2026-04-07" },
    { id: "r3", student: "Lucas Martin", email: "lucas.m@yahoo.com", course: "Cloud Computing", amount: 4500, status: "Approved", reason: "Course too difficult", date: "2026-04-01" },
    { id: "r4", student: "Meera Gupta", email: "meera.g@proton.me", course: "Advanced AI", amount: 8990, status: "Rejected", reason: "Completed 90% of the course", date: "2026-03-28" },
  ];

  return (
    <div className="space-y-8 pb-12 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-text tracking-tight flex items-center gap-3">
             <RotateCcw className="w-8 h-8 text-primary" />
             Refund Management
          </h1>
          <p className="text-subtext mt-1 font-medium">Review and process student refund requests securely.</p>
        </div>
        
        <div className="flex items-center gap-3">
           <div className="relative">
              <Search className="w-4 h-4 text-subtext absolute left-3 top-1/2 -translate-y-1/2" />
              <input type="text" placeholder="Search refunds..." className="bg-background border border-card pl-9 pr-4 py-2 rounded-xl text-sm w-64 focus:outline-none focus:border-primary transition-colors" />
           </div>
           <button className="flex items-center gap-2 bg-card border border-card/40 px-4 py-2 rounded-xl text-sm font-bold text-subtext hover:text-text transition-colors shadow-sm">
             <Filter className="w-4 h-4" />
             Filter
           </button>
        </div>
      </div>

      <div className="bg-card rounded-3xl border border-card/40 shadow-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1100px]">
            <thead>
              <tr className="border-b border-card/40 bg-background/50">
                <th className="py-5 px-8 text-xs font-black text-subtext uppercase tracking-widest w-[20%]">Student</th>
                <th className="py-5 px-6 text-xs font-black text-subtext uppercase tracking-widest w-[20%]">Course & Amount</th>
                <th className="py-5 px-6 text-xs font-black text-subtext uppercase tracking-widest w-[30%]">Reason</th>
                <th className="py-5 px-6 text-xs font-black text-subtext uppercase tracking-widest text-center">Status</th>
                <th className="py-5 px-6 text-xs font-black text-subtext uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-card/30">
              {mockRefunds.map((refund) => (
                <tr key={refund.id} className="hover:bg-background/40 transition-colors group">
                  <td className="py-5 px-8">
                     <p className="font-bold text-text text-sm line-clamp-1">{refund.student}</p>
                     <p className="text-xs text-subtext mt-0.5">{refund.email}</p>
                  </td>
                  <td className="py-5 px-6">
                     <p className="font-bold text-text text-sm line-clamp-1">{refund.course}</p>
                     <p className="text-xs text-emerald-500 font-bold mt-0.5">₹{refund.amount.toLocaleString()}</p>
                  </td>
                  <td className="py-5 px-6">
                     <p className="text-sm text-subtext leading-relaxed line-clamp-2 italic">"{refund.reason}"</p>
                     <p className="text-[10px] text-subtext/50 font-semibold mt-1">Requested: {refund.date}</p>
                  </td>
                  <td className="py-5 px-6 text-center">
                    <span className={`inline-block px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider border ${
                       refund.status === "Pending" ? "bg-amber-500/10 text-amber-500 border-amber-500/30" :
                       refund.status === "Approved" ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/30" :
                       "bg-red-500/10 text-red-500 border-red-500/30"
                    }`}>
                      {refund.status}
                    </span>
                  </td>
                  <td className="py-5 px-6">
                     {refund.status === "Pending" ? (
                        <div className="flex items-center justify-end gap-2">
                           <button title="Approve Refund" className="flex items-center gap-1.5 px-3 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 border border-emerald-500/20 rounded-lg text-xs font-bold transition-all">
                              <Check className="w-3.5 h-3.5" /> Approve
                           </button>
                           <button title="Reject Refund" className="flex items-center gap-1.5 px-3 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 rounded-lg text-xs font-bold transition-all">
                              <X className="w-3.5 h-3.5" /> Reject
                           </button>
                        </div>
                     ) : (
                        <div className="flex justify-end pr-4 text-xs font-bold text-subtext/50">
                           Processed
                        </div>
                     )}
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
