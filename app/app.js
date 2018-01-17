const express = require('express');
const app = express();
const mongoose = require('mongoose');
const fs = require('fs');
const morgan = require('morgan');
const dbUrl = require('./config').dbUrl;
const controllers = require('./controllers/index');

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

mongoose.connection.on('error', tryReconnect);

mongoose.connection.on('disconnected', tryReconnect);

mongoose.connection.on('connected', function(){
  console.log('Connection with Mongo is installed');
});



const accessLogStream = fs.createWriteStream('app.log', {flags: 'a'});

app.use(morgan('short'));

controllers(app);

module.exports = app;


function tryReconnect () {

  console.log('There is no connection with Mongo, we are trying to connect');

  let timerId = setInterval(function() {
    mongoose.connect(dbUrl, { useMongoClient: true });
  }, 1500);

  setTimeout(function() {
    clearInterval(timerId);
    console.log('I could not connect to the database, I turned off');
    process.exit();
  }, 7500);
}