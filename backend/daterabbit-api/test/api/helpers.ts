// Test helpers for API e2e tests
// Tests run against the staging API (DEV_AUTH=true, OTP=000000)

const API_BASE = process.env.TEST_API_URL || 'https://daterabbit-api.smartlaunchhub.com/api';

export { API_BASE };

export async function apiGet(endpoint: string, token?: string) {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${endpoint}`, { headers });
  const body = await res.json().catch(() => ({}));
  return { status: res.status, body };
}

export async function apiPost(endpoint: string, data?: unknown, token?: string) {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${endpoint}`, {
    method: 'POST',
    headers,
    body: data ? JSON.stringify(data) : undefined,
  });
  const body = await res.json().catch(() => ({}));
  return { status: res.status, body };
}

export async function apiPut(endpoint: string, data?: unknown, token?: string) {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${endpoint}`, {
    method: 'PUT',
    headers,
    body: data ? JSON.stringify(data) : undefined,
  });
  const body = await res.json().catch(() => ({}));
  return { status: res.status, body };
}

export async function apiDelete(endpoint: string, token?: string) {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${endpoint}`, { method: 'DELETE', headers });
  const body = await res.json().catch(() => ({}));
  return { status: res.status, body };
}

// Login helper: start auth + verify OTP, returns JWT token
export async function login(email = 'test-api@daterabbit.com'): Promise<string> {
  await apiPost('/auth/start', { email });
  const { body } = await apiPost('/auth/verify', { email, code: '000000' });
  if (!body.token) throw new Error(`Login failed for ${email}: ${JSON.stringify(body)}`);
  return body.token;
}

// Create a unique test email to avoid collisions
let testCounter = 0;
export function uniqueEmail(prefix = 'test'): string {
  testCounter++;
  return `${prefix}-${Date.now()}-${testCounter}@test.daterabbit.com`;
}
