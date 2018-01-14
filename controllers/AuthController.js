const express = require('express');
const router = express.Router();

const verifyToken = require('../auth/verifyToken');
const VerifyUsername = require('../auth/verifyUsername');
const jwt = require('jsonwebtoken'); // used to create, sign, and verify tokens
const bcrypt = require('bcryptjs');
const config = require('./../config'); // get config file
const User = require('./../models/User');



router.post('/login', function(req, res) {

  User.findOne({ username: req.body.username }, function (err, user) {
    if (err) {
      return res.status(500).send({ code:500, message: 'Error on the server.'});
    }
    if (!user) {
      return res.status(404).send({ code : 404, message: 'No user found.'});
    }


    const passwordIsValid = bcrypt.compareSync(req.body.password, user.password);
    if (!passwordIsValid) {
      return res.status(401).send({ code: 401, message: 'Incorrect login or password', auth: false, token: null });
    }

    const token = jwt.sign({ id: user._id }, config.secret, {
      expiresIn: 86400 // expires in 24 hours
    });

    res.status(200).send({ code: 200, message: 'Success login', auth: true, token: token });
  });

});

router.get('/logout', function(req, res) {
  res.status(200).send({ auth: false, token: null });
});

router.post('/register', VerifyUsername, function(req, res) {

  const hashedPassword = bcrypt.hashSync(req.body.password, 8);

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


module.exports = router;