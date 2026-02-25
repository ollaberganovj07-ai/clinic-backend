const logger = require('../../config/logger');

function requestLogger(req, res, next) {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;

    logger.info({
      requestId: req.id,
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
     durationMs: duration,
    }, 'HTTP Request');
  });

  next();
}

module.exports = requestLogger;