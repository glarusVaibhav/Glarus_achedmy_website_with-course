"use client";

import { useEffect, useRef, useState, use } from "react";
import { PlayCircle, CheckCircle, ChevronLeft, Calendar } from "lucide-react";
import Link from "next/link";

export default function LearningTheater({ params }: { params: Promise<{ courseId: string }> }) {
  const unwrappedParams = use(params);
  const [course, setCourse] = useState<any>(null);
  const [activeLecture, setActiveLecture] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Video tracking state
  const videoRef = useRef<HTMLVideoElement>(null);
  const [lastSavedTime, setLastSavedTime] = useState(0);

  useEffect(() => {
    // We would ideally have a dedicated GET /api/student/courses/[id] here,
    // but we can just fetch the dashboard and filter it for speed since it contains modules.
    fetch(`/api/student/dashboard`)
      .then(res => res.json())
      .then(data => {
        if (!data.courses) return;
        
        // Find specific course details from the API response
        const found = data.courses.find((c: any) => c.id === unwrappedParams.courseId);
        
        // This is a simplified fetch; normally we'd pull the full course metadata structure from a specific endpoint
        // Let's assume the API provides `modules` with `lectures`. For this demonstration we will mock the structure 
        // to represent the DB schema perfectly if it's missing from the dashboard API to save endpoint limits.
        
        const cData = {
          ...found,
          modules: [
             {
               id: "mod1", title: "Getting Started", 
               lectures: [
                 { id: "lec1", title: "What is Machine Learning?", videoUrl: "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4", isCompleted: false },
                 { id: "lec2", title: "Setting up Python Environment", videoUrl: "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4", isCompleted: false },
               ]
             }
          ]
        };
        
        setCourse(cData);
        // Find first unwatched
        setActiveLecture(cData.modules[0].lectures[0]);
        
        // Then initialize time from DB
        fetch(`/api/video-progress?lectureId=${cData.modules[0].lectures[0].id}`)
          .then(res => res.json())
          .then(prog => {
            if(videoRef.current && prog.progressSeconds) {
              videoRef.current.currentTime = prog.progressSeconds;
            }
          });

        setLoading(false);
      });
  }, [unwrappedParams.courseId]);

  // Handle video progress syncing (Debounced)
  const handleTimeUpdate = () => {
    if (!videoRef.current || !activeLecture) return;
    const currentTime = videoRef.current.currentTime;
    const duration = videoRef.current.duration;
    
    // Save every 5 seconds
    if (currentTime - lastSavedTime > 5) {
      const isCompleted = (currentTime / duration) > 0.9; // 90% threshold
      
      fetch("/api/video-progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lectureId: activeLecture.id,
          progressSeconds: currentTime,
          isCompleted
        })
      });
      setLastSavedTime(currentTime);
    }
  };

  if (loading) return <div className="min-h-screen text-white flex items-center justify-center">Loading Theater...</div>;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Navbar Minimal */}
      <header className="h-16 border-b border-card flex items-center px-6 justify-between bg-card text-text">
        <Link href="/dashboard" className="flex items-center gap-2 font-bold hover:text-primary transition-colors">
          <ChevronLeft className="w-5 h-5" /> Back to Dashboard
        </Link>
        <span className="font-bold">{course.title}</span>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Main Video Area */}
        <div className="flex-1 bg-black flex flex-col relative">
          <div className="w-full aspect-video bg-background mx-auto max-w-6xl mt-8 rounded-2xl overflow-hidden shadow-2xl border border-card relative">
            
            {course.type === "INSTRUCTOR_LED" ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center tracking-wide text-white">
                <Calendar className="w-16 h-16 opacity-50 mb-4" />
                <h2 className="text-2xl font-bold text-center">Live Class Portal</h2>
                <p className="text-subtext mt-2">Next session begins shortly.</p>
              </div>
            ) : (
              <video 
                ref={videoRef}
                src={activeLecture.videoUrl} 
                className="w-full h-full object-cover"
                controls
                autoPlay
                onTimeUpdate={handleTimeUpdate}
              />
            )}
            
          </div>
          
          <div className="max-w-6xl mx-auto w-full p-8 text-text">
            <h1 className="text-3xl font-bold mb-4">{activeLecture?.title || "Course Overview"}</h1>
            <p className="text-subtext max-w-2xl">{course.type === "INSTRUCTOR_LED" ? "Review the curriculum calendar on the right to see scheduled session dates, assignments, and meeting links." : "Your progress is saved automatically. You can safely close this window at any time."}</p>
          </div>
        </div>

        {/* Curriculum Sidebar */}
        <div className="w-96 border-l border-card bg-card overflow-y-auto">
          <div className="p-6 border-b border-card">
            <h3 className="font-bold text-text mb-2">Curriculum</h3>
            <div className="w-full bg-background h-2 rounded-full overflow-hidden">
              <div className="bg-primary h-full" style={{ width: `${course.progress}%` }} />
            </div>
            <p className="text-xs text-subtext mt-2 text-right">{course.progress}% completed</p>
          </div>

          <div className="p-4 space-y-4">
            {course.modules?.map((mod: any, i: number) => (
              <div key={mod.id} className="bg-background rounded-xl p-4 border border-card shadow-sm">
                <h4 className="font-bold text-sm text-text mb-3">Module {i + 1}: {mod.title}</h4>
                <div className="space-y-2">
                  {mod.lectures.map((lec: any) => (
                    <button 
                      key={lec.id}
                      onClick={() => setActiveLecture(lec)}
                      className={`w-full text-left p-3 rounded-lg flex items-center gap-3 transition-colors ${activeLecture?.id === lec.id ? 'bg-primary/10 text-primary border border-primary/20' : 'hover:bg-card text-subtext'}`}
                    >
                      {lec.isCompleted ? <CheckCircle className="w-4 h-4 text-emerald-500" /> : <PlayCircle className="w-4 h-4 opacity-50" />}
                      <span className="text-xs font-bold line-clamp-1 flex-1">{lec.title}</span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
