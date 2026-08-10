const http = require('http');

const BASE = process.env.API_URL || 'http://localhost:3001';
let passed = 0;
let failed = 0;
let token = { admin: '', student: '', recruiter: '' };

const request = (method, path, body = null, authToken = null) =>
  new Promise((resolve, reject) => {
    const url = new URL(path, BASE);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method,
      headers: { 'Content-Type': 'application/json' },
    };
    if (authToken) options.headers.Authorization = `Bearer ${authToken}`;

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: data ? JSON.parse(data) : {} });
        } catch {
          resolve({ status: res.statusCode, body: data });
        }
      });
    });
    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });

const test = async (name, fn) => {
  try {
    await fn();
    passed++;
    console.log(`  ✅ ${name}`);
  } catch (err) {
    failed++;
    console.log(`  ❌ ${name}: ${err.message}`);
  }
};

const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};

const run = async () => {
  console.log('\n🧪 Running API Tests...\n');

  await test('Health check', async () => {
    const res = await request('GET', '/api/health');
    assert(res.status === 200 && res.body.success, `Expected 200, got ${res.status}`);
  });

  await test('Admin login', async () => {
    const res = await request('POST', '/api/auth/login', { email: 'admin@campus.edu', password: 'Admin@123' });
    assert(res.status === 200 && res.body.token, 'Login failed');
    token.admin = res.body.token;
  });

  await test('Student login', async () => {
    const res = await request('POST', '/api/auth/login', { email: 'ansh@student.edu', password: 'Student@123' });
    assert(res.status === 200 && res.body.token, 'Login failed');
    token.student = res.body.token;
  });

  await test('Recruiter login', async () => {
    const res = await request('POST', '/api/auth/login', { email: 'recruiter@technova.com', password: 'Recruiter@123' });
    assert(res.status === 200 && res.body.token, 'Login failed');
    token.recruiter = res.body.token;
  });

  await test('Get auth profile', async () => {
    const res = await request('GET', '/api/auth/me', null, token.student);
    assert(res.status === 200 && res.body.data.user.role === 'student', 'Profile fetch failed');
  });

  await test('Student get profile', async () => {
    const res = await request('GET', '/api/students/profile', null, token.student);
    assert(res.status === 200 && res.body.data.cgpa, 'Student profile failed');
  });

  await test('Student update profile', async () => {
    const res = await request('PUT', '/api/students/profile', { phone: '9999888877' }, token.student);
    assert(res.status === 200, 'Profile update failed');
  });

  await test('Get published drives', async () => {
    const res = await request('GET', '/api/students/drives', null, token.student);
    assert(res.status === 200 && res.body.data.length > 0, 'No drives found');
  });

  await test('Check eligibility', async () => {
    const drives = await request('GET', '/api/students/drives', null, token.student);
    const driveId = drives.body.data[0]._id;
    const res = await request('GET', `/api/students/drives/${driveId}/eligibility`, null, token.student);
    assert(res.status === 200 && res.body.data.isEligible !== undefined, 'Eligibility check failed');
  });

  await test('Get eligible drives', async () => {
    const res = await request('GET', '/api/students/drives/eligible', null, token.student);
    assert(res.status === 200, 'Eligible drives failed');
  });

  await test('Get student applications', async () => {
    const res = await request('GET', '/api/students/applications', null, token.student);
    assert(res.status === 200, 'Applications fetch failed');
  });

  await test('Recruiter get profile', async () => {
    const res = await request('GET', '/api/recruiters/profile', null, token.recruiter);
    assert(res.status === 200 && res.body.data.company, 'Recruiter profile failed');
  });

  await test('Recruiter get drives', async () => {
    const res = await request('GET', '/api/recruiters/drives', null, token.recruiter);
    assert(res.status === 200 && res.body.data.length > 0, 'Recruiter drives failed');
  });

  await test('Recruiter get applicants', async () => {
    const drives = await request('GET', '/api/recruiters/drives', null, token.recruiter);
    const driveId = drives.body.data[0]._id;
    const res = await request('GET', `/api/recruiters/drives/${driveId}/applicants`, null, token.recruiter);
    assert(res.status === 200, 'Applicants fetch failed');
  });

  await test('Admin get users', async () => {
    const res = await request('GET', '/api/admin/users', null, token.admin);
    assert(res.status === 200 && res.body.data.length > 0, 'Admin users failed');
  });

  await test('Admin get students', async () => {
    const res = await request('GET', '/api/admin/students', null, token.admin);
    assert(res.status === 200 && res.body.data.length > 0, 'Admin students failed');
  });

  await test('Admin get departments', async () => {
    const res = await request('GET', '/api/admin/departments', null, token.admin);
    assert(res.status === 200 && res.body.data.length > 0, 'Departments failed');
  });

  await test('Admin get companies', async () => {
    const res = await request('GET', '/api/admin/companies', null, token.admin);
    assert(res.status === 200 && res.body.data.length > 0, 'Companies failed');
  });

  await test('Admin dashboard analytics', async () => {
    const res = await request('GET', '/api/analytics/dashboard', null, token.admin);
    assert(res.status === 200 && res.body.data.students > 0, 'Dashboard failed');
  });

  await test('Placement rate analytics', async () => {
    const res = await request('GET', '/api/analytics/placement-rate', null, token.admin);
    assert(res.status === 200, 'Placement rate failed');
  });

  await test('Department stats analytics', async () => {
    const res = await request('GET', '/api/analytics/department-stats', null, token.admin);
    assert(res.status === 200, 'Department stats failed');
  });

  await test('Package stats analytics', async () => {
    const res = await request('GET', '/api/analytics/package-stats', null, token.admin);
    assert(res.status === 200, 'Package stats failed');
  });

  await test('Get notifications', async () => {
    const res = await request('GET', '/api/notifications', null, token.student);
    assert(res.status === 200, 'Notifications failed');
  });

  await test('Get announcements', async () => {
    const res = await request('GET', '/api/analytics/announcements', null, token.student);
    assert(res.status === 200 && res.body.data.length > 0, 'Announcements failed');
  });

  await test('Invalid login rejected', async () => {
    const res = await request('POST', '/api/auth/login', { email: 'wrong@test.com', password: 'wrong' });
    assert(res.status === 401, 'Should reject invalid login');
  });

  await test('Unauthorized access blocked', async () => {
    const res = await request('GET', '/api/admin/users');
    assert(res.status === 401, 'Should block unauthenticated access');
  });

  console.log(`\n📊 Results: ${passed} passed, ${failed} failed\n`);
  process.exit(failed > 0 ? 1 : 0);
};

run().catch((err) => {
  console.error('Test runner failed:', err.message);
  process.exit(1);
});
