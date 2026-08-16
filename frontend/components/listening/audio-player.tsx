"use client";

import { useRef, useState, useEffect } from "react";
import { Play, Pause, Volume2, VolumeX, RotateCcw, FastForward } from "lucide-react";
import { cn } from "@/lib/utils";
import { Slider } from "@/components/ui/slider";

interface AudioPlayerProps {
  audioUrl: string;
  onEnded?: () => void;
  autoPlay?: boolean;
  allowRewind?: boolean;
}

export function AudioPlayer({
  audioUrl,
  onEnded,
  autoPlay = false,
  allowRewind = true,
}: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);

  useEffect(() => {
    if (audioRef.current && autoPlay) {
      audioRef.current.play().catch(() => {
        // Auto-play was prevented
      });
    }
  }, [autoPlay, audioUrl]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
    if (onEnded) onEnded();
  };

  const handleSeek = (value: number[]) => {
    if (!audioRef.current) return;
    const newTime = value[0];
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleSkip = (seconds: number) => {
    if (!audioRef.current) return;
    const newTime = Math.min(Math.max(audioRef.current.currentTime + seconds, 0), duration);
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return "0:00";
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    audioRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleVolumeChange = (value: number[]) => {
    if (!audioRef.current) return;
    const newVolume = value[0];
    audioRef.current.volume = newVolume;
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  };

  const handleRateChange = (rate: number) => {
    if (!audioRef.current) return;
    audioRef.current.playbackRate = rate;
    setPlaybackRate(rate);
  };

  // Mock waveform bars
  const waveformBars = [
    12, 16, 24, 18, 14, 28, 36, 48, 32, 22, 16, 26, 38, 44, 30, 20, 14, 18,
    30, 42, 50, 36, 24, 16, 28, 40, 46, 34, 22, 14, 20, 32, 44, 36, 24, 18,
    14, 22, 34, 40, 28, 18, 12,
  ];

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="bg-white dark:bg-card border border-slate-200/80 dark:border-border/60 rounded-[28px] p-6 shadow-sm space-y-6">
      <audio
        ref={audioRef}
        src={audioUrl || undefined}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        className="hidden"
      />

      {/* Waveform Bar Graphic with scrubber */}
      <div className="relative py-2">
        <div className="flex items-center justify-between gap-1 h-14 px-2">
          {waveformBars.map((height, i) => {
            const barPercent = (i / waveformBars.length) * 100;
            const isPassed = barPercent <= progressPercent;

            return (
              <div
                key={i}
                className={cn(
                  "flex-1 rounded-full transition-all duration-150",
                  isPassed
                    ? "bg-[#0284c7]"
                    : "bg-slate-100 dark:bg-slate-800"
                )}
                style={{
                  height: `${height}px`,
                  minWidth: "2px",
                  maxWidth: "6px",
                }}
              />
            );
          })}
        </div>

        {/* Hidden / overlay scrubber slider */}
        <div className="pt-2">
          <Slider
            value={[currentTime]}
            max={duration || 420}
            step={1}
            onValueChange={handleSeek}
            className="w-full cursor-pointer"
          />
        </div>

        <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 dark:text-slate-500 pt-1.5">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration || 420)}</span>
        </div>
      </div>

      {/* Control Bar: Volume, Skip, Play/Pause, Speeds */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-1 border-t border-slate-100 dark:border-border/60">
        {/* Left: Volume Controls */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleMute}
            className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
          >
            {isMuted || volume === 0 ? (
              <VolumeX className="w-4 h-4" />
            ) : (
              <Volume2 className="w-4 h-4" />
            )}
          </button>
          <div className="w-16">
            <Slider
              value={[isMuted ? 0 : volume]}
              max={1}
              step={0.01}
              onValueChange={handleVolumeChange}
            />
          </div>
        </div>

        {/* Center: Play Controls (Previous, Large Blue Play Button, Next) */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => handleSkip(-5)}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-50 transition-colors"
            title="Rewind 5s"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={togglePlay}
            className="w-12 h-12 flex items-center justify-center rounded-2xl bg-[#0284c7] hover:bg-[#0369a1] text-white transition-all shadow-[0_4px_14px_rgba(2,132,199,0.35)] shrink-0"
          >
            {isPlaying ? (
              <Pause className="w-5 h-5" />
            ) : (
              <Play className="w-5 h-5 ml-0.5" />
            )}
          </button>

          <button
            type="button"
            onClick={() => handleSkip(5)}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-50 transition-colors"
            title="Forward 5s"
          >
            <FastForward className="w-4 h-4" />
          </button>
        </div>

        {/* Right: Speed controls */}
        <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-800/60 p-1 rounded-xl">
          {[0.75, 1, 1.25, 1.5].map((rate) => (
            <button
              key={rate}
              type="button"
              onClick={() => handleRateChange(rate)}
              className={cn(
                "px-2 py-0.5 text-[10px] font-bold rounded-lg transition-colors",
                playbackRate === rate
                  ? "bg-[#0284c7] text-white shadow-sm"
                  : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
              )}
            >
              {rate === 1 ? "1x" : `${rate}x`}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
