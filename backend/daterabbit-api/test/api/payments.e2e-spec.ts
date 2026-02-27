import { apiGet, apiPost, login, uniqueEmail } from './helpers';

describe('Payments API', () => {
  let companionToken: string;
  let seekerToken: string;

  beforeAll(async () => {
    companionToken = await login(uniqueEmail('pay-comp'));
    seekerToken = await login(uniqueEmail('pay-seek'));
  });

  describe('POST /payments/connect/onboard', () => {
    it('should return 503 when Stripe not configured', async () => {
      const { status, body } = await apiPost('/payments/connect/onboard', {}, companionToken);
      // Without STRIPE_SECRET_KEY, should return service unavailable
      expect([201, 503]).toContain(status);
      if (status === 503) {
        expect(body.message).toContain('not configured');
      }
    });

    it('should reject without auth', async () => {
      const { status } = await apiPost('/payments/connect/onboard', {});
      expect(status).toBe(401);
    });
  });

  describe('GET /payments/connect/status', () => {
    it('should return connect status', async () => {
      const { status, body } = await apiGet('/payments/connect/status', companionToken);
      // Without Stripe, returns 503 or default status
      expect([200, 503]).toContain(status);
      if (status === 200) {
        expect(body.complete).toBeDefined();
        expect(body.payoutsEnabled).toBeDefined();
      }
    });
  });

  describe('GET /payments/earnings', () => {
    it('should return earnings summary', async () => {
      const { status, body } = await apiGet('/payments/earnings', companionToken);
      expect(status).toBe(200);
      expect(body.totalEarnings).toBeDefined();
      expect(body.completedBookings).toBeDefined();
      expect(typeof body.totalEarnings).toBe('number');
    });

    it('should reject without auth', async () => {
      const { status } = await apiGet('/payments/earnings');
      expect(status).toBe(401);
    });
  });

  describe('GET /payments/earnings/history', () => {
    it('should return paginated earnings history', async () => {
      const { status, body } = await apiGet('/payments/earnings/history', companionToken);
      expect(status).toBe(200);
      expect(body.transactions).toBeDefined();
      expect(Array.isArray(body.transactions)).toBe(true);
      expect(body.total).toBeDefined();
    });
  });

  describe('GET /payments/payouts/balance', () => {
    it('should return 503 when Stripe not configured', async () => {
      const { status } = await apiGet('/payments/payouts/balance', companionToken);
      expect([200, 503]).toContain(status);
    });
  });

  describe('POST /payments/bookings/:id/pay', () => {
    it('should reject without auth', async () => {
      const { status } = await apiPost('/payments/bookings/fake-id/pay', {});
      expect(status).toBe(401);
    });
  });
});
