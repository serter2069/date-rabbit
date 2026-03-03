import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface FavoritesState {
  favorites: string[];
  toggleFavorite: (profileId: string) => void;
  isFavorite: (profileId: string) => boolean;
  clearFavorites: () => void;
}

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      favorites: [],

      toggleFavorite: (profileId: string) => {
        const { favorites } = get();
        if (favorites.includes(profileId)) {
          set({ favorites: favorites.filter((id) => id !== profileId) });
        } else {
          set({ favorites: [...favorites, profileId] });
        }
      },

      isFavorite: (profileId: string) => {
        return get().favorites.includes(profileId);
      },

      clearFavorites: () => {
        set({ favorites: [] });
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
