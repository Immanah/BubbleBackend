import { create } from 'zustand';
import { Environment } from '@/models/types';
import { environmentImages, environmentDescriptions } from '@/components/assets';

// Define environments based on the provided assets
const defaultEnvironments: Environment[] = [
  {
    id: 'forest',
    name: 'Campfire',
    imageUrl: 'https://placekitten.com/801/600',
    description: environmentDescriptions.forest
  },
  {
    id: 'ocean',
    name: 'Rain',
    imageUrl: 'https://placekitten.com/800/600',
    description: environmentDescriptions.ocean
  },
  {
    id: 'cafe',
    name: 'Café',
    imageUrl: 'https://placekitten.com/802/600',
    description: environmentDescriptions.cafe
  },
  {
    id: 'bedroom',
    name: 'Cozy Room',
    imageUrl: 'https://placekitten.com/803/600',
    description: environmentDescriptions.bedroom
  }
];

interface EnvironmentState {
  environments: Environment[];
  currentEnvironment: Environment | null;
  setCurrentEnvironment: (environment: Environment) => void;
  addEnvironment: (environment: Environment) => void;
}

export const useEnvironmentStore = create<EnvironmentState>((set) => ({
  environments: defaultEnvironments,
  currentEnvironment: defaultEnvironments[0],
  setCurrentEnvironment: (environment) => set({ currentEnvironment: environment }),
  addEnvironment: (environment) => set((state) => ({
    environments: [...state.environments, environment]
  })),
}));
