'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Camera,
  Sliders,
  Volume2,
  Mic,
  Image as ImageIcon,
  Check,
  Upload,
  RefreshCw,
  VideoOff,
  Wand2,
  Play,
} from 'lucide-react';

export interface VideoFilterOption {
  id: string;
  name: string;
  cssFilter: string;
  badge?: string;
  iconBg: string;
}

export interface VirtualBackgroundOption {
  id: string;
  name: string;
  type: 'none' | 'blur' | 'image' | 'custom';
  url?: string;
  previewUrl?: string;
}

export interface AvatarOption {
  id: string;
  name: string;
  tag: string;
  emoji: string;
  color: string;
  svgIcon?: React.ReactNode;
  species?: string;
  earType?: string;
  furColor?: string;
  furShadow?: string;
  snoutColor?: string;
  hoodieColor?: string;
  hoodieShadow?: string;
  pattern?: string;
}

interface AnimalAvatarSVGProps {
  species?: string;
  earType?: string;
  furColor?: string;
  furShadow?: string;
  snoutColor?: string;
  hoodieColor?: string;
  hoodieShadow?: string;
  pattern?: string;
  className?: string;
}

export function AnimalAvatarSVG({
  species = 'human',
  furColor = '#d9b08c',
  furShadow = '#9b6747',
  snoutColor = '#f1d6bf',
  hoodieColor = '#3b82f6',
  hoodieShadow = '#1d4ed8',
  pattern,
  className,
}: AnimalAvatarSVGProps) {
  const isPanda = species.toLowerCase() === 'panda';
  const faceColor = isPanda ? '#f7f7f5' : furColor;
  const shadowColor = isPanda ? '#232323' : furShadow;

  return (
    <svg viewBox="0 0 128 128" className={className} role="img" aria-label="Avatar">
      <path d="M26 114 Q64 86 102 114 L102 128 L26 128 Z" fill={hoodieColor} />
      <path d="M26 114 Q64 96 102 114 L96 128 L32 128 Z" fill={hoodieShadow} opacity="0.45" />
      <circle cx="31" cy="36" r="16" fill={shadowColor} />
      <circle cx="97" cy="36" r="16" fill={shadowColor} />
      <circle cx="64" cy="62" r="42" fill={faceColor} />
      <ellipse cx="64" cy="78" rx="22" ry="16" fill={snoutColor} />
      <circle cx="48" cy="59" r="5" fill="#20140c" />
      <circle cx="80" cy="59" r="5" fill="#20140c" />
      <ellipse cx="64" cy="76" rx="5" ry="4" fill="#20140c" />
      <path d="M58 84 Q64 89 70 84" fill="none" stroke="#5b3828" strokeWidth="3" strokeLinecap="round" />
      {pattern && <circle cx="64" cy="30" r="8" fill={pattern} opacity="0.35" />}
    </svg>
  );
}

export interface ZoomVideoSettings {
  virtualBackground: string; // 'none' | 'blur' | id or custom URL
  customBackgroundUrl?: string;
  videoFilter: string; // 'normal' | 'warm' | etc.
  avatar: string; // 'none' | 'astronaut' | etc.
  showAvatarOnCamera: boolean;
  isMirrored: boolean;
  isHdEnabled: boolean;
  touchUpAppearance: boolean;
  touchUpIntensity: number; // 0 - 100
  adjustLowLight: boolean;
  noiseSuppression: 'auto' | 'low' | 'medium' | 'high';
  echoCancellation: boolean;
  selectedCameraId?: string;
  selectedMicId?: string;
  selectedSpeakerId?: string;
}

export const DEFAULT_ZOOM_SETTINGS: ZoomVideoSettings = {
  virtualBackground: 'none',
  videoFilter: 'normal',
  avatar: 'none',
  showAvatarOnCamera: false,
  isMirrored: true,
  isHdEnabled: true,
  touchUpAppearance: true,
  touchUpIntensity: 35,
  adjustLowLight: true,
  noiseSuppression: 'auto',
  echoCancellation: true,
};

