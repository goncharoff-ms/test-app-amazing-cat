/* eslint-disable no-underscore-dangle */
const express = require('express');

const mongoose = require('mongoose');

const router = express.Router();

const verifyToken = require('../auth/verifyToken');

const verifyPostOwner = require('../auth/verifyPostOwner');

const User = require('../models/User');

const Post = require('../models/Post');

const logger = require('../logger');

router.get('/:id', (req, res) => {
  Post.findById(req.params.id)
    .then((post) => {
      if (!post) {
        throw new Error('404');
      }
      res.status(200).send({
        code: 200,
        message: 'Success',
        post,
      });
    })
    .catch((error) => {
      logger.warn('Post in not available', req.params, error);
      res.status(404).send({
        code: 404,
        message: 'This post is not available.',
      });
    });
});

router.delete('/:id', verifyToken, verifyPostOwner, (req, res) => {
  Post.remove({ _id: req.post._id })
    .then((post) => {
      if (!post) {
        throw new Error();
      }
      res.status(200).send({
        code: 200,
        message: 'Success delete',
      });
    })
    .catch((error) => {
      logger.error('Post delete by Id error', { error, params: req.params });
      res.status(500).send({
        code: 500,
        message: 'There was a problem delete this post.',
      });
    });
});

router.put('/:id', verifyToken, verifyPostOwner, (req, res) => {
  req.post.title = req.body.title || req.post.title;
  req.post.content = req.body.content || req.post.content;
  req.post.lastEditDate = Date.now();

  req.post.save()
    .then(() => {
      res.status(200).send({
        code: 200,
        message: 'Success update post',
      });
    })
    .catch((error) => {
      logger.error('Post update by Id error', { error, params: req.params });
      return res.status(500).send({
        code: 500,
        message: 'There was a problem update posts',
      });
    });
});

router.post('/', verifyToken, (req, res) => {
  User.findById(req.userId)
    .then(user => Post.create({
      _id: mongoose.Types.ObjectId(),
      title: req.body.title,
      content: req.body.content,
      author: user._id,
    }))
    .then((post) => {
      res.status(200).send({
        code: 200,
        message: 'Success create post',
        post,
      });
    })
    .catch((error) => {
      logger.error('Post create new, find owner', { error, params: req.params });
      res.status(500).send({
        code: 500,
        message: 'There was a problem create new post.',
      });
    });
});


module.exports = router;
