const http = require('http');
const assert = require('assert');

const BASE_URL = process.env.API_URL || 'http://localhost:3001';

function request(path, method = 'GET', body = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method,
      headers: { 'Content-Type': 'application/json', ...headers }
    };
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(data) }); }
        catch { resolve({ status: res.statusCode, body: data }); }
      });
    });
    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function runTests() {
  console.log('Running API smoke tests...\n');

  // Health check
  const health = await request('/health');
  assert.strictEqual(health.status, 200, 'Health check should return 200');
  assert.strictEqual(health.body.status, 'ok', 'Health status should be ok');
  console.log('✅ Health check');

  // Auth login
  const login = await request('/api/admin/login', 'POST', {
    email: 'admin@citymate.com',
    password: 'admin123'
  });
  assert.strictEqual(login.status, 200, `Login should return 200, got ${login.status}`);
  assert.ok(login.body.success, 'Login should return success=true');
  assert.ok(login.body.token, 'Login should return token');
  console.log('✅ Admin login');

  const token = login.body.token;

  // Create booking (public)
  const booking = await request('/api/book', 'POST', {
    name: 'Test User',
    email: 'test@example.com',
    service: 'Personal Guide',
    date: '2025-01-01',
    phone: '+91 98765 43210'
  });
  assert.strictEqual(booking.status, 201, `Create booking should return 201, got ${booking.status}`);
  assert.ok(booking.body.success, 'Booking should return success=true');
  assert.ok(booking.body.data._id, 'Booking should have _id');
  console.log('✅ Create booking');

  const bookingId = booking.body.data._id;

  // Create review (public)
  const review = await request('/api/review', 'POST', {
    name: 'Jane Doe',
    email: 'jane@example.com',
    rating: 5,
    comment: 'Amazing experience!'
  });
  assert.strictEqual(review.status, 201, `Create review should return 201, got ${review.status}`);
  console.log('✅ Create review');

  // Create contact (public)
  const contact = await request('/api/contact', 'POST', {
    name: 'Bob Smith',
    email: 'bob@example.com',
    message: 'How do I book a guide?'
  });
  assert.strictEqual(contact.status, 201, `Create contact should return 201, got ${contact.status}`);
  console.log('✅ Create contact');

  // Get bookings (admin)
  const bookings = await request('/api/admin/bookings', 'GET', null, {
    'Authorization': `Bearer ${token}`
  });
  assert.strictEqual(bookings.status, 200, 'Get bookings should return 200');
  assert.ok(bookings.body.success, 'Bookings should return success=true');
  assert.ok(Array.isArray(bookings.body.data), 'Bookings data should be array');
  assert.ok(bookings.body.data.length >= 1, 'Should have at least 1 booking');
  console.log('✅ Get bookings');

  // Update booking status
  const update = await request(`/api/admin/update/${bookingId}`, 'POST', {
    status: 'accepted'
  }, { 'Authorization': `Bearer ${token}` });
  assert.strictEqual(update.status, 200, `Update booking should return 200, got ${update.status}`);
  assert.strictEqual(update.body.data.status, 'accepted', 'Status should be accepted');
  console.log('✅ Update booking status');

  // Admin stats
  const stats = await request('/api/admin/stats', 'GET', null, {
    'Authorization': `Bearer ${token}`
  });
  assert.strictEqual(stats.status, 200, 'Stats should return 200');
  assert.ok(stats.body.success, 'Stats should return success=true');
  assert.ok(typeof stats.body.data.totalBookings === 'number', 'Stats should have totalBookings');
  console.log('✅ Admin stats');

  // Get reviews (admin)
  const reviews = await request('/api/admin/reviews', 'GET', null, {
    'Authorization': `Bearer ${token}`
  });
  assert.strictEqual(reviews.status, 200, 'Get reviews should return 200');
  assert.ok(reviews.body.data.length >= 1, 'Should have at least 1 review');
  console.log('✅ Get reviews');

  // Get contacts (admin)
  const contacts = await request('/api/admin/contacts', 'GET', null, {
    'Authorization': `Bearer ${token}`
  });
  assert.strictEqual(contacts.status, 200, 'Get contacts should return 200');
  assert.ok(contacts.body.data.length >= 1, 'Should have at least 1 contact');
  console.log('✅ Get contacts');

  console.log('\n🎉 All tests passed!');
}

runTests().catch(err => {
  console.error('\n❌ Test failed:', err.message);
  process.exit(1);
});

