const express = require('express');
const router = express.Router();
const verifyToken = require('../auth/verifyToken');
const verifyUserData = require('../auth/verifyUserData');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const config = require('../config');
const User = require('../models/User');

const logger = require('log4js').getLogger('app');

router.post('/login', function(req, res) {

  User.findOne({ username: req.body.username }, function (err, user) {
    if (err) {
      logger.error(`User: ${req.body.username} - error when requesting storage`);
      return res.status(500).send({ code:500, message: 'Error on the server.'});
    }
    if (!user) {
      logger.warn(`User: ${req.body.username} - not found`);
      return res.status(404).send({ code : 404, message: 'No user found.'});
    }

    const passwordIsValid = bcrypt.compareSync(req.body.password, user.password);
    if (!passwordIsValid) {
      logger.warn('User: ${req.body.username} - incorrect password');
      return res.status(401).send({ code: 401, message: 'Incorrect login or password', auth: false, token: null });
    }

    const token = jwt.sign({ id: user._id }, config.secret, {
      expiresIn: 86400
    });

    res.status(200).send({ code: 200, message: 'Success login', auth: true, token: token });
  });

});


router.post('/register', verifyUserData, function(req, res) {

  bcrypt.hash(req.body.password, 8, (err, hashedPassword) => {
    User.create({
      username: req.body.username,
      password : hashedPassword
    },  (err, user) => {
      if (err) {
        return res.status(500).send({
          code: 500,
          message: "There was a problem registering the user`."
        });
      }
      const token = jwt.sign({ id: user._id }, config.secret, {
        expiresIn: 86400 // expires in 24 hours
      });
      res.status(200).send({ code: 200, message: 'registration is done!', auth: true, token: token });
    });
  });

});


module.exports = router;