const usersRoutes = require('../modules/users/users.routes');
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const requestId = require('../infra/middlewares/requestId');
const requestLogger = require('../infra/middlewares/requestLogger');
const app = express();

// 🔐 Security headers
app.use(helmet());

// 🌐 CORS policy (hozir development uchun ochiq)
app.use(cors());
app.use(requestId);
app.use(requestLogger);
// 🚦 Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 100, // 1 IP uchun 100 request
});

app.use(limiter);

// 📦 Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ❤️ Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK' });
});

app.use('/api/users', usersRoutes);
// ❌ 404 handler (route topilmadi)
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

// 🧨 Global error handler
const errorHandler = require('../shared/errors/errorHandler');
app.use(errorHandler);
module.exports = app;
