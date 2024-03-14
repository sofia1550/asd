const winston = require('winston');
const path = require('path');

// Logger para producción
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: path.join(__dirname, 'errors.log'), level: 'error' }),
    new winston.transports.Console(),
  ],
});

module.exports = logger;
