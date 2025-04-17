import { apiRequest } from './queryClient';
import { JournalEntry, Mood, MoodData } from '@/models/types';

interface CreateJournalEntryParams {
  title: string;
  content: string;
  mood: Mood;
}

export async function createJournalEntry(params: CreateJournalEntryParams): Promise<JournalEntry> {
  try {
    const response = await apiRequest('POST', '/api/journal/add', params);
    return await response.json();
  } catch (error) {
    console.error('Error creating journal entry:', error);
    throw error;
  }
}

export async function getJournalEntries(): Promise<JournalEntry[]> {
  try {
    const response = await apiRequest('GET', '/api/journal/list', undefined);
    return await response.json();
  } catch (error) {
    console.error('Error fetching journal entries:', error);
    throw error;
  }
}

export async function deleteJournalEntry(entryId: number): Promise<void> {
  try {
    await apiRequest('DELETE', `/api/journal/delete/${entryId}`, undefined);
  } catch (error) {
    console.error('Error deleting journal entry:', error);
    throw error;
  }
}

export async function getMoodData(): Promise<MoodData[]> {
  try {
    const response = await apiRequest('GET', '/api/journal/mood-data', undefined);
    return await response.json();
  } catch (error) {
    console.error('Error fetching mood data:', error);
    throw error;
  }
}
