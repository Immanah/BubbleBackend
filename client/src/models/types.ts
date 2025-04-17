export interface User {
  id: number;
  username: string;
}

export interface Message {
  id: string;
  content: string;
  sender: 'user' | 'bubble';
  timestamp: Date;
  mood?: Mood;
}

export interface JournalEntry {
  id: number;
  title: string;
  content: string;
  mood: Mood;
  createdAt: Date;
}

export type Mood = 'happy' | 'calm' | 'sad' | 'anxious' | 'stressed' | 'neutral' | 'improved';

export interface MoodData {
  mood: Mood;
  timestamp: Date;
  value: number; // A value between 0-100 representing the intensity
}

export interface Environment {
  id: string;
  name: string;
  imageUrl: string;
  description?: string;
  sceneUrl?: string; // URL to 3D scene if available
}

export interface AvatarCustomization {
  faceShape: 'round' | 'square' | 'triangle';
  eyeStyle: 'default' | 'happy' | 'cool';
  color: string;
  accessories: string[];
}

export interface Reminder {
  id: number;
  title: string;
  description?: string;
  time: Date;
}

export interface WebSocketMessage {
  type: 'chat' | 'mood' | 'reminder' | 'system';
  payload: any;
}
