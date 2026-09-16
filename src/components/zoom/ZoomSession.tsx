'use client';

import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import ZoomVideo, { VideoQuality, Participant } from '@zoom/videosdk';
import { useAuth } from '@/context/AuthContext';
import { fetchZoomSignature, leaveZoomMeeting, endZoomMeeting } from './ZoomService';
import { Mic, MicOff, Video, VideoOff, ScreenShare, MessageSquare, Users, LogOut, Maximize2, Minimize2, AlertCircle, Sparkles, Send, X, Crown, Volume2, VolumeX, Shield, PhoneOff, Minus, ChevronDown, ChevronUp, Smile, Paperclip, FileText, Download, Image as ImageIcon, Star, CheckCircle2, Loader2, Heart, Check, Hand, Hourglass, Pencil,Settings } from 'lucide-react';
import ZoomReactionsMenu from './ZoomReactionsMenu';
import ZoomFloatingReactions, { FloatingReaction } from './ZoomFloatingReactions';
import ZoomAnnotationToolbar from './ZoomAnnotationToolbar';
import { Logo } from '@/components/Logo';

//For Zoomsettings
import ZoomVideoSettingsModal, {
  ZoomVideoSettings,
  DEFAULT_ZOOM_SETTINGS,
  PRESET_BACKGROUNDS,
} from './ZoomVideoSettingsModal';


// Declare custom Web Component elements required by Zoom Video SDK 2.x for React 19 / TSX
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'video-player-container': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
      'video-player': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
    }
  }
  namespace React {
    namespace JSX {
      interface IntrinsicElements {
        'video-player-container': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
        'video-player': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
      }
    }
  }
}

interface ZoomSessionProps {
  sessionId: string;
  sessionTitle?: string;
  courseTitle?: string;
  userId?: string;
  role?: string; // 'INSTRUCTOR' or 'STUDENT'
  userName?: string;
}

interface ChatMessageItem {
  id: string;
  senderName: string;
  senderId: number;
  receiverName?: string;
  receiverId?: number;
  text: string;
  fileInfo?: {
    name: string;
    size: number;
    type: string;
    url?: string;
  };
  timestamp: number;
  isSelf: boolean;
  isPrivate: boolean;
}

const POPULAR_EMOJIS = ['😊', '👍', '👏', '❤️', '🔥', '🎉', '🙋‍♂️', '❓', '💯', '⭐', '💡', '🙌'];

