const express = require('express');
const router = express.Router();

const verifyToken = require('../auth/verifyToken');
const verifyPostOwner = require('../auth/verifyPostOwner');

const PostController = require('./PostController');

const User = require('../models/User');
const Post = require('../models/Post');


router.get('/:id', (req, res) => {
  Post.findById(req.params.id, (err, post) => {
    if (err) {
      return res.status(500).send({
        code: 500,
        message : "There was a problem read posts"
      });
    }

    if(post) {
      res.status(200).send({
        code: 200,
        message: 'Success',
        post
      });
    } else {
      res.status(200).send({
        code: 200,
        message: 'This post is not available.',
        post
      });
    }

  });
});

router.put('/:id', verifyToken, verifyPostOwner, (req, res) => {
  req.post.title = req.body.title || req.post.title;
  req.post.content = req.body.content || req.post.content;
  req.post.lastEditDate = new Date();

  req.post.save((err, post) => {
    if (err) {
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
    Post.create({
      title: req.body.title,
      content: req.body.content,
      author: user.username,
      creationDate: new Date(),
      lastEditDate: null
    }, (err, post) => {
      if (err) {
        return res.status(500).send({
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

router.delete('/:id', verifyToken, verifyPostOwner, (req, res) => {
  Post.remove({_id: req.post._id}, (err, post) => {
    if (err) {
      return res.status(500).send({
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



module.exports = router;