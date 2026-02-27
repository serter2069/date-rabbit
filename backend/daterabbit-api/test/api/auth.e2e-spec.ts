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
      await apiPost('/auth/start', { email });
      const { status, body } = await apiPost('/auth/start', { email });
      expect(status).toBe(201);
      expect(body.success).toBe(true);
      expect(body.isNewUser).toBe(false);
    });

    it('should reject empty email', async () => {
      const { status } = await apiPost('/auth/start', {});
      expect(status).toBeGreaterThanOrEqual(400);
    });

    it('should reject invalid email format', async () => {
      const { status } = await apiPost('/auth/start', { email: 'not-an-email' });
      expect(status).toBe(400);
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
      const { status } = await apiPost('/auth/verify', { email, code: '999999' });
      expect(status).toBe(401);
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
    it('should register with JWT token (preferred)', async () => {
      const email = uniqueEmail('auth-reg');
      const token = await login(email);
      const { status, body } = await apiPost('/auth/register', {
        name: 'Test User',
        role: 'seeker',
        age: 25,
        location: 'New York',
      }, token);
      expect(status).toBe(201);
      expect(body.success).toBe(true);
      expect(body.token).toBeDefined();
      expect(body.user.name).toBe('Test User');
      expect(body.user.role).toBe('seeker');
    });

    it('should register with email in body (frontend compat)', async () => {
      const email = uniqueEmail('auth-reg2');
      await apiPost('/auth/start', { email });
      const { status, body } = await apiPost('/auth/register', {
        email,
        name: 'Test User 2',
        role: 'seeker',
      });
      expect(status).toBe(201);
      expect(body.success).toBe(true);
    });

    it('should register as companion with hourly rate', async () => {
      const email = uniqueEmail('auth-comp');
      const token = await login(email);
      const { status, body } = await apiPost('/auth/register', {
        name: 'Test Companion',
        role: 'companion',
        hourlyRate: 75,
        bio: 'Test bio',
      }, token);
      expect(status).toBe(201);
      expect(body.user.role).toBe('companion');
    });

    it('should reject missing name and email', async () => {
      const { status } = await apiPost('/auth/register', { role: 'seeker' });
      expect(status).toBeGreaterThanOrEqual(400);
    });
  });
});
