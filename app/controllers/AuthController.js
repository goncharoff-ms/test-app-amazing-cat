/* eslint-disable no-underscore-dangle */
const express = require('express');

const mongoose = require('mongoose');

const router = express.Router();

const verifyToken = require('./../middleware/verifyToken');

const jwt = require('jsonwebtoken');

const config = require('../config');

const User = require('../models/User');

const bcrypt = require('bcryptjs');

const shortId = require('shortid');

const logger = require('../logger');

const redis = require('./../connectors/RedisConnector');

router.post('/login', (req, res) => {
  User.findOne({ username: req.body.username }).exec()
    .then((user) => {
      if (!user) {
        logger.warn(`User: ${req.body.username} - incorrect password`);
        return res.status(403).send({
          code: 403, message: 'Incorrect login or password', auth: false,
        });
      }
      bcrypt.compare(req.body.password, user.password, (err, resp) => {
        if (!resp) {
          logger.warn(`User: ${req.body.username} - incorrect password`);
          return res.status(403).send({
            code: 403, message: 'Incorrect login or password', auth: false,
          });
        }
        return resp;
      });
      return user;
    })
    .then((user) => {
      jwt.sign({ id: user._id, jti: `${user._id}:${shortId.generate()}` }, config.secret, { expiresIn: 86400 }, (err, token) => res.status(200).send({
        code: 200, message: 'Success login', auth: true, token,
      }));
    })
    .catch((error) => {
      logger.error(`User: ${req.body.username} - error when requesting storage`);
      return res.status(500).send({ code: 500, auth: false, message: `Error on the server.${error}` });
    });
});

router.post('/logout', verifyToken, (req, res) => {
  redis.set(req.token.jti, req.userId, 'EX', req.token.timeToDelete, (err) => {
    if (err) {
      return res.status(500).send({
        code: 500,
        message: err.message,
      });
    }
    return res.status(200).send({
      code: 200,
      message: 'Successful logout',
    });
  });
});


router.post('/register', (req, res) => {
  const user = new User();
  user._id = new mongoose.Types.ObjectId();
  user.username = req.body.username;
  user.password = req.body.password;
  user.validate(() => {
    User.hashPassword(user.password)
      .then((hashPassword) => {
        user.password = hashPassword;
        return user.save();
      })
      .then((userSave) => {
        jwt.sign(
          {
            id: userSave._id,
            jti: `${userSave._id}:${shortId.generate()}`,
          },
          config.secret, {
            expiresIn: 86400,
          }, (err, token) => res.status(200).send({
            code: 200,
            message: 'Success registration',
            auth: true,
            token,
          }),
        );
      })
      .catch(() => {
        logger.error('Error in create new user');
        return res.status(500).send({
          code: 500,
          auth: false,
          message: 'There was a problem registering the user ',
        });
      });
  });
});


module.exports = router;

