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

  // Derive user info - Strictly enforce only 2 roles: 'INSTRUCTOR' (host) or 'STUDENT' (attendee)
  const effectiveUserId = propUserId || user?.id || `user-${Math.random().toString(36).substring(2, 9)}`;
  const effectiveRole: 'INSTRUCTOR' | 'STUDENT' =
    propRole === 'STUDENT' || user?.role === 'STUDENT' ? 'STUDENT' : 'INSTRUCTOR';
  const effectiveUserName = propUserName || user?.name || (effectiveRole === 'INSTRUCTOR' ? 'Instructor' : 'Student');

  // Calculate destination URL based on user role
  const getExitRedirectUrl = useCallback(() => {
    if (user?.role === 'STUDENT') return '/dashboard';
    if (user?.role === 'ADMIN') return '/admin';
    return '/instructor';
  }, [user?.role]);

  // Helper to cleanup DOM and global CSS modifications introduced by Zoom SDK
  const cleanupZoomGlobalDOMAndStyles = useCallback(() => {
    try {
      if (typeof document !== 'undefined') {
        // Reset inline styles injected onto document body and html elements by Zoom SDK
        document.body.removeAttribute('style');
        document.documentElement.removeAttribute('style');

        // Remove any body CSS classes injected by Zoom SDK
        if (document.body.className) {
          document.body.className = document.body.className
            .split(' ')
            .filter((cls) => !cls.includes('zoom') && !cls.includes('zmmtg'))
            .join(' ');
        }

        // Target residual Zoom UI elements injected directly into document body
        const zoomSelectors = [
          '#zmmtg-root',
          'body > div[class*="zoom-"]',
          'body > div[id*="zoom-"]',
          'body > div[class*="zmmtg-"]',
          'body > div[id*="zmmtg-"]',
        ];

        zoomSelectors.forEach((sel) => {
          document.querySelectorAll(sel).forEach((el) => {
            if (containerRef.current && (el === containerRef.current || containerRef.current.contains(el))) {
              return;
            }
            el.remove();
          });
        });
      }
    } catch (e) {
      console.warn('Error during Zoom CSS/DOM cleanup:', e);
    }
  }, []);

  // Clean navigation helper after Zoom exit
  const navigateAway = useCallback(
    (targetUrl: string) => {
      cleanupZoomGlobalDOMAndStyles();
      if (typeof window !== 'undefined') {
        window.location.href = targetUrl;
      } else {
        router.push(targetUrl);
      }
    },
    [cleanupZoomGlobalDOMAndStyles, router]
  );

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
    const targetUrl = getExitRedirectUrl();
    navigateAway(targetUrl);
  }, [getExitRedirectUrl, navigateAway]);

  const startSession = async () => {
    if (!containerRef.current) return;

    try {
      setIsLoading(true);
      setError(null);

      // Make container visible before joining so UI toolkit can compute layout & render canvas
      setIsSessionActive(true);

      // 1. Fetch credentials directly from Next.js signature endpoint
      console.log(`[Zoom UI Toolkit] Fetching signature for session=${sessionId}, user=${effectiveUserId}, role=${effectiveRole}`);
      const signatureData = await fetchZoomSignature(sessionId, effectiveUserId, effectiveRole);
      console.log('[Zoom UI Toolkit] Signature response:', signatureData);

      const signature = signatureData.signature;
      const meetingId = signatureData.meeting_id || signatureData.meetingId || sessionId;
      const passcode = signatureData.passcode || '';

      if (!signature) {
        throw new Error('No signature returned from Zoom signature service');
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

      // 4. Attach event listener for session close (Triggers when Zoom's built-in red button is clicked)
      uitoolkit.onSessionClosed(async () => {
        try {
          if (effectiveRole === 'INSTRUCTOR') {
            await endZoomMeeting(sessionId, effectiveUserId, effectiveRole);
            syncSessionRecording(sessionId).catch((err) => {
              console.error('Error triggering recording sync on session close:', err);
            });
          } else {
            await leaveZoomMeeting(sessionId, effectiveUserId, effectiveRole);
          }
        } catch (e) {
          console.error('Error in onSessionClosed handler:', e);
        } finally {
          await handleSessionClosed();
        }
      });

    } catch (err: any) {
      console.error('Zoom UI Toolkit Join Error:', err);
      setIsSessionActive(false);
      setError(err.message || 'Failed to join Zoom Video SDK session.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!isSessionActive || !containerRef.current) return;

    // Observe child additions inside Zoom UI toolkit container to handle popups and disable dragging
    const observer = new MutationObserver((mutations) => {
      const container = containerRef.current;
      if (!container) return;

      const draggables = container.querySelectorAll<HTMLElement>('.react-draggable, [class*="uikit-common-popper-wrapper"]');
      draggables.forEach((el) => {
        // Skip emoji picker container and any emoji popovers to keep original structure
        if (
          el.id === 'uikit-chat-emoji-picker-content' ||
          el.closest('#uikit-chat-emoji-picker-content') ||
          el.querySelector('[class*="emoji-mart"], [class*="EmojiPicker"], [id*="emoji-picker"]')
        ) {
          return;
        }

        const isSettings = el.querySelector('[id*="setting"], [class*="setting"], [role="tab"]');
        const isMoreMenu = el.querySelector('#broadcast, [id*="more"], [class*="more-menu"]');

        if (isSettings) {
          el.setAttribute('data-zoom-modal', 'settings');
          el.style.setProperty('position', 'absolute', 'important');
          el.style.setProperty('top', '50%', 'important');
          el.style.setProperty('left', '50%', 'important');
          el.style.setProperty('right', 'auto', 'important');
          el.style.setProperty('bottom', 'auto', 'important');
          el.style.setProperty('transform', 'translate(-50%, -50%)', 'important');
          el.style.setProperty('width', '620px', 'important');
          el.style.setProperty('max-width', 'calc(100vw - 32px)', 'important');
          el.style.setProperty('height', 'auto', 'important');
          el.style.setProperty('max-height', 'min(650px, calc(100% - 60px))', 'important');
          el.style.setProperty('z-index', '60', 'important');
          el.style.setProperty('border-radius', '20px', 'important');
          el.style.setProperty('overflow', 'hidden', 'important');
          el.style.setProperty('box-shadow', '0 25px 75px rgba(0, 0, 0, 0.8)', 'important');
        } else if (isMoreMenu) {
          el.setAttribute('data-zoom-modal', 'more-menu');
          el.style.setProperty('position', 'absolute', 'important');
          el.style.setProperty('bottom', '76px', 'important');
          el.style.setProperty('left', '50%', 'important');
          el.style.setProperty('right', 'auto', 'important');
          el.style.setProperty('top', 'auto', 'important');
          el.style.setProperty('transform', 'translateX(-50%)', 'important');
          el.style.setProperty('width', '240px', 'important');
          el.style.setProperty('z-index', '60', 'important');
          el.style.setProperty('border-radius', '14px', 'important');
          el.style.setProperty('box-shadow', '0 20px 50px rgba(0, 0, 0, 0.75)', 'important');
        } else {
          // Chat or Participants panel
          el.setAttribute('data-zoom-modal', 'side-panel');
          el.style.setProperty('position', 'absolute', 'important');
          el.style.setProperty('top', '16px', 'important');
          el.style.setProperty('right', '16px', 'important');
          el.style.setProperty('left', 'auto', 'important');
          el.style.setProperty('bottom', 'auto', 'important');
          el.style.setProperty('transform', 'none', 'important');
          el.style.setProperty('width', '380px', 'important');
          el.style.setProperty('max-width', 'calc(100vw - 32px)', 'important');
          el.style.setProperty('height', 'calc(100% - 96px)', 'important');
          el.style.setProperty('max-height', 'calc(100% - 96px)', 'important');
          el.style.setProperty('z-index', '50', 'important');
          el.style.setProperty('border-radius', '16px', 'important');
          el.style.setProperty('overflow', 'visible', 'important'); // Visible so emoji popup is not clipped
          el.style.setProperty('box-shadow', '0 20px 60px rgba(0, 0, 0, 0.6)', 'important');
        }

        // Disable drag cursor and header dragging handle
        const headers = el.querySelectorAll<HTMLElement>('.uikit-common-popper-header, .handle, [class*="cursor-move"]');
        headers.forEach((h) => {
          h.style.setProperty('cursor', 'default', 'important');
          h.style.setProperty('user-select', 'none', 'important');
        });
      });
    });

    observer.observe(containerRef.current, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
    };
  }, [isSessionActive]);

  useEffect(() => {
    return () => {
      // Teardown when component unmounts
      if (containerRef.current) {
        uitoolkit.closeSession(containerRef.current).catch(() => {});
      }
      cleanupZoomGlobalDOMAndStyles();
    };
  }, [cleanupZoomGlobalDOMAndStyles]);

  return (
    <div className="w-full h-[calc(100vh-64px)] bg-[#1c1c1e] text-white flex flex-col relative overflow-hidden font-sans">
      
      {/* Zoom Video SDK UI Toolkit Container - Embedded inside this website */}
      <div
        ref={containerRef}
        id="zoom-uitoolkit-container"
        className={`w-full h-full flex-1 ${isSessionActive ? 'block relative z-0' : 'hidden'}`}
        style={{ width: '100%', height: '100%', backgroundColor: '#1c1c1e' }}
      />

      {/* Pre-join screen for Instructor when session is not yet active */}
      {!isSessionActive && (
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center z-10 bg-[#070913]">
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

    </div>
  );
}
