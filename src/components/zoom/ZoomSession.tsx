'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import uitoolkit from '@zoom/videosdk-ui-toolkit';
import '@zoom/videosdk-ui-toolkit/dist/videosdk-ui-toolkit.css';
import { fetchZoomSignature, leaveZoomMeeting, endZoomMeeting, syncSessionRecording } from './ZoomService';
import { useAuth } from '@/context/AuthContext';
import { Video, Sparkles, AlertCircle, Maximize2, Minimize2, Mic } from 'lucide-react';

interface ZoomSessionProps {
  sessionId: string;
  sessionTitle?: string;
  courseTitle?: string;
  userId?: string;
  role?: string; // 'INSTRUCTOR' or 'STUDENT'
  userName?: string;
}

export default function ZoomSession({
  sessionId,
  sessionTitle,
  courseTitle,
  userId: propUserId,
  role: propRole,
  userName: propUserName,
}: ZoomSessionProps) {
  const router = useRouter();
  const { user } = useAuth();

  const containerRef = useRef<HTMLDivElement>(null);
  const meetingIdRef = useRef(sessionId);
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showMediaConsentModal, setShowMediaConsentModal] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Derive user info - Strictly enforce only 2 roles: 'INSTRUCTOR' (host) or 'STUDENT' (attendee)
  const effectiveUserId = propUserId || user?.id || `user-${Math.random().toString(36).substring(2, 9)}`;
  const effectiveRole: 'INSTRUCTOR' | 'STUDENT' =
    propRole === 'STUDENT' || user?.role === 'STUDENT' ? 'STUDENT' : 'INSTRUCTOR';
  const effectiveUserName = propUserName || user?.name || (effectiveRole === 'INSTRUCTOR' ? 'Instructor' : 'Student');
  const displaySessionTitle = sessionTitle || sessionId;
  const displayCourseTitle = courseTitle || 'Live Course';

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
    setShowMediaConsentModal(false);
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
      meetingIdRef.current = meetingId;

      if (!signature) {
        throw new Error('No signature returned from Zoom signature service');
      }

      // 2. Prepare Zoom Video SDK UI Toolkit configuration
      // preview: false directly joins the session without the secondary internal testing screen
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
            enable: effectiveRole === 'INSTRUCTOR',
          },
          settings: {
            enable: true,
          },
          preview: {
            enable: false, // Direct join without 2nd-time testing popup
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

      // Show the media check / consent modal once the session is opened
      setShowMediaConsentModal(true);

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

  // Automatically start Zoom session directly on mount
  useEffect(() => {
    startSession();
  }, []);

  // Monitor fullscreen change events
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Fullscreen toggle handler
  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      const target = containerRef.current?.parentElement || containerRef.current;
      if (target?.requestFullscreen) {
        target.requestFullscreen().catch((err) => {
          console.warn('Error attempting fullscreen:', err);
        });
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch((err) => {
          console.warn('Error exiting fullscreen:', err);
        });
      }
    }
  }, []);

  // Handle checking & enabling camera and microphone
  const handleEnableMedia = async () => {
    setShowMediaConsentModal(false);
    try {
      await navigator.mediaDevices?.getUserMedia({ audio: true, video: true });
    } catch (e) {
      console.log('Browser media permission requested:', e);
    }

    try {
      const audioBtn = document.querySelector<HTMLElement>('#uikit-footer-audio-button, [id*="audio-button"]');
      const videoBtn = document.querySelector<HTMLElement>('#uikit-footer-video-button, [id*="video-button"]');
      if (
        audioBtn &&
        (audioBtn.getAttribute('aria-label')?.toLowerCase().includes('unmute') ||
          audioBtn.getAttribute('aria-label')?.toLowerCase().includes('join'))
      ) {
        audioBtn.click();
      }
      if (videoBtn && videoBtn.getAttribute('aria-label')?.toLowerCase().includes('start')) {
        videoBtn.click();
      }
    } catch (err) {}
  };

  // Handle continuing without camera and microphone
  const handleContinueWithoutMedia = () => {
    setShowMediaConsentModal(false);
  };

  useEffect(() => {
    if (!isSessionActive || !containerRef.current) return;

const sanitizeSessionInformation = () => {
  const container = containerRef.current;
  if (!container) return;

  // Remove unwanted rows
  const labels = Array.from(
    container.querySelectorAll<HTMLElement>('*')
  ).filter(
    (element) =>
      element.children.length === 0 &&
      element.textContent?.trim()
  );

  labels.forEach((labelElement) => {
    const label = labelElement.textContent?.trim();

    if (!label || labelElement.closest('[data-session-info-updated="true"]')
    ) { return;}

    const row = labelElement.parentElement;
    if (!row) return;

    if (label === 'Password' || label === 'User ID' || label === 'Topic' || label === 'Session ID') {
      row.remove();
    }
  });

  // Find Your Name row
  const infoHeading = Array.from(
    container.querySelectorAll<HTMLElement>('*')
  ).find(
    (element) =>
      element.children.length === 0 &&
      element.textContent?.trim() === 'Your Name'
  );

  const nameRow = infoHeading?.parentElement;

  if (!nameRow) return;

  // COURSE ROW
  let courseRow = container.querySelector<HTMLElement>('[data-course-info="true"]');

  if (!courseRow) {
    courseRow = nameRow.cloneNode(true) as HTMLElement;

    courseRow.setAttribute('data-course-info','true');

    const courseLabels = Array.from(
      courseRow.querySelectorAll<HTMLElement>('*')
    ).filter(
      (element) => element.children.length === 0
    );

    const courseLabel = courseLabels[0];
    const courseValue =
      courseLabels[courseLabels.length - 1];

    if (courseLabel) {
      courseLabel.textContent = 'Course';
    }

    if (courseValue && courseValue !== courseLabel) {
      courseValue.textContent = displayCourseTitle;
    }

    // Your Name and Course
    nameRow.insertAdjacentElement('afterend',courseRow);
  }

  // SESSION NAME ROW
  let sessionRow = container.querySelector<HTMLElement>('[data-session-name-info="true"]');

  if (!sessionRow) {
    sessionRow = nameRow.cloneNode(true) as HTMLElement;

    sessionRow.setAttribute('data-session-name-info','true');

    const sessionLabels = Array.from(
      sessionRow.querySelectorAll<HTMLElement>('*')
    ).filter(
      (element) => element.children.length === 0
    );

    const sessionLabel = sessionLabels[0];
    const sessionValue =
      sessionLabels[sessionLabels.length - 1];

    if (sessionLabel) {
      sessionLabel.textContent = 'Session Name';
    }

    if (sessionValue && sessionValue !== sessionLabel) {
      sessionValue.textContent = displaySessionTitle;
    }

    // Course and Session Name
    courseRow.insertAdjacentElement('afterend',sessionRow);
  }
  // UPDATE MEETING TITLE
  const meetingId = meetingIdRef.current;

  if (meetingId) {
    Array.from(container.querySelectorAll<HTMLElement>('*'))
      .filter(
        (element) =>
          element.children.length === 0 &&
          element.textContent?.trim() === meetingId
      )
      .forEach((element) => {
        element.textContent = displaySessionTitle;
        element.setAttribute('data-session-title-header','true');
      });
  }
};

const sanitizeStudentChat = () => {
  if (effectiveRole !== 'STUDENT') return;

  containerRef.current?.querySelectorAll<HTMLElement>(
    'option, [role="option"], [role="menuitem"], [role="menuitemcheckbox"]'
  ).forEach((element) => {
    if (element.textContent?.trim() === 'Everyone' || element.textContent?.trim() === 'Everyone (in Waiting Room)') {
      if (element.tagName === 'OPTION') {
        element.remove();
      } else {
        element.style.setProperty('display', 'none', 'important');
      }
    }
  });

  containerRef.current?.querySelectorAll<HTMLElement>('button, [role="button"]').forEach((element) => {
    const label = `${element.getAttribute('aria-label') || ''} ${element.getAttribute('title') || ''}`.toLowerCase();
    if (label.includes('participant') || label === 'users' || label.includes('users')) {
      element.style.setProperty('display', 'none', 'important');
    }
  });
};

    // Observe child additions inside Zoom UI toolkit container to handle popups and disable dragging
    const observer = new MutationObserver(() => {
      const container = containerRef.current;
      if (!container) return;

      sanitizeSessionInformation();
      sanitizeStudentChat();

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
    sanitizeSessionInformation();
    sanitizeStudentChat();

    return () => {
      observer.disconnect();
    };
  }, [displayCourseTitle, displaySessionTitle, effectiveRole, isSessionActive]);

  useEffect(() => {
    return () => {
      // Teardown when component unmounts
      if (containerRef.current) {
        uitoolkit.closeSession(containerRef.current).catch(() => { });
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

      {/* Floating Full Screen Icon Button (Hover tooltip only, icon only) */}
      {isSessionActive && (
        <button
          onClick={toggleFullscreen}
          title={isFullscreen ? 'Exit full screen' : 'Full screen'}
          aria-label={isFullscreen ? 'Exit full screen' : 'Full screen'}
          className="absolute top-[72px] right-4 z-40 p-2.5 rounded-xl bg-[#1c1e24]/85 hover:bg-[#2e313d] text-white/80 hover:text-white border border-white/10 shadow-xl backdrop-blur-md transition-all cursor-pointer group"
        >
          {isFullscreen ? (
            <Minimize2 className="w-5 h-5 transition-transform group-hover:scale-110" />
          ) : (
            <Maximize2 className="w-5 h-5 transition-transform group-hover:scale-110" />
          )}
        </button>
      )}

      {/* Loading state when connecting */}
      {isLoading && !isSessionActive && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#070913] z-30 space-y-4">
          <div className="w-12 h-12 rounded-full border-4 border-blue-500/20 border-t-blue-500 animate-spin" />
          <p className="text-sm font-semibold text-slate-300">Connecting to Live Classroom...</p>
        </div>
      )}

      {/* Error state if connection fails */}
      {error && !isSessionActive && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#070913] p-6 text-center z-30">
          <div className="max-w-md w-full p-8 rounded-3xl bg-[#0e1326]/90 border border-white/10 shadow-2xl backdrop-blur-xl space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-red-500/20 text-red-400 flex items-center justify-center mx-auto">
              <AlertCircle className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-bold text-white">Connection Failed</h2>
              <p className="text-xs text-slate-400">{error}</p>
            </div>
            <button
              onClick={startSession}
              disabled={isLoading}
              className="w-full py-3.5 px-6 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-xl transition-all cursor-pointer"
            >
              Retry Connection
            </button>
          </div>
        </div>
      )}

      {/* Media Check & Consent Modal with engaging message & illustration */}
      {showMediaConsentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-[460px] bg-[#1e2025] border border-white/10 rounded-[28px] p-8 shadow-2xl text-center flex flex-col items-center animate-in fade-in zoom-in-95 duration-200">

            {/* Top Engaging Illustration */}
            <div className="w-[240px] h-[148px] bg-[#eef3f9] rounded-2xl flex items-center justify-center relative overflow-hidden mb-6 shadow-sm">
              <svg viewBox="0 0 240 148" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Background Soft Glow */}
                <ellipse cx="120" cy="100" rx="65" ry="40" fill="#e2ebf5" />

                {/* Video Camera Bubble (Left) */}
                <rect x="22" y="34" width="44" height="30" rx="8" fill="#4c82f7" />
                <rect x="34" y="44" width="12" height="10" rx="2" stroke="#ffffff" strokeWidth="2" />
                <path d="M46 47l6-3.5v9L46 49v-2z" fill="#ffffff" />
                <path d="M34 64l5-4h-5v4z" fill="#4c82f7" />

                {/* Microphone Bubble (Top Center-Left) */}
                <rect x="78" y="16" width="36" height="30" rx="8" fill="#2d55b8" />
                <rect x="92" y="22" width="8" height="11" rx="4" fill="#ffffff" />
                <path d="M89 27a7 7 0 0014 0M96 34v4M93 38h6" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" />
                <path d="M88 46l5-4h-5v4z" fill="#2d55b8" />

                {/* Video Meeting Grid Frame (Top Right) */}
                <rect x="122" y="24" width="86" height="52" rx="6" fill="#1e2024" stroke="#4b5563" strokeWidth="1.5" />

                {/* Participant Avatars */}
                <rect x="125" y="27" width="25" height="21" rx="2" fill="#fed7aa" />
                <circle cx="137.5" cy="34" r="3.5" fill="#9a3412" />
                <path d="M130 46c0-2.5 3-4 7.5-4s7.5 1.5 7.5 4" fill="#9a3412" />

                <rect x="152.5" y="27" width="25" height="21" rx="2" fill="#bfdbfe" />
                <circle cx="165" cy="34" r="3.5" fill="#1e3a8a" />
                <path d="M157.5 46c0-2.5 3-4 7.5-4s7.5 1.5 7.5 4" fill="#1e3a8a" />

                <rect x="180" y="27" width="25" height="21" rx="2" fill="#fecdd3" />
                <circle cx="192.5" cy="34" r="3.5" fill="#881337" />
                <path d="M185 46c0-2.5 3-4 7.5-4s7.5 1.5 7.5 4" fill="#881337" />

                <rect x="125" y="51" width="25" height="21" rx="2" fill="#d9f99d" />
                <circle cx="137.5" cy="58" r="3.5" fill="#365314" />
                <path d="M130 70c0-2.5 3-4 7.5-4s7.5 1.5 7.5 4" fill="#365314" />

                <rect x="152.5" y="51" width="25" height="21" rx="2" fill="#fef08a" />
                <circle cx="165" cy="58" r="3.5" fill="#713f12" />
                <path d="M157.5 70c0-2.5 3-4 7.5-4s7.5 1.5 7.5 4" fill="#713f12" />

                <rect x="180" y="51" width="25" height="21" rx="2" fill="#e9d5ff" />
                <circle cx="192.5" cy="58" r="3.5" fill="#581c87" />
                <path d="M185 70c0-2.5 3-4 7.5-4s7.5 1.5 7.5 4" fill="#581c87" />

                {/* Desk & Person */}
                <path d="M50 108h130v4H50z" fill="#2d3748" />
                <path d="M62 112l-12 30h4l10-30z M168 112l12 30h-4l-10-30z" fill="#718096" />
                <path d="M112 120h16v22h-16z M104 140h32v3h-32z" fill="#4a5568" />
                <path d="M102 110h36v5h-36z" fill="#2b6cb0" />
                <path d="M108 115v15h24v-15" fill="#1a202c" />
                <path d="M104 94c0-7 5-12 16-12s16 5 16 12v16h-32v-16z" fill="#dd6b20" />
                <circle cx="120" cy="74" r="6.5" fill="#744210" />
                <path d="M113 73c0-5 3.5-7 9-7s9 2.5 9 6c-2.5-1.5-6-1.5-9-0.5-3.5 1-7 1.5-9 1.5z" fill="#1a202c" />
                <path d="M130 99l14-14h2v14h-16z" fill="#cbd5e0" />
                <rect x="126" y="106" width="26" height="2" rx="1" fill="#a0aec0" />
              </svg>
            </div>

            {/* Title */}
            <h3 className="text-xl font-bold text-white tracking-tight mb-2">
              Do you want people to see and hear you in the meeting?
            </h3>

            {/* Subtitle / Interesting Message */}
            <p className="text-xs sm:text-sm text-slate-400 mb-6 max-w-sm leading-relaxed">
              Enable your camera and microphone to engage seamlessly with your instructor and classmates. You can turn them off at any time.
            </p>

            {/* Primary Action Button: Use microphone and camera */}
            <button
              onClick={handleEnableMedia}
              className="w-full py-3 px-6 rounded-xl bg-[#1877f2] hover:bg-[#166fe5] text-white font-semibold text-sm transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 cursor-pointer mb-3"
            >
              <Video className="w-4 h-4" />
              <Mic className="w-4 h-4" />
              <span>Use microphone and camera</span>
            </button>

            {/* Secondary Action Link: Continue without microphone and camera */}
            <button
              onClick={handleContinueWithoutMedia}
              className="text-xs sm:text-sm text-slate-400 hover:text-white transition-colors cursor-pointer py-1"
            >
              Continue without microphone and camera
            </button>

          </div>
        </div>
      )}

    </div>
  );
}

