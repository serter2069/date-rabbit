import { create } from 'zustand';

interface Availability {
  dayOfWeek: number; // 0 = Sunday, 6 = Saturday
  startTime: string; // "18:00"
  endTime: string; // "23:00"
  isAvailable: boolean;
}

interface ProfileState {
  // Female profile settings
  hourlyRate: number;
  bio: string;
  photos: string[];
  availability: Availability[];

  // Actions
  setHourlyRate: (rate: number) => void;
  setBio: (bio: string) => void;
  addPhoto: (photoUri: string) => void;
  removePhoto: (index: number) => void;
  setAvailability: (availability: Availability[]) => void;
  updateDayAvailability: (dayOfWeek: number, startTime: string, endTime: string, isAvailable: boolean) => void;

  // Getters
  isAvailableOn: (date: Date) => boolean;
  getAvailabilityForDay: (dayOfWeek: number) => Availability | undefined;

  // Initialize
  initializeMockData: () => void;
}

export const useProfileStore = create<ProfileState>((set, get) => ({
  hourlyRate: 100,
  bio: '',
  photos: [],
  availability: [],

  setHourlyRate: (rate) => {
    if (rate < 0) return;
    set({ hourlyRate: rate });
  },

  setBio: (bio) => {
    set({ bio: bio.slice(0, 500) }); // Max 500 chars
  },

  addPhoto: (photoUri) => {
    set((state) => {
      if (state.photos.length >= 6) return state; // Max 6 photos
      return { photos: [...state.photos, photoUri] };
    });
  },

  removePhoto: (index) => {
    set((state) => ({
      photos: state.photos.filter((_, i) => i !== index),
    }));
  },

  setAvailability: (availability) => {
    set({ availability });
  },

  updateDayAvailability: (dayOfWeek, startTime, endTime, isAvailable) => {
    set((state) => {
      const existing = state.availability.find((a) => a.dayOfWeek === dayOfWeek);
      if (existing) {
        return {
          availability: state.availability.map((a) =>
            a.dayOfWeek === dayOfWeek
              ? { ...a, startTime, endTime, isAvailable }
              : a
          ),
        };
      } else {
        return {
          availability: [
            ...state.availability,
            { dayOfWeek, startTime, endTime, isAvailable },
          ],
        };
      }
    });
  },

  isAvailableOn: (date) => {
    const dayOfWeek = date.getDay();
    const availability = get().availability.find((a) => a.dayOfWeek === dayOfWeek);
    return availability?.isAvailable ?? false;
  },

  getAvailabilityForDay: (dayOfWeek) => {
    return get().availability.find((a) => a.dayOfWeek === dayOfWeek);
  },

  initializeMockData: () => {
    set({
      hourlyRate: 100,
      bio: 'Marketing professional who loves trying new restaurants and art galleries.',
      photos: ['photo1.jpg', 'photo2.jpg'],
      availability: [
        { dayOfWeek: 1, startTime: '18:00', endTime: '23:00', isAvailable: true }, // Monday
        { dayOfWeek: 2, startTime: '18:00', endTime: '23:00', isAvailable: true }, // Tuesday
        { dayOfWeek: 3, startTime: '18:00', endTime: '23:00', isAvailable: true }, // Wednesday
        { dayOfWeek: 4, startTime: '18:00', endTime: '23:00', isAvailable: true }, // Thursday
        { dayOfWeek: 5, startTime: '18:00', endTime: '23:00', isAvailable: true }, // Friday
        { dayOfWeek: 6, startTime: '12:00', endTime: '23:00', isAvailable: true }, // Saturday
        { dayOfWeek: 0, startTime: '12:00', endTime: '23:00', isAvailable: true }, // Sunday
      ],
    });
  },
}));
