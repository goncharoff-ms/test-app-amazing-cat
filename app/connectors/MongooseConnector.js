const mongoose = require('mongoose');

const bluebird = require('bluebird');

const logger = require('./../logger');

const config = require('./../config');

let mongoUrl = config.dbUrl;

logger.info(`Environment is [${process.env.mode}]`);

if (process.env.mode === 'test') {
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

module.exports = mongoose;
