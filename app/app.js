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

let client = redis.createClient();

const logger = require('./logger');


function tryReconnectMongo() {
  logger.error('There is no connection with Mongo, we are trying to connect');
  const timerId = setInterval(() => {
    mongoose.connect(config.dbUrl, { useMongoClient: true });
  }, 2000);

  setTimeout(() => {
    clearInterval(timerId);
    logger.error('I could not connect to the database, I turned off');
    client.quit();
    process.exit();
  }, 10000);
}


mongoose.connect(config.dbUrl, { useMongoClient: true });

mongoose.Promise = bluebird;

mongoose.connection.on('error', tryReconnectMongo);

mongoose.connection.on('disconnected', tryReconnectMongo);

mongoose.connection.on('connected', () => {
  logger.info('Connection with Mongo is installed');
});

client.on('connect', () => {
  logger.info('Connection with Redis is installed');
});

client.on('error', () => {
  logger.error('Connection error with redis');
  const timerId = setInterval(() => {
    client = redis.createClient();
  }, 2000);

  setTimeout(() => {
    clearInterval(timerId);
    logger.error('I could not connect to the redis, I turned off');
    client.quit();
    process.exit();
  }, 10000);
});

const accessLogStream = fs.createWriteStream('access.log', { flags: 'a' });
app.use(morgan('combined', { stream: accessLogStream }));
app.use(morgan('dev'));
app.use(redisExpress(client));
controllers(app);

module.exports = app;

