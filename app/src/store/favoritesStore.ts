import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { usersApi } from '../services/api';

interface FavoritesState {
  favorites: string[];
  synced: boolean;
  isToggling: boolean;
  toggleFavorite: (profileId: string) => Promise<void>;
  isFavorite: (profileId: string) => boolean;
  clearFavorites: () => void;
  syncFromServer: () => Promise<void>;
}

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      favorites: [],
      synced: false,
      isToggling: false,

      toggleFavorite: async (profileId: string) => {
        const { favorites } = get();
        const wasIncluded = favorites.includes(profileId);

        // Optimistic update
        set({
          favorites: wasIncluded
            ? favorites.filter((id) => id !== profileId)
            : [...favorites, profileId],
          isToggling: true,
        });

        try {
          if (wasIncluded) {
            await usersApi.removeFavorite(profileId);
          } else {
            await usersApi.addFavorite(profileId);
          }
        } catch {
          // Rollback on failure
          set({ favorites, isToggling: false });
          return;
        }

        set({ isToggling: false });
      },

      isFavorite: (profileId: string) => {
        return get().favorites.includes(profileId);
      },

      clearFavorites: () => {
        set({ favorites: [], synced: false });
      },

      syncFromServer: async () => {
        // Skip sync while a toggle is in flight to avoid overwriting optimistic state
        if (get().isToggling) return;

        try {
          const { favorites: serverFavorites } = await usersApi.getFavorites();

          // Re-check after await — toggle may have started
          if (get().isToggling) return;

          const { favorites: localFavorites } = get();

          // Merge: server is source of truth, but add any local-only items
          const serverSet = new Set(serverFavorites);
          const localOnly = localFavorites.filter((id) => !serverSet.has(id));

          // Push local-only favorites to server
          for (const id of localOnly) {
            usersApi.addFavorite(id).catch(() => {});
          }

          // Merged list: server + local-only
          const merged = [...serverFavorites, ...localOnly];
          set({ favorites: merged, synced: true });
        } catch {
          // If server is unreachable, keep local data
        }
      },
    }),
    {
      name: 'favorites-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        favorites: state.favorites,
      }),
    }
  )
);
