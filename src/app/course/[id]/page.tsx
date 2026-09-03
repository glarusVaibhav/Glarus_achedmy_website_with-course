"use client";

import { use, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, 
  Play, 
  Clock, 
  CheckCircle2, 
  Star, 
  Users, 
  Lock, 
  ChevronDown, 
  ChevronUp, 
  BookOpen, 
  Code2, 
  Cpu, 
  Sparkles, 
  ShoppingCart, 
  ArrowRight, 
  Check, 
  X, 
  HelpCircle
} from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { useEnrollmentStore } from "@/store/useEnrollmentStore";
import { useAuth } from "@/context/AuthContext";
import { CourseOverview } from "@/components/course/CourseOverview";
import { getCourseDetails, CourseDetailItem } from "@/lib/courseCatalogDetails";

/**
 * Renders the large editorial headline with the signature gradient highlight
 * on the primary subject keyword.
 */
function renderEditorialTitle(title: string) {
  const words = title.split(" ");
  if (words.length <= 1) {
    return <span className="text-slate-900 dark:text-white">{title}</span>;
  }
  if (words.length === 2) {
    return (
      <>
        <span className="text-slate-900 dark:text-white">{words[0]} </span>
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-indigo-600 to-sky-600 dark:from-purple-300 dark:via-indigo-200 dark:to-sky-300">
          {words[1]}
        </span>
      </>
    );
  }
  
  // 3 or more words: highlight the middle portion
  const first = words[0];
  const mid = words.slice(1, -1).join(" ");
  const last = words[words.length - 1];

  return (
    <>
      <span className="text-slate-900 dark:text-white">{first} </span>
      <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-indigo-600 to-sky-600 dark:from-purple-300 dark:via-indigo-200 dark:to-sky-300">
        {mid}{" "}
      </span>
      <span className="text-slate-900 dark:text-white">{last}</span>
    </>
  );
}

