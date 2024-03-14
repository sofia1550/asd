import { createLogger, format as _format, transports as _transports } from 'winston';

// Logger para desarrollo
const logger = createLogger({
  level: 'debug',
  format: _format.cli(),
  transports: [
    new _transports.Console(),
  ],
});

export default logger;
