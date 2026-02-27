import { apiGet, apiPost, apiPut, login, uniqueEmail } from './helpers';

describe('Bookings API', () => {
  let seekerToken: string;
  let companionToken: string;
  let companionId: string;

  beforeAll(async () => {
    // Create seeker (login gives JWT via start+verify)
    const seekerEmail = uniqueEmail('bk-seeker');
    seekerToken = await login(seekerEmail);
    await apiPost('/auth/register', {
      name: 'Booking Seeker',
      role: 'seeker',
    }, seekerToken);

    // Create companion
    const compEmail = uniqueEmail('bk-comp');
    companionToken = await login(compEmail);
    const regResult = await apiPost('/auth/register', {
      name: 'Booking Companion',
      role: 'companion',
      hourlyRate: 80,
    }, companionToken);
    companionId = regResult.body.user.id;
  });

  describe('POST /bookings', () => {
    it('should create a booking', async () => {
      const { status, body } = await apiPost('/bookings', {
        companionId,
        dateTime: new Date(Date.now() + 86400000).toISOString(), // tomorrow
        duration: 2,
        activity: 'dinner',
        location: 'Test Restaurant',
      }, seekerToken);
      expect(status).toBe(201);
      expect(body.id).toBeDefined();
      expect(body.status).toBe('pending');
      expect(body.activity).toBe('dinner');
    });

    it('should reject without auth', async () => {
      const { status } = await apiPost('/bookings', {
        companionId,
        dateTime: new Date().toISOString(),
        duration: 1,
        activity: 'coffee',
      });
      expect(status).toBe(401);
    });

    it('should reject missing required fields', async () => {
      const { status } = await apiPost('/bookings', {
        companionId,
      }, seekerToken);
      expect(status).toBeGreaterThanOrEqual(400);
    });
  });

  describe('GET /bookings', () => {
    it('should return user bookings', async () => {
      const { status, body } = await apiGet('/bookings', seekerToken);
      expect(status).toBe(200);
      expect(body.asSeeker).toBeDefined();
      expect(Array.isArray(body.asSeeker)).toBe(true);
    });

    it('should reject without auth', async () => {
      const { status } = await apiGet('/bookings');
      expect(status).toBe(401);
    });
  });

  describe('PUT /bookings/:id/confirm', () => {
    it('should allow companion to confirm booking', async () => {
      // Create booking first
      const createRes = await apiPost('/bookings', {
        companionId,
        dateTime: new Date(Date.now() + 86400000).toISOString(),
        duration: 1,
        activity: 'coffee',
      }, seekerToken);
      const bookingId = createRes.body.id;

      // Companion confirms
      const { status, body } = await apiPut(`/bookings/${bookingId}/confirm`, {}, companionToken);
      expect(status).toBe(200);
      expect(body.status).toBe('confirmed');
    });

    it('should reject seeker trying to confirm', async () => {
      const createRes = await apiPost('/bookings', {
        companionId,
        dateTime: new Date(Date.now() + 86400000).toISOString(),
        duration: 1,
        activity: 'walk',
      }, seekerToken);
      const bookingId = createRes.body.id;

      const { status } = await apiPut(`/bookings/${bookingId}/confirm`, {}, seekerToken);
      expect(status).toBe(403);
    });
  });

  describe('PUT /bookings/:id/cancel', () => {
    it('should allow seeker to cancel', async () => {
      const createRes = await apiPost('/bookings', {
        companionId,
        dateTime: new Date(Date.now() + 86400000).toISOString(),
        duration: 1,
        activity: 'drinks',
      }, seekerToken);
      const bookingId = createRes.body.id;

      const { status, body } = await apiPut(`/bookings/${bookingId}/cancel`, {
        reason: 'Plans changed',
      }, seekerToken);
      expect(status).toBe(200);
      expect(body.status).toBe('cancelled');
    });
  });

  describe('GET /bookings/requests', () => {
    it('should return pending requests for companion', async () => {
      const { status, body } = await apiGet('/bookings/requests', companionToken);
      expect(status).toBe(200);
      expect(Array.isArray(body)).toBe(true);
    });
  });
});
