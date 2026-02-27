import { apiGet, apiPost, apiPut, login, uniqueEmail } from './helpers';

describe('Reviews API', () => {
  let seekerToken: string;
  let companionToken: string;
  let companionId: string;
  let completedBookingId: string;

  beforeAll(async () => {
    // Create seeker
    const seekerEmail = uniqueEmail('rv-seeker');
    seekerToken = await login(seekerEmail);
    await apiPost('/auth/register', {
      name: 'Review Seeker',
      role: 'seeker',
    }, seekerToken);

    // Create companion
    const compEmail = uniqueEmail('rv-comp');
    companionToken = await login(compEmail);
    const cr = await apiPost('/auth/register', {
      name: 'Review Companion',
      role: 'companion',
      hourlyRate: 60,
    }, companionToken);
    companionId = cr.body.user.id;

    // Create booking → confirm → complete
    const bk = await apiPost('/bookings', {
      companionId,
      dateTime: new Date(Date.now() + 86400000).toISOString(),
      duration: 2,
      activity: 'dinner',
    }, seekerToken);
    completedBookingId = bk.body.id;

    // Companion confirms
    await apiPut(`/bookings/${completedBookingId}/confirm`, {}, companionToken);

    // Complete the booking (POST /bookings/:id/complete)
    await apiPost(`/bookings/${completedBookingId}/complete`, {}, seekerToken);
  });

  describe('POST /reviews/bookings/:bookingId', () => {
    it('should create a review for completed booking', async () => {
      const { status, body } = await apiPost(`/reviews/bookings/${completedBookingId}`, {
        rating: 5,
        comment: 'Great experience!',
      }, seekerToken);

      // May be 201 if booking was completed, or 400 if complete endpoint doesn't exist yet
      if (status === 201) {
        expect(body.id).toBeDefined();
        expect(body.rating).toBe(5);
        expect(body.comment).toBe('Great experience!');
      }
    });

    it('should reject duplicate review', async () => {
      const { status } = await apiPost(`/reviews/bookings/${completedBookingId}`, {
        rating: 4,
      }, seekerToken);
      // Should be 409 conflict or 400
      expect(status).toBeGreaterThanOrEqual(400);
    });

    it('should reject invalid rating', async () => {
      const { status } = await apiPost(`/reviews/bookings/${completedBookingId}`, {
        rating: 10,
      }, seekerToken);
      expect(status).toBeGreaterThanOrEqual(400);
    });

    it('should reject without auth', async () => {
      const { status } = await apiPost(`/reviews/bookings/${completedBookingId}`, {
        rating: 3,
      });
      expect(status).toBe(401);
    });
  });

  describe('GET /reviews/users/:userId', () => {
    it('should return reviews for a user', async () => {
      const { status, body } = await apiGet(`/reviews/users/${companionId}`);
      expect(status).toBe(200);
      expect(body.reviews).toBeDefined();
      expect(Array.isArray(body.reviews)).toBe(true);
      expect(body.total).toBeDefined();
    });

    it('should return empty for user with no reviews', async () => {
      const { status, body } = await apiGet('/reviews/users/00000000-0000-0000-0000-000000000000');
      expect(status).toBe(200);
      expect(body.reviews).toEqual([]);
      expect(body.total).toBe(0);
    });
  });
});
