const express = require('express');
const shortId = require('shortid');
const router = express.Router();
const verifyToken = require('../auth/verifyToken');
const verifyUserData = require('../auth/verifyUserData');
const jwt = require('jsonwebtoken');
const config = require('../config');
const User = require('../models/User');
const bcrypt = require('bcryptjs');

const logger = require('log4js').getLogger('app');


  router.post('/login', (req, res) => {
    User.findOne({ username: req.body.username }).exec()
      .then(user => {
        if (!user) {
          logger.warn(`User: ${req.body.username} - not found`);
          return res.status(404).send({ code : 404, message: 'No user found.'});
        }
        bcrypt.compare(req.body.password, user.password, (err, resp) => {
          if (!resp) {
            logger.warn(`User: ${req.body.username} - incorrect password`);
            return res.status(401).send({code: 401, message: 'Incorrect login or password', auth: false, token: null});
          }
        });
        return user;
      })
      .then(user => {
        console.log(user);
        jwt.sign({ id: user._id, jti: `${user._id}:${shortId.generate()}` }, config.secret, {expiresIn: 86400}, (err, token) => {
          return res.status(200).send({ code: 200, message: 'Success login', auth: true, token: token });
        });
      })
      .catch(error => {
        logger.error(`User: ${req.body.username} - error when requesting storage`);
        return res.status(500).send({ code:500, message: 'Error on the server.' + error});
      });

  });

  router.post('/logout', verifyToken, (req, res) => {
    req.redis.set(req.token.jti, req.userId, 'EX', req.token.timeToDelete,(err, reply) => {
      if(err) {
        return res.status(500).send({
            code: 500,
            message: err.message
          }
        );
      }

      logger.info(`new token in blacklist: ${req.token.hash}`);
      return res.status(200).send({
        code: 200,
        message: 'Successful logout'
      });
    });
  });


  router.post('/register', function(req, res) {
    let user = new User();
    user.username = req.body.username;
    user.password = req.body.password;
    console.log(user);
    user.validate()
      .then(result => {
        return User.hashPassword(user.password);
      })
      .then(hashPassword => {
        user.password = hashPassword;
        return user.save();
      })
      .then(user => {
        jwt.sign(
          {id: user._id, jti: `${user._id}:${shortId.generate()}`},
          config.secret, {expiresIn: 86400}, (err, token) => {
            return res.status(200).send({
              code: 200,
              message: 'Success login',
              auth: true,
              token
            });
          });
      })
      .catch(error => {
        logger.error('Error in create new user: ', error);
        return res.status(500).send({
          code: 500,
          message: "There was a problem registering the user`. "
        });
      })
  });


module.exports = router;



