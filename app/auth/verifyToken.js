const jwt = require('jsonwebtoken'); // used to create, sign, and verify tokens
const config = require('../config'); // get our config file

/**
 * Checks the incoming token and determines its owner, sets the variable.
 * @param req
 * @param res
 * @param next
 * @returns status and error message, if an error occurred.
 */
function verifyToken(req, res, next) {


  let token = req.headers['x-access-token'];
  if (!token) {
    return res.status(403).send({ auth: false, message: 'No token provided.' });
  }

  jwt.verify(token, config.secret, function(err, decoded) {
    console.log(decoded);
    if (err)  {
      return res.status(500).send({ auth: false, message: 'Failed to authenticate token.' });
    }

    console.log(decoded.exp, Date.now() / 1000);

    if(decoded.exp > Date.now() / 1000) {
      req.userId = decoded.id;
      next();
    } else {
      return res.status(401).send({ auth: false, message: 'The token expired' });
    }

  });

}

module.exports = verifyToken;