"use client";

import { useEffect, useState } from "react";
import {
  BookOpen, Award, Clock, PlayCircle, Users, Activity,
  CheckCircle, Video, GraduationCap, Download, Share2,
  ArrowRight, Calendar, Tv, Trophy, Sparkles, XCircle, FileText
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface LiveCourse {
  id: string;
  title: string;
  instructor: string;
  batchName: string;
  nextClass: {
    id: string;
    title: string;
    date: string;
    meetingLink: string;
  } | null;
  totalClasses: number;
}

interface SelfPacedCourse {
  id: string;
  title: string;
  instructor: string;
  progress: number;
  totalLectures: number;
  completedLectures: number;
  lastWatchedLecture: string | null;
  status: string;
}

interface CertificateData {
  id: string;
  courseId: string;
  courseTitle: string;
  instructor: string;
  issueDate: string;
  certificateUrl: string | null;
}

export default function StudentDashboard() {
  const [liveCourses, setLiveCourses] = useState<LiveCourse[]>([]);
  const [selfPaced, setSelfPaced] = useState<SelfPacedCourse[]>([]);
  const [certificates, setCertificates] = useState<CertificateData[]>([]);
  const [stats, setStats] = useState({ total: 0, inProgress: 0, completed: 0 });
  const [loading, setLoading] = useState(true);
  const [isCertModalOpen, setIsCertModalOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [dashRes, liveRes, spRes, certRes] = await Promise.all([
          fetch("/api/student/dashboard"),
          fetch("/api/student/live-courses"),
          fetch("/api/student/self-paced"),
          fetch("/api/student/certificates"),
        ]);

        if (dashRes.status === 401 || dashRes.status === 403) {
          router.push("/login");
          return;
        }

        const [dashData, liveData, spData, certData] = await Promise.all([
          dashRes.json(),
          liveRes.json(),
          spRes.json(),
          certRes.json(),
        ]);

        setStats(dashData.stats || { total: 0, inProgress: 0, completed: 0 });
        setLiveCourses(liveData.courses || []);
        setSelfPaced(spData.courses || []);
        setCertificates(certData.certificates || []);
      } catch {
        /* silent */
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [router]);

  if (loading) {
    return (
      <div className="w-full min-h-screen py-20 flex flex-col items-center justify-center">
        <Activity className="w-10 h-10 text-primary animate-spin mb-4" />
        <p className="text-subtext font-bold">Synchronizing your dashboard...</p>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen py-12 px-6">
      <div className="max-w-7xl mx-auto space-y-14">

        {/* ───────── Header & Stats ───────── */}
        <section>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-xl bg-primary/10">
              <GraduationCap className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h1 className="text-4xl font-extrabold text-text">
                Student <span className="text-primary">Portal</span>
              </h1>
              <p className="text-subtext">Welcome back. Let's pick up right where you left off.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
            {[
              { label: "Enrolled Courses", value: stats.total, icon: BookOpen, color: "text-primary", bg: "bg-primary/10" },
              { label: "In Progress", value: stats.inProgress, icon: Clock, color: "text-amber-500", bg: "bg-amber-500/10" },
              { label: "Completed", value: stats.completed, icon: Award, color: "text-emerald-500", bg: "bg-emerald-500/10" },
              { label: "Certificates Earned", value: certificates.length, icon: Trophy, color: "text-purple-500", bg: "bg-purple-500/10", clickable: true, onClick: () => setIsCertModalOpen(true) },
            ].map((stat, i) => (
              <div 
                key={i} 
                onClick={stat.onClick}
                className={`bg-card border border-card rounded-3xl p-6 shadow-xl relative overflow-hidden group transition-all ${stat.clickable ? 'cursor-pointer hover:scale-105 hover:shadow-purple-500/20 hover:border-purple-500/30 ring-2 ring-transparent hover:ring-purple-500/20' : 'hover:-translate-y-1'}`}
              >
                <div className={`absolute -right-4 -top-4 w-24 h-24 rounded-full ${stat.bg} blur-2xl pointer-events-none group-hover:scale-110 transition-transform`} />
                <div className="flex items-center justify-between relative z-10 mb-4">
                  <span className="text-subtext font-bold text-sm tracking-wide uppercase">{stat.label}</span>
                  <div className={`p-3 rounded-2xl ${stat.bg}`}>
                    <stat.icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                </div>
                <span className="text-4xl font-black text-text relative z-10">{stat.value}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ───────── ⏱️ Upcoming Live Classes Section ───────── */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-orange-500/10">
                <Clock className="w-6 h-6 text-orange-500" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-text">Upcoming Live Classes</h2>
                <p className="text-subtext text-sm">Your scheduled sessions for the next 7 days</p>
              </div>
            </div>
            <Link href="/calendar" className="hidden sm:flex items-center gap-2 text-sm font-bold text-orange-500 hover:text-orange-600 transition-colors bg-orange-500/10 px-4 py-2 rounded-xl">
              View Calendar <Calendar className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 border border-card bg-card/30 p-4 rounded-3xl shadow-inner">
            {liveCourses.filter(c => c.nextClass).length === 0 ? (
              <div className="col-span-full py-10 flex flex-col items-center justify-center text-center">
                <Calendar className="w-10 h-10 text-subtext/30 mb-3" />
                <p className="font-bold text-text">No upcoming classes scheduled</p>
                <p className="text-sm text-subtext">You have no live sessions scheduled in the upcoming days.</p>
              </div>
            ) : liveCourses
                .filter(course => course.nextClass)
                .sort((a, b) => new Date(a.nextClass!.date).getTime() - new Date(b.nextClass!.date).getTime())
                .map(course => (
              <div key={course.id} className="bg-background border border-card rounded-2xl p-5 flex flex-col sm:flex-row gap-5 items-start sm:items-center hover:border-orange-500/30 transition-colors shadow-sm">
                <div className="min-w-[80px] h-20 rounded-xl bg-orange-500/10 border border-orange-500/20 flex flex-col items-center justify-center text-orange-600">
                  <span className="text-xs font-bold uppercase">{new Date(course.nextClass!.date).toLocaleString('en-US', { month: 'short' })}</span>
                  <span className="text-2xl font-black leading-none my-0.5">{new Date(course.nextClass!.date).toLocaleString('en-US', { day: '2-digit' })}</span>
                  <span className="text-[10px] font-bold">{new Date(course.nextClass!.date).toLocaleString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-text truncate pr-4 text-lg">{course.nextClass!.title || "Live Session"}</h4>
                  <p className="text-sm text-subtext truncate flex items-center gap-1.5 mt-1 border-b border-card pb-2 mb-2">
                    <Tv className="w-3.5 h-3.5" /> Course: {course.title}
                  </p>
                  <p className="text-xs font-semibold text-text flex items-center gap-1.5 opacity-80">
                    <Users className="w-3.5 h-3.5" /> Instructor: {course.instructor}
                  </p>
                </div>
                <a href={course.nextClass!.meetingLink} target="_blank" rel="noreferrer" className="w-full sm:w-auto px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-sm font-bold flex flex-shrink-0 items-center justify-center gap-2 shadow-lg shadow-orange-500/20 transition-all active:scale-95">
                  <Video className="w-4 h-4" /> Join Class
                </a>
              </div>
            ))}
          </div>
        </section>

        {/* ───────── 📘 Self-Paced Learning Section ───────── */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 rounded-xl bg-primary/10">
              <BookOpen className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-text">Self-Paced Learning</h2>
              <p className="text-subtext text-sm">Learn at your own pace with video courses</p>
            </div>
          </div>

          {selfPaced.length === 0 ? (
            <div className="w-full py-16 border-2 border-dashed border-card rounded-3xl flex flex-col items-center justify-center bg-card/20">
              <BookOpen className="w-12 h-12 text-subtext/30 mb-4" />
              <p className="text-text font-bold text-lg">No self-paced courses enrolled</p>
              <p className="text-subtext text-sm mt-1 mb-4">Browse video-based courses you can complete at your own schedule.</p>
              <Link href="/courses" className="px-6 py-2.5 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl shadow-lg transition-colors text-sm flex items-center gap-2">
                Browse Courses <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {selfPaced.map((course) => (
                <div key={course.id} className="bg-card border border-card rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all group flex flex-col">
                  {/* Gradient Thumbnail */}
                  <div className="h-40 relative overflow-hidden p-5 flex items-end bg-gradient-to-tr from-primary/20 to-accent/10">
                    <div className="absolute inset-0 bg-gradient-to-tr from-primary/30 to-accent/20 mix-blend-overlay group-hover:scale-105 transition-transform duration-500" />
                    {course.status === "COMPLETED" && (
                      <div className="absolute top-4 right-4 bg-emerald-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 z-10">
                        <CheckCircle className="w-3 h-3" /> Completed
                      </div>
                    )}
                  </div>

                  <div className="p-6 flex flex-col flex-1">
                    <h3 className="font-bold text-xl text-text mb-2 line-clamp-2">{course.title}</h3>
                    <p className="text-subtext text-sm mb-1 flex items-center gap-2">
                      <Users className="w-4 h-4" /> By {course.instructor}
                    </p>

                    {course.lastWatchedLecture && (
                      <p className="text-xs text-primary/80 font-medium mt-1 mb-3 flex items-center gap-1.5 truncate">
                        <Sparkles className="w-3.5 h-3.5" /> Last: {course.lastWatchedLecture}
                      </p>
                    )}

                    {/* Progress Bar */}
                    <div className="mt-auto mb-5">
                      <div className="flex justify-between text-xs font-bold mb-2">
                        <span className={course.progress === 100 ? "text-emerald-500 flex items-center gap-1" : "text-subtext"}>
                          {course.progress === 100 ? (
                            <><CheckCircle className="w-3 h-3" /> Complete</>
                          ) : (
                            `${course.completedLectures}/${course.totalLectures} lectures`
                          )}
                        </span>
                        <span className="text-text">{course.progress}%</span>
                      </div>
                      <div className="w-full h-2.5 bg-background rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-1000 ${course.progress === 100 ? "bg-emerald-500" : "bg-gradient-to-r from-primary to-accent"}`}
                          style={{ width: `${course.progress}%` }}
                        />
                      </div>
                    </div>

                    <Link href={`/learn/${course.id}`} className="w-full">
                      <button className="w-full py-3 bg-background hover:bg-primary hover:text-white border border-card group-hover:border-primary/30 text-text rounded-xl font-bold transition-all flex items-center justify-center gap-2 h-12">
                        <PlayCircle className="w-5 h-5" />
                        {course.progress === 0 ? "Start Learning" : course.progress === 100 ? "Review Material" : "Continue Learning"}
                      </button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ───────── 🧑‍🏫 Instructor-Led Courses Section ───────── */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 rounded-xl bg-purple-500/10">
              <Users className="w-6 h-6 text-purple-500" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-text">Instructor-Led Courses</h2>
              <p className="text-subtext text-sm">Courses with scheduled live sessions and batch cohorts</p>
            </div>
          </div>

          {liveCourses.length === 0 ? (
            <div className="w-full py-16 border-2 border-dashed border-card rounded-3xl flex flex-col items-center justify-center bg-card/20">
              <Tv className="w-12 h-12 text-subtext/30 mb-4" />
              <p className="text-text font-bold text-lg">No instructor-led courses enrolled</p>
              <p className="text-subtext text-sm mt-1 mb-4">Join an instructor-led batch to access live sessions.</p>
              <Link href="/courses" className="px-6 py-2.5 bg-purple-500 hover:bg-purple-600 text-white font-bold rounded-xl shadow-lg transition-colors text-sm flex items-center gap-2">
                Browse Live Courses <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {liveCourses.map((course) => (
                <div key={course.id} className="bg-gradient-to-br from-card to-card border border-purple-500/20 rounded-3xl p-6 shadow-xl relative overflow-hidden group hover:-translate-y-1 transition-all hover:shadow-purple-500/5">
                  <div className="absolute -right-10 -top-10 w-32 h-32 bg-purple-500/10 blur-[50px] -z-10 group-hover:bg-purple-500/20 transition-colors" />
                  
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-2.5 bg-purple-500/10 rounded-xl">
                      <Tv className="w-5 h-5 text-purple-500" />
                    </div>
                  </div>

                  <h3 className="font-bold text-text text-xl mb-2 line-clamp-2">{course.title}</h3>
                  
                  <div className="flex items-center gap-2 text-subtext text-sm mb-5 font-medium">
                    <Users className="w-4 h-4" />
                    Instructor: <span className="text-text font-semibold">{course.instructor}</span>
                  </div>

                  <div className="space-y-3 mb-6 p-4 bg-background/50 rounded-2xl border border-card">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2 text-subtext">
                        <Calendar className="w-4 h-4" />
                        <span>Schedule Batch</span>
                      </div>
                      <span className="font-bold text-text">{course.batchName}</span>
                    </div>
                    
                    <div className="h-px w-full bg-card" />
                    
                    {course.nextClass ? (
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2 text-subtext">
                          <Clock className="w-4 h-4 text-purple-500" />
                          <span>Upcoming</span>
                        </div>
                        <span className="font-bold text-purple-500 text-xs">
                          {new Date(course.nextClass.date).toLocaleString([], { weekday: "short", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                    ) : (
                      <div className="text-center text-sm font-medium text-subtext">
                        No upcoming sessions
                      </div>
                    )}
                  </div>

                  {course.nextClass ? (
                    <a
                      href={course.nextClass.meetingLink}
                      target="_blank"
                      rel="noreferrer"
                      className="w-full py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-purple-500/20"
                    >
                      Join Live Session <Video className="w-4 h-4" />
                    </a>
                  ) : (
                    <button className="w-full py-3 bg-card border border-card rounded-xl text-sm font-medium text-subtext flex items-center justify-center cursor-not-allowed">
                      Waiting for schedule
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

      </div>

      {/* Certificates Modal */}
      {isCertModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md animate-in fade-in duration-200" onClick={() => setIsCertModalOpen(false)}>
          <div className="bg-card w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden border border-card animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
            <div className="p-6 flex justify-between items-center border-b border-card bg-background/50">
              <div>
                <h3 className="text-2xl font-bold flex items-center gap-2 text-text">
                  <Trophy className="w-6 h-6 text-purple-500" /> My Certificates
                </h3>
                <p className="text-sm text-subtext mt-1">Credentials earned from completed courses</p>
              </div>
              <button onClick={() => setIsCertModalOpen(false)} className="p-2 hover:bg-background rounded-full text-subtext hover:text-text transition-colors border border-transparent hover:border-card">
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 max-h-[60vh] overflow-y-auto grid sm:grid-cols-2 gap-6 bg-background/20">
              {certificates.length === 0 ? (
                <div className="col-span-full py-16 flex flex-col items-center text-center text-subtext">
                  <GraduationCap className="w-16 h-16 mb-4 opacity-20 text-purple-500"/>
                  <h4 className="text-lg font-bold text-text">No certificates yet</h4>
                  <p className="text-sm mt-1 max-w-xs">Complete your enrolled courses to unlock beautifully crafted certificates.</p>
                </div>
              ) : certificates.map((cert) => (
                 <div key={cert.id} className="border border-card rounded-2xl p-5 bg-card flex flex-col gap-4 group hover:border-purple-500/30 transition-all shadow-md hover:shadow-xl hover:shadow-purple-500/5 relative overflow-hidden">
                   <div className="absolute -right-6 -top-6 w-24 h-24 bg-purple-500/10 blur-2xl rounded-full pointer-events-none group-hover:bg-purple-500/20 transition-colors" />
                   {/* Thumbnail */}
                   <div className="w-full h-36 bg-gradient-to-br from-purple-100 to-purple-50 dark:from-purple-900/20 dark:to-purple-800/10 rounded-xl border border-purple-200 dark:border-purple-700/30 flex flex-col items-center justify-center relative overflow-hidden group-hover:scale-[1.02] transition-transform">
                     <GraduationCap className="w-10 h-10 text-purple-500/50 mb-2" />
                     <div className="text-[10px] font-black text-purple-700 dark:text-purple-300 uppercase tracking-[0.2em]">Certificate of Completion</div>
                     <div className="text-xs font-semibold text-purple-800 dark:text-purple-200 mt-1 truncate px-4 max-w-full italic">{cert.courseTitle}</div>
                   </div>
                   <div className="space-y-1 z-10">
                     <h4 className="font-bold text-text text-sm line-clamp-1" title={cert.courseTitle}>{cert.courseTitle}</h4>
                     <p className="text-xs text-subtext flex items-center justify-between">
                       <span>Issued: {new Date(cert.issueDate).toLocaleDateString(undefined, {month: 'short', day: 'numeric', year: 'numeric'})}</span>
                     </p>
                   </div>
                   <button className="w-full mt-auto flex items-center justify-center gap-2 py-2.5 bg-background border border-card hover:bg-purple-500 hover:border-purple-500 hover:text-white text-text rounded-xl text-sm font-bold transition-all z-10">
                     <FileText className="w-4 h-4" /> Download PDF
                   </button>
                 </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