// Ready-made virtual backgrounds
export const PRESET_BACKGROUNDS: VirtualBackgroundOption[] = [
  {
    id: 'none',
    name: 'None',
    type: 'none',
  },
  {
    id: 'blur',
    name: 'Blur',
    type: 'blur',
  },
  {
    id: 'modern_office',
    name: 'Modern Executive Office',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1554034483-04fda0d3507b?q=80&w=1170&auto=format&fit=crop&w=1600&q=80',
    previewUrl: 'https://images.unsplash.com/photo-1554034483-04fda0d3507b?q=80&w=1170&auto=format&fit=crop&w=400&q=75',
  },
  {
    id: 'cozy_library',
    name: 'Academic Library',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1715593949273-09009558300a?q=80&w=1170&auto=format&fit=crop&w=1600&q=80',
    previewUrl: 'https://images.unsplash.com/photo-1715593949273-09009558300a?q=80&w=1170&auto=format&fit=crop&w=400&q=75',
  },
  {
    id: 'minimalist_studio',
    name: 'Minimalist Studio Loft',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1511649475669-e288648b2339?q=80&w=1632&auto=format&fit=crop&w=1600&q=80',
    previewUrl: 'https://images.unsplash.com/photo-1511649475669-e288648b2339?q=80&w=1632&auto=format&fit=crop&w=400&q=75',
  },
  {
    id: 'cyberpunk_hub',
    name: 'Neon Tech Studio',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=1600&q=80',
    previewUrl: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=400&q=75',
  },
  {
    id: 'mountain_sunrise',
    name: 'Alpine Mountain View',
    type: 'image',
    url: 'https://plus.unsplash.com/premium_photo-1683141559030-e04e92021aab?q=80&w=1170&auto=format&fit=crop&w=1600&q=80',
    previewUrl: 'https://plus.unsplash.com/premium_photo-1683141559030-e04e92021aab?q=80&w=1170&auto=format&fit=crop&w=400&q=75',
  },
  {
    id: 'modern_classroom',
    name: 'Smart Lecture Room',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1600&q=80',
    previewUrl: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=400&q=75',
  },
  {
    id: 'coffee_shop',
    name: 'Cozy Coffee Cafe',
    type: 'image',
    url: 'https://plus.unsplash.com/premium_photo-1703801758164-fab9c5f16d06?q=80&w=1632&auto=format&fit=crop&w=1600&q=80',
    previewUrl: 'https://plus.unsplash.com/premium_photo-1703801758164-fab9c5f16d06?q=80&w=1632&auto=format&fit=crop&w=400&q=75',
  },
  {
    id: 'glarus_gradient',
    name: 'Glarus Cosmic Aura',
    type: 'image',
    url: 'https://plus.unsplash.com/premium_photo-1702288038756-6a4a673cc94c?q=80&w=1632&auto=format&fit=crop&w=1600&q=80',
    previewUrl: 'https://plus.unsplash.com/premium_photo-1702288038756-6a4a673cc94c?q=80&w=1632&auto=format&fit=crop&w=400&q=75',
  },
];

// Ready-made video filter effects (Zoom style)
export const PRESET_FILTERS: VideoFilterOption[] = [
  {
    id: 'normal',
    name: 'Normal',
    cssFilter: 'none',
    iconBg: 'bg-slate-700',
  },
  {
    id: 'warm',
    name: 'Studio Warm',
    cssFilter: 'brightness(1.05) contrast(1.06) saturate(1.22) sepia(0.12)',
    badge: 'Popular',
    iconBg: 'bg-amber-600',
  },
  {
    id: 'cool',
    name: 'Cool Slate',
    cssFilter: 'brightness(1.02) contrast(1.08) hue-rotate(185deg) saturate(1.12)',
    iconBg: 'bg-cyan-600',
  },
  {
    id: 'noir',
    name: 'Noir Classic (B&W)',
    cssFilter: 'grayscale(1) contrast(1.22) brightness(0.96)',
    iconBg: 'bg-neutral-800',
  },
  {
    id: 'sepia',
    name: 'Vintage Sepia',
    cssFilter: 'sepia(0.75) contrast(1.1) brightness(0.92)',
    iconBg: 'bg-orange-800',
  },
  {
    id: 'emerald',
    name: 'Emerald Cinema',
    cssFilter: 'hue-rotate(50deg) saturate(1.25) contrast(1.06)',
    iconBg: 'bg-emerald-700',
  },
  {
    id: 'cyber',
    name: 'Cyberpunk Neon',
    cssFilter: 'contrast(1.25) saturate(1.6) hue-rotate(280deg)',
    badge: 'Pro',
    iconBg: 'bg-fuchsia-600',
  },
  {
    id: 'dreamy',
    name: 'Soft Glow',
    cssFilter: 'brightness(1.12) contrast(0.96) saturate(1.15)',
    iconBg: 'bg-pink-500',
  },
  {
    id: 'hdr',
    name: 'Vivid Clarity',
    cssFilter: 'contrast(1.28) saturate(1.35) brightness(1.02)',
    iconBg: 'bg-blue-600',
  },
];

