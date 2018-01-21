module.exports = client => (req, res, next) => {
  req.redis = client;
  next();
};
