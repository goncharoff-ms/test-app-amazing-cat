const express = require('express');
const app = express();
const mongoose = require('mongoose');
const fs = require('fs');
const morgan = require('morgan');
const dbUrl = require('./config').dbUrl;
const controllers = require('./controllers/index');

mongoose.connect(dbUrl, { useMongoClient: true });

const accessLogStream = fs.createWriteStream('app.log', {flags: 'a'});

app.use(morgan('combined'));

controllers(app);


module.exports = app;