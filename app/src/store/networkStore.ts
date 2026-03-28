import { create } from 'zustand';

interface NetworkState {
  isOffline: boolean;
  setOffline: () => void;
  setOnline: () => void;
}

export const useNetworkStore = create<NetworkState>((set) => ({
  isOffline: false,
  setOffline: () => set({ isOffline: true }),
  setOnline: () => set({ isOffline: false }),
}));
