import { PlaybackProgress, ProgressMap } from '../types';

const STORAGE_KEY = 'pocket_play_progress_v1';

export const getStoredProgress = (): ProgressMap => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : {};
  } catch (e) {
    console.error("Failed to load progress", e);
    return {};
  }
};

export const saveVideoProgress = (fileName: string, currentTime: number, duration: number) => {
  try {
    const currentMap = getStoredProgress();
    
    // Don't save if duration is invalid or 0
    if (!duration || duration === 0) return;

    const progress: PlaybackProgress = {
      currentTime,
      duration,
      lastPlayedAt: Date.now(),
      completed: currentTime >= duration - 2 // Mark completed if within 2 seconds of end
    };

    const newMap = {
      ...currentMap,
      [fileName]: progress
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(newMap));
  } catch (e) {
    console.error("Failed to save progress", e);
  }
};

export const getProgressForFile = (fileName: string): PlaybackProgress | null => {
  const map = getStoredProgress();
  return map[fileName] || null;
};

export const formatTime = (seconds: number): string => {
  if (!seconds || isNaN(seconds)) return "00:00";
  
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);

  if (h > 0) {
    return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }
  return `${m}:${s.toString().padStart(2, '0')}`;
};