export default function CourseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  
  // Dynamically resolve course metadata, curriculum, projects, and FAQs
  const course: CourseDetailItem = getCourseDetails(id);

  const { isEnrolled, enrollCourse } = useEnrollmentStore();
  const { addItem, items } = useCartStore();
  const { user } = useAuth();
  const [hasHydrated, setHasHydrated] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [openModule, setOpenModule] = useState<number | null>(0);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [showStickyBar, setShowStickyBar] = useState(false);

  useEffect(() => {
    setHasHydrated(true);

    const handleScroll = () => {
      if (window.scrollY > 600) {
        setShowStickyBar(true);
      } else {
        setShowStickyBar(false);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
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
      instructor: "Senior AI Architect",
      price: course.price,
      level: course.level,
      rating: course.rating,
      duration: course.duration,
      image: "/images/course-1.png"
    });
    router.push("/checkout");
  };

  const handleAddToCart = () => {
    addItem({
      id: course.id,
      title: course.title,
      description: course.description,
      instructor: "Senior AI Architect",
      price: course.price,
      level: course.level,
      rating: course.rating,
      duration: course.duration,
      image: "/images/course-1.png"
    });
  };

  const totalLessons = course.modules.reduce((acc, m) => acc + m.lessonsCount, 0);

  return (
    <div className="w-full min-h-screen bg-background text-text selection:bg-purple-500/30 selection:text-white pb-32 font-sans transition-colors duration-200">
      
      {/* ─────────────────────────────────────────────────────────────
          1. HERO SECTION — DYNAMIC COURSE EDITORIAL & PURCHASE PANEL
          ───────────────────────────────────────────────────────────── */}
      <section className="relative w-full pt-8 sm:pt-10 pb-12 sm:pb-16 border-b border-border/80 dark:border-white/[0.06] overflow-hidden bg-gradient-to-b from-slate-100/70 via-slate-50 to-background dark:from-[#090D18] dark:via-[#060913] dark:to-[#050812]">
        
        {/* Subtle Ambient Radial Lighting */}
        <div className="absolute -top-48 right-1/4 w-[700px] h-[600px] bg-purple-500/[0.05] dark:bg-purple-600/[0.07] blur-[180px] rounded-full pointer-events-none" />
        <div className="absolute top-1/4 -left-32 w-[600px] h-[600px] bg-sky-500/[0.04] dark:bg-sky-600/[0.05] blur-[200px] rounded-full pointer-events-none" />
        
        {/* Faint Subtle Grid Texture */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#00000005_1px,transparent_1px),linear-gradient(to_bottom,#00000005_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#ffffff02_1px,transparent_1px),linear-gradient(to_bottom,#ffffff02_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

        <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          
          {/* Back to Catalog Breadcrumb */}
          <Link 
            href="/courses" 
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white mb-6 sm:mb-8 transition-colors group py-1"
          >
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform text-slate-400" />
            <span>Back to Catalog</span>
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
            
            {/* ── LEFT COLUMN: Dynamic Hero Content (~58%) ── */}
            <div className="lg:col-span-7 space-y-6 sm:space-y-7">
              
              {/* Subtle Metadata Row */}
              <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
                <span className="px-3 py-1 bg-purple-500/10 text-purple-700 dark:text-purple-300 text-[11px] font-semibold tracking-wider uppercase rounded-md border border-purple-500/20">
                  {course.category}
                </span>
                <span className="px-3 py-1 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 text-[11px] font-semibold tracking-wider uppercase rounded-md border border-emerald-500/20">
                  {course.level}
                </span>
                <span className="px-3 py-1 bg-slate-200/60 dark:bg-white/[0.02] text-slate-600 dark:text-slate-400 text-[11px] font-medium rounded-md border border-slate-300/60 dark:border-white/[0.06]">
                  Updated {course.lastUpdated}
                </span>
              </div>

              {/* Dynamic Editorial Headline */}
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-[3.9rem] font-black tracking-tight leading-[1.08]">
                {renderEditorialTitle(course.title)}
              </h1>

              {/* Course Description */}
              <p className="text-base sm:text-lg lg:text-[1.12rem] text-slate-600 dark:text-slate-300/90 font-normal leading-relaxed max-w-[640px]">
                {course.description}
              </p>

              {/* Horizontal Metrics Row */}
              <div className="flex flex-wrap items-center gap-y-3 gap-x-5 text-xs sm:text-sm text-slate-600 dark:text-slate-300 pt-2.5 border-t border-border/80 dark:border-white/[0.08]">
                {/* Rating */}
                <div className="flex items-center gap-1.5">
                  <Star className="w-4 h-4 text-amber-500 fill-amber-500 shrink-0" />
                  <span className="text-slate-900 dark:text-white font-bold">{course.rating}</span>
                  <span className="text-slate-500 dark:text-slate-400 font-medium">({course.reviewsCount} reviews)</span>
                </div>
                
                <span className="text-slate-300 dark:text-white/20 select-none hidden sm:inline">•</span>
                
                {/* Enrolled */}
                <div className="flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400 shrink-0" />
                  <span><strong className="text-slate-900 dark:text-white font-semibold">{course.enrolledCount}</strong> Enrolled</span>
                </div>

                <span className="text-slate-300 dark:text-white/20 select-none hidden sm:inline">•</span>

                {/* Duration */}
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>{course.duration}</span>
                </div>
              </div>

              {/* Dynamic Course Overview & Learning Journey */}
              <CourseOverview
                stats={{
                  duration: course.duration,
                  lessonsCount: totalLessons,
                  modulesCount: course.modules.length,
                  projectsCount: course.projects.length,
                }}
                overviewText={course.description}
                isLiveCohort={false}
              />

            </div>

            {/* ── RIGHT COLUMN: High-End Purchase Panel (~42%) ── */}
            <div className="lg:col-span-5 relative lg:-mt-2">
              
              {/* Soft Ambient Light Bloom */}
              <div className="absolute -inset-1.5 bg-gradient-to-b from-purple-500/15 via-sky-500/10 to-transparent rounded-[2.2rem] blur-2xl -z-10 opacity-70 pointer-events-none" />

              <div className="bg-white/95 dark:bg-[#0B0F19]/95 backdrop-blur-2xl border border-slate-200/90 dark:border-white/[0.1] rounded-[1.85rem] p-6 sm:p-7 shadow-xl shadow-slate-200/50 dark:shadow-2xl dark:shadow-black/80 space-y-6">
                
                {/* Cinematic Course Preview (16:9) */}
                <div 
                  onClick={() => setIsPreviewOpen(true)}
                  className="relative w-full aspect-video bg-gradient-to-br from-[#13192B] via-[#0E1322] to-[#080B14] rounded-2xl overflow-hidden group cursor-pointer border border-slate-700/50 dark:border-white/[0.08] flex items-center justify-center shadow-inner"
                >
                  <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(147,51,234,0.18),transparent_70%)]" />
                  <Cpu className="w-24 h-24 text-purple-400/20 group-hover:text-purple-400/35 group-hover:scale-105 transition-all duration-700" />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/5 transition-colors" />
                  
                  {/* Media Control Play Button */}
                  <div className="w-14 h-14 rounded-full bg-white/10 backdrop-blur-md border border-white/25 flex items-center justify-center shadow-xl group-hover:scale-110 group-hover:bg-white/20 group-hover:border-white/40 transition-all z-10">
                    <Play className="w-5 h-5 text-white fill-white ml-0.5" />
                  </div>
                  
                  <span className="absolute bottom-3 left-3 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 bg-black/60 backdrop-blur-md rounded-lg text-slate-200 border border-white/[0.1] flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Preview Course
                  </span>
                </div>

                {/* Price Presentation */}
                <div className="space-y-1">
                  <div className="flex items-baseline gap-3">
                    <span className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white font-mono tracking-tight">
                      ₹{course.price.toLocaleString()}
                    </span>
                    {course.originalPrice && (
                      <span className="text-sm sm:text-base font-semibold text-slate-400 line-through opacity-70">
                        ₹{course.originalPrice.toLocaleString()}
                      </span>
                    )}
                    <span className="px-2.5 py-0.5 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-[11px] font-bold rounded-md border border-emerald-500/20">
                      35% OFF
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Inclusive of all taxes and continuous curriculum updates</p>
                </div>

                {/* State-Driven Purchase / Start Learning CTA */}
                {enrolled ? (
                  <div className="space-y-3 pt-1">
                    <div className="w-full py-2.5 px-4 bg-emerald-500/10 border border-emerald-500/25 rounded-xl text-center text-xs font-bold text-emerald-700 dark:text-emerald-300 flex items-center justify-center gap-2 shadow-xs">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      <span>Course Purchased & Access Unlocked</span>
                    </div>

                    <Link
                      href={`/learn/${course.id}`}
                      className="w-full py-3.5 px-6 bg-gradient-to-r from-purple-600 via-indigo-600 to-sky-600 hover:from-purple-500 hover:via-indigo-500 hover:to-sky-500 text-white font-black text-xs sm:text-sm uppercase tracking-wider rounded-xl text-center flex items-center justify-center gap-2 shadow-lg shadow-purple-900/30 hover:shadow-purple-700/40 transition-all cursor-pointer group"
                    >
                      <span>Start Learning</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-2.5 pt-1">
                    <button
                      onClick={handleBuyNow}
                      className="w-full py-3.5 px-6 bg-gradient-to-r from-purple-600 via-indigo-600 to-sky-600 hover:from-purple-500 hover:via-indigo-500 hover:to-sky-500 text-white font-black text-xs sm:text-sm uppercase tracking-wider rounded-xl text-center flex items-center justify-center gap-2 shadow-lg shadow-purple-900/30 hover:shadow-purple-700/40 transition-all cursor-pointer group"
                    >
                      <span>Enroll & Unlock Access</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                    
                    <button
                      onClick={handleAddToCart}
                      disabled={inCart}
                      className={`w-full py-2.5 px-6 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                        inCart
                          ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-400 cursor-default"
                          : "bg-slate-100 hover:bg-slate-200/80 dark:bg-white/[0.03] dark:hover:bg-white/[0.06] border-slate-200 dark:border-white/[0.08] text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white"
                      }`}
                    >
                      {inCart ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                          <span>Added to Cart</span>
                        </>
                      ) : (
                        <>
                          <ShoppingCart className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                          <span>Add to Cart</span>
                        </>
                      )}
                    </button>
                  </div>
                )}

                {/* Purchase Benefits Checklist */}
                <div className="pt-4 border-t border-slate-200/80 dark:border-white/[0.08] space-y-2.5">
                  <p className="text-slate-700 dark:text-slate-300 font-bold text-xs uppercase tracking-wider mb-3">
                    This Course Includes:
                  </p>
                  
                  {[
                    "Lifetime Unlimited Access",
                    `${course.projects.length} Real-World Capstone Projects`,
                    "24/7 AI Tutor Support",
                    "Verified Certificate of Completion",
                    "Source Code & Jupyter Notebooks",
                    "Discord Developer Community"
                  ].map((benefit, idx) => (
                    <div key={idx} className="flex items-center gap-2.5 text-xs text-slate-600 dark:text-slate-300 font-medium">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      <span>{benefit}</span>
                    </div>
                  ))}
                </div>

              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          2. SECTION 1: WHAT YOU'LL LEARN (6 SUBSTANTIAL CARDS)
          ───────────────────────────────────────────────────────────── */}
      <section className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 border-b border-border/80 dark:border-white/[0.06]">
        <div className="space-y-6 sm:space-y-8">
          
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-700 dark:text-purple-400 border border-purple-500/20">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                What You&apos;ll Learn
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Core competencies and enterprise skillsets you will master in this program
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {course.learningOutcomes.map((item, idx) => {
              const IconComp = item.icon;
              return (
                <div 
                  key={idx} 
                  className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-white/[0.02] hover:bg-slate-50/80 dark:hover:bg-white/[0.04] border border-slate-200/90 dark:border-white/[0.06] hover:border-purple-500/30 dark:hover:border-purple-500/30 shadow-xs hover:shadow-sm transition-all duration-300 flex flex-col justify-between group"
                >
                  <div className="space-y-3">
                    <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-600 dark:text-purple-400 group-hover:text-purple-700 dark:group-hover:text-purple-300 transition-colors">
                      <IconComp className="w-4 h-4" />
                    </div>
                    <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white group-hover:text-purple-700 dark:group-hover:text-purple-200 transition-colors leading-snug">
                      {item.title}
                    </h3>
                    <p className="text-xs sm:text-[13px] text-slate-600 dark:text-slate-400 leading-relaxed font-normal">
                      {item.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          3. SECTION 2: COURSE CURRICULUM (DEVELOPER DOCS ACCORDION)
          ───────────────────────────────────────────────────────────── */}
      <section className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 border-b border-border/80 dark:border-white/[0.06]">
        <div className="space-y-6 sm:space-y-8">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/80 dark:border-white/[0.06] pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-sky-500/10 text-sky-700 dark:text-sky-400 border border-sky-500/20">
                <BookOpen className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                  Course Curriculum
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Step-by-step masterclass lectures, live code exercises, and deep-dive architectural breakdowns
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider bg-slate-100 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.06] px-3.5 py-1.5 rounded-xl">
              <span>{course.modules.length} Modules</span>
              <span>•</span>
              <span>{totalLessons} Lessons</span>
              <span>•</span>
              <span className="text-emerald-600 dark:text-emerald-400">{course.duration}</span>
            </div>
          </div>

          <div className="space-y-3.5">
            {course.modules.map((mod, i) => {
              const isOpen = openModule === i;
              const isModuleLocked = !enrolled && !mod.preview;

              return (
                <div 
                  key={i} 
                  className="bg-white dark:bg-white/[0.02] border border-slate-200/90 dark:border-white/[0.06] hover:border-slate-300 dark:hover:border-white/[0.1] shadow-xs rounded-2xl overflow-hidden transition-all"
                >
                  <button
                    onClick={() => setOpenModule(isOpen ? null : i)}
                    className="w-full p-4 sm:p-5 flex items-center justify-between text-left hover:bg-slate-50/70 dark:hover:bg-white/[0.02] transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center font-mono font-black text-xs sm:text-sm text-purple-700 dark:text-purple-300 shrink-0">
                        {mod.number}
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base">{mod.title}</h3>
                        <p className="text-[11px] sm:text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5">
                          {mod.lessonsCount} Lessons • {mod.duration}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {mod.preview && !enrolled && (
                        <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-md bg-purple-500/15 text-purple-700 dark:text-purple-300 text-[10px] font-bold uppercase tracking-wider border border-purple-500/25">
                          Free Preview
                        </span>
                      )}
                      {isModuleLocked && (
                        <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-md bg-slate-100 dark:bg-white/[0.04] text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-wider border border-slate-200 dark:border-white/[0.08]">
                          Locked 🔒
                        </span>
                      )}
                      {isOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                    </div>
                  </button>

                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="px-4 sm:px-5 pb-4 pt-1 border-t border-slate-100 dark:border-white/[0.04] space-y-1.5 bg-slate-50/80 dark:bg-black/25"
                      >
                        {mod.lessons.map((lesson, lIdx) => (
                          <div 
                            key={lIdx} 
                            className="flex items-center justify-between text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 py-2.5 px-3 rounded-xl hover:bg-slate-100/80 dark:hover:bg-white/[0.03] transition-colors"
                          >
                            <span className="flex items-center gap-3 text-slate-800 dark:text-slate-200">
                              <Play className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400 shrink-0" />
                              <span>{lesson.title}</span>
                            </span>
                            
                            <div className="flex items-center gap-3 shrink-0">
                              <span className="font-mono text-xs text-slate-400">{lesson.duration}</span>
                              {lesson.preview || enrolled ? (
                                <button 
                                  onClick={() => setIsPreviewOpen(true)}
                                  className="text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 text-[11px] font-bold uppercase cursor-pointer"
                                >
                                  Play
                                </button>
                              ) : (
                                <Lock className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 shrink-0" />
                              )}
                            </div>
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
      </section>

      {/* ─────────────────────────────────────────────────────────────
          4. SECTION 3: REAL-WORLD PROJECTS (4 RICH COMPOSITIONS)
          ───────────────────────────────────────────────────────────── */}
      <section className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 border-b border-border/80 dark:border-white/[0.06]">
        <div className="space-y-6 sm:space-y-8">
          
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
              <Code2 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                Real-World Projects Included
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Production portfolio projects you will build, test, and deploy to master {course.title}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {course.projects.map((proj, pIdx) => (
              <div 
                key={pIdx} 
                className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-white/[0.02] border border-slate-200/90 dark:border-white/[0.06] hover:border-purple-500/30 dark:hover:border-purple-500/30 shadow-xs hover:shadow-sm flex flex-col justify-between transition-all group relative overflow-hidden"
              >
                {/* Subtle abstract ambient glow behind project number */}
                <div className="absolute top-0 right-0 w-28 h-28 bg-purple-500/[0.04] dark:bg-purple-500/[0.05] rounded-full blur-2xl pointer-events-none" />

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-sky-600 dark:from-purple-400 dark:to-sky-400">
                      {proj.number}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-white/[0.04] text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-white/[0.06]">
                      Capstone Project
                    </span>
                  </div>

                  <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white group-hover:text-purple-700 dark:group-hover:text-purple-200 transition-colors">
                    {proj.title}
                  </h3>

                  <p className="text-xs sm:text-[13px] font-normal text-slate-600 dark:text-slate-400 leading-relaxed">
                    {proj.desc}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2 pt-4 mt-4 border-t border-slate-100 dark:border-white/[0.05]">
                  {proj.tech.map((t, tIdx) => (
                    <span 
                      key={tIdx} 
                      className="px-2.5 py-0.5 bg-slate-100 dark:bg-white/[0.03] rounded text-[10px] sm:text-[11px] font-semibold text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-white/[0.06]"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          5. SECTION 4: FREQUENTLY ASKED QUESTIONS (2-COLUMN GRID)
          ───────────────────────────────────────────────────────────── */}
      <section className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        <div className="space-y-6 sm:space-y-8">
          
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-700 dark:text-purple-400 border border-purple-500/20">
              <HelpCircle className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                Frequently Asked Questions
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Everything you need to know about curriculum access, project requirements, and certification
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
            {course.faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div 
                  key={idx} 
                  className="bg-white dark:bg-white/[0.02] border border-slate-200/90 dark:border-white/[0.06] hover:border-slate-300 dark:hover:border-white/[0.1] shadow-xs rounded-2xl overflow-hidden transition-all"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full p-4 sm:p-5 flex items-center justify-between text-left font-bold text-sm sm:text-base text-slate-900 dark:text-white hover:bg-slate-50/70 dark:hover:bg-white/[0.02] transition-colors cursor-pointer gap-4"
                  >
                    <span>{faq.q}</span>
                    {isOpen ? <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" /> : <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />}
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 text-xs sm:text-sm font-normal text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-100 dark:border-white/[0.04] pt-3">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          6. STICKY FLOATING PURCHASE BAR (DESKTOP & MOBILE)
          ───────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {showStickyBar && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed bottom-0 inset-x-0 z-40 bg-white/95 dark:bg-[#0B0F19]/95 backdrop-blur-xl border-t border-slate-200 dark:border-white/[0.1] py-3.5 px-4 sm:px-8 shadow-xl dark:shadow-2xl"
          >
            <div className="max-w-[1360px] mx-auto flex items-center justify-between gap-4">
              <div className="hidden sm:block">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">{course.title}</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">{course.description}</p>
              </div>

              <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                <div className="text-left sm:text-right">
                  <div className="text-lg sm:text-xl font-black text-slate-900 dark:text-white font-mono">
                    ₹{course.price.toLocaleString()}
                  </div>
                  <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">35% OFF · LIFETIME ACCESS</div>
                </div>

                {enrolled ? (
                  <Link
                    href={`/learn/${course.id}`}
                    className="px-6 py-2.5 bg-gradient-to-r from-purple-600 via-indigo-600 to-sky-600 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg hover:shadow-purple-700/40 transition-all"
                  >
                    Start Learning →
                  </Link>
                ) : (
                  <button
                    onClick={handleBuyNow}
                    className="px-6 py-2.5 bg-gradient-to-r from-purple-600 via-indigo-600 to-sky-600 hover:from-purple-500 hover:via-indigo-500 hover:to-sky-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg hover:shadow-purple-700/40 transition-all cursor-pointer"
                  >
                    Enroll Now →
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─────────────────────────────────────────────────────────────
          7. VIDEO PREVIEW MODAL
          ───────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {isPreviewOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-[#0D121F] border border-slate-200 dark:border-white/[0.1] rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl relative text-slate-900 dark:text-white"
            >
              {/* Modal Header */}
              <div className="p-5 border-b border-slate-200/80 dark:border-white/[0.08] flex items-center justify-between bg-slate-50 dark:bg-white/[0.02]">
                <div className="flex items-center gap-2.5">
                  <Play className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">{course.title} · Course Preview</h3>
                </div>
                <button
                  onClick={() => setIsPreviewOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.08] transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Video Player Area */}
              <div className="relative aspect-video bg-black flex items-center justify-center">
                <div className="absolute inset-0 bg-gradient-to-tr from-purple-900/30 to-sky-900/20" />
                <div className="text-center space-y-3 z-10 px-6">
                  <div className="w-16 h-16 rounded-full bg-purple-600/30 border border-purple-500/50 flex items-center justify-center mx-auto shadow-lg">
                    <Play className="w-7 h-7 text-purple-300 fill-purple-300 ml-1" />
                  </div>
                  <h4 className="text-base font-bold text-white">Lesson 1.1: {course.modules[0]?.lessons[0]?.title || "Introduction"}</h4>
                  <p className="text-xs text-slate-400 max-w-md mx-auto">
                    Full sample lesson unlocked. Enroll to access all {totalLessons} HD video lessons, downloadable code, and capstone labs.
                  </p>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-4 border-t border-slate-200/80 dark:border-white/[0.08] bg-slate-50 dark:bg-white/[0.02] flex items-center justify-between">
                <span className="text-xs text-slate-500 dark:text-slate-400">Duration: 14m 20s · 1080p Full HD</span>
                <button
                  onClick={() => {
                    setIsPreviewOpen(false);
                    handleBuyNow();
                  }}
                  className="px-5 py-2 bg-gradient-to-r from-purple-600 via-indigo-600 to-sky-600 hover:from-purple-500 hover:via-indigo-500 hover:to-sky-500 text-white font-bold text-xs rounded-xl transition-all shadow-md cursor-pointer"
                >
                  Enroll Now (₹{course.price.toLocaleString()})
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
