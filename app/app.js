const express = require('express');
const app = express();
const mongoose = require('mongoose');
const fs = require('fs');
const morgan = require('morgan');
const dbUrl = require('./config').dbUrl;
const controllers = require('./controllers/index');
const redis = require('redis');
const redisExpress = require('./middleware/expressRedis');

let client = redis.createClient();

const log4js = require('log4js');
log4js.configure({
  appenders: {
    out: { type: 'stdout' },
    app: { type: 'file', filename: 'application.log' }
  },
  categories: {
    default: { appenders: [ 'out', 'app' ], level: 'info' }
  }
});

const logger = log4js.getLogger('app');

mongoose.connect(dbUrl, { useMongoClient: true });

mongoose.connection.on('error', tryReconnectMongo);

mongoose.connection.on('disconnected', tryReconnectMongo);

mongoose.connection.on('connected', function() {
  logger.info('Connection with Mongo is installed');
});

client.on('connect', () => {
  logger.info('Connection with Redis is installed');
});

client.on('error',  () => {
  logger.error('Connection error with redis');
  let timerId = setInterval( () => {
    client = redis.createClient();
  }, 2000);

  setTimeout(() => {
    clearInterval(timerId);
    logger.error('I could not connect to the redis, I turned off');
    client.quit();
    process.exit();
  }, 10000);
});





const accessLogStream = fs.createWriteStream('app.log', {flags: 'a'});

app.use(redisExpress(client));
app.use(morgan('short'));

controllers(app);

module.exports = app;


function tryReconnectMongo () {

  logger.error('There is no connection with Mongo, we are trying to connect');

  let timerId = setInterval(function() {
    mongoose.connect(dbUrl, { useMongoClient: true });
  }, 2000);

  setTimeout(function() {
    clearInterval(timerId);
    logger.error('I could not connect to the database, I turned off');
    client.quit();
    process.exit();
  }, 10000);
}