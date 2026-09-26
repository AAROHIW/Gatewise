const { test } = require('node:test');
const assert = require('node:assert/strict');
const app = require('../app');

test('Gatewise VMS Test Suite', async (t) => {
  const server = app.listen(0);
  const base = `http://127.0.0.1:${server.address().port}`;

  // Test 1: Health route
  await t.test('GET /health returns status ok', async () => {
    const res = await fetch(`${base}/health`);
    const data = await res.json();
    assert.equal(res.status, 200);
    assert.equal(data.status, 'ok');
  });

  // Test 2: Form submission
  await t.test('POST /checkin creates a visitor record', async () => {
    const postRes = await fetch(`${base}/checkin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        name: 'Aradhya Modak',
        phone: '9876543210',
        purpose: 'Meeting',
        host: 'Dev Team'
      }),
      redirect: 'manual'
    });

    assert.equal(postRes.status, 302);

    const listRes = await fetch(`${base}/api/visitors`);
    const visitors = await listRes.json();
    assert.equal(visitors.length, 1);
    assert.equal(visitors[0].name, 'Aradhya Modak');
  });

  // Test 3: Validation error check
  await t.test('POST /checkin rejects missing input', async () => {
    const badRes = await fetch(`${base}/checkin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ name: 'Incomplete' })
    });

    assert.equal(badRes.status, 400);
  });

  server.close();
});
