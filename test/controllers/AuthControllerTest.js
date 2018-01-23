/* eslint-disable no-underscore-dangle */
const mongoose = require('mongoose');

const User = require('../../app/models/User');

const chai = require('chai');

const chaiHttp = require('chai-http');

const mocha = require('mocha');

const assert = chai.assert;

const should = chai.should();

const server = require('./../serverTest');

chai.use(chaiHttp);

function getNewUser(username = 'username', password = 'password') {
  const user = new User();
  user._id = new mongoose.Types.ObjectId();
  user.username = username;
  user.password = password;
  return user;
}


describe('AuthController', () => {
  beforeEach((done) => {
    User.remove({}, () => {
      done();
    });
  });

  after(function (done) {
    server.close();
    done();
  });


  describe('/POST registration', () => {
    it('it should create a new user', (done) => {
      chai.request(server)
        .post('/api/register')
        .send(getNewUser())
        .end((err, res) => {
          res.body.should.be.a('object');
          assert.equal(res.body.code, 200);
          assert.equal(res.body.auth, true);
          assert.isAbove(res.body.token.length, 20);
          done();
        });
    });


    it('it should not create a new user', (done) => {
      chai.request(server)
        .post('/api/register')
        .send({ username: '12123132132' })
        .end((err, res) => {
          res.body.should.be.a('object');
          assert.equal(res.body.code, 500);
          assert.equal(res.body.auth, false);
          done();
        });
    });
  });

  describe('/POST logout', () => {
    it('it should logout', (done) => {
      const user = getNewUser('username', 'password');
      user.validate()
        .then(() => User.hashPassword(user.password))
        .then((hashPassword) => {
          user.password = hashPassword;
          return user.save();
        })
        .then(() => {
          chai.request(server)
            .post('/api/login')
            .send({ username: user.username, password: 'password' })
            .end((error, response) => {
              const tokenUser = response.body.token;
              chai.request(server)
                .post('/api/logout')
                .set('x-access-token', tokenUser)
                .end((err, res) => {
                  assert.equal(res.body.code, 200);
                  assert.isNotEmpty(res.body.message);
                  done();
                });
            });
        });
    });

    it('it not should logout', (done) => {
      chai.request(server)
        .post('/api/logout')
        .end((err, res) => {
          res.should.have.status(403);
          assert.equal(res.body.code, 403);
          assert.equal(res.body.auth, false);
          res.body.should.have.property('message');
          done();
        });
    });
  });


  describe('/POST login', () => {
    it('it shoult login with correct parameters', (done) => {
      const user = getNewUser('newUser', 'useUser');
      user.validate()
        .then(() => User.hashPassword(user.password))
        .then((hashPassword) => {
          user.password = hashPassword;
          return user.save();
        })
        .then(() => {
          chai.request(server)
            .post('/api/login')
            .send({ username: user.username, password: 'useUser' })
            .end((err, res) => {
              res.should.have.status(200);
              res.body.should.be.a('object');
              assert.equal(res.body.code, 200);
              assert.equal(res.body.auth, true);
              assert.isAbove(res.body.token.length, 20);
              res.body.should.have.property('message');
              done();
            });
        });
    });

    it('it not should login (not corrected params)', (done) => {
      chai.request(server)
        .post('/api/login')
        .send({ username: 'username' })
        .end((err, res) => {
          res.should.have.status(403);
          res.body.should.be.a('object');
          assert.equal(res.body.code, 403);
          assert.equal(res.body.auth, false);
          res.body.should.have.property('message');
          done();
        });
    });
  });
});

