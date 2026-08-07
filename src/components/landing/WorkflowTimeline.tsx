"use client";

import { motion } from "framer-motion";
import { useRef } from "react";
import { 
  Laptop, 
  Video, 
  Search, 
  Brain, 
  Terminal, 
  Award, 
  CalendarCheck, 
  Users, 
  UserCheck, 
  Briefcase, 
  CheckCircle2, 
  ArrowRight,
  Sparkles
} from "lucide-react";
import Link from "next/link";

export default function WorkflowTimeline() {
  const ref = useRef<HTMLDivElement>(null);

  const selfPacedSteps = [
    {
      num: "01",
      title: "Browse & Enroll",
      desc: "Choose your specialized AI path and unlock HD video curriculums + browser code sandboxes.",
      icon: <Search className="w-5 h-5 text-purple-400" />
    },
    {
      num: "02",
      title: "Complete Course & Capstone Code",
      desc: "Finish 100% of course modules and build production-grade capstone projects for your portfolio.",
      icon: <Terminal className="w-5 h-5 text-purple-400" />
    },
    {
      num: "03",
      title: "Pass Internal Technical Interview",
      desc: "Give a 1-on-1 technical assessment & portfolio teardown interview with senior AI architects.",
      icon: <UserCheck className="w-5 h-5 text-amber-400" />
    },
    {
      num: "04",
      title: "Guaranteed Internship Allocation",
      desc: "Get allocated to a guaranteed real-world client internship according to your interview performance.",
      icon: <Briefcase className="w-5 h-5 text-emerald-400" />
    },
    {
      num: "05",
      title: "Earn Verified Certification",
      desc: "Receive an industry-ready, cryptographically verified AI Engineer certificate for your resume.",
      icon: <Award className="w-5 h-5 text-cyan-400" />
    }
  ];

  const liveCohortSteps = [
    {
      num: "01",
      title: "Apply for Live Cohort",
      desc: "Reserve your seat in upcoming live interactive cohorts led by FAANG lead instructors.",
      icon: <CalendarCheck className="w-5 h-5 text-emerald-400" />
    },
    {
      num: "02",
      title: "Attend Classes & Build Projects",
      desc: "Participate in live code-along workshops and ship 6+ production AI applications to GitHub.",
      icon: <Users className="w-5 h-5 text-emerald-400" />
    },
    {
      num: "03",
      title: "Give Technical Assessment Interview",
      desc: "Complete 100% course code and give your 1-on-1 technical mock interview with senior mentors.",
      icon: <UserCheck className="w-5 h-5 text-amber-400" />
    },
    {
      num: "04",
      title: "Guaranteed Internship Placement",
      desc: "Land your guaranteed client internship placement allocated based on your interview score.",
      icon: <Briefcase className="w-5 h-5 text-purple-400" />
    },
    {
      num: "05",
      title: "Corporate Placement & Referrals",
      desc: "Get direct referral pushes and introductions to top tech hiring partners seeking AI talent.",
      icon: <Sparkles className="w-5 h-5 text-cyan-400" />
    }
  ];

  return (
    <section className="w-full py-8 md:py-10 bg-background text-text relative selection:bg-purple-500/30 overflow-hidden" ref={ref}>
      {/* Background Ambient Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-purple-600/10 blur-[180px] rounded-full pointer-events-none z-0" />

      <div className="max-w-[1650px] mx-auto px-6 sm:px-10 relative z-10">
        
        {/* SECTION HEADER */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center max-w-3xl mx-auto mb-8"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-black uppercase tracking-wider mb-4">
            <Sparkles className="w-4 h-4" /> Two Ways to Learn
          </div>

          <h2 className="text-4xl md:text-6xl font-black text-text tracking-tight mb-6 leading-tight">
            How Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-sky-400 to-emerald-400">Learning Journey</span> Works
          </h2>

          <p className="text-lg md:text-xl text-subtext font-medium leading-relaxed">
            Choose the learning experience that fits your goals. Learn independently with AI or join expert-led live cohorts.
          </p>
        </motion.div>

        {/* DUAL PARALLEL PATHS CONTAINER */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start relative mb-16">

          {/* PATH A: SELF-PACED LEARNING */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="bg-card/70 backdrop-blur-xl border border-purple-500/30 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden flex flex-col h-full group hover:border-purple-500/50 transition-all"
          >
            {/* Header Badge & Title */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 mb-8 border-b border-card/80">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-400 shadow-lg shrink-0">
                  <Laptop className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-text">Self-Paced Courses</h3>
                  <p className="text-xs font-semibold text-purple-400 uppercase tracking-wider mt-0.5">Flexible Self-Study Path</p>
                </div>
              </div>

              <Link 
                href="/courses" 
                className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-full flex items-center gap-1.5 transition-all w-fit group-hover:scale-105 shadow-md shadow-purple-600/20"
              >
                Explore Courses <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <p className="text-sm font-medium text-subtext leading-relaxed mb-8">
              Learn anytime from anywhere with structured video lessons, 24/7 AI tutor assistance, hands-on quizzes, capstone projects, and lifetime access.
            </p>

            {/* Timeline Steps for Self-Paced */}
            <div className="relative pl-6 space-y-8 flex-1">
              {/* Vertical connecting line */}
              <div className="absolute left-[13px] top-4 bottom-4 w-0.5 bg-gradient-to-b from-purple-500/60 via-purple-500/30 to-purple-500/10 rounded-full" />

              {selfPacedSteps.map((step, idx) => (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                  className="relative flex items-start gap-4 group/step"
                >
                  {/* Step Icon Node */}
                  <div className="absolute -left-[25px] top-0 w-8 h-8 rounded-full bg-background border-2 border-purple-500 flex items-center justify-center shadow-md shrink-0 z-10 group-hover/step:scale-110 transition-transform">
                    {step.icon}
                  </div>

                  <div className="pl-6">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-black text-purple-600 dark:text-purple-400 uppercase tracking-widest">{step.num}.</span>
                      <h4 className="text-base font-black text-text">{step.title}</h4>
                    </div>
                    <p className="text-xs font-medium text-subtext leading-relaxed">{step.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* PATH B: LIVE COHORT TRAINING */}
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="bg-card/70 backdrop-blur-xl border border-emerald-500/30 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden flex flex-col h-full group hover:border-emerald-500/50 transition-all"
          >
            {/* Header Badge & Title */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 mb-8 border-b border-card/80">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-lg shrink-0">
                  <Video className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-text">Live Cohort Training</h3>
                  <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mt-0.5">Instructor-Led Batches</p>
                </div>
              </div>

              <Link 
                href="/signup" 
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-full flex items-center gap-1.5 transition-all w-fit group-hover:scale-105 shadow-md shadow-emerald-600/20"
              >
                Join Next Batch <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <p className="text-sm font-medium text-subtext leading-relaxed mb-8">
              Join instructor-led cohorts with live sessions, real-time coding workshops, 1-on-1 mentorship, placement prep, and instant live doubt solving.
            </p>

            {/* Timeline Steps for Live Training */}
            <div className="relative pl-6 space-y-8 flex-1">
              {/* Vertical connecting line */}
              <div className="absolute left-[13px] top-4 bottom-4 w-0.5 bg-gradient-to-b from-emerald-500/60 via-emerald-500/30 to-emerald-500/10 rounded-full" />

              {liveCohortSteps.map((step, idx) => (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                  className="relative flex items-start gap-4 group/step"
                >
                  {/* Step Icon Node */}
                  <div className="absolute -left-[25px] top-0 w-8 h-8 rounded-full bg-background border-2 border-emerald-500 flex items-center justify-center shadow-md shrink-0 z-10 group-hover/step:scale-110 transition-transform">
                    {step.icon}
                  </div>

                  <div className="pl-6">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-black text-emerald-400 uppercase tracking-widest">{step.num}.</span>
                      <h4 className="text-base font-black text-text">{step.title}</h4>
                    </div>
                    <p className="text-xs font-medium text-subtext leading-relaxed">{step.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

        </div>

        {/* BOTTOM MERGED DESTINATION CARD */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 30 }}
          whileInView={{ opacity: 1, scale: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="w-full bg-gradient-to-r from-purple-950/40 via-card/90 to-emerald-950/40 backdrop-blur-2xl border border-sky-500/40 rounded-3xl p-8 md:p-12 shadow-[0_0_60px_rgba(56,189,248,0.15)] text-center relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-sky-500/10 to-emerald-500/10 opacity-50 pointer-events-none" />

          <div className="max-w-3xl mx-auto relative z-10 space-y-6">
            <span className="px-4 py-1.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/30 text-xs font-black uppercase tracking-wider">
              🏆 The Destination
            </span>

            <h3 className="text-3xl md:text-5xl font-black text-text tracking-tight">
              Become a Production-Ready <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-sky-400 to-emerald-400">AI Engineer</span>
            </h3>

            <p className="text-base md:text-lg text-subtext font-medium leading-relaxed max-w-2xl mx-auto">
              Whether you learn independently or through live mentorship, you&apos;ll build production-ready projects, earn industry certifications, and become job-ready.
            </p>

            {/* Achievements checklist */}
            <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6 pt-4">
              {[
                "100% Capstone Code Completion",
                "1-on-1 Technical Interview",
                "Guaranteed Internship Allocation*",
                "Industry AI Certification",
                "Hiring Partner Referrals"
              ].map((achievement, aIdx) => (
                <div key={aIdx} className="flex items-center gap-2 px-4 py-2 bg-[#0B0F19] border border-purple-500/30 rounded-xl text-xs font-bold text-white shadow-sm">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>{achievement}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

      </div>
    </section>
  );
}
