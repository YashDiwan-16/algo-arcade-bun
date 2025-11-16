"use client";

import { useRef, useCallback, useEffect, useState } from "react";

export interface UseSoundOptions {
  volume?: number;
  playbackRate?: number;
  loop?: boolean;
  soundEnabled?: boolean;
  interrupt?: boolean;
  onEnd?: () => void;
}

export interface SoundControls {
  play: () => void;
  pause: () => void;
  stop: () => void;
  setVolume: (volume: number) => void;
  setPlaybackRate: (rate: number) => void;
  isPlaying: boolean;
}

/**
 * Custom hook for playing sounds in the application
 *
 * @param src - The path to the sound file (e.g., "/sounds/click.mp3")
 * @param options - Optional configuration for the sound
 * @returns A tuple with [play function, sound controls object]
 *
 * @example
 * ```tsx
 * const [playClick] = useSound("/sounds/click.mp3");
 * const [playWin, { pause, stop }] = useSound("/sounds/win.mp3", { volume: 0.5 });
 *
 * // Simple usage
 * <button onClick={playClick}>Click me</button>
 *
 * // With controls
 * <button onClick={playWin}>Play</button>
 * <button onClick={pause}>Pause</button>
 * <button onClick={stop}>Stop</button>
 * ```
 */
export function useSound(
  src: string,
  options: UseSoundOptions = {},
): [() => void, SoundControls] {
  const {
    volume = 1.0,
    playbackRate = 1.0,
    loop = false,
    soundEnabled = true,
    interrupt = false,
    onEnd,
  } = options;

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // Initialize audio element
  useEffect(() => {
    if (typeof window === "undefined") return;

    const audio = new Audio(src);
    audio.volume = volume;
    audio.playbackRate = playbackRate;
    audio.loop = loop;

    if (onEnd) {
      audio.addEventListener("ended", onEnd);
    }

    audioRef.current = audio;

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        if (onEnd) {
          audioRef.current.removeEventListener("ended", onEnd);
        }
        audioRef.current = null;
      }
    };
  }, [src, volume, playbackRate, loop, onEnd]);

  const play = useCallback(() => {
    if (!soundEnabled || !audioRef.current) return;

    const audio = audioRef.current;

    // If interrupt is true, stop current playback and restart
    if (interrupt && isPlaying) {
      audio.pause();
      audio.currentTime = 0;
    }

    // Play the sound
    audio.play().catch((error) => {
      // Handle autoplay policy errors gracefully
      console.warn("Error playing sound:", error);
    });

    setIsPlaying(true);

    // Update isPlaying when sound ends
    const handleEnded = () => {
      setIsPlaying(false);
    };

    audio.addEventListener("ended", handleEnded, { once: true });
  }, [soundEnabled, interrupt, isPlaying]);

  const pause = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  }, []);

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
    }
  }, []);

  const setVolume = useCallback((newVolume: number) => {
    if (audioRef.current) {
      audioRef.current.volume = Math.max(0, Math.min(1, newVolume));
    }
  }, []);

  const setPlaybackRate = useCallback((rate: number) => {
    if (audioRef.current) {
      audioRef.current.playbackRate = Math.max(0.5, Math.min(4, rate));
    }
  }, []);

  const controls: SoundControls = {
    play,
    pause,
    stop,
    setVolume,
    setPlaybackRate,
    isPlaying,
  };

  return [play, controls];
}

/**
 * Hook for managing multiple sounds with global volume control
 *
 * @example
 * ```tsx
 * const soundManager = useSoundManager({
 *   click: "/sounds/click.mp3",
 *   win: "/sounds/win.mp3",
 *   lose: "/sounds/lose.mp3",
 * });
 *
 * soundManager.play("click");
 * soundManager.setGlobalVolume(0.5);
 * soundManager.stopAll();
 * ```
 */
export function useSoundManager<T extends Record<string, string>>(
  sounds: T,
  defaultVolume = 1.0,
) {
  const soundsRef = useRef<Record<string, HTMLAudioElement>>({});
  const volumeRef = useRef(defaultVolume);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Initialize all sounds
    Object.entries(sounds).forEach(([key, src]) => {
      const audio = new Audio(src);
      audio.volume = volumeRef.current;
      soundsRef.current[key] = audio;
    });

    return () => {
      // Cleanup all sounds
      Object.values(soundsRef.current).forEach((audio) => {
        audio.pause();
        audio.currentTime = 0;
      });
      soundsRef.current = {};
    };
  }, [sounds]);

  const play = useCallback((name: keyof T) => {
    const audio = soundsRef.current[name as string];
    if (audio) {
      audio.currentTime = 0;
      audio.play().catch((error) => {
        console.warn(`Error playing sound "${String(name)}":`, error);
      });
    }
  }, []);

  const stop = useCallback((name: keyof T) => {
    const audio = soundsRef.current[name as string];
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
  }, []);

  const stopAll = useCallback(() => {
    Object.values(soundsRef.current).forEach((audio) => {
      audio.pause();
      audio.currentTime = 0;
    });
  }, []);

  const setGlobalVolume = useCallback((volume: number) => {
    const clampedVolume = Math.max(0, Math.min(1, volume));
    volumeRef.current = clampedVolume;
    Object.values(soundsRef.current).forEach((audio) => {
      audio.volume = clampedVolume;
    });
  }, []);

  return {
    play,
    stop,
    stopAll,
    setGlobalVolume,
  };
}
