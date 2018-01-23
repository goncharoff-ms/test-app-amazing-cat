/* eslint-disable no-underscore-dangle,prefer-destructuring,no-undef,no-unused-vars,no-shadow,no-shadow */

const server = require('./../serverTest');

const mongoose = require('mongoose');

const User = require('../../app/models/User');

const Post = require('../../app/models/Post');

const chai = require('chai');

const chaiHttp = require('chai-http');

const mocha = require('mocha');

const assert = chai.assert;

const should = chai.should();

chai.use(chaiHttp);

const username = 'username';
const password = 'password';

const post = {
  title: 'title',
  content: 'content',
};

function saveNewUser(cb) {
  const user = new User();
  user._id = new mongoose.Types.ObjectId();
  user.username = username;
  user.password = password;
  user.validate()
    .then(() => User.hashPassword(user.password))
    .then((hashPassword) => {
      user.password = hashPassword;
      return user.save();
    })
    .then(() => {
      cb(user);
    });
}

describe('PostContoller', () => {
  beforeEach((done) => {
    User.remove({}, () => {
      Post.remove({}, () => {
        done();
      });
    });
  });

  after((done) => {
    server.close();
    done();
  });

  describe('/POST posts', () => {
    it('it should create new post', (done) => {
      saveNewUser((user) => {
        chai.request(server)
          .post('/api/login')
          .send({ username: user.username, password })
          .end((error, response) => {
            const tokenUser = response.body.token;
            chai.request(server)
              .post('/api/posts')
              .set('x-access-token', tokenUser)
              .send(post)
              .end((err, res) => {
                res.body.should.be.a('object');
                assert.isNotEmpty(res.body.message);
                assert.equal(res.body.code, 200);
                assert.equal(res.body.post.title, post.title);
                assert.equal(res.body.post.content, post.content);
                assert.equal(res.body.post.author, user._id);
                done();
              });
          });
      });
    });

    it('it not should create new posts (no token)', (done) => {
      chai.request(server)
        .post('/api/posts')
        .send(post)
        .end((err, res) => {
          res.body.should.be.a('object');
          assert.isNotEmpty(res.body.message);
          assert.equal(res.body.code, 403);
          done();
        });
    });
  });

  describe('/GET posts/:id', () => {
    it('it should get a post by id', (done) => {
      saveNewUser((user) => {
        chai.request(server)
          .post('/api/login')
          .send({ username: user.username, password })
          .end((error, response) => {
            const tokenUser = response.body.token;
            chai.request(server)
              .post('/api/posts')
              .set('x-access-token', tokenUser)
              .send(post)
              .end((err, res) => {
                chai.request(server)
                  .get(`/api/posts/${res.body.post._id}`)
                  .end((err, resp) => {
                    resp.body.should.be.a('object');
                    assert.isNotEmpty(resp.body.message);
                    assert.equal(resp.body.code, 200);
                    assert.equal(resp.body.post.title, post.title);
                    assert.equal(resp.body.post.content, post.content);
                    assert.equal(resp.body.post.author, user._id);
                    done();
                  });
              });
          });
      });
    });

    it('it not should get post by id (not correct  _id', (done) => {
      chai.request(server)
        .get(`/api/posts/${Math.random()}`)
        .end((err, res) => {
          res.body.should.be.a('object');
          assert.isNotEmpty(res.body.message);
          assert.equal(res.body.code, 404);
          done();
        });
    });
  });

  describe('/DELETE posts/:id', () => {
    it('it should delete post by id', (done) => {
      saveNewUser((user) => {
        Post.create({
          _id: mongoose.Types.ObjectId(),
          title: post.title,
          content: post.content,
          author: user._id,
        }).then((post) => {
          chai.request(server)
            .post('/api/login')
            .send({ username: user.username, password })
            .end((error, response) => {
              const tokenUser = response.body.token;
              chai.request(server)
                .del(`/api/posts/${post._id}`)
                .set('x-access-token', tokenUser)
                .end((err, res) => {
                  res.body.should.be.a('object');
                  assert.isNotEmpty(res.body.message);
                  assert.equal(res.body.code, 200);
                  done();
                });
            });
        });
      });
    });

    it('it not should del post', (done) => {
      const userId = 'userid';
      Post.create({
        _id: mongoose.Types.ObjectId(),
        title: post.title,
        content: post.content,
        author: mongoose.Types.ObjectId(),
      }).then((post) => {
        chai.request(server)
          .del(`/api/posts/${post._id}`)
          .set('x-access-token', 'not correct token')
          .end((err, res) => {
            res.body.should.be.a('object');
            assert.isNotEmpty(res.body.message);
            assert.equal(res.body.code, 500);
            done();
          });
      });
    });
  });

  describe('/PUT posts/:id', () => {
    it('it should update post by id', (done) => {
      const newTitle = 'newTitle';
      const newContent = 'newContent';
      saveNewUser((user) => {
        Post.create({
          _id: mongoose.Types.ObjectId(),
          title: post.title,
          content: post.content,
          author: user._id,
        }).then((post) => {
          chai.request(server)
            .post('/api/login')
            .send({ username: user.username, password })
            .end((error, response) => {
              const tokenUser = response.body.token;
              chai.request(server)
                .put(`/api/posts/${post._id}`)
                .set('x-access-token', tokenUser)
                .send({ title: newTitle, content: newContent })
                .end((err, res) => {
                  res.body.should.be.a('object');
                  assert.isNotEmpty(res.body.message);
                  assert.equal(res.body.code, 200);

                  Post.findById(post._id)
                    .then((newPost) => {
                      res.body.should.be.a('object');
                      assert.equal(res.body.code, 200);
                      assert.equal(newPost.title, newTitle);
                      assert.equal(newPost.content, newContent);
                      done();
                    });
                });
            });
        });
      });
    });
  });
});
