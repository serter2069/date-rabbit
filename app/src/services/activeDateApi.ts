import { apiRequest, getToken } from './api';

const API_BASE = 'https://daterabbit-api.smartlaunchhub.com/api';

export interface ActiveBooking {
  id: string;
  status: string;
  dateTime: string;
  duration: number;
  activity: string;
  location?: string;
  totalPrice: number;
  seekerCheckinAt?: string;
  companionCheckinAt?: string;
  activeDateStartedAt?: string;
  activeDateEndedAt?: string;
  actualDurationHours?: number;
  sosTriggeredAt?: string;
  noShowReason?: string;
  seeker: { id: string; name: string; photos?: { url: string }[] };
  companion: { id: string; name: string; photos?: { url: string }[]; hourlyRate: number };
}

export const activeDateApi = {
  getActive: () =>
    apiRequest<ActiveBooking | null>('/bookings/active'),

  getBookingById: (id: string) =>
    apiRequest<ActiveBooking>(`/bookings/${id}`),

  startDate: (bookingId: string) =>
    apiRequest<ActiveBooking>(`/bookings/${bookingId}/start-date`, {
      method: 'POST',
    }),

  extendDate: (bookingId: string, additionalHours: number) =>
    apiRequest<ActiveBooking>(`/bookings/${bookingId}/extend`, {
      method: 'POST',
      body: { additionalHours },
    }),

  seekerCheckin: (bookingId: string, coords?: { lat: number; lon: number }) =>
    apiRequest<ActiveBooking>(`/bookings/${bookingId}/checkin`, {
      method: 'POST',
      body: coords || {},
    }),

  companionCheckin: (bookingId: string, coords?: { lat: number; lon: number }) =>
    apiRequest<ActiveBooking>(`/bookings/${bookingId}/companion-checkin`, {
      method: 'POST',
      body: coords || {},
    }),

  triggerSOS: (bookingId: string, coords?: { lat: number; lon: number }) =>
    apiRequest<ActiveBooking>(`/bookings/${bookingId}/sos`, {
      method: 'POST',
      body: coords || {},
    }),

  endEarly: (bookingId: string) =>
    apiRequest<ActiveBooking>(`/bookings/${bookingId}/end-early`, {
      method: 'POST',
    }),

  safetyCheckin: (bookingId: string) =>
    apiRequest<{ ok: boolean }>(`/bookings/${bookingId}/safety-checkin`, {
      method: 'POST',
      body: { status: 'ok' },
    }),

  uploadPhoto: async (bookingId: string, uri: string): Promise<{ url: string; id: string }> => {
    const token = await getToken();
    const formData = new FormData();
    const ext = uri.split('.').pop() || 'jpg';
    formData.append('file', { uri, type: `image/${ext === 'jpg' ? 'jpeg' : ext}`, name: `date-photo.${ext}` } as any);
    const resp = await fetch(`${API_BASE}/bookings/${bookingId}/photos`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' },
      body: formData,
    });
    const data = await resp.json();
    if (!resp.ok) throw new Error(data.message || 'Upload failed');
    return data;
  },

  getPhotos: (bookingId: string) =>
    apiRequest<{ photos: { id: string; url: string; uploadedBy: string; createdAt: string }[] }>(`/bookings/${bookingId}/photos`),

  getPlan: (bookingId: string) =>
    apiRequest<{ places: { name: string; address: string; time?: string }[] }>(`/bookings/${bookingId}/plan`),

  savePlan: (bookingId: string, places: { name: string; address: string; time?: string }[]) =>
    apiRequest<{ ok: boolean }>(`/bookings/${bookingId}/plan`, {
      method: 'POST',
      body: { places },
    }),

  reportIssue: (bookingId: string, type: string, description: string) =>
    apiRequest<{ ok: boolean }>(`/bookings/${bookingId}/report`, {
      method: 'POST',
      body: { type, description },
    }),
};
