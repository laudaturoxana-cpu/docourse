"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import { Play, Pause, Volume2, VolumeX, RotateCcw, Loader2 } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";

interface AudioPlayerProps {
  src: string;
  title?: string;
  onProgress?: (currentTime: number, duration: number) => void;
  onComplete?: () => void;
  initialTime?: number;
  className?: string;
}

const formatTime = (seconds: number): string => {
  if (isNaN(seconds) || !isFinite(seconds)) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

const AudioPlayer = ({
  src,
  title,
  onProgress,
  onComplete,
  initialTime = 0,
  className,
}: AudioPlayerProps) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Handle audio metadata loaded
  const handleLoadedMetadata = useCallback(() => {
    const audio = audioRef.current;
    if (audio) {
      setDuration(audio.duration);
      setIsLoading(false);
      // Set initial time if provided
      if (initialTime > 0 && initialTime < audio.duration) {
        audio.currentTime = initialTime;
        setCurrentTime(initialTime);
      }
    }
  }, [initialTime]);

  // Handle time update
  const handleTimeUpdate = useCallback(() => {
    const audio = audioRef.current;
    if (audio) {
      setCurrentTime(audio.currentTime);
    }
  }, []);

  // Handle audio ended
  const handleEnded = useCallback(() => {
    setIsPlaying(false);
    if (onComplete) {
      onComplete();
    }
  }, [onComplete]);

  // Handle error
  const handleError = useCallback(() => {
    setIsLoading(false);
    setError("Nu s-a putut încărca fișierul audio. Verifică conexiunea sau încearcă alt browser.");
  }, []);

  // Handle can play
  const handleCanPlay = useCallback(() => {
    setIsLoading(false);
    setError(null);
  }, []);

  // Progress reporting (debounced)
  useEffect(() => {
    if (isPlaying && onProgress) {
      progressIntervalRef.current = setInterval(() => {
        const audio = audioRef.current;
        if (audio) {
          onProgress(audio.currentTime, audio.duration);
        }
      }, 5000); // Report every 5 seconds
    }

    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, [isPlaying, onProgress]);

  // Play/Pause toggle
  const togglePlay = async () => {
    const audio = audioRef.current;
    if (!audio) return;

    try {
      if (isPlaying) {
        audio.pause();
        setIsPlaying(false);
      } else {
        // For Safari compatibility, we need to handle the play promise
        const playPromise = audio.play();
        if (playPromise !== undefined) {
          await playPromise;
          setIsPlaying(true);
        }
      }
    } catch (err) {
      console.error("Error playing audio:", err);
      setError("Eroare la redare. Click din nou pentru a încerca.");
    }
  };

  // Seek to position
  const handleSeek = (value: number[]) => {
    const audio = audioRef.current;
    if (audio && duration > 0) {
      const newTime = (value[0] / 100) * duration;
      audio.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  // Volume change
  const handleVolumeChange = (value: number[]) => {
    const audio = audioRef.current;
    const newVolume = value[0] / 100;
    setVolume(newVolume);
    if (audio) {
      audio.volume = newVolume;
    }
    if (newVolume === 0) {
      setIsMuted(true);
    } else {
      setIsMuted(false);
    }
  };

  // Toggle mute
  const toggleMute = () => {
    const audio = audioRef.current;
    if (audio) {
      if (isMuted) {
        audio.volume = volume || 0.5;
        setIsMuted(false);
      } else {
        audio.volume = 0;
        setIsMuted(true);
      }
    }
  };

  // Restart audio
  const restart = () => {
    const audio = audioRef.current;
    if (audio) {
      audio.currentTime = 0;
      setCurrentTime(0);
    }
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className={cn("bg-gradient-to-r from-navy/5 to-gold/5 rounded-2xl p-4 sm:p-6 border border-border", className)}>
      {/* Hidden audio element - using multiple sources for browser compatibility */}
      <audio
        ref={audioRef}
        preload="metadata"
        onLoadedMetadata={handleLoadedMetadata}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleEnded}
        onError={handleError}
        onCanPlay={handleCanPlay}
        onWaiting={() => setIsLoading(true)}
        onPlaying={() => setIsLoading(false)}
      >
        {/* Primary source */}
        <source src={src} />
        {/* Fallback message */}
        Browser-ul tău nu suportă redarea audio.
      </audio>

      {/* Title */}
      {title && (
        <div className="mb-4">
          <h4 className="font-medium text-navy truncate">{title}</h4>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="text-sm text-destructive mb-4 p-3 bg-destructive/10 rounded-lg">
          {error}
        </div>
      )}

      {/* Controls */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Play/Pause Button */}
        <button
          onClick={togglePlay}
          disabled={isLoading && !error}
          className={cn(
            "w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center transition-all",
            "bg-gold text-navy hover:bg-gold/90 disabled:opacity-50 disabled:cursor-not-allowed",
            "shadow-lg hover:shadow-xl"
          )}
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 sm:w-6 sm:h-6 animate-spin" />
          ) : isPlaying ? (
            <Pause className="w-5 h-5 sm:w-6 sm:h-6" />
          ) : (
            <Play className="w-5 h-5 sm:w-6 sm:h-6 ml-0.5" />
          )}
        </button>

        {/* Progress section */}
        <div className="flex-1 min-w-0">
          {/* Progress bar */}
          <Slider
            value={[progress]}
            max={100}
            step={0.1}
            onValueChange={handleSeek}
            className="cursor-pointer"
          />

          {/* Time display */}
          <div className="flex justify-between mt-1.5 text-xs sm:text-sm text-muted-foreground">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Volume controls - hidden on mobile */}
        <div className="hidden sm:flex items-center gap-2">
          <button
            onClick={toggleMute}
            className="p-2 text-muted-foreground hover:text-navy transition-colors"
          >
            {isMuted || volume === 0 ? (
              <VolumeX className="w-5 h-5" />
            ) : (
              <Volume2 className="w-5 h-5" />
            )}
          </button>
          <Slider
            value={[isMuted ? 0 : volume * 100]}
            max={100}
            step={1}
            onValueChange={handleVolumeChange}
            className="w-20 cursor-pointer"
          />
        </div>

        {/* Restart button */}
        <button
          onClick={restart}
          className="p-2 text-muted-foreground hover:text-navy transition-colors"
          title="Repornește"
        >
          <RotateCcw className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
      </div>

      {/* Resume from saved position indicator */}
      {initialTime > 0 && currentTime < 1 && (
        <div className="mt-3 text-xs text-muted-foreground flex items-center gap-2">
          <Play className="w-3 h-3" />
          <span>Reia de la {formatTime(initialTime)}</span>
        </div>
      )}
    </div>
  );
};

export default AudioPlayer;
