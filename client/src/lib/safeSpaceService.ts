import { apiRequest } from './queryClient';

export async function getAffirmation(): Promise<string> {
  try {
    const response = await apiRequest('GET', '/api/safe-space/affirmation', undefined);
    const data = await response.json();
    return data.affirmation;
  } catch (error) {
    console.error('Error getting affirmation:', error);
    throw error;
  }
}

// Additional safe space features would be implemented here
