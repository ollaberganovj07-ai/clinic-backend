// app.js
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

// Route-larni import qilish
const authRoutes = require("./modules/users/auth/auth.routes");
const usersRoutes = require("./modules/users/users.routes");
const doctorsRoutes = require("./modules/users/doctors/doctors.routes");
const appointmentsRoutes = require("./modules/users/appointments/appointments.routes");

const app = express();

// Xavfsizlik va Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// So'rovlarni cheklash
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});
app.use(limiter);

// Route-larni ulash
app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/doctors', doctorsRoutes);
app.use('/api/appointments', appointmentsRoutes);

// Global xato ishlovchi
app.use((err, req, res, next) => {
  const status = err.status || 500;
  res.status(status).json({ success: false, message: err.message || "Server xatosi" });
});

module.exports = app; // Bu yerda app-ni eksport qilamiz