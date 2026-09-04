'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import uitoolkit from '@zoom/videosdk-ui-toolkit';
import '@zoom/videosdk-ui-toolkit/dist/videosdk-ui-toolkit.css';
import { fetchZoomSignature, leaveZoomMeeting, endZoomMeeting, syncSessionRecording } from './ZoomService';
import { useAuth } from '@/context/AuthContext';
import { Video, Sparkles, AlertCircle, LogOut, PhoneOff } from 'lucide-react';

interface ZoomSessionProps {
  sessionId: string;
  userId?: string;
  role?: string; // 'INSTRUCTOR' or 'STUDENT'
  userName?: string;
}

export default function ZoomSession({
  sessionId,
  userId: propUserId,
  role: propRole,
  userName: propUserName,
}: ZoomSessionProps) {
  const router = useRouter();
  const { user } = useAuth();

  const containerRef = useRef<HTMLDivElement>(null);
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Derive user info
  const effectiveUserId = propUserId || user?.id || `user-${Math.random().toString(36).substring(2, 9)}`;
  const effectiveRole = propRole || (user?.role === 'INSTRUCTOR' || user?.role === 'ADMIN' ? 'INSTRUCTOR' : 'INSTRUCTOR');
  const effectiveUserName = propUserName || user?.name || (effectiveRole === 'INSTRUCTOR' ? 'Instructor' : 'Student');

  // Handle session cleanup
  const handleSessionClosed = useCallback(async () => {
    setIsSessionActive(false);
    if (containerRef.current) {
      try {
        await uitoolkit.closeSession(containerRef.current);
      } catch (e) {
        // Ignore if already closed
      }
    }
  }, []);

  const startSession = async () => {
    if (!containerRef.current) return;

    try {
      setIsLoading(true);
      setError(null);

      // Make container visible before joining so UI toolkit can compute layout & render canvas
      setIsSessionActive(true);

      // 1. Fetch credentials directly from http://192.168.1.14:8000/meetings/signature
      console.log(`[Zoom UI Toolkit] Fetching signature for session=${sessionId}, user=${effectiveUserId}, role=${effectiveRole}`);
      const signatureData = await fetchZoomSignature(sessionId, effectiveUserId, effectiveRole);
      console.log('[Zoom UI Toolkit] Signature response:', signatureData);

      const signature = signatureData.signature;
      const meetingId = signatureData.meeting_id || signatureData.meetingId || sessionId;
      const passcode = signatureData.passcode || '';

      if (!signature) {
        throw new Error('No signature returned from http://192.168.1.14:8000/meetings/signature');
      }

      // 2. Prepare Zoom Video SDK UI Toolkit configuration
      // Explicitly disable recording UI controls so host/users don't see pause/play/start/end recording buttons
      const config = {
        videoSDKJWT: signature,
        sessionName: meetingId,
        userName: effectiveUserName,
        sessionPasscode: passcode,
        featuresOptions: {
          video: {
            enable: true,
          },
          audio: {
            enable: true,
          },
          share: {
            enable: true,
          },
          chat: {
            enable: true,
            enableEmoji: true,
          },
          users: {
            enable: true,
          },
          settings: {
            enable: true,
          },
          preview: {
            enable: true,
          },
          leave: {
            enable: true,
          },
          recording: {
            enable: false, // Hide recording controls from UI toolkit
          },
        },
      };

      console.log('[Zoom UI Toolkit] Calling uitoolkit.joinSession with sessionName:', meetingId);
      
      // 3. Mount and join session with Zoom UI Toolkit
      await uitoolkit.joinSession(containerRef.current, config as any);

      // 4. Attach event listener for session close
      uitoolkit.onSessionClosed(async () => {
        await handleSessionClosed();
        await leaveZoomMeeting(sessionId, effectiveUserId, effectiveRole);
      });

    } catch (err: any) {
      console.error('Zoom UI Toolkit Join Error:', err);
      setIsSessionActive(false);
      setError(err.message || 'Failed to join Zoom Video SDK session.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleManualLeave = async () => {
    try {
      await leaveZoomMeeting(sessionId, effectiveUserId, effectiveRole);
      if (containerRef.current) {
        await uitoolkit.closeSession(containerRef.current);
      }
    } catch (err) {
      console.error('Error leaving session:', err);
    } finally {
      setIsSessionActive(false);
      router.push('/instructor');
    }
  };

  const handleManualEnd = async () => {
    try {
      // 1. Notify backend that host ended the meeting (PATCH /meetings/end)
      await endZoomMeeting(sessionId, effectiveUserId, effectiveRole);

      // 2. Close the UI toolkit session
      if (containerRef.current) {
        await uitoolkit.closeSession(containerRef.current);
      }

      // 3. Trigger backend recording sync to download from Zoom & store in MinIO + DB
      syncSessionRecording(sessionId).catch((err) => {
        console.error('Error triggering recording sync on meeting end:', err);
      });

    } catch (err) {
      console.error('Error ending session:', err);
    } finally {
      setIsSessionActive(false);
      router.push('/instructor');
    }
  };

  useEffect(() => {
    return () => {
      // Teardown when component unmounts
      if (containerRef.current) {
        uitoolkit.closeSession(containerRef.current).catch(() => {});
      }
    };
  }, []);

  return (
    <div className="w-full h-screen bg-[#070913] text-white flex flex-col relative overflow-hidden font-sans">
      
      {/* Zoom Video SDK UI Toolkit Container - Embedded inside this website */}
      <div
        ref={containerRef}
        id="zoom-uitoolkit-container"
        className={`w-full h-full flex-1 ${isSessionActive ? 'block' : 'hidden'}`}
        style={{ width: '100vw', height: '100vh' }}
      />

      {/* Pre-join screen for Instructor when session is not yet active */}
      {!isSessionActive && (
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center z-10">
          <div className="max-w-md w-full p-8 rounded-3xl bg-[#0e1326]/90 border border-white/10 shadow-2xl backdrop-blur-xl space-y-6">
            
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center mx-auto shadow-lg shadow-blue-500/30">
              <Video className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                Live Classroom Session
              </h2>
              <p className="text-xs text-slate-400">
                Click below to start your Zoom Video SDK session using the official UI Toolkit.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-black/40 border border-white/5 text-left text-xs space-y-2 font-mono">
              <div className="flex justify-between">
                <span className="text-slate-500">Session ID:</span>
                <span className="text-blue-400 font-bold truncate max-w-[180px]">{sessionId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Role:</span>
                <span className="text-emerald-400 font-bold">{effectiveRole}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Instructor:</span>
                <span className="text-slate-300 truncate max-w-[180px]">{effectiveUserName}</span>
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2 text-left">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              onClick={startSession}
              disabled={isLoading}
              className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm shadow-xl shadow-blue-600/30 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  <span>Connecting to Zoom Video SDK...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Start Session</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Floating Action Buttons when Session is Active */}
      {isSessionActive && (
        <div className="absolute top-4 right-4 z-50 flex items-center gap-2">
          <button
            onClick={handleManualLeave}
            className="px-3.5 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-white text-xs font-semibold backdrop-blur-md border border-white/10 flex items-center gap-1.5 cursor-pointer shadow-lg transition-all"
            title="Leave Session"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Leave</span>
          </button>
          
          {effectiveRole === 'INSTRUCTOR' && (
            <button
              onClick={handleManualEnd}
              className="px-3.5 py-2 rounded-xl bg-red-600/90 hover:bg-red-500 text-white text-xs font-semibold backdrop-blur-md border border-red-500/30 flex items-center gap-1.5 cursor-pointer shadow-lg shadow-red-600/20 transition-all"
              title="End Session for All"
            >
              <PhoneOff className="w-3.5 h-3.5" />
              <span>End Session</span>
            </button>
          )}
        </div>
      )}

    </div>
  );
}
