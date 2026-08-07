"use client";

import { use, useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, 
  Play, 
  Clock, 
  BarChart, 
  CheckCircle2, 
  Star, 
  Users, 
  Calendar, 
  ShieldCheck, 
  Award, 
  Lock, 
  Unlock, 
  ChevronDown, 
  ChevronUp, 
  BookOpen, 
  Code2, 
  Cpu, 
  Sparkles, 
  MessageSquare,
  ShoppingCart,
  Zap,
  Globe
} from "lucide-react";
import { COURSES } from "@/lib/data";
import { useCartStore } from "@/store/cartStore";
import { useEnrollmentStore } from "@/store/useEnrollmentStore";
import { useAuth } from "@/context/AuthContext";

const FLAGSHIP_COURSE = {
  id: "Generative_AI_Application_Engineer",
  title: "Generative AI Application Engineering",
  description: "Master LLMs, LangChain, RAG, and Vector Databases to build production-ready autonomous AI agents from scratch.",
  instructor: "Alex Chen",
  instructorRole: "Staff AI Architect @ ex-FAANG",
  price: 15999,
  originalPrice: 24999,
  level: "Intermediate",
  rating: 4.9,
  reviewsCount: "2,540",
  enrolledCount: "12,000",
  duration: "24 Hours VOD",
  image: "/images/course-1.png",
  lastUpdated: "July 2026",
  category: "Web Development / AI"
};

