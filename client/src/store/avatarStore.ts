import { create } from 'zustand';
import { AvatarCustomization } from '@/models/types';

const defaultCustomization: AvatarCustomization = {
  faceShape: 'round',
  eyeStyle: 'default',
  color: '#4FACFE',
  accessories: []
};

interface AvatarState {
  avatarCustomization: AvatarCustomization;
  updateAvatarCustomization: (customization: Partial<AvatarCustomization>) => void;
}

export const useAvatarStore = create<AvatarState>((set) => ({
  avatarCustomization: defaultCustomization,
  updateAvatarCustomization: (customization) => set((state) => ({
    avatarCustomization: { ...state.avatarCustomization, ...customization }
  })),
}));