// Ready-made Zoom Avatars
export const PRESET_AVATARS: AvatarOption[] = [
  {
    id: 'none',
    name: 'None',
    tag: 'Default User',
    emoji: '👤',
    color: 'from-slate-600 to-slate-800',
  },
  {
    id: 'astronaut',
    name: 'Astronaut',
    tag: 'Space Explorer',
    emoji: '👨‍🚀',
    color: 'from-blue-600 to-indigo-800',
  },
  {
    id: 'fox',
    name: 'Cyber Kitsune',
    tag: 'Tech Fox',
    emoji: '🦊',
    color: 'from-orange-500 to-amber-700',
  },
  {
    id: 'owl',
    name: 'Professor Owl',
    tag: 'Scholar',
    emoji: '🦉',
    color: 'from-amber-600 to-yellow-800',
  },
  {
    id: 'robot',
    name: 'Mecha Android',
    tag: 'AI Assistant',
    emoji: '🤖',
    color: 'from-cyan-500 to-blue-700',
  },
  {
    id: 'ninja',
    name: 'Shadow Ninja',
    tag: 'Stealth Master',
    emoji: '🥷',
    color: 'from-purple-900 to-slate-950',
  },
  {
    id: 'cat',
    name: 'Swag Cat',
    tag: 'Cool Cat',
    emoji: '😼',
    color: 'from-emerald-500 to-teal-800',
  },
  {
    id: 'panda',
    name: 'Zen Panda',
    tag: 'Master',
    emoji: '🐼',
    color: 'from-slate-700 to-slate-900',
  },
  {
    id: 'wizard',
    name: 'Arcane Mage',
    tag: 'Magic Coder',
    emoji: '🧙‍♂️',
    color: 'from-violet-600 to-purple-900',
  },
  {
    id: 'bear',
    name: 'Dev Bear',
    tag: 'Hacker',
    emoji: '🐻',
    color: 'from-rose-600 to-red-900',
  },
];

interface ZoomVideoSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  mediaStream?: any;
  currentUserId?: number | null;
  settings?: ZoomVideoSettings;
  onSettingsChange?: (newSettings: ZoomVideoSettings) => void;
  isVideoOn?: boolean;
}