export default function CourseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  
  // Look up course or fallback to flagship course
  const foundCourse = COURSES.find(c => c.id === id);
  const course = (id === "Generative_AI_Application_Engineer" || id === "2" || !foundCourse)
    ? FLAGSHIP_COURSE
    : {
        ...foundCourse,
        originalPrice: Math.round(foundCourse.price * 1.5),
        enrolledCount: "8,400",
        reviewsCount: "1,280",
        instructorRole: "Senior AI Engineer",
        lastUpdated: "July 2026",
        category: "AI Engineering"
      };

  const { isEnrolled, enrollCourse } = useEnrollmentStore();
  const { addItem, items } = useCartStore();
  const { user } = useAuth();
  const [hasHydrated, setHasHydrated] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [openModule, setOpenModule] = useState<number | null>(0);

  useEffect(() => {
    setHasHydrated(true);
  }, []);

  // Enrolled ONLY if client hydrated AND a user is signed in
  const enrolled = (hasHydrated && user) ? isEnrolled(course.id) : false;
  const inCart = items.some(item => item.id === course.id);

  const handleBuyNow = () => {
    if (!user) {
      router.push(`/signup?redirect=/course/${course.id}`);
      return;
    }
    enrollCourse(course.id);
    addItem({
      id: course.id,
      title: course.title,
      description: course.description,
      instructor: course.instructor,
      price: course.price,
      level: course.level,
      rating: course.rating,
      duration: course.duration,
      image: course.image
    });
    router.push("/checkout");
  };

  const handleAddToCart = () => {
    addItem({
      id: course.id,
      title: course.title,
      description: course.description,
      instructor: course.instructor,
      price: course.price,
      level: course.level,
      rating: course.rating,
      duration: course.duration,
      image: course.image
    });
  };

  const learnOutcomes = [
    "Build Production-Grade AI Apps from Scratch",
    "Master LangChain, LangGraph & Agent Workflows",
    "Implement Advanced RAG with Vector Databases",
    "Build Autonomous AI Agents & Tool Integrations",
    "Integrate Model Context Protocol (MCP)",
    "Fine-Tune Open Source Models (Llama 3 & DeepSeek)",
    "Deploy Scalable Microservices on AWS/GCP",
    "Architect Enterprise LLM Applications"
  ];

  const modules = [
    {
      title: "Module 1: LLM Foundations & Architecture",
      lessonsCount: 8,
      duration: "4h 30m",
      preview: true,
      lessons: [
        "1.1 Introduction to Generative AI Engineering",
        "1.2 Tokenization & Embedding Spaces",
        "1.3 Transformer Architecture Deep Dive",
        "1.4 OpenAI & Open-Source API Integrations"
      ]
    },
    {
      title: "Module 2: Advanced Prompt Engineering & Tool Calling",
      lessonsCount: 12,
      duration: "6h 15m",
      preview: true,
      lessons: [
        "2.1 Structured Output & Function Calling",
        "2.2 Chain-of-Thought & Tree-of-Thoughts",
        "2.3 Multi-Turn Memory & State Management",
        "2.4 LangChain & LangGraph Orchestration"
      ]
    },
    {
      title: "Module 3: Production RAG & Vector Databases",
      lessonsCount: 10,
      duration: "7h 45m",
      preview: false,
      lessons: [
        "3.1 Chunking Strategies & Hybrid Search",
        "3.2 Pinecone, Qdrant & PGVector Setup",
        "3.3 Reranking & Contextual Compression",
        "3.4 Evaluating RAG with Ragas Framework"
      ]
    },
    {
      title: "Module 4: Fine-Tuning, MCP & Cloud Deployment",
      lessonsCount: 6,
      duration: "5h 30m",
      preview: false,
      lessons: [
        "4.1 LoRA & QLoRA Fine-Tuning Workflow",
        "4.2 Model Context Protocol (MCP) Server Setup",
        "4.3 Docker, FastMCP & Serverless Deployment",
        "4.4 Monitoring & Rate Limiting in Production"
      ]
    }
  ];

  const projects = [
    {
      title: "Autonomous AI Code Assistant",
      desc: "Full-stack IDE extension with context-aware code generation.",
      tech: ["LangGraph", "Next.js", "Python"]
    },
    {
      title: "Enterprise RAG Search Engine",
      desc: "Hybrid vector search across millions of corporate documents.",
      tech: ["PGVector", "Pinecone", "FastAPI"]
    },
    {
      title: "AI Website & Layout Generator",
      desc: "Text-to-UI engine producing responsive, styled React components.",
      tech: ["OpenAI", "Tailwind", "React"]
    },
    {
      title: "Voice AI Customer Support Bot",
      desc: "Real-time voice agent with <200ms latency tool invocation.",
      tech: ["Deepgram", "Groq", "ElevenLabs"]
    }
  ];

  const faqs = [
    {
      q: "Who is this course designed for?",
      a: "This track is built for software engineers, web developers, and technical leads who want to transition into building high-value Generative AI applications and autonomous agents."
    },
    {
      q: "Do I get lifetime access to all course materials?",
      a: "Yes! Once enrolled, you receive lifetime access to all video lessons, source code, interactive notebooks, continuous model updates, and community channels."
    },
    {
      q: "What if I get stuck during a project?",
      a: "You get 24/7 access to our AI Tutor within the GlarusAcademy platform, along with code reviews and mentor support in our private Discord community."
    },
    {
      q: "Will I receive a verified certificate upon completion?",
      a: "Yes, after completing all module assessments and capstone projects, you will earn a shareable, cryptographically verified GlarusAcademy Certificate of Completion."
    }
  ];

  return (
    <div className="w-full min-h-screen bg-background text-text selection:bg-primary/30 pb-24">
      
      {/* HERO SECTION */}
      <section className="relative w-full pt-10 pb-20 border-b border-card/60 bg-gradient-to-b from-card/80 to-background overflow-hidden">
        {/* Background Ambient Glow */}
        <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-purple-600/10 blur-[150px] rounded-full pointer-events-none" />
        <div className="absolute top-1/3 left-0 w-[400px] h-[400px] bg-sky-600/10 blur-[150px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          
          <Link 
            href="/courses" 
            className="inline-flex items-center gap-2 text-subtext hover:text-text font-bold text-sm mb-8 transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Catalog
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            
            {/* Left Content */}
            <div className="lg:col-span-7">
              <div className="flex flex-wrap items-center gap-3 mb-6">
                <span className="px-3.5 py-1 bg-purple-500/20 text-purple-300 text-xs font-black uppercase tracking-wider rounded-full border border-purple-500/30">
                  {course.category}
                </span>
                <span className="px-3.5 py-1 bg-emerald-500/20 text-emerald-300 text-xs font-black uppercase tracking-wider rounded-full border border-emerald-500/30">
                  {course.level}
                </span>
                <span className="px-3.5 py-1 bg-sky-500/20 text-sky-300 text-xs font-bold rounded-full border border-sky-500/30">
                  Updated {course.lastUpdated}
                </span>
              </div>

              <h1 className="text-4xl md:text-6xl font-black tracking-tight text-text leading-[1.1] mb-6">
                {course.title}
              </h1>

              <p className="text-lg md:text-xl text-subtext font-medium leading-relaxed mb-8">
                {course.description}
              </p>

              {/* Meta stats bar */}
              <div className="flex flex-wrap items-center gap-6 text-sm font-bold text-subtext pt-4 border-t border-card/60">
                <div className="flex items-center gap-1.5 text-amber-400">
                  <Star className="w-5 h-5 fill-amber-400" />
                  <span className="text-text font-black">{course.rating}</span>
                  <span className="text-subtext text-xs">({course.reviewsCount} reviews)</span>
                </div>
                
                <div className="h-4 w-px bg-card" />
                
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-purple-400" />
                  <span>{course.enrolledCount} Enrolled</span>
                </div>

                <div className="h-4 w-px bg-card" />

                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-emerald-400" />
                  <span>{course.duration}</span>
                </div>
              </div>

              {/* Instructor badge */}
              <div className="mt-8 flex items-center gap-4 p-4 rounded-2xl bg-card/60 border border-card/80 max-w-md">
                <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-500 flex items-center justify-center text-white font-black text-lg shadow-lg">
                  {course.instructor.charAt(0)}
                </div>
                <div>
                  <h4 className="text-sm font-black text-text">{course.instructor}</h4>
                  <p className="text-xs font-semibold text-subtext">{course.instructorRole}</p>
                </div>
              </div>
            </div>

            {/* Right Column: Sticky Purchase Box Desktop */}
            <div className="lg:col-span-5 relative">
              <div className="sticky top-28 bg-card/90 backdrop-blur-2xl border border-card/80 rounded-3xl p-6 shadow-2xl space-y-6">
                
                {/* Course Cover Preview */}
                <div className="relative w-full h-52 bg-background rounded-2xl overflow-hidden group cursor-pointer border border-card/60 flex items-center justify-center">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-900/40 via-indigo-900/40 to-background opacity-80" />
                  <Cpu className="w-20 h-20 text-purple-400/30 group-hover:scale-110 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-colors" />
                  
                  <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md border border-white/40 flex items-center justify-center shadow-xl group-hover:scale-110 transition-all z-10">
                    <Play className="w-7 h-7 text-white fill-white ml-1" />
                  </div>
                  
                  <span className="absolute bottom-3 left-3 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 bg-background/80 backdrop-blur-md rounded-md text-text border border-card">
                    Preview Course
                  </span>
                </div>

                {/* Price Display */}
                <div className="flex items-baseline gap-3">
                  <span className="text-4xl font-black text-text">
                    ₹{course.price.toLocaleString()}
                  </span>
                  {course.originalPrice && (
                    <span className="text-lg font-bold text-subtext line-through opacity-60">
                      ₹{course.originalPrice.toLocaleString()}
                    </span>
                  )}
                  <span className="px-2.5 py-1 bg-emerald-500/20 text-emerald-400 text-xs font-black rounded-full uppercase">
                    35% OFF
                  </span>
                </div>

                {/* DYNAMIC PRIMARY CTA BUTTON */}
                {enrolled ? (
                  <div className="space-y-3">
                    <div className="w-full py-2 px-4 bg-emerald-500/15 border border-emerald-500/30 rounded-xl text-center text-xs font-black text-emerald-300 flex items-center justify-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Course Purchased & Unlocked
                    </div>
                    <Link
                      href="/learn/Generative_AI_Application_Engineer"
                      className="w-full py-4 px-6 bg-gradient-to-r from-purple-600 via-indigo-600 to-emerald-600 text-white font-black text-base uppercase tracking-wider rounded-2xl text-center flex items-center justify-center gap-2 shadow-[0_0_30px_rgba(168,85,247,0.35)] hover:scale-[1.02] transition-all group"
                    >
                      🚀 Start Learning <Zap className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <button
                      onClick={handleBuyNow}
                      className="w-full py-4 px-6 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-black text-base uppercase tracking-wider rounded-2xl text-center flex items-center justify-center gap-2 shadow-[0_0_30px_rgba(16,185,129,0.35)] hover:scale-[1.02] transition-all group"
                    >
                      ⚡ Buy Now <Zap className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    </button>
                    
                    <button
                      onClick={handleAddToCart}
                      disabled={inCart}
                      className={`w-full py-3 px-6 rounded-2xl border font-bold text-sm flex items-center justify-center gap-2 transition-all ${
                        inCart
                          ? "bg-card border-emerald-500/40 text-emerald-400 cursor-default"
                          : "bg-card/80 border-card hover:bg-card text-text"
                      }`}
                    >
                      <ShoppingCart className="w-4 h-4" />
                      {inCart ? "Added to Cart" : "Add to Cart"}
                    </button>
                  </div>
                )}

                {/* Features included */}
                <div className="pt-6 border-t border-card/60 space-y-3 text-xs font-bold text-subtext">
                  <p className="text-text font-black text-xs uppercase tracking-wider mb-2">This Course Includes:</p>
                  <div className="flex items-center gap-2 text-text">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> Lifetime Unlimited Access
                  </div>
                  <div className="flex items-center gap-2 text-text">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> 4 Real-World Capstone Projects
                  </div>
                  <div className="flex items-center gap-2 text-text">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> 24/7 AI Tutor Support
                  </div>
                  <div className="flex items-center gap-2 text-text">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> Verified Certificate of Completion
                  </div>
                  <div className="flex items-center gap-2 text-text">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> Source Code & Jupyter Notebooks
                  </div>
                  <div className="flex items-center gap-2 text-text">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> Discord Developer Community
                  </div>
                </div>

              </div>
            </div>

          </div>

        </div>
      </section>

      {/* MAIN CONTENT BODY */}
      <section className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-1 lg:grid-cols-12 gap-12">
        
        <div className="lg:col-span-7 space-y-16">
          
          {/* WHAT YOU'LL LEARN */}
          <div>
            <h2 className="text-2xl md:text-3xl font-black text-text mb-6 tracking-tight flex items-center gap-3">
              <Sparkles className="w-7 h-7 text-purple-400" /> What You&apos;ll Learn
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {learnOutcomes.map((outcome, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-card/60 border border-card/80 flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-bold text-text leading-snug">{outcome}</span>
                </div>
              ))}
            </div>
          </div>

          {/* COURSE CURRICULUM */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl md:text-3xl font-black text-text tracking-tight flex items-center gap-3">
                <BookOpen className="w-7 h-7 text-sky-400" /> Course Curriculum
              </h2>
              <span className="text-xs font-bold text-subtext">
                4 Modules • 36 Lessons • 24h Total
              </span>
            </div>

            <div className="space-y-4">
              {modules.map((mod, i) => {
                const isOpen = openModule === i;
                const isModuleLocked = !enrolled && !mod.preview;

                return (
                  <div 
                    key={i} 
                    className="bg-card/70 border border-card/80 rounded-2xl overflow-hidden transition-all"
                  >
                    <button
                      onClick={() => setOpenModule(isOpen ? null : i)}
                      className="w-full p-5 flex items-center justify-between text-left hover:bg-card/90 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        {isModuleLocked ? (
                          <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
                            <Lock className="w-4 h-4" />
                          </div>
                        ) : (
                          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                            <Unlock className="w-4 h-4" />
                          </div>
                        )}
                        <div>
                          <h3 className="font-black text-text text-base">{mod.title}</h3>
                          <p className="text-xs font-semibold text-subtext mt-0.5">
                            {mod.lessonsCount} Lessons • {mod.duration}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        {mod.preview && !enrolled && (
                          <span className="px-2.5 py-1 rounded-md bg-purple-500/20 text-purple-300 text-[10px] font-black uppercase tracking-wider border border-purple-500/30">
                            Preview Available
                          </span>
                        )}
                        {isModuleLocked && (
                          <span className="px-2.5 py-1 rounded-md bg-amber-500/20 text-amber-300 text-[10px] font-black uppercase tracking-wider border border-amber-500/30">
                            Locked 🔒
                          </span>
                        )}
                        {isOpen ? <ChevronUp className="w-5 h-5 text-subtext" /> : <ChevronDown className="w-5 h-5 text-subtext" />}
                      </div>
                    </button>

                    <AnimatePresence>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="px-5 pb-5 pt-2 border-t border-card/60 space-y-2 bg-background/50"
                        >
                          {mod.lessons.map((lesson, lIdx) => (
                            <div key={lIdx} className="flex items-center justify-between text-xs font-bold text-subtext py-2 px-3 rounded-xl hover:bg-card/50">
                              <span className="flex items-center gap-2 text-text">
                                <Play className="w-3.5 h-3.5 text-purple-400" /> {lesson}
                              </span>
                              {mod.preview || enrolled ? (
                                <span className="text-emerald-400 text-[10px] font-black uppercase">Play</span>
                              ) : (
                                <Lock className="w-3.5 h-3.5 text-subtext opacity-50" />
                              )}
                            </div>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </div>

          {/* PROJECTS INCLUDED */}
          <div>
            <h2 className="text-2xl md:text-3xl font-black text-text mb-6 tracking-tight flex items-center gap-3">
              <Code2 className="w-7 h-7 text-emerald-400" /> Real-World Projects Included
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {projects.map((proj, pIdx) => (
                <div key={pIdx} className="p-6 rounded-2xl bg-card/60 border border-card/80 flex flex-col justify-between hover:border-purple-500/40 transition-all">
                  <div>
                    <h4 className="text-base font-black text-text mb-2">{proj.title}</h4>
                    <p className="text-xs font-medium text-subtext leading-relaxed mb-4">{proj.desc}</p>
                  </div>
                  <div className="flex flex-wrap gap-2 pt-3 border-t border-card/60">
                    {proj.tech.map((t, tIdx) => (
                      <span key={tIdx} className="px-2.5 py-1 bg-background rounded-md text-[10px] font-bold text-subtext border border-card">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* INSTRUCTOR SECTION */}
          <div>
            <h2 className="text-2xl md:text-3xl font-black text-text mb-6 tracking-tight">Meet Your Instructor</h2>
            <div className="p-8 rounded-3xl bg-card/60 border border-card/80 flex flex-col md:flex-row gap-6 items-center md:items-start">
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white font-black text-3xl shadow-xl shrink-0">
                {course.instructor.charAt(0)}
              </div>
              <div className="space-y-3 text-center md:text-left">
                <div>
                  <h3 className="text-xl font-black text-text">{course.instructor}</h3>
                  <p className="text-xs font-bold text-purple-400">{course.instructorRole}</p>
                </div>
                <p className="text-xs font-medium text-subtext leading-relaxed">
                  10+ years architecting enterprise machine learning systems and autonomous AI pipelines at leading tech giants. Has trained over 50,000 engineers globally in Generative AI, RAG, and LLM orchestration.
                </p>
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-xs font-bold text-subtext pt-2">
                  <span className="flex items-center gap-1"><Star className="w-4 h-4 text-amber-400 fill-amber-400" /> 4.9 Instructor Rating</span>
                  <span className="flex items-center gap-1"><Award className="w-4 h-4 text-emerald-400" /> FAANG Lead Architect</span>
                </div>
              </div>
            </div>
          </div>

          {/* FAQ SECTION */}
          <div>
            <h2 className="text-2xl md:text-3xl font-black text-text mb-6 tracking-tight">Frequently Asked Questions</h2>
            <div className="space-y-3">
              {faqs.map((faq, idx) => {
                const isOpen = openFaq === idx;
                return (
                  <div key={idx} className="bg-card/60 border border-card/80 rounded-2xl overflow-hidden">
                    <button
                      onClick={() => setOpenFaq(isOpen ? null : idx)}
                      className="w-full p-5 flex items-center justify-between text-left font-black text-sm text-text hover:bg-card/80 transition-colors"
                    >
                      <span>{faq.q}</span>
                      {isOpen ? <ChevronUp className="w-5 h-5 text-subtext" /> : <ChevronDown className="w-5 h-5 text-subtext" />}
                    </button>
                    {isOpen && (
                      <div className="px-5 pb-5 text-xs font-medium text-subtext leading-relaxed border-t border-card/40 pt-3">
                        {faq.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

        </div>

      </section>

    </div>
  );
}
