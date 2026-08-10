/**
 * Frontend integration tests — requires backend on :3001 (via Vite proxy on :5173)
 * Run: npm run test:integration
 */
const BASE = process.env.API_URL || 'http://localhost:5173/api';

const request = async (method, path, body = null, token = null) => {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  return { status: res.status, data };
};

let passed = 0;
let failed = 0;

const test = async (name, fn) => {
  try {
    await fn();
    passed++;
    console.log(`  ✅ ${name}`);
  } catch (e) {
    failed++;
    console.log(`  ❌ ${name}: ${e.message}`);
  }
};

const assert = (c, m) => { if (!c) throw new Error(m); };

const login = async (email, password) => {
  const r = await request('POST', '/auth/login', { email, password });
  assert(r.status === 200 && r.data.token, `Login failed for ${email}`);
  return r.data.token;
};

(async () => {
  console.log('\n🧪 Frontend Integration Tests\n');
  console.log(`API Base: ${BASE}\n`);

  let adminToken, studentToken, recruiterToken;

  await test('Health check', async () => {
    const r = await request('GET', '/health');
    assert(r.data.success, 'Health failed');
  });

  await test('Admin login', async () => { adminToken = await login('admin@campus.edu', 'Admin@123'); });
  await test('Student login', async () => { studentToken = await login('ansh@student.edu', 'Student@123'); });
  await test('Recruiter login', async () => { recruiterToken = await login('recruiter@technova.com', 'Recruiter@123'); });

  await test('Student profile API', async () => {
    const r = await request('GET', '/students/profile', null, studentToken);
    assert(r.data.success && r.data.data.cgpa, 'Profile missing');
  });

  await test('Student eligible drives', async () => {
    const r = await request('GET', '/students/drives/eligible', null, studentToken);
    assert(r.data.success, 'Eligible drives failed');
  });

  await test('Student applications', async () => {
    const r = await request('GET', '/students/applications', null, studentToken);
    assert(r.data.success, 'Applications failed');
  });

  await test('Recruiter drives', async () => {
    const r = await request('GET', '/recruiters/drives', null, recruiterToken);
    assert(r.data.success && r.data.data?.length > 0, 'No drives');
  });

  await test('Recruiter applicants', async () => {
    const drives = await request('GET', '/recruiters/drives', null, recruiterToken);
    const driveId = drives.data.data[0]._id;
    const r = await request('GET', `/recruiters/drives/${driveId}/applicants`, null, recruiterToken);
    assert(r.data.success, 'Applicants failed');
  });

  await test('Admin dashboard analytics', async () => {
    const r = await request('GET', '/analytics/dashboard', null, adminToken);
    assert(r.data.data.students > 0, 'Dashboard empty');
  });

  await test('Admin students list', async () => {
    const r = await request('GET', '/admin/students', null, adminToken);
    assert(r.data.data?.length > 0, 'No students');
  });

  await test('Admin assessments', async () => {
    const r = await request('GET', '/admin/assessments', null, adminToken);
    assert(r.data.success, 'Assessments failed');
  });

  await test('Notifications', async () => {
    const r = await request('GET', '/notifications', null, studentToken);
    assert(r.data.success, 'Notifications failed');
  });

  await test('Announcements', async () => {
    const r = await request('GET', '/analytics/announcements', null, studentToken);
    assert(r.data.data?.length > 0, 'No announcements');
  });

  console.log(`\n📊 Results: ${passed} passed, ${failed} failed\n`);
  process.exit(failed > 0 ? 1 : 0);
})();
