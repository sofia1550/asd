// logger/index.js
const env = process.env.NODE_ENV || 'development';

const logger = env === 'production' 
    ? require('./logger.prod').default 
    : require('./logger').default;

export default logger;