export default function ZoomVideoSettingsModal({
  isOpen,
  onClose,
  mediaStream,
  currentUserId,
  settings: initialSettings,
  onSettingsChange,
  isVideoOn = false,
}: ZoomVideoSettingsModalProps) {
  const [activeTab, setActiveTab] = useState<'backgrounds' | 'video' | 'audio'>('backgrounds');
  
  const [settings, setSettings] = useState<ZoomVideoSettings>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('glarus_zoom_video_settings');
        if (saved) {
          return { ...DEFAULT_ZOOM_SETTINGS, ...JSON.parse(saved) };
        }
      } catch (e) {
        console.warn('Failed to load saved zoom settings:', e);
      }
    }
    return initialSettings || DEFAULT_ZOOM_SETTINGS;
  });

  const [availableCameras, setAvailableCameras] = useState<MediaDeviceInfo[]>([]);
  const [availableMics, setAvailableMics] = useState<MediaDeviceInfo[]>([]);
  const [availableSpeakers, setAvailableSpeakers] = useState<MediaDeviceInfo[]>([]);
  
  const [micLevel, setMicLevel] = useState(0);
  const [isPlayingTestAudio, setIsPlayingTestAudio] = useState(false);
  const [customUploads, setCustomUploads] = useState<VirtualBackgroundOption[]>([]);
  
  const previewVideoRef = useRef<HTMLVideoElement>(null);
  const previewStreamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync settings upstream & persist to local storage
  const updateSettings = (partial: Partial<ZoomVideoSettings>) => {
    const updated = { ...settings, ...partial };
    setSettings(updated);
    if (onSettingsChange) {
      onSettingsChange(updated);
    }
    try {
      localStorage.setItem('glarus_zoom_video_settings', JSON.stringify(updated));
    } catch (e) {
      console.warn('Failed to persist zoom settings:', e);
    }

    // Apply to real Zoom Video SDK mediaStream if available
    if (mediaStream) {
      if (partial.virtualBackground !== undefined) {
        applyVirtualBackgroundToSdk(updated.virtualBackground, updated.customBackgroundUrl);
      }
      if (partial.isMirrored !== undefined && typeof mediaStream.mirrorVideo === 'function') {
        try {
          mediaStream.mirrorVideo(updated.isMirrored);
        } catch (e) {
          console.warn('Error setting mirrorVideo on mediaStream:', e);
        }
      }
      if (partial.selectedCameraId !== undefined && typeof mediaStream.switchCamera === 'function') {
        try {
          mediaStream.switchCamera(partial.selectedCameraId);
        } catch (e) {
          console.warn('Error switching camera on mediaStream:', e);
        }
      }
      if (partial.selectedMicId !== undefined && typeof mediaStream.switchMicrophone === 'function') {
        try {
          mediaStream.switchMicrophone(partial.selectedMicId);
        } catch (e) {
          console.warn('Error switching mic on mediaStream:', e);
        }
      }
      if (partial.selectedSpeakerId !== undefined && typeof mediaStream.switchSpeaker === 'function') {
        try {
          mediaStream.switchSpeaker(partial.selectedSpeakerId);
        } catch (e) {
          console.warn('Error switching speaker on mediaStream:', e);
        }
      }
    }
  };

  // Helper to apply virtual background to Zoom SDK
  const applyVirtualBackgroundToSdk = (bgId: string, customUrl?: string) => {
    if (!mediaStream) return;
    try {
      if (bgId === 'none') {
        if (typeof mediaStream.updateVirtualBackgroundImage === 'function') {
          mediaStream.updateVirtualBackgroundImage(undefined);
        }
      } else if (bgId === 'blur') {
        if (typeof mediaStream.updateVirtualBackgroundImage === 'function') {
          mediaStream.updateVirtualBackgroundImage('blur');
        }
      } else if (bgId === 'custom' && customUrl) {
        if (typeof mediaStream.updateVirtualBackgroundImage === 'function') {
          mediaStream.updateVirtualBackgroundImage(customUrl, true);
        }
      } else {
        const found = PRESET_BACKGROUNDS.find((p) => p.id === bgId);
        if (found?.url && typeof mediaStream.updateVirtualBackgroundImage === 'function') {
          mediaStream.updateVirtualBackgroundImage(found.url, true);
        }
      }
    } catch (e) {
      console.warn('Zoom SDK updateVirtualBackgroundImage notice:', e);
    }
  };

  // Enumerate hardware devices
  useEffect(() => {
    if (!isOpen) return;

    const fetchDevices = async () => {
      try {
        if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
          const devices = await navigator.mediaDevices.enumerateDevices();
          setAvailableCameras(devices.filter((d) => d.kind === 'videoinput'));
          setAvailableMics(devices.filter((d) => d.kind === 'audioinput'));
          setAvailableSpeakers(devices.filter((d) => d.kind === 'audiooutput'));
        }
      } catch (err) {
        console.warn('Error enumerating media devices:', err);
      }
    };

    fetchDevices();
  }, [isOpen]);

  // Handle Live Camera Preview in the Modal
  useEffect(() => {
    if (!isOpen) {
      if (previewStreamRef.current) {
        previewStreamRef.current.getTracks().forEach((t) => t.stop());
        previewStreamRef.current = null;
      }
      return;
    }

    let isCancelled = false;

    const startLocalPreview = async () => {
      try {
        if (!navigator.mediaDevices?.getUserMedia) return;

        const constraints: MediaStreamConstraints = {
          video: settings.selectedCameraId
            ? { deviceId: { exact: settings.selectedCameraId } }
            : { width: { ideal: 640 }, height: { ideal: 360 } },
          audio: false,
        };

        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        if (isCancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }

        previewStreamRef.current = stream;
        if (previewVideoRef.current) {
          previewVideoRef.current.srcObject = stream;
          previewVideoRef.current.play().catch(() => {});
        }
      } catch (e) {
        console.warn('Unable to acquire camera stream for preview modal:', e);
      }
    };

    startLocalPreview();

    return () => {
      isCancelled = true;
      if (previewStreamRef.current) {
        previewStreamRef.current.getTracks().forEach((t) => t.stop());
        previewStreamRef.current = null;
      }
    };
  }, [isOpen, settings.selectedCameraId]);

  // Handle Microphone VU Meter for Audio testing
  useEffect(() => {
    if (!isOpen || activeTab !== 'audio') {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (micStreamRef.current) {
        micStreamRef.current.getTracks().forEach((t) => t.stop());
        micStreamRef.current = null;
      }
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close().catch(() => {});
      }
      setMicLevel(0);
      return;
    }

    let isCancelled = false;

    const startMicLevelMeter = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: settings.selectedMicId
            ? { deviceId: { exact: settings.selectedMicId } }
            : true,
          video: false,
        });

        if (isCancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }

        micStreamRef.current = stream;
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        const ctx = new AudioCtx();
        audioContextRef.current = ctx;

        const source = ctx.createMediaStreamSource(stream);
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 64;
        source.connect(analyser);
        analyserRef.current = analyser;

        const dataArray = new Uint8Array(analyser.frequencyBinCount);

        const updateLevel = () => {
          if (!analyserRef.current) return;
          analyserRef.current.getByteFrequencyData(dataArray);
          let sum = 0;
          for (let i = 0; i < dataArray.length; i++) {
            sum += dataArray[i];
          }
          const avg = sum / dataArray.length;
          const normalized = Math.min(100, Math.round((avg / 128) * 100));
          setMicLevel(normalized);
          animFrameRef.current = requestAnimationFrame(updateLevel);
        };

        updateLevel();
      } catch (err) {
        console.warn('Error initializing mic level meter:', err);
      }
    };

    startMicLevelMeter();

    return () => {
      isCancelled = true;
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (micStreamRef.current) {
        micStreamRef.current.getTracks().forEach((t) => t.stop());
        micStreamRef.current = null;
      }
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close().catch(() => {});
      }
    };
  }, [isOpen, activeTab, settings.selectedMicId]);

  // Handle Test Speaker chime sound
  const handleTestSpeaker = () => {
    if (isPlayingTestAudio) return;
    setIsPlayingTestAudio(true);

    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioCtx();

      // Play 3 pleasant ascending tones (Zoom-like connection melody)
      const frequencies = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      let startTime = ctx.currentTime;

      frequencies.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, startTime + idx * 0.12);

        gain.gain.setValueAtTime(0, startTime + idx * 0.12);
        gain.gain.linearRampToValueAtTime(0.2, startTime + idx * 0.12 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + idx * 0.12 + 0.35);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(startTime + idx * 0.12);
        osc.stop(startTime + idx * 0.12 + 0.4);
      });

      setTimeout(() => {
        setIsPlayingTestAudio(false);
        ctx.close().catch(() => {});
      }, 900);
    } catch (e) {
      console.warn('Audio test chime failed:', e);
      setIsPlayingTestAudio(false);
    }
  };

  // Handle custom image upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        const newCustomBg: VirtualBackgroundOption = {
          id: `custom_${Date.now()}`,
          name: file.name.substring(0, 15) || 'Custom Image',
          type: 'custom',
          url: result,
          previewUrl: result,
        };

        setCustomUploads((prev) => [newCustomBg, ...prev]);
        updateSettings({
          virtualBackground: newCustomBg.id,
          customBackgroundUrl: result,
        });
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  if (!isOpen) return null;

  const selectedBgObj =
    PRESET_BACKGROUNDS.find((b) => b.id === settings.virtualBackground) ||
    customUploads.find((b) => b.id === settings.virtualBackground) ||
    (settings.virtualBackground.startsWith('custom_') && settings.customBackgroundUrl
      ? { id: settings.virtualBackground, name: 'Custom Image', type: 'custom' as const, url: settings.customBackgroundUrl, previewUrl: settings.customBackgroundUrl }
      : PRESET_BACKGROUNDS[0]);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[92vh] bg-[#121624] border border-white/10 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#161b2d]/80">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 text-white flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                Zoom Video & Media Settings
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
                  Live Effects
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Configure virtual backgrounds, camera, and audio settings
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Main Content Layout: Left Tabs, Right Settings */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden min-h-[480px]">
          {/* Left Navigation Sidebar */}
          <div className="w-full md:w-56 bg-[#0e111d] border-b md:border-b-0 md:border-r border-white/10 p-3 flex md:flex-col gap-1.5 shrink-0 overflow-x-auto">
            <button
              onClick={() => setActiveTab('backgrounds')}
              className={`flex items-center space-x-3 px-3.5 py-2.5 rounded-xl font-medium text-xs sm:text-sm transition-all text-left whitespace-nowrap cursor-pointer ${
                activeTab === 'backgrounds'
                  ? 'bg-blue-600 text-white font-bold shadow-lg shadow-blue-600/25'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <ImageIcon className="w-4 h-4 shrink-0" />
              <span>Virtual Backgrounds</span>
            </button>

            <button
              onClick={() => setActiveTab('video')}
              className={`flex items-center space-x-3 px-3.5 py-2.5 rounded-xl font-medium text-xs sm:text-sm transition-all text-left whitespace-nowrap cursor-pointer ${
                activeTab === 'video'
                  ? 'bg-blue-600 text-white font-bold shadow-lg shadow-blue-600/25'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Camera className="w-4 h-4 shrink-0" />
              <span>Camera & Video</span>
            </button>

            <button
              onClick={() => setActiveTab('audio')}
              className={`flex items-center space-x-3 px-3.5 py-2.5 rounded-xl font-medium text-xs sm:text-sm transition-all text-left whitespace-nowrap cursor-pointer ${
                activeTab === 'audio'
                  ? 'bg-blue-600 text-white font-bold shadow-lg shadow-blue-600/25'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Volume2 className="w-4 h-4 shrink-0" />
              <span>Audio & Mic</span>
            </button>
          </div>

          {/* Right Scrollable Panel */}
          <div className="flex-1 flex flex-col p-4 sm:p-6 overflow-y-auto space-y-6">
            {/* Top Interactive Camera Live Preview Container */}
            <div className="relative w-full h-52 sm:h-64 rounded-2xl overflow-hidden bg-[#0a0c14] border border-white/10 shadow-inner flex items-center justify-center group shrink-0">
              {/* Optional Virtual Background Preview Layer */}
              {selectedBgObj.type === 'image' || selectedBgObj.type === 'custom' ? (
                <div
                  className="absolute inset-0 z-0 bg-cover bg-center transition-all duration-300"
                  style={{
                    backgroundImage: `url(${selectedBgObj.url || selectedBgObj.previewUrl})`,
                    filter: settings.virtualBackground === 'blur' ? 'blur(12px)' : 'none',
                  }}
                />
              ) : selectedBgObj.type === 'blur' ? (
                <div className="absolute inset-0 z-0 bg-gradient-to-tr from-slate-900 via-indigo-950 to-slate-900 backdrop-blur-2xl" />
              ) : null}

              {/* Video Element */}
              <video
                ref={previewVideoRef}
                autoPlay
                playsInline
                muted
                className={`relative z-10 w-full h-full object-cover transition-all duration-300 ${
                  selectedBgObj.type === 'image' || selectedBgObj.type === 'custom'
                    ? 'mix-blend-screen opacity-95'
                    : ''
                }`}
                style={{
                  transform: settings.isMirrored ? 'scaleX(-1)' : 'none',
                }}
              />

              {/* Fallback if camera stream is unavailable / denied */}
              {!previewStreamRef.current && (
                <div className="absolute inset-0 z-15 flex flex-col items-center justify-center bg-gradient-to-b from-[#15192c] to-[#0c0e18] p-4 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 mb-2">
                    <Camera className="w-7 h-7" />
                  </div>
                  <p className="text-xs font-semibold text-slate-300">Live Camera Preview</p>
                  <p className="text-[11px] text-slate-500 max-w-xs mt-0.5">
                    Effects and backgrounds selected below will automatically sync with your live video feed.
                  </p>
                </div>
              )}

              {/* Preview Status Pill */}
              <div className="absolute top-3 left-3 z-30 flex items-center gap-1.5 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/10 text-[11px] font-medium text-slate-300">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Live Effect Preview</span>
              </div>

              {/* Active Badges */}
              <div className="absolute bottom-3 left-3 z-30 flex items-center gap-2">
                {selectedBgObj.id !== 'none' && (
                  <span className="bg-blue-600/80 text-white text-[10px] font-bold px-2 py-0.5 rounded-md backdrop-blur-sm border border-blue-400/30">
                    BG: {selectedBgObj.name}
                  </span>
                )}
              </div>
            </div>

            {/* TAB 1: Virtual Backgrounds */}
            {activeTab === 'backgrounds' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-white">Choose Virtual Background</h3>
                    <p className="text-xs text-slate-400">
                      Select a Zoom background preset or upload a custom image
                    </p>
                  </div>

                  {/* Hidden File Input & Upload Button */}
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    accept="image/*"
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-1.5 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/40 text-blue-300 font-semibold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload Image</span>
                  </button>
                </div>

                {/* Grid of Background Options */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {/* None Option */}
                  <button
                    onClick={() => updateSettings({ virtualBackground: 'none' })}
                    className={`group relative h-24 rounded-2xl border flex flex-col items-center justify-center p-2 text-center transition-all cursor-pointer ${
                      settings.virtualBackground === 'none'
                        ? 'border-blue-500 bg-blue-500/15 ring-2 ring-blue-500/40'
                        : 'border-white/10 bg-[#161a29] hover:border-white/25 hover:bg-white/5'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center mb-1 group-hover:scale-110 transition-transform">
                      <VideoOff className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-semibold text-white">None</span>
                    {settings.virtualBackground === 'none' && (
                      <span className="absolute top-2 right-2 w-4 h-4 rounded-full bg-blue-500 text-white flex items-center justify-center text-[10px]">
                        <Check className="w-3 h-3" />
                      </span>
                    )}
                  </button>

                  {/* Blur Option */}
                  <button
                    onClick={() => updateSettings({ virtualBackground: 'blur' })}
                    className={`group relative h-24 rounded-2xl border flex flex-col items-center justify-center p-2 text-center transition-all overflow-hidden cursor-pointer ${
                      settings.virtualBackground === 'blur'
                        ? 'border-blue-500 bg-blue-500/15 ring-2 ring-blue-500/40'
                        : 'border-white/10 bg-[#161a29] hover:border-white/25 hover:bg-white/5'
                    }`}
                  >
                    <div className="absolute inset-0 bg-gradient-to-tr from-indigo-900/40 via-purple-900/30 to-blue-900/40 backdrop-blur-md" />
                    <div className="relative z-10 flex flex-col items-center">
                      <div className="w-8 h-8 rounded-full bg-indigo-600/30 text-indigo-300 flex items-center justify-center mb-1 group-hover:scale-110 transition-transform">
                        <Wand2 className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-semibold text-white">Blur</span>
                    </div>
                    {settings.virtualBackground === 'blur' && (
                      <span className="absolute top-2 right-2 z-10 w-4 h-4 rounded-full bg-blue-500 text-white flex items-center justify-center text-[10px]">
                        <Check className="w-3 h-3" />
                      </span>
                    )}
                  </button>

                  {/* Custom Uploaded Backgrounds */}
                  {customUploads.map((custom) => {
                    const isSelected = settings.virtualBackground === custom.id;
                    return (
                      <button
                        key={custom.id}
                        onClick={() =>
                          updateSettings({
                            virtualBackground: custom.id,
                            customBackgroundUrl: custom.url,
                          })
                        }
                        className={`group relative h-24 rounded-2xl border overflow-hidden transition-all cursor-pointer ${
                          isSelected
                            ? 'border-blue-500 ring-2 ring-blue-500/40'
                            : 'border-white/10 hover:border-white/25'
                        }`}
                      >
                        <img
                          src={custom.previewUrl || custom.url}
                          alt={custom.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-2">
                          <span className="text-[11px] font-bold text-white truncate">{custom.name}</span>
                        </div>
                        {isSelected && (
                          <span className="absolute top-2 right-2 w-4 h-4 rounded-full bg-blue-500 text-white flex items-center justify-center text-[10px] shadow-md">
                            <Check className="w-3 h-3" />
                          </span>
                        )}
                      </button>
                    );
                  })}

                  {/* Ready-made Preset Backgrounds */}
                  {PRESET_BACKGROUNDS.filter((b) => b.type === 'image').map((preset) => {
                    const isSelected = settings.virtualBackground === preset.id;
                    return (
                      <button
                        key={preset.id}
                        onClick={() => updateSettings({ virtualBackground: preset.id })}
                        className={`group relative h-24 rounded-2xl border overflow-hidden transition-all cursor-pointer ${
                          isSelected
                            ? 'border-blue-500 ring-2 ring-blue-500/40'
                            : 'border-white/10 hover:border-white/25'
                        }`}
                      >
                        <img
                          src={preset.previewUrl || preset.url}
                          alt={preset.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-2">
                          <span className="text-[11px] font-bold text-white truncate">{preset.name}</span>
                        </div>
                        {isSelected && (
                          <span className="absolute top-2 right-2 w-4 h-4 rounded-full bg-blue-500 text-white flex items-center justify-center text-[10px] shadow-md">
                            <Check className="w-3 h-3" />
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB 2: Camera & Video Hardware Settings */}
            {activeTab === 'video' && (
              <div className="space-y-5">
                <div>
                  <h3 className="text-sm font-bold text-white">Camera Device & Adjustments</h3>
                  <p className="text-xs text-slate-400">
                    Adjust mirror view, HD resolution, and portrait touch-up enhancement
                  </p>
                </div>

                {/* Camera Input Selection */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Camera Source</label>
                  <select
                    value={settings.selectedCameraId || ''}
                    onChange={(e) => updateSettings({ selectedCameraId: e.target.value })}
                    className="w-full bg-[#181c2c] border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500 transition-colors"
                  >
                    {availableCameras.length === 0 ? (
                      <option value="">Default Integrated Camera</option>
                    ) : (
                      availableCameras.map((cam, idx) => (
                        <option key={cam.deviceId || idx} value={cam.deviceId}>
                          {cam.label || `Camera ${idx + 1}`}
                        </option>
                      ))
                    )}
                  </select>
                </div>

                {/* Video Options List */}
                <div className="space-y-3 pt-2">
                  {/* Mirror Video Toggle */}
                  <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#161a29] border border-white/10">
                    <div>
                      <span className="text-xs font-bold text-white block">Mirror My Video</span>
                      <span className="text-[11px] text-slate-400">
                        Flip camera horizontally for natural mirror perspective
                      </span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.isMirrored}
                        onChange={(e) => updateSettings({ isMirrored: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600" />
                    </label>
                  </div>

                  {/* HD Video Toggle */}
                  <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#161a29] border border-white/10">
                    <div>
                      <span className="text-xs font-bold text-white block">Enable High Definition (HD)</span>
                      <span className="text-[11px] text-slate-400">
                        Transmits crisp 720p/1080p stream when bandwidth permits
                      </span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.isHdEnabled}
                        onChange={(e) => updateSettings({ isHdEnabled: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600" />
                    </label>
                  </div>

                  {/* Touch Up My Appearance */}
                  <div className="p-3.5 rounded-2xl bg-[#161a29] border border-white/10 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xs font-bold text-white block">Touch Up My Appearance</span>
                        <span className="text-[11px] text-slate-400">
                          Soft focus skin smoothing and gentle lighting enhancement
                        </span>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.touchUpAppearance}
                          onChange={(e) => updateSettings({ touchUpAppearance: e.target.checked })}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600" />
                      </label>
                    </div>

                    {settings.touchUpAppearance && (
                      <div className="pt-2 flex items-center space-x-3">
                        <span className="text-[11px] text-slate-400 font-medium">Intensity:</span>
                        <input
                          type="range"
                          min="10"
                          max="100"
                          value={settings.touchUpIntensity}
                          onChange={(e) => updateSettings({ touchUpIntensity: Number(e.target.value) })}
                          className="flex-1 h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                        />
                        <span className="text-xs font-bold text-blue-400 w-8 text-right">
                          {settings.touchUpIntensity}%
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Adjust for Low Light */}
                  <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#161a29] border border-white/10">
                    <div>
                      <span className="text-xs font-bold text-white block">Adjust for Low Light</span>
                      <span className="text-[11px] text-slate-400">
                        Automatically compensates for dim room lighting
                      </span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.adjustLowLight}
                        onChange={(e) => updateSettings({ adjustLowLight: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600" />
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 5: Audio & Mic Settings */}
            {activeTab === 'audio' && (
              <div className="space-y-5">
                <div>
                  <h3 className="text-sm font-bold text-white">Audio & Microphone Devices</h3>
                  <p className="text-xs text-slate-400">
                    Configure microphone input levels, test audio output, and noise cancellation
                  </p>
                </div>

                {/* Microphone Section */}
                <div className="p-4 rounded-2xl bg-[#161a29] border border-white/10 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Mic className="w-4 h-4 text-emerald-400" />
                      <span>Microphone Input</span>
                    </label>
                    <span className="text-[11px] text-slate-400 font-medium">
                      Input Level: {micLevel}%
                    </span>
                  </div>

                  <select
                    value={settings.selectedMicId || ''}
                    onChange={(e) => updateSettings({ selectedMicId: e.target.value })}
                    className="w-full bg-[#111422] border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500 transition-colors"
                  >
                    {availableMics.length === 0 ? (
                      <option value="">Default Microphone</option>
                    ) : (
                      availableMics.map((mic, idx) => (
                        <option key={mic.deviceId || idx} value={mic.deviceId}>
                          {mic.label || `Microphone ${idx + 1}`}
                        </option>
                      ))
                    )}
                  </select>

                  {/* Real-time Level Bar */}
                  <div className="w-full bg-slate-800/80 rounded-full h-2.5 overflow-hidden flex">
                    <div
                      className={`h-full transition-all duration-75 ${
                        micLevel > 75 ? 'bg-amber-500' : micLevel > 20 ? 'bg-emerald-500' : 'bg-blue-500'
                      }`}
                      style={{ width: `${micLevel}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-slate-500 block">
                    Speak into your microphone to test your input audio sensitivity.
                  </span>
                </div>

                {/* Speaker Section */}
                <div className="p-4 rounded-2xl bg-[#161a29] border border-white/10 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Volume2 className="w-4 h-4 text-blue-400" />
                      <span>Speaker Output</span>
                    </label>

                    <button
                      onClick={handleTestSpeaker}
                      disabled={isPlayingTestAudio}
                      className="px-3 py-1.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 font-semibold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      <Play className="w-3.5 h-3.5" />
                      <span>{isPlayingTestAudio ? 'Playing Chime...' : 'Test Speaker'}</span>
                    </button>
                  </div>

                  <select
                    value={settings.selectedSpeakerId || ''}
                    onChange={(e) => updateSettings({ selectedSpeakerId: e.target.value })}
                    className="w-full bg-[#111422] border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500 transition-colors"
                  >
                    {availableSpeakers.length === 0 ? (
                      <option value="">Default System Speakers</option>
                    ) : (
                      availableSpeakers.map((spk, idx) => (
                        <option key={spk.deviceId || idx} value={spk.deviceId}>
                          {spk.label || `Speaker ${idx + 1}`}
                        </option>
                      ))
                    )}
                  </select>
                </div>

                {/* Suppress Background Noise */}
                <div className="p-4 rounded-2xl bg-[#161a29] border border-white/10 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-white block">Suppress Background Noise</span>
                      <span className="text-[11px] text-slate-400">
                        AI filtering for background fan noise, typing, and room echo
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-2 pt-1">
                    {(['auto', 'low', 'medium', 'high'] as const).map((level) => (
                      <button
                        key={level}
                        onClick={() => updateSettings({ noiseSuppression: level })}
                        className={`py-2 px-2.5 rounded-xl text-xs font-bold capitalize transition-all cursor-pointer ${
                          settings.noiseSuppression === level
                            ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                            : 'bg-[#111422] border border-white/10 text-slate-400 hover:text-white'
                        }`}
                      >
                        {level}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-white/10 bg-[#161b2d]/90">
          <button
            onClick={() => updateSettings(DEFAULT_ZOOM_SETTINGS)}
            className="text-xs text-slate-400 hover:text-slate-200 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset to Defaults</span>
          </button>

          <button
            onClick={onClose}
            className="py-2.5 px-6 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-600/20 transition-all cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
