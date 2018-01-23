/* eslint-disable no-underscore-dangle */

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


function saveNewUserAndPosts(cb) {
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
      Post.create({
        _id: mongoose.Types.ObjectId(),
        title: `title ${Math.random()}`,
        content: `content ${Math.random()}`,
        author: user._id,
      }).then((post) => {
        cb(user, post);
      });
    });
}

describe('UserController', () => {
  beforeEach((done) => {
    User.remove({}, () => {
      Post.remove({}, () => {
        done();
      });
    });
  });

  after(function (done) {
    server.close();
    done();
  });

  describe('/GET users/:username/posts', () => {
    it('it should if the user exists and has posts', (done) => {
      saveNewUserAndPosts((user, post) => {
        chai.request(server)
          .get(`/api/users/${user.username}/posts`)
          .send()
          .end((err, res) => {
            res.body.should.be.a('object');
            assert.equal(res.body.posts[0]._id, post._id);
            assert.isNotEmpty(res.body.message);
            assert.equal(res.body.code, 200);
            done();
          });
      });
    });
    it('it not should show posts user (not exists user)', (done) => {
      chai.request(server)
        .get('/api/users/testsLogin/posts')
        .send()
        .end((err, res) => {
          res.body.should.be.a('object');
          assert.isNotEmpty(res.body.message);
          assert.equal(res.body.code, 500);
          done();
        });
    });
  });

  describe('/DELETE users/:username', () => {
    it('it should if all data are correct', (done) => {
      saveNewUserAndPosts((user) => {
        chai.request(server)
          .post('/api/login')
          .send({ username: user.username, password })
          .end((error, response) => {
            Post.find({ author: user._id })
              .then((posts) => {
                assert.equal(posts.length, 1);
              })
              .then(() => {
                const tokenUser = response.body.token;
                chai.request(server)
                  .del(`/api/users/${user.username}`)
                  .set('x-access-token', tokenUser)
                  .end((err, res) => {
                    res.body.should.be.a('object');
                    assert.isNotEmpty(res.body.message);
                    assert.equal(res.body.code, 200);
                    User.findById(user._id)
                      .then((newUser) => {
                        assert.isNull(newUser);
                        return Post.find({ author: user._id });
                      })
                      .then((posts) => {
                        assert.equal(posts.length, 0);
                        done();
                      });
                  });
              });
          });
      });
    });

    it('it not should delete all posts and user (no token)', (done) => {
      chai.request(server)
        .del(`/api/users/${username}`)
        .end((err, res) => {
          res.body.should.be.a('object');
          assert.isNotEmpty(res.body.message);
          assert.equal(res.body.code, 403);
          done();
        });
    });
  });
});
