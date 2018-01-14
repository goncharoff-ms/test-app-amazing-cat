const User = require('../models/User');

/**
 * Check the uniqueness of username
 * @param req
 * @param res
 * @param next
 * @return status and error message, if an error occurs
 */
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