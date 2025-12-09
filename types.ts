export interface VideoFile {
  id: string;
  url: string;
  name: string;
  file?: File; // Optional now, as hardcoded videos won't have a File object
}

export interface PlaybackProgress {
  currentTime: number;
  duration: number;
  lastPlayedAt: number;
  completed: boolean;
}

export interface ProgressMap {
  [fileName: string]: PlaybackProgress;
}

export enum ViewState {
  LIBRARY = 'LIBRARY',
  PLAYER = 'PLAYER'
}