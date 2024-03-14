// logger/index.js
const env = process.env.NODE_ENV || 'development';

const logger = env === 'production' 
    ? require('./logger.prod') 
    : require('./logger');

module.exports = logger;
