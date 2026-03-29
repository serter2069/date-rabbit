import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { usersApi } from '../services/api';

interface WatchOnlineState {
  watchedIds: string[];
  toggleWatch: (companionId: string) => Promise<void>;
  syncFromServer: () => Promise<void>;
  isWatching: (companionId: string) => boolean;
}

export const useWatchOnlineStore = create<WatchOnlineState>()(
  persist(
    (set, get) => ({
      watchedIds: [],

      isWatching: (companionId: string) => {
        return get().watchedIds.includes(companionId);
      },

      toggleWatch: async (companionId: string) => {
        const { watchedIds } = get();
        const watching = watchedIds.includes(companionId);

        if (watching) {
          // Optimistic remove
          set({ watchedIds: watchedIds.filter((id) => id !== companionId) });
          usersApi.unwatchOnline(companionId).catch(() => {
            // Revert on failure
            set((s) => ({ watchedIds: [...s.watchedIds, companionId] }));
          });
        } else {
          // Optimistic add
          set({ watchedIds: [...watchedIds, companionId] });
          usersApi.watchOnline(companionId).catch(() => {
            // Revert on failure
            set((s) => ({ watchedIds: s.watchedIds.filter((id) => id !== companionId) }));
          });
        }
      },

      syncFromServer: async () => {
        try {
          const { watchedIds: serverIds } = await usersApi.getWatchedOnline();
          set({ watchedIds: serverIds });
        } catch {
          // Keep local state if server is unreachable
        }
      },
    }),
    {
      name: 'watch-online-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        watchedIds: state.watchedIds,
      }),
    }
  )
);
