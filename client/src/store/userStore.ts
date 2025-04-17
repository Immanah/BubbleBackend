import { create } from 'zustand';
import { User } from '@/models/types';

interface UserState {
  user: User | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setIsLoggedIn: (isLoggedIn: boolean) => void;
  setIsLoading: (isLoading: boolean) => void;
  logout: () => void;
}

export const useUserStore = create<UserState>((set) => ({
  user: null,
  isLoggedIn: false,
  isLoading: true,
  setUser: (user) => set({ user, isLoggedIn: !!user }),
  setIsLoggedIn: (isLoggedIn) => set({ isLoggedIn }),
  setIsLoading: (isLoading) => set({ isLoading }),
  logout: () => set({ user: null, isLoggedIn: false }),
}));
