const redis = require('redis');

const logger = require('./../logger');

const client = redis.createClient({
  retry_strategy: (options) => {
    if (options.error && options.error.code === 'ECONNREFUSED') {
      return new Error('The server refused the connection');
    }
    if (options.total_retry_time > 1000 * 60 * 60) {
      return new Error('Retry time exhausted');
    }
    if (options.attempt > 10) {
      return undefined;
    }
    return Math.min(options.attempt * 100, 3000);
  },
});


client.on('connect', () => {
  logger.info('Connection with Redis is installed');
});

client.on('reconnecting', () => {
  logger.warn('Trying to reconnect to radis');
});

client.on('error', (error) => {
  logger.error('Redis error!');
  throw new Error('Redis error: ', error);
});

module.exports = client;
