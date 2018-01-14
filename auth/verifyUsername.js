const User = require('./../models/User');

function verifyUsername(req, res, next) {

  User.find({ username: req.body.username }, (err, userDouble) => {
    if (err) {
      return res.status(500).send("There was a problem registering the user`.");
    }

    if (userDouble.length !== 0) {
      return res.status(403).send("name is entertaining");
    } else {
      next();
    }

  });

}

module.exports = verifyUsername;