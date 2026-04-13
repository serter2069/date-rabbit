/**
 * Tests that proto pages for date-rabbit are pushed to Hub DB
 * and render correctly with proper states.
 */

const https = require('https');

function fetchJSON(url: string): Promise<any> {
  return new Promise((resolve, reject) => {
    https.get(url, (res: any) => {
      let data = '';
      res.on('data', (chunk: string) => { data += chunk; });
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch (e) { reject(new Error(`Invalid JSON from ${url}: ${data.slice(0, 200)}`)); }
      });
    }).on('error', reject);
  });
}

const HUB_API = 'https://proto.smartlaunchhub.com/hub/api';
const PROTO_API = 'https://proto.smartlaunchhub.com/api';
const PROJECT = 'date-rabbit';
const PASSWORD = 'Sara%40dura!';

// Expected pages from pageRegistry
const EXPECTED_PAGES = [
  'landing', 'auth-login', 'auth-otp', 'auth-role-select', 'auth-profile-setup',
  'auth-welcome', 'verify-intro', 'verify-photo-id', 'verify-selfie', 'verify-consent',
  'verify-pending', 'verify-approved', 'comp-onboard-step2', 'comp-onboard-verify',
  'comp-onboard-pending', 'comp-onboard-approved', 'seeker-home', 'seeker-bookings',
  'seeker-messages', 'seeker-profile', 'seeker-favorites', 'comp-home', 'comp-requests',
  'comp-calendar', 'comp-earnings', 'comp-profile', 'comp-stripe-connect',
  'booking-detail', 'booking-payment', 'booking-request-sent', 'booking-declined',
  'date-active', 'reviews-view', 'reviews-write', 'settings', 'settings-edit-profile',
  'settings-notifications', 'admin-cities', 'brand', 'components', 'overview',
];

describe('Proto Hub DB - date-rabbit', () => {
  let files: any[];

  beforeAll(async () => {
    files = await fetchJSON(`${HUB_API}/files?project=${PROJECT}`);
  }, 30000);

  test('files exist in Hub DB', () => {
    expect(Array.isArray(files)).toBe(true);
    expect(files.length).toBeGreaterThanOrEqual(41);
  });

  test('all expected pages have files pushed', () => {
    const pushedPageIds = new Set(files.filter((f: any) => f.page_id).map((f: any) => f.page_id));
    const missing = EXPECTED_PAGES.filter(p => !pushedPageIds.has(p));
    expect(missing).toEqual([]);
  });

  test('each file has non-empty content', () => {
    for (const f of files) {
      if (f.page_id) {
        expect(f.content.length).toBeGreaterThan(100);
      }
    }
  });

  test('landing page has multiple states in source', () => {
    const landingFile = files.find((f: any) => f.page_id === 'landing' && f.filename === 'landing.tsx');
    expect(landingFile).toBeDefined();
    const content = landingFile.content;
    const stateMatches = content.match(/StateSection\s+title="/g) || [];
    expect(stateMatches.length).toBeGreaterThanOrEqual(3);
    expect(content).toContain('title="DEFAULT"');
  });

  test('seeker-home page has multiple states in source', () => {
    const file = files.find((f: any) => f.page_id === 'seeker-home');
    expect(file).toBeDefined();
    const content = file.content;
    const stateMatches = content.match(/StateSection\s+title="/g) || [];
    expect(stateMatches.length).toBeGreaterThanOrEqual(2);
    expect(content.length).toBeGreaterThan(100);
  });

  test('comp-home page has multiple states in source', () => {
    const file = files.find((f: any) => f.page_id === 'comp-home');
    expect(file).toBeDefined();
    const content = file.content;
    const stateMatches = content.match(/StateSection\s+title="/g) || [];
    expect(stateMatches.length).toBeGreaterThanOrEqual(2);
  });

  test('landing page TS validation passes', async () => {
    const result = await fetchJSON(
      `${PROTO_API}/validate-ts?project=${PROJECT}&pageId=landing`
    );
    expect(result.valid).toBe(true);
    expect(result.errorCount).toBe(0);
  }, 30000);

  test('auth-login page TS validation passes', async () => {
    const result = await fetchJSON(
      `${PROTO_API}/validate-ts?project=${PROJECT}&pageId=auth-login`
    );
    expect(result.valid).toBe(true);
    expect(result.errorCount).toBe(0);
  }, 30000);

  test('no emoji in proto files', () => {
    const emojiRegex = /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u;
    for (const f of files) {
      if (f.page_id && f.content) {
        const hasEmoji = emojiRegex.test(f.content);
        if (hasEmoji) {
          fail(`Emoji found in ${f.page_id}/${f.filename}`);
        }
      }
    }
  });
});
