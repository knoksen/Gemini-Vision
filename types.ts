import { LucideIcon } from 'lucide-react';

export interface UploadedImage {
  id: number;
  file: File;
  url: string;
  name: string;
  size: number;
  uploadedAt: Date;
}

export interface Task {
  value: string;
  label: string;
  icon: LucideIcon;
  description: string;
  examples: string[];
}

export interface TaskCategory {
  name: string;
  color: string;
  tasks: Task[];
}

export interface AnalysisHistoryItem {
  id: number;
  timestamp: Date;
  task: string;
  prompt: string;
  image: UploadedImage;
  result: string;
  model: string;
}

export interface SystemStatus {
  modelHealth: 'online' | 'offline' | 'degraded';
  apiStatus: 'healthy' | 'unhealthy';
  queueLength: number;
}

export interface Notification {
  id: number;
  type: 'success' | 'error' | 'info';
  title: string;
  message: string;
}

export interface AppSettings {
    temperature: number;
    maxTokens: number;
}

export interface AppState {
  uploadedImages: UploadedImage[];
  selectedImageIndex: number;
  selectedTask: string;
  textPrompt: string;
  results: string;
  isLoading: boolean;
  error: string;
  activeTab: 'workspace' | 'history' | 'settings';
  analysisHistory: AnalysisHistoryItem[];
  darkMode: boolean;
  systemStatus: SystemStatus;
  apiKeyStatus: 'valid' | 'missing';
  settings: AppSettings;
  notifications: Notification[];
}

export type AppAction =
  | { type: 'SET_API_KEY_STATUS'; payload: 'valid' | 'missing' }
  | { type: 'SET_IMAGES'; payload: UploadedImage[] }
  | { type: 'SET_SELECTED_IMAGE_INDEX'; payload: number }
  | { type: 'SET_TASK'; payload: string }
  | { type: 'SET_PROMPT'; payload: string }
  | { type: 'PROCESS_START' }
  | { type: 'APPEND_TO_RESULT'; payload: string }
  | { type: 'PROCESS_COMPLETE'; payload: { historyItem: AnalysisHistoryItem } }
  | { type: 'PROCESS_ERROR'; payload: string }
  | { type: 'CLEAR_ERROR' }
  | { type: 'SET_TAB'; payload: 'workspace' | 'history' | 'settings' }
  | { type: 'DELETE_FROM_HISTORY'; payload: number }
  | { type: 'SET_DARK_MODE'; payload: boolean }
  | { type: 'UPDATE_SYSTEM_STATUS'; payload: Partial<SystemStatus> }
  | { type: 'RESET_WORKSPACE' }
  | { type: 'UPDATE_SETTINGS'; payload: Partial<AppSettings> }
  | { type: 'ADD_NOTIFICATION'; payload: Omit<Notification, 'id'> }
  | { type: 'REMOVE_NOTIFICATION'; payload: number };