const logger = require('../../config/logger');
const AppError = require('./AppError');

function errorHandler(err, req, res, next) {
  const requestId = req.id;

  // Default (kutilmagan xato)
  let statusCode = 500;
  let message = 'Internal Server Error';
  let code;
  let details;

  // Agar AppError bo‘lsa - clientga safe xabar qaytaramiz
  if (err instanceof AppError) {
    statusCode = err.statusCode || 500;
    message = err.message;
    code = err.code;
    details = err.details;
  } else {
    // Kutilmagan errorlarni log qilamiz
    logger.error(
      {
        requestId,
        err: {
          name: err.name,
          message: err.message,
          stack: err.stack,
        },
      },
      'UNEXPECTED_ERROR'
    );
  }

  res.status(statusCode).json({
    success: false,
    message,
    code,
    details,
    requestId,
  });
}

module.exports = errorHandler;