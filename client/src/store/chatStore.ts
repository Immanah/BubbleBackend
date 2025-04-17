import { create } from 'zustand';
import { Message, Mood } from '@/models/types';

interface ChatState {
  messages: Message[];
  currentMood: Mood;
  addMessage: (message: Message) => void;
  clearMessages: () => void;
  setCurrentMood: (mood: Mood) => void;
}

export const useChatStore = create<ChatState>((set) => ({
  messages: [],
  currentMood: 'neutral',
  addMessage: (message) => set((state) => ({ 
    messages: [...state.messages, message],
    // If the message is from Bubble and has a mood, update the current mood
    currentMood: message.sender === 'bubble' && message.mood 
      ? message.mood 
      : state.currentMood
  })),
  clearMessages: () => set({ messages: [] }),
  setCurrentMood: (mood) => set({ currentMood: mood }),
}));
