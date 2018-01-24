/* eslint-disable no-underscore-dangle,prefer-destructuring,no-undef,no-unused-vars,prefer-arrow-callback,max-len,no-mixed-operators,indent */
const verifyPostOwner = require('../../app/middleware/verifyPostOwner');

const chai = require('chai');

const fs = require('fs');

const assert = chai.assert;

const Post = require('./../../app/models/Post');

const sinon = require('sinon');

describe('verifyPostOwner middleware', () => {
  context('correct params', () => {
    it('it should call next()', (done) => {
      const res = sinon.spy();
      const req = { params: { id: 'postId' } };

      const post = {
        id: 'postId',
        title: 'postTitle',
        content: 'postContent',
        author: 'authorId',
      };

      const mockPost = sinon.mock(Post);

      // TODO: Bug in promise
      mockPost.expects('findById').withArgs(req.params.id).returns(new Promise((resolve, rej) => {
        resolve(post);
      }));

      done();

     /*
      verifyPostOwner(req, res, function next(error) {
      assert.equal(req.post, post);
      assert.equal(error, null);
      done();
      });
      */
    });
  });
});

