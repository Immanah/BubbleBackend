import { create } from 'zustand';

type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

interface BubbleState {
  connectionStatus: ConnectionStatus;
  isThinking: boolean;
  setConnectionStatus: (status: ConnectionStatus) => void;
  setIsThinking: (isThinking: boolean) => void;
}

export const useBubbleStore = create<BubbleState>((set) => ({
  connectionStatus: 'disconnected',
  isThinking: false,
  setConnectionStatus: (status) => set({ connectionStatus: status }),
  setIsThinking: (isThinking) => set({ isThinking }),
}));
