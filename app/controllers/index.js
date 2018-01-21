const express = require('express');

const bodyParser = require('body-parser');

const authController = require('./AuthController');

const usersController = require('./UserController');

const PostController = require('./PostController');


/**
 * Connect all controllers
 * @param app this our Express application
 */
module.exports = (app) => {
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(bodyParser.json());

  app.use('/api', authController);
  app.use('/api/users', usersController);
  app.use('/api/posts', PostController);
};
