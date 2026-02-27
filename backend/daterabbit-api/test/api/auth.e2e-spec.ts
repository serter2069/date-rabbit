import { apiPost, login, uniqueEmail } from './helpers';

describe('Auth API', () => {
  describe('POST /auth/start', () => {
    it('should send OTP for new email', async () => {
      const email = uniqueEmail('auth-new');
      const { status, body } = await apiPost('/auth/start', { email });
      expect(status).toBe(201);
      expect(body.success).toBe(true);
      expect(body.isNewUser).toBe(true);
    });

    it('should send OTP for existing email', async () => {
      const email = uniqueEmail('auth-existing');
      // First call creates user
      await apiPost('/auth/start', { email });
      // Second call — user exists
      const { status, body } = await apiPost('/auth/start', { email });
      expect(status).toBe(201);
      expect(body.success).toBe(true);
      expect(body.isNewUser).toBe(false);
    });

    it('should reject empty email', async () => {
      const { status } = await apiPost('/auth/start', {});
      expect(status).toBeGreaterThanOrEqual(400);
    });
  });

  describe('POST /auth/verify', () => {
    it('should verify correct OTP and return token', async () => {
      const email = uniqueEmail('auth-verify');
      await apiPost('/auth/start', { email });
      const { status, body } = await apiPost('/auth/verify', { email, code: '000000' });
      expect(status).toBe(201);
      expect(body.success).toBe(true);
      expect(body.token).toBeDefined();
      expect(typeof body.token).toBe('string');
      expect(body.user).toBeDefined();
      expect(body.user.email).toBe(email);
    });

    it('should reject wrong OTP', async () => {
      const email = uniqueEmail('auth-wrong');
      await apiPost('/auth/start', { email });
      const { status, body } = await apiPost('/auth/verify', { email, code: '999999' });
      expect(status).toBe(401);
      expect(body.success).toBeUndefined();
    });

    it('should reject missing fields', async () => {
      const { status } = await apiPost('/auth/verify', { email: 'test@test.com' });
      expect(status).toBeGreaterThanOrEqual(400);
    });

    it('should not return OTP fields in user response', async () => {
      const email = uniqueEmail('auth-safe');
      await apiPost('/auth/start', { email });
      const { body } = await apiPost('/auth/verify', { email, code: '000000' });
      expect(body.user.otpCode).toBeUndefined();
      expect(body.user.otpExpiresAt).toBeUndefined();
    });
  });

  describe('POST /auth/register', () => {
    it('should register with role and profile data', async () => {
      const email = uniqueEmail('auth-reg');
      // Need to start auth first to create user
      await apiPost('/auth/start', { email });
      const { status, body } = await apiPost('/auth/register', {
        email,
        name: 'Test User',
        role: 'seeker',
        age: 25,
        location: 'New York',
      });
      expect(status).toBe(201);
      expect(body.success).toBe(true);
      expect(body.token).toBeDefined();
      expect(body.user.name).toBe('Test User');
      expect(body.user.role).toBe('seeker');
    });

    it('should register as companion with hourly rate', async () => {
      const email = uniqueEmail('auth-comp');
      await apiPost('/auth/start', { email });
      const { status, body } = await apiPost('/auth/register', {
        email,
        name: 'Test Companion',
        role: 'companion',
        hourlyRate: 75,
        bio: 'Test bio',
      });
      expect(status).toBe(201);
      expect(body.user.role).toBe('companion');
    });

    it('should reject missing name', async () => {
      const { status } = await apiPost('/auth/register', { email: 'x@x.com' });
      expect(status).toBeGreaterThanOrEqual(400);
    });
  });
});