const RATING_LABELS: { [key: number]: { label: string; desc: string; emoji: string } } = {
  1: { label: 'Needs Improvement', desc: 'Could be much better', emoji: '😞' },
  2: { label: 'Fair', desc: 'Met some expectations', emoji: '😐' },
  3: { label: 'Good', desc: 'Satisfied with the session', emoji: '🙂' },
  4: { label: 'Very Good', desc: 'Great explanations & pace', emoji: '😃' },
  5: { label: 'Excellent', desc: 'Outstanding live session!', emoji: '🌟' },
};

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

  // Container refs
  const containerRef = useRef<HTMLDivElement>(null);
  const shareContainerRef = useRef<HTMLDivElement>(null);
  const videoTilesRef = useRef<{ [key: number]: HTMLDivElement | null }>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  // SDK Client & Stream Refs
  const clientRef = useRef<any>(null);
  const mediaStreamRef = useRef<any>(null);
  const chatClientRef = useRef<any>(null);
  const meetingIdRef = useRef<string>(sessionId);

  // Connection & UI states
  const [isJoined, setIsJoined] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingText, setLoadingText] = useState('Connecting to Live Classroom...');
  const [error, setError] = useState<string | null>(null);
  const [showMediaConsentModal, setShowMediaConsentModal] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showEndConfirmModal, setShowEndConfirmModal] = useState(false);

  // Student Feedback Modal states
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackRating, setFeedbackRating] = useState<number>(5);
  const [feedbackHoverRating, setFeedbackHoverRating] = useState<number>(0);
  const [feedbackText, setFeedbackText] = useState('');
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  // Screen Share Permission & Student Request states
  const [hasSharePermission, setHasSharePermission] = useState(false);
  const [isWaitingForShareApproval, setIsWaitingForShareApproval] = useState(false);
  const [shareRequestStatus, setShareRequestStatus] = useState<'idle' | 'pending' | 'granted' | 'declined'>('idle');
  const [incomingShareRequest, setIncomingShareRequest] = useState<{ userId: number; userName: string } | null>(null);

  // Screen Share Minimize State
  const [isTilesMinimized, setIsTilesMinimized] = useState(false);

  // Meeting Media states
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [hostUser, setHostUser] = useState<Participant | null>(null);
  const [activeSpeakerId, setActiveSpeakerId] = useState<number | null>(null);

  // Media controls
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [activeShareUserId, setActiveShareUserId] = useState<number | null>(null);

  // Side panels states
  const [activeTab, setActiveTab] = useState<'none' | 'chat' | 'participants'>('none');
  const [unreadChatCount, setUnreadChatCount] = useState(0);

  // Zoom Reactions & Feedback states
  const [floatingReactions, setFloatingReactions] = useState<FloatingReaction[]>([]);
  const [isHandRaised, setIsHandRaised] = useState(false);
  const [isAway, setIsAway] = useState(false);
  const [raisedHandUsers, setRaisedHandUsers] = useState<Record<number, boolean>>({});
  const [awayUsers, setAwayUsers] = useState<Record<number, boolean>>({});

  // Screen Share Annotation Toolbar state
  const [isAnnotating, setIsAnnotating] = useState(false);

  // Video & Media Settings Modal states
  const [isVideoSettingsOpen, setIsVideoSettingsOpen] = useState(false);
  const [videoSettings, setVideoSettings] = useState<ZoomVideoSettings>(DEFAULT_ZOOM_SETTINGS);


  // Load saved video settings from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('glarus_zoom_video_settings');
      if (saved) {
        setVideoSettings({ ...DEFAULT_ZOOM_SETTINGS, ...JSON.parse(saved) });
      }
    } catch (e) {
      console.warn('Could not read saved zoom settings:', e);
    }
  }, []);
  // Sync virtual background & video mirror settings to live Zoom mediaStream
  useEffect(() => {
    if (!mediaStreamRef.current || !isVideoOn) return;
    try {
      if (typeof mediaStreamRef.current.mirrorVideo === 'function') {
        mediaStreamRef.current.mirrorVideo(videoSettings.isMirrored);
      }
      if (videoSettings.virtualBackground === 'blur' && typeof mediaStreamRef.current.updateVirtualBackgroundImage === 'function') {
        mediaStreamRef.current.updateVirtualBackgroundImage('blur');
      } else if (videoSettings.virtualBackground === 'none' && typeof mediaStreamRef.current.updateVirtualBackgroundImage === 'function') {
        mediaStreamRef.current.updateVirtualBackgroundImage(undefined);
      } else if (videoSettings.customBackgroundUrl && typeof mediaStreamRef.current.updateVirtualBackgroundImage === 'function') {
        mediaStreamRef.current.updateVirtualBackgroundImage(videoSettings.customBackgroundUrl, true);
      } else if (typeof mediaStreamRef.current.updateVirtualBackgroundImage === 'function') {
        const found = PRESET_BACKGROUNDS.find((b) => b.id === videoSettings.virtualBackground);
        if (found?.url) {
          mediaStreamRef.current.updateVirtualBackgroundImage(found.url, true);
        }
      }
    } catch (e) {
      console.warn('Error applying video effects to Zoom SDK stream:', e);
    }
  }, [isVideoOn, videoSettings.virtualBackground, videoSettings.customBackgroundUrl, videoSettings.isMirrored]);

  // Chat states
  const [messages, setMessages] = useState<ChatMessageItem[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [chatRecipientId, setChatRecipientId] = useState<number>(0); // 0 = Everyone, or userId
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  // Derive user identity & role ('INSTRUCTOR' or 'STUDENT')
  const effectiveUserId = propUserId || user?.id || `user-${Math.random().toString(36).substring(2, 9)}`;
  const effectiveRole: 'INSTRUCTOR' | 'STUDENT' =
    propRole === 'STUDENT' || user?.role === 'STUDENT' ? 'STUDENT' : 'INSTRUCTOR';
  const effectiveUserName = propUserName || user?.name || (effectiveRole === 'INSTRUCTOR' ? 'Instructor' : 'Student');
  const displaySessionTitle = sessionTitle || sessionId;
  const displayCourseTitle = courseTitle || 'Live Course';

  // Navigation redirect helper
  const getExitRedirectUrl = useCallback(() => {
    if (user?.role === 'STUDENT') return '/dashboard';
    if (user?.role === 'ADMIN') return '/admin';
    return '/instructor';
  }, [user?.role]);

  const navigateAway = useCallback(
    (targetUrl: string) => {
      if (typeof window !== 'undefined') {
        window.location.href = targetUrl;
      } else {
        router.push(targetUrl);
      }
    },
    [router]
  );

  // Refresh participants list and detect Host
  const updateParticipantsList = useCallback(() => {
    if (!clientRef.current) return;
    try {
      const allUsers: Participant[] = clientRef.current.getAllUser() || [];
      setParticipants([...allUsers]);

      const host = allUsers.find((u) => u.isHost || u.isManager) || allUsers[0] || null;
      setHostUser(host);

      // For students, lock chat recipient to Host
      if (effectiveRole === 'STUDENT' && host) {
        setChatRecipientId(host.userId);
      }
    } catch (e) {
      console.warn('Error updating participants list:', e);
    }
  }, [effectiveRole]);

  // Trigger floating reaction on screen
  const triggerFloatingReaction = useCallback((emoji: string, senderName?: string, isEffect = false) => {
    const newReaction: FloatingReaction = {
      id: `react-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      emoji,
      senderName,
      x: Math.floor(Math.random() * 65) + 15,
      isEffect,
    };
    setFloatingReactions((prev) => [...prev, newReaction]);

    setTimeout(() => {
      setFloatingReactions((prev) => prev.filter((r) => r.id !== newReaction.id));
    }, 3600);
  }, []);

  // Send reaction locally and broadcast to Zoom meeting chat
  const handleSendReaction = useCallback((emoji: string, isEffect = false) => {
    triggerFloatingReaction(emoji, 'You', isEffect);

    if (chatClientRef.current) {
      const msg = `__SYS_REACTION__:${JSON.stringify({
        emoji,
        isEffect,
        senderName: effectiveUserName,
        senderId: currentUserId,
      })}`;
      chatClientRef.current.sendToAll(msg).catch(() => { });
    }
  }, [effectiveUserName, currentUserId, triggerFloatingReaction]);

  // Raise / Lower Hand toggle (No floating reactions)
  const handleToggleRaiseHand = useCallback(() => {
    setIsHandRaised((prev) => {
      const next = !prev;
      if (currentUserId) {
        setRaisedHandUsers((u) => ({ ...u, [currentUserId]: next }));
      }
      if (chatClientRef.current && currentUserId) {
        const msg = `__SYS_HAND_RAISE__:${currentUserId}:${next ? '1' : '0'}:${effectiveUserName}`;
        chatClientRef.current.sendToAll(msg).catch(() => { });
      }
      return next;
    });
  }, [currentUserId, effectiveUserName]);

  // Instructor lower student's hand
  const handleHostLowerStudentHand = useCallback((targetUserId: number) => {
    setRaisedHandUsers((prev) => ({ ...prev, [targetUserId]: false }));
    if (chatClientRef.current) {
      const msg = `__SYS_HAND_RAISE__:${targetUserId}:0:Instructor`;
      chatClientRef.current.sendToAll(msg).catch(() => { });
    }
  }, []);

  // Away status toggle
  const handleToggleAway = useCallback(() => {
    setIsAway((prev) => {
      const next = !prev;
      if (currentUserId) {
        setAwayUsers((u) => ({ ...u, [currentUserId]: next }));
      }
      if (chatClientRef.current && currentUserId) {
        const msg = `__SYS_AWAY_STATUS__:${currentUserId}:${next ? '1' : '0'}:${effectiveUserName}`;
        chatClientRef.current.sendToAll(msg).catch(() => { });
      }
      return next;
    });
  }, [currentUserId, effectiveUserName]);

  // Non-verbal meeting feedback
  const handleSendFeedback = useCallback((type: string) => {
    if (chatClientRef.current && currentUserId) {
      const msg = `__SYS_FEEDBACK__:${currentUserId}:${type}:${effectiveUserName}`;
      chatClientRef.current.sendToAll(msg).catch(() => { });
    }
  }, [currentUserId, effectiveUserName]);

  // Attach User Video Stream into Tile
  const attachUserVideo = async (targetUserId: number) => {
    if (!mediaStreamRef.current) return;
    const tileElement = videoTilesRef.current[targetUserId];
    if (tileElement) {
      try {
        await mediaStreamRef.current.detachVideo(targetUserId).catch(() => { });
        const videoElement = await mediaStreamRef.current.attachVideo(targetUserId, VideoQuality.Video_360P);
        if (videoElement && typeof videoElement !== 'number' && 'nodeType' in videoElement) {
          tileElement.innerHTML = '';
          tileElement.appendChild(videoElement as unknown as Node);
        }
      } catch (e) {
        console.warn(`Failed to attach video for user ${targetUserId}:`, e);
      }
    }
  };

  // Attach / Re-attach Share Stream into Share Container
  const attachShareStream = async (targetUserId: number) => {
    if (!mediaStreamRef.current || !shareContainerRef.current) return;
    try {
      await mediaStreamRef.current.detachShareView(targetUserId).catch(() => { });
      if (shareContainerRef.current) {
        shareContainerRef.current.innerHTML = '';
      }

      const sharePlayerElement = await mediaStreamRef.current.attachShareView(targetUserId);
      if (sharePlayerElement && typeof sharePlayerElement !== 'number' && 'nodeType' in sharePlayerElement) {
        if (shareContainerRef.current) {
          shareContainerRef.current.innerHTML = '';
          shareContainerRef.current.appendChild(sharePlayerElement as unknown as Node);
        }
      }
    } catch (err) {
      console.warn('Error attaching share view:', err);
    }
  };

  // Handle Session Closed / Leave Teardown
  const handleSessionClosed = useCallback(async () => {
    setIsJoined(false);
    setShowMediaConsentModal(false);

    try {
      if (clientRef.current) {
        await clientRef.current.leave().catch(() => { });
      }
    } catch (e) { }

    if (effectiveRole === 'STUDENT') {
      setShowFeedbackModal(true);
    } else {
      const targetUrl = getExitRedirectUrl();
      navigateAway(targetUrl);
    }
  }, [effectiveRole, getExitRedirectUrl, navigateAway]);

  // Initialize and Join Zoom Video SDK Session
  const startSession = async () => {
    try {
      setIsLoading(true);
      setError(null);
      setLoadingText('Fetching session credentials...');

      // 1. Fetch credentials from Zoom signature API
      const signatureData = await fetchZoomSignature(sessionId, effectiveUserId, effectiveRole);
      const signature = signatureData.signature;
      const meetingId = signatureData.meeting_id || signatureData.meetingId || sessionId;
      meetingIdRef.current = meetingId;
      const passcode = signatureData.passcode || '';

      if (!signature) {
        throw new Error('Could not obtain signature for Zoom Video SDK');
      }

      setLoadingText('Initializing Zoom Engine...');

      // 2. Instantiate `@zoom/videosdk` Client
      const client = ZoomVideo.createClient();
      clientRef.current = client;

      // 3. Initialize SDK
      await client.init('en-US', 'Global', {
        patchJsMedia: true,
        enforceMultipleVideos: true,
        leaveOnPageUnload: true,
      });

      setLoadingText('Joining Live Classroom...');

      // 4. Join Session
      await client.join(meetingId, signature, effectiveUserName, passcode);

      // Obtain Stream & Chat Client
      const stream = client.getMediaStream();
      const chat = client.getChatClient();
      mediaStreamRef.current = stream;
      chatClientRef.current = chat;

      const currentUser = client.getCurrentUserInfo();
      if (currentUser) {
        setCurrentUserId(currentUser.userId);
        setIsMuted(!!currentUser.muted);
        setIsVideoOn(!!currentUser.bVideoOn);
      }

      setIsJoined(true);
      setIsLoading(false);
      setShowMediaConsentModal(true);

      // Populate participants
      updateParticipantsList();

      // Check if there's an ongoing screen share on mount
      try {
        const activeShareId = stream.getActiveShareUserId?.();
        if (activeShareId) {
          setActiveShareUserId(activeShareId);
          setTimeout(() => attachShareStream(activeShareId), 300);
        }
      } catch (e) { }

      // 5. Setup SDK Event Listeners
      client.on('user-added', () => {
        updateParticipantsList();
      });

      // User Removed Listener: update participant list, do NOT kick students unless session is ended!
      client.on('user-removed', () => {
        updateParticipantsList();
      });

      client.on('user-updated', () => {
        updateParticipantsList();
      });

      client.on('peer-video-state-change', async (payload: any) => {
        updateParticipantsList();
        const { action, userId } = payload;
        if (action === 'Start') {
          setTimeout(() => {
            attachUserVideo(userId);
          }, 100);
        } else if (action === 'Stop') {
          if (mediaStreamRef.current) {
            await mediaStreamRef.current.detachVideo(userId).catch(() => { });
          }
        }
      });

      client.on('current-audio-change', (payload: any) => {
        if (currentUser && payload.userId === currentUser.userId) {
          setIsMuted(!!payload.muted);
        }
        updateParticipantsList();
      });

      client.on('active-speaker', (payload: any) => {
        if (Array.isArray(payload) && payload.length > 0) {
          setActiveSpeakerId(payload[0].userId);
        }
      });

      client.on('host-ask-unmute-audio', async () => {
        try {
          if (confirm('The instructor is asking you to unmute your microphone. Unmute now?')) {
            await stream.unmuteAudio();
            setIsMuted(false);
            updateParticipantsList();
          }
        } catch (e) { }
      });

      // 1. Active Share Change Listener
      client.on('active-share-change', async (payload: any) => {
        console.log('[Zoom SDK] active-share-change event:', payload);
        const { state, userId } = payload;
        if (state === 'Start') {
          setActiveShareUserId(userId);
          if (currentUser && userId === currentUser.userId) {
            setIsSharing(true);
          }
          setTimeout(() => {
            attachShareStream(userId);
          }, 100);
        } else if (state === 'Stop') {
          setActiveShareUserId(null);
          setIsSharing(false);
          if (shareContainerRef.current) {
            shareContainerRef.current.innerHTML = '';
          }
          if (userId && mediaStreamRef.current) {
            await mediaStreamRef.current.detachShareView(userId).catch(() => { });
          }
        }
      });

      // 2. Peer Share State Change (Immediate start/stop for students)
      client.on('peer-share-state-change', async (payload: any) => {
        console.log('[Zoom SDK] peer-share-state-change event:', payload);
        const { action, userId } = payload;
        if (action === 'Start') {
          setActiveShareUserId(userId);
          setTimeout(() => {
            attachShareStream(userId);
          }, 100);
        } else if (action === 'Stop') {
          setActiveShareUserId(null);
          setIsSharing(false);
          if (shareContainerRef.current) {
            shareContainerRef.current.innerHTML = '';
          }
          if (userId && mediaStreamRef.current) {
            await mediaStreamRef.current.detachShareView(userId).catch(() => { });
          }
        }
      });

      // 3. Share Content Change (When host switches tabs, window, or entire screen content)
      client.on('share-content-change', (payload: any) => {
        console.log('[Zoom SDK] share-content-change event:', payload);
        const targetId = payload.userId || activeShareUserId;
        if (targetId) {
          attachShareStream(targetId);
        }
      });

      // 4. Passively Stop Share (When host clicks browser "Stop sharing" bar)
      client.on('passively-stop-share', () => {
        console.log('[Zoom SDK] passively-stop-share event');
        setIsSharing(false);
        setActiveShareUserId(null);
        if (shareContainerRef.current) {
          shareContainerRef.current.innerHTML = '';
        }
        if (mediaStreamRef.current && activeShareUserId) {
          mediaStreamRef.current.detachShareView(activeShareUserId).catch(() => { });
        }
        if (document.fullscreenElement && document.exitFullscreen) {
          document.exitFullscreen().catch(() => { });
        }
      });

      // Connection Closed / Session Ended by Host (ONLY trigger when host explicitly ENDS meeting)
      client.on('connection-change', (payload: any) => {
        console.log('[Zoom SDK] Connection State Change:', payload);
        if (payload.state === 'Closed' || payload.reason === 'ended by host' || payload.reason === 'kicked by host') {
          handleSessionClosed();
        }
      });

      // Chat Message Listener with Strict Deduplication & File Info capture
      client.on('chat-on-message', (payload: any) => {
        console.log('[Zoom SDK] chat-on-message event payload:', payload);
        const senderId = payload.sender?.userId;
        const ts = payload.timestamp || Date.now();
        const msgId = payload.id || `msg-${ts}-${senderId}`;

        // Capture incoming file metadata if present
        const incomingFileInfo = payload.file
          ? {
            name: payload.file.name || 'Attachment',
            size: payload.file.size || 0,
            type: payload.file.type || '',
            url: payload.file.fileUrl || '',
          }
          : undefined;

        const msgText = payload.message || (incomingFileInfo ? `Sent attachment: ${incomingFileInfo.name}` : '');

        // Intercept internal screen share permission commands
        if (typeof msgText === 'string' && msgText.startsWith('__SYS_SCREEN_SHARE__')) {
          const parts = msgText.split(':');
          const command = parts[1]; // 'REQUEST' | 'GRANT' | 'DECLINE'
          const reqUserId = Number(parts[2]);
          const reqUserName = parts[3] || 'Student';

          if (command === 'REQUEST' && effectiveRole === 'INSTRUCTOR') {
            // Instructor receives screen share request from student
            setIncomingShareRequest({
              userId: reqUserId,
              userName: reqUserName,
            });
          } else if (command === 'GRANT') {
            if (currentUser && reqUserId === currentUser.userId) {
              setHasSharePermission(true);
              setIsWaitingForShareApproval(false);
              setShareRequestStatus('granted');
              // Automatically initiate screen share
              setTimeout(() => {
                startScreenShareFlow();
              }, 300);
            }
          } else if (command === 'DECLINE') {
            if (currentUser && reqUserId === currentUser.userId) {
              setIsWaitingForShareApproval(false);
              setShareRequestStatus('declined');
            }
          }
          return; // Do NOT render internal system commands in chat
        }

        // Intercept reaction effects & emojis
        if (typeof msgText === 'string' && msgText.startsWith('__SYS_REACTION__:')) {
          try {
            const data = JSON.parse(msgText.replace('__SYS_REACTION__:', ''));
            if (data.senderId !== currentUserId) {
              triggerFloatingReaction(data.emoji, data.senderName, data.isEffect);
            }
          } catch (e) {
            console.warn('Error parsing sys reaction:', e);
          }
          return;
        }

        // Intercept hand raise events (No floating reactions, updates participant status)
        if (typeof msgText === 'string' && msgText.startsWith('__SYS_HAND_RAISE__:')) {
          const parts = msgText.split(':');
          const uid = Number(parts[1]);
          const state = parts[2] === '1';
          setRaisedHandUsers((prev) => ({ ...prev, [uid]: state }));
          if (uid === currentUserId) {
            setIsHandRaised(state);
          }
          return;
        }

        // Intercept away status events (No floating reactions)
        if (typeof msgText === 'string' && msgText.startsWith('__SYS_AWAY_STATUS__:')) {
          const parts = msgText.split(':');
          const uid = Number(parts[1]);
          const state = parts[2] === '1';
          setAwayUsers((prev) => ({ ...prev, [uid]: state }));
          if (uid === currentUserId) {
            setIsAway(state);
          }
          return;
        }

        // Intercept meeting feedback (No floating reactions)
        if (typeof msgText === 'string' && msgText.startsWith('__SYS_FEEDBACK__:')) {
          return;
        }

        setMessages((prev) => {
          // Check for duplicate message
          const isDuplicate = prev.some(
            (m) =>
              m.id === msgId ||
              (m.senderId === senderId &&
                (m.text === msgText || (m.fileInfo && incomingFileInfo && m.fileInfo.name === incomingFileInfo.name)) &&
                Math.abs(m.timestamp - ts) < 5000)
          );
          if (isDuplicate) {
            // Update existing message with real Zoom msgId and fileInfo.url if missing
            return prev.map((m) => {
              if (
                (m.id === msgId ||
                  (m.senderId === senderId &&
                    (m.text === msgText || (m.fileInfo && incomingFileInfo && m.fileInfo.name === incomingFileInfo.name)))) &&
                incomingFileInfo
              ) {
                return {
                  ...m,
                  id: msgId,
                  fileInfo: {
                    ...m.fileInfo,
                    ...incomingFileInfo,
                    url: incomingFileInfo.url || m.fileInfo?.url || '',
                  },
                };
              }
              return m;
            });
          }

          const newMsg: ChatMessageItem = {
            id: msgId,
            senderName: payload.sender?.name || 'User',
            senderId: senderId,
            receiverName: payload.receiver?.name,
            receiverId: payload.receiver?.userId,
            text: msgText,
            fileInfo: incomingFileInfo,
            timestamp: ts,
            isSelf: senderId === currentUser?.userId,
            isPrivate: !!payload.receiver?.userId,
          };
          return [...prev, newMsg];
        });

        setActiveTab((currentTab) => {
          if (currentTab !== 'chat') {
            setUnreadChatCount((count) => count + 1);
          }
          return currentTab;
        });
      });

    } catch (err: any) {
      console.error('[Zoom SDK Join Error]:', err);
      setIsJoined(false);
      setError(err.message || 'Failed to connect to Zoom Video SDK session.');
    } finally {
      setIsLoading(false);
    }
  };

  // Mount effect
  useEffect(() => {
    startSession();

    return () => {
      if (clientRef.current) {
        clientRef.current.leave().catch(() => { });
      }
    };
  }, []);

  // Monitor Fullscreen
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      if (containerRef.current?.requestFullscreen) {
        containerRef.current.requestFullscreen().catch(() => { });
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => { });
      }
    }
  }, []);

  // Media Controls Handlers
  const toggleAudio = async () => {
    if (!mediaStreamRef.current) return;
    try {
      if (typeof mediaStreamRef.current.isAudioStarted === 'function' && !mediaStreamRef.current.isAudioStarted()) {
        await mediaStreamRef.current.startAudio();
        setIsMuted(false);
        updateParticipantsList();
        return;
      }

      if (isMuted) {
        await mediaStreamRef.current.unmuteAudio();
        setIsMuted(false);
      } else {
        await mediaStreamRef.current.muteAudio();
        setIsMuted(true);
      }
      updateParticipantsList();
    } catch (e) {
      console.error('Toggle audio error:', e);
    }
  };

  const toggleVideo = async () => {
    if (!mediaStreamRef.current || !currentUserId) return;
    try {
      if (isVideoOn) {
        await mediaStreamRef.current.stopVideo();
        setIsVideoOn(false);
        await mediaStreamRef.current.detachVideo(currentUserId).catch(() => { });
      } else {
        await mediaStreamRef.current.startVideo();
        setIsVideoOn(true);
        setTimeout(() => {
          attachUserVideo(currentUserId);
        }, 150);
      }
      updateParticipantsList();
    } catch (e) {
      console.error('Toggle video error:', e);
    }
  };

  const startScreenShareFlow = async () => {
    if (!mediaStreamRef.current) return;
    try {
      if (shareContainerRef.current) {
        shareContainerRef.current.innerHTML = '';
      }

      let shareVideoEl = document.createElement('video');
      shareVideoEl.id = 'zoom-local-share-video';
      shareVideoEl.autoplay = true;
      shareVideoEl.playsInline = true;
      shareVideoEl.muted = true;
      shareVideoEl.style.width = '100%';
      shareVideoEl.style.height = '100%';
      shareVideoEl.style.objectFit = 'contain';

      if (shareContainerRef.current) {
        shareContainerRef.current.appendChild(shareVideoEl);
      }

      console.log('[Zoom SDK] Triggering startShareScreen with visible Video element...');
      await mediaStreamRef.current.startShareScreen(shareVideoEl);
      setIsSharing(true);
      if (currentUserId) {
        setActiveShareUserId(currentUserId);
      }

      // Automatically request browser full screen to cover windows/tabs
      if (!document.fullscreenElement && containerRef.current?.requestFullscreen) {
        containerRef.current.requestFullscreen().catch(() => { });
      }
    } catch (e: any) {
      console.error('Start share screen error:', e);
      setIsSharing(false);
    }
  };

  const stopScreenShareFlow = async () => {
    if (!mediaStreamRef.current) return;
    try {
      console.log('[Zoom SDK] Stopping screen share...');
      await mediaStreamRef.current.stopShareScreen();
      setIsSharing(false);
      setActiveShareUserId(null);
      if (shareContainerRef.current) {
        shareContainerRef.current.innerHTML = '';
      }
      if (document.fullscreenElement && document.exitFullscreen) {
        document.exitFullscreen().catch(() => { });
      }
    } catch (e) {
      console.error('Stop share screen error:', e);
    }
  };

  const toggleShareScreen = async () => {
    if (isSharing) {
      await stopScreenShareFlow();
    } else {
      await startScreenShareFlow();
    }
  };

  // Student initiates screen share request or starts share if already allowed
  const handleStudentShareClick = () => {
    if (isSharing) {
      stopScreenShareFlow();
      return;
    }

    if (hasSharePermission) {
      startScreenShareFlow();
      return;
    }

    // Student has no permission yet: send request to host
    if (chatClientRef.current) {
      setIsWaitingForShareApproval(true);
      setShareRequestStatus('pending');
      const reqMsg = `__SYS_SCREEN_SHARE__:REQUEST:${currentUserId}:${effectiveUserName}`;
      const targetHostId = hostUser?.userId;
      if (targetHostId) {
        chatClientRef.current.send(reqMsg, targetHostId).catch(() => {
          chatClientRef.current.sendToAll(reqMsg).catch(() => { });
        });
      } else {
        chatClientRef.current.sendToAll(reqMsg).catch(() => { });
      }
    } else {
      alert('Connecting to meeting chat... please try again in a moment.');
    }
  };

  // Instructor approves student's screen share request
  const handleInstructorApproveShare = async (studentUserId: number) => {
    setIncomingShareRequest(null);
    if (chatClientRef.current) {
      const grantMsg = `__SYS_SCREEN_SHARE__:GRANT:${studentUserId}`;
      await chatClientRef.current.send(grantMsg, studentUserId).catch(() => {
        chatClientRef.current.sendToAll(grantMsg).catch(() => { });
      });
    }
  };

  // Instructor declines student's screen share request
  const handleInstructorDeclineShare = async (studentUserId: number) => {
    setIncomingShareRequest(null);
    if (chatClientRef.current) {
      const declineMsg = `__SYS_SCREEN_SHARE__:DECLINE:${studentUserId}`;
      await chatClientRef.current.send(declineMsg, studentUserId).catch(() => {
        chatClientRef.current.sendToAll(declineMsg).catch(() => { });
      });
    }
  };

  // Host Controls on Students
  const handleHostMuteStudent = async (studentUserId: number, mute: boolean) => {
    if (effectiveRole !== 'INSTRUCTOR' || !mediaStreamRef.current) return;
    try {
      if (mute) {
        await mediaStreamRef.current.muteAudio(studentUserId);
      } else {
        await mediaStreamRef.current.unmuteAudio(studentUserId);
      }
      updateParticipantsList();
    } catch (e) {
      console.error('Host mute student error:', e);
    }
  };

  // Send Chat Message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || !chatClientRef.current || !currentUserId) return;

    const textToSend = chatInput.trim();
    setChatInput('');
    setShowEmojiPicker(false);

    try {
      const targetId = effectiveRole === 'STUDENT' ? (hostUser?.userId || chatRecipientId) : chatRecipientId;

      if (effectiveRole === 'STUDENT') {
        if (targetId) {
          await chatClientRef.current.send(textToSend, targetId);
        }
      } else {
        if (targetId === 0) {
          await chatClientRef.current.sendToAll(textToSend);
        } else {
          await chatClientRef.current.send(textToSend, targetId);
        }
      }

      const recipientName =
        targetId === 0
          ? 'Everyone'
          : participants.find((p) => p.userId === targetId)?.displayName || 'Host';

      const localMsg: ChatMessageItem = {
        id: `self-${Date.now()}`,
        senderName: effectiveUserName,
        senderId: currentUserId,
        receiverName: recipientName,
        receiverId: targetId,
        text: textToSend,
        timestamp: Date.now(),
        isSelf: true,
        isPrivate: targetId !== 0,
      };

      setMessages((prev) => {
        if (prev.some((m) => m.text === textToSend && m.senderId === currentUserId && Math.abs(m.timestamp - localMsg.timestamp) < 3000)) {
          return prev;
        }
        return [...prev, localMsg];
      });
    } catch (e) {
      console.error('Send chat error:', e);
    }
  };

  // Handle File Upload in Chat via Zoom Video SDK Native File Sharing
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !chatClientRef.current || !currentUserId) return;

    try {
      const targetId = effectiveRole === 'STUDENT' ? (hostUser?.userId || chatRecipientId) : chatRecipientId;

      if (typeof chatClientRef.current.sendFile === 'function') {
        console.log('[Zoom SDK] Sending file native via chatClient.sendFile:', file.name, 'to targetId:', targetId);
        await chatClientRef.current.sendFile(file, targetId);
      }

      const recipientName =
        targetId === 0
          ? 'Everyone'
          : participants.find((p) => p.userId === targetId)?.displayName || 'Host';

      const fileMsg: ChatMessageItem = {
        id: `file-${Date.now()}`,
        senderName: effectiveUserName,
        senderId: currentUserId,
        receiverName: recipientName,
        receiverId: targetId,
        text: `Sent attachment: ${file.name}`,
        fileInfo: {
          name: file.name,
          size: file.size,
          type: file.type,
          url: '',
        },
        timestamp: Date.now(),
        isSelf: true,
        isPrivate: targetId !== 0,
      };

      setMessages((prev) => {
        if (
          prev.some(
            (m) =>
              m.fileInfo &&
              m.fileInfo.name === file.name &&
              m.senderId === currentUserId &&
              Math.abs(m.timestamp - fileMsg.timestamp) < 5000
          )
        ) {
          return prev;
        }
        return [...prev, fileMsg];
      });
    } catch (err) {
      console.error('File upload error:', err);
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Handle File Download Action via Zoom Video SDK Native chatClient.downloadFile
  const handleDownloadFile = async (msgId: string, fileInfo: any) => {
    if (!fileInfo || !chatClientRef.current) return;
    try {
      console.log('[Zoom SDK] Downloading file via Zoom SDK native chatClient.downloadFile:', msgId, fileInfo);
      const fileUrl = fileInfo.url || '';
      if (typeof chatClientRef.current.downloadFile === 'function') {
        await chatClientRef.current.downloadFile(msgId, fileUrl);
      }
    } catch (e) {
      console.error('Download file error:', e);
    }
  };

  // Append Emoji to input
  const addEmojiToInput = (emoji: string) => {
    setChatInput((prev) => prev + emoji);
  };

  // Handle Leave / End Session Button Action
  const handleLeaveOrEndClick = () => {
    if (effectiveRole === 'INSTRUCTOR') {
      setShowEndConfirmModal(true);
    } else {
      leaveSessionAsStudent();
    }
  };

  const leaveSessionAsStudent = async () => {
    try {
      await leaveZoomMeeting(sessionId, effectiveUserId, 'STUDENT');
      await handleSessionClosed();
    } catch (e) {
      handleSessionClosed();
    }
  };

  // Instructor Leaves Session ONLY (Meeting stays alive for students)
  const leaveSessionAsInstructor = async () => {
    setShowEndConfirmModal(false);
    try {
      // Call leave endpoint passing role 'STUDENT' so backend does NOT terminate room!
      await leaveZoomMeeting(sessionId, effectiveUserId, 'STUDENT');
      if (clientRef.current) {
        await clientRef.current.leave(false).catch(() => { });
      }
    } catch (e) {
      console.error('Error leaving meeting as instructor:', e);
    } finally {
      handleSessionClosed();
    }
  };

  // Instructor ENDS Session for Everyone
  const endSessionAsInstructor = async () => {
    setShowEndConfirmModal(false);
    try {
      // 1. Notify backend that meeting has ended
      try {
        await endZoomMeeting(sessionId, effectiveUserId, 'INSTRUCTOR');
      } catch (endErr) {
        console.warn('[Zoom Session] endZoomMeeting error:', endErr);
      }

      // 2. Leave Zoom client session
      if (clientRef.current) {
        await clientRef.current.leave(true).catch(() => { });
      }
    } catch (e) {
      console.error('Error ending meeting:', e);
    } finally {
      handleSessionClosed();
    }
  };

  // Student Feedback Handlers
  const handleSubmitFeedback = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSubmittingFeedback(true);
    try {
      await fetch('/api/meetings/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          userId: effectiveUserId,
          rating: feedbackRating,
          feedback: feedbackText,
          tags: [],
        }),
      });
      setFeedbackSubmitted(true);
      setTimeout(() => {
        const targetUrl = getExitRedirectUrl();
        navigateAway(targetUrl);
      }, 1600);
    } catch (err) {
      console.error('Error submitting feedback:', err);
      setFeedbackSubmitted(true);
      setTimeout(() => {
        const targetUrl = getExitRedirectUrl();
        navigateAway(targetUrl);
      }, 1200);
    } finally {
      setIsSubmittingFeedback(false);
    }
  };

  const handleSkipFeedback = () => {
    setShowFeedbackModal(false);
    const targetUrl = getExitRedirectUrl();
    navigateAway(targetUrl);
  };

  // Media Consent Handlers
  const handleEnableMediaConsent = async () => {
    setShowMediaConsentModal(false);
    try {
      if (mediaStreamRef.current) {
        await mediaStreamRef.current.startAudio();
        setIsMuted(false);
        await mediaStreamRef.current.startVideo();
        setIsVideoOn(true);
        updateParticipantsList();
        if (currentUserId) {
          setTimeout(() => attachUserVideo(currentUserId), 200);
        }
      }
    } catch (e) {
      console.warn('User media setup:', e);
    }
  };

  // Visible Video Users for Video Grid:
  // STUDENT: Sees 2 tiles (Host + Self)
  // INSTRUCTOR: Sees ALL participants
  let visibleVideoUsers: Participant[] = [];
  if (effectiveRole === 'STUDENT') {
    const hostP = participants.find((p) => p.isHost || p.isManager || p.userId === hostUser?.userId);
    const selfP = participants.find((p) => p.userId === currentUserId);

    if (hostP) visibleVideoUsers.push(hostP);
    if (selfP && (!hostP || selfP.userId !== hostP.userId)) visibleVideoUsers.push(selfP);

    if (visibleVideoUsers.length === 0) {
      visibleVideoUsers = participants;
    }
  } else {
    visibleVideoUsers = participants;
  }

  // Visible Participants List for Participants Drawer:
  // STUDENT: Sees ONLY Host + Self
  // INSTRUCTOR: Sees ALL participants
  // Students with Raised Hands appear at the TOP of the student list, followed by other participants
  const visibleParticipantsDrawerList = useMemo(() => {
    const list = effectiveRole === 'STUDENT'
      ? participants.filter((p) => p.isHost || p.isManager || p.userId === hostUser?.userId || p.userId === currentUserId)
      : [...participants];

    return list.sort((a, b) => {
      const aIsHost = a.isHost || a.isManager || a.userId === hostUser?.userId;
      const bIsHost = b.isHost || b.isManager || b.userId === hostUser?.userId;
      if (aIsHost && !bIsHost) return -1;
      if (!aIsHost && bIsHost) return 1;

      const aHand = (a.userId === currentUserId ? isHandRaised : !!raisedHandUsers[a.userId]) || (a as any).isHandRaised;
      const bHand = (b.userId === currentUserId ? isHandRaised : !!raisedHandUsers[b.userId]) || (b as any).isHandRaised;
      if (aHand && !bHand) return -1;
      if (!aHand && bHand) return 1;

      return (a.displayName || '').localeCompare(b.displayName || '');
    });
  }, [effectiveRole, participants, hostUser, currentUserId, isHandRaised, raisedHandUsers]);

  const isScreenShareActive = !!activeShareUserId || isSharing;

  return (
    <div
      ref={containerRef}
      className="w-full h-screen bg-[#0d0f17] text-white flex flex-col relative overflow-hidden font-sans select-none"
    >
      {/* INSTRUCTOR SLEEK GREEN BORDER FRAME (FRAMES ENTIRE FULL SCREEN) */}
      {effectiveRole === 'INSTRUCTOR' && (isSharing || (currentUserId !== null && activeShareUserId === currentUserId)) && (
        <>
          {/* Floating Top Screen Share Status Banner */}
          <div className="fixed top-3 left-1/2 -translate-x-1/2 z-[90] pointer-events-auto flex items-center space-x-3 px-4 py-2 rounded-2xl bg-[#131722]/95 border border-[#22c55e]/70 shadow-2xl backdrop-blur-xl animate-in fade-in slide-in-from-top-3 duration-200">
            <div className="flex items-center space-x-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-80" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-[#22c55e]" />
              </span>
              <span className="text-xs font-bold text-white tracking-wide">
                You are screen sharing
              </span>
            </div>

            <button
              type="button"
              onClick={toggleShareScreen}
              className="px-3 py-1 rounded-xl bg-red-600 hover:bg-red-500 text-white text-[11px] font-bold flex items-center space-x-1.5 transition-all shadow-md shadow-red-600/30 cursor-pointer"
              title="Stop sharing your screen"
            >
              <ScreenShare className="w-3.5 h-3.5" />
              <span>Stop Share</span>
            </button>
          </div>
        </>
      )}

      {/* Global CSS for centering camera and screen share elements */}
      <style>{`
        video-player-container {
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          width: 100% !important;
          height: 100% !important;
          position: relative !important;
          overflow: hidden !important;
        }
        video-player-container video-player,
        video-player-container video,
        video-player-container canvas {
          width: 100% !important;
          height: 100% !important;
          object-fit: contain !important;
        }
      `}</style>

      {/* COMBINED ACADEMY AND SESSION HEADER */}
      <header className="relative h-16 shrink-0 px-5 sm:px-8 bg-[#0b0e18]/95 border-b border-white/10 flex items-center justify-between z-30 backdrop-blur-md">
        <Logo className="h-8 sm:h-9 w-auto shrink-0" />

        {/* Center Info: Course & Session */}
        <div className="absolute left-1/2 -translate-x-1/2 text-center min-w-0 w-[45%] sm:w-auto sm:max-w-[45%]">
          <p className="text-[11px] text-slate-400 truncate">{displayCourseTitle}</p>
          <h1 className="text-sm font-bold text-white tracking-tight truncate">{displaySessionTitle}</h1>
        </div>

        {/* Right Info: Role Badge, Fullscreen & Status */}
        <div className="flex items-center space-x-3">
          <div className="hidden sm:flex items-center space-x-2 bg-white/5 border border-white/10 px-3 py-1 rounded-xl text-xs text-slate-300">
            <Shield className="w-3.5 h-3.5 text-blue-400" />
            <span>{effectiveRole === 'INSTRUCTOR' ? 'Host / Instructor' : 'Student Mode'}</span>
          </div>

          <button
            onClick={toggleFullscreen}
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 transition-all cursor-pointer"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* MAIN VIDEO STAGE AREA */}
      <div className="flex-1 relative flex overflow-hidden bg-[#070913]">

        {/* ACTIVE SCREEN SHARE CONTAINER (Main Stage in center with full visibility) */}
        <div
          className={`absolute inset-0 z-10 bg-black flex items-center justify-center w-full h-full overflow-hidden ${isScreenShareActive ? 'block' : 'hidden'
            }`}
        >
          <video-player-container
            ref={shareContainerRef}
            id="zoom-share-container"
            className="w-full h-full flex items-center justify-center"
          />
        </div>

        {/* ZOOM ANNOTATION TOOLBAR & DRAWING CANVAS OVERLAY */}
        {isScreenShareActive && (
          <ZoomAnnotationToolbar
            isOpen={isAnnotating}
            onOpen={() => setIsAnnotating(true)}
            onClose={() => setIsAnnotating(false)}
            containerRef={containerRef}
            isHost={effectiveRole === 'INSTRUCTOR'}
          />
        )}

        {/* OVERLAY FOR VIDEO TILES WHEN SCREEN SHARE IS ACTIVE (Minimizable in top corner) */}
        {isScreenShareActive && (
          <div className="absolute top-4 right-4 z-30 pointer-events-auto">
            {isTilesMinimized ? (
              <button
                onClick={() => setIsTilesMinimized(false)}
                className="px-4 py-2.5 rounded-2xl bg-[#131722]/90 border border-white/20 text-white text-xs font-bold shadow-2xl backdrop-blur-md flex items-center space-x-2.5 hover:bg-white/10 transition-all cursor-pointer"
              >
                <Video className="w-4 h-4 text-blue-400" />
                <span>Show Video Tiles ({visibleVideoUsers.length})</span>
                <ChevronDown className="w-4 h-4 text-slate-400" />
              </button>
            ) : (
              <div className="w-72 sm:w-80 bg-[#131722]/95 border border-white/15 rounded-2xl p-3 shadow-2xl backdrop-blur-xl flex flex-col space-y-2.5">
                {/* Header with Minimize button */}
                <div className="flex items-center justify-between pb-2 border-b border-white/10 text-xs font-semibold text-slate-300">
                  <span className="flex items-center gap-1.5">
                    <Video className="w-4 h-4 text-blue-400" />
                    <span>Video Tiles</span>
                  </span>
                  <button
                    onClick={() => setIsTilesMinimized(true)}
                    title="Minimize video tiles to view full screen share"
                    className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-slate-200 hover:text-white transition-colors cursor-pointer text-[11px] flex items-center gap-1 font-bold"
                  >
                    <Minus className="w-3.5 h-3.5" /> Minimize
                  </button>
                </div>

                {/* Small overlay tiles */}
                <div className="flex flex-col space-y-2 max-h-80 overflow-y-auto pr-0.5">
                  {visibleVideoUsers.map((u) => {
                    const isSelf = u.userId === currentUserId;
                    const isHostTile = u.isHost || u.isManager || u.userId === hostUser?.userId;
                    const isSpeaking = u.userId === activeSpeakerId;
                    const userRaisedHand = isSelf ? isHandRaised : !!raisedHandUsers[u.userId];
                    const userIsAway = isSelf ? isAway : !!awayUsers[u.userId];

                    return (
                      <div
                        key={u.userId}
                        className={`relative h-32 rounded-xl overflow-hidden bg-[#121624] border flex items-center justify-center transition-all ${isSpeaking ? 'border-emerald-500 ring-2 ring-emerald-500/30' : 'border-white/10'
                          }`}
                      >
                        <div
                          ref={(el) => {
                            if (el) {
                              videoTilesRef.current[u.userId] = el;
                              if (u.bVideoOn) {
                                attachUserVideo(u.userId);
                              }
                            }
                          }}
                          id={`video-tile-overlay-${u.userId}`}
                          className="w-full h-full absolute inset-0 z-0 bg-[#0c0e17] flex items-center justify-center"
                        />

                        {!u.bVideoOn && (
                          <div className="absolute inset-0 z-10 flex items-center justify-center bg-[#181c2e]">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-500 text-white font-extrabold text-sm flex items-center justify-center shadow-lg border border-white/20">
                              {u.displayName?.substring(0, 2).toUpperCase() || 'U'}
                            </div>
                          </div>
                        )}

                        <div className="absolute top-2 left-2 z-20 flex items-center space-x-1">
                          {isHostTile && (
                            <span className="bg-amber-500/90 text-black font-extrabold text-[9px] uppercase px-1.5 py-0.5 rounded flex items-center gap-0.5 shadow-md">
                              <Crown className="w-2.5 h-2.5" /> Host
                            </span>
                          )}
                          {isSelf && (
                            <span className="bg-blue-600/80 text-white font-bold text-[9px] px-1.5 py-0.5 rounded">
                              You
                            </span>
                          )}
                          {userRaisedHand && (
                            <span className="bg-amber-500 text-black font-extrabold text-[9px] px-1.5 py-0.5 rounded flex items-center gap-0.5 shadow-md animate-bounce">
                              ✋ Hand
                            </span>
                          )}
                          {userIsAway && (
                            <span className="bg-slate-800 text-amber-300 font-bold text-[9px] px-1.5 py-0.5 rounded flex items-center gap-0.5 border border-amber-400/30">
                              ⌛ Away
                            </span>
                          )}
                        </div>

                        {/* Interactive Mic Button on Overlay Tile */}
                        <div className="absolute bottom-2 left-2 right-2 z-20 flex items-center justify-between bg-black/60 backdrop-blur-md px-2 py-1 rounded-lg border border-white/10">
                          <span className="text-[11px] font-semibold text-slate-200 truncate">
                            {u.displayName}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (isSelf) {
                                toggleAudio();
                              } else if (effectiveRole === 'INSTRUCTOR') {
                                handleHostMuteStudent(u.userId, !u.muted);
                              }
                            }}
                            title={u.muted ? 'Unmute' : 'Mute'}
                            className="p-1 rounded bg-white/10 hover:bg-white/20 transition-all cursor-pointer pointer-events-auto"
                          >
                            {u.muted ? (
                              <MicOff className="w-3 h-3 text-red-400" />
                            ) : (
                              <Mic className="w-3 h-3 text-emerald-400" />
                            )}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* MAIN GRID VIEW (When Screen Share is NOT Active) */}
        {!isScreenShareActive && (
          <div className="flex-1 p-6 flex items-center justify-center relative z-0">
            <div
              className={`w-full h-full max-h-[680px] grid gap-6 mx-auto items-center justify-center ${effectiveRole === 'STUDENT'
                ? 'grid-cols-1 sm:grid-cols-2 max-w-4xl'
                : visibleVideoUsers.length <= 1
                  ? 'grid-cols-1 max-w-4xl'
                  : visibleVideoUsers.length <= 4
                    ? 'grid-cols-1 sm:grid-cols-2 max-w-5xl'
                    : 'grid-cols-2 md:grid-cols-3 max-w-7xl'
                }`}
            >
              {visibleVideoUsers.length === 0 ? (
                <div className="flex flex-col items-center justify-center text-center p-8 bg-[#111422]/60 border border-white/10 rounded-3xl backdrop-blur-xl space-y-4 my-auto col-span-full">
                  <div className="w-16 h-16 rounded-3xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
                    <Sparkles className="w-8 h-8 animate-spin" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-lg font-bold text-white">Connecting to Live Classroom...</h3>
                    <p className="text-xs text-slate-400 max-w-sm">
                      Your video feed and instructor stream are initializing...
                    </p>
                  </div>
                </div>
              ) : (
                visibleVideoUsers.map((u) => {
                  const isSelf = u.userId === currentUserId;
                  const isHostTile = u.isHost || u.isManager || u.userId === hostUser?.userId;
                  const isSpeaking = u.userId === activeSpeakerId;
                  const userRaisedHand = isSelf ? isHandRaised : !!raisedHandUsers[u.userId];
                  const userIsAway = isSelf ? isAway : !!awayUsers[u.userId];

                  return (
                    <div
                      key={u.userId}
                      className={`relative w-full h-full min-h-[260px] sm:min-h-[320px] rounded-3xl overflow-hidden bg-[#121624] border transition-all shadow-2xl flex flex-col items-center justify-center group ${isSpeaking ? 'border-emerald-500 shadow-emerald-500/20 ring-2 ring-emerald-500/30' : 'border-white/10'
                        }`}
                    >
                      {/* Video Player Container */}
                      <div
                        ref={(el) => {
                          if (el) {
                            videoTilesRef.current[u.userId] = el;
                            if (u.bVideoOn) {
                              attachUserVideo(u.userId);
                            }
                          }
                        }}
                        id={`video-tile-${u.userId}`}
                        className="w-full h-full absolute inset-0 z-0 bg-[#0c0e17] flex items-center justify-center overflow-hidden"
                      />

                      {/* Avatar when camera is off */}
                      {!u.bVideoOn && (
                        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-gradient-to-b from-[#181c2e] to-[#0d101d]">
                          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-500 text-white font-extrabold text-3xl flex items-center justify-center shadow-xl border-4 border-white/20">
                            {u.displayName?.substring(0, 2).toUpperCase() || 'U'}
                          </div>
                          <span className="text-xs text-slate-400 mt-3 font-semibold">Camera Off</span>
                        </div>
                      )}

                      {/* Top Badges */}
                      <div className="absolute top-4 left-4 z-20 flex items-center space-x-2">
                        {isHostTile && (
                          <span className="bg-amber-500/90 text-black font-extrabold text-xs uppercase px-2.5 py-1 rounded-lg flex items-center gap-1 shadow-lg">
                            <Crown className="w-3.5 h-3.5" /> Host / Instructor
                          </span>
                        )}
                        {isSelf && (
                          <span className="bg-blue-600/90 text-white font-bold text-xs px-2.5 py-1 rounded-lg shadow-lg">
                            You ({effectiveRole === 'STUDENT' ? 'Student' : 'Host'})
                          </span>
                        )}
                        {userRaisedHand && (
                          <span className="bg-amber-500 text-black font-extrabold text-xs px-2.5 py-1 rounded-lg flex items-center gap-1 shadow-lg shadow-amber-500/30 animate-bounce">
                            ✋ Hand Raised
                          </span>
                        )}
                        {userIsAway && (
                          <span className="bg-slate-800 text-amber-300 font-bold text-xs px-2.5 py-1 rounded-lg flex items-center gap-1 border border-amber-400/30 shadow-md">
                            ⌛ Away
                          </span>
                        )}
                      </div>

                      {/* Interactive Mic Button on Video Tile Overlay */}
                      <div className="absolute bottom-4 left-4 right-4 z-20 flex items-center justify-between bg-black/60 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/10 shadow-lg">
                        <span className="text-sm font-bold text-slate-100 truncate max-w-[200px]">
                          {u.displayName}
                        </span>
                        <div className="flex items-center space-x-2 pointer-events-auto">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (isSelf) {
                                toggleAudio();
                              } else if (effectiveRole === 'INSTRUCTOR') {
                                handleHostMuteStudent(u.userId, !u.muted);
                              }
                            }}
                            title={isSelf ? (isMuted ? 'Unmute Mic' : 'Mute Mic') : (u.muted ? 'Unmute Student' : 'Mute Student')}
                            className={`p-2 rounded-xl border transition-all cursor-pointer flex items-center justify-center ${u.muted
                              ? 'bg-red-500/20 text-red-400 border-red-500/40 hover:bg-red-500/30'
                              : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40 hover:bg-emerald-500/30'
                              }`}
                          >
                            {u.muted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* SIDE PANELS: CHAT & PARTICIPANTS */}
        {activeTab !== 'none' && (
          <div className="w-88 sm:w-96 bg-[#131722]/95 border-l border-white/10 flex flex-col z-40 backdrop-blur-xl shadow-2xl animate-in slide-in-from-right duration-200">

            {/* Panel Header */}
            <div className="h-14 px-5 border-b border-white/10 flex items-center justify-between">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                {activeTab === 'chat' ? (
                  <>
                    <MessageSquare className="w-4 h-4 text-blue-400" />
                    <span>Classroom Chat</span>
                  </>
                ) : (
                  <>
                    <Users className="w-4 h-4 text-emerald-400" />
                    <span>Participants ({visibleParticipantsDrawerList.length})</span>
                  </>
                )}
              </h2>
              <button
                onClick={() => setActiveTab('none')}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* CHAT TAB CONTENT */}
            {activeTab === 'chat' && (
              <div className="flex-1 flex flex-col overflow-hidden">
                {/* Messages List */}
                <div className="flex-1 p-4 overflow-y-auto space-y-3">
                  {messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500 space-y-2">
                      <MessageSquare className="w-8 h-8 opacity-40" />
                      <p className="text-xs">No messages yet. Ask a question to start!</p>
                    </div>
                  ) : (
                    messages.map((m) => (
                      <div
                        key={m.id}
                        className={`flex flex-col ${m.isSelf ? 'items-end' : 'items-start'}`}
                      >
                        <div className="flex items-center space-x-1.5 mb-1 text-[11px] text-slate-400">
                          <span className="font-semibold text-slate-300">{m.senderName}</span>
                          {m.isPrivate && (
                            <span className="bg-purple-500/20 text-purple-300 text-[9px] px-1.5 py-0.2 rounded border border-purple-500/30 font-bold">
                              Private to {m.receiverName}
                            </span>
                          )}
                        </div>

                        {/* Text Message Bubble */}
                        {m.text && (
                          <div
                            className={`max-w-[85%] px-3.5 py-2.5 rounded-2xl text-xs leading-relaxed ${m.isSelf
                              ? 'bg-blue-600 text-white rounded-br-none'
                              : 'bg-white/10 text-slate-200 rounded-bl-none border border-white/10'
                              }`}
                          >
                            {m.text}
                          </div>
                        )}

                        {/* File Attachment Card (Fully Clickable for Sender & Recipient) */}
                        {m.fileInfo && (
                          <div
                            onClick={() => handleDownloadFile(m.id, m.fileInfo)}
                            className="mt-1.5 max-w-[85%] p-3 rounded-2xl bg-[#182035] hover:bg-[#202a46] border border-blue-500/30 shadow-xl flex items-center space-x-3 cursor-pointer transition-all group"
                          >
                            <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                              <FileText className="w-5 h-5" />
                            </div>
                            <div className="truncate flex-1 min-w-0">
                              <p className="text-xs font-bold text-white truncate group-hover:text-blue-300 transition-colors">
                                {m.fileInfo.name}
                              </p>
                              <p className="text-[10px] text-slate-400 font-semibold">
                                {m.fileInfo.size ? (m.fileInfo.size / (1024 * 1024)).toFixed(2) : '0.1'} MB
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDownloadFile(m.id, m.fileInfo);
                              }}
                              className="p-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white transition-all shrink-0 shadow-md cursor-pointer flex items-center justify-center"
                              title="Download File"
                            >
                              <Download className="w-4 h-4 text-white" />
                            </button>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>

                {/* EMOJI BAR PALETTE */}
                {showEmojiPicker && (
                  <div className="px-3 py-2 bg-[#171b29] border-t border-white/10 flex items-center flex-wrap gap-1.5 animate-in slide-in-from-bottom-2 duration-150">
                    {POPULAR_EMOJIS.map((emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => addEmojiToInput(emoji)}
                        className="text-base p-1.5 rounded-lg hover:bg-white/10 transition-transform active:scale-125 cursor-pointer"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                )}

                {/* Hidden File Input */}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  className="hidden"
                />

                {/* Chat Recipient Selector & Form */}
                <form onSubmit={handleSendMessage} className="p-3 border-t border-white/10 bg-[#0d101a] space-y-2">
                  {/* Recipient Dropdown */}
                  <div className="flex items-center justify-between text-[11px] text-slate-400 px-1">
                    <span>Send to:</span>
                    {effectiveRole === 'STUDENT' ? (
                      <span className="font-bold text-amber-400 flex items-center gap-1">
                        <Crown className="w-3 h-3" /> Host ({hostUser?.displayName || 'Instructor'})
                      </span>
                    ) : (
                      <select
                        value={chatRecipientId}
                        onChange={(e) => setChatRecipientId(Number(e.target.value))}
                        className="bg-[#191e2e] text-white text-xs border border-white/10 rounded-lg px-2 py-1 outline-none focus:border-blue-500 cursor-pointer"
                      >
                        <option value={0}>Everyone</option>
                        {participants
                          .filter((p) => p.userId !== currentUserId)
                          .map((p) => (
                            <option key={p.userId} value={p.userId}>
                              {p.displayName}
                            </option>
                          ))}
                      </select>
                    )}
                  </div>

                  {/* Input & Actions row */}
                  <div className="flex items-center space-x-1.5">
                    {/* Emoji Toggle Button */}
                    <button
                      type="button"
                      onClick={() => setShowEmojiPicker((prev) => !prev)}
                      title="Emojis"
                      className={`p-2 rounded-xl border transition-colors cursor-pointer ${showEmojiPicker
                        ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                        : 'bg-[#181c2b] text-slate-400 hover:text-white border-white/10'
                        }`}
                    >
                      <Smile className="w-4 h-4" />
                    </button>

                    {/* File Attachment Button */}
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      title="Attach File"
                      className="p-2 rounded-xl bg-[#181c2b] text-slate-400 hover:text-white border border-white/10 transition-colors cursor-pointer"
                    >
                      <Paperclip className="w-4 h-4" />
                    </button>

                    {/* Text Input */}
                    <input
                      type="text"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      placeholder={
                        effectiveRole === 'STUDENT'
                          ? 'Message instructor...'
                          : 'Type your message...'
                      }
                      className="flex-1 bg-[#181c2b] border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-blue-500 transition-colors"
                    />

                    {/* Send Button */}
                    <button
                      type="submit"
                      disabled={!chatInput.trim()}
                      className="p-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white disabled:opacity-40 transition-all cursor-pointer"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* PARTICIPANTS TAB CONTENT */}
            {activeTab === 'participants' && (
              <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {visibleParticipantsDrawerList.map((p) => {
                  const isHostP = p.isHost || p.isManager || p.userId === hostUser?.userId;
                  const isSelfP = p.userId === currentUserId;
                  const hasHandRaised = (isSelfP ? isHandRaised : !!raisedHandUsers[p.userId]) || (p as any).isHandRaised;
                  const isUserAway = (isSelfP ? isAway : !!awayUsers[p.userId]);

                  return (
                    <div
                      key={p.userId}
                      className={`flex items-center justify-between p-3 rounded-xl border transition-all ${hasHandRaised
                        ? 'bg-amber-500/10 border-amber-500/30 shadow-sm shadow-amber-500/10'
                        : 'bg-white/5 border-white/5 hover:border-white/10'
                        }`}
                    >
                      {/* Left: User Avatar & Name */}
                      <div className="flex items-center space-x-3 truncate">
                        <div className="w-8 h-8 rounded-full bg-slate-700 font-bold text-xs flex items-center justify-center text-white border border-white/10 shrink-0">
                          {p.displayName?.substring(0, 2).toUpperCase() || 'U'}
                        </div>
                        <div className="truncate">
                          <div className="text-xs font-semibold text-slate-200 flex items-center gap-1.5 truncate">
                            <span>{p.displayName}</span>
                            {isSelfP && <span className="text-[10px] text-blue-400 font-normal">(You)</span>}
                            {isUserAway && (
                              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-slate-800 text-slate-400 border border-white/10 text-[10px]">
                                ⌛ Away
                              </span>
                            )}
                          </div>
                          {isHostP && (
                            <span className="text-[10px] text-amber-400 font-bold flex items-center gap-1">
                              <Crown className="w-2.5 h-2.5" /> Host
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Right Action Icons (✋ Raised Hand on Left of Screen Share) */}
                      <div className="flex items-center space-x-1 shrink-0 ml-2">
                        {/* Single Clickable Hand Icon */}
                        {hasHandRaised && (
                          <button
                            type="button"
                            onClick={() => {
                              if (effectiveRole === 'INSTRUCTOR' && !isSelfP) {
                                handleHostLowerStudentHand(p.userId);
                              } else if (isSelfP) {
                                handleToggleRaiseHand();
                              }
                            }}
                            title={
                              effectiveRole === 'INSTRUCTOR' && !isSelfP
                                ? "Student raised hand (Click to Lower Hand)"
                                : isSelfP
                                  ? "You raised hand (Click to Lower)"
                                  : "Hand Raised"
                            }
                            className={`p-1.5 rounded-lg border transition-all flex items-center justify-center ${effectiveRole === 'INSTRUCTOR' || isSelfP
                              ? 'bg-amber-500/20 border-amber-500/50 text-amber-300 hover:bg-amber-500/35 hover:border-amber-400 cursor-pointer shadow-sm shadow-amber-500/20 active:scale-95'
                              : 'bg-amber-500/15 border-amber-500/30 text-amber-300 cursor-default'
                              }`}
                          >
                            <span className="text-sm leading-none">✋</span>
                          </button>
                        )}

                        {effectiveRole === 'INSTRUCTOR' && !isSelfP && (
                          <>
                            <button
                              onClick={() => handleInstructorApproveShare(p.userId)}
                              title="Allow Student to Share Screen"
                              className="p-1.5 rounded-lg border bg-white/5 border-white/10 hover:bg-emerald-500/20 hover:border-emerald-500/30 text-slate-300 hover:text-emerald-400 transition-colors cursor-pointer"
                            >
                              <ScreenShare className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleHostMuteStudent(p.userId, !p.muted)}
                              title={p.muted ? 'Unmute Student' : 'Mute Student'}
                              className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${p.muted
                                ? 'bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20'
                                : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20'
                                }`}
                            >
                              {p.muted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => {
                            if (isSelfP) {
                              toggleAudio();
                            } else if (effectiveRole === 'INSTRUCTOR') {
                              handleHostMuteStudent(p.userId, !p.muted);
                            }
                          }}
                          className="p-1 rounded hover:bg-white/10 transition-colors cursor-pointer"
                        >
                          {p.muted ? (
                            <MicOff className="w-4 h-4 text-red-400 opacity-80" />
                          ) : (
                            <Mic className="w-4 h-4 text-emerald-400" />
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

          </div>
        )}
      </div>

      {/* FLOATING GLASSMORTIC BOTTOM CONTROL BAR */}
      <footer className="h-20 bg-[#131722]/95 border-t border-white/10 px-6 flex items-center justify-between z-40 backdrop-blur-xl">

        {/* Left Side: Session info info */}
        <div className="hidden md:flex items-center space-x-3">
          <div className="w-3 h-3 rounded-full bg-emerald-500 animate-ping" />
          <span className="text-xs font-semibold text-slate-300">
            {effectiveRole === 'INSTRUCTOR' ? 'Classroom Host Active' : 'Connected to Instructor'}
          </span>
        </div>

        {/* Center Actions: Mic, Camera, Screen Share, Chat, Participants */}
        <div className="flex items-center space-x-3 mx-auto md:mx-0">
          {/* Mute/Unmute */}
          <button
            onClick={toggleAudio}
            className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col items-center gap-1 ${isMuted
              ? 'bg-red-500/20 border-red-500/40 text-red-400 hover:bg-red-500/30'
              : 'bg-white/10 border-white/15 text-white hover:bg-white/20'
              }`}
          >
            {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5 text-emerald-400" />}
          </button>

          {/* Start/Stop Camera */}
          <button
            onClick={toggleVideo}
            className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col items-center gap-1 ${!isVideoOn
              ? 'bg-red-500/20 border-red-500/40 text-red-400 hover:bg-red-500/30'
              : 'bg-white/10 border-white/15 text-white hover:bg-white/20'
              }`}
          >
            {!isVideoOn ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5 text-blue-400" />}
          </button>

          {/* Screen Share (Available to both Instructor and Student) */}
          <button
            onClick={effectiveRole === 'INSTRUCTOR' ? toggleShareScreen : handleStudentShareClick}
            title={
              isSharing
                ? 'Stop Screen Sharing'
                : effectiveRole === 'INSTRUCTOR'
                  ? 'Share Screen'
                  : hasSharePermission
                    ? 'Share Your Screen (Permission Granted)'
                    : 'Request Permission to Share Screen'
            }
            className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col items-center gap-1 ${isSharing
              ? 'bg-emerald-500/30 border-[#22c55e] text-[#22c55e] ring-2 ring-[#22c55e]/40 shadow-lg shadow-emerald-500/20'
              : isWaitingForShareApproval
                ? 'bg-amber-500/20 border-amber-500/50 text-amber-400 animate-pulse'
                : hasSharePermission
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20'
                  : 'bg-[#181c2b] border-white/15 text-white hover:bg-white/20'
              }`}
          >
            {isWaitingForShareApproval ? (
              <Loader2 className="w-5 h-5 animate-spin text-amber-400" />
            ) : (
              <ScreenShare className="w-5 h-5 text-emerald-400" />
            )}
          </button>



          {/* Reactions Menu (React) - Placed directly beside Screen Share */}
          <ZoomReactionsMenu
            onSendReaction={handleSendReaction}
            isHandRaised={isHandRaised}
            onToggleRaiseHand={handleToggleRaiseHand}
            isAway={isAway}
            onToggleAway={handleToggleAway}
            onSendFeedback={handleSendFeedback}
          />

          {/* Chat Toggle */}
          <button
            onClick={() => {
              setActiveTab((curr) => (curr === 'chat' ? 'none' : 'chat'));
              setUnreadChatCount(0);
            }}
            className={`relative p-3.5 rounded-2xl border transition-all cursor-pointer ${activeTab === 'chat'
              ? 'bg-blue-600/30 border-blue-500/50 text-blue-400'
              : 'bg-[#181c2b] border-white/15 text-white hover:bg-white/20'
              }`}
          >
            <MessageSquare className="w-5 h-5" />
            {unreadChatCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-blue-500 text-white text-[10px] font-bold flex items-center justify-center animate-bounce">
                {unreadChatCount}
              </span>
            )}
          </button>

          {/* Participants Toggle */}
          <button
            onClick={() => setActiveTab((curr) => (curr === 'participants' ? 'none' : 'participants'))}
            className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${activeTab === 'participants'
              ? 'bg-emerald-600/30 border-emerald-500/50 text-emerald-400'
              : 'bg-[#181c2b] border-white/15 text-white hover:bg-white/20'
              }`}
          >
            <Users className="w-5 h-5" />
          </button>

                    {/* Video Effects & Media Settings (Settings button) */}
          <button
            onClick={() => setIsVideoSettingsOpen(true)}
            title="Video Effects & Media Settings"
            className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${isVideoSettingsOpen
              ? 'bg-purple-600/30 border-purple-500/50 text-purple-400'
              : 'bg-[#181c2b] border-white/15 text-white hover:bg-white/20'
              }`}
          >
            <Settings className="w-5 h-5" />
          </button>

        </div>

        {/* Right Side: Leave / End Session Action */}
        <div className="hidden md:flex items-center">
          <button
            onClick={handleLeaveOrEndClick}
            className="py-3 px-5 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex items-center space-x-2 shadow-lg shadow-red-600/20 transition-all cursor-pointer"
          >
            <PhoneOff className="w-4 h-4" />
            <span>{effectiveRole === 'INSTRUCTOR' ? 'Leave / End' : 'Leave Session'}</span>
          </button>
        </div>
      </footer>

      {/* MODAL 1: Media Consent Modal */}
      {showMediaConsentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-[#131722] border border-white/10 rounded-3xl p-7 text-center shadow-2xl flex flex-col items-center space-y-5">
            <div className="w-16 h-16 rounded-2xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
              <Video className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-bold text-white">Join Live Classroom Media</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Connect your microphone and camera to interact directly with your instructor during the session.
              </p>
            </div>

            <div className="w-full space-y-2.5 pt-2">
              <button
                onClick={handleEnableMediaConsent}
                className="w-full py-3.5 px-6 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm transition-all shadow-lg shadow-blue-600/25 flex items-center justify-center gap-2 cursor-pointer"
              >
                <Mic className="w-4 h-4" />
                <Video className="w-4 h-4" />
                <span>Join with Microphone & Camera</span>
              </button>

              <button
                onClick={() => setShowMediaConsentModal(false)}
                className="w-full py-2.5 text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                Continue in Listen-Only Mode
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Instructor Session Options (Leave Only vs End for Everyone) */}
      {showEndConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-[#131722] border border-white/10 rounded-3xl p-7 text-center shadow-2xl flex flex-col items-center space-y-5">
            <div className="w-16 h-16 rounded-2xl bg-red-500/10 text-red-400 flex items-center justify-center">
              <AlertCircle className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h3 className="text-xl font-bold text-white">Instructor Session Control</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Choose how you would like to exit the live classroom:
              </p>
            </div>

            <div className="w-full space-y-3 pt-2">
              {/* Option 1: Leave Session Only */}
              <button
                onClick={leaveSessionAsInstructor}
                className="w-full py-3.5 px-6 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/15 transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer"
              >
                <LogOut className="w-4 h-4 text-slate-300" />
                <span>Leave Session Only</span>
              </button>

              {/* Option 2: End Session for Everyone */}
              <button
                onClick={endSessionAsInstructor}
                className="w-full py-3.5 px-6 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs transition-all shadow-lg shadow-red-600/25 flex items-center justify-center gap-2 cursor-pointer"
              >
                <PhoneOff className="w-4 h-4" />
                <span>End Session for Everyone</span>
              </button>

              <button
                onClick={() => setShowEndConfirmModal(false)}
                className="w-full py-2 text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: Student Post-Meeting Feedback Modal */}
      {showFeedbackModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-300">
          <div className="w-full max-w-lg bg-[#121624] border border-white/15 rounded-3xl p-6 sm:p-8 text-center shadow-2xl flex flex-col items-center space-y-5 relative overflow-hidden">
            {/* Ambient Background Glowing Gradients */}
            <div className="absolute -top-20 -left-20 w-44 h-44 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -top-20 -right-20 w-44 h-44 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

            {feedbackSubmitted ? (
              /* Success / Thank You Celebration View */
              <div className="py-6 flex flex-col items-center space-y-4 animate-in zoom-in-95 duration-200">
                <div className="w-20 h-20 rounded-3xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center shadow-xl shadow-emerald-500/10">
                  <CheckCircle2 className="w-10 h-10 animate-in zoom-in-50 duration-300" />
                </div>
                <div className="space-y-1.5">
                  <h3 className="text-2xl font-bold text-white tracking-tight">Thank You for Your Feedback! 🎉</h3>
                  <p className="text-xs sm:text-sm text-slate-300 max-w-xs mx-auto">
                    Your valuable rating helps us improve future live classes.
                  </p>
                </div>
                <div className="pt-2 flex items-center justify-center space-x-2 text-xs text-blue-400 font-semibold">
                  <div className="w-2 h-2 rounded-full bg-blue-400 animate-ping" />
                  <span>Redirecting to your dashboard...</span>
                </div>
              </div>
            ) : (
              /* Feedback Form View */
              <>
                {/* Header Icon */}
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500/20 via-orange-500/20 to-purple-500/20 border border-amber-500/30 text-amber-400 flex items-center justify-center shadow-lg">
                  <Sparkles className="w-8 h-8 text-amber-400" />
                </div>

                {/* Thank You & Session Details */}
                <div className="space-y-1.5 w-full">
                  <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                    Thank You for Attending!
                  </h3>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-slate-300 text-xs font-medium max-w-full truncate">
                    <span className="truncate">{displaySessionTitle}</span>
                  </div>
                  <p className="text-xs text-slate-400 pt-0.5">
                    How was your live session experience today? Please share your feedback:
                  </p>
                </div>

                {/* 5-Star Interactive Rating */}
                <div className="w-full flex flex-col items-center space-y-2 py-1">
                  <div className="flex items-center justify-center gap-2 sm:gap-3">
                    {[1, 2, 3, 4, 5].map((star) => {
                      const activeRating = feedbackHoverRating || feedbackRating;
                      const isSelected = star <= activeRating;
                      return (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setFeedbackRating(star)}
                          onMouseEnter={() => setFeedbackHoverRating(star)}
                          onMouseLeave={() => setFeedbackHoverRating(0)}
                          className="p-1 sm:p-2 rounded-2xl hover:scale-125 active:scale-95 transition-all duration-150 cursor-pointer focus:outline-none"
                          title={`${star} out of 5 Stars`}
                        >
                          <Star
                            className={`w-8 h-8 sm:w-10 sm:h-10 transition-all duration-150 ${isSelected
                              ? 'text-amber-400 fill-amber-400 drop-shadow-[0_0_12px_rgba(251,191,36,0.6)]'
                              : 'text-slate-600 hover:text-slate-500'
                              }`}
                          />
                        </button>
                      );
                    })}
                  </div>

                  {/* Rating Label Indicator */}
                  <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-400 bg-amber-400/10 border border-amber-400/20 px-3.5 py-1 rounded-full">
                    <span>{RATING_LABELS[feedbackHoverRating || feedbackRating]?.emoji}</span>
                    <span>{feedbackHoverRating || feedbackRating} / 5 Stars</span>
                    <span className="text-slate-500">•</span>
                    <span>{RATING_LABELS[feedbackHoverRating || feedbackRating]?.label}</span>
                  </div>
                </div>

                {/* Feedback Textarea */}
                <div className="w-full text-left space-y-1.5">
                  <div className="flex justify-between items-center text-[11px] text-slate-400 px-0.5">
                    <label className="font-semibold text-slate-300">Give Feedback / Comments</label>
                    <span>{feedbackText.length}/500</span>
                  </div>
                  <textarea
                    value={feedbackText}
                    onChange={(e) => setFeedbackText(e.target.value.slice(0, 500))}
                    rows={3}
                    placeholder="Example: The instructor explained the concepts clearly, and the live examples made the session easy to follow."
                    className="w-full bg-[#181c2b] border border-white/15 rounded-2xl p-3.5 text-xs sm:text-sm text-white placeholder-slate-500 outline-none focus:border-amber-400/60 focus:ring-1 focus:ring-amber-400/40 transition-all resize-none shadow-inner"
                  />
                </div>

                {/* Action Buttons */}
                <div className="w-full space-y-2.5 pt-1">
                  <button
                    onClick={handleSubmitFeedback}
                    disabled={isSubmittingFeedback}
                    className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm transition-all shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isSubmittingFeedback ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Submitting...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Submit Feedback</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={handleSkipFeedback}
                    className="w-full py-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer"
                  >
                    Skip & Return to Dashboard
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* MODAL 4: Instructor Screen Share Request Approval */}
      {effectiveRole === 'INSTRUCTOR' && incomingShareRequest && (
        <div className="fixed top-20 right-6 z-[100] max-w-sm w-full animate-in slide-in-from-top-4 fade-in duration-200">
          <div className="bg-[#181c2b] border border-blue-500/60 rounded-2xl p-5 shadow-2xl backdrop-blur-xl text-white space-y-3.5 ring-2 ring-blue-500/20">
            <div className="flex items-start space-x-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
                <ScreenShare className="w-5 h-5" />
              </div>
              <div className="space-y-0.5 min-w-0">
                <h4 className="text-sm font-bold text-white">Screen Share Request</h4>
                <p className="text-xs text-slate-300 leading-snug">
                  <span className="font-bold text-blue-400">{incomingShareRequest.userName}</span> has requested to share their screen.
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2 pt-1">
              <button
                onClick={() => handleInstructorApproveShare(incomingShareRequest.userId)}
                className="flex-1 py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-md shadow-emerald-600/25"
              >
                <Check className="w-4 h-4" />
                <span>Allow Screen Share</span>
              </button>

              <button
                onClick={() => handleInstructorDeclineShare(incomingShareRequest.userId)}
                className="py-2.5 px-3 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white font-semibold text-xs transition-all cursor-pointer border border-white/10"
              >
                Decline
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 5: Student Screen Share Request Waiting Modal */}
      {effectiveRole === 'STUDENT' && isWaitingForShareApproval && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-[#131722] border border-white/15 rounded-3xl p-6 text-center shadow-2xl flex flex-col items-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center">
              <Loader2 className="w-7 h-7 animate-spin" />
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-bold text-white">Permission Requested</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Waiting for the instructor to allow you to share your screen...
              </p>
            </div>

            <button
              onClick={() => {
                setIsWaitingForShareApproval(false);
                setShareRequestStatus('idle');
              }}
              className="w-full py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white text-xs font-semibold transition-all cursor-pointer"
            >
              Cancel Request
            </button>
          </div>
        </div>
      )}

      {/* MODAL 6: Student Screen Share Request Declined Toast */}
      {effectiveRole === 'STUDENT' && shareRequestStatus === 'declined' && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[100] animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="bg-[#181c2b] border border-red-500/50 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center space-x-3">
            <AlertCircle className="w-5 h-5 text-red-400" />
            <span className="text-xs font-medium text-slate-200">
              The instructor has declined your screen share request.
            </span>
            <button
              onClick={() => setShareRequestStatus('idle')}
              className="p-1 rounded-lg text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* LOADING OVERLAY */}
      {isLoading && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-[#070913] space-y-4">
          <div className="w-12 h-12 rounded-full border-4 border-blue-500/20 border-t-blue-500 animate-spin" />
          <p className="text-sm font-semibold text-slate-300">{loadingText}</p>
        </div>
      )}

      {/* ERROR OVERLAY */}
      {error && !isJoined && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-[#070913] p-6 text-center">
          <div className="max-w-md w-full p-8 rounded-3xl bg-[#121624] border border-white/10 shadow-2xl space-y-5">
            <div className="w-16 h-16 rounded-2xl bg-red-500/20 text-red-400 flex items-center justify-center mx-auto">
              <AlertCircle className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h2 className="text-xl font-bold text-white">Connection Error</h2>
              <p className="text-xs text-slate-400">{error}</p>
            </div>
            <button
              onClick={startSession}
              className="w-full py-3.5 px-6 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-xl transition-all cursor-pointer"
            >
              Retry Connection
            </button>
          </div>
        </div>
      )}

      {/* FLOATING EMOJIS / REACTIONS OVERLAY */}
      <ZoomFloatingReactions reactions={floatingReactions} />
            {/* ZOOM VIDEO & MEDIA SETTINGS MODAL */}
      <ZoomVideoSettingsModal
        isOpen={isVideoSettingsOpen}
        onClose={() => setIsVideoSettingsOpen(false)}
        mediaStream={mediaStreamRef.current}
        currentUserId={currentUserId}
        settings={videoSettings}
        onSettingsChange={(newSettings) => setVideoSettings(newSettings)}
        isVideoOn={isVideoOn}
      />

    </div>
  );
}
