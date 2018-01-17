const express = require('express');
const router = express.Router();
const cluster = require('cluster');
const verifyToken = require('../auth/verifyToken');
const verifyPostOwner = require('../auth/verifyPostOwner');


const User = require('../models/User');
const Post = require('../models/Post');

const logger = require('log4js').getLogger('app');


router.delete('/:username', verifyToken, function (req, res) {
  logger.info('delete user: ' + req.params.username);
    User.findByIdAndRemove(req.userId, (err, user) => {
        if (err) {
          logger.error(`Delete user: ${req.params.username} - error find by id and remove`, err);
          return res.status(500).send({code: 500, message: "There was a problem deleting the user."});
        }
        Post.remove({author: user.username}, (err, posts) => {
          if (err) {
            logger.error(`Delete user: ${req.params.username} - error posts remove`, err);
            return res.status(500).send({code: 500, message: "There was a problem deleting the user."});
          }
          res.status(200).send({
            code : 200,
            message: "User: "+ user.username +" and his posts was deleted."
          });
        });
    });
});

router.get('/:username/posts', (req, res) => {
  Post.find({ author: req.params.username }, '_id', (err, posts) => {
    if (err) {
      logger.error(`Delete user: ${req.params.username} - error user posts find`, err);
      return res.status(500).send({
        code: 500,
        message : "There was a problem read posts"
      });
    }
    res.status(200).send({
      code: 200,
      message: 'Success',
      posts
    })
  });
});





module.exports = router;