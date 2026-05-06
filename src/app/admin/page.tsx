"use client";

import { Users, BookOpen, Activity, ArrowUpRight, IndianRupee } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, LineChart, Line } from "recharts";
import AIInsightsPanel from "@/components/admin/AIInsightsPanel";

const revenueData = [
  { name: "Mon", rev: 4200 },
  { name: "Tue", rev: 3800 },
  { name: "Wed", rev: 6100 },
  { name: "Thu", rev: 8780 },
  { name: "Fri", rev: 7200 },
  { name: "Sat", rev: 9390 },
  { name: "Sun", rev: 11500 },
];

const studentGrowthData = [
  { name: "Week 1", students: 120 },
  { name: "Week 2", students: 250 },
  { name: "Week 3", students: 480 },
  { name: "Week 4", students: 850 },
];

const topCourses = [
  { id: 1, title: "Advanced AI Agents", instructor: "Dr. Sarah Chen", revenue: 485600, students: 1842 },
  { id: 2, title: "Python for Data Science", instructor: "Jessica Lin", revenue: 891500, students: 3120 },
  { id: 3, title: "UI/UX Design Pro", instructor: "Emily Carter", revenue: 612800, students: 2310 }
];

export default function AdminOverview() {
  return (
    <div className="space-y-8 pb-12">
      <div>
        <h1 className="text-3xl font-black text-text tracking-tight animate-in fade-in slide-in-from-bottom-2">Dashboard Overview</h1>
        <p className="text-subtext mt-1 font-medium animate-in fade-in slide-in-from-bottom-3">Real-time metrics and AI diagnostics for your EdTech platform.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-in fade-in slide-in-from-bottom-4">
        <KPICard title="Total Revenue" value="₹24.8M" trend="+14.2%" icon={<IndianRupee />} isCurrency />
        <KPICard title="Total Users" value="12,482" trend="+8.1%" icon={<Users />} />
        <KPICard title="Active Courses" value="342" trend="+12.5%" icon={<BookOpen />} />
        <KPICard title="System Health" value="99.9%" trend="+0.1%" icon={<Activity />} isHealth />
      </div>

      {/* Charts & AI Insights Array */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-5">
        <div className="col-span-2 space-y-6">
          {/* Revenue Chart */}
          <div className="bg-card rounded-3xl p-6 border border-card shadow-xl">
            <h3 className="font-bold text-lg mb-6">Revenue Trajectory (7 Days)</h3>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueData}>
                  <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" vertical={false} />
                  <XAxis dataKey="name" stroke="#666" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#666" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `₹${value}`} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: '12px' }}
                    itemStyle={{ color: '#10b981', fontWeight: 'bold' }}
                  />
                  <Area type="monotone" dataKey="rev" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          {/* Bottom row: Student Growth + Top Courses */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-card rounded-3xl p-6 border border-card shadow-xl">
               <h3 className="font-bold text-lg mb-6">Student Enrollment Growth</h3>
               <div className="h-[220px]">
                 <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={studentGrowthData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" vertical={false} />
                      <XAxis dataKey="name" stroke="#666" fontSize={12} tickLine={false} axisLine={false} />
                      <Tooltip 
                        cursor={{ fill: 'transparent' }}
                        contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: '12px' }}
                        itemStyle={{ color: '#3b82f6', fontWeight: 'bold' }}
                      />
                      <Bar dataKey="students" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                 </ResponsiveContainer>
               </div>
            </div>
            
            <div className="bg-card rounded-3xl border border-card shadow-xl overflow-hidden flex flex-col">
              <div className="p-6 pb-2 border-b border-card/40">
                <h3 className="font-bold text-lg">Top Courses by Revenue</h3>
              </div>
              <div className="flex-1 overflow-y-auto">
                {topCourses.map((course) => (
                  <div key={course.id} className="p-4 px-6 border-b border-card/40 flex items-center justify-between hover:bg-background/40 transition-colors">
                    <div>
                      <p className="font-semibold text-sm line-clamp-1">{course.title}</p>
                      <p className="text-xs text-subtext mt-0.5">{course.instructor}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-emerald-500 font-bold text-sm">₹{(course.revenue/1000).toFixed(1)}k</p>
                      <p className="text-xs text-subtext">{course.students} std</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* AI Insights Sidebar Panel */}
        <div className="col-span-1 rounded-3xl h-full min-h-[500px]">
          <AIInsightsPanel />
        </div>
      </div>
    </div>
  );
}

function KPICard({ title, value, trend, icon, isCurrency, isHealth }: { title: string, value: string, trend: string, icon: React.ReactNode, isCurrency?: boolean, isHealth?: boolean }) {
  return (
    <div className="bg-card rounded-3xl p-6 border border-card shadow-xl hover:shadow-2xl transition-all group overflow-hidden relative">
      <div className="absolute -top-12 -right-12 w-24 h-24 bg-primary/10 rounded-full blur-2xl group-hover:bg-primary/20 transition-all pointer-events-none" />
      <div className="flex items-center justify-between mb-4 relative z-10">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border shadow-inner ${
          isHealth ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 
          isCurrency ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : 
          'bg-primary/10 text-primary border-primary/20'
        }`}>
          {icon}
        </div>
        <div className="flex items-center gap-1 text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-lg text-xs font-bold border border-emerald-500/20">
          <ArrowUpRight className="w-3.5 h-3.5" />
          {trend}
        </div>
      </div>
      <p className="text-subtext font-medium text-sm mb-1 relative z-10">{title}</p>
      <h2 className="text-2xl font-black text-text relative z-10">{value}</h2>
    </div>
  );
}
