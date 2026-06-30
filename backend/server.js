require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

const sheets      = require('./routes/sheets');
const tasks       = require('./routes/tasks');
const completions = require('./routes/completions');

// Mount under both bare paths (local) and /api (Vercel rewrite forwards /api/*).
for (const base of ['', '/api']) {
  app.use(`${base}/sheets`,      sheets);
  app.use(`${base}/tasks`,       tasks);
  app.use(`${base}/completions`, completions);
}

module.exports = app;

// Only start a long-lived server when run directly (local dev).
// On Vercel the app is imported and invoked per-request.
if (require.main === module) {
  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => console.log(`Backend on http://localhost:${PORT}`));
}
