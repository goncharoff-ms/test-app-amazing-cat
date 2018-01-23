const express = require('express');

const app = express();

const fs = require('fs');

const morgan = require('morgan');

const controllers = require('./controllers/index');

require('./connectors/MongooseConnector');

require('./connectors/RedisConnector');

module.exports = (mode = 'dev') => {
  process.env.mode = mode;
  const accessLogStream = fs.createWriteStream('access.log', { flags: 'a' });
  app.use(morgan('combined', { stream: accessLogStream }));
  app.use(morgan('dev'));
  controllers(app);

  return app;
};

