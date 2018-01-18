const express = require('express');
const router = express.Router();


const verifyToken = require('../auth/verifyToken');
const verifyPostOwner = require('../auth/verifyPostOwner');
const PostController = require('./PostController');
const User = require('../models/User');
const Post = require('../models/Post');

const logger = require('log4js').getLogger('app');

router.get('/:id', (req, res) => {
  Post.findById(req.params.id, (err, post) => {
    if (err) {
      logger.warn('Post in not available', req.params, err);
       res.status(404).send({
        code: 404,
        message : 'This post is not available.',
      });
    }

    if(post) {
      res.status(200).send({
        code: 200,
        message: 'Success',
        post
      });
    } else {
      logger.warn('Post in not available', req.params);
      res.status(404).send({
        code: 404,
        message: 'This post is not available.'
      });
    }

  });
});

router.delete('/:id', verifyToken, verifyPostOwner, (req, res) => {
  Post.remove({_id: req.post._id}, (err, post) => {
    if (err) {
      logger.error('Post delete by Id error', {err, params: req.params});
       res.status(500).send({
        code: 500,
        message : "There was a problem delete this post."
      });
    }

    res.status(200).send({
      code: 200,
      message: 'Success delete'
    });
  });
});

router.put('/:id', verifyToken, verifyPostOwner, (req, res) => {
  req.post.title = req.body.title || req.post.title;
  req.post.content = req.body.content || req.post.content;
  req.post.lastEditDate = Date.now();

  req.post.save((err, post) => {
    if (err) {
      logger.error('Post update by Id error', {err, params: req.params});
      return res.status(500).send({
        code: 500,
        message : "There was a problem update posts"
      });
    }
    res.status(200).send({
      code: 200,
      message: 'Success',
      post: post
    });
  });
});

router.post('/', verifyToken, (req, res) => {
  User.findById(req.userId, (err, user) => {
    if (err) {
      logger.error('Post create new, find owner', {err, params: req.params});
      res.status(500).send({
        code: 500,
        message : "There was a problem create new post."
      });
    }
    Post.create({
      title: req.body.title,
      content: req.body.content,
      author: user.username,
      creationDate: Date.now() / 1000,
      lastEditDate: null
    }, (err, post) => {
      if (err) {
        logger.error('Post create new, save post', {err, params: req.params});
         res.status(500).send({
          code: 500,
          message : "There was a problem create new post."
        });
      }

      res.status(200).send({
        code: 200,
        message: 'Success',
        post: post
      });
    });
  });
});





module.exports = router;