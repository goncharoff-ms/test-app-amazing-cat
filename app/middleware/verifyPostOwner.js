/* eslint-disable no-underscore-dangle */
const Post = require('../models/Post');


/**
 * Checks if this post belongs to the user who made the request
 * @param req
 * @param res
 * @param next
 * @return status and error message, if an error occurs
 */
function verifyPostOwner(req, res, next) {
  Post.findById(req.params.id)
    .populate('author')
    .exec()
    .then((post) => {
      if (String(post.author._id) === String(req.userId)) {
        req.post = post;
        next();
      } else {
        res.status(403).send({
          code: 403,
          message: 'not a valid login or token',
        });
      }
    })
    .catch(() => res.status(500).send({
      code: 500,
      message: 'There was a problem verify token [post]',
    }));
}

module.exports = verifyPostOwner;
