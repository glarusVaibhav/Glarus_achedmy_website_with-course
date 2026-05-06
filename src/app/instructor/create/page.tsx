"use client";

import { useState } from "react";
import { 
  Sparkles, CheckCircle2, Circle, Edit3, RefreshCw, Check, 
  ChevronRight, Layout, FileText, Video, PlayCircle, Loader2, Save
} from "lucide-react";

interface AIModule {
  id: string;
  title: string;
  lessons: string[];
  status: "pending" | "accepted" | "editing" | "regenerating";
}

export default function CourseCreatorWizard() {
  const [currentStep, setCurrentStep] = useState(2);
  const [topic, setTopic] = useState("");
  const [isGeneratingAll, setIsGeneratingAll] = useState(false);
  const [modules, setModules] = useState<AIModule[]>([
    // Mock pre-existing generated state for immediate UI feedback as requested
    {
      id: "m1",
      title: "Module 1: Introduction to Autonomous AI",
      lessons: [
        "Defining Autonomous AI Agents",
        "The Evolution from LLMs to Agents",
        "Key Capabilities of Modern Goal-driven AI"
      ],
      status: "accepted"
    },
    {
      id: "m2",
      title: "Module 2: The Agentic Stack",
      lessons: [
        "Memory: Short-term vs Long-term",
        "Tools: Equipping your Agent APIs",
        "Planning: ReAct and Chain of Thought"
      ],
      status: "editing" // Explicitly asked to show an 'Edit Mode'
    },
    {
      id: "m3",
      title: "Module 3: Building a Simple Research Agent",
      lessons: [
        "Setting up LangChain",
        "Creating a custom web-search tool",
        "Deploying the reasoning loop"
      ],
      status: "pending"
    }
  ]);
  
  const [editBuffer, setEditBuffer] = useState<{title: string, lessons: string}>({ title: "", lessons: "" });

  const startEditing = (mod: AIModule) => {
    setEditBuffer({ title: mod.title, lessons: mod.lessons.join("\n") });
    setModules(prev => prev.map(m => m.id === mod.id ? { ...m, status: "editing" } : m));
  };

  const saveEditing = (id: string) => {
    const newLessons = editBuffer.lessons.split("\n").filter(l => l.trim() !== "");
    setModules(prev => prev.map(m => m.id === id ? { ...m, title: editBuffer.title, lessons: newLessons, status: "accepted" } : m));
  };

  const generateSyllabus = async () => {
    if(!topic) return;
    setIsGeneratingAll(true);
    
    try {
      const res = await fetch("/api/ai/syllabus", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic })
      });
      
      if (res.ok) {
        const data = await res.json();
        if (data && data.modules) {
          const generated: AIModule[] = data.modules.map((m: any, i: number) => ({
             id: `gen-${Date.now()}-${i}`,
             title: m.title,
             lessons: m.lessons || [],
             status: "pending"
          }));
          setModules(generated);
        }
      } else {
        alert("Generative API Error");
      }
    } catch(e) {
      console.error(e);
      alert("Failed to connect to AI model");
    } finally {
      setIsGeneratingAll(false);
    }
  };

  const regenerateModule = async (id: string, moduleTitle: string) => {
    setModules(prev => prev.map(m => m.id === id ? { ...m, status: "regenerating" } : m));
    
    try {
      const res = await fetch("/api/ai/syllabus", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: `A single specific sub-module about: ${moduleTitle} for the course: ${topic}` })
      });
      
      if (res.ok) {
        const data = await res.json();
        // Just extract the first module from the generated array as the replacement
        if (data && data.modules && data.modules.length > 0) {
          const rep = data.modules[0];
          setModules(prev => prev.map(m => m.id === id ? { 
            ...m, 
            title: rep.title, 
            lessons: rep.lessons || [], 
            status: "pending" 
          } : m));
          return;
        }
      }
      
      // Fallback if failed
      setModules(prev => prev.map(m => m.id === id ? { ...m, status: "pending" } : m));
      alert("Failed to regenerate specific module");
      
    } catch (e) {
      setModules(prev => prev.map(m => m.id === id ? { ...m, status: "pending" } : m));
    }
  };

  const steps = [
    { num: 1, title: "Basic Info", icon: FileText },
    { num: 2, title: "AI Syllabus Generation", icon: Sparkles },
    { num: 3, title: "Content & Media", icon: Video },
    { num: 4, title: "Final Review", icon: CheckCircle2 }
  ];

  return (
    <div className="min-h-screen bg-background flex text-text font-sans selection:bg-purple-500/30">
      
      {/* LEFT STEPPER SIDEBAR */}
      <aside className="w-80 border-r border-card bg-card/10 p-8 hidden lg:flex flex-col shrink-0 sticky top-0 h-screen">
         <div className="mb-12">
            <h2 className="text-2xl font-black flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-purple-500" />
              <span>AI Wizard</span>
            </h2>
            <p className="text-subtext text-xs tracking-wider uppercase font-bold mt-2">Course Creator</p>
         </div>

         <div className="flex-1 relative">
            <div className="absolute left-[19px] top-4 bottom-20 w-0.5 bg-card" />
            
            <div className="space-y-12 relative z-10">
              {steps.map((step) => {
                 const isActive = currentStep === step.num;
                 const isCompleted = step.num < currentStep;
                 
                 return (
                   <div key={step.num} className={`flex items-start gap-4 transition-all duration-300 ${isActive ? 'opacity-100' : isCompleted ? 'opacity-60' : 'opacity-40'}`}>
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 border-2 bg-background z-10 shadow-sm
                         ${isActive ? 'border-purple-500 text-purple-500 scale-110 shadow-purple-500/20' : 
                           isCompleted ? 'border-emerald-500 text-emerald-500' : 'border-card text-subtext'}`}>
                         {isCompleted ? <Check className="w-5 h-5" /> : <step.icon className={`w-4 h-4 ${isActive ? 'animate-pulse' : ''}`} />}
                      </div>
                      <div className="pt-2">
                         <p className={`text-xs font-black tracking-widest uppercase mb-1 ${isActive ? "text-purple-500" : "text-subtext"}`}>Step {step.num}</p>
                         <h3 className={`font-bold ${isActive ? 'text-lg text-text' : 'text-base text-subtext'}`}>{step.title}</h3>
                      </div>
                   </div>
                 );
              })}
            </div>
         </div>

         <div className="mt-auto p-4 bg-purple-500/10 rounded-2xl border border-purple-500/20 text-xs text-purple-400 font-medium">
           💡 <b>Tip:</b> AI Generation works best when you provide highly specific prompts focusing on the target audience.
         </div>
      </aside>

      {/* MAIN SCREEN (STEP 2) */}
      <main className="flex-1 flex flex-col h-screen overflow-y-auto w-full max-w-5xl px-6 py-12 md:px-12 relative no-scrollbar">
         
         {/* HEADER */}
         <header className="mb-10">
           <h1 className="text-4xl font-extrabold tracking-tight mb-2">Architect Your Curriculum</h1>
           <p className="text-subtext">Use our advanced AI copilot to instantly draft a comprehensive, structured syllabus.</p>
         </header>

         {/* AI COPILOT INPUT BAR */}
         <div className="bg-card/40 border-2 border-purple-500/30 rounded-3xl p-2 pl-6 flex items-center gap-4 focus-within:border-purple-500 focus-within:shadow-[0_0_30px_-5px_rgba(168,85,247,0.3)] transition-all mb-10 group relative z-20">
           <Sparkles className="w-6 h-6 text-purple-500 shrink-0 group-focus-within:animate-pulse" />
           <input 
             value={topic}
             onChange={e => setTopic(e.target.value)}
             placeholder="e.g. A comprehensive guide to building AI Agents with Next.js..."
             className="w-full bg-transparent outline-none text-text text-lg font-medium placeholder:text-subtext/50"
             onKeyDown={e => e.key === 'Enter' && generateSyllabus()}
           />
           <button 
             onClick={generateSyllabus}
             disabled={isGeneratingAll || !topic}
             className="bg-purple-600 hover:bg-purple-500 disabled:bg-purple-600/40 text-white px-8 py-4 rounded-2xl font-bold transition-all shadow-lg shadow-purple-500/20 flex items-center gap-2 whitespace-nowrap shrink-0"
           >
             {isGeneratingAll ? <Loader2 className="w-5 h-5 animate-spin" /> : "Generate Outline"}
           </button>
         </div>

         {/* AI OUTPUT MODULE CARDS */}
         <div className="flex-1 space-y-6 pb-24">
           {modules.map((module) => (
              <div 
                key={module.id} 
                className={`rounded-3xl border-2 transition-all p-6 relative overflow-hidden bg-background shadow-sm hover:shadow-xl
                  ${module.status === 'accepted' ? 'border-emerald-500/30 bg-emerald-500/5' : 
                    module.status === 'editing' ? 'border-primary shadow-primary/10 ring-4 ring-primary/10' : 
                    module.status === 'regenerating' ? 'border-purple-500/50 opacity-70 cursor-wait' :
                    'border-card hover:border-purple-500/30'}
                `}
              >
                 {module.status === 'regenerating' && (
                    <div className="absolute inset-0 bg-background/50 backdrop-blur-sm flex items-center justify-center z-20">
                       <div className="flex flex-col items-center text-purple-500">
                          <RefreshCw className="w-8 h-8 animate-spin mb-2" />
                          <span className="font-bold">Regenerating with specialized focus...</span>
                       </div>
                    </div>
                 )}

                 {/* Editing Mode UI */}
                 {module.status === 'editing' ? (
                    <div className="animate-in fade-in zoom-in-95 duration-200">
                       <div className="mb-4 flex items-center justify-between">
                          <span className="text-xs font-black uppercase text-primary tracking-widest flex items-center gap-2">
                             <Edit3 className="w-4 h-4"/> Edit Mode
                          </span>
                       </div>
                       <input 
                         value={editBuffer.title}
                         onChange={e => setEditBuffer({...editBuffer, title: e.target.value})}
                         className="w-full text-xl font-bold bg-card border border-card rounded-xl px-4 py-3 mb-4 text-text outline-none focus:border-primary focus:ring-1 focus:ring-primary/50"
                       />
                       <textarea 
                         value={editBuffer.lessons}
                         onChange={e => setEditBuffer({...editBuffer, lessons: e.target.value})}
                         rows={5}
                         className="w-full bg-card border border-card rounded-xl px-4 py-3 text-text text-sm outline-none font-mono focus:border-primary focus:ring-1 focus:ring-primary/50 leading-relaxed mb-4"
                         placeholder="List lessons here, one per line..."
                       />
                       <div className="flex justify-end gap-3 pt-2 border-t border-card">
                          <button 
                             onClick={() => setModules(prev => prev.map(m => m.id === module.id ? { ...m, status: "pending" } : m))}
                             className="px-6 py-2 rounded-xl text-sm font-bold text-subtext hover:bg-card transition-colors"
                          >
                             Cancel
                          </button>
                          <button 
                             onClick={() => saveEditing(module.id)}
                             className="px-6 py-2 rounded-xl text-sm font-bold bg-primary text-white hover:bg-primary/90 flex items-center gap-2 shadow-lg shadow-primary/20"
                          >
                             <Save className="w-4 h-4" /> Save Changes
                          </button>
                       </div>
                    </div>
                 ) : (
                    /* Display Mode UI - Rich Text Container */
                    <div className="flex flex-col md:flex-row gap-6">
                       <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                             {module.status === 'accepted' ? <CheckCircle2 className="w-6 h-6 text-emerald-500" /> : <Layout className="w-6 h-6 text-purple-500/80" />}
                             <h3 className="text-xl font-bold text-text">{module.title}</h3>
                          </div>
                          
                          <div className="pl-9 space-y-2">
                             {module.lessons.map((lesson, idx) => (
                               <div key={idx} className="flex items-start gap-2.5 group/lesson">
                                 <PlayCircle className="w-4 h-4 text-subtext/40 mt-0.5 group-hover/lesson:text-purple-500 transition-colors" />
                                 <span className="text-sm font-medium text-text/90 leading-snug">{lesson}</span>
                               </div>
                             ))}
                          </div>
                       </div>

                       {/* Action Buttons */}
                       <div className="md:w-32 flex flex-col gap-2 shrink-0 border-t md:border-t-0 md:border-l border-card pt-4 md:pt-0 md:pl-6 justify-center">
                          <button 
                            onClick={() => setModules(prev => prev.map(m => m.id === module.id ? { ...m, status: "accepted" } : m))}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all border 
                              ${module.status === 'accepted' 
                                 ? 'bg-emerald-500 text-white border-emerald-500 shadow-md shadow-emerald-500/20' 
                                 : 'bg-background hover:bg-emerald-500/10 text-subtext hover:text-emerald-500 hover:border-emerald-500/30 border-card'}`}
                          >
                            <Check className="w-4 h-4" /> Accept
                          </button>
                          
                          <button 
                            onClick={() => startEditing(module)}
                            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all bg-background border border-card hover:bg-primary/10 text-subtext hover:text-primary hover:border-primary/30"
                          >
                            <Edit3 className="w-4 h-4" /> Edit
                          </button>

                          <button 
                            onClick={() => regenerateModule(module.id, module.title)}
                            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all bg-background border border-card hover:bg-amber-500/10 text-subtext hover:text-amber-500 hover:border-amber-500/30"
                          >
                            <RefreshCw className="w-4 h-4" /> Re-roll
                          </button>
                       </div>
                    </div>
                 )}
              </div>
           ))}
         </div>

         {/* BOTTOM PRIMARY APPROVE ACTION */}
         <div className="sticky bottom-0 bg-gradient-to-t from-background via-background to-transparent pt-12 pb-6 flex justify-end z-30">
            <button className="bg-text hover:bg-black dark:bg-white dark:text-black dark:hover:bg-gray-200 text-background px-10 py-5 rounded-2xl font-black text-lg shadow-2xl transition-transform active:scale-95 flex items-center gap-3">
               Approve Syllabus & Continue <ChevronRight className="w-6 h-6" />
            </button>
         </div>

      </main>

      <style dangerouslySetInnerHTML={{__html: `
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />
    </div>
  );
}
