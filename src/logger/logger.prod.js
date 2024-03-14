import { createLogger, format as _format, transports as _transports } from 'winston';
import { join } from 'path';

// Logger para producción
const logger = createLogger({
  level: 'info',
  format: _format.json(),
  transports: [
    new _transports.File({ filename: join(__dirname, 'errors.log'), level: 'error' }),
    new _transports.Console(),
  ],
});

export default logger;
