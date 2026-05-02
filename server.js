require('dotenv').config();
const express   = require('express');
const cors      = require('cors');
const connectDB = require('./config/db');

const app = express();

// ── Database ────────────────────────────────
connectDB();

// ── Global Middleware ───────────────────────
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));


// ── Routes ──────────────────────────────────
app.use('/api/auth',      require('./routes/auth'));
app.use('/api/listings',  require('./routes/listings'));
app.use('/api/requests',  require('./routes/requests'));
app.use('/api/messages',  require('./routes/messages'));
app.use('/api/needs',     require('./routes/needs'));
app.use('/api/hub',       require('./routes/hub'));
app.use('/api/ratings',   require('./routes/ratings'));
app.use('/api/dashboard', require('./routes/dashboard'));


app.use(express.static('public'));

// ── Health Check ────────────────────────────
app.get('/api', (req, res) => {
  res.json({
    message:  'UniSwap API is running! (MongoDB)',
    version:  '2.0.0',
    database: 'MongoDB via Mongoose',
    endpoints: {
      auth:      '/api/auth',
      listings:  '/api/listings',
      requests:  '/api/requests',
      messages:  '/api/messages',
      needs:     '/api/needs',
      hub:       '/api/hub',
      ratings:   '/api/ratings',
      dashboard: '/api/dashboard',
    },
  });
});

// ── Global Error Handler ────────────────────
// Handles errors thrown from services (with custom statusCode)
app.use((err, req, res, next) => { // eslint-disable-line no-unused-vars
  const status = err.statusCode || 500;
  const message = status === 500 ? 'Internal server error' : err.message;
  if (status === 500) console.error('Unhandled error:', err.stack);
  res.status(status).json({ success: false, message });
});

// ── Start Server ────────────────────────────
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 App running on port ${PORT}`);
});
