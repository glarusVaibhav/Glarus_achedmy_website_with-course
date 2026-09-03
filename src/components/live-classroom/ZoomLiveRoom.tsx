"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  ScreenShare,
  Users,
  MessageSquare,
  PhoneOff,
  ShieldCheck,
  Radio,
  Sparkles,
  Award,
  AlertCircle,
  Copy,
  Check,
  Maximize2,
  Volume2,
  Settings,
  Send,
  UserCheck,
  Info,
  ChevronDown,
  ChevronUp,
  RefreshCw
} from "lucide-react";

interface ZoomLiveRoomProps {
  sessionId: string;
}

interface ChatMessage {
  id: string;
  sender: string;
  role: "host" | "student";
  text: string;
  timestamp: string;
}

export default function ZoomLiveRoom({ sessionId }: ZoomLiveRoomProps) {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sessionData, setSessionData] = useState<any>(null);

  // Active Role in Demo (0 = Student, 1 = Instructor)
  const [currentRole, setCurrentRole] = useState<number>(0);

  // Audio/Video/Screen UI toggles
  const [micActive, setMicActive] = useState(true);
  const [cameraActive, setCameraActive] = useState(true);
  const [screenSharing, setScreenSharing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeSidePanel, setActiveSidePanel] = useState<"participants" | "chat" | "diagnostics" | null>(null);
  const [showDiagnostics, setShowDiagnostics] = useState(false);

  // In-call Chat State
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: "1",
      sender: "Dr. Expert Instructor",
      role: "host",
      text: "Welcome to today's live workshop! Please ensure your PyTorch environment is ready.",
      timestamp: "10:01 AM"
    },
    {
      id: "2",
      sender: "Learner Student",
      role: "student",
      text: "Ready! The GPU notebook is connected.",
      timestamp: "10:02 AM"
    }
  ]);
  const [chatInput, setChatInput] = useState("");

  // Video stream preview ref
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasWebcamStream, setHasWebcamStream] = useState(false);

  // Fetch / Switch Zoom Video SDK Signature
  const fetchSignature = async (roleToRequest: number) => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch("/api/meetings/signature", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, role: roleToRequest })
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to initialize Zoom Video SDK session.");
      }

      setSessionData(data);
      setCurrentRole(data.role);
    } catch (err: any) {
      console.error("Zoom Live Room Signature Error:", err);
      setError(err.message || "Failed to connect to live classroom.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (sessionId) {
      fetchSignature(0);
    }
  }, [sessionId]);

  // Handle local webcam stream toggle
  useEffect(() => {
    let stream: MediaStream | null = null;
    if (cameraActive) {
      navigator.mediaDevices?.getUserMedia({ video: true, audio: false })
        .then((s) => {
          stream = s;
          if (videoRef.current) {
            videoRef.current.srcObject = s;
            setHasWebcamStream(true);
          }
        })
        .catch(() => {
          setHasWebcamStream(false);
        });
    } else {
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
        tracks.forEach(t => t.stop());
        videoRef.current.srcObject = null;
      }
      setHasWebcamStream(false);
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach(t => t.stop());
      }
    };
  }, [cameraActive]);

  const handleCopyMeetingId = () => {
    if (sessionData?.meeting_id) {
      navigator.clipboard.writeText(sessionData.meeting_id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const newMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: currentRole === 1 ? "Dr. Expert Instructor" : (sessionData?.userName || "Learner Student"),
      role: currentRole === 1 ? "host" : "student",
      text: chatInput.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChatMessages(prev => [...prev, newMsg]);
    setChatInput("");
  };

  const handleLeaveClass = () => {
    router.push(`/student/live-courses/live-course-genai`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#060813] text-white flex flex-col items-center justify-center p-6 text-center space-y-4 font-sans">
        <div className="w-16 h-16 rounded-full border-4 border-purple-500/20 border-t-purple-500 animate-spin" />
        <div className="space-y-1">
          <h2 className="text-xl font-black">Authorizing Zoom Video SDK Room...</h2>
          <p className="text-xs text-slate-400">Verifying session enrollment and requesting JWT signature from gateway</p>
        </div>
      </div>
    );
  }

  if (error || !sessionData) {
    return (
      <div className="min-h-screen bg-[#060813] text-white flex flex-col items-center justify-center p-6 text-center font-sans">
        <div className="p-8 max-w-md w-full rounded-3xl bg-[#0B0F19] border border-red-500/30 space-y-4 shadow-2xl">
          <div className="w-12 h-12 rounded-2xl bg-red-500/10 text-red-400 flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-black">Unable to Join Classroom</h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            {error || "Your live classroom access could not be authorized."}
          </p>
          <div className="pt-2 flex flex-col gap-2">
            <button
              onClick={() => fetchSignature(currentRole)}
              className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Retry Authorization</span>
            </button>
            <button
              onClick={() => router.back()}
              className="w-full py-2.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-slate-300 font-medium text-xs transition-all cursor-pointer"
            >
              Return to Course Schedule
            </button>
          </div>
        </div>
      </div>
    );
  }

  const isHost = currentRole === 1;

  return (
    <div className="min-h-screen bg-[#060813] text-slate-100 flex flex-col justify-between font-sans select-none overflow-hidden">
      
      {/* ───────── Top Room Header & Demo Role Switcher ───────── */}
      <header className="h-16 px-4 sm:px-6 bg-[#0B0F19]/90 border-b border-white/[0.08] backdrop-blur-md flex items-center justify-between gap-4 shrink-0 z-20">
        
        {/* Left Title & Status */}
        <div className="flex items-center gap-3 min-w-0">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse shrink-0" />
          <div className="flex items-center gap-2 truncate">
            <h1 className="text-xs sm:text-sm font-black text-white truncate max-w-xs sm:max-w-sm">
              {sessionData.sessionTitle || "Live Cohort Masterclass"}
            </h1>
            <span className={`text-[10px] sm:text-xs px-2.5 py-0.5 rounded-full font-bold uppercase font-mono shrink-0 ${
              isHost
                ? "bg-purple-500/20 text-purple-300 border border-purple-500/40"
                : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
            }`}>
              {isHost ? "👑 HOST (ROLE: 1)" : "🧑‍🎓 ATTENDEE (ROLE: 0)"}
            </span>
          </div>
        </div>

        {/* Center: Demo Mode Role Switcher */}
        <div className="hidden lg:flex items-center gap-1.5 p-1 bg-white/[0.03] border border-white/[0.08] rounded-2xl text-xs">
          <span className="text-[11px] font-bold text-slate-400 px-2 uppercase tracking-wider font-mono">Demo Role:</span>
          <button
            onClick={() => fetchSignature(1)}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1.5 text-xs ${
              isHost
                ? "bg-purple-600 text-white shadow-md shadow-purple-900/40"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <span>👑 Instructor (Host)</span>
          </button>
          <button
            onClick={() => fetchSignature(0)}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1.5 text-xs ${
              !isHost
                ? "bg-emerald-600 text-white shadow-md shadow-emerald-900/40"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <span>🧑‍🎓 Student (Attendee)</span>
          </button>
        </div>

        {/* Right Info & Diagnostics Toggle */}
        <div className="flex items-center gap-2 sm:gap-3 text-xs">
          <div className="hidden sm:flex items-center gap-2 bg-white/[0.03] border border-white/[0.08] px-3 py-1.5 rounded-xl font-mono text-[11px] text-slate-300">
            <span className="text-slate-500">Meeting ID:</span>
            <span className="text-purple-300 font-bold truncate max-w-[120px]">{sessionData.meeting_id}</span>
            <button
              onClick={handleCopyMeetingId}
              className="hover:text-white transition-colors cursor-pointer"
              title="Copy Meeting ID"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>

          <button
            onClick={() => setActiveSidePanel(activeSidePanel === "diagnostics" ? null : "diagnostics")}
            className={`p-2 rounded-xl border transition-all cursor-pointer ${
              activeSidePanel === "diagnostics"
                ? "bg-purple-600 border-purple-500 text-white"
                : "bg-white/[0.03] border-white/[0.08] text-slate-300 hover:text-white"
            }`}
            title="Session Diagnostics & Zoom Video SDK JWT Info"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* ───────── Main Stage & Side Panel Container ───────── */}
      <div className="flex-1 flex overflow-hidden relative">
        
        {/* Main Stage */}
        <main className="flex-1 p-3 sm:p-6 flex flex-col items-center justify-center relative overflow-hidden">
          <div className="w-full h-full max-w-6xl rounded-3xl bg-[#090D1A] border border-white/[0.08] shadow-2xl relative overflow-hidden flex flex-col items-center justify-center p-6 text-center">
            
            {/* Ambient Lighting */}
            <div className="absolute -top-32 -left-32 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

            {/* Video Canvas / Camera View */}
            {cameraActive && hasWebcamStream ? (
              <div className="w-full max-w-2xl h-80 rounded-2xl overflow-hidden border border-purple-500/30 relative bg-black shadow-2xl mb-4">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover -scale-x-100"
                />
                <div className="absolute bottom-3 left-3 bg-black/70 backdrop-blur-md px-3 py-1 rounded-xl text-xs font-bold text-white flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span>{isHost ? "Dr. Expert Instructor (Webcam HD)" : "Learner Student (Webcam HD)"}</span>
                </div>
              </div>
            ) : (
              <div className="relative mb-4">
                <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-full bg-gradient-to-tr from-purple-600 via-indigo-600 to-blue-600 p-1 shadow-2xl shadow-purple-900/40 animate-pulse">
                  <div className="w-full h-full rounded-full bg-[#0B0F19] flex items-center justify-center text-3xl sm:text-4xl font-black text-white">
                    {isHost ? "EI" : "LS"}
                  </div>
                </div>
                <div className="absolute bottom-1 right-1 p-2 rounded-full bg-purple-600 text-white shadow-lg">
                  <Radio className="w-4 h-4" />
                </div>
              </div>
            )}

            <div className="space-y-1.5 max-w-lg z-10">
              <h3 className="text-lg sm:text-xl font-black text-white">
                {isHost ? "Dr. Expert Instructor" : "Learner Student"} ({isHost ? "Course Host" : "Enrolled Attendee"})
              </h3>
              <p className="text-xs text-slate-400 font-medium">
                Zoom Video SDK WebRTC Audio/Video Mesh Active · WebRTC Channel Live
              </p>
            </div>

            {/* Room Symmetry Confirmation Banner */}
            <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold shadow-xs">
              <ShieldCheck className="w-4 h-4" />
              <span>Symmetric Session: Both Instructor & Student join Session Name "{sessionData.meeting_id}"</span>
            </div>

            {/* Screen sharing simulated indicator */}
            {screenSharing && (
              <div className="mt-2 px-3 py-1 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs font-mono font-bold flex items-center gap-2">
                <ScreenShare className="w-3.5 h-3.5" />
                <span>Screen Share Broadcast Active (1080p 60fps)</span>
              </div>
            )}

          </div>
        </main>

        {/* ───────── Right Slide-over Panels (Chat / Participants / Diagnostics) ───────── */}
        {activeSidePanel && (
          <aside className="w-80 sm:w-96 bg-[#0B0F19] border-l border-white/[0.08] flex flex-col z-30 animate-in slide-in-from-right duration-200">
            
            {/* Panel Header */}
            <div className="h-14 px-4 border-b border-white/[0.08] flex items-center justify-between">
              <h4 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
                {activeSidePanel === "chat" && <MessageSquare className="w-4 h-4 text-purple-400" />}
                {activeSidePanel === "participants" && <Users className="w-4 h-4 text-emerald-400" />}
                {activeSidePanel === "diagnostics" && <Settings className="w-4 h-4 text-blue-400" />}
                <span>
                  {activeSidePanel === "chat" && "In-Class Live Chat"}
                  {activeSidePanel === "participants" && "Participants (2 Online)"}
                  {activeSidePanel === "diagnostics" && "Zoom Video SDK Diagnostics"}
                </span>
              </h4>
              <button
                onClick={() => setActiveSidePanel(null)}
                className="text-slate-400 hover:text-white text-xs px-2 py-1 rounded-lg hover:bg-white/[0.05] cursor-pointer"
              >
                ✕ Close
              </button>
            </div>

            {/* Panel Body */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4">
              
              {/* CHAT TAB */}
              {activeSidePanel === "chat" && (
                <div className="h-full flex flex-col justify-between space-y-4">
                  <div className="space-y-3 flex-1 overflow-y-auto pr-1">
                    {chatMessages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`p-3 rounded-2xl text-xs space-y-1 ${
                          msg.role === "host"
                            ? "bg-purple-600/10 border border-purple-500/20 text-purple-100"
                            : "bg-white/[0.04] border border-white/[0.08] text-slate-200"
                        }`}
                      >
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="font-bold flex items-center gap-1">
                            {msg.role === "host" && <span className="text-purple-400">👑</span>}
                            {msg.sender}
                          </span>
                          <span className="text-slate-500">{msg.timestamp}</span>
                        </div>
                        <p className="text-xs leading-relaxed">{msg.text}</p>
                      </div>
                    ))}
                  </div>

                  <form onSubmit={handleSendMessage} className="flex gap-2 pt-2 border-t border-white/[0.08]">
                    <input
                      type="text"
                      placeholder="Type a message to class..."
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      className="flex-1 px-3 py-2 rounded-xl bg-white/[0.05] border border-white/[0.1] text-xs text-white focus:outline-none focus:border-purple-500"
                    />
                    <button
                      type="submit"
                      className="p-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white transition-colors cursor-pointer"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </form>
                </div>
              )}

              {/* PARTICIPANTS TAB */}
              {activeSidePanel === "participants" && (
                <div className="space-y-3">
                  <div className="p-3 rounded-2xl bg-purple-600/10 border border-purple-500/20 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center font-black text-xs text-white">
                        EI
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white flex items-center gap-1.5">
                          <span>Dr. Expert Instructor</span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-mono">HOST (role: 1)</span>
                        </div>
                        <div className="text-[10px] text-slate-400">Lead Mentor</div>
                      </div>
                    </div>
                    <Mic className="w-4 h-4 text-emerald-400" />
                  </div>

                  <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/[0.08] flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center font-black text-xs text-white">
                        LS
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white flex items-center gap-1.5">
                          <span>Learner Student</span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono">ATTENDEE (role: 0)</span>
                        </div>
                        <div className="text-[10px] text-slate-400">Enrolled Student (Present)</div>
                      </div>
                    </div>
                    <Mic className="w-4 h-4 text-emerald-400" />
                  </div>
                </div>
              )}

              {/* DIAGNOSTICS TAB */}
              {activeSidePanel === "diagnostics" && (
                <div className="space-y-3 font-mono text-[11px]">
                  <div className="p-3 rounded-2xl bg-black/40 border border-white/[0.08] space-y-2">
                    <div className="text-slate-400">SESSION_ID (DB):</div>
                    <div className="text-purple-300 font-bold break-all">{sessionId}</div>
                  </div>

                  <div className="p-3 rounded-2xl bg-black/40 border border-white/[0.08] space-y-2">
                    <div className="text-slate-400">MEETING_ID (Zoom SDK Session):</div>
                    <div className="text-emerald-300 font-bold break-all">{sessionData.meeting_id}</div>
                  </div>

                  <div className="p-3 rounded-2xl bg-black/40 border border-white/[0.08] space-y-2">
                    <div className="text-slate-400">PASSCODE (Room Password):</div>
                    <div className="text-emerald-300 font-bold">{sessionData.passcode}</div>
                  </div>

                  <div className="p-3 rounded-2xl bg-black/40 border border-white/[0.08] space-y-2">
                    <div className="text-slate-400">ROLE_TYPE:</div>
                    <div className="text-yellow-300 font-bold">
                      {sessionData.role} ({sessionData.role === 1 ? "1 = Host / Instructor" : "0 = Attendee / Student"})
                    </div>
                  </div>

                  <div className="p-3 rounded-2xl bg-black/40 border border-white/[0.08] space-y-2">
                    <div className="text-slate-400">SDK_KEY:</div>
                    <div className="text-slate-300 truncate">{sessionData.sdk_key}</div>
                  </div>

                  <div className="p-3 rounded-2xl bg-black/40 border border-white/[0.08] space-y-2">
                    <div className="text-slate-400">JWT SIGNATURE (SHA256 Token):</div>
                    <div className="text-slate-400 text-[10px] break-all max-h-24 overflow-y-auto">
                      {sessionData.signature}
                    </div>
                  </div>
                </div>
              )}

            </div>
          </aside>
        )}

      </div>

      {/* ───────── Bottom Floating Controls Toolbar ───────── */}
      <footer className="h-20 px-4 sm:px-6 bg-[#0B0F19]/95 border-t border-white/[0.08] backdrop-blur-md flex items-center justify-between gap-4 shrink-0 z-20">
        
        {/* Left Status */}
        <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-mono text-[11px]">Zoom Video SDK Connected</span>
        </div>

        {/* Center Media Controls */}
        <div className="flex items-center gap-2 sm:gap-4 mx-auto sm:mx-0">
          <button
            onClick={() => setMicActive(!micActive)}
            className={`p-3.5 rounded-2xl transition-all cursor-pointer ${
              micActive
                ? "bg-white/[0.08] hover:bg-white/[0.14] text-white"
                : "bg-red-500/20 text-red-400 border border-red-500/30"
            }`}
            title={micActive ? "Mute Microphone" : "Unmute Microphone"}
          >
            {micActive ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
          </button>

          <button
            onClick={() => setCameraActive(!cameraActive)}
            className={`p-3.5 rounded-2xl transition-all cursor-pointer ${
              cameraActive
                ? "bg-white/[0.08] hover:bg-white/[0.14] text-white"
                : "bg-red-500/20 text-red-400 border border-red-500/30"
            }`}
            title={cameraActive ? "Turn Off Camera" : "Turn On Camera"}
          >
            {cameraActive ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
          </button>

          <button
            onClick={() => setScreenSharing(!screenSharing)}
            className={`p-3.5 rounded-2xl transition-all cursor-pointer ${
              screenSharing
                ? "bg-purple-600 text-white shadow-lg shadow-purple-900/40"
                : "bg-white/[0.08] hover:bg-white/[0.14] text-white"
            }`}
            title="Toggle Screen Share"
          >
            <ScreenShare className="w-5 h-5" />
          </button>

          <button
            onClick={() => setActiveSidePanel(activeSidePanel === "participants" ? null : "participants")}
            className={`p-3.5 rounded-2xl transition-all cursor-pointer ${
              activeSidePanel === "participants"
                ? "bg-purple-600 text-white"
                : "bg-white/[0.08] hover:bg-white/[0.14] text-white"
            }`}
            title="Participants List"
          >
            <Users className="w-5 h-5" />
          </button>

          <button
            onClick={() => setActiveSidePanel(activeSidePanel === "chat" ? null : "chat")}
            className={`p-3.5 rounded-2xl transition-all cursor-pointer ${
              activeSidePanel === "chat"
                ? "bg-purple-600 text-white"
                : "bg-white/[0.08] hover:bg-white/[0.14] text-white"
            }`}
            title="In-Call Chat"
          >
            <MessageSquare className="w-5 h-5" />
          </button>
        </div>

        {/* Right Leave / End Call */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleLeaveClass}
            className="px-4 sm:px-5 py-3 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-red-900/30 transition-all cursor-pointer"
          >
            <PhoneOff className="w-4 h-4" />
            <span>{isHost ? "End Class" : "Leave Room"}</span>
          </button>
        </div>

      </footer>

    </div>
  );
}
