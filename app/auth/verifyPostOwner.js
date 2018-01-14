const User = require('../models/User');
const Post = require('../models/Post');

/**
 * Checks if this post belongs to the user who made the request
 * @param req
 * @param res
 * @param next
 * @return status and error message, if an error occurs
 */
function verifyPostOwner(req, res, next) {

  Post.findById(req.params.id, (err, post) => {
    if (err) {
      return res.status(500).send({
        code: 500,
        message: "There was a problem update posts"
      });
    }

    User.findById(req.userId, (err, user) => {
      if (err) {
        return res.status(500).end();
      }
      if(user.username === post.author) {
        req.post = post;
        next();
      } else {
        res.status(403).send({
          code: 403,
          message: 'not a valid login or token'
        });
      }


    });





  });


}

module.exports = verifyPostOwner;