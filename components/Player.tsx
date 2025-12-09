import React, { useRef, useEffect, useState } from 'react';
import { ArrowLeft, RefreshCcw, SkipForward, SkipBack } from 'lucide-react';
import { VideoFile } from '../types';
import { getProgressForFile, saveVideoProgress } from '../services/storageService';

interface PlayerProps {
  video: VideoFile;
  onBack: () => void;
  onEnded: () => void;
  onPrevious: () => void;
}

const Player: React.FC<PlayerProps> = ({ video, onBack, onEnded, onPrevious }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const saveIntervalRef = useRef<number | null>(null);
  const [showControls, setShowControls] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const controlTimeoutRef = useRef<number | null>(null);

  // Load saved progress on mount
  useEffect(() => {
    const savedProgress = getProgressForFile(video.name);
    
    if (videoRef.current) {
      // If we have saved progress, set it. 
      if (savedProgress && savedProgress.currentTime < savedProgress.duration - 2) {
        videoRef.current.currentTime = savedProgress.currentTime;
      } else {
        // If it was finished previously or new, start from 0
        videoRef.current.currentTime = 0;
      }
      
      // Auto play
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch(e => console.log("Autoplay blocked or interrupted", e));
      }
    }

    return () => {
      if (saveIntervalRef.current) clearInterval(saveIntervalRef.current);
    };
  }, [video]);

  // Handle video events
  useEffect(() => {
    const handleTimeUpdate = () => {
      if (videoRef.current) {
        saveVideoProgress(
          video.name, 
          videoRef.current.currentTime, 
          videoRef.current.duration
        );
      }
    };

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    
    // When video ends, ensure 100% progress is saved, then call onEnded
    const handleEnded = () => {
      if (videoRef.current) {
        saveVideoProgress(video.name, videoRef.current.duration, videoRef.current.duration);
        setIsPlaying(false);
        onEnded();
      }
    };

    const v = videoRef.current;
    if (v) {
      v.addEventListener('timeupdate', handleTimeUpdate);
      v.addEventListener('play', handlePlay);
      v.addEventListener('pause', handlePause);
      v.addEventListener('ended', handleEnded);
    }

    return () => {
      if (v) {
        v.removeEventListener('timeupdate', handleTimeUpdate);
        v.removeEventListener('play', handlePlay);
        v.removeEventListener('pause', handlePause);
        v.removeEventListener('ended', handleEnded);
        // Save one last time on unmount if not ended
        if (!v.ended) {
          saveVideoProgress(video.name, v.currentTime, v.duration);
        }
      }
    };
  }, [video.name, onEnded]);

  // Toggle controls visibility for immersive feel
  const toggleControls = () => {
    setShowControls(prev => !prev);
    if (!showControls && isPlaying) {
      if (controlTimeoutRef.current) clearTimeout(controlTimeoutRef.current);
      controlTimeoutRef.current = window.setTimeout(() => setShowControls(false), 3000);
    }
  };

  const restartVideo = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play();
    }
  };

  const skipVideo = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEnded(); // Manually trigger next video
  };

  const previousVideo = (e: React.MouseEvent) => {
    e.stopPropagation();
    onPrevious();
  };

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col items-center justify-center animate-fade-in">
      {/* Top Bar - Sticky */}
      <div 
        className={`absolute top-0 left-0 right-0 p-4 z-20 flex items-center justify-between transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.8), transparent)' }}
      >
        <button 
          onClick={onBack}
          className="p-2 bg-white/10 backdrop-blur-md rounded-full text-white hover:bg-white/20 active:scale-95 transition-all"
        >
          <ArrowLeft size={24} />
        </button>
        <div className="text-white/90 font-medium truncate max-w-[40%] text-sm drop-shadow-md">
          {video.name}
        </div>
        <div className="flex items-center gap-2">
           <button 
            onClick={previousVideo}
            className="p-2 bg-white/10 backdrop-blur-md rounded-full text-white hover:bg-white/20 active:scale-95 transition-all"
          >
            <SkipBack size={20} />
          </button>
           <button 
            onClick={restartVideo}
            className="p-2 bg-white/10 backdrop-blur-md rounded-full text-white hover:bg-white/20 active:scale-95 transition-all"
          >
            <RefreshCcw size={20} />
          </button>
          <button 
            onClick={skipVideo}
            className="p-2 bg-white/10 backdrop-blur-md rounded-full text-white hover:bg-white/20 active:scale-95 transition-all"
          >
            <SkipForward size={20} />
          </button>
        </div>
       
      </div>

      {/* Video Element */}
      {/* We use native controls for best mobile support (battery, fullscreen, pip) */}
      <div 
        className="w-full h-full flex items-center justify-center" 
        onClick={toggleControls}
      >
        <video
          ref={videoRef}
          src={video.url}
          className="w-full max-h-screen object-contain"
          controls
          controlsList="nodownload"
          playsInline
          autoPlay
        />
      </div>
    </div>
  );
};

export default Player;