const express = require('express');

const app = express();

const mongoose = require('mongoose');

const fs = require('fs');

const morgan = require('morgan');

const config = require('./config');

const controllers = require('./controllers/index');

const redis = require('redis');

const redisExpress = require('./middleware/expressRedis');

const bluebird = require('bluebird');

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

const logger = require('./logger');

module.exports = (mode = 'dev') => {
  let mongoUrl = config.dbUrl;
  if (mode === 'test') {
    mongoUrl = config.dbUtlTest;
  }

  const optionsMongoDB = {
    autoReconnect: true,
    useMongoClient: true,
    keepAlive: 30000,
    reconnectInterval: 3000,
    reconnectTries: 10000,
  };

  mongoose.connect(mongoUrl, optionsMongoDB);

  mongoose.Promise = bluebird;

  mongoose.connection.on('error', (error) => {
    logger.error('MongoDB error!');
    throw new Error('Mongo error: ', error);
  });

  mongoose.connection.on('disconnected', () => {
    logger.error('MongoDB disconnected!');
    mongoose.connect(mongoUrl, optionsMongoDB);
  });

  mongoose.connection.on('connected', () => {
    logger.info('Connection with Mongo is installed');
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

  const accessLogStream = fs.createWriteStream('access.log', { flags: 'a' });

  app.use(morgan('combined', { stream: accessLogStream }));

  app.use(morgan('dev'));

  app.use(redisExpress(client));

  controllers(app);

  return app;
};

