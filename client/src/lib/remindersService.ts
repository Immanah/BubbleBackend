import { apiRequest } from './queryClient';
import { Reminder } from '@/models/types';

interface CreateReminderParams {
  title: string;
  description?: string;
  time: Date;
}

export async function createReminder(params: CreateReminderParams): Promise<Reminder> {
  try {
    const response = await apiRequest('POST', '/api/reminders/add', params);
    return await response.json();
  } catch (error) {
    console.error('Error creating reminder:', error);
    throw error;
  }
}

export async function getReminders(): Promise<Reminder[]> {
  try {
    const response = await apiRequest('GET', '/api/reminders/list', undefined);
    return await response.json();
  } catch (error) {
    console.error('Error fetching reminders:', error);
    throw error;
  }
}

export async function deleteReminder(reminderId: number): Promise<void> {
  try {
    await apiRequest('DELETE', `/api/reminders/delete/${reminderId}`, undefined);
  } catch (error) {
    console.error('Error deleting reminder:', error);
    throw error;
  }
}
