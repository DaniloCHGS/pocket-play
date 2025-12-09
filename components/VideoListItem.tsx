import React from 'react';
import { PlayCircle, Clock, CheckCircle2 } from 'lucide-react';
import { VideoFile, PlaybackProgress } from '../types';
import { formatTime } from '../services/storageService';

interface VideoListItemProps {
  video: VideoFile;
  progress: PlaybackProgress | null;
  onSelect: (video: VideoFile) => void;
}

const VideoListItem: React.FC<VideoListItemProps> = ({ video, progress, onSelect }) => {
  const hasProgress = progress !== null && progress.duration > 0;
  const percent = hasProgress 
    ? Math.min(100, Math.max(0, (progress!.currentTime / progress!.duration) * 100)) 
    : 0;
  
  const isFinished = progress?.completed || percent > 98;

  return (
    <div 
      onClick={() => onSelect(video)}
      className="group relative bg-gray-800/50 backdrop-blur-sm active:scale-[0.98] transition-all duration-200 p-4 rounded-xl border border-gray-700/50 hover:border-primary-500/50 cursor-pointer overflow-hidden"
    >
      <div className="flex items-start justify-between gap-3">
        {/* Icon & Info */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className={`p-3 rounded-full flex-shrink-0 ${isFinished ? 'bg-green-500/20 text-green-400' : 'bg-primary-500/20 text-primary-400'}`}>
             {isFinished ? <CheckCircle2 size={24} /> : <PlayCircle size={24} />}
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="text-white font-medium truncate text-base mb-1 leading-tight">
              {video.name}
            </h3>
            
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <Clock size={12} />
              <span>
                {hasProgress 
                  ? `${formatTime(progress!.currentTime)} / ${formatTime(progress!.duration)}` 
                  : 'Não iniciado'
                }
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar Background */}
      {hasProgress && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-700">
          <div 
            className={`h-full ${isFinished ? 'bg-green-500' : 'bg-primary-500'} transition-all duration-500`}
            style={{ width: `${percent}%` }}
          />
        </div>
      )}
    </div>
  );
};

export default VideoListItem;