"use client";

import { useState } from "react";
import { 
  Tv, Layers, ClipboardList, LineChart, Sparkles, Plus, 
  Video, Code, HelpCircle, GripVertical, ChevronDown, ChevronRight,
  AlertTriangle, UserX, Loader2, ArrowRight, BookOpen, Settings, PieChart, Activity, Bell, TrendingDown
} from "lucide-react";

interface Lesson {
  id: string;
  title: string;
  type: "video" | "quiz" | "sandbox" | "text" | "empty";
}

interface ModuleData {
  id: string;
  title: string;
  isExpanded: boolean;
  lessons: Lesson[];
}

const initialModules: ModuleData[] = [
  {
    id: "m1",
    title: "Module 1: Introduction to AI Agents",
    isExpanded: true,
    lessons: [
      { id: "l1", title: "What are Autonomous Agents?", type: "video" },
      { id: "l2", title: "Setup your Python Environment", type: "sandbox" }
    ]
  },
  {
    id: "m2",
    title: "Module 2: Building your First Agent",
    isExpanded: false,
    lessons: [
      { id: "l3", title: "LLM Orchestration basics", type: "video" },
      { id: "l4", title: "Knowledge Quiz 1", type: "quiz" }
    ]
  }
];

export default function InstructorStudio() {
  const [activeMenu, setActiveMenu] = useState("Course Builder");
  const [modules, setModules] = useState<ModuleData[]>(initialModules);
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationTopic, setGenerationTopic] = useState("");
  const [showPromptInput, setShowPromptInput] = useState(false);

  const toggleModule = (id: string) => {
    setModules(prev => 
      prev.map(m => m.id === id ? { ...m, isExpanded: !m.isExpanded } : m)
    );
  };

  const handleGenerateSyllabus = async () => {
    if (!generationTopic.trim()) return;
    setIsGenerating(true);
    try {
      const res = await fetch("/api/ai/syllabus", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: generationTopic })
      });
      
      if (res.ok) {
        const data = await res.json();
        if (data && data.modules) {
          const generatedModules: ModuleData[] = data.modules.map((m: any, i: number) => ({
            id: `gen-m${i}`,
            title: m.title || `Module ${i + 1}`,
            isExpanded: true,
            lessons: (m.lessons || []).map((l: string, j: number) => ({
              id: `gen-l${i}-${j}`,
              title: l,
              type: "empty"
            }))
          }));
          setModules(generatedModules);
          setShowPromptInput(false);
          setGenerationTopic("");
        }
      } else {
        alert("Failed to generate syllabus. Please check your Groq API configuration.");
      }
    } catch (e) {
      console.error(e);
      alert("Error occurred generating AI syllabus.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="w-full min-h-screen flex bg-background text-text overflow-hidden font-sans">
      
      {/* ───── LEFT SIDEBAR ───── */}
      <aside className="w-64 border-r border-card bg-card/10 h-screen sticky top-0 flex flex-col pt-8 pb-4 shrink-0 transition-all">
        <div className="px-6 mb-10">
          <h2 className="text-2xl font-black flex items-center gap-2">
            <span className="text-primary tracking-tighter">Instructor</span> Studio
          </h2>
        </div>
        <nav className="flex-1 space-y-2 px-4">
          {[
            { id: 'Live Classes', icon: Tv },
            { id: 'Course Builder', icon: Layers },
            { id: 'Assessments', icon: ClipboardList },
            { id: 'Analytics', icon: LineChart },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveMenu(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-bold text-sm
                ${activeMenu === item.id 
                  ? "bg-primary text-white shadow-lg shadow-primary/25" 
                  : "text-subtext hover:bg-card hover:text-text border border-transparent"
                }`}
            >
              <item.icon className={`w-5 h-5 ${activeMenu === item.id ? "text-white" : "opacity-70"}`} />
              {item.id}
            </button>
          ))}
        </nav>
        <div className="px-4 mt-auto">
          <button className="w-full flex items-center gap-3 px-4 py-3 text-subtext hover:bg-card rounded-xl font-bold text-sm transition-all">
            <Settings className="w-5 h-5 opacity-70" /> Settings
          </button>
        </div>
      </aside>

      {/* ───── MAIN CONTENT ───── */}
      <main className="flex-1 h-screen overflow-y-auto relative no-scrollbar">
        <div className="p-8 md:p-12 max-w-5xl mx-auto pb-32">
          
          <header className="flex items-center justify-between xl:justify-start gap-4 mb-10">
             <div>
               <h1 className="text-3xl font-extrabold text-text tracking-tight">{activeMenu}</h1>
               <p className="text-sm font-medium text-subtext mt-1">Design, build, and organize your curriculum</p>
             </div>
             
             {/* Mobile/Tablet Analytics Toggle */}
             <button 
               onClick={() => setIsAnalyticsOpen(!isAnalyticsOpen)}
               className="xl:hidden p-3 rounded-xl bg-card border border-card/40 text-subtext hover:text-primary transition-colors focus:outline-none"
             >
               <Activity className="w-5 h-5" />
             </button>
          </header>

          {activeMenu === "Course Builder" && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              
              {/* ✨ AI Auto-Generate Button */}
              <div className="bg-gradient-to-r from-purple-500/10 via-primary/5 to-transparent border border-purple-500/20 rounded-2xl p-6 relative overflow-hidden group">
                <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity blur-xl z-0" />
                <div className="relative z-10">
                  <h3 className="text-lg font-bold text-text flex items-center gap-2 mb-2">
                    Start with AI <Sparkles className="w-4 h-4 text-purple-500" />
                  </h3>
                  <p className="text-sm text-subtext mb-5 max-w-xl">
                    Save hours of planning by letting our curriculum-focused AI generate a complete module breakdown and syllabus customized to your topic.
                  </p>
                  
                  {!showPromptInput ? (
                    <button 
                      onClick={() => setShowPromptInput(true)}
                      className="relative overflow-hidden inline-flex items-center gap-3 bg-purple-600 hover:bg-purple-500 text-white px-8 py-3.5 rounded-full font-bold shadow-[0_0_40px_-5px_rgba(168,85,247,0.5)] hover:shadow-[0_0_60px_-10px_rgba(168,85,247,0.7)] transition-all group/btn outline-none ring-2 ring-purple-500/30 ring-offset-2 ring-offset-background"
                    >
                      <Sparkles className="w-5 h-5 animate-pulse" />
                      ✨ Auto-Generate Syllabus with AI
                      <div className="absolute inset-0 -translate-x-[150%] bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover/btn:animate-[shimmer_1.5s_infinite]" />
                    </button>
                  ) : (
                    <div className="flex flex-col sm:flex-row gap-3 max-w-2xl animate-in zoom-in-95 duration-200">
                      <input 
                        type="text" 
                        value={generationTopic}
                        onChange={(e) => setGenerationTopic(e.target.value)}
                        placeholder="e.g. Machine Learning Fundamentals for Beginners..."
                        className="flex-1 bg-background border border-purple-500/30 rounded-xl px-5 py-3.5 text-text focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none font-medium placeholder:text-subtext/50"
                        onKeyDown={(e) => e.key === 'Enter' && handleGenerateSyllabus()}
                      />
                      <button 
                        onClick={handleGenerateSyllabus}
                        disabled={isGenerating || !generationTopic.trim()}
                        className="bg-purple-600 hover:bg-purple-500 disabled:bg-purple-600/50 disabled:cursor-not-allowed text-white px-8 py-3.5 rounded-xl font-bold transition-all flex items-center justify-center gap-2"
                      >
                        {isGenerating ? <><Loader2 className="w-5 h-5 animate-spin" /> Generating...</> : <><Sparkles className="w-5 h-5" /> Generate</>}
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Modules List Container */}
              <div className="space-y-4">
                {modules.map((module) => (
                  <div key={module.id} className="bg-card/40 border border-card rounded-2xl overflow-hidden transition-all shadow-sm">
                    {/* Module Header */}
                    <div 
                      className="px-6 py-4 flex items-center gap-4 cursor-pointer hover:bg-card/80 transition-colors"
                      onClick={() => toggleModule(module.id)}
                    >
                      <div className="cursor-grab hover:text-primary text-subtext transition-colors">
                        <GripVertical className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-extrabold text-lg text-text tracking-tight">{module.title}</h4>
                        <span className="text-xs font-bold text-subtext/70 uppercase tracking-widest">{module.lessons.length} Contents</span>
                      </div>
                      <button className="p-2 rounded-full hover:bg-background text-subtext transition-colors">
                        {module.isExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                      </button>
                    </div>

                    {/* Expanded Module Content */}
                    {module.isExpanded && (
                      <div className="px-6 pb-6 pt-2 space-y-3 bg-card/20 animate-in slide-in-from-top-2 duration-200 border-t border-card/30 mt-1">
                        
                        {/* Lessons List */}
                        {module.lessons.map((lesson) => (
                          <div key={lesson.id} className="group flex items-center justify-between p-3 rounded-xl border border-transparent hover:border-card hover:bg-card/40 transition-all bg-background/50 text-sm">
                             <div className="flex items-center gap-3">
                               <GripVertical className="w-4 h-4 text-subtext/30 cursor-grab" />
                               <div className={`p-2 rounded-lg ${
                                 lesson.type === 'video' ? 'bg-blue-500/10 text-blue-500' :
                                 lesson.type === 'quiz' ? 'bg-amber-500/10 text-amber-500' :
                                 lesson.type === 'sandbox' ? 'bg-emerald-500/10 text-emerald-500' :
                                 'bg-card text-subtext'
                               }`}>
                                 {lesson.type === 'video' ? <Video className="w-4 h-4" /> : 
                                  lesson.type === 'quiz' ? <HelpCircle className="w-4 h-4" /> : 
                                  lesson.type === 'sandbox' ? <Code className="w-4 h-4" /> : 
                                  <BookOpen className="w-4 h-4" />}
                               </div>
                               <span className="font-semibold text-text">{lesson.title}</span>
                             </div>
                             <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                               <button className="text-xs font-bold text-subtext hover:text-text px-3 py-1.5 rounded-lg border border-transparent hover:border-card bg-transparent hover:bg-card transition-all">Edit</button>
                             </div>
                          </div>
                        ))}

                        {/* Add Content Toolbar */}
                        <div className="mt-4 pt-4 border-t border-dashed border-card">
                          <p className="text-xs font-black uppercase text-subtext tracking-widest mb-3 ml-2">Add Content</p>
                          <div className="flex flex-wrap gap-2">
                             <button className="flex items-center gap-2 px-3 py-2 bg-background border border-card hover:border-blue-500/40 hover:bg-blue-500/5 text-text rounded-xl text-xs font-bold transition-all flex-1 min-w-[140px] justify-center group/btn shadow-sm">
                               <div className="p-1 rounded-md bg-blue-500/10 text-blue-500 group-hover/btn:scale-110 transition-transform"><Video className="w-4 h-4" /></div> Upload Video
                             </button>
                             <button className="flex items-center gap-2 px-3 py-2 bg-background border border-card hover:border-emerald-500/40 hover:bg-emerald-500/5 text-text rounded-xl text-xs font-bold transition-all flex-1 min-w-[140px] justify-center group/btn shadow-sm">
                               <div className="p-1 rounded-md bg-emerald-500/10 text-emerald-500 group-hover/btn:scale-110 transition-transform"><Code className="w-4 h-4" /></div> Add Code Sandbox
                             </button>
                             <button className="flex items-center gap-2 px-3 py-2 bg-background border border-card hover:border-amber-500/40 hover:bg-amber-500/5 text-text rounded-xl text-xs font-bold transition-all flex-1 min-w-[140px] justify-center group/btn shadow-sm">
                               <div className="p-1 rounded-md bg-amber-500/10 text-amber-500 group-hover/btn:scale-110 transition-transform"><HelpCircle className="w-4 h-4" /></div> Insert Interactive Quiz
                             </button>
                          </div>
                        </div>

                      </div>
                    )}
                  </div>
                ))}

                <button className="w-full flex items-center justify-center gap-2 p-5 rounded-2xl border-2 border-dashed border-card hover:border-primary/50 hover:bg-primary/5 text-subtext hover:text-primary transition-colors font-bold group">
                  <Plus className="w-5 h-5 group-hover:scale-125 transition-transform" /> Add New Module
                </button>
              </div>

            </div>
          )}
        </div>
      </main>

      {/* ───── RIGHT QUICK ANALYTICS PANEL ───── */}
      <aside className={`fixed xl:static top-0 right-0 h-screen w-80 bg-background xl:bg-card/5 border-l border-card shadow-2xl xl:shadow-none z-50 transform transition-transform duration-300 ease-in-out flex flex-col ${isAnalyticsOpen ? 'translate-x-0' : 'translate-x-[100%] xl:translate-x-0 xl:w-80 xl:min-w-[320px]'}`}>
         
         <div className="p-6 border-b border-card flex items-center justify-between sticky top-0 bg-background xl:bg-transparent z-10">
           <h3 className="font-extrabold text-lg flex items-center gap-2 text-text">
             Quick <span className="text-primary">Analytics</span>
           </h3>
           <button onClick={() => setIsAnalyticsOpen(false)} className="xl:hidden p-2 rounded-full hover:bg-card text-subtext transition-colors">
             <ChevronRight className="w-5 h-5" />
           </button>
         </div>

         <div className="p-6 space-y-8 flex-1 overflow-y-auto no-scrollbar pb-24">
           
           {/* Section: Video Retention Heatmap */}
           <div>
             <div className="flex items-center justify-between mb-4">
                <span className="font-bold text-sm tracking-tight text-text">Video Retention Heatmap</span>
                <PieChart className="w-4 h-4 text-subtext/70" />
             </div>
             <div className="bg-card border border-card rounded-2xl p-4 shadow-sm group hover:border-primary/20 transition-colors">
                <div className="flex justify-between items-end mb-4">
                   <div>
                     <p className="text-[10px] font-bold text-subtext uppercase tracking-widest mb-1">Average Drop-off</p>
                     <p className="font-black text-2xl text-text leading-none flex items-baseline gap-1">
                       14:20 <span className="text-xs text-red-500 font-bold flex items-center"><TrendingDown className="w-3 h-3 mr-0.5"/> -3%</span>
                     </p>
                   </div>
                </div>
                
                {/* Mocked Heatmap Chart Line */}
                <div className="w-full h-16 flex items-end gap-[2px] mt-2 relative">
                  {/* Heatmap bars representing viewer retention fading out */}
                  {[...Array(30)].map((_, i) => {
                    // Create an organic looking dropoff curve mapping
                    const heightValue = i < 5 ? 100 : i < 15 ? 100 - (i-5)*3 : 70 - (i-15)*4;
                    const h = Math.max(10, Math.floor(heightValue + Math.random()*5 - 2));
                    // Color transitions from green to red based on dropoff
                    const colorClass = h > 80 ? 'bg-emerald-500' : h > 50 ? 'bg-amber-500' : 'bg-red-500';
                    return (
                      <div 
                        key={i} 
                        className={`w-full rounded-t-sm opacity-80 group-hover:opacity-100 transition-opacity ${colorClass}`}
                        style={{ height: `${h}%` }}
                      ></div>
                    );
                  })}
                  <div className="absolute top-1/2 left-0 w-full h-[1px] bg-card border border-dashed border-subtext/30" />
                </div>
                <div className="flex justify-between text-[9px] font-bold text-subtext mt-2 px-1">
                  <span>0:00</span>
                  <span>Midpoint</span>
                  <span>End</span>
                </div>
             </div>
           </div>

           {/* Section: Student Risk Alerts */}
           <div>
             <div className="flex items-center justify-between mb-4">
                <span className="font-bold text-sm tracking-tight text-text flex items-center gap-2">Student Risk Alerts <span className="bg-red-500/10 text-red-500 px-2 py-0.5 rounded-full text-[10px] font-black tracking-widest">2 NEW</span></span>
                <Bell className="w-4 h-4 text-red-500/70" />
             </div>
             
             <div className="space-y-3">
                {/* Alert 1 */}
                <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-4 flex gap-3 relative overflow-hidden group hover:bg-red-500/10 transition-colors">
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-500 rounded-l-2xl" />
                  <div className="bg-red-500/20 p-2 rounded-xl shrink-0 h-fit">
                    <UserX className="w-5 h-5 text-red-500 group-hover:scale-110 transition-transform" />
                  </div>
                  <div>
                    <h5 className="font-bold text-sm text-text">Arjun K.</h5>
                    <p className="text-xs text-subtext mt-0.5 line-clamp-2">Missed 3 consecutive quizzes and stopped watching videos halfway.</p>
                    <button className="text-xs font-bold text-red-500 mt-2 hover:underline flex items-center gap-1">Send Reminder <ArrowRight className="w-3 h-3" /></button>
                  </div>
                </div>

                {/* Alert 2 */}
                <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-4 flex gap-3 relative overflow-hidden group hover:bg-red-500/10 transition-colors">
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-500 rounded-l-2xl" />
                  <div className="bg-red-500/20 p-2 rounded-xl shrink-0 h-fit">
                    <AlertTriangle className="w-5 h-5 text-amber-500 group-hover:scale-110 transition-transform" />
                  </div>
                  <div>
                    <h5 className="font-bold text-sm text-text">Priya Patel</h5>
                    <p className="text-xs text-subtext mt-0.5 line-clamp-2">Low score in 'Building First Agent' Assessment (34%). Needs intervention.</p>
                    <button className="text-xs font-bold text-amber-500 mt-2 hover:underline flex items-center gap-1">View Assessment <ArrowRight className="w-3 h-3" /></button>
                  </div>
                </div>
             </div>
             <button className="w-full text-center text-xs font-bold text-primary hover:text-primary/80 mt-4 p-2 transition-colors">View All Analytics</button>
           </div>

         </div>
      </aside>

      {/* Backdrop for mobile */}
      {isAnalyticsOpen && (
        <div 
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 xl:hidden animate-in fade-in" 
          onClick={() => setIsAnalyticsOpen(false)}
        />
      )}

      {/* Global generic styles for animations */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes shimmer {
          100% { transform: translateX(150%); }
        }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />
    </div>
  );
}
