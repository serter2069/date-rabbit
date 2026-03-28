import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { usersApi } from '../services/api';

interface FavoritesState {
  favorites: string[];
  synced: boolean;
  toggleFavorite: (profileId: string) => void;
  isFavorite: (profileId: string) => boolean;
  clearFavorites: () => void;
  syncFromServer: () => Promise<void>;
}

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      favorites: [],
      synced: false,

      toggleFavorite: (profileId: string) => {
        const { favorites } = get();
        if (favorites.includes(profileId)) {
          set({ favorites: favorites.filter((id) => id !== profileId) });
          // Sync removal to server (fire-and-forget)
          usersApi.removeFavorite(profileId).catch(() => {});
        } else {
          set({ favorites: [...favorites, profileId] });
          // Sync addition to server (fire-and-forget)
          usersApi.addFavorite(profileId).catch(() => {});
        }
      },

      isFavorite: (profileId: string) => {
        return get().favorites.includes(profileId);
      },

      clearFavorites: () => {
        set({ favorites: [], synced: false });
      },

      syncFromServer: async () => {
        try {
          const { favorites: serverFavorites } = await usersApi.getFavorites();
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
