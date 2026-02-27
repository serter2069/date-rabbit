import { apiGet, apiPut, apiPost, login, uniqueEmail } from './helpers';

describe('Users API', () => {
  let token: string;

  beforeAll(async () => {
    const email = uniqueEmail('user');
    token = await login(email);
  });

  describe('GET /users/me', () => {
    it('should return current user profile', async () => {
      const { status, body } = await apiGet('/users/me', token);
      expect(status).toBe(200);
      expect(body.id).toBeDefined();
      expect(body.email).toBeDefined();
      expect(body.otpCode).toBeUndefined();
    });

    it('should reject without auth token', async () => {
      const { status } = await apiGet('/users/me');
      expect(status).toBe(401);
    });

    it('should reject invalid token', async () => {
      const { status } = await apiGet('/users/me', 'invalid-token-xyz');
      expect(status).toBe(401);
    });
  });

  describe('PUT /users/me', () => {
    it('should update profile name', async () => {
      const { status, body } = await apiPut('/users/me', { name: 'Updated Name' }, token);
      expect(status).toBe(200);
      expect(body.name).toBe('Updated Name');
    });

    it('should update bio', async () => {
      const { status, body } = await apiPut('/users/me', { bio: 'New bio text' }, token);
      expect(status).toBe(200);
      expect(body.bio).toBe('New bio text');
    });
  });
});

describe('Companions API', () => {
  describe('GET /companions', () => {
    it('should return paginated companion list', async () => {
      const { status, body } = await apiGet('/companions');
      expect(status).toBe(200);
      expect(body.companions).toBeDefined();
      expect(Array.isArray(body.companions)).toBe(true);
      expect(body.total).toBeDefined();
    });

    it('should support price filter', async () => {
      const { status, body } = await apiGet('/companions?priceMin=50&priceMax=100');
      expect(status).toBe(200);
      expect(Array.isArray(body.companions)).toBe(true);
      // All returned companions should be within range
      for (const c of body.companions) {
        expect(c.hourlyRate).toBeGreaterThanOrEqual(50);
        expect(c.hourlyRate).toBeLessThanOrEqual(100);
      }
    });

    it('should support sorting', async () => {
      const { status, body } = await apiGet('/companions?sortBy=price_low');
      expect(status).toBe(200);
      expect(Array.isArray(body.companions)).toBe(true);
    });
  });

  describe('GET /companions/:id', () => {
    it('should return companion detail', async () => {
      // First get a companion from the list
      const { body: listBody } = await apiGet('/companions');
      if (listBody.companions?.length > 0) {
        const companionId = listBody.companions[0].id;
        const { status, body } = await apiGet(`/companions/${companionId}`);
        expect(status).toBe(200);
        expect(body.id).toBe(companionId);
        expect(body.name).toBeDefined();
        expect(body.hourlyRate).toBeDefined();
      }
    });

    it('should return 404 for non-existent companion', async () => {
      const { status } = await apiGet('/companions/00000000-0000-0000-0000-000000000000');
      expect(status).toBe(404);
    });
  });
});
