import { apiGet, apiPost, login, uniqueEmail } from './helpers';

describe('Messages API', () => {
  let token: string;

  beforeAll(async () => {
    token = await login(uniqueEmail('msg'));
  });

  describe('GET /messages/conversations', () => {
    it('should return conversations list', async () => {
      const { status, body } = await apiGet('/messages/conversations', token);
      expect(status).toBe(200);
      expect(Array.isArray(body)).toBe(true);
    });

    it('should reject without auth', async () => {
      const { status } = await apiGet('/messages/conversations');
      expect(status).toBe(401);
    });
  });

  describe('GET /messages/unread-count', () => {
    it('should return unread count', async () => {
      const { status, body } = await apiGet('/messages/unread-count', token);
      expect(status).toBe(200);
      expect(body.count).toBeDefined();
      expect(typeof body.count).toBe('number');
    });
  });

  describe('POST /messages/:userId', () => {
    it('should reject without auth', async () => {
      const { status } = await apiPost('/messages/some-user-id', { content: 'Hi' });
      expect(status).toBe(401);
    });
  });
});
