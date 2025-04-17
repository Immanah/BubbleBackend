import { create } from 'zustand';
import { JournalEntry, MoodData } from '@/models/types';
import { getJournalEntries, getMoodData } from '@/lib/journalService';

interface JournalState {
  journalEntries: JournalEntry[];
  moodData: MoodData[];
  isLoading: boolean;
  error: string | null;
  fetchJournalEntries: () => Promise<void>;
  fetchMoodData: () => Promise<void>;
  addJournalEntry: (entry: JournalEntry) => void;
  removeJournalEntry: (entryId: number) => void;
}

export const useJournalStore = create<JournalState>((set, get) => ({
  journalEntries: [],
  moodData: [],
  isLoading: false,
  error: null,
  
  fetchJournalEntries: async () => {
    set({ isLoading: true, error: null });
    try {
      const entries = await getJournalEntries();
      set({ journalEntries: entries, isLoading: false });
    } catch (error) {
      set({ 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch journal entries' 
      });
    }
  },
  
  fetchMoodData: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await getMoodData();
      set({ moodData: data, isLoading: false });
    } catch (error) {
      set({ 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch mood data' 
      });
    }
  },
  
  addJournalEntry: (entry) => {
    set((state) => ({
      journalEntries: [entry, ...state.journalEntries]
    }));
  },
  
  removeJournalEntry: (entryId) => {
    set((state) => ({
      journalEntries: state.journalEntries.filter(entry => entry.id !== entryId)
    }));
  }
}));
