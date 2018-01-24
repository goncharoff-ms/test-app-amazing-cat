/* eslint consistent-return:0 */
const jwt = require('jsonwebtoken');

const config = require('../config');

const redis = require('../connectors/RedisConnector');

/**
 * Checks the incoming token and determines its owner, sets the variable.
 * @param req
 * @param res
 * @param next
 * @returns status and error message, if an error occurred.
 */
function verifyToken(req, res, next) {
  req.token = {};
  const token = req.headers['x-access-token'];
  if (!token) {
    return res.status(403).send({ code: 403, auth: false, message: 'No token provided.' });
  }

  jwt.verify(token, config.secret, (err, decoded) => {
    if (err) {
      return res.status(500).send({ code: 500, auth: false, message: 'Failed to authenticate token.' });
    }

    redis.exists(decoded.jti, (error, reply) => {
      if (reply === 1) {
        return res.status(401).send({ code: 401, auth: false, message: 'Token is not valid.' });
      }
      const timeAliveToken = Math.round(decoded.exp - (Date.now() / 1000));
      if (timeAliveToken > 0) {
        req.token.jti = decoded.jti;
        req.token.timeToDelete = timeAliveToken;
        req.userId = decoded.id;
        next();
      } else {
        return res.status(401).send({ code: 401, auth: false, message: 'The token expired' });
      }
    });
  });
}

module.exports = verifyToken;
