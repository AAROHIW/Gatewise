const express = require('express');

const app = express();
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// In-memory visitor list
const visitors = [];

// Escape HTML characters for safety
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

// Read git SHA from environment variables
const sha = process.env.GIT_SHA || process.env.RENDER_GIT_COMMIT || 'local';
const commit = sha.slice(0, 7);

// GET / - Home page
app.get('/', (req, res) => {
  const visitorRows = visitors
    .map(
      (v) =>
        `<tr>
          <td>${v.id}</td>
          <td><b>${esc(v.name)}</b></td>
          <td>${esc(v.phone)}</td>
          <td>${esc(v.purpose)}</td>
          <td>${esc(v.host)}</td>
        </tr>`
    )
    .join('');

  res.send(`<!DOCTYPE html>
<html>
<head>
  <title>Gatewise - Visitor Management System</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 30px; line-height: 1.6; }
    form { margin-bottom: 20px; display: flex; gap: 10px; flex-wrap: wrap; }
    input { padding: 8px; border: 1px solid #ccc; border-radius: 4px; }
    button { padding: 8px 16px; background-color: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer; }
    table { width: 100%; border-collapse: collapse; margin-top: 15px; }
    th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
    th { background-color: #f4f4f4; }
    footer { margin-top: 30px; font-size: 0.9em; color: #666; border-top: 1px solid #ddd; padding-top: 10px; }
  </style>
</head>
<body>
  <h1>Gatewise - Visitor Management System</h1>
  
  <h3>Check-in New Visitor</h3>
  <form method="POST" action="/checkin">
    <input name="name" placeholder="Visitor Name" required />
    <input name="phone" placeholder="Phone Number" required />
    <input name="purpose" placeholder="Purpose of Visit" required />
    <input name="host" placeholder="Host / Person to Meet" required />
    <button type="submit">Check In</button>
  </form>

  <h3>Visitor Log</h3>
  <table>
    <thead>
      <tr>
        <th>ID</th>
        <th>Visitor Name</th>
        <th>Phone</th>
        <th>Purpose</th>
        <th>Host</th>
      </tr>
    </thead>
    <tbody>
      ${visitorRows || '<tr><td colspan="5">No visitors checked in yet.</td></tr>'}
    </tbody>
  </table>

  <footer>commit ${commit}</footer>
</body>
</html>`);
});

// POST /checkin - Form submission
app.post('/checkin', (req, res) => {
  const { name, phone, purpose, host } = req.body;
  if (!name || !phone || !purpose || !host) {
    return res.status(400).send('All fields are required.');
  }

  const newVisitor = {
    id: visitors.length + 1,
    name,
    phone,
    purpose,
    host,
    checkInTime: new Date().toISOString()
  };

  visitors.push(newVisitor);
  res.redirect('/');
});

// GET /api/visitors - JSON API route
app.get('/api/visitors', (req, res) => {
  res.json(visitors);
});

// GET /health - Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', commit });
});

module.exports = app;