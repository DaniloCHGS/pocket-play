import React, { useState, useEffect } from 'react';
import { Film, Clock, Play } from 'lucide-react';
import { VideoFile, ViewState, ProgressMap } from './types';
import { getStoredProgress, formatTime } from './services/storageService';
import VideoListItem from './components/VideoListItem';
import Player from './components/Player';

// ==========================================
// VIDEO LIBRARY CONFIGURATION
// ==========================================
// To add new videos:
// 1. Place the video file in your project's public folder (e.g., /public/videos/lecture1.mp4)
// 2. Add an entry to the array below with the path:
//    { id: 'vid-1', name: 'Lecture 1', url: '/videos/lecture1.mp4' }
// ==========================================
const HARDCODED_VIDEOS: VideoFile[] = [
  {
    id: 'study-1',
    name: 'Study With Me - 1 Hour',
    // Using a sample MP4 because YouTube links (https://www.youtube.com/watch?v=1Ke-c7BBBTA) 
    // cannot be played in a standard <video> tag without an iframe.
    // Replace this URL with your local file path, e.g., require('./assets/study.mp4') or '/videos/study.mp4'
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4' 
  },
  {
    id: 'lofi-relax',
    name: 'Lofi Hip Hop - Relaxing Beats',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'
  },
  {
    id: 'nature-rain',
    name: 'Heavy Rain in Tokyo - Ambience',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4'
  }
];

function App() {
  const [files] = useState<VideoFile[]>(HARDCODED_VIDEOS);
  const [currentVideo, setCurrentVideo] = useState<VideoFile | null>(null);
  const [viewState, setViewState] = useState<ViewState>(ViewState.LIBRARY);
  const [progressMap, setProgressMap] = useState<ProgressMap>({});

  // Refresh progress map whenever we return to library
  useEffect(() => {
    if (viewState === ViewState.LIBRARY) {
      setProgressMap(getStoredProgress());
    }
  }, [viewState]);

  const handleSelectVideo = (video: VideoFile) => {
    setCurrentVideo(video);
    setViewState(ViewState.PLAYER);
  };

  const handleBackToLibrary = () => {
    setCurrentVideo(null);
    setViewState(ViewState.LIBRARY);
  };

  const handleVideoEnded = () => {
    if (!currentVideo) return;

    const currentIndex = files.findIndex(f => f.id === currentVideo.id);
    const nextIndex = currentIndex + 1;

    if (nextIndex < files.length) {
      // Play next video
      setCurrentVideo(files[nextIndex]);
    } else {
      // Playlist finished, return to library
      handleBackToLibrary();
    }
  };

  const handlePreviousVideo = () => {
    if (!currentVideo) return;

    const currentIndex = files.findIndex(f => f.id === currentVideo.id);
    const prevIndex = currentIndex - 1;

    if (prevIndex >= 0) {
      setCurrentVideo(files[prevIndex]);
    }
  };

  // Logic to find the last watched video that isn't finished
  const getResumeVideo = () => {
    const startedVideos = files
      .map(f => ({ file: f, progress: progressMap[f.name] }))
      .filter(item => item.progress && !item.progress.completed && item.progress.currentTime > 2); // Ignore if less than 2s played

    if (startedVideos.length === 0) return null;

    // Sort by lastPlayedAt descending
    startedVideos.sort((a, b) => b.progress.lastPlayedAt - a.progress.lastPlayedAt);

    return startedVideos[0];
  };

  const resumeItem = getResumeVideo();
  
  // Filter out the resume item from the main list if it exists
  const visibleFiles = resumeItem 
    ? files.filter(f => f.id !== resumeItem.file.id)
    : files;

  if (viewState === ViewState.PLAYER && currentVideo) {
    return (
      <Player 
        video={currentVideo} 
        onBack={handleBackToLibrary} 
        onEnded={handleVideoEnded}
        onPrevious={handlePreviousVideo}
      />
    );
  }

  return (
    <div className="h-full flex flex-col bg-gray-950 text-white">
      {/* Header */}
      <header className="px-6 py-5 bg-gray-900/50 backdrop-blur-lg border-b border-gray-800 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-primary-600 rounded-lg shadow-lg shadow-primary-500/20">
              <Film className="text-white" size={24} />
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
              Pocket Play
            </h1>
          </div>
          <div className="text-xs font-mono text-gray-500 bg-gray-900 px-2 py-1 rounded border border-gray-800">
            OFFLINE
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-4 pb-8 no-scrollbar">
        <div className="space-y-6 animate-slide-up">
          
          {/* Featured Resume Card */}
          {resumeItem && (
            <div 
              onClick={() => handleSelectVideo(resumeItem.file)}
              className="relative w-full aspect-[2/1] sm:aspect-[21/9] rounded-2xl overflow-hidden cursor-pointer group shadow-2xl shadow-primary-900/20 border border-gray-800"
            >
              {/* Background Gradient */}
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 to-gray-900 transition-transform duration-700 group-hover:scale-105" />
              
              {/* Decorative Elements */}
              <div className="absolute -right-10 -top-10 w-40 h-40 bg-primary-500/20 rounded-full blur-3xl" />
              <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-purple-500/20 rounded-full blur-3xl" />
              
              <div className="absolute inset-0 bg-gradient-to-t from-gray-950/90 via-gray-900/40 to-transparent" />

              {/* Content */}
              <div className="absolute inset-0 p-5 flex flex-col justify-between z-10">
                <div className="flex justify-between items-start">
                  <span className="inline-flex items-center gap-1.5 bg-white/10 backdrop-blur-md border border-white/10 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider text-white uppercase shadow-sm">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                    Continue Assistindo
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="flex items-end justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <h2 className="text-xl sm:text-2xl font-bold text-white leading-tight mb-1 truncate">
                        {resumeItem.file.name}
                      </h2>
                      <div className="flex items-center gap-2 text-gray-300 text-sm">
                        <Clock size={14} className="text-primary-400" />
                        <span>Parou em {formatTime(resumeItem.progress.currentTime)}</span>
                      </div>
                    </div>
                    
                    <div className="bg-primary-600 text-white p-3 rounded-full shadow-lg shadow-primary-600/30 group-hover:scale-110 group-active:scale-95 transition-all duration-300">
                      <Play size={24} fill="currentColor" />
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="relative h-1.5 bg-gray-700/50 rounded-full overflow-hidden backdrop-blur-sm">
                    <div 
                      className="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-primary-500 to-purple-500 transition-all duration-500"
                      style={{ width: `${(resumeItem.progress.currentTime / resumeItem.progress.duration) * 100}%` }}
                    >
                      <div className="absolute right-0 top-0 bottom-0 w-2 bg-white/50 blur-[2px]" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* List Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
                Minha playlist ({visibleFiles.length})
              </h2>
            </div>
            {visibleFiles.map((video) => (
              <VideoListItem 
                key={video.id} 
                video={video} 
                progress={progressMap[video.name] || null}
                onSelect={handleSelectVideo}
              />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;