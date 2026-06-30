// Vercel serverless entry. Any request to /api/* is routed here and handled
// by the existing Express app. The app mounts its routes under both '/api/*'
// and bare paths, so it matches whichever URL form Vercel forwards.
const app = require('../backend/server');

module.exports = app;
