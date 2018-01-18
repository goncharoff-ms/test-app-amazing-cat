module.exports = (client) => {
  return function redis (req, res, next) {
    req.redis = client;
    next();
  }
};