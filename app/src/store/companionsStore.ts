import { create } from 'zustand';
import { companionsApi, CompanionListItem, CompanionDetail, SearchCompanionsParams, ApiError } from '../services/api';

interface CompanionsState {
  companions: CompanionListItem[];
  selectedCompanion: CompanionDetail | null;
  total: number;
  page: number;
  totalPages: number;
  isLoading: boolean;
  isLoadingDetail: boolean;
  error: string | null;
  filters: SearchCompanionsParams;

  // Actions
  search: (params?: SearchCompanionsParams, reset?: boolean) => Promise<void>;
  loadMore: () => Promise<void>;
  getCompanionDetail: (id: string, latitude?: number, longitude?: number) => Promise<void>;
  setFilters: (filters: Partial<SearchCompanionsParams>) => void;
  resetFilters: () => void;
  clearError: () => void;
  clearSelectedCompanion: () => void;
}

const defaultFilters: SearchCompanionsParams = {
  sortBy: 'recommended',
  page: 1,
  limit: 20,
};

export const useCompanionsStore = create<CompanionsState>((set, get) => ({
  companions: [],
  selectedCompanion: null,
  total: 0,
  page: 1,
  totalPages: 0,
  isLoading: false,
  isLoadingDetail: false,
  error: null,
  filters: defaultFilters,

  search: async (params = {}, reset = true) => {
    const { filters } = get();
    const mergedParams = { ...filters, ...params, page: reset ? 1 : params.page || filters.page };

    set({ isLoading: true, error: null });

    try {
      const response = await companionsApi.search(mergedParams);
      set({
        companions: reset ? response.companions : [...get().companions, ...response.companions],
        total: response.total,
        page: response.page,
        totalPages: response.totalPages,
        isLoading: false,
        filters: mergedParams,
      });
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Failed to load companions';
      set({ error: message, isLoading: false });
    }
  },

  loadMore: async () => {
    const { page, totalPages, isLoading, filters } = get();
    if (isLoading || page >= totalPages) return;

    const nextPage = page + 1;
    await get().search({ ...filters, page: nextPage }, false);
  },

  getCompanionDetail: async (id, latitude, longitude) => {
    set({ isLoadingDetail: true, error: null });

    try {
      const companion = await companionsApi.getById(id, latitude, longitude);
      set({ selectedCompanion: companion, isLoadingDetail: false });
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Companion not found';
      set({ error: message, isLoadingDetail: false });
    }
  },

  setFilters: (newFilters) => {
    set((state) => ({
      filters: { ...state.filters, ...newFilters },
    }));
  },

  resetFilters: () => {
    set({ filters: defaultFilters });
  },

  clearError: () => set({ error: null }),

  clearSelectedCompanion: () => set({ selectedCompanion: null }),
}));
