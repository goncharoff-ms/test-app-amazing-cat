const User = require('../models/User');

/**
 * Check the uniqueness of username
 * @param req
 * @param res
 * @param next
 * @return status and error message, if an error occurs
 */
function verifyUserData(req, res, next) {

  if (!validation(req.body.username) || !validation(req.body.password)) {
    return res.status(403).send({
      code: 403,
      message: "Incorrect username or password."
    });
  }

  User.find({ username: req.body.username }, (err, userDouble) => {
    if (err) {
      return res.status(500).send("There was a problem registering the user`.");
    }

    if (userDouble.length > 0) {
      return res.status(403).send({
        code: 403,
        message: "Username is busy."
      });
    } else {
      next();
    }

  });

}

function validation(text) {
  if (typeof text === undefined || text === null || String(text).trim().length < 6 ) {
    return false;
  }
  return true;
}

module.exports = verifyUserData;