import { create } from 'zustand';

interface FavoritesState {
  favorites: string[];
  toggleFavorite: (profileId: string) => void;
  isFavorite: (profileId: string) => boolean;
  clearFavorites: () => void;
}

export const useFavoritesStore = create<FavoritesState>((set, get) => ({
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
}));
