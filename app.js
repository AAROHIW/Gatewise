const express = require('express');
const app = express();

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// In-memory visitor storage[cite: 6]
const visitors = [];

// Helper to escape user input and prevent XSS script injection[cite: 6]
const esc = (s) => String(s || '').replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

// Extract commit hash from environment variables[cite: 5, 6]
const sha = process.env.RENDER_GIT_COMMIT || process.env.GIT_SHA || 'local';
const commit = sha.slice(0, 7);

// GET / - Render main Visitor Log page
app.get('/', (req, res) => {
  const visitorRows = visitors.length > 0
    ? visitors
        .map(
          (v) =>
            `<tr>
              <td>${v.id}</td>
              <td><b>${esc(v.name)}</b></td>
              <td>${esc(v.phone)}</td>
              <td>${esc(v.purpose)}</td>
              <td>${esc(v.host)}</td>
              <td>${new Date(v.checkInTime).toLocaleTimeString()}</td>
            </tr>`
        )
        .join('')
    : `<tr><td colspan="6" style="text-align: center;">No visitors checked in yet.</td></tr>`;

  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>Gatewise - Visitor Management System</title>
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 30px; background-color: #f8f9fa; color: #333; }
        .container { max-width: 900px; margin: 0 auto; background: white; padding: 25px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        h1 { color: #0056b3; margin-bottom: 5px; }
        .subtitle { color: #6c757d; margin-bottom: 25px; }
        form { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 30px; background: #f1f3f5; padding: 20px; border-radius: 6px; }
        form input { padding: 10px; border: 1px solid #ced4da; border-radius: 4px; font-size: 14px; }
        form button { grid-column: span 2; padding: 12px; background-color: #28a745; color: white; border: none; border-radius: 4px; font-size: 16px; cursor: pointer; font-weight: bold; }
        form button:hover { background-color: #218838; }
        table { width: 100%; border-collapse: collapse; margin-top: 15px; }
        th, td { border: 1px solid #dee2e6; padding: 12px; text-align: left; }
        th { background-color: #0056b3; color: white; }
        tr:nth-child(even) { background-color: #f8f9fa; }
        footer { margin-top: 40px; text-align: center; font-size: 0.85em; color: #6c757d; border-top: 1px solid #dee2e6; padding-top: 15px; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>Gatewise VMS</h1>
        <p class="subtitle">Campus Visitor Management System</p>
        
        <h2>Check-in New Visitor</h2>
        <form method="POST" action="/checkin">
          <input name="name" placeholder="Visitor Full Name" required>
          <input name="phone" placeholder="Phone Number" required>
          <input name="purpose" placeholder="Purpose of Visit" required>
          <input name="host" placeholder="Host / Person to Meet" required>
          <button type="submit">Check In Visitor</button>
        </form>

        <h2>Recent Visitor Logs (${visitors.length})</h2>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Visitor Name</th>
              <th>Phone</th>
              <th>Purpose</th>
              <th>Host</th>
              <th>Check-in Time</th>
            </tr>
          </thead>
          <tbody>
            ${visitorRows}
          </tbody>
        </table>

        <footer>commit ${commit}</footer>
      </div>
    </body>
    </html>
  `);
});

// POST /checkin - Submit check-in form[cite: 5, 6]
app.post('/checkin', (req, res) => {
  const { name, phone, purpose, host } = req.body;

  // Validate inputs
  if (!name || !phone || !purpose || !host) {
    return res.status(400).send('All fields are required');
  }

  const newVisitor = {
    id: visitors.length + 1,
    name: name.trim(),
    phone: phone.trim(),
    purpose: purpose.trim(),
    host: host.trim(),
    checkInTime: new Date().toISOString()
  };

  visitors.push(newVisitor);
  res.redirect('/');
});

// GET /api/visitors - JSON API endpoint[cite: 5, 6]
app.get('/api/visitors', (req, res) => {
  res.json(visitors);
});

// GET /health - Health check endpoint[cite: 5, 6]
app.get('/health', (req, res) => {
  res.json({ status: 'ok', commit });
});

module.exports = app;