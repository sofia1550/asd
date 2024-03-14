const winston = require('winston');

// Logger para desarrollo
const logger = winston.createLogger({
  level: 'debug',
  format: winston.format.cli(),
  transports: [
    new winston.transports.Console(),
  ],
});

module.exports = logger;
