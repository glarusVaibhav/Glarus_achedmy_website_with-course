"use client";

import { useEffect, useRef, useState, useCallback } from "react";

export interface ShakaTrack {
  id: number;
  height: number;
  width: number;
  bandwidth: number;
  label: string;
  active: boolean;
  rawTrack: any;
}

export interface UseShakaPlayerOptions {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  manifestUrl?: string | null;
  autoPlay?: boolean;
  startTime?: number;
  onBuffering?: (isBuffering: boolean) => void;
  onError?: (error: any) => void;
}

export function useShakaPlayer({
  videoRef,
  manifestUrl,
  autoPlay = false,
  startTime,
  onBuffering,
  onError,
}: UseShakaPlayerOptions) {
  const playerRef = useRef<any>(null);
  const [isSupported, setIsSupported] = useState<boolean>(true);
  const [tracks, setTracks] = useState<ShakaTrack[]>([]);
  const [selectedTrackId, setSelectedTrackId] = useState<number>(-1); // -1 = Auto (ABR)
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [playerError, setPlayerError] = useState<string | null>(null);

  const updateTrackList = useCallback((rawTracks: any[]) => {
    if (!rawTracks || rawTracks.length === 0) return;

    // Filter unique heights / resolutions
    const seenHeights = new Set<number>();
    const formatted: ShakaTrack[] = [];

    // Sort descending by height / bandwidth
    const sorted = [...rawTracks].sort((a, b) => (b.height || 0) - (a.height || 0));

    for (const t of sorted) {
      const h = t.height || 0;
      if (h > 0 && !seenHeights.has(h)) {
        seenHeights.add(h);
        formatted.push({
          id: t.id,
          height: h,
          width: t.width || 0,
          bandwidth: t.bandwidth || 0,
          label: `${h}p`,
          active: Boolean(t.active),
          rawTrack: t,
        });
      }
    }

    setTracks(formatted);
  }, []);

  // Initialize Shaka Player on video element
  useEffect(() => {
    if (typeof window === "undefined") return;

    let isMounted = true;
    let shakaInstance: any = null;

    async function initShaka() {
      try {
        const shakaModule = (await import("shaka-player/dist/shaka-player.compiled.js")) as any;
        const shaka = shakaModule.default || shakaModule;

        shaka.polyfill?.installAll?.();

        if (!shaka.Player?.isBrowserSupported?.()) {
          console.warn("[Shaka Player] Browser does not support Shaka MSE/EME, using native fallback.");
          if (isMounted) setIsSupported(false);
          return;
        }

        const video = videoRef.current;
        if (!video) return;

        shakaInstance = new shaka.Player(video);
        playerRef.current = shakaInstance;

        shakaInstance.configure({
          streaming: {
            bufferingGoal: 30,
            rebufferingGoal: 2,
            bufferBehind: 30,
            retryParameters: {
              maxAttempts: 4,
              baseDelay: 1000,
              backoffFactor: 2,
            },
          },
          abr: {
            enabled: true,
            defaultBandwidthEstimate: 2500000,
          },
        });

        shakaInstance.addEventListener("error", (event: any) => {
          const err = event.detail;
          console.error("[Shaka Player Error]:", err);
          if (isMounted) {
            setPlayerError(err?.message || `Playback error code: ${err?.code}`);
            onError?.(err);
          }
        });

        shakaInstance.addEventListener("buffering", (event: any) => {
          if (isMounted) {
            onBuffering?.(Boolean(event.buffering));
          }
        });

        shakaInstance.addEventListener("adaptation", () => {
          if (isMounted && shakaInstance) {
            const variantTracks = shakaInstance.getVariantTracks();
            updateTrackList(variantTracks);
          }
        });
      } catch (err: any) {
        console.warn("[Shaka Player Init Error]:", err);
        if (isMounted) setIsSupported(false);
      }
    }

    initShaka();

    return () => {
      isMounted = false;
      if (playerRef.current) {
        playerRef.current.destroy().catch(() => {});
        playerRef.current = null;
      }
    };
  }, [videoRef, onBuffering, onError, updateTrackList]);

  // Load stream when manifestUrl changes
  useEffect(() => {
    const player = playerRef.current;
    const currentVideo = videoRef.current;
    if (!manifestUrl || !currentVideo) return;

    let isCancelled = false;

    async function loadStream() {
      setIsLoading(true);
      setPlayerError(null);

      try {
        if (player) {
          await player.load(manifestUrl, startTime);

          if (!isCancelled) {
            const rawTracks = player.getVariantTracks();
            updateTrackList(rawTracks);
            setSelectedTrackId(-1); // Auto ABR by default

            if (autoPlay && videoRef.current) {
              videoRef.current.play().catch(() => {});
            }
          }
        } else if (videoRef.current && manifestUrl) {
          // Native HTML5 fallback (e.g. Safari native HLS or direct MP4)
          videoRef.current.src = manifestUrl;
          if (startTime && startTime > 0) {
            videoRef.current.currentTime = startTime;
          }
          if (autoPlay) {
            videoRef.current.play().catch(() => {});
          }
        }
      } catch (err: any) {
        if (!isCancelled && videoRef.current && manifestUrl) {
          console.warn("[Shaka Load Notice] Falling back to native video element:", err?.message);
          videoRef.current.src = manifestUrl;
          setPlayerError(null);
        }
      } finally {
        if (!isCancelled) setIsLoading(false);
      }
    }

    loadStream();

    return () => {
      isCancelled = true;
    };
  }, [manifestUrl, startTime, autoPlay, videoRef, updateTrackList]);

  // Track selection (manual quality switching)
  const selectQuality = useCallback((trackId: number) => {
    const player = playerRef.current;
    if (!player) return;

    if (trackId === -1) {
      // Enable Automatic Bitrate Selection (ABR)
      player.configure({ abr: { enabled: true } });
      setSelectedTrackId(-1);
    } else {
      // Disable ABR and select specific variant track
      player.configure({ abr: { enabled: false } });
      const rawTracks = player.getVariantTracks();
      const targetTrack = rawTracks.find((t: any) => t.id === trackId);
      if (targetTrack) {
        player.selectVariantTrack(targetTrack, /* clearBuffer */ true);
        setSelectedTrackId(trackId);
      }
    }
  }, []);

  return {
    player: playerRef.current,
    isSupported,
    tracks,
    selectedTrackId,
    selectQuality,
    isLoading,
    playerError,
  };
}
