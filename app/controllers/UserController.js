const express = require('express');
const router = express.Router();
const cluster = require('cluster');
const verifyToken = require('../auth/verifyToken');
const verifyPostOwner = require('../auth/verifyPostOwner');


const User = require('../models/User');
const Post = require('../models/Post');

const logger = require('log4js').getLogger('app');


router.delete('/:username', verifyToken,  (req, res) => {
  logger.info('delete user: ' + req.params.username);

  req.redis.set(req.token.hash, req.userId, (err, reply) => {
    logger.info(`new token in blacklist: ${req.token.hash}`)
  });
  req.redis.expire(req.token.hash, req.token.timeToDelete);

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
        message: `User ${user.username} deleted with his posts`
      });
    });
  });
});

router.get('/:username/posts', (req, res) => {
  Post.find({ author: req.params.username }, '_id', (err, posts) => {
    if (err) {
      logger.error(`Posts user: ${req.params.username} - error user posts find`, err);
      return res.status(500).send({
        code: 500,
        message : "There was a problem read posts"
      });
    }

    if(posts.length > 0) {
      res.status(200).send({
        code: 200,
        message: 'Success',
        posts
      });
    } else {
      res.status(404).send({
        code: 404,
        message: 'This user has no posts.'
      })
    }

  });
});





module.exports = router;