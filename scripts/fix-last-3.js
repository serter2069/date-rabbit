const API_BASE = 'https://daterabbit-api.smartlaunchhub.com/api';

function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

async function apiRequest(method, path, body, token) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = 'Bearer ' + token;
  const response = await fetch(API_BASE + path, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await response.text();
  try {
    return { status: response.status, data: JSON.parse(text) };
  } catch (e) {
    return { status: response.status, data: text };
  }
}

async function updateProfile(email, name, photoIndex) {
  const startRes = await apiRequest('POST', '/auth/start', { email });
  if (!startRes.data || !startRes.data.success) {
    console.log(name + ': start failed:', JSON.stringify(startRes.data));
    return;
  }
  await new Promise((r) => setTimeout(r, 300));

  const verifyRes = await apiRequest('POST', '/auth/verify', { email, code: '000000' });
  if (!verifyRes.data || !verifyRes.data.token) {
    console.log(name + ': verify failed:', JSON.stringify(verifyRes.data));
    return;
  }

  const token = verifyRes.data.token;
  const photos = [
    {
      id: generateUUID(),
      url: 'https://randomuser.me/api/portraits/women/' + photoIndex + '.jpg',
      order: 0,
      isPrimary: true,
    },
    {
      id: generateUUID(),
      url: 'https://randomuser.me/api/portraits/women/' + (photoIndex - 1) + '.jpg',
      order: 1,
      isPrimary: false,
    },
  ];

  const updateRes = await apiRequest('PUT', '/users/me', { photos }, token);
  if (updateRes.data && updateRes.data.id) {
    console.log(name + ': UPDATED with photo index ' + photoIndex);
  } else {
    console.log(name + ': update failed:', JSON.stringify(updateRes.data));
  }
}

async function main() {
  await updateProfile('isabella.romano@seed.daterabbit.com', 'Isabella Romano', 12);
  await new Promise((r) => setTimeout(r, 400));
  await updateProfile('emma.davis@seed.daterabbit.com', 'Emma Davis', 33);
  await new Promise((r) => setTimeout(r, 400));
  await updateProfile('luna.vasquez@seed.daterabbit.com', 'Luna Vasquez', 54);

  // Final check
  const res = await apiRequest('GET', '/companions?limit=100');
  if (res.data && res.data.companions) {
    const withReal = res.data.companions.filter(
      (c) => c.primaryPhoto && c.primaryPhoto.includes('randomuser.me'),
    );
    const withDicebear = res.data.companions.filter(
      (c) => c.primaryPhoto && c.primaryPhoto.includes('dicebear'),
    );
    const noPhoto = res.data.companions.filter((c) => !c.primaryPhoto);
    console.log('\nFinal state (' + res.data.total + ' total companions):');
    console.log('  With real photos (randomuser.me): ' + withReal.length);
    console.log('  With dicebear avatars:            ' + withDicebear.length);
    console.log('  No photo:                         ' + noPhoto.length);
  }
}

main().catch(console.error);